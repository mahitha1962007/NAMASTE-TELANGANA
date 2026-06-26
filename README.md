Here is the full text and documentation for your project README:

# Namaste Telangana - Editorial Content Calendar & Publication Planner

A comprehensive, full-stack Editorial Content Calendar & Publication Planner designed for **Namaste Telangana**. This application enables newsrooms to streamline their content lifecycle, from story assignment and media coordination to editing, review, scheduling, and publication analytics.

Featuring a modern React-based dashboard, full-fledged drag-and-drop calendar view, task notes collaboration, audit logs, and a flexible backend that can run in either standard **MySQL database mode** or **in-memory mock mode** (for instant demonstration).

---

## 🚀 Key Features

*   **Multi-Role User Hierarchy**: Role-based access control supporting `admin`, `editor`, `reporter`, `photographer`, `interviewer`, `video_editor`, `social_media_manager`, and `publication_manager`.
*   **Assignments Management**: Create, assign, edit, and track stories/tasks with categories, content types, priorities (`Low`, `Medium`, `High`), and statuses (`Assigned`, `In Progress`, `Completed`, `Delayed`, `Archived`).
*   **Collaborative Team Assignments**: Multiple staff members can be assigned to a single story, each with their specific roles in the task.
*   **Interactive Calendar View**: Comprehensive scheduling with monthly, weekly, daily, and list views using **FullCalendar**, mapped directly to draft deadlines, interviews, photo shoots, and publication dates.
*   **Notifications System**: Instantly alert team members of new assignments, deadline shifts, and updates.
*   **Task Notes**: Collaborative message thread on each assignment for reporters, photographers, and editors to exchange updates and notes.
*   **Analytics & Reports**: Visual charts (using **Recharts**) showcasing story distribution by category, publication efficiency, user productivity, and status summaries.
*   **Audit Logs**: Complete traceability logs detailing what changed, who changed it, and when.
*   **Seamless Start System**: Run the entire stack locally with a single script, supporting automatic dependency installation and environment setup.

---

## 🛠️ Technology Stack

### Frontend
*   **Framework**: React (v18) with Vite
*   **Styling**: Tailwind CSS
*   **Routing**: React Router DOM (v6)
*   **Visualizations**: Recharts
*   **Calendar**: FullCalendar (DayGrid, TimeGrid, List, Interaction plugins)
*   **Animations**: Framer Motion
*   **Icons**: Lucide React
*   **Notifications**: React Hot Toast

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express
*   **Database Client**: MySQL2 (with connection pooling)
*   **Security**: Helmet, bcryptjs, CORS
*   **Authentication**: JSON Web Tokens (JWT)
*   **Validation**: Express Validator

---

## 📁 Project Structure

```
editorial-content-planner/
├── backend/                  # Node.js + Express API Backend
│   ├── config/               # Database and configuration files
│   ├── controllers/          # API endpoint logic handlers
│   ├── middleware/           # Auth, error, and validation middlewares
│   ├── migrations/           # Database migration and seed scripts
│   ├── routes/               # Express API routing definitions
│   ├── utils/                # Helper utilities and mock database store
│   ├── server.js             # Backend server entry point
│   └── .env.example          # Template for backend env variables
│
├── database/                 # Relational Database SQL Files
│   ├── schema.sql            # Main database schema definitions
│   └── seed.sql              # Mock/production database seeding data
│
├── frontend/                 # React + Vite Frontend SPA
│   ├── src/
│   │   ├── components/       # Reusable UI component libraries
│   │   ├── pages/            # Page layouts and application views
│   │   ├── App.jsx           # Main routing and navigation layout
│   │   └── main.jsx          # React app entry point
│   ├── .env.example          # Template for frontend env variables
│   └── tailwind.config.js    # Tailwind configuration
│
└── run.bat                   # Windows batch runner to launch the project
```

---

## ⚙️ Setup & Installation

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [MySQL Server](https://dev.mysql.com/downloads/installer/) (optional, only required for Database Mode)

### Step 1: Clone the Repository
```bash
git clone <your-repository-url>
cd editorial-content-planner
```

### Step 2: Environment Configuration
Create environment files in both the frontend and backend subdirectories.

#### Backend Configuration
Copy [backend/.env.example](file:///c:/Users/MITESH/NIAT/projects/namaste_telangana/editorial-content-planner/backend/.env.example) to `backend/.env` and configure your settings:
```bash
cp backend/.env.example backend/.env
```
Inside `backend/.env`:
*   `PORT=5000` (Backend Port)
*   `MOCK_MODE=true` (Set to `true` to run instantly without MySQL. Set to `false` to connect to a real MySQL database.)
*   Configure `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME` if running in database mode.
*   `JWT_SECRET` (Use a strong secret key for token signing.)

#### Frontend Configuration
Copy [frontend/.env.example](file:///c:/Users/MITESH/NIAT/projects/namaste_telangana/editorial-content-planner/frontend/.env.example) to `frontend/.env`:
```bash
cp frontend/.env.example frontend/.env
```
Inside `frontend/.env`:
*   `VITE_API_BASE_URL=http://localhost:5000/api`
*   `VITE_APP_NAME="Editorial Content Planner"`

---

## 🏃 Running the Application

### Option A: The Easy Way (Windows Setup)
If you are on Windows, simply double-click or run the batch script at the root:
```cmd
run.bat
```
This script will:
1. Check that backend and frontend directories exist.
2. Automatically run `npm install` in both folders if `node_modules` are missing.
3. Launch the Backend API server on `http://localhost:5000`.
4. Launch the Frontend Vite app on `http://localhost:5173`.

---

### Option B: Manual Setup

#### 1. Start the Backend API
```bash
cd backend
npm install
npm run dev
```
If `MOCK_MODE=false` in your `.env` file, the backend will automatically connect to MySQL and run database migrations from [database/schema.sql](file:///c:/Users/MITESH/NIAT/projects/namaste_telangana/editorial-content-planner/database/schema.sql) on launch (seeding default credentials if the database is empty).

#### 2. Start the Frontend App
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🔑 Default Login Credentials

The application comes pre-loaded with sample accounts for easy testing, whether you are running in **Mock Mode** or **Database Mode** (which seeds these accounts if the `users` table is empty).

| Role | Email | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `Admin@123` |
| **Reporter** | `reporter@example.com` | `Staff@123` |
| **Photographer** | `photographer@example.com` | `Staff@123` |
| **Editor** | `editor@example.com` | `Staff@123` |
| **Interviewer** | `interviewer@example.com` | `Staff@123` |

---

## 📝 License
This project is licensed under the ISC License. See the package description files for details.
