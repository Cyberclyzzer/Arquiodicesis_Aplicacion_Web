import * as digitalizacionModel from '../models/digitalizacion.js';

// Obtener todas las digitalizaciones (no eliminadas)
export const getDigitalizaciones = async (req, res) => {
  try {
    const result = await digitalizacionModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener digitalizaciones' });
  }
};

// Obtener digitalización por ID
export const getDigitalizacionById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await digitalizacionModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Digitalización no encontrada' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la digitalización' });
  }
};

// Crear nueva digitalización
export const createDigitalizacion = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['DocumentoID', 'FechaDigitalizacion'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, UbicacionFisica, Codigo, ResponsablePrefijo, PalabraClave } = req.body;
  // Combine prefijo + numeric identificacion into 'V-12345678' when prefijo present
  const combinedIdent = (ResponsablePrefijo && ResponsablePrefijo.toString().trim()) ? ((ResponsableIdentificacion && String(ResponsableIdentificacion).trim()) ? `${ResponsablePrefijo}-${String(ResponsableIdentificacion).trim()}` : null) : (ResponsableIdentificacion || null);
  try {
  const nueva = await digitalizacionModel.create({ DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion: combinedIdent, UbicacionFisica, Codigo, ResponsablePrefijo, PalabraClave });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear digitalización' });
  }
};

// Actualizar digitalización
export const updateDigitalizacion = async (req, res) => {
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['DocumentoID', 'FechaDigitalizacion'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, UbicacionFisica, Codigo, ResponsablePrefijo, PalabraClave } = req.body;
  const combinedIdentUpd = (ResponsablePrefijo && ResponsablePrefijo.toString().trim()) ? ((ResponsableIdentificacion && String(ResponsableIdentificacion).trim()) ? `${ResponsablePrefijo}-${String(ResponsableIdentificacion).trim()}` : null) : (ResponsableIdentificacion || null);
  try {
  const actualizada = await digitalizacionModel.update(id, { DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion: combinedIdentUpd, UbicacionFisica, Codigo, ResponsablePrefijo, PalabraClave });
    if (!actualizada) return res.status(404).json({ error: 'Digitalización no encontrada' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar digitalización' });
  }
};

// Eliminar (soft) digitalización
export const deleteDigitalizacion = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await digitalizacionModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Digitalización no encontrada' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar digitalización' });
  }
};
