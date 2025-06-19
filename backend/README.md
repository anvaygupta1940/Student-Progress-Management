# ############### 🎓 Student Progress Management System – Backend

This is the backend of the Student Progress Management System built with **Node.js**, **Express**, and **MongoDB**. It manages student records, fetches data from Codeforces, sends inactivity emails, and provides APIs for the frontend to visualize student progress.

---

## 📚 Key Features

✅ **Student Management**

* Get all students
* Get student by ID
* Create new student
* Update student
* Delete student (soft delete using `isActive`)

📊 **Student Analytics**

* Get detailed student analytics including contest history, problem stats, graphs, and summaries

📤 **Export as CSV**

* Download complete student dataset as a `.csv` file

🔄 **Codeforces Data Sync**

* Automatically fetch and update student data from [Codeforces](https://codeforces.com/api) every day at **2:00 AM**
* Sync happens in the background when a new student is added or when their handle is updated

📧 **Inactivity Email Reminder**

* Detect students inactive for the past 7 days and send them reminder emails
* Count how many emails have been sent
* Option to disable reminders for specific students

🛠️ **Custom Cron Schedule**

* View current cron job time
* Update cron schedule using API (e.g., sync every 6 hours or weekly)

---

## 🧠 How It Works (Simple Workflow)

1. Admin adds a student by filling a form with name, email, phone, and Codeforces handle.
2. Backend fetches the student’s contest and problem-solving history from Codeforces.
3. Every day at **2 AM**, backend auto-syncs all active students' data.
4. If a student has not submitted problems in **last 7 days**, a reminder email is sent.
5. All data is stored in MongoDB and is used to show stats and graphs on the frontend.

---

## 📁 Folder Structure

```
backend/
│
├── controllers/        # Functions for API logic (create, fetch, export, etc.)
├── models/             # MongoDB schemas (Student, ContestHistory, ProblemStats)
├── routes/             # All API endpoints grouped by purpose
├── services/           # Codeforces sync logic, email reminders
├── index.js            # App entry point
├── .env                # Configuration file (not committed)
└── README.md           # You are here
```

---

## 🔌 API Endpoints Summary

| Method | Endpoint                 | Description                                 
| ------ | ------------------------ | ------------------------------------------- 
| GET    | `/api/students/`          | Get all active students                     
| GET    | `/api/students/:id`      | Get student by ID                           
| POST   | `/api/students/`          | Add a new student                           
| PUT    | `/api/students/:id`      | Update a student                            
| DELETE | `/api/students/:id`      | Delete a student                            
| GET    | `/api/students/export/csv`   | Export all student data as CSV              
| POST   | `/api/sync/all`           | sync all active students codefoces data                 
| POST   | `/api/sync/cf/:handle`   | Manually sync Codeforces data for a student 
| GET   | `/api/sync/status/:id`   | get sync status for a student 
| GET    | `/api/cron/schedule`              | Get current cron job schedule               
| POST   | `/api/cron/update`       | Update cron schedule                        

---


```
# SAMPLE ENV FILE :-

# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string_here

# Email Configuration
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

# Codeforces API
CODEFORCES_API_BASE=https://codeforces.com/api

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

```

### ▶️ Start the backend server

```bash
npm run dev
```

Server will start on: `http://localhost:5000`

---

## 📌 Technologies Used

* **Node.js + Express** – Web server & APIs
* **MongoDB + Mongoose** – Database and schema modeling
* **Nodemailer** – Sending reminder emails
* **node-cron** – Running scheduled tasks
* **Axios** – Making API calls to Codeforces

---

## ✅ Completed Features

* [x] Create, update, delete student records
* [x] Get student by ID or fetch all students
* [x] Fetch Codeforces data automatically
* [x] Export students as CSV
* [x] Analytics view (contests, problems, rating trends)
* [x] Inactivity detection & reminder email system
* [x] Custom cron job schedule
* [x] Well-structured API endpoints

---
