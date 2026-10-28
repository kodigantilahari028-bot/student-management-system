const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');
const students = [];
let nextId = 1;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8'
};

const server = http.createServer((req, res) => {
  if (req.url === '/api/students' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(students));
  }

  if (req.url === '/api/students' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const name = String(data.name || '').trim();
        const course = String(data.course || '').trim();
        const age = Number(data.age);

        if (!name || !course || !Number.isInteger(age) || age < 1 || age > 120) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Enter a name, course, and valid age.' }));
        }

        const student = { id: nextId++, name, age, course };
        students.push(student);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(student));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request.' }));
      }
    });
    return;
  }

  const match = req.url.match(/^\\/api\\/students\\/(\\d+)$/);
  if (match && req.method === 'DELETE') {
    const index = students.findIndex(s => s.id === Number(match[1]));
    if (index === -1) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Student not found.' }));
    }
    students.splice(index, 1);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true }));
  }

  const pathname = req.url === '/' ? '/index.html' : decodeURIComponent(req.url.split('?')[0]);
  const filePath = path.resolve(publicDir, '.' + pathname);

  if (!filePath.startsWith(publicDir + path.sep)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('File not found');
    }
    res.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream'
    });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Student Management System running at http://localhost:${PORT}`);
});