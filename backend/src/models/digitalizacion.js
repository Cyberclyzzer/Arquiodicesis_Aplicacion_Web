import pool from '../db/index.js';

export const findAll = async () => {
  return pool.query(
    'SELECT * FROM Digitalizacion WHERE Eliminado = FALSE ORDER BY DigitalizacionID'
  );
};

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM Digitalizacion WHERE DigitalizacionID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, UbicacionFisica, Codigo, ResponsablePrefijo, PalabraClave }) => {
  const res = await pool.query(
  `INSERT INTO Digitalizacion (DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, ResponsablePrefijo, UbicacionFisica, Codigo, PalabraClave)
   VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
  [DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, ResponsablePrefijo, UbicacionFisica, Codigo, PalabraClave]
  );
  return res.rows[0];
};

export const update = async (id, { DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, UbicacionFisica, Codigo, ResponsablePrefijo, PalabraClave }) => {
  const res = await pool.query(
    `UPDATE Digitalizacion
   SET DocumentoID = $1, FechaDigitalizacion = $2, ResponsableNombre = $3, ResponsableIdentificacion = $4, ResponsablePrefijo = $5, UbicacionFisica = $6, Codigo = $7, PalabraClave = $8
   WHERE DigitalizacionID = $9 RETURNING *`,
  [DocumentoID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, ResponsablePrefijo, UbicacionFisica, Codigo, PalabraClave, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE Digitalizacion SET Eliminado = TRUE WHERE DigitalizacionID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
