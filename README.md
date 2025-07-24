# 📊 HRMDev – Human Resource Management for Developers

DevTeam HRM is a lightweight web-based dashboard for managing developer availability, attendance, and performance. It supports weekly submissions, check-in/out functionality, and visual analytics using charts. Built with HTML, CSS, JS (vanilla), SQLite, and Node.js/Express.

---

## 🚀 Features

- 👥 **User Management:** Add users with roles and emails.
- 📅 **Availability Tracking:** Submit weekly and bulk availability.
- ⏰ **Attendance Logging:** Check-in and check-out with time tracking.
- 📈 **Performance Analysis:** Visual feedback on compliance and variance.
- 🔒 **Authentication:** Simple signup and login with SHA-256 hashed passwords.
- 🧾 **SQLite Database:** Persistent local storage for settings, availability, and attendance.

---

## 🛠️ Tech Stack

| Frontend   | Backend     | Database | Charts    |
|------------|-------------|----------|-----------|
| HTML5      | Express.js  | SQLite   | Chart.js  |
| CSS3       | Node.js     |          |           |

---

## 📁 Folder Structure

```
├── index.html         # Main frontend HTML UI
├── style.css          # Styling with semantic variables & theme support
├── app.js             # Frontend JS logic, dashboard UI, and chart rendering
├── server.js          # Express server with API endpoints
├── hrm-data.sqlite    # SQLite database file
```

---

## 📦 Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd devteam-hrm
```

### 2. Install dependencies

```bash
npm install express sqlite3 cors body-parser
```

### 3. Run the server

```bash
node server.js
```

Server runs on: `http://localhost:5500`

---

## 🖼️ Screenshots

| Dashboard | Availability | Attendance | Performance |
|-----------|--------------|------------|-------------|
|<img width="1208" height="1678" alt="Dashboard" src="https://github.com/user-attachments/assets/f8edf9f7-658e-4a16-853c-ee6c7d4fe3b1" /> | <img width="1208" height="1183" alt="Availability" src="https://github.com/user-attachments/assets/abd7005b-4b52-4e2d-b228-1381baade758" /> | <img width="1208" height="1400" alt="Attendance" src="https://github.com/user-attachments/assets/2a7a09d5-272a-4c10-9d51-ae70f85ddfcf" /> | <img width="1226" height="869" alt="Performance" src="https://github.com/user-attachments/assets/870c30d9-a13d-451c-b8d6-6fa74c7105ba" /> |

---

## 📌 Notes

- Ensure `hrm-data.sqlite` is in the same directory as `server.js`.
- The app uses `Chart.js` via CDN. No additional chart library setup is needed.
- User data is stored locally (no external authentication system integrated).
