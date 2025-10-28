import * as revisionModel from '../models/revision.js';

// Obtener todas las revisiones (no eliminadas)
export const getRevisiones = async (req, res) => {
  try {
    const result = await revisionModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener revisiones' });
  }
};

// Obtener revisión por ID
export const getRevisionById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await revisionModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Revisión no encontrada' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la revisión' });
  }
};

// Crear nueva revisión
export const createRevision = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['DocumentoID', 'FechaRevision'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo } = req.body;
  // If a prefijo was provided, combine it with the numeric cedula to store as 'V-12345678'
  const combinedCedula = (ResponsablePrefijo && ResponsablePrefijo.toString().trim()) ? ((ResponsableCedula && String(ResponsableCedula).trim()) ? `${ResponsablePrefijo}-${String(ResponsableCedula).trim()}` : null) : (ResponsableCedula || null);
  try {
    const nueva = await revisionModel.create({ DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula: combinedCedula, ResponsablePrefijo });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear revisión' });
  }
};

// Actualizar revisión
export const updateRevision = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['DocumentoID', 'FechaRevision'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo } = req.body;
  const combinedCedulaUpd = (ResponsablePrefijo && ResponsablePrefijo.toString().trim()) ? ((ResponsableCedula && String(ResponsableCedula).trim()) ? `${ResponsablePrefijo}-${String(ResponsableCedula).trim()}` : null) : (ResponsableCedula || null);
  try {
    const actualizada = await revisionModel.update(id, { DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula: combinedCedulaUpd, ResponsablePrefijo });
    if (!actualizada) return res.status(404).json({ error: 'Revisión no encontrada' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar revisión' });
  }
};

// Eliminar (soft) revisión
export const deleteRevision = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await revisionModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Revisión no encontrada' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar revisión' });
  }
};
