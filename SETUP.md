# Setup Instructions

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MySQL** (v5.7 or higher)
3. **npm** or **yarn**

## Installation Steps

### 1. Install Backend Dependencies

```bash
npm install
```

### 2. Install Frontend Dependencies

```bash
cd client
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=dept_quiz_app
JWT_SECRET=your-secret-key-change-in-production
```

**Important**: Change the `JWT_SECRET` to a strong random string in production!

### 4. Setup MySQL Database

1. Make sure MySQL is running
2. The application will automatically create the database and tables on first run
3. Alternatively, you can manually create the database:
   ```sql
   CREATE DATABASE dept_quiz_app;
   ```

### 5. Start the Application

#### Option 1: Run Backend and Frontend Separately

**Terminal 1 - Backend:**

```bash
npm start
# or for development with auto-reload:
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm start
```

#### Option 2: Run Both (if you have a process manager)

The backend will run on `http://localhost:5000`
The frontend will run on `http://localhost:3000`

## Default Login Credentials

- **User ID**: `ADMIN001`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

## First Steps After Setup

1. Login as admin using the default credentials
2. Create classes (SE, TE, BE) - these are pre-created
3. Create subjects for each class
4. Create teacher accounts and assign them to subjects
5. Create student accounts and enroll them in subjects
6. Teachers can then create experiments and quizzes
7. Students can take quizzes and view their scores

## Excel Import Format

For importing users via Excel, create a file with the following columns:

**For Teachers:**

- Teacher ID
- Name (or Teacher Name)
- Email (optional)
- Password (optional, defaults to teacher123)
- Qualification (optional)

**For Students:**

- Student ID (or User ID)
- Name (or Student Name)
- Email (optional)
- Password (optional, defaults to student123)

## Troubleshooting

### Database Connection Issues

- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database user has proper permissions

### Port Already in Use

- Change `PORT` in `.env` for backend
- Frontend port can be changed in `client/package.json`

### Module Not Found Errors

- Run `npm install` in both root and `client` directories
- Delete `node_modules` and reinstall if issues persist

## Production Deployment

1. Set strong `JWT_SECRET` in `.env`
2. Change default admin password
3. Use environment variables for all sensitive data
4. Build frontend: `cd client && npm run build`
5. Serve frontend build with a web server (nginx, Apache, etc.)
6. Use PM2 or similar for Node.js process management
7. Enable HTTPS
8. Configure proper database backups








