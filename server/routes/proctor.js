const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const db = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('student'));

const ensureAttemptAccess = async (attemptId, studentId) => {
  if (!attemptId) return null;

  const [attempts] = await db.pool.query(
    `
      SELECT 
        qa.*, 
        q.enable_proctoring,
        q.snapshot_interval_min,
        q.snapshot_interval_max,
        q.max_focus_violations
      FROM quiz_attempts qa
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE qa.id = ? AND qa.student_id = ?
    `,
    [attemptId, studentId]
  );

  return attempts.length ? attempts[0] : null;
};

router.post('/start', async (req, res) => {
  try {
    const { attempt_id } = req.body;
    const attempt = await ensureAttemptAccess(attempt_id, req.user.id);

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (!attempt.enable_proctoring) {
      return res.json({ enabled: false });
    }

    res.json({
      enabled: true,
      settings: {
        snapshot_interval_min: attempt.snapshot_interval_min || 60,
        snapshot_interval_max: attempt.snapshot_interval_max || 180,
        max_focus_violations: attempt.max_focus_violations || 3
      }
    });
  } catch (error) {
    console.error('Error starting proctoring:', error);
    res.status(500).json({ message: 'Failed to start proctoring', error: error.message });
  }
});

router.post('/event', async (req, res) => {
  try {
    const { attempt_id, event_type, details } = req.body;
    const allowedEvents = ['focus_lost', 'focus_regained', 'warning'];

    if (!allowedEvents.includes(event_type)) {
      return res.status(400).json({ message: 'Invalid event type' });
    }

    const attempt = await ensureAttemptAccess(attempt_id, req.user.id);

    if (!attempt || !attempt.enable_proctoring) {
      return res.status(404).json({ message: 'Proctoring not enabled for this attempt' });
    }

    await db.pool.query(
      'INSERT INTO proctor_events (attempt_id, event_type, details) VALUES (?, ?, ?)',
      [attempt_id, event_type, details ? JSON.stringify(details) : null]
    );

    let focusViolations = null;
    let limitExceeded = false;

    if (event_type === 'focus_lost') {
      const [counts] = await db.pool.query(
        `SELECT COUNT(*) as total FROM proctor_events WHERE attempt_id = ? AND event_type = 'focus_lost'`,
        [attempt_id]
      );
      focusViolations = counts[0].total;
      if (attempt.max_focus_violations && focusViolations >= attempt.max_focus_violations) {
        limitExceeded = true;
      }
    }

    res.json({
      status: 'logged',
      focusViolations,
      limitExceeded
    });
  } catch (error) {
    console.error('Error logging proctoring event:', error);
    res.status(500).json({ message: 'Failed to log event', error: error.message });
  }
});

router.post('/snapshot', async (req, res) => {
  try {
    const { attempt_id, image } = req.body;

    if (!image || !image.startsWith('data:image')) {
      return res.status(400).json({ message: 'Invalid image payload' });
    }

    const attempt = await ensureAttemptAccess(attempt_id, req.user.id);
    if (!attempt || !attempt.enable_proctoring) {
      return res.status(404).json({ message: 'Proctoring not enabled for this attempt' });
    }

    const base64Data = image.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'proctor');

    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const filename = `attempt_${attempt_id}_${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    const relativePath = path.relative(path.join(__dirname, '..', '..'), filePath).replace(/\\/g, '/');

    await db.pool.query(
      'INSERT INTO proctor_snapshots (attempt_id, file_path) VALUES (?, ?)',
      [attempt_id, relativePath]
    );

    await db.pool.query(
      'INSERT INTO proctor_events (attempt_id, event_type, details) VALUES (?, ?, ?)',
      [attempt_id, 'snapshot', JSON.stringify({ path: relativePath })]
    );

    res.json({ status: 'captured', path: relativePath });
  } catch (error) {
    console.error('Error saving snapshot:', error);
    res.status(500).json({ message: 'Failed to save snapshot', error: error.message });
  }
});

module.exports = router;






