# 🧠 Meal Planner AI

A full-stack intelligent meal planning application built with Next.js that helps users plan meals, manage groceries, and simplify daily cooking decisions.

---

## 🧩 Problem Statement

Planning daily meals is repetitive and time-consuming. Users often struggle with:
- Deciding what to cook
- Managing grocery lists
- Avoiding food waste

This application solves that by generating structured meal plans and aggregating ingredients automatically.

---

## ✨ Features

### 🔐 Authentication
- Secure login & registration using NextAuth
- Session-based authentication

### 🍽️ Meal Planning
- Generate meal plans based on:
  - Number of people
  - Number of days
- Supports breakfast, lunch, and dinner

### 🛒 Grocery Aggregation (Core Feature)
- Automatically combines ingredients across meals
- Provides a consolidated shopping list

### 🤖 AI Integration (with fallback)
- Attempted integration with Gemini API
- Graceful fallback to deterministic logic when AI fails
- Ensures reliability and consistent UX

### 📊 Smart Data Handling
- Structured ingredient storage (JSON)
- Unique constraints for meal consistency
- Optimized relational schema using Prisma

---

## 🏗️ Tech Stack

- Frontend & Backend: Next.js 16 (App Router)
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth
- Styling: Tailwind CSS (or basic styling)
- AI (Optional): Gemini API (with fallback system)

---

## 🧠 System Design

- Session-based authentication (secure)
- API-driven architecture
- Server-side rendering (SSR)
- Optimized database schema
- Fallback system for AI reliability

---

## ⚙️ Setup Instructions

### 1. Clone the repo
bash git clone <repo-url> cd meal-planner-ai 

### 2. Install dependencies
bash pnpm install 

### 3. Setup environment variables
env DATABASE_URL=your_database_url NEXTAUTH_SECRET=your_secret NEXTAUTH_URL=http://localhost:3000 

### 4. Run migrations
bash npx prisma migrate dev 

### 5. Start the app
bash pnpm dev 

---

## 🧪 Testing

Basic API and flow testing implemented.  
(You can expand with unit/integration tests.)

---

## 🔐 Security Considerations

- Password hashing using bcrypt
- Session-based authentication
- Protected API routes
- Input validation

---

## ⚡ Performance Optimizations

- Server-side rendering (SSR)
- Efficient database queries
- Minimal API payloads
- Clean component structure

---

## 🌍 Real-World Considerations

- Handles API failures (AI fallback)
- Scalable database design
- Secure authentication flow
- Modular architecture for future expansion

---

## 🚀 Future Improvements

- Fine-tuning AI to improve the results
- Nutrition tracking
- Recipe instructions
- AI-based personalization
- Multi-user family planning

---

## 👤 Author

Nilesh Sehrawat

- GitHub: https://www.github.com/nileshsehrawat
- LinkedIn: https://www.linkedin.com/in/nilesh-sehrawat-a0a942322/
