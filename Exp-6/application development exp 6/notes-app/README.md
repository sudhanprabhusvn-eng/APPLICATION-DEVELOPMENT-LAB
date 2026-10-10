# EX.NO: 06 — Notes Taking Application with MongoDB

## Aim
To develop a full-stack Notes Taking web application using **MongoDB** as a database backend with Node.js and Express.

---

## Architecture & Tech Stack
- **Database**: MongoDB (Local `mongodb://127.0.0.1:27017/notesdb` or MongoDB Atlas)
- **ODM**: Mongoose 8.x
- **Backend**: Node.js & Express.js
- **Frontend**: Responsive modern web UI (HTML5, Vanilla CSS3, Modern JavaScript Fetch API)
- **Port**: `http://localhost:3000`

---

## Procedure Checklist & Verification

| # | Step | Requirement | Implementation Status |
|---|------|-------------|-----------------------|
| 1 | **Setup MongoDB Database** | Configure MongoDB locally or Atlas, create `notesdb` database | ✅ Verified (MongoDB service running on port 27017) |
| 2 | **Setup Backend Server** | Node.js + Express.js project with `dotenv`, `express`, `mongoose` | ✅ Verified (`package.json`, `server.js`) |
| 3 | **Note Schema & Model** | Define schema with `title`, `content`, `createdAt`, `updatedAt` | ✅ Verified (`models/Note.js`) |
| 4 | **CRUD API Endpoints** | Create, Read (all + by ID + search), Update, Delete | ✅ Verified (`server.js`) |
| 5 | **Connect Backend to MongoDB** | Mongoose connection with error handling & health check | ✅ Verified (`mongoose.connect(MONGO_URI)`) |
| 6 | **Test API Endpoints** | Verify data operations with Postman / automated tests | ✅ Verified (All 5 CRUD operations confirmed) |
| 7 | **Build Frontend Application** | Components for viewing, creating, searching, editing notes | ✅ Verified (`public/index.html`, `public/style.css`) |
| 8 | **Connect Frontend to Backend** | Fetch API requests to backend endpoints | ✅ Verified (`public/app.js`) |
| 9 | **Test and Debug** | End-to-end testing with toast feedback & status badge | ✅ Verified (`/api/health`, dynamic indicators) |
| 10 | **Deployment / Localhost** | Run on `http://localhost:3000` | ✅ Running active on localhost |

---

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Check backend & MongoDB connection state |
| `GET` | `/api/notes` | Get all notes (optional `?q=keyword` search query) |
| `GET` | `/api/notes/:id` | Get a single note by MongoDB `_id` |
| `POST` | `/api/notes` | Create a new note (`{ title, content, category, color }`) |
| `PUT` | `/api/notes/:id` | Update note by `_id` |
| `DELETE` | `/api/notes/:id` | Delete note by `_id` |

---

## How to Run Locally

1. **Start MongoDB**:
   ```bash
   # Ensure MongoDB service is running (runs on default port 27017)
   Get-Service MongoDB
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Application Server**:
   ```bash
   npm start
   # or with auto-reload:
   npm run dev
   ```

4. **Access the Application**:
   Open [http://localhost:3000](http://localhost:3000) in your web browser.
