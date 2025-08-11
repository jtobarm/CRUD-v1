const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

// Servir la carpeta "public"
app.use(express.static('public'));

// Conexión a SQLite
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error(err.message);
  console.log('✅ Conectado a SQLite');
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  age INTEGER NOT NULL
)`);

// Rutas CRUD
app.get('/users', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  db.run('INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
    [name, email, age],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuario creado', id: this.lastID });
    });
});

app.put('/users/:id', (req, res) => {
  const { name, email, age } = req.body;
  const { id } = req.params;
  db.run('UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
    [name, email, age, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuario actualizado' });
    });
});

app.delete('/users/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM users WHERE id = ?', id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuario eliminado' });
  });
});

// Servir index.html si acceden a "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:3000');
});
