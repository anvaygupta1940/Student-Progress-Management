# ##################🎓 Student Progress Management System – Frontend

This is the frontend for the Student Progress Management System. It provides a user-friendly interface for managing students, viewing analytics, syncing Codeforces data, and exporting progress reports.


✨ Features
✅ View all students in a dashboard
✅ Add, edit, and delete student records
✅ Sync and show Codeforces data (ratings, contests, problems)
✅ Export data as CSV
✅ View individual student analytics
✅ Bar charts, line graphs, heatmap
✅ Dark/Light mode toggle
✅ Responsive design (mobile + tablet)


🧠 How It Works (Simple Flow)
# The dashboard fetches student data from the backend API and displays it in a table.
# Admin can add or update students through forms.
# Clicking “View Details” shows in-depth analytics (contest + problem stats).
# Backend syncs Codeforces data automatically and frontend shows it with charts.
# Student data can be downloaded as a .csv file for reports.


🧠 Folder Structure Explained
bash
Copy
Edit
src/
├── components/            # Reusable components
│   ├── charts/            # Chart components (BarChart, LineGraph, Heatmap)
│   ├── ConfirmDialog.jsx  # Reusable delete confirmation dialog
│   ├── Layout.jsx         # Page layout (navbar, theme switch)
│   ├── LoadingSpinner.jsx # Loading spinner for async operations
│   ├── StudentForm.jsx    # Form for adding/editing student
│   └── StudentTable.jsx   # Main student list table
│
├── contexts/
│   └── ThemeContext.js    # Handles light/dark mode toggle
│
├── pages/                 # Actual pages (routed in App.js)
│   ├── Dashboard.jsx      # Shows list of all students
│   ├── Settings.jsx       # Cron job and theme toggle (optional settings)
│   └── StudentDetail.jsx  # Detailed view for individual student
│
├── services/
│   └── api.js             # Axios functions to call backend APIs
│
├── utils/
│   ├── constants.js       # Reusable constant values
│   └── helpers.js         # Utility functions like formatting dates
│
├── App.css                # Tailwind & global CSS
├── App.js                 # Main App file with routes



🧑‍💻 Tech Stack Used
# Library	                                Purpose
# React 19	                                UI framework
# Axios	                                    To call backend API
# React Router v7	                        For page navigation
# Tailwind CSS	                            Styling and responsive layout
# Chart.js + React-Chartjs-2	            Graphs and visualizations
# Date-fns	                                Formatting dates
# React Hot Toast	                        Showing success/error alerts
# Lucide React	                            Icons for UI

# **************Start the frontend****************
# npm start
