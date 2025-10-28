import * as parteModel from '../models/parteInvolucrada.js';

// Sanitiza cédula / RIF. Si se proporciona prefijo (V,E,J,G,P) lo conserva,
// si no, devuelve solo los dígitos (permitimos identificaciones sin prefijo).
const sanitizeCedula = (raw, prefijo = '') => {
  if (typeof raw !== 'string') return raw;
  const p = (prefijo || '').toUpperCase();
  const allowed = ['V','E','J','G','P'];
  let s = raw.trim();
  // remover cualquier prefijo existente (letras + guiones/espacios)
  s = s.replace(/^[A-Za-z]\s*-?\s*/, '');
  const digits = s.replace(/\D/g, '').slice(0,15);
  if (allowed.includes(p) && p !== '') return `${p}-${digits}`;
  // si no se proporcionó prefijo, devolver solo los dígitos
  return digits;
};

// Validar aceptación: permitir tanto con prefijo (V-123) como sin prefijo (123)
const validateCedulaAgainstCheck = (ced) => /^(?:[VEJGP]-\d{1,15}|\d{1,15})$/.test(ced);

// Obtener todas las partes involucradas (no eliminadas)
export const getPartes = async (req, res) => {
  try {
    const result = await parteModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener partes involucradas' });
  }
};

// Obtener parte por ID
export const getParteById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await parteModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Parte no encontrada' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la parte' });
  }
};

// Crear nueva parte involucrada
export const createParte = async (req, res) => {
  // Validar JSON y campos requeridos
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['DocumentoID', 'TipoParte', 'NombreParte'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  let { DocumentoID, TipoParte, NombreParte, DatosIdentificacion, Prefijo } = req.body;
  if (DatosIdentificacion) {
    DatosIdentificacion = sanitizeCedula(DatosIdentificacion, Prefijo);
    if (!validateCedulaAgainstCheck(DatosIdentificacion)) {
      return res.status(400).json({ error: 'Formato inválido. Use Prefijo- + 1 a 15 dígitos (ej: V-1, E-123456)' });
    }
  } else {
    DatosIdentificacion = null; // permitir vacío
  }
  try {
    const nueva = await parteModel.create({ DocumentoID, TipoParte, NombreParte, DatosIdentificacion });
    res.status(201).json(nueva);
  } catch (error) {
  console.error('Error creando parte involucrada:', { message: error?.message, code: error?.code, detail: error?.detail, stack: error?.stack });
    if (error?.code === '23503') {
      return res.status(400).json({ error: 'DocumentoID no existe (FK)', detail: error.detail });
    }
    if (error?.code === '23505') {
      return res.status(409).json({ error: 'Registro duplicado (constraint UNIQUE)', detail: error.detail });
    }
    if (error?.code === '23502') {
      return res.status(400).json({ error: 'Violación NOT NULL en columna', detail: error.detail });
    }
  res.status(500).json({ error: 'Error al crear parte involucrada', code: error?.code, message: error?.message, detail: error?.detail });
  }
};

// Actualizar parte involucrada
export const updateParte = async (req, res) => {
  // Validar JSON y campos requeridos
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const { id } = req.params;
  const required = ['DocumentoID', 'TipoParte', 'NombreParte'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  let { DocumentoID, TipoParte, NombreParte, DatosIdentificacion, Prefijo } = req.body;
  if (DatosIdentificacion) {
    DatosIdentificacion = sanitizeCedula(DatosIdentificacion, Prefijo);
    if (!validateCedulaAgainstCheck(DatosIdentificacion)) {
      return res.status(400).json({ error: 'Formato inválido. Use Prefijo- + 1 a 15 dígitos (ej: V-123, E-987654)' });
    }
  } else {
    DatosIdentificacion = null;
  }
  try {
    const actualizada = await parteModel.update(id, { DocumentoID, TipoParte, NombreParte, DatosIdentificacion });
    if (!actualizada) return res.status(404).json({ error: 'Parte no encontrada' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar parte involucrada' });
  }
};

// Eliminar (soft) parte involucrada
export const deleteParte = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await parteModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Parte no encontrada' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar parte involucrada' });
  }
};
