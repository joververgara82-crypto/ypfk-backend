import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// ======================
// Memoria de keys
// ======================
let keys = [];

// ======================
// Generar key
// ======================
app.post('/generate-key', (req, res) => {
  const newKey = {
    id: uuidv4().toUpperCase(), // siempre mayúscula
    used: false,
    active: true
  };
  keys.push(newKey);
  res.json({ success: true, key: newKey });
});

// ======================
// Verificar key (no la consume)
// ======================
app.post('/check-key', (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key.toUpperCase());

  if (!found) {
    return res.json({ success: false, estado: "invalida", message: "Key inválida" });
  }

  if (!found.active) {
    return res.json({ success: false, estado: "revocada", message: "Key revocada o inactiva" });
  }

  if (found.used) {
    return res.json({ success: false, estado: "usada", message: "La clave ya fue usada" });
  }

  res.json({ success: true, estado: "activa", key: found });
});

// ======================
// Usar key (consumirla)
// ======================
app.post('/use-key', (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key.toUpperCase());

  if (!found) {
    return res.json({ success: false, estado: "invalida", message: "Key inválida" });
  }

  if (!found.active) {
    return res.json({ success: false, estado: "revocada", message: "Key revocada o inactiva" });
  }

  if (found.used) {
    return res.json({ success: false, estado: "usada", message: "La clave ya fue usada" });
  }

  found.used = true;
  res.json({ success: true, estado: "usada", message: "Clave consumida", key: found });
});

// ======================
// Revocar una key específica
// ======================
app.post('/revoke-key', (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key.toUpperCase());
  if (found) {
    found.active = false;
    return res.json({ success: true, revokedKey: found });
  }
  res.json({ success: false, message: 'Key no encontrada' });
});

// ======================
// Revocar todas las keys
// ======================
app.post('/revoke-all', (req, res) => {
  keys.forEach(k => k.active = false);
  res.json({ success: true, message: "Todas las keys han sido revocadas" });
});

// ======================
// Reactivar una key específica
// ======================
app.post('/reactivate-key', (req, res) => {
  const { key } = req.body;
  const found = keys.find(k => k.id === key.toUpperCase());

  if (!found) {
    return res.json({ success: false, message: "Key no encontrada" });
  }

  found.active = true;
  found.used = false; // 🔥 reseteo de uso
  res.json({ success: true, reactivatedKey: found });
});

// ======================
// Info de una key
// ======================
app.get('/key/:id', (req, res) => {
  const { id } = req.params;
  const found = keys.find(k => k.id === id.toUpperCase());

  if (!found) {
    return res.status(404).json({ error: "Key no encontrada" });
  }

  res.json({
    key: [{
      tipo: "premium",
      autorizado: (found.active && !found.used) ? "sí" : "no",
      estado: !found.active ? "revocada" : found.used ? "usada" : "activa"
    }]
  });
});

// ======================
// Resetear todas las keys
// ======================
app.post('/reset-keys', (req, res) => {
  keys = [];
  res.json({ success: true, message: "Todas las keys han sido eliminadas" });
});

// ======================
// Iniciar servidor
// ======================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
