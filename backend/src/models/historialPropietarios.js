import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM HistorialPropietarios WHERE Eliminado = FALSE ORDER BY HistorialID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM HistorialPropietarios WHERE HistorialID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ BienID, ParteID, DocumentoID, FechaRegistro }) => {
  const res = await pool.query(
    `INSERT INTO HistorialPropietarios (BienID, ParteID, DocumentoID, FechaRegistro)
     VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE)) RETURNING *`,
    [BienID, ParteID, DocumentoID, FechaRegistro]
  );
  return res.rows[0];
};

export const update = async (id, { BienID, ParteID, DocumentoID, FechaRegistro }) => {
  const res = await pool.query(
    `UPDATE HistorialPropietarios
     SET BienID = $1, ParteID = $2, DocumentoID = $3, FechaRegistro = COALESCE($4, FechaRegistro)
     WHERE HistorialID = $5 RETURNING *`,
    [BienID, ParteID, DocumentoID, FechaRegistro, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE HistorialPropietarios SET Eliminado = TRUE WHERE HistorialID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
