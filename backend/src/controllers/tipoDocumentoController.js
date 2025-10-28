import * as tipoDocumentoModel from '../models/tipoDocumento.js';

// Obtener todos los tipos de documento
export const getTiposDocumento = async (req, res) => {
  try {
    const result = await tipoDocumentoModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener tipos de documento' });
  }
};

// Obtener tipo de documento por ID
export const getTipoDocumentoById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await tipoDocumentoModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el tipo de documento' });
  }
};

// Crear nuevo tipo de documento
export const createTipoDocumento = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const nueva = await tipoDocumentoModel.create({ Nombre });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear tipo de documento' });
  }
};

// Actualizar tipo de documento
export const updateTipoDocumento = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const actualizada = await tipoDocumentoModel.update(id, { Nombre });
    if (!actualizada) return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar tipo de documento' });
  }
};

// Eliminar tipo de documento
export const deleteTipoDocumento = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await tipoDocumentoModel.deleteById(id);
    if (!eliminada) return res.status(404).json({ error: 'Tipo de documento no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar tipo de documento' });
  }
};
