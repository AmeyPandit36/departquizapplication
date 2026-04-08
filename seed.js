const fs = require('fs');

async function seed() {
  try {
    console.log("Starting seed process...");
    // Login as Admin
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'ADMIN001', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    
    const headers = { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}` 
    };

    // Get classes
    const classesRes = await fetch('http://localhost:5000/api/admin/classes', { headers });
    const classes = await classesRes.json();
    const classId = classes[0]?.id || 1; // Default to first class (usually SE)

    // 1. Create 5 Subjects
    const subjectsToCreate = ['Mathematics', 'Physics', 'Data Structures', 'Database Systems', 'Computer Networks'];
    const subjectIds = [];
    for (const sub of subjectsToCreate) {
      const res = await fetch('http://localhost:5000/api/admin/subjects', {
        method: 'POST', headers,
        body: JSON.stringify({ name: sub, class_id: classId })
      });
      const data = await res.json();
      if (data.id) subjectIds.push(data.id);
    }
    console.log(`Created 5 Subjects: ${subjectsToCreate.join(', ')}`);

    // 2. Create 5 Teachers
    const teachers = [];
    for (let i = 1; i <= 5; i++) {
        const t = {
            user_id: `TCH00${i}`,
            name: `Teacher ${i}`,
            email: `teacher${i}@itdept.com`,
            password: `passT${i}`,
            qualification: 'Ph.D.',
            subject_ids: [subjectIds[i - 1]] // Assign one subject per teacher
        };
        await fetch('http://localhost:5000/api/admin/teachers', {
            method: 'POST', headers,
            body: JSON.stringify(t)
        });
        teachers.push({ ID: t.user_id, Password: t.password, Name: t.name });
    }
    console.log("Created 5 Teachers.");

    // 3. Create 10 Students
    const students = [];
    for (let i = 1; i <= 10; i++) {
        const s = {
            user_id: `STU00${i}`,
            name: `Student ${i}`,
            email: `student${i}@itdept.com`,
            password: `passS${i}`,
            class_id: classId,
            roll_number: `10${i}`,
            subject_ids: subjectIds // Enroll in all 5 subjects
        };
        await fetch('http://localhost:5000/api/admin/students', {
            method: 'POST', headers,
            body: JSON.stringify(s)
        });
        students.push({ ID: s.user_id, Password: s.password, Name: s.name });
    }
    console.log("Created 10 Students.");

    // Save credentials to output
    console.log("\n--- CREDENTIALS ---");
    console.log("TEACHERS:");
    console.table(teachers);
    console.log("\nSTUDENTS:");
    console.table(students);
    
  } catch (err) {
    console.error("SEED FAILED:", err);
  }
}

seed();
