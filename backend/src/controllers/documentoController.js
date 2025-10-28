import * as documentoModel from '../models/documento.js';
import pool from '../db/index.js';

// Obtener todos los documentos (no eliminados)
export const getDocumentos = async (req, res) => {
  try {
    const result = await documentoModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

// Obtener documento por ID
export const getDocumentoById = async (req, res) => {
  const { id } = req.params;
  try {
    const documento = await documentoModel.findById(id);
    if (!documento) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(documento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el documento' });
  }
};

// Obtener documento con todas sus relaciones (partes, bien, revision, digitalizacion, archivos)
export const getDocumentoFull = async (req, res) => {
  const { id } = req.params;
  try {
    const documento = await documentoModel.findByIdWithRelations(id);
    if (!documento) return res.status(404).json({ error: 'Documento no encontrado' });

    // Ejecutar consultas en paralelo
    const [partes, bienes, revisiones, digitalizaciones, archivos] = await Promise.all([
      pool.query('SELECT * FROM ParteInvolucrada WHERE DocumentoID = $1 AND Eliminado = FALSE ORDER BY ParteID', [id]),
      // Return all Bien rows for the documento so the client can render multiple propiedades
      pool.query('SELECT * FROM Bien WHERE DocumentoID = $1 AND Eliminado = FALSE ORDER BY BienID', [id]),
      pool.query('SELECT * FROM Revision WHERE DocumentoID = $1 AND Eliminado = FALSE ORDER BY RevisionID DESC LIMIT 1', [id]),
      pool.query('SELECT * FROM Digitalizacion WHERE DocumentoID = $1 AND Eliminado = FALSE ORDER BY DigitalizacionID DESC LIMIT 1', [id]),
      pool.query('SELECT * FROM DocumentoArchivo WHERE DocumentoID = $1 AND Eliminado = FALSE ORDER BY ArchivoID DESC', [id]),
    ]);

    res.json({
      Documento: documento,
      Partes: partes.rows,
      Bien: bienes.rows, // array (may be empty)
      Revision: revisiones.rows[0] || null,
      Digitalizacion: digitalizaciones.rows[0] || null,
      Archivos: archivos.rows,
    });
  } catch (error) {
    console.error('Error en getDocumentoFull', error);
    res.status(500).json({ error: 'Error al obtener documento completo' });
  }
};

// Crear nuevo documento
export const createDocumento = async (req, res) => {
  // Validar JSON y campos requeridos
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const required = ['TipoDocumentoID','FechaEmision','CodigoEstado','CodigoMunicipio','CodigoParroquia'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });
  // Validar que exista al menos oficina ID o texto
  if (!req.body.OficinaRegistroID && !req.body.OficinaRegistroTexto) {
    return res.status(400).json({ error: 'Debe proporcionar OficinaRegistroID o OficinaRegistroTexto' });
  }
  if (req.body.ValorContrato != null && (req.body.MonedaContrato == null || req.body.MonedaContrato === '')) {
    return res.status(400).json({ error: 'Debe indicar MonedaContrato cuando ValorContrato tiene valor' });
  }

  // Generar código tipo CARA+NAG+SJO-### basado en nombres
  const normalize = (s) => s?.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^A-Za-z0-9 ]/g, ' ').trim() || '';
  const take = (s, n) => normalize(s).slice(0, n).toUpperCase().padEnd(n, 'X');
  const estadoAbbr = take(req.body.NombreEstado || req.body.nombreEstado, 4);
  const munAbbr = take(req.body.NombreMunicipio || req.body.nombreMunicipio, 3);
  const parAbbr = take(req.body.NombreParroquia || req.body.nombreParroquia, 3);
  const prefijo = `${estadoAbbr}${munAbbr}${parAbbr}`;
  let correlativo = await documentoModel.nextCodigoForPrefix(prefijo);
  const codigo = `${prefijo}-${String(correlativo).padStart(3, '0')}`;
  req.body.Codigo = req.body.Codigo || codigo;

  try {
    const nueva = await documentoModel.create(req.body);
  res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear documento' });
  }
};

// Actualizar documento
export const updateDocumento = async (req, res) => {
  // Validar JSON y campos requeridos
  if (!req.is('application/json')) return res.status(415).json({ error: 'Content-Type debe ser application/json' });
  const requiredUpdate = ['TipoDocumentoID','FechaEmision','CodigoEstado','CodigoMunicipio','CodigoParroquia'];
  const faltantesUpdate = requiredUpdate.filter(f => req.body[f] == null);
  if (faltantesUpdate.length) return res.status(400).json({ error: `Faltan campos: ${faltantesUpdate.join(', ')}` });
  if (!req.body.OficinaRegistroID && !req.body.OficinaRegistroTexto) {
    return res.status(400).json({ error: 'Debe proporcionar OficinaRegistroID o OficinaRegistroTexto' });
  }
  if (req.body.ValorContrato != null && (req.body.MonedaContrato == null || req.body.MonedaContrato === '')) {
    return res.status(400).json({ error: 'Debe indicar MonedaContrato cuando ValorContrato tiene valor' });
  }
  const { id } = req.params;
  const fields = [
    'TipoDocumentoID', 'OficinaRegistroID', 'FechaEmision', 'FechaOtorgamiento',
    'DatosAsiento', 'CondicionesEspeciales', 'Observaciones', 'ValorContrato',
    'PlazoVigencia', 'CodigoEstado', 'CodigoMunicipio', 'CodigoParroquia',
    'NombreEstado', 'NombreMunicipio', 'NombreParroquia'
  ];
  // 1) Obtener valores actuales
  const oldRow = await documentoModel.findById(id);
  if (!oldRow) return res.status(404).json({ error: 'Documento no encontrado' });

  try {
    // 2) Ejecutar UPDATE con RETURNING
    const newRow = await documentoModel.update(id, req.body);
    if (!newRow) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json({ message: 'Documento actualizado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar documento: ' + error.message });
  }
};

// Eliminar (soft) documento
export const deleteDocumento = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = await documentoModel.softDelete(id);
    if (!eliminado) return res.status(404).json({ error: 'Documento no encontrado' });
    res.json(eliminado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar documento' });
  }
};
