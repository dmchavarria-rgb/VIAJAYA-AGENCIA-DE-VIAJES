/* ============================================================
   ViajaYa · componentes.js
   Renderizado dinámico de HTML a partir de los datos en memoria.
   Integra las librerías SweetAlert2, Toastify y Chart.js.
   ============================================================ */

let instanciaGrafico = null; // referencia única al gráfico de Chart.js

/** Notificación breve (Toastify) para confirmar una acción. */
function notificar(mensaje, tipo = "exito") {
  const colores = { exito: "#2E7D5B", error: "#B23A2E", info: "#3D7A8C" };
  Toastify({
    text: mensaje,
    duration: 3200,
    gravity: "top",
    position: "right",
    style: { background: colores[tipo] || colores.exito, borderRadius: "10px", fontFamily: "Inter, sans-serif" },
  }).showToast();
}

/** Genera el marcado de una tarjeta de destino. */
function plantillaTarjeta(destino) {
  const estadoBadge = destino.estado === "disponible"
    ? `<span class="badge badge--disponible">Disponible</span>`
    : `<span class="badge badge--agotado">Agotado</span>`;

  return `
    <article class="tarjeta-destino" data-id="${destino.id}">
      <div class="tarjeta-destino__img" style="background-image:url('https://picsum.photos/seed/viajaya${destino.id}/400/240');" role="img" aria-label="Fotografía representativa de ${destino.destino}">
        <span class="tarjeta-destino__categoria">${destino.categoria.nombre}</span>
      </div>
      <div class="tarjeta-destino__cuerpo">
        <h3>${destino.nombre}</h3>
        <p class="tarjeta-destino__meta">${destino.destino} · ${destino.duracionDias} días · ⭐ ${destino.valoracion}</p>
        <p class="tarjeta-destino__meta">${estadoBadge} · ${destino.cuposDisponibles} cupos</p>
        <p class="tarjeta-destino__precio">$ ${destino.precio}</p>
      </div>
      <div class="tarjeta-destino__acciones">
        <button class="boton boton--claro boton--peq" data-accion="detalle" data-id="${destino.id}">Ver detalle</button>
        <button class="boton boton--linea boton--peq" data-accion="editar" data-id="${destino.id}">Editar</button>
        <button class="boton boton--alerta boton--peq" data-accion="eliminar" data-id="${destino.id}">Eliminar</button>
      </div>
    </article>`;
}

function renderizarDestinos(contenedor, lista) {
  if (!lista.length) {
    contenedor.innerHTML = `<p class="mensaje-vacio">No se encontraron paquetes con los criterios seleccionados.</p>`;
    return;
  }
  contenedor.innerHTML = lista.map(plantillaTarjeta).join("");
}

/** Muestra el detalle completo de un destino mediante SweetAlert2. */
function mostrarDetalleDestino(destino) {
  Swal.fire({
    title: destino.nombre,
    html: `
      <div style="text-align:left; font-family: Inter, sans-serif;">
        <p><strong>Destino:</strong> ${destino.destino}</p>
        <p><strong>Categoría:</strong> ${destino.categoria.nombre}</p>
        <p><strong>Salida desde:</strong> ${destino.ciudadSalida}</p>
        <p><strong>Duración:</strong> ${destino.duracionDias} días</p>
        <p><strong>Cupos disponibles:</strong> ${destino.cuposDisponibles}</p>
        <p><strong>Valoración:</strong> ⭐ ${destino.valoracion} / 5</p>
        <p>${destino.descripcion}</p>
        <p style="font-size:1.4rem;color:#E4572E;font-weight:700;">$ ${destino.precio}</p>
      </div>`,
    confirmButtonText: "Cerrar",
    confirmButtonColor: "#0E3B36",
  });
}

/** Confirmación de eliminación (SweetAlert2). */
async function confirmarEliminacion(nombre) {
  const resultado = await Swal.fire({
    title: `¿Eliminar "${nombre}"?`,
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#B23A2E",
    cancelButtonColor: "#3D7A8C",
  });
  return resultado.isConfirmed;
}

/** Confirmación para restablecer los datos originales (SweetAlert2). */
async function confirmarRestablecer() {
  const resultado = await Swal.fire({
    title: "¿Restablecer datos originales?",
    text: "Se perderán los cambios realizados en este navegador.",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Sí, restablecer",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#E4572E",
  });
  return resultado.isConfirmed;
}

/* ---------------------- Panel de indicadores ---------------------- */

function renderizarIndicadores(contenedor, ind) {
  contenedor.innerHTML = `
    <div class="indicador"><span class="valor">${ind.total}</span><span class="etiqueta">Paquetes totales</span></div>
    <div class="indicador"><span class="valor">${ind.categorias}</span><span class="etiqueta">Categorías</span></div>
    <div class="indicador"><span class="valor">${ind.disponibles}</span><span class="etiqueta">Disponibles</span></div>
    <div class="indicador"><span class="valor">$ ${ind.promedio}</span><span class="etiqueta">Precio promedio</span></div>
    <div class="indicador"><span class="valor">${ind.filtrados}</span><span class="etiqueta">Resultados filtrados</span></div>
  `;
}

/* ---------------------- Gráfico Chart.js ---------------------- */

function renderizarGrafico(canvas, datosPorCategoria) {
  const etiquetas = datosPorCategoria.map((d) => d.nombre);
  const valores = datosPorCategoria.map((d) => d.total);

  if (instanciaGrafico) {
    instanciaGrafico.data.labels = etiquetas;
    instanciaGrafico.data.datasets[0].data = valores;
    instanciaGrafico.update();
    return;
  }

  instanciaGrafico = new Chart(canvas, {
    type: "bar",
    data: {
      labels: etiquetas,
      datasets: [{
        label: "Paquetes por categoría",
        data: valores,
        backgroundColor: "#E4572E",
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, title: { display: true, text: "Paquetes disponibles por categoría" } },
      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    },
  });
}

/* ---------------------- Selector de nacionalidad ---------------------- */

function renderizarListaPaises(contenedor, paises, onSeleccionar) {
  if (!paises.length) {
    contenedor.innerHTML = `<p class="mensaje-vacio" style="padding:1rem;">Sin coincidencias.</p>`;
    contenedor.classList.remove("oculto");
    return;
  }
  contenedor.innerHTML = paises
    .slice(0, 30)
    .map((p) => `<button type="button" data-codigo="${p.codigo}"><img src="${p.bandera}" alt="Bandera de ${p.nombre}"> ${p.nombre}</button>`)
    .join("");
  contenedor.classList.remove("oculto");

  contenedor.querySelectorAll("button").forEach((boton) => {
    boton.addEventListener("click", () => {
      const pais = paises.find((p) => p.codigo === boton.dataset.codigo);
      onSeleccionar(pais);
      contenedor.classList.add("oculto");
    });
  });
}

function mostrarPaisSeleccionado(contenedor, pais) {
  contenedor.innerHTML = pais
    ? `<img src="${pais.bandera}" alt="Bandera de ${pais.nombre}"> Nacionalidad seleccionada: <strong>${pais.nombre}</strong>`
    : "";
}
