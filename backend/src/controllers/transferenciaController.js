import * as transferenciaModel from '../models/transferencia.js';

// Obtener todas las transferencias (no eliminados)
export const getTransferencias = async (req, res) => {
  try {
    const result = await transferenciaModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener transferencias' });
  }
};

// Obtener transferencia por ID
export const getTransferenciaById = async (req, res) => {
  const { id } = req.params;
  try {
    const transferencia = await transferenciaModel.findById(id);
    if (!transferencia) return res.status(404).json({ error: 'Transferencia no encontrada' });
    res.json(transferencia);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la transferencia' });
  }
};

// Crear nueva transferencia
export const createTransferencia = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['BienID', 'DocumentoOrigenID', 'DocumentoDestinoID', 'FechaTransferencia'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia } = req.body;
  try {
    const nueva = await transferenciaModel.create({ BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear transferencia' });
  }
};

// Actualizar transferencia
export const updateTransferencia = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['BienID', 'DocumentoOrigenID', 'DocumentoDestinoID', 'FechaTransferencia'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia } = req.body;
  try {
    const actualizada = await transferenciaModel.update(id, { BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia });
    if (!actualizada) return res.status(404).json({ error: 'Transferencia no encontrada' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar transferencia' });
  }
};

// Eliminar (soft) transferencia
export const deleteTransferencia = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await transferenciaModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Transferencia no encontrada' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar transferencia' });
  }
};
