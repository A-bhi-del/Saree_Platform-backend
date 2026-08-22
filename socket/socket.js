import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("register", ({ userId, role }) => {
            if (!userId) return;

            socket.join(`user:${userId}`);

            if (role === "customer") {
                socket.join("customers");
            }

            console.log(
                `User ${userId} joined`
            );
        });

        socket.on("disconnect", () => {
            console.log(
                "Socket disconnected:",
                socket.id
            );
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error(
            "Socket.IO is not initialized"
        );
    }

    return io;
};