import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM ParteInvolucrada WHERE Eliminado = FALSE ORDER BY ParteID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM ParteInvolucrada WHERE ParteID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ DocumentoID, TipoParte, NombreParte, DatosIdentificacion }) => {
  const res = await pool.query(
    'INSERT INTO ParteInvolucrada (DocumentoID, TipoParte, NombreParte, DatosIdentificacion) VALUES ($1, $2, $3, $4) RETURNING *',
    [DocumentoID, TipoParte, NombreParte, DatosIdentificacion]
  );
  return res.rows[0];
};

export const update = async (id, { DocumentoID, TipoParte, NombreParte, DatosIdentificacion }) => {
  const res = await pool.query(
    'UPDATE ParteInvolucrada SET DocumentoID=$1, TipoParte=$2, NombreParte=$3, DatosIdentificacion=$4 WHERE ParteID=$5 RETURNING *',
    [DocumentoID, TipoParte, NombreParte, DatosIdentificacion, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE ParteInvolucrada SET Eliminado = TRUE WHERE ParteID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
