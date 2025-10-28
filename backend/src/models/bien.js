import pool from '../db/index.js';

export const findAll = () =>
  pool.query('SELECT * FROM Bien WHERE Eliminado = FALSE ORDER BY BienID');

export const findById = async (id) => {
  const res = await pool.query(
    'SELECT * FROM Bien WHERE BienID = $1 AND Eliminado = FALSE',
    [id]
  );
  return res.rows[0] || null;
};

export const create = async (data) => {
  const {
  DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion,
  MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste,
    Marca, Modelo, Serial, Placa, Activo
  } = data;
  const res = await pool.query(
  `INSERT INTO Bien (DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion, MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste, Marca, Modelo, Serial, Placa, Activo)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18) RETURNING *`,
  [DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion, MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste, Marca, Modelo, Serial, Placa, Activo]
  );
  return res.rows[0];
};

export const update = async (id, data) => {
  const {
  DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion,
  MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste,
    Marca, Modelo, Serial, Placa, Activo
  } = data;
  const res = await pool.query(
  `UPDATE Bien SET DocumentoID=$1, TipoBienID=$2, Descripcion=$3, Caracteristicas=$4, Ubicacion=$5, MetrosFrenteTexto=$6, MetrosFondoTexto=$7, MetrosTerreno=$8, MetrosConstruccion=$9, LinderoNorte=$10, LinderoSur=$11, LinderoEste=$12, LinderoOeste=$13, Marca=$14, Modelo=$15, Serial=$16, Placa=$17, Activo=$18
   WHERE BienID=$19 RETURNING *`,
  [DocumentoID, TipoBienID, Descripcion, Caracteristicas, Ubicacion, MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste, Marca, Modelo, Serial, Placa, Activo, id]
  );
  return res.rows[0] || null;
};

export const softDelete = async (id) => {
  const res = await pool.query(
    'UPDATE Bien SET Eliminado = TRUE WHERE BienID = $1 RETURNING *',
    [id]
  );
  return res.rows[0] || null;
};
