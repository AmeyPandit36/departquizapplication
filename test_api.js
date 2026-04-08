async function test() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: 'ADMIN001', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    
    const res = await fetch('http://localhost:5000/api/admin/students', {
      method: 'GET',
      headers: { Authorization: `Bearer ${loginData.token}` }
    });
    
    const data = await res.json();
    console.log("Students API returned:", data);
  } catch (err) {
    console.error("FAILED FETCH:", err);
  }
}
test();
