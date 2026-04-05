# 💰 Finance Hub Backend API:

This project provides a backend system for managing financial data with Role-Based Access Control (RBAC).
🔐 Authentication Module
1. Register User
POST /api/auth/register
Description:
Creates a new user with role-based access.
Request Body:
JSON
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "123456",
  "role": "Analyst"
}
Response:
JSON
{
  "message": "User registered successfully"
}
2. Login User
POST /api/auth/login
Description:
Authenticates user and returns JWT token.
Request Body:
JSON
{
  "email": "john@gmail.com",
  "password": "123456"
}
Response:
JSON
{
  "token": "jwt_token_here",
  "role": "Analyst"
}
🔒 Authorization (Role-Based Access Control)
Roles:
Viewer → Read-only access
Analyst → Can add & view transactions
Admin → Full access (CRUD operations)
Header Format:

Authorization: Bearer <JWT_TOKEN>
💰 Transactions Module
3. Add Transaction
POST /api/transactions
Access:
Analyst, Admin
Request Body:
JSON
{
  "type": "expense",
  "amount": 500,
  "category": "Food",
  "date": "2026-04-05"
}
Response:
JSON
{
  "message": "Transaction added successfully"
}
4. Get All Transactions
GET /api/transactions
Access:
Viewer, Analyst, Admin
Response:
JSON
[
  {
    "_id": "1",
    "type": "income",
    "amount": 2000,
    "category": "Salary",
    "date": "2026-04-01"
  }
]
5. Delete Transaction
DELETE /api/transactions/:id
Access:
Admin only
Response:
JSON
{
  "message": "Transaction deleted successfully"
}
📊 Dashboard Module
6. Get Financial Summary
GET /api/dashboard/summary
Description:
Returns total income, expenses, and net balance.
Response:
JSON
{
  "totalIncome": 5000,
  "totalExpense": 2000,
  "netBalance": 3000
}
7. Category-wise Expenses
GET /api/dashboard/categories
Response:
JSON
[
  {
    "category": "Food",
    "amount": 1200
  },
  {
    "category": "Transport",
    "amount": 800
  }
]
8. Monthly Trends
GET /api/dashboard/trends
Response:
JSON
[
  {
    "month": "Jan",
    "income": 3000,
    "expense": 1500
  },
  {
    "month": "Feb",
    "income": 4000,
    "expense": 2000
  }
]
⚠️ Error Handling
Unauthorized Access
JSON
{
  "error": "Unauthorized access"
}
Invalid Token
JSON
{
  "error": "Invalid or expired token"
}
Validation Error
JSON
{
  "error": "Required fields missing"
}
🛠️ Technologies Used
Node.js
Express.js
MongoDB
JWT Authentication
🧪 API Testing
APIs can be tested using:
Postman
Thunder Client
📌 Notes
All protected routes require JWT token
Role-based access is enforced on sensitive endpoints
Ensure correct headers are passed for authorization
GitHub Repo:
https://github.com/Likhitha1103/finance-hub.-backend
