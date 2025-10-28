import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM Revision WHERE Eliminado = FALSE ORDER BY RevisionID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM Revision WHERE RevisionID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo }) => {
  const res = await pool.query(
  `INSERT INTO Revision (DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo)
   VALUES ($1, $2, $3, $4, $5) RETURNING *`,
  [DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo]
  );
  return res.rows[0];
};

export const update = async (id, { DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo }) => {
  const res = await pool.query(
    `UPDATE Revision
   SET DocumentoID = $1, FechaRevision = $2, ResponsableNombre = $3, ResponsableCedula = $4, ResponsablePrefijo = $5
   WHERE RevisionID = $6 RETURNING *`,
  [DocumentoID, FechaRevision, ResponsableNombre, ResponsableCedula, ResponsablePrefijo, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE Revision SET Eliminado = TRUE WHERE RevisionID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
