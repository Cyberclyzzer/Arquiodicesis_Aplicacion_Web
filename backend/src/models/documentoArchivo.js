import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM DocumentoArchivo WHERE Eliminado = FALSE ORDER BY ArchivoID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM DocumentoArchivo WHERE ArchivoID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor }) => {
  const res = await pool.query(
    `INSERT INTO DocumentoArchivo (DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor]
  );
  return res.rows[0];
};

export const update = async (id, { DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor }) => {
  const res = await pool.query(
    `UPDATE DocumentoArchivo
     SET DocumentoID=$1, NombreArchivo=$2, RutaArchivo=$3, TipoArchivo=$4, SubidoPor=$5
     WHERE ArchivoID=$6 RETURNING *`,
    [DocumentoID, NombreArchivo, RutaArchivo, TipoArchivo, SubidoPor, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE DocumentoArchivo SET Eliminado = TRUE WHERE ArchivoID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
