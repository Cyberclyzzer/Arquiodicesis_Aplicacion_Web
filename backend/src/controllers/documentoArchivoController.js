import * as documentoArchivoModel from '../models/documentoArchivo.js';

// Obtener todos los archivos de documento (no eliminados)
export const getDocumentoArchivos = async (req, res) => {
  try {
    const result = await documentoArchivoModel.findAll();
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener archivos de documento' });
  }
};

// Obtener archivo por ID
export const getDocumentoArchivoById = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await documentoArchivoModel.findById(id);
    if (!item) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el archivo' });
  }
};

// Crear nuevo archivo de documento
export const createDocumentoArchivo = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF es requerido' });
  const required = ['DocumentoID'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, TipoArchivo, SubidoPor } = req.body;
  const NombreArchivo = req.file.originalname;
  const RutaArchivo = req.file.path;
  try {
    const nueva = await documentoArchivoModel.create({ DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor });
    res.status(201).json(nueva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear archivo de documento' });
  }
};

// Actualizar archivo de documento
export const updateDocumentoArchivo = async (req, res) => {
  // PDF upload optional, fields DocumentoID, TipoArchivo, SubidoPor
  const { id } = req.params;
  const required = ['DocumentoID'];
  const faltantes = required.filter(f => req.body[f] == null);
  if (faltantes.length) return res.status(400).json({ error: `Faltan campos: ${faltantes.join(', ')}` });

  const { DocumentoID, TipoArchivo, SubidoPor } = req.body;
  const NombreArchivo = req.file?.originalname;
  const RutaArchivo = req.file?.path;
  try {
    const actualizada = await documentoArchivoModel.update(id, { DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor });
    if (!actualizada) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.json(actualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar archivo de documento' });
  }
};

// Eliminar (soft) archivo de documento
export const deleteDocumentoArchivo = async (req, res) => {
  const { id } = req.params;
  try {
    const eliminada = await documentoArchivoModel.softDelete(id);
    if (!eliminada) return res.status(404).json({ error: 'Archivo no encontrado' });
    res.json(eliminada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar archivo de documento' });
  }
};
