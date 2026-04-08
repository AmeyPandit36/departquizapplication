const db = require('./server/config/database');

async function test() {
  try {
    const [quizzes] = await db.pool.query('SELECT * FROM quizzes');
    const [users] = await db.pool.query('SELECT * FROM users WHERE role = "student"');
    const [enrollments] = await db.pool.query('SELECT * FROM student_subjects');
    const [subjects] = await db.pool.query('SELECT * FROM subjects');
    
    const result = { quizzes, users, enrollments, subjects };
    require('fs').writeFileSync('db_diagnostic.json', JSON.stringify(result, null, 2));
    console.log('Diagnostic data written to db_diagnostic.json');
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
