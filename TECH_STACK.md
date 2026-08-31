# 🚀 Feedback Module - Tech Stack & Purpose Documentation

Comprehensive architectural breakdown of the technologies used in the **Feedback Module** for the **Hostel and Resource Management System**.

---

## 🏗️ System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Client)                             │
│     React.js + Vite + Tailwind CSS + Lucide Icons + Sonner + Axios      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST API (JWT Bearer Token)
┌───────────────────────────────────▼────────────────────────────────────┐
│                           BACKEND (Server)                             │
│       Node.js + Express.js + JWT Auth + bcryptjs + Multer Uploads      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Mongoose ODM
┌───────────────────────────────────▼────────────────────────────────────┐
│                           DATABASE (Data)                              │
│                      MongoDB / MongoDB Atlas                           │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ 1. Database Layer

| Technology | Role / Purpose in Project |
| :--- | :--- |
| **MongoDB** | **NoSQL Database** used to store structured data like Users, Student profiles, and Feedback tickets securely as JSON-like documents (`collections`). |
| **Mongoose** | **Object Data Modeling (ODM) library** for MongoDB & Node.js. Used to define strict schemas (`User.js`, `Feedback.js`, `student.js`), handle model references (`ref: 'Student'`), data validation, and query operations. |
| **MongoMemoryServer** | **Zero-Config Developer Fallback**. Automatically launches an in-memory MongoDB database inside Node.js if local MongoDB is offline, allowing instant local testing without manual database installation. |

---

## ⚙️ 2. Backend Server Layer

| Technology | Role / Purpose in Project |
| :--- | :--- |
| **Node.js** | **JavaScript Runtime Environment** that runs our backend server code outside the browser. |
| **Express.js** | **Web Application Framework for Node.js**. Handles REST API routing (`/api/auth`, `/api/feedback`), middleware pipeline execution, CORS policies, static file serving (`/uploads`), and HTTP request/response processing. |

---

## 🔒 3. Authentication & Security Layer

| Technology | Role / Purpose in Project |
| :--- | :--- |
| **JSON Web Token (JWT)** | **Stateless Authentication Standard**. Generates a signed, encrypted token upon login containing the user's verified role (`Student` or `Admin`). Sent with API headers (`Authorization: Bearer <token>`) to protect private endpoints. |
| **bcryptjs** | **Password Hashing Library**. Securely hashes user passwords using salt rounds before storing them in MongoDB, ensuring passwords are never stored in plain text. |
| **Custom Auth Middleware** (`authMiddleware.js`) | Enforces role-based permissions (`protect` & `authorize`). Restricts endpoints like `POST /api/feedback` and `GET /api/feedback/my` to Students, while guarding `/api/feedback` and `/api/feedback/stats` for Admin/Warden access only. |

---

## 📁 4. Media & File Upload Layer

| Technology | Role / Purpose in Project |
| :--- | :--- |
| **Multer** | **Node.js Middleware for Multipart Form Data**. Handles uploading facility issue photos (e.g. broken room plumbing, maintenance photos) to `backend/uploads/` with file type and size restrictions (5MB limit). |

---

## 🛡️ Key Backend API Highlights

1. **Student Data Isolation**: Students use `GET /api/feedback/my`. The backend extracts student identity directly from `req.user.student` inside the verified JWT token so students can **only** query their own submitted tickets.
2. **Anonymous Feedback Privacy**: Setting `isAnonymous: true` masks personal student identity details (Name, Roll No, Room No) in the Warden/Admin UI while preserving internal DB tracking so the student can still track resolution progress under *My Submissions*.
3. **Restricted Public Registration**: `POST /api/auth/register` strictly creates **Student accounts only**. Warden/Admin accounts are created via secure backend seeding or authorized admins.
