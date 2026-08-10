# Wanderlog ✈️

A travel journal app where you can plan trips, organize them day-by-day, add photos, and share your adventures with the community.

---

## What it does

- **Plan trips** — create trips with a title, destination, dates, description, and cover image
- **Organize by days** — add days to your trip with a date, title, description, and location
- **Add photos** — upload up to 10 photos per day, replace or delete them anytime
- **Auto-generate days** — automatically create days from your trip's start and end dates
- **Share publicly** — make a trip public so others can browse and explore it
- **Browse community trips** — discover trips from other travelers on the homepage

---

## Tech Stack

| Part         | Tech                                     |
| ------------ | ---------------------------------------- |
| Frontend     | React, Vite, Tailwind CSS, React Router  |
| Backend      | Node.js, Express                         |
| Database     | MongoDB (Mongoose)                       |
| Auth         | JWT (access + refresh tokens in cookies) |
| File uploads | Multer + Cloudinary                      |

---

## Project Structure

```
Wanderlog/
├── client/          # React frontend
│   └── src/
│       ├── api/     # API calls
│       ├── components/
│       ├── context/ # Auth context
│       ├── hook/    # Custom hooks
│       ├── pages/   # Pages (Home, Login, Dashboard, TripDetail, etc.)
│       └── ui/      # Reusable UI components
└── server/          # Express backend
    └── src/
        ├── config/      # DB, Cloudinary, env
        ├── controllers/ # Route handlers
        ├── middlewares/ # Auth, upload, error handling
        ├── models/      # Mongoose models
        ├── routes/      # API routes
        └── utils/       # Helpers
```

---

## Getting Started

### 1. Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- A Cloudinary account (for photo uploads)

### 2. Setup the server

```bash
cd server
npm install
```

Create a `.env` file in the `server` folder:

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
DB_NAME=wanderlog
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
NODE_ENV=development
CLOUD_NAME=your_cloudinary_cloud_name
API_KEY=your_cloudinary_api_key
API_SECRET=your_cloudinary_api_secret
```

Start the server:

```bash
npm run dev
```

### 3. Setup the client

```bash
cd client
npm install
```

Create a `.env` file in the `client` folder:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the client:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## How to use

1. **Create an account** — sign up with your name, email, and password
2. **Create a trip** — add a title, destination, dates, and cover image
3. **Add days** — either manually or use the "Auto-generate" button
4. **Add photos** — click the "+" button on any day to upload photos
5. **Make it public** — toggle the public option so others can see your trip
6. **Browse** — explore public trips from the homepage

---

## API Overview

| Method | Endpoint                                   | Description                  |
| ------ | ------------------------------------------ | ---------------------------- |
| POST   | `/api/v1/users/register`                   | Register a new user          |
| POST   | `/api/v1/users/login`                      | Login                        |
| POST   | `/api/v1/users/logout`                     | Logout                       |
| GET    | `/api/v1/users/profile`                    | Get current user             |
| POST   | `/api/v1/users/refresh-token`              | Refresh access token         |
| GET    | `/api/v1/trips/browse`                     | Get public trips (paginated) |
| POST   | `/api/v1/trips`                            | Create a trip                |
| GET    | `/api/v1/trips`                            | Get my trips                 |
| GET    | `/api/v1/trips/:id`                        | Get a trip                   |
| PUT    | `/api/v1/trips/:id`                        | Update a trip                |
| DELETE | `/api/v1/trips/:id`                        | Delete a trip                |
| POST   | `/api/v1/trips/:tripId/days`               | Add a day                    |
| GET    | `/api/v1/trips/:tripId/days`               | Get all days for a trip      |
| GET    | `/api/v1/trips/:tripId/days/:dayNumber`    | Get a single day             |
| PUT    | `/api/v1/trips/:tripId/days/:dayId`        | Update a day                 |
| DELETE | `/api/v1/trips/:tripId/days/:dayId`        | Delete a day                 |
| PATCH  | `/api/v1/trips/:tripId/days/:dayId/photos` | Remove a photo               |

---

## Scripts

### Client

| Command           | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Build for production     |
| `npm run preview` | Preview production build |

### Server

| Command       | Description                       |
| ------------- | --------------------------------- |
| `npm run dev` | Start with nodemon (auto-restart) |
| `npm start`   | Start normally                    |
