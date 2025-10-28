import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM HistorialCambios WHERE Eliminado = FALSE ORDER BY HistorialID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM HistorialCambios WHERE HistorialID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo }) => {
  const res = await pool.query(
    `INSERT INTO HistorialCambios (DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo]
  );
  return res.rows[0];
};

export const update = async (id, { DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo }) => {
  const res = await pool.query(
    `UPDATE HistorialCambios
     SET DocumentoID=$1, UsuarioID=$2, CampoModificado=$3, ValorAnterior=$4, ValorNuevo=$5
     WHERE HistorialID=$6 RETURNING *`,
    [DocumentoID, UsuarioID, CampoModificado, ValorAnterior, ValorNuevo, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE HistorialCambios SET Eliminado = TRUE WHERE HistorialID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
