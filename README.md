# Hostel & Resource Management System

A MERN-style hostel operations application with a Node/Express/MongoDB API and a responsive React dashboard for administrators and residents.

## Technology

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React, Vite, React Router, Axios

## Setup

### Backend

```powershell
cd backend
npm install
npm start
```

The API runs at `http://localhost:5000`. It uses `MONGO_URI` when provided and otherwise connects to `mongodb://127.0.0.1:27017/hostel_db`.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The Vite app runs at `http://localhost:5173`. Copy `frontend/.env.example` to `frontend/.env` to override `VITE_API_BASE_URL`.

## API Overview

- `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- CRUD `/api/students`
- CRUD `/api/rooms`
- CRUD `/api/allocations`
- CRUD `/api/feedback`

Authenticated requests use `Authorization: Bearer <token>`. Public registration creates Student accounts; Admin accounts must be provisioned by the backend. Allocation creation and vacation use the existing backend validation and occupancy logic.

## Frontend Features

- Role-aware login and protected routes for Student and Admin users
- Admin overview with real student, room, capacity, occupancy, and allocation statistics
- Student profile, current allocation, room details, and active roommates from live API data
- Searchable student directory and room availability cards
- Room-centric allocation workflow that disables full rooms and prevents duplicate active assignments
- Allocation vacation workflow, feedback, loading states, empty states, and API error messages

## Allocation Workflow

An administrator selects a student, reviews their current allocation status, chooses a room with available capacity, and submits `POST /api/allocations` with `studentId`, `roomId`, and `allocatedDate`. Vacating sends `PUT /api/allocations/:id` with `status: "Vacated"`; the backend updates room occupancy and status.