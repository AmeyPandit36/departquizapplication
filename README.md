# Department Based Quiz App

A comprehensive web-based quiz application for the IT Department's internal assessment system. This app replaces traditional Google Forms with a more secure and feature-rich solution.

## Features

### Admin Features

- Create and manage subjects for SE, TE, and BE classes
- Create teacher accounts and assign them to subjects
- Add students manually or via Excel import
- Edit and delete users
- Comprehensive data visualizations:
  - Quiz statistics by class and subject
  - Student participation metrics
  - Individual student scores
  - Performance analysis by subject and question type

### Teacher Features

- Create experiments for assigned subjects
- Create quizzes with customizable marks per question
- Activate/deactivate quizzes based on dates
- View detailed quiz analysis:
  - Student performance by quiz
  - Question-wise accuracy
  - Subject-wise performance trends

### Student Features

- View enrolled subjects
- Take quizzes for active experiments
- View scores (marks and percentage)
- Track performance across subjects

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer (for Excel imports)
- **Frontend**: React (to be implemented)

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret

4. Make sure MySQL is running and create the database (or let the app create it automatically)

5. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## Default Admin Credentials

- **User ID**: ADMIN001
- **Password**: admin123

**⚠️ IMPORTANT**: Change the default admin password in production!

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Admin Routes (require admin role)

- `GET /api/admin/classes` - Get all classes
- `POST /api/admin/subjects` - Create subject
- `GET /api/admin/subjects` - Get all subjects
- `PUT /api/admin/subjects/:id` - Update subject
- `DELETE /api/admin/subjects/:id` - Delete subject
- `POST /api/admin/teachers` - Create teacher
- `GET /api/admin/teachers` - Get all teachers
- `PUT /api/admin/teachers/:id` - Update teacher
- `POST /api/admin/students` - Create student
- `GET /api/admin/students` - Get all students
- `PUT /api/admin/students/:id` - Update student
- `DELETE /api/admin/users/:id` - Delete user
- `POST /api/admin/import-users` - Import users from Excel
- `GET /api/admin/stats/quizzes-by-class` - Quiz statistics by class
- `GET /api/admin/stats/quizzes-by-subject` - Quiz statistics by subject
- `GET /api/admin/stats/student-participation` - Student participation stats
- `GET /api/admin/stats/student-scores` - Individual student scores
- `GET /api/admin/stats/student-performance` - Student performance analysis

### Teacher Routes (require teacher role)

- `GET /api/teacher/subjects` - Get assigned subjects
- `POST /api/teacher/experiments` - Create experiment
- `GET /api/teacher/experiments/:subject_id` - Get experiments
- `PUT /api/teacher/experiments/:id` - Update experiment
- `DELETE /api/teacher/experiments/:id` - Delete experiment
- `POST /api/teacher/quizzes` - Create quiz
- `GET /api/teacher/quizzes/:subject_id` - Get quizzes
- `GET /api/teacher/quizzes/details/:id` - Get quiz details
- `PUT /api/teacher/quizzes/:id/activate` - Activate/deactivate quiz
- `PUT /api/teacher/quizzes/:id/dates` - Update quiz dates
- `GET /api/teacher/quizzes/:id/attempts` - Get quiz attempts
- `GET /api/teacher/analysis/subject/:subject_id` - Subject performance analysis
- `GET /api/teacher/analysis/quiz/:quiz_id/questions` - Question-wise analysis

### Student Routes (require student role)

- `GET /api/student/subjects` - Get enrolled subjects
- `GET /api/student/quizzes/:subject_id` - Get available quizzes
- `GET /api/student/quizzes/details/:id` - Get quiz details
- `POST /api/student/quizzes/:id/start` - Start quiz attempt
- `POST /api/student/quizzes/:id/submit` - Submit quiz
- `GET /api/student/scores` - Get all scores
- `GET /api/student/performance` - Get performance summary

## Database Schema

The application automatically creates the following tables:

- `users` - All users (admin, teachers, students)
- `classes` - SE, TE, BE classes
- `subjects` - Subjects for each class
- `teacher_subjects` - Teacher-subject assignments
- `student_subjects` - Student-subject enrollments
- `experiments` - Experiments for subjects
- `quizzes` - Quizzes for experiments
- `questions` - Questions for quizzes
- `quiz_attempts` - Student quiz attempts and scores

## Excel Import Format

For importing users via Excel, the file should have columns:

- `Teacher ID` or `Student ID` or `User ID`
- `Name` or `Teacher Name` or `Student Name`
- `Email` (optional)
- `Password` (optional, defaults to teacher123/student123)
- `Qualification` (for teachers, optional)

## Development

The frontend React application will be added in a separate `client` directory. For now, you can test the API using tools like Postman or curl.

## Project Structure

```
dept-quiz-app/
├── server/                 # Backend code
│   ├── config/            # Database configuration
│   ├── middleware/        # Authentication middleware
│   └── routes/            # API routes
├── client/                # Frontend React app
│   ├── public/           # Public assets
│   └── src/              # React source code
│       ├── components/   # React components
│       └── context/      # React context (Auth)
├── uploads/              # Excel file uploads directory
├── package.json          # Backend dependencies
└── README.md            # This file
```

## Key Features Implemented

✅ **Admin Dashboard**

- Subject management (Create, Read, Update, Delete)
- Teacher management with subject assignment
- Student management with subject enrollment
- Excel import for bulk user creation
- Comprehensive statistics and data visualization
- Individual student performance tracking

✅ **Teacher Dashboard**

- Experiment creation and management
- Quiz creation with customizable questions and marks
- Quiz activation/deactivation based on dates
- Detailed quiz analysis (question-wise, student-wise)
- Subject-wise performance tracking

✅ **Student Dashboard**

- View available quizzes
- Take quizzes with timer
- View scores and performance
- Subject-wise performance charts

## Security Features

- JWT-based authentication
- Role-based access control (Admin, Teacher, Student)
- Password hashing with bcrypt
- Protected API routes
- Secure file upload handling

## API Documentation

All API endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Authentication

- `POST /api/auth/login` - Login with user_id and password
- `GET /api/auth/me` - Get current user info

### Admin Endpoints

All admin endpoints are prefixed with `/api/admin/` and require admin role.

### Teacher Endpoints

All teacher endpoints are prefixed with `/api/teacher/` and require teacher role.

### Student Endpoints

All student endpoints are prefixed with `/api/student/` and require student role.

## License

ISC
