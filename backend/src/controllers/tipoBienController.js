import * as tipoBienModel from '../models/tipoBien.js';

// Obtener todos los tipos de bien
export const getTiposBien = async (req, res) => {
  try {
    const result = await tipoBienModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tipos de bien' });
  }
};

// Obtener tipo de bien por ID
export const getTipoBienById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await tipoBienModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Tipo de bien no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el tipo de bien' });
  }
};

// Crear nuevo tipo de bien
export const createTipoBien = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const nueva = await tipoBienModel.create({ Nombre });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear tipo de bien' });
  }
};

// Actualizar tipo de bien
export const updateTipoBien = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const actualizada = await tipoBienModel.update(id, { Nombre });
    if (!actualizada) return res.status(404).json({ error: 'Tipo de bien no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar tipo de bien' });
  }
};

// Eliminar tipo de bien
export const deleteTipoBien = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await tipoBienModel.deleteById(id);
    if (!eliminada) return res.status(404).json({ error: 'Tipo de bien no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar tipo de bien' });
  }
};
