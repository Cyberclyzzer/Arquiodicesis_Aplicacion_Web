import * as oficinaRegistroModel from '../models/oficinaRegistro.js';

// Obtener todas las oficinas de registro
export const getOficinasRegistro = async (req, res) => {
  try {
    const result = await oficinaRegistroModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener oficinas de registro' });
  }
};

// Obtener oficina de registro por ID
export const getOficinaRegistroById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await oficinaRegistroModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Oficina de registro no encontrada' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la oficina de registro' });
  }
};

// Crear nueva oficina de registro
export const createOficinaRegistro = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const nueva = await oficinaRegistroModel.create({ Nombre });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear oficina de registro' });
  }
};

// Actualizar oficina de registro
export const updateOficinaRegistro = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const actualizada = await oficinaRegistroModel.update(id, { Nombre });
    if (!actualizada) return res.status(404).json({ error: 'Oficina de registro no encontrada' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar oficina de registro' });
  }
};

// Eliminar oficina de registro
export const deleteOficinaRegistro = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await oficinaRegistroModel.deleteById(id);
    if (!eliminada) return res.status(404).json({ error: 'Oficina de registro no encontrada' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar oficina de registro' });
  }
};
