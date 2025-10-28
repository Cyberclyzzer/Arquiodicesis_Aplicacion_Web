import * as historialCambiosModel from '../models/historialCambios.js';

// Obtener todos los registros de historial de cambios (no eliminados)
export const getHistorialCambios = async (req, res) => {
  try {
    const result = await historialCambiosModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener historial de cambios' });
  }
};

// Obtener un registro de historial por ID
export const getHistorialCambioById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await historialCambiosModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el registro' });
  }
};

// Crear nuevo registro de historial de cambios
export const createHistorialCambio = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['DocumentoID', 'UsuarioID', 'CampoModificado', 'ValorAnterior', 'ValorNuevo'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo } = req.body;
  try {
    const nueva = await historialCambiosModel.create({ DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear registro de historial' });
  }
};

// Actualizar un registro de historial de cambios
export const updateHistorialCambio = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['DocumentoID', 'UsuarioID', 'CampoModificado', 'ValorAnterior', 'ValorNuevo'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo } = req.body;
  try {
    const actualizada = await historialCambiosModel.update(id, { DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo });
    if (!actualizada) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar registro de historial' });
  }
};

// Eliminar (soft) un registro de historial de cambios
export const deleteHistorialCambio = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await historialCambiosModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Registro no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar registro de historial' });
  }
};
