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
let keys = [];
// Cada key: { id: "uuid", active: true, used: false, createdAt: Date }

// ======================
// Generar nueva key
// ======================
app.post('/generate-key', (req, res) => {
  const newKey = {
    id: uuidv4().toUpperCase(), // ✅ ahora la key se genera en mayúscula
    active: true,
    used: false,
    createdAt: new Date()
  };
  keys.push(newKey);
  res.json({ success: true, key: newKey });
});

// ======================
// Verificar y usar key (login)
// ======================
app.post('/check-key', (req, res) => {
  const { key } = req.body;
  if (!key) return res.json({ success: false, estado: "invalida", message: "Key vacía" });

  const upperKey = key.toUpperCase(); // ✅ leer la key en mayúscula
  const found = keys.find(k => k.id === upperKey);

  if (!found) {
    return res.json({ success: false, estado: "invalida", message: "Key inválida" });
  }

  if (!found.active) {
    return res.json({ success: false, estado: "revocada", message: "Key revocada o inactiva" });
  }

  if (found.used) {
    return res.json({ success: false, estado: "usada", message: "La clave ya ha sido utilizada" });
  }

  // ✅ Primera vez que se usa
  found.used = true;
  res.json({ success: true, estado: "activa", message: "Login exitoso", key: found });
});

// ======================
// Revocar una key específica
// ======================
app.post('/revoke-key', (req, res) => {
  const { key } = req.body;
  const upperKey = key.toUpperCase();
  const found = keys.find(k => k.id === upperKey);
  if (found) {
    found.active = false;
    return res.json({ success: true, revokedKey: found });
  }
  res.json({ success: false, message: 'Key no encontrada' });
});

// ======================
// Reactivar una key específica
// ======================
app.post('/reactivate-key', (req, res) => {
  const { key } = req.body;
  const upperKey = key.toUpperCase();
  const found = keys.find(k => k.id === upperKey);

  if (!found) return res.json({ success: false, message: "Key no encontrada" });

  found.active = true;
  found.used = false; // ✅ se resetea el uso
  res.json({ success: true, reactivatedKey: found });
});

// ======================
// Revocar todas las keys activas
// ======================
app.post('/revoke-all', (req, res) => {
  keys = keys.map(k => ({ ...k, active: false }));
  res.json({ success: true, message: 'Todas las keys revocadas' });
});

// ======================
// Listar todas las keys
// ======================
app.get('/keys', (req, res) => {
  res.json(keys);
});

// ======================
// Info de una key
// ======================
app.get('/key/:id', (req, res) => {
  const id = req.params.id.toUpperCase(); // ✅ lectura en mayúscula
  const found = keys.find(k => k.id === id);

  if (!found) return res.status(404).json({ error: "Key no encontrada" });

  res.json({
    key: [{
      tipo: "premium",
      autorizado: (found.active && !found.used) ? "sí" : "no",
      estado: !found.active ? "revocada" : found.used ? "usada" : "activa"
    }]
  });
});

// ======================
// Actualizar estado de key (compatibilidad frontend)
// ======================
app.put('/actualizar/:id/:estado', (req, res) => {
  const id = req.params.id.toUpperCase();
  const estado = req.params.estado;
  const found = keys.find(k => k.id === id);

  if (!found) return res.status(404).json({ success: false, message: "Key no encontrada" });

  found.active = (estado === "1");
  if (found.active) found.used = false;

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
