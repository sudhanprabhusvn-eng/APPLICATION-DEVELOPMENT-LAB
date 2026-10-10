require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Note = require('./models/Note');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Middleware for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// READ: all notes, optional search (?q=word)
app.get('/api/notes', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q
      ? { $or: [
          { title:   { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } }
        ] }
      : {};
    res.json(await Note.find(filter).sort({ createdAt: -1 }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// READ: single note by ID
app.get('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// CREATE
app.post('/api/notes', async (req, res) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// UPDATE
app.put('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// DELETE
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json({ message: 'Note deleted', id: req.params.id });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/notesdb';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully to', MONGO_URI);
    app.listen(PORT, () =>
      console.log(`Server running at http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    // Still start server so frontend can display error/status
    app.listen(PORT, () =>
      console.log(`Server running with DB error at http://localhost:${PORT}`));
  });
