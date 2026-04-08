const mysql = require('mysql2/promise');

const testSubmit = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'dept_quiz_app'
    });
    
    // Find a student
    const [students] = await connection.query("SELECT * FROM users WHERE role = 'student' LIMIT 1");
    if (students.length === 0) {
      console.log('No student found');
      process.exit(1);
    }
    const student = students[0];
    
    // Find an attempt that is NOT submitted
    const [attempts] = await connection.query("SELECT * FROM quiz_attempts WHERE submitted_at IS NULL AND student_id = ?", [student.id]);
    
    if (attempts.length === 0) {
      console.log("No unsubmitted attempt found for student", student.user_id);
      process.exit(1);
    }
    
    const attempt = attempts[0];
    console.log("Found unsubmitted attempt:", attempt.id, "For quiz:", attempt.quiz_id);
    
    const jwt = require('jsonwebtoken');
    require('dotenv').config({ path: '.env' }); // Note: .env is in server dir
    const token = jwt.sign(
      { id: student.id, role: student.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    // Submit using fetch
    const response = await fetch(`http://localhost:5000/api/student/quizzes/${attempt.quiz_id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        answers: { 0: "Sample Answer" }
      })
    });
    
    const data = await response.json();
    if (!response.ok) {
      console.error("API Error Response Data:", data);
      process.exit(1);
    }

    console.log("Success:", data);
    process.exit(0);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

testSubmit();
