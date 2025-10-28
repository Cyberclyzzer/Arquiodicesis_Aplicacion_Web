// Funciones para cargar y poblar el documento en visualizacionDocumento.html
// Ahora consume /documentos/:id/full que retorna:
// {
//   Documento: { DocumentoID, TipoDocumentoID, TipoDocumentoOtro, FechaEmision, PlazoVigencia, NombreEstado, NombreMunicipio, NombreParroquia, ValorContrato, OficinaRegistroID, OficinaRegistroTexto, FechaOtorgamiento, DatosAsiento, CondicionesEspeciales, Observaciones, Codigo ... }
//   Partes: [ { ParteID, DocumentoID, TipoParte, NombreParte, DatosIdentificacion } ... ]
//   Bien: { BienID, TipoBienID, Descripcion, Caracteristicas, Ubicacion, MetrosFrenteTexto, MetrosFondoTexto, MetrosTerreno, MetrosConstruccion, LinderoNorte, LinderoSur, LinderoEste, LinderoOeste, Marca, Modelo, Serial, Placa }
//   Revision: { RevisionID, FechaRevision, ResponsableNombre, ResponsableCedula }
//   Digitalizacion: { DigitalizacionID, FechaDigitalizacion, ResponsableNombre, ResponsableIdentificacion, UbicacionFisica, Codigo }
//   Archivos: [ { ArchivoID, NombreArchivo, RutaArchivo, TipoArchivo } ... ]
// }

export function obtenerIdDeQuery() {
	const params = new URLSearchParams(window.location.search);
	return params.get('id');
}

async function fetchJsonWithFallback(path){
	const bases = [''];
	if(!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
	let lastErr; for(const b of bases){
		try { const r = await fetch(b+path); if(!r.ok) throw new Error('HTTP '+r.status); return await r.json(); } catch(e){ lastErr=e; }
	}
	throw lastErr || new Error('No se pudo obtener '+path);
}

export async function cargarDocumento(id) {
	const form = document.getElementById('form-documento');
	if (!form) return;
	setCargando(true);
	try {
		const data = await fetchJsonWithFallback(`/documentos/${id}/full`);
		let tiposDocumento = [];
		try { tiposDocumento = await fetchJsonWithFallback('/tipos-documento'); } catch(_e) {}
		data.__tiposDocumento = tiposDocumento;
		// Guardar globalmente para edición posterior
		window.__documentoFull = data;
		poblarCampos(data);
		actualizarTitulo(data);
	} catch (e) {
		console.error('Fallo al obtener documento', e);
		mostrarError('No se pudo cargar el documento.');
	} finally {
		setCargando(false);
	}
}

function setCargando(cargando) {
	let badge = document.getElementById('estado-carga');
	if (!badge) {
		badge = document.createElement('span');
		badge.id = 'estado-carga';
		badge.style.marginLeft = '1rem';
		document.querySelector('header h1')?.appendChild(badge);
	}
	badge.textContent = cargando ? 'Cargando…' : '';
}

function mostrarError(msg) {
	let box = document.getElementById('mensaje-error');
	if (!box) {
		box = document.createElement('div');
		box.id = 'mensaje-error';
		box.className = 'bg-red-100 text-red-700 px-3 py-2 rounded mb-4';
		const container = document.querySelector('.max-w-6xl');
		container?.insertBefore(box, container.firstChild);
	}
	box.textContent = msg;
}

function actualizarTitulo(full) {
	const span = document.getElementById('documento-titulo');
	if (!span) return;
	const partes = full.Partes || [];
	const otorgante = partes.find(p => p.tipoparte?.toLowerCase?.() === 'otorgante' || p.TipoParte === 'Otorgante');
	const receptor = partes.find(p => p.tipoparte?.toLowerCase?.() === 'receptor' || p.TipoParte === 'Receptor');
	const doc = full.Documento || {};
	span.textContent = `${doc.Codigo || 'Documento'} ${otorgante?.NombreParte || ''} → ${receptor?.NombreParte || ''}`.trim();
}

function setVal(name, value) {
	const input = document.querySelector(`[name="${name}"]`);
	if (!input) return;
	if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
		input.value = value ?? '';
	}
}

function poblarCampos(full) {
	const d = full.Documento || {};
	// Sección 1 Documento
	setVal('tipoDocumentoID', d.TipoDocumentoID);
	setVal('tipoDocumentoOtro', d.TipoDocumentoOtro);
	// Determinar nombre de tipo documento
	let tipoNombre = '';
	if(d.TipoDocumentoOtro && d.TipoDocumentoOtro.trim() !== '') {
		tipoNombre = d.TipoDocumentoOtro.trim();
	} else if(full.__tiposDocumento && Array.isArray(full.__tiposDocumento)) {
		const found = full.__tiposDocumento.find(t => (t.TipoDocumentoID||t.tipodocumentoid) === d.TipoDocumentoID);
		if(found) tipoNombre = found.Nombre || found.nombre || '';
	}
	setVal('tipoDocumento', tipoNombre);
	setVal('fechaEmision', formatearFecha(d.FechaEmision));
	setVal('plazoVigencia', formatearFecha(d.PlazoVigencia));
	setVal('nombreEstado', d.NombreEstado);
	setVal('nombreMunicipio', d.NombreMunicipio);
	setVal('nombreParroquia', d.NombreParroquia);
	setVal('monto', d.ValorContrato);
	setVal('monedaContrato', d.MonedaContrato);
	setVal('codigo', d.Codigo);

	// Partes (adaptando Tipos)
	const partes = full.Partes || [];
	mapParte(partes, 'Otorgante', { nombre: 'otorganteNombre', identificacion: 'otorganteId' });
	mapParte(partes, 'Receptor', { nombre: 'receptorNombre', identificacion: 'receptorId' });
	mapParte(partes, 'AbogadoOtorgante', { nombre: 'abogadoOtorganteNombre', identificacion: 'abogadoOtorganteId' });
	mapParte(partes, 'AbogadoReceptor', { nombre: 'abogadoReceptorNombre', identificacion: 'abogadoReceptorId' });

	// Bien: poblar select con nombres
	const b = full.Bien;
	const selectBien = document.querySelector('select[name="tipoBienID"]');
	if (selectBien) {
		fetchJsonWithFallback('/tipos-bien').then(tiposBien => {
			selectBien.innerHTML = '';
			let selected = false;
			tiposBien.forEach((tb, idx) => {
				const option = document.createElement('option');
				option.value = tb.TipoBienID;
				option.textContent = tb.Nombre;
				if (b && tb.TipoBienID === b.TipoBienID) {
					option.selected = true;
					selected = true;
				}
				selectBien.appendChild(option);
			});
			// Si no hay bien, seleccionar la primera opción
			if (!selected && tiposBien.length > 0) {
				selectBien.selectedIndex = 0;
			}
		});
	}
	if (b) {
		setVal('descripcion', b.Descripcion);
		setVal('ubicacion', b.Ubicacion);
		setVal('metrosFrente', b.MetrosFrenteTexto);
		setVal('metrosFondo', b.MetrosFondoTexto);
		setVal('metrosConstruccion', b.MetrosConstruccion);
		setVal('linderoNorte', b.LinderoNorte);
		setVal('linderoSur', b.LinderoSur);
		setVal('linderoEste', b.LinderoEste);
		setVal('linderoOeste', b.LinderoOeste);
		setVal('marca', b.Marca);
		setVal('modelo', b.Modelo);
		setVal('serial', b.Serial);
		setVal('placa', b.Placa);
	}

	// Protocolo (en Documento)
	setVal('oficinaRegistroNombre', d.OficinaRegistroTexto);
	setVal('fechaOtorgamiento', formatearFecha(d.FechaOtorgamiento));
	setVal('datosAsiento', d.DatosAsiento);
	setVal('condiciones', d.CondicionesEspeciales);
	setVal('observaciones', d.Observaciones);

	// Revisión
	const r = full.Revision;
	if (r) {
		setVal('revisionNombre', r.ResponsableNombre);
		setVal('revisionFecha', formatearFecha(r.FechaRevision));
		setVal('revisionCedula', r.ResponsableCedula);
	}

	// Digitalización
	const g = full.Digitalizacion;
	if (g) {
		setVal('digitalCodigo', g.Codigo);
		setVal('digitalUbicacion', g.UbicacionFisica);
		setVal('digitalNombre', g.ResponsableNombre);
		setVal('digitalFecha', formatearFecha(g.FechaDigitalizacion));
		setVal('digitalIdentificacion', g.ResponsableIdentificacion);
	}

	// Archivo (último)
	const archivo = (full.Archivos || [])[0];
	if (archivo) {
		setVal('ruta_pdf', archivo.RutaArchivo || archivo.NombreArchivo);
		// Instead of inserting an inline link, store normalized path on the input
		// and dispatch an event so the centralized PDF controls can pick it up.
		const inputRuta = document.querySelector('[name="ruta_pdf"]');
		if (inputRuta && archivo.RutaArchivo) {
			const rutaWeb = archivo.RutaArchivo.startsWith('/') ? archivo.RutaArchivo.replace(/\\/g,'/') : ('/' + archivo.RutaArchivo.replace(/\\/g,'/'));
			inputRuta.dataset.ruta = rutaWeb;
			document.dispatchEvent(new CustomEvent('documento:archivoDisponible', { detail: { ruta: rutaWeb } }));
		}
	}
}

function mapParte(partes, rol, mapping) {
	const p = partes.find(x => x.TipoParte === rol || x.tipoparte === rol || x.tipoparte === rol.toLowerCase());
	if (!p) return;
	Object.entries(mapping).forEach(([kDestino, nombreCampo]) => {
		if (kDestino === 'nombre') setVal(nombreCampo, p.NombreParte || p.nombreparte);
		if (kDestino === 'identificacion') setVal(nombreCampo, p.DatosIdentificacion || p.datosidentificacion);
		if (kDestino === 'prefijo') setVal(nombreCampo, p.Prefijo || p.prefijo);
	});
}

function formatearFecha(val) {
	if (!val) return '';
	// Normalizar si viene con tiempo
	const d = new Date(val);
	if (isNaN(d)) return '';
	return d.toISOString().slice(0, 10);
}

