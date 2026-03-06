const http = require('http');
const port = process.env.PORT || 3000;

console.log(`Fallback server starting on port ${port}`);

const server = http.createServer((req, res) => {
    console.log(`Fallback request: ${req.method} ${req.url}`);
    
    // Handle CORS
    const origin = req.headers.origin || '*';
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
    };

    if (req.method === 'OPTIONS') {
        res.writeHead(204, headers);
        res.end();
        return;
    }

    // Health check endpoints - return 200 so Traefik keeps routing traffic
    if (req.url === '/healthz' || req.url === '/api/healthz' || req.url === '/api/db/health') {
        res.writeHead(200, headers);
        res.end(JSON.stringify({ status: 'fallback-mode', ok: true }));
        return;
    }
    
    res.writeHead(503, headers);
    
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
