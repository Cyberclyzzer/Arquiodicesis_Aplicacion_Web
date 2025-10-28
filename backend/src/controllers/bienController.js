import * as bienModel from '../models/bien.js';

// Obtener todos los bienes (no eliminados)
export const getBienes = async (req, res) => {
  try {
    const result = await bienModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener bienes' });
  }
};

// Obtener bien por ID
export const getBienById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await bienModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Bien no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el bien' });
  }
};

// Crear nuevo bien
export const createBien = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['DocumentoID', 'TipoBienID'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const {
  DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion,
  MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste,
  Marca, Modelo, Serial, Placa, Activo
  } = req.body;

  try {
    const nueva = await bienModel.create({ DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion,
      MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste, Marca, Modelo, Serial, Placa, Activo });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear bien' });
  }
};

// Actualizar bien
export const updateBien = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['DocumentoID', 'TipoBienID'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const {
  DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion,
  MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste,
  Marca, Modelo, Serial, Placa, Activo
  } = req.body;

  try {
    const actualizada = await bienModel.update(id, { DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion,
      MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste, Marca, Modelo, Serial, Placa, Activo });
    if (!actualizada) return res.status(404).json({ error: 'Bien no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar bien' });
  }
};

// Eliminar (soft) bien
export const deleteBien = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await bienModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Bien no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar bien' });
  }
};
