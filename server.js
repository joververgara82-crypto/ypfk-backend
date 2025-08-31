const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔹 Habilitar CORS solo para tu frontend en Netlify
app.use(cors({
  origin: "https://app-yp.netlify.app"
}));

// ======================
// Array para guardar keys
// ======================
let keys = []; // Cada key: { id: "uuid", active: true, createdAt: Date }

// ======================
// Rutas originales
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

// Verificar key (POST)
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

// Listar todas las keys
app.get('/keys', (req, res) => {
  res.json(keys);
});

// ======================
// 🔹 NUEVAS RUTAS (compatibles con tu frontend)
// ======================

// Obtener info de una key (lo que pide tu frontend con axios.get(`${B}/key/${id}`))
app.get('/key/:id', (req, res) => {
  const { id } = req.params;
  const found = keys.find(k => k.id === id);

  if (!found) {
    return res.status(404).json({ error: "Key no encontrada" });
  }

  // Simulamos la estructura que tu frontend espera:
  res.json({
    key: [{
      tipo: "premium",       // 👈 puedes ajustar
      autorizado: found.active ? "sí" : "no",
      estado: found.active ? "activa" : "revocada"
    }]
  });
});

// Actualizar estado de una key (lo que pide tu frontend con PUT /actualizar/:id/1)
app.put('/actualizar/:id/:estado', (req, res) => {
  const { id, estado } = req.params;
  const found = keys.find(k => k.id === id);

  if (!found) {
    return res.status(404).json({ success: false, message: "Key no encontrada" });
  }

  // Si estado === "1" activamos, si es "0" desactivamos
  found.active = (estado === "1");

  res.json({
    success: true,
    key: {
      id: found.id,
      estado: found.active ? "activa" : "revocada"
    }
  });
});

// ======================
// Iniciar servidor
// ======================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
