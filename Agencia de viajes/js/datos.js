/* ============================================================
   ViajaYa · datos.js
   Reglas de negocio sobre los arreglos en memoria: relación
   entre destinos.json y categorias.json mediante categoriaId,
   operaciones CRUD y cálculos para el panel de indicadores.
   ============================================================ */

/** Relaciona cada destino con el objeto completo de su categoría (find). */
function unirCategoria(destino, categorias) {
  const categoria = categorias.find((c) => c.id === destino.categoriaId);
  return { ...destino, categoria: categoria || { nombre: "Sin categoría", icono: "fa-circle-question" } };
}

function unirCategorias(destinos, categorias) {
  return destinos.map((d) => unirCategoria(d, categorias));
}

/** Búsqueda en tiempo real sobre nombre, destino, ciudad de salida y descripción. */
function buscarDestinos(lista, texto) {
  const termino = texto.trim().toLowerCase();
  if (!termino) return lista;
  return lista.filter((d) =>
    [d.nombre, d.destino, d.ciudadSalida, d.descripcion, d.categoria?.nombre]
      .filter(Boolean)
      .some((campo) => campo.toLowerCase().includes(termino))
  );
}

/** Filtra por categoría y por estado de disponibilidad. */
function filtrarDestinos(lista, { categoriaId, estado, precioMax }) {
  return lista.filter((d) => {
    const coincideCategoria = !categoriaId || d.categoriaId === Number(categoriaId);
    const coincideEstado = !estado || d.estado === estado;
    const coincidePrecio = !precioMax || d.precio <= Number(precioMax);
    return coincideCategoria && coincideEstado && coincidePrecio;
  });
}

/** Ordena según el criterio elegido en el select de orden. */
function ordenarDestinos(lista, criterio) {
  const copia = [...lista];
  switch (criterio) {
    case "precio-asc": return copia.sort((a, b) => a.precio - b.precio);
    case "precio-desc": return copia.sort((a, b) => b.precio - a.precio);
    case "nombre-asc": return copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
    case "nombre-desc": return copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
    case "valoracion-desc": return copia.sort((a, b) => b.valoracion - a.valoracion);
    default: return copia;
  }
}

/** Aplica búsqueda + filtros + orden en un solo paso, en ese orden. */
function aplicarConsulta(destinosConCategoria, { texto, categoriaId, estado, precioMax, orden }) {
  let resultado = buscarDestinos(destinosConCategoria, texto || "");
  resultado = filtrarDestinos(resultado, { categoriaId, estado, precioMax });
  resultado = ordenarDestinos(resultado, orden);
  return resultado;
}

/* ---------------------- CRUD de destinos ---------------------- */

function generarNuevoId(lista) {
  return lista.length ? Math.max(...lista.map((d) => d.id)) + 1 : 1;
}

function idYaExiste(lista, id) {
  return lista.some((d) => d.id === Number(id));
}

function agregarDestino(lista, nuevoDestino) {
  const id = generarNuevoId(lista);
  const registro = { id, fechaRegistro: new Date().toISOString().slice(0, 10), ...nuevoDestino };
  return [...lista, registro];
}

function actualizarDestino(lista, id, cambios) {
  return lista.map((d) => (d.id === Number(id) ? { ...d, ...cambios } : d));
}

function eliminarDestino(lista, id) {
  return lista.filter((d) => d.id !== Number(id));
}

/* ---------------------- Indicadores del panel ---------------------- */

function calcularIndicadores(destinos, categorias, resultadosFiltrados) {
  if (!destinos.length) {
    return { total: 0, categorias: categorias.length, disponibles: 0, promedio: 0, masCaro: null, masBarato: null, filtrados: resultadosFiltrados.length };
  }
  const disponibles = destinos.filter((d) => d.estado === "disponible");
  const promedio = destinos.reduce((suma, d) => suma + d.precio, 0) / destinos.length;
  const masCaro = destinos.reduce((max, d) => (d.precio > max.precio ? d : max), destinos[0]);
  const masBarato = destinos.reduce((min, d) => (d.precio < min.precio ? d : min), destinos[0]);

  return {
    total: destinos.length,
    categorias: categorias.length,
    disponibles: disponibles.length,
    promedio: Math.round(promedio),
    masCaro,
    masBarato,
    filtrados: resultadosFiltrados.length,
  };
}

/** Cuenta cuántos destinos hay por cada categoría, para el gráfico de Chart.js. */
function contarPorCategoria(destinos, categorias) {
  return categorias.map((c) => ({
    nombre: c.nombre,
    total: destinos.filter((d) => d.categoriaId === c.id).length,
  }));
}
