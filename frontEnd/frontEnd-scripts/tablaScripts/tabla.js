// Clase encargada de cargar el contenido de la base de datos en la tabla
class Tabla {
    constructor() {
        this.tabla = document.querySelector('table');
        this.filas = this.tabla.getElementsByTagName('tr');
        this.documentos = [];
        this.partes = [];
        this.bienes = [];
        this.tiposDocumento = [];
        this.tiposBien = [];
    }

    async extraerDatos() {
        // Intentar mismo origen; fallback a localhost:3000 si falla
        let bases = [''];
        if (!window.location.origin.includes('3000')) bases.push('http://localhost:3000');
        let success = false, lastErr;
        for (const base of bases) {
            try {
                const [docsRes, partesRes, bienesRes, tdocRes, tbienRes] = await Promise.all([
                    fetch(base + '/documentos'),
                    fetch(base + '/partes'),
                    fetch(base + '/bienes'),
                    fetch(base + '/tipos-documento'),
                    fetch(base + '/tipos-bien')
                ]);
                if (![docsRes, partesRes, bienesRes, tdocRes, tbienRes].every(r => r.ok)) {
                    throw new Error('Respuesta no OK en alguno de los endpoints');
                }
                this.documentos = await docsRes.json();
                this.partes = await partesRes.json();
                this.bienes = await bienesRes.json();
                this.tiposDocumento = await tdocRes.json();
                this.tiposBien = await tbienRes.json();
                success = true;
                break;
            } catch (err) {
                lastErr = err;
            }
        }
        if (!success) {
            console.error('Fallo al cargar datos de la API', lastErr);
            this.mostrarError('No se pudieron cargar los datos de la API');
            return;
        }
            this.documentos = await docsRes.json();
            this.partes = await partesRes.json();
            this.bienes = await bienesRes.json();
            this.tiposDocumento = await tdocRes.json();
            this.tiposBien = await tbienRes.json();
            this.llenarTabla();
    }

    mostrarError(msg){
        if (!this.tabla) return;
        const tbody = this.tabla.getElementsByTagName('tbody')[0];
        if (!tbody) return;
        tbody.innerHTML = `<tr><td colspan="13" style="color:#b00; text-align:center;">${msg}</td></tr>`;
    }

    mapTipoDocumento(id) {
        const found = this.tiposDocumento.find(t => (t.TipoDocumentoID||t.tipodocumentoid) === id);
        return found ? (found.Nombre || found.nombre) : id || '';
    }
    mapTipoBien(id) {
        const found = this.tiposBien.find(t => (t.TipoBienID||t.tipobienid) === id);
        return found ? (found.Nombre || found.nombre) : '';
    }
    obtenerPartes(docId, tipo) {
        return this.partes.filter(p => p.DocumentoID === docId && p.TipoParte === tipo);
    }

    llenarTabla() {
        if (!this.tabla) return;
        const tbody = this.tabla.getElementsByTagName('tbody')[0];
        if (!tbody) return;
        tbody.innerHTML = '';

        this.documentos.forEach(doc => {
            const docId = doc.DocumentoID;
            // Partes principales
            const otorgante = this.obtenerPartes(docId, 'Otorgante')[0];
            const receptor = this.obtenerPartes(docId, 'Receptor')[0];
            const abogadoO = this.obtenerPartes(docId, 'AbogadoOtorgante')[0] || this.obtenerPartes(docId,'Abogado')[0];
            const abogadoR = this.obtenerPartes(docId, 'AbogadoReceptor')[0];
            // Bien (se asume uno por documento)
            const bien = this.bienes.find(b => b.DocumentoID === docId);
            const tipoBienNombre = bien ? this.mapTipoBien(bien.TipoBienID) : '';
            let tipoDocNombre = this.mapTipoDocumento(doc.TipoDocumentoID);
            if (doc.TipoDocumentoOtro || doc.tipodocumentootro) tipoDocNombre = (doc.TipoDocumentoOtro || doc.tipodocumentootro || '').trim() || tipoDocNombre;
            const fila = document.createElement('tr');
            fila.setAttribute('data-id', docId);
            fila.innerHTML = `
                <td>${tipoDocNombre}</td>
                <td>${otorgante?.NombreParte || ''}</td>
                <td>${otorgante?.DatosIdentificacion || ''}</td>
                <td>${receptor?.NombreParte || ''}</td>
                <td>${receptor?.DatosIdentificacion || ''}</td>
                <td>${[abogadoO?.NombreParte, abogadoR?.NombreParte].filter(Boolean).join(' / ')}</td>
                <td>${[abogadoO?.DatosIdentificacion, abogadoR?.DatosIdentificacion].filter(Boolean).join(' / ')}</td>
                <td>${tipoBienNombre}</td>
                <td>${doc.FechaEmision ? doc.FechaEmision.slice(0,10) : ''}</td>
                <td>${doc.PlazoVigencia || ''}</td>
                <td>${doc.OficinaRegistroTexto || ''}</td>
                <td>${doc.FechaOtorgamiento ? doc.FechaOtorgamiento.slice(0,10) : ''}</td>
                <td>${doc.updated_at ? doc.updated_at.slice(0,10) : ''}</td>
            `;
            tbody.appendChild(fila);
        });
    }
}

// Exponer clase si se necesita en otros scripts legacy
window.Tabla = Tabla;
