const express = require('express');
const path = require('path');

const app = express();

// Serve static files (HTML, CSS, JS, images) from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Optional routes (clean URLs without .html)
app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).send('<h1>404 - Page Not Found</h1>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
