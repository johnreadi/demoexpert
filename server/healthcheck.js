const http = require('http');

const options = {
  host: '127.0.0.1',
  port: process.env.PORT || 3000,
  path: '/healthz',
  timeout: 2000,
};

const request = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  // Retry with localhost if 127.0.0.1 fails (sometimes happens in some envs)
  if (options.host === '127.0.0.1') {
      console.log('Retrying with localhost...');
      options.host = 'localhost';
      const retryRequest = http.request(options, (res) => {
        if (res.statusCode === 200) process.exit(0);
        else process.exit(1);
      });
      retryRequest.on('error', (e) => {
        console.error('RETRY ERROR', e);
        process.exit(1);
      });
      retryRequest.end();
      return;
  }
  console.error('ERROR', err);
  process.exit(1);
});

request.end();
