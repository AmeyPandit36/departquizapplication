const db = require('./server/config/database');

async function test() {
  try {
    const student_id = 540002;
    const subject_id = 1;
    const now = new Date();
    const nowString = now.toISOString().slice(0, 19).replace('T', ' ');
    
    console.log('Parameters:', { student_id, subject_id, nowString });

    const [quizzes] = await db.pool.query(`
      SELECT q.*, e.experiment_number, e.title as experiment_title,
        CASE 
          WHEN qa.id IS NOT NULL AND qa.submitted_at IS NOT NULL THEN true 
          ELSE false 
        END as attempted,
        qa.score as my_score,
        qa.percentage as my_percentage,
        CASE 
          WHEN qa.id IS NOT NULL AND qa.submitted_at IS NULL THEN true 
          ELSE false 
        END as in_progress
      FROM quizzes q
      JOIN experiments e ON q.experiment_id = e.id
      LEFT JOIN quiz_attempts qa ON q.id = qa.quiz_id AND qa.student_id = ?
      WHERE q.subject_id = ? 
        AND q.is_active = true
        AND (q.start_date IS NULL OR q.start_date <= ?)
        AND (q.end_date IS NULL OR q.end_date >= ?)
      ORDER BY q.start_date DESC
    `, [student_id, subject_id, nowString, nowString]);
    
    console.log('QUERY RESULT:', JSON.stringify(quizzes, null, 2));
    
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}

test();
