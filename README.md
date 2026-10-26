# 74 Lounge Bar

Website and API for the 74 Lounge Bar project.

## Stack

- Frontend: Next.js 14 and React 18
- Backend: Express.js and Node.js
- Database: MySQL

## Prerequisites

- Node.js and npm
- A local MySQL server

## Local setup

Install dependencies for the root scripts, backend, and frontend:

```bash
npm run install:all
```

Create `backend/.env` with your local database settings:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=74_lounge_bar
DB_USER=your_local_mysql_user
DB_PASSWORD=your_local_mysql_password
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the frontend and API together:

```bash
npm run dev
```

The frontend runs on port 3000 and the API defaults to port 5000.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run install:all` | Install root, backend, and frontend dependencies |
| `npm run dev` | Run the frontend and API in development |
| `npm run build` | Build the Next.js frontend |
| `npm start` | Start the backend API |
| `npm run start --prefix frontend` | Start the frontend after building it |

Use private, deployment-specific environment variables for production. Do not commit real database passwords or admin credentials.
