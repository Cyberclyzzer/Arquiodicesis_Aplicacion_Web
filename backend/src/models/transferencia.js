import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM Transferencia WHERE Eliminado = FALSE ORDER BY TransferenciaID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM Transferencia WHERE TransferenciaID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async ({ BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia }) => {
  const res = await pool.query(
    `INSERT INTO Transferencia (BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia]
  );
  return res.rows[0];
};

export const update = async (id, { BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia }) => {
  const res = await pool.query(
    `UPDATE Transferencia
     SET BienID=$1, DocumentoOrigenID=$2, DocumentoDestinoID=$3, FechaTransferencia=$4
     WHERE TransferenciaID=$5 RETURNING *`,
    [BienID, DocumentoOrigenID, DocumentoDestinoID, FechaTransferencia, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE Transferencia SET Eliminado = TRUE WHERE TransferenciaID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
