import pool from './index.js';

const initDb = async () => {
  const sql = `
BEGIN;

CREATE TABLE IF NOT EXISTS Rol (
  RolID SERIAL PRIMARY KEY,
  Nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS TipoDocumento (
  TipoDocumentoID SERIAL PRIMARY KEY,
  Nombre VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS OficinaRegistro (
  OficinaRegistroID SERIAL PRIMARY KEY,
  Nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS TipoBien (
  TipoBienID SERIAL PRIMARY KEY,
  Nombre VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Documento (
  DocumentoID SERIAL PRIMARY KEY,
  TipoDocumentoID INT REFERENCES TipoDocumento(TipoDocumentoID),
  OficinaRegistroID INT REFERENCES OficinaRegistro(OficinaRegistroID),
  OficinaRegistroTexto VARCHAR(150),
  FechaEmision DATE NOT NULL,
  FechaOtorgamiento DATE,
  TipoDocumentoOtro TEXT,
  DatosAsiento TEXT,
  CondicionesEspeciales TEXT,
  Observaciones TEXT,
  ValorContrato DECIMAL(15,2),
  MonedaContrato VARCHAR(100),
  PlazoVigencia VARCHAR(200),
  Codigo VARCHAR(50) UNIQUE,
  CodigoEstado VARCHAR(100) NOT NULL,
  CodigoMunicipio VARCHAR(100) NOT NULL,
  CodigoParroquia VARCHAR(100) NOT NULL,
  NombreEstado VARCHAR(100),
  NombreMunicipio VARCHAR(100),
  NombreParroquia VARCHAR(100),
  Eliminado BOOLEAN DEFAULT FALSE
);
CREATE INDEX IF NOT EXISTS IDX_Ubicacion ON Documento(CodigoEstado, CodigoMunicipio, CodigoParroquia);

CREATE TABLE IF NOT EXISTS ParteInvolucrada (
  ParteID SERIAL PRIMARY KEY,
  DocumentoID INT REFERENCES Documento(DocumentoID) NOT NULL,
  TipoParte VARCHAR(30) NOT NULL CHECK (TipoParte IN ('Otorgante', 'Receptor', 'Abogado', 'AbogadoOtorgante', 'AbogadoReceptor')),
  NombreParte VARCHAR(100) NOT NULL,
  DatosIdentificacion TEXT,
  Eliminado BOOLEAN DEFAULT FALSE,
  -- Cedula / RIF con prefijos permitidos V,E,J,G,P y 1-15 dígitos
  CONSTRAINT parteinvolucrada_cedula_chk CHECK (DatosIdentificacion IS NULL OR DatosIdentificacion = '' OR DatosIdentificacion ~ '^(?:[VEJGP]-)?[0-9]{1,15}$'),
  CONSTRAINT parteinvolucrada_doc_rol_unique UNIQUE (DocumentoID, TipoParte)
);

CREATE TABLE IF NOT EXISTS Bien (
  BienID SERIAL PRIMARY KEY,
  DocumentoID INT REFERENCES Documento(DocumentoID),
  TipoBienID INT REFERENCES TipoBien(TipoBienID),
  Descripcion TEXT,
  Caracteristicas TEXT,
  Ubicacion TEXT,
  MetrosFrenteTexto TEXT,
  MetrosFondoTexto TEXT,
  MetrosTerreno DECIMAL(10,2),
  MetrosConstruccion DECIMAL(10,2),
  LinderoNorte TEXT,
  LinderoSur TEXT,
  LinderoEste TEXT,
  LinderoOeste TEXT,
  Marca VARCHAR(50),
  Modelo VARCHAR(50),
  Serial VARCHAR(50),
  Placa VARCHAR(20),
  Eliminado BOOLEAN DEFAULT FALSE
);
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS Activo BOOLEAN DEFAULT TRUE;

-- Backfill migration: add lindero columns if the table already existed sin estas columnas
DO $$ BEGIN
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS LinderoNorte TEXT;
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS LinderoSur TEXT;
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS LinderoEste TEXT;
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS LinderoOeste TEXT;
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS Descripcion TEXT;
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS MetrosFrenteTexto TEXT;
  ALTER TABLE Bien ADD COLUMN IF NOT EXISTS MetrosFondoTexto TEXT;
  ALTER TABLE Bien DROP COLUMN IF EXISTS Linderos;
  ALTER TABLE Documento ADD COLUMN IF NOT EXISTS TipoDocumentoOtro TEXT;
  ALTER TABLE Documento ADD COLUMN IF NOT EXISTS Codigo VARCHAR(50);
END $$;

-- Migration: cambiar PlazoVigencia de DATE a VARCHAR(200) si aún es DATE
DO $$ DECLARE coltype text; BEGIN
  SELECT data_type INTO coltype FROM information_schema.columns
   WHERE table_name='documento' AND column_name='plazovigencia';
  IF coltype IN ('date','timestamp without time zone','timestamp with time zone') THEN
    BEGIN
      ALTER TABLE Documento ALTER COLUMN PlazoVigencia TYPE VARCHAR(200) USING TO_CHAR(PlazoVigencia, 'YYYY-MM-DD');
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'No se pudo alterar tipo de PlazoVigencia: %', SQLERRM;
    END;
  END IF;
END $$;

-- Migration: agregar columna MonedaContrato si no existe
DO $$ BEGIN
  ALTER TABLE Documento ADD COLUMN IF NOT EXISTS MonedaContrato VARCHAR(10);
END $$;

-- Migration: ensure updated cedula CHECK allows V,E,J,G,P
DO $$ BEGIN
  BEGIN
    -- Normalizar datos existentes a formato V-######## quitando prefijos previos
    UPDATE ParteInvolucrada
      SET DatosIdentificacion = 'V-' || regexp_replace(DatosIdentificacion, '^(?:[A-Z]-)?', '')
      WHERE DatosIdentificacion !~ '^V-[0-9]{1,15}$' AND regexp_replace(DatosIdentificacion, '\D', '') <> '';
  ALTER TABLE ParteInvolucrada DROP CONSTRAINT IF EXISTS parteinvolucrada_cedula_chk;
  ALTER TABLE ParteInvolucrada ADD CONSTRAINT parteinvolucrada_cedula_chk CHECK (DatosIdentificacion IS NULL OR DatosIdentificacion = '' OR DatosIdentificacion ~ '^(?:[VEJGP]-)?[0-9]{1,15}$');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo recrear constraint parteinvolucrada_cedula_chk: %', SQLERRM;
  END;
END $$;

-- Migration: permitir NULL / vacío en DatosIdentificacion si existía NOT NULL
DO $$ BEGIN
  BEGIN
    ALTER TABLE ParteInvolucrada ALTER COLUMN DatosIdentificacion DROP NOT NULL;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo quitar NOT NULL en DatosIdentificacion: %', SQLERRM;
  END;
END $$;

CREATE TABLE IF NOT EXISTS Digitalizacion (
  DigitalizacionID SERIAL PRIMARY KEY,
  DocumentoID INT REFERENCES Documento(DocumentoID),
  FechaDigitalizacion DATE NOT NULL,
  ResponsableNombre VARCHAR(100),
  ResponsableIdentificacion VARCHAR(50),
  ResponsablePrefijo VARCHAR(4),
  UbicacionFisica TEXT,
  Codigo VARCHAR(50),
  Eliminado BOOLEAN DEFAULT FALSE
);

DO $$ BEGIN
  ALTER TABLE Digitalizacion ADD COLUMN IF NOT EXISTS UbicacionFisica TEXT;
  ALTER TABLE Digitalizacion ADD COLUMN IF NOT EXISTS Codigo VARCHAR(50);
  ALTER TABLE Digitalizacion ADD COLUMN IF NOT EXISTS PalabraClave TEXT;
  -- Ensure ResponsablePrefijo exists for back-compat when table was created before we added this column
  ALTER TABLE Digitalizacion ADD COLUMN IF NOT EXISTS ResponsablePrefijo VARCHAR(4);
END $$;

-- Nueva columna para texto libre de oficina de registro
DO $$ BEGIN
  ALTER TABLE Documento ADD COLUMN IF NOT EXISTS OficinaRegistroTexto VARCHAR(150);
END $$;

-- Migration: actualizar constraint de TipoParte y cedula para permitir abogados por lado y múltiples prefijos
DO $$ BEGIN
  BEGIN
  ALTER TABLE ParteInvolucrada DROP CONSTRAINT IF EXISTS parteinvolucrada_cedula_chk;
  -- No podemos cambiar directamente el CHECK de TipoParte si ya existe; recreamos si es necesario
  -- Ajustar TipoParte ampliando enumeración (no es un enum real sino CHECK)
  -- Cambiar constraint del tipo si su definición no coincide
  -- Intento de dropear constraint existente de TipoParte
  ALTER TABLE ParteInvolucrada DROP CONSTRAINT IF EXISTS parteinvolucrada_tipoparte_check;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo eliminar constraint TipoParte previo: %', SQLERRM;
  END;
    BEGIN
    -- Reaplicar ambos constraints (aceptar opcionalmente prefijo o solo dígitos)
    ALTER TABLE ParteInvolucrada ADD CONSTRAINT parteinvolucrada_cedula_chk CHECK (DatosIdentificacion IS NULL OR DatosIdentificacion = '' OR DatosIdentificacion ~ '^(?:[VEJGP]-)?[0-9]{1,15}$');
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'No se pudo crear nuevo constraint de cédula: %', SQLERRM;
  END;
END $$;

-- Migration para actualizar constraint de TipoParte (remover cualquiera previo y crear uno nuevo ampliado)
DO $$ DECLARE r RECORD; BEGIN
  FOR r IN SELECT conname FROM pg_constraint c
    JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid=c.conrelid
    JOIN pg_class t ON t.oid=c.conrelid
    WHERE t.relname='parteinvolucrada' AND a.attname='tipoparte' AND c.contype='c'
  LOOP
    EXECUTE format('ALTER TABLE ParteInvolucrada DROP CONSTRAINT %I', r.conname);
  END LOOP;
  ALTER TABLE ParteInvolucrada ADD CONSTRAINT parteinvolucrada_tipoparte_chk CHECK (TipoParte IN ('Otorgante','Receptor','Abogado','AbogadoOtorgante','AbogadoReceptor'));
END $$;

-- Secuencia por prefijo para codigos de Documento (CARA+NAG+SJO -> CARANAGSJO-001)
CREATE TABLE IF NOT EXISTS CodigoSecuencia (
  Prefijo VARCHAR(30) PRIMARY KEY,
  UltimoNumero INT NOT NULL DEFAULT 0
);


CREATE TABLE IF NOT EXISTS Revision (
  RevisionID SERIAL PRIMARY KEY,
  DocumentoID INT REFERENCES Documento(DocumentoID),
  FechaRevision DATE NOT NULL,
  ResponsableNombre VARCHAR(100),
  ResponsableCedula VARCHAR(20),
  ResponsablePrefijo VARCHAR(4),
  Eliminado BOOLEAN DEFAULT FALSE
);

DO $$ BEGIN
  ALTER TABLE Revision ADD COLUMN IF NOT EXISTS ResponsableCedula VARCHAR(20);
  -- Ensure ResponsablePrefijo exists for DBs created before this field was added
  ALTER TABLE Revision ADD COLUMN IF NOT EXISTS ResponsablePrefijo VARCHAR(4);
END $$;

CREATE TABLE IF NOT EXISTS DocumentoArchivo (
  ArchivoID SERIAL PRIMARY KEY,
  DocumentoID INT REFERENCES Documento(DocumentoID) ON DELETE CASCADE,
  NombreArchivo VARCHAR(150) NOT NULL,
  RutaArchivo VARCHAR(255) NOT NULL,
  TipoArchivo VARCHAR(50),
  FechaSubida DATE DEFAULT CURRENT_DATE,
  SubidoPor VARCHAR(100),
  Eliminado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS HistorialCambios (
  HistorialID SERIAL PRIMARY KEY,
  DocumentoID INT REFERENCES Documento(DocumentoID),
  UsuarioID INT,
  FechaCambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CampoModificado VARCHAR(100),
  ValorAnterior TEXT,
  ValorNuevo TEXT,
  Eliminado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS Transferencia (
  TransferenciaID SERIAL PRIMARY KEY,
  BienID INT REFERENCES Bien(BienID),
  DocumentoOrigenID INT REFERENCES Documento(DocumentoID),
  DocumentoDestinoID INT REFERENCES Documento(DocumentoID),
  FechaTransferencia DATE NOT NULL,
  Eliminado BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS HistorialPropietarios (
  HistorialID SERIAL PRIMARY KEY,
  BienID INT REFERENCES Bien(BienID),
  ParteID INT REFERENCES ParteInvolucrada(ParteID),
  DocumentoID INT REFERENCES Documento(DocumentoID),
  FechaRegistro DATE DEFAULT CURRENT_DATE,
  Eliminado BOOLEAN DEFAULT FALSE
);

COMMIT;
`;

  await pool.query(sql);

  // Seed básico para evitar FK inválidas si el frontend aún no carga catálogos
  try {
    const tipoDocCount = await pool.query('SELECT COUNT(*)::int AS c FROM TipoDocumento');
    if (tipoDocCount.rows[0].c === 0) {
      await pool.query(`INSERT INTO TipoDocumento (Nombre) VALUES ('Escritura'), ('Contrato'), ('Acta') ON CONFLICT (Nombre) DO NOTHING`);
      console.log('[DB] Seed: Tipos de Documento insertados');
    }
    const tipoBienCount = await pool.query('SELECT COUNT(*)::int AS c FROM TipoBien');
    if (tipoBienCount.rows[0].c === 0) {
      await pool.query(`INSERT INTO TipoBien (Nombre) VALUES ('Inmueble'), ('Vehiculo') ON CONFLICT (Nombre) DO NOTHING`);
      console.log('[DB] Seed: Tipos de Bien insertados');
    }
  // Seed de OficinaRegistro eliminado: ahora se usa texto libre en Documento
  } catch (seedErr) {
    console.error('[DB] Error al realizar seed inicial:', seedErr.message);
  }
};

export default initDb;
