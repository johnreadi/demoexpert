const http = require('http');
const port = process.env.PORT || 3000;

console.log(`Fallback server starting on port ${port}`);

const server = http.createServer((req, res) => {
    console.log(`Fallback request: ${req.method} ${req.url}`);
    
    // Handle CORS
    const origin = req.headers.origin || '*';
    
    res.writeHead(503, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true'
    });
    
    res.end(JSON.stringify({
        error: 'backend_crashed',
        status: 503,
        message: 'The backend application failed to start. Please check the container logs for details.',
        timestamp: new Date().toISOString()
    }));
});

server.listen(port, '0.0.0.0', () => {
    console.log(`Fallback server listening on ${port}`);
});
