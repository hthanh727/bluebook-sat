const http = require('http');

async function test() {
    try {
        const res = await fetch('http://localhost:3000/api/me');
        const text = await res.text();
        console.log('Status:', res.status);
        console.log('Response Body:', text.substring(0, 200));
    } catch (e) {
        console.error(e);
    }
}
test();
