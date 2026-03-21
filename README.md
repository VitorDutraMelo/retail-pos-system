# 🛒 Retail POS System API

A full-stack ready backend API for a retail Point of Sale (POS) system.
Built with modern technologies and real-world architecture.

---

## 🚀 Features

* 🔐 Authentication (JWT)
* 👤 User management
* 📦 Product management (CRUD)
* 💰 Sales system (with transaction logic)
* 📊 Sales history
* 🧾 Receipt-ready structure

---

## 🛠️ Tech Stack

* **Node.js**
* **Express**
* **TypeScript**
* **Prisma ORM**
* **PostgreSQL (Neon)**
* **JWT Authentication**
* **Bcrypt**

---

## 📁 Project Structure

```
src/
├── controllers/
├── services/
├── routes/
├── middlewares/
├── utils/
├── app.ts
└── server.ts

prisma/
└── schema.prisma
```

---

## ⚙️ Setup

### 1. Clone the repository

```
git clone https://github.com/your-username/retail-pos-system-backend.git
cd retail-pos-system-backend
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Setup environment variables

Create a `.env` file:

```
DATABASE_URL=your_database_url
JWT_SECRET=your_secret_key
```

---

### 4. Run Prisma

```
npx prisma generate
npx prisma db push
```

---

### 5. Start the server

```
npm run dev
```

---

## 🔐 Authentication

### Register

**POST** `/auth/register`

```
{
  "name": "John Doe",
  "email": "john@email.com",
  "password": "123456"
}
```

---

### Login

**POST** `/auth/login`

Returns:

```
{
  "user": {...},
  "token": "JWT_TOKEN"
}
```

---

## 📌 Next Features (Roadmap)

* [ ] Product CRUD
* [ ] Sales system with transactions
* [ ] Inventory control
* [ ] Payment methods
* [ ] Frontend integration

---

## 💼 Purpose

This project was built as a real-world backend system to demonstrate:

* Clean architecture
* Database modeling
* Secure authentication
* Business logic implementation

---

## 👨‍💻 Author

Vitor Dutra Melo

---

## ⭐ If you like this project

Give it a star on GitHub ⭐

