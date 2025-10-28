import * as historialPropietariosModel from '../models/historialPropietarios.js';

// Obtener todos los registros de historial de propietarios (no eliminados)
export const getHistorialPropietarios = async (req, res) => {
  try {
    const result = await historialPropietariosModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial de propietarios' });
  }
};

// Obtener registro de historial por ID
export const getHistorialPropietarioById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await historialPropietariosModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el registro' });
  }
};

// Crear nuevo registro de historial de propietarios
export const createHistorialPropietario = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['BienID', 'ParteID', 'DocumentoID'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { BienID, ParteID, DocumentoID, FechaRegistro } = req.body;
  try {
    const nueva = await historialPropietariosModel.create({ BienID, ParteID, DocumentoID, FechaRegistro });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear registro de historial de propietarios' });
  }
};

// Actualizar registro de historial de propietarios
export const updateHistorialPropietario = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['BienID', 'ParteID', 'DocumentoID'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { BienID, ParteID, DocumentoID, FechaRegistro } = req.body;
  try {
    const actualizada = await historialPropietariosModel.update(id, { BienID, ParteID, DocumentoID, FechaRegistro });
    if (!actualizada) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar registro de historial de propietarios' });
  }
};

// Eliminar (soft) registro de historial de propietarios
export const deleteHistorialPropietario = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await historialPropietariosModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar registro de historial de propietarios' });
  }
};
