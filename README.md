# Dockit-Task

This is a full-stack web application built with **NestJS** for the backend and **Next.js** for the frontend. It uses **MongoDB Atlas** for cloud-based data storage and implements cookie based JWT authentication.

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- MongoDB Atlas account

### Backend Setup (NestJS)

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file inside the `backend` folder and add:

```env
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_APP_URL=frontend_url
PORT=4000
```

4. Start the backend server:

```bash
nest start
```

> Runs at `http://localhost:4000`

---

### Frontend Setup (Next.js)

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file inside the `frontend` folder and add:

```env
NEXT_PUBLIC_API_URL=backend_url
JWT_COOKIE_NAME=jwt
```

4. Start the frontend server:

```bash
npm run dev
```

> Runs at `http://localhost:3000`

---

## 🌐 Connect to MongoDB Atlas

1. Create a free cluster at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Add your IP address to the network access list
3. Create a database user with a username and password
4. Replace the `MONGODB_URI` in `backend/.env` with your connection string

---

## Screenshots

Screenshots of the application are available in the `assets/` folder.

---

## 📌 Notes

- Ensure your `.env` files are properly set before running the servers.
- For testing, use different browsers.
- If using different ports, update the environment variables accordingly.

---

## Repository

GitHub: [https://github.com/tfHasi/Dockit](https://github.com/tfHasi/Dockit)

