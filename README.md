# HMCTS Task Manager

A full-stack task management application for HMCTS caseworkers to efficiently track and manage their tasks.

## 🎯 Overview

This application allows task management to:

- Create and manage tasks
- Track task status (Pending, In Progress, Completed, Cancelled)
- Set due date and descriptions
- View task details
- Delete tasks when no longer needed

## 🏗 Architecture
```
┌─────────────────┐ ┌─────────────────┐
│ │ │ │ │ │
│ Vue.js │────▶│ Express.js │────▶│ PostgreSQL │
│ Frontend │ │ Backend API │ │ Database │
│ │ │ │ │ │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```
## 📁 Project Structure
```
dts-developer-challenge/
├── backend/ # Express.js API
│ ├── src/
│ ├── package.json
│ └── README.md
├── frontend/ # Vue.js Application
│ ├── src/
│ ├── package.json
│ └── README.md
└── README.md # This file
```
## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm v9+

### 1. Clone the Repository

```bash
git clone https://github.com/tsowems/dts-developer-challenge.git
cd dts-developer-challenge
```

### 2. Setup Backend
``
cd backend
npm install
cp .env.example .env
``
# Edit .env with your database credentials
``
nodemon
``
### 3. Setup Frontend
``
cd frontend
npm install
cp .env.example .env
npm run dev
``
### 4. Open Application

``
Visit http://localhost:5173 in your browser.
``
### 4🧪 Testing

## Backend Tests
``
cd backend
npm test
``
### 🛠 Tech Stack

## Backend
```
Node.js
TypeScript
Express.js
PostgreSQL
Zod (validation)
Vitest (testing)
```
## Frontend
```
Vue.js 3
TypeScript
Vite
XState / Vue Composables
Zod (validation)
```
## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

Taiwo Sowemimo

GitHub: @tsowems
Email: sowemimott@gmail.com

## 🚀 Installation

1. Clone the repository
``
    git clone https://github.com/tsowems/dts-developer-challenge.git
   cd dts-developer-challenge/backend
``
3. Install dependencies
 ``
   npm install
``
4. Set up environment variables
 ``
   cp .env.example .env
   Edit .env with your configuration (see Environment Variables).
   ``
6. Set up the database
   See Database Setup.
7. Start the development server
``
   nodemon
   The API will be available at http://localhost:8080
``
## 🔐 Environment Variables

Create a .env file in the backend root directory:

# Server Configuration
``
PORT=3001
NODE_ENV=development
``
# Database Configuration
``
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hmcts_tasks
DB_USER=your_username
DB_PASSWORD=your_password
Note: You can register a free postgres on neon - https://neon.com/
``
📚 API Documentation

Base URL
http://localhost:6000/api/v1

Endpoints Summary
Method Endpoint Description
``
POST /tasks Create a new task
GET /tasks Get all tasks
GET /tasks/:taskId Get task by ID
PATCH /tasks/:taskId/status Update task status
DELETE /tasks/:taskId Delete task (soft delete)
``
Create Task
```
POST /tasks
{
"title": "Complete project documentation",
"description": "Write comprehensive API documentation",
"status": "pending",
"dueDate": "2024-12-31T23:59:59.000Z"
}
```
```
Field Type Required Description
title string Yes Task title (1-255 characters)
description string No Task description
status string No Status: pending, in_progress, completed, cancelled
dueDate string Yes Due date in ISO 8601 format
```
Response (201 Created):
```
{
"success": true,
"message": "Task created successfully",
   "data": {
   "id": 1,
   "taskId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
   "title": "Complete project documentation",
   "description": "Write comprehensive API documentation",
   "status": "pending",
   "dueDate": "2024-12-31T23:59:59.000Z",
   "createdAt": "2024-01-15T10:30:00.000Z",
   "updatedAt": "2024-01-15T10:30:00.000Z",
   "deletedAt": null
   }
}
```
Error Response (409 Conflict):
```
{
   "success": false,
   "error": "Task with title \"Complete project documentation\" already exists"
}
```
---

## Frontend README (frontend/README.md)

````markdown
# HMCTS Task Manager - Frontend

A Vue.js application for managing tasks, providing a user-friendly interface for HMCTS caseworkers.

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Features](#features)
- [Project Structure](#project-structure)
- [Components](#components)
- [State Management](#state-management)
- [License](#license)
- [Author](#author)

## 🎯 Overview

This frontend application provides an intuitive interface for caseworkers to:

- View all tasks in a clean, organized list
- Create new tasks with validation
- Update task status
- View detailed task information
- Delete tasks (soft delete)
- Visual indicators for overdue tasks

## 🛠 Tech Stack

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Vue.js 3   | Frontend framework      |
| TypeScript | Type-safe JavaScript    |
| Vite       | Build tool & dev server |
| XState     | State management        |
| Zod        | Schema validation       |
| Axios      | HTTP client             |

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Backend API** running on `http://localhost:8080`

### Verify Installation

```bash
node --version    # Should be v18+
npm --version     # Should be v9+
```
````
