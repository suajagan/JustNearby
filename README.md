# JustNearby
📍 Location-Based Community & Social Networking Application

## 📌 Overview
**JustNearby** is a full-stack web application designed to help people connect with others **nearby** and build local communities.  
Users can make friends, share posts, create announcements, participate in events, and use a local marketplace — all based on geographic proximity.

The application combines social networking and community features in one platform and was developed as a **Java Full-Stack Capstone Project** to demonstrate practical skills in backend, frontend, and modern web application development.

---

## 🚀 Features
- User registration and Github authentication  
- Location-based user discovery  
- **Friend requests and friend management**  
- **Create and view posts**  
- **Community announcements**  
- **Local events creation and participation**  
- **Marketplace for local buying and selling**  
- Secure RESTful APIs  
- Responsive frontend user interface  
- Clean and modular application architecture  

---

## 🛠️ Tech Stack

### Backend
- Java  
- Spring Boot  
- RESTful APIs  
- Structured logging with Logbook  
- MongoDB  

### Frontend
- React 18  
- JavaScript (ES2023)  
- HTML5  
- CSS3  

### DevOps & Tools
- Git & GitHub  
- Maven  
- Docker (basic usage)  
- GitHub Actions (CI/CD basics)  

---

## 🧱 Architecture
- Backend: Service-oriented architecture using Spring Boot  
- Frontend: Component-based architecture using React  
- Communication: REST APIs (JSON)  
- Data Storage: MongoDB  

---

## 📂 Project Structure (Simplified)

JustNearby/
├── backend/
│ ├── controller/
│ ├── service/
│ ├── repository/
│ ├── model/
│ └── config/
│
├── frontend/
│ ├── components/
│ ├── pages/
│ ├── services/
│ └── styles/
│
└── README.md


---

## ⚙️ Setup & Installation

### Prerequisites
- Java 21
- Node.js & npm
- MongoDB
- Git

### Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
cd frontend
npm install
npm start
