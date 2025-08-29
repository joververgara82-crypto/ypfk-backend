const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Array para guardar keys en memoria con historial
let keys = []; // Cada key: { id: "uuid", active: true, createdAt: Date }

// ======================
// Rutas
// ======================

// Generar nueva key automáticamente
app.post('/generate-key', (req, res) => {
  const newKey = {
    id: uuidv4(),
    active: true,
    createdAt: new Date()
  };
  keys.push(newKey);
  res.json({ success: true, key: newKey });
});

// Verificar key
app.post('/check-key', (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key && k.active);
  res.json({ valid: !!found });
});

// Revocar una key específica
app.post('/revoke-key', (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key);
  if (found) {
    found.active = false;
    return res.json({ success: true, revokedKey: found });
  }
  res.json({ success: false, message: 'Key no encontrada' });
});

// Revocar todas las keys activas
app.post('/revoke-all', (req, res) => {
  keys = keys.map(k => ({ ...k, active: false }));
  res.json({ success: true, message: 'Todas las keys revocadas' });
});

// Listar todas las keys (opcional, útil para debugging)
app.get('/keys', (req, res) => {
  res.json(keys);
});

// ======================
// Iniciar servidor
// ======================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
