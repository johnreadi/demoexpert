require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const apiRoutes = require('./api');

const app = express();
// The port will be provided by the environment (Dokploy/Docker), with a fallback for local dev.
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for potential base64 image uploads
app.use(express.urlencoded({ extended: true }));

// All API routes are prefixed with /api
app.use('/api', apiRoutes);

// Serve the static files from the React app build
// The 'public' directory will contain the output of 'npm run build' from the frontend
app.use(express.static(path.join(__dirname, 'public')));

// The "catchall" handler: for any request that doesn't match an API route
// or a static file, send back the React app's index.html file.
// This allows React Router to handle client-side navigation.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
