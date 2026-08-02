const http = require('http');

async function test() {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'hocsinh1@gmail.com', password: '123456' })
        });
        const loginData = await loginRes.json();
        console.log('Login Response:', loginData);
        
        if (!loginData.token) return;

        // 2. Get /api/me
        const meRes = await fetch('http://localhost:3000/api/me', {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        const meData = await meRes.json();
        console.log('Me Response:', meData);
    } catch (e) {
        console.error(e);
    }
}
test();
