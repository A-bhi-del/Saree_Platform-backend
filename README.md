# Saree Platform 🧵

A full-stack MERN e-commerce platform connecting **shopkeepers (admins)** and **customers**, built for browsing, requesting, purchasing, and managing sarees online — complete with real-time notifications, secure payments, and a follower system between customers and shops.

---

## 🚀 Tech Stack

- **MongoDB** – Database
- **Express.js** – Backend framework
- **React.js** – Frontend
- **Node.js** – Runtime
- **Socket.IO** – Real-time communication (notifications)

### Tools & Services
- **Cloudinary** – Image storage & management
- **Razorpay** – Payment gateway integration
- **Nodemailer** – Email service (OTP, notifications)
- **Cron Jobs** – Scheduled/background tasks
- **Context API** – Global state management (avoids prop drilling)
- **Rate Limiting** – API abuse prevention

---

## ✨ Features

- 🔐 **Authentication** – OTP-based email verification, secure login/logout
- 🛍️ **Saree Management** – Create, update, delete, and browse sarees with related-saree suggestions
- 📩 **Request System** – Customers can request specific sarees from shopkeepers
- 💰 **Sale System** – Admins can list and manage sarees on sale
- ⭐ **Favourites** – Customers can save favourite admins/shops
- 🛒 **Cart System** – Add, update, remove, and validate cart items
- 📦 **Order System** – Full order lifecycle with status updates
- 💳 **Payment System** – Razorpay-integrated secure checkout
- 🔔 **Real-Time Notifications** – Powered by Socket.IO
- 👥 **Follower–Following System** – Customers can follow/unfollow shops (admins)
- 🧑‍💼 **Admin & Customer Dashboards** – Separate dashboards with relevant controls and analytics
- 🔍 **Search & Filters** – Text search with MongoDB indexing, plus price/fabric/color filters on saree listing
- 🛡️ **Rate Limiting** – Extra-strict limits on payment and OTP endpoints to prevent abuse

---

## 📡 API Overview

### Auth
| Method | Endpoint |
|--------|----------|
| POST | `/send-otp` |
| POST | `/verify-otp` |
| POST | `/register` |
| POST | `/login` |
| POST | `/logout` |

### User & Profile
| Method | Endpoint |
|--------|----------|
| GET | `/me` |
| PATCH | `/edit-profile` |

### Sarees
| Method | Endpoint |
|--------|----------|
| GET | `/getAllSarees` |
| GET | `/getSareeByID` |
| GET | `/getAllRelatedSarees_to_one_saree` |
| POST | `/createSaree` |
| PUT | `/updateSaree` |
| DEL | `/deleteSaree` |

### Requests
| Method | Endpoint |
|--------|----------|
| GET | `/getRequest` |
| POST | `/createRequest` |
| DEL | `/deleteRequest-customer` |

### Sales
| Method | Endpoint |
|--------|----------|
| GET | `/getSales` |
| POST | `/createSale` |
| PATCH | `/updateSaleDetails` |
| DEL | `/deleteSale` |

### Cart
| Method | Endpoint |
|--------|----------|
| GET | `/getCartItems` |
| GET | `/cartQuantityCount` |
| GET | `/ValidateCartItems` |
| POST | `/AddToCart` |
| PATCH | `/updateCart` |
| DEL | `/removeCartItem` |
| DEL | `/clearCart` |

### Orders & Payments
| Method | Endpoint |
|--------|----------|
| POST | `/createOrder` |
| POST | `/paymentOrder` |
| PATCH | `/updateStatusByAdmin` |

### Followers
| Method | Endpoint |
|--------|----------|
| GET | `/getFollowers` |
| GET | `/getFollowings` |
| GET | `/Already_follow_check` |
| GET | `/getFavoriteAdmins` |
| POST | `/Follow_Admin` |
| DEL | `/unFollow_admin` |

### Admin & Notifications
| Method | Endpoint |
|--------|----------|
| GET | `/getAdmins` |
| GET | `/getNotifications` |
| GET | `/DashBoard API` |

---

## 🛠️ Roadmap / In Progress

- [ ] Coupon system (create, apply, validate, expiry & usage limits)
- [ ] Complete payment system (verification, webhooks, refunds)
- [ ] Review & rating system (verified-purchase only)
- [ ] Testing (unit + integration)
- [ ] Order status tracking/timeline
- [ ] Inventory/stock management
- [ ] Return/exchange request system
- [ ] Final polish & UI/UX finishing touches

---

## 📂 Project Structure

```
saree-platform/
├── client/          # React frontend
├── server/          # Express backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middlewares/
│   └── utils/
└── README.md
```

---

## ⚙️ Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/saree-platform-backend.git

# Install server dependencies
cd backend
npm install

# Install client dependencies
cd saree-hub
npm install

# Set up environment variables (.env)
# MongoDB URI, Cloudinary keys, Razorpay keys, Nodemailer credentials, JWT secret, etc.

# Run backend
cd backend
npm run dev

# Run frontend
cd saree-hub
npm start
```

---

## 👤 Author

**Abhishek**
B.Tech CSE, IIIT Una

---

## 📄 License

This project is currently unlicensed. Add a `LICENSE` file if you plan to open-source it.
