const express = require('express');
const path = require('path');
const app = express();

// Serve the static files from the React Vite build (the 'dist' folder)
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to handle React Router (fixes the "Not Found" refresh error)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Frontend Web Service running on port ${PORT}`);
});
