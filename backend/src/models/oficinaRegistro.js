import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM OficinaRegistro ORDER BY Nombre');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM OficinaRegistro WHERE OficinaRegistroID = $1',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ Nombre }) => {
  const res = await pool.query(
    'INSERT INTO OficinaRegistro (Nombre) VALUES ($1) RETURNING *',
    [Nombre]
  );
  return res.rows[0];
};

export const update = async (id, { Nombre }) => {
  const res = await pool.query(
    'UPDATE OficinaRegistro SET Nombre = $1 WHERE OficinaRegistroID = $2 RETURNING *',
    [Nombre, id]
  );
  return res.rows[0] || null;
};

export const deleteById = async (id) => {
  const res = await pool.query(
    'DELETE FROM OficinaRegistro WHERE OficinaRegistroID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
