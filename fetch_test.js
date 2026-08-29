const http = require('http');

http.get('http://localhost:3000/api/auth/session', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log('Response body preview (first 500 chars):');
    console.log(data.substring(0, 500));
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
