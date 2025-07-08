# BUETK Academic Portal

A full-featured academic management system for BUETK faculty and students, developed using the MERN stack (MongoDB, Express.js, Node.js, HTML/CSS/JavaScript). The portal supports faculty features like attendance marking, assignment uploads, lecture sharing, grading, and schedule management. Students can view results, registered courses, attendance records, and more.

---

## ✨ Project Features

### Faculty Side

* Secure login/logout
* Faculty dashboard with stats
* Mark and manage attendance
* Upload/view assignments
* Share lectures and materials
* Upload and manage results (subject-wise)
* View teaching schedule (filtered by semester/week)
* Edit/delete schedule entries
* Export results to CSV

### Student Side

* Secure login/logout
* View dashboard with enrolled courses
* Check attendance and results
* Access uploaded lecture materials

### Admin Side *(Optional)*

* Manage users (students/faculty)
* Create semesters, assign faculty to courses

---

## 💡 Technologies Used

| Layer               | Tech Used                             |
| ------------------- | ------------------------------------- |
| **Frontend**        | HTML5, CSS3, JavaScript, Font Awesome |
| **Backend**         | Node.js, Express.js                   |
| **Database**        | MongoDB (Mongoose ODM)                |
| **Authentication**  | JWT (JSON Web Tokens)                 |
| **Version Control** | Git + GitHub                          |

---

## 🚀 How to Run the Project Locally

### ᵀᵃᵒᵏ: Prerequisites

* [Node.js](https://nodejs.org/en) installed
* [MongoDB](https://www.mongodb.com/try/download/community) running locally or use MongoDB Atlas
* Git installed

### 1. Clone the Repository

```bash
https://github.com/JiandBaloch49/buetk-academic-portal.git
cd buetk-Academic-portal
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/buetkportal
JWT_SECRET=your_jwt_secret_key
```

### 4. Start Backend Server

```bash
npm run dev
# OR
node index.js
```



## 🔑 Test Login Credentials

### Faculty:

```txt
Email: jiandfaculty@gmail.com
Password: jiand123
```

### Student:

```txt
Email: jiand2049@gmail.com
Password: jiand2049
```
### Faculty:
```txt
Email: jiandfaculty1@gmail.com
Password: jiand123
```

---


## 📚 Project Structure

```
BUETK-Academic-Portal/
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── index.js
│   └── .env
├── Public/
│   ├── faculty-dashboard.html
│   ├── student-dashboard.html
│   ├── utils/js/
│   ├── Style.css
│   └── Script.js
├── README.md
```


## 🙏 Acknowledgements

Designed and Developed by:

* Jiand Baloch

