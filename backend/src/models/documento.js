import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM Documento WHERE Eliminado = FALSE ORDER BY FechaEmision DESC');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM Documento WHERE DocumentoID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const findByIdWithRelations = async (id) => {
  const res = await pool.query(
    `SELECT d.*, td.nombre as "TipoDocumentoNombre"
     FROM Documento d
     LEFT JOIN TipoDocumento td ON d.TipoDocumentoID = td.TipoDocumentoID
     WHERE d.DocumentoID = $1 AND d.Eliminado = FALSE`,
    [id]
  );
  return res.rows[0] || null;
};

export const create = async (data) => {
  const fields = [
  'TipoDocumentoID','OficinaRegistroID','OficinaRegistroTexto','FechaEmision','FechaOtorgamiento',
  'TipoDocumentoOtro','DatosAsiento','CondicionesEspeciales','Observaciones','ValorContrato','MonedaContrato',
  'PlazoVigencia','Codigo','CodigoEstado','CodigoMunicipio','CodigoParroquia',
    'NombreEstado','NombreMunicipio','NombreParroquia'
  ];
  const values = fields.map(f => data[f]);
  const placeholders = fields.map((_, i) => `$${i + 1}`).join(', ');
  const res = await pool.query(
    `INSERT INTO Documento (${fields.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    values
  );
  return res.rows[0];
};

export const update = async (id, data) => {
  const fields = [
  'TipoDocumentoID','OficinaRegistroID','OficinaRegistroTexto','FechaEmision','FechaOtorgamiento',
  'TipoDocumentoOtro','DatosAsiento','CondicionesEspeciales','Observaciones','ValorContrato','MonedaContrato',
  'PlazoVigencia','Codigo','CodigoEstado','CodigoMunicipio','CodigoParroquia',
    'NombreEstado','NombreMunicipio','NombreParroquia'
  ];
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = fields.map(f => data[f]);
  values.push(id);
  const res = await pool.query(
    `UPDATE Documento SET ${setClause} WHERE DocumentoID = $${fields.length + 1} RETURNING *`,
    values
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE Documento SET Eliminado = TRUE WHERE DocumentoID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};

// Obtiene el siguiente número secuencial para un prefijo (thread-safe con UPSERT)
export const nextCodigoForPrefix = async (prefijo) => {
  const res = await pool.query(
    `INSERT INTO CodigoSecuencia (Prefijo, UltimoNumero)
     VALUES ($1, 1)
     ON CONFLICT (Prefijo)
     DO UPDATE SET UltimoNumero = CodigoSecuencia.UltimoNumero + 1
     RETURNING UltimoNumero`,
    [prefijo]
  );
  return res.rows[0]?.ultimonumero || 1;
};