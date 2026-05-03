# Nigehban – Crime Record Management System

Nigehban is a secure and efficient digital Crime Record Management System designed to replace traditional paper-based record keeping. It provides a centralized platform for storing, managing, and retrieving crime-related data in real time.

---

## 📌 Features

- Digitized crime record management system  
- Secure user authentication using JWT  
- Role-based access control (Admin, Officers, etc.)  
- Fast search, filter, and retrieval of records  
- Add, update, and delete crime entries  
- Centralized and organized database structure  
- Scalable and flexible system design  

---

## 🛠️ Tech Stack

- **Frontend:** React.js  
- **Backend:** Node.js, Express.js  
- **Database:** MongoDB Atlas  
- **Authentication:** JSON Web Token (JWT)  
- **API Requests:** Axios  

---

## 📂 Project Structure

```

frontend   → React client application
backend    → Node.js + Express server
models     → Database schemas
routes     → API routes
controllers → Business logic

````

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/rehabshahzad/EzCAnalytor.git
cd nigehban
````

---

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

---

### 3. Setup Backend

Open a new terminal and run:

```bash
cd backend
npm install
npm run dev
```

---

## 🚀 API Endpoints

### 🔐 Auth Routes

* `POST /api/auth/register` → Register user
* `POST /api/auth/login` → Login user

### 📄 Crime Routes

* `GET /api/crimes` → Get all crimes
* `POST /api/crimes` → Add new crime
* `PUT /api/crimes/:id` → Update crime
* `DELETE /api/crimes/:id` → Delete crime

---

## 🔐 Security Features

* Password hashing using bcrypt
* JWT-based authentication system
* Protected API routes
* Secure token handling in frontend

---

## 📊 Future Improvements

* Crime analytics dashboard
* AI-based crime prediction system
* Mobile application version
* Map integration for incident locations
* Real-time alert system

---

