const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

// Middleware para leer JSON en requests
app.use(express.json());

// Base de datos temporal en memoria
let keys = [
  { id: "0C17A56F-2FCF-4650-B528-8FF0A299AC32", active: true }
];

// Ruta para verificar key
app.post("/check-key", (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key && k.active);
  if (found) {
    return res.json({ valid: true });
  }
  res.json({ valid: false });
});

// Ruta para crear key nueva
app.post("/create-key", (req, res) => {
  const { id } = req.body;
  keys.push({ id, active: true });
  res.json({ success: true, keys });
});

// Ruta para revocar una key
app.post("/revoke-key", (req, res) => {
  const { id } = req.body;
  const key = keys.find(k => k.id === id);
  if (key) key.active = false;
  res.json({ success: true, keys });
});

// Ruta para tumbar todas las keys
app.post("/revoke-all", (req, res) => {
  keys = keys.map(k => ({ ...k, active: false }));
  res.json({ success: true, keys });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
