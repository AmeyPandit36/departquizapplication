const axios = require('axios');
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
    
    // Login
    // Since we don't know the password, let's just create a token manually using jwt
    const jwt = require('jsonwebtoken');
    require('dotenv').config();
    const token = jwt.sign(
      { id: student.id, role: student.role },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '1d' }
    );
    
    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Submit
    const submitRes = await axios.post(`http://localhost:5000/api/student/quizzes/${attempt.quiz_id}/submit`, {
      answers: { 0: "Sample Answer" }
    }, config);
    
    console.log("Success:", submitRes.data);
    process.exit(0);

  } catch (err) {
    if (err.response) {
      console.error("API Error Response Data:", err.response.data);
    } else {
      console.error("Error:", err.message);
    }
    process.exit(1);
  }
};

testSubmit();
