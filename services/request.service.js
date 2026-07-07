import Request from "../models/Request.js";
import { getPagination } from "../utils/pagination.js";
import * as notificationService from "./notification.service.js";

export const createRequest = async (requestData, customerId) => {
    const existingRequest = await Request.findOne({
        customer: customerId,
        admin: requestData.admin,
        designName: requestData.designName,
        status: "pending",
    });

    if (existingRequest) {
        throw new Error("You already have a pending request for this design.");
    }

    const request = await Request.create({
        ...requestData,
        customer: customerId,
    });

    await notificationService.createNotification({
        sender: customerId,
        receiver: request.admin,

        type: "request",

        title: "New Request",

        message: `${request.designName} request received.`,

        route: "/admin/requests",

        data: {
            requestId: request._id,
            designName: request.designName,
        },
    });

    return request;
};

export const getRequests = async (user, page, limit) => {
    const { skip, page: currentPage, limit: perPage } =
        getPagination(page, limit);

    const filter =
        user.role === "admin"
            ? {
                admin: user._id,
                adminDeleted: false,
            }
            : {
                customer: user._id,
                customerDeleted: false,
            };

    const populateField =
        user.role === "admin"
            ? "customer"
            : "admin";

    const [requests, total] = await Promise.all([
        Request.find(filter)
            .populate(populateField, "name email profileImage")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(perPage),

        Request.countDocuments(filter),
    ]);

    return {
        requests,
        pagination: {
            page: currentPage,
            limit: perPage,
            total,
            totalPages: Math.ceil(total / perPage),
        },
    };
};

export const updateRequestStatus = async (
    requestId,
    adminId,
    status
) => {
    const request = await Request.findById(requestId);
    if (!request) {
        throw new Error("Request not found");
    }

    if (request.admin.toString() !== adminId.toString()) {
        throw new Error("You are not authorized");
    }

    if (request.status !== "pending") {
        throw new Error("Request has already been processed");
    }

    request.status = status;

    await request.save();

    await notificationService.createNotification({
        sender: adminId,
        
        receiver: request.customer,

        type:
            status === "accepted"
                ? "request-accepted"
                : "request-rejected",

        title:
            status === "accepted"
                ? "Request Accepted"
                : "Request Rejected",

        message:
            status === "accepted"
                ? `${request.designName} request has been accepted.`
                : `${request.designName} request has been rejected.`,

        route: "/request",

        data: {
            requestId: request._id,
            designName: request.designName,
        },
    });

    return request;
};

export const deleteCustomerRequest = async (
    requestId,
    customerId
) => {
    const request = await Request.findById(requestId);

    if (!request) {
        throw new Error("Request not found");
    }

    if (request.customer.toString() !== customerId.toString()) {
        throw new Error("Unauthorized");
    }

    request.customerDeleted = true;

    if (request.customerDeleted && request.adminDeleted) {
        await Request.findByIdAndDelete(request._id);
    } else {
        await request.save();
    }

    return;
};

export const deleteAdminRequest = async (
    requestId,
    adminId
) => {
    const request = await Request.findById(requestId);

    if (!request) {
        throw new Error("Request not found");
    }

    if (request.admin.toString() !== adminId.toString()) {
        throw new Error("Unauthorized");
    }

    request.adminDeleted = true;

    if (request.customerDeleted && request.adminDeleted) {
        await Request.findByIdAndDelete(request._id);
    } else {
        await request.save();
    }

    return;
};