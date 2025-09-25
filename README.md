# Scheduler System

A fully functional scheduler system with recurring weekly slots and exception handling.

## Tech Stack

- **Frontend**: React + TypeScript + TailwindCSS
- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL with Knex.js

## Features

### Scheduler Logic
- Each slot is tied to a weekday (e.g., Monday 9–11 AM)
- Slots automatically repeat weekly
- A given date can have maximum 2 slots
- Editing or deleting a slot applies only to that specific date (exception), without changing other recurring slots

### Frontend Features
- Weekly calendar view with days and their slots
- Infinite scroll to fetch upcoming weeks
- Create, update, and delete slots via UI
- Optimistic UI updates (changes appear immediately)
- Responsive design for desktop and mobile

### Backend Features
- **REST APIs**:
  - `POST /slots` → Create a slot
  - `GET /slots?weekStart=YYYY-MM-DD` → Fetch all slots for a given week
  - `PUT /slots/:id` → Update a slot (creates exception)
  - `DELETE /slots/:id` → Delete a slot (creates exception)
- Recurrence and exception logic enforced at the backend

### Database Schema
- **slots table** → stores recurring slots
- **exceptions table** → stores updates/deletions for specific dates

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm

### Installation

1. **Clone and setup**:
   ```bash
   cd /workspace/project
   ```

2. **Database Setup**:
   ```bash
   # Install PostgreSQL (if not installed)
   sudo apt update && sudo apt install -y postgresql postgresql-contrib
   
   # Start PostgreSQL
   sudo service postgresql start
   
   # Create database and user
   sudo -u postgres psql -c "CREATE DATABASE scheduler_db;"
   sudo -u postgres psql -c "CREATE USER scheduler_user WITH PASSWORD 'scheduler_password';"
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE scheduler_db TO scheduler_user;"
   ```

3. **Backend Setup**:
   ```bash
   cd backend
   npm install
   npm run build
   npm run migrate
   npm start
   ```

4. **Frontend Setup**:
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

### Environment Variables

Create `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=scheduler_db
DB_USER=scheduler_user
DB_PASSWORD=scheduler_password
```

## API Documentation

### Create Slot
```http
POST /slots
Content-Type: application/json

{
  "day_of_week": 1,
  "start_time": "09:00",
  "end_time": "10:00",
  "title": "Team Meeting"
}
```

### Get Slots for Week
```http
GET /slots?weekStart=2025-09-21
```

### Update Slot for Specific Date
```http
PUT /slots/1
Content-Type: application/json

{
  "date": "2025-09-23",
  "start_time": "10:00",
  "end_time": "11:00",
  "title": "Modified Meeting"
}
```

### Delete Slot for Specific Date
```http
DELETE /slots/1?date=2025-09-23
```

## Database Schema

### Slots Table
```sql
CREATE TABLE slots (
  id SERIAL PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Exceptions Table
```sql
CREATE TABLE exceptions (
  id SERIAL PRIMARY KEY,
  slot_id INTEGER REFERENCES slots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  title VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(slot_id, date)
);
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## Deployment

The application is currently running on:
- **Frontend**: https://work-1-oxwdrpqkoliqxzon.prod-runtime.all-hands.dev (port 12000)
- **Backend**: http://localhost:3001

### Production Deployment Steps

1. **Database**: Set up PostgreSQL on your production server
2. **Backend**: Deploy to a Node.js hosting service (Heroku, DigitalOcean, AWS, etc.)
3. **Frontend**: Deploy to a static hosting service (Netlify, Vercel, AWS S3, etc.)
4. **Environment**: Update environment variables for production

### Docker Deployment (Optional)

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: scheduler_db
      POSTGRES_USER: scheduler_user
      POSTGRES_PASSWORD: scheduler_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - db
    environment:
      NODE_ENV: production
      DB_HOST: db

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Architecture

### Frontend Architecture
- **React Components**: Modular component structure
- **State Management**: React hooks (useState, useEffect, useCallback)
- **API Integration**: Axios for HTTP requests
- **Styling**: TailwindCSS for responsive design
- **Date Handling**: date-fns for date manipulation

### Backend Architecture
- **Express.js**: RESTful API server
- **TypeScript**: Type-safe development
- **Knex.js**: SQL query builder and migrations
- **PostgreSQL**: Relational database
- **Middleware**: CORS, Helmet, Morgan for security and logging

### Key Features Implementation

1. **Recurring Slots**: Base slots in `slots` table with day_of_week
2. **Exceptions**: Modifications stored in `exceptions` table
3. **Infinite Scroll**: Frontend loads additional weeks on scroll
4. **Optimistic Updates**: UI updates immediately, reverts on error
5. **Exception Handling**: Specific date modifications don't affect recurring pattern

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License