import * as rolModel from '../models/rol.js';

// Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const result = await rolModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

// Obtener un rol por ID
export const getRolById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await rolModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el rol' });
  }
};

// Crear un nuevo rol
export const createRol = async (req, res) => {
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const nueva = await rolModel.create({ Nombre });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear rol' });
  }
};

// Actualizar un rol
export const updateRol = async (req, res) => {
  const { id } = req.params;
  const { Nombre } = req.body;
  if (!Nombre) return res.status(400).json({ error: 'Nombre es requerido' });
  try {
    const actualizada = await rolModel.update(id, { Nombre });
    if (!actualizada) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar rol' });
  }
};

// Eliminar un rol
export const deleteRol = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await rolModel.deleteById(id);
    if (!eliminada) return res.status(404).json({ error: 'Rol no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar rol' });
  }
};
