// Test script for RAG chatbot
const http = require('http');

async function testChatbot() {
  const data = JSON.stringify({
    message: 'What are my assignments?',
    userRole: 'student',
    userName: 'Test Student',
    userEmail: 'test@example.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/chatbot',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let responseData = '';
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(responseData);
        console.log('Response:', jsonData);
      } catch (e) {
        console.error('Error parsing response:', responseData);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error:', error.message);
  });

  req.write(data);
  req.end();
}

testChatbot();