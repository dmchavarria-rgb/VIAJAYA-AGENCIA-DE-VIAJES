/* ============================================================
   ViajaYa · main.js
   Punto de entrada. Detecta en qué página se encuentra (según
   los elementos presentes en el DOM) e inicializa únicamente lo
   que corresponde. Todo arranca con el evento DOMContentLoaded.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  inicializarMenuResponsivo();

  if (document.getElementById("listaDestacados")) inicializarInicio();
  if (document.getElementById("listaDestinos")) inicializarCatalogo();
  if (document.getElementById("formularioUsuario")) inicializarRegistro();
  if (document.getElementById("selectorCiudades")) inicializarClima();
  if (document.getElementById("formularioContacto")) inicializarContacto();
});

/* ---------------------- Menú responsivo (evento click) ---------------------- */
function inicializarMenuResponsivo() {
  const boton = document.getElementById("botonMenu");
  const menu = document.getElementById("menuPrincipal");
  if (!boton || !menu) return;
  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });
}

/* ============================================================
   Página de inicio
   ============================================================ */
async function inicializarInicio() {
  const fechaPasaje = document.getElementById("fechaPasaje");
  if (fechaPasaje) fechaPasaje.textContent = new Date().toLocaleDateString("es-EC");

  const contenedorDestacados = document.getElementById("listaDestacados");
  const contenedorIndicadores = document.getElementById("indicadoresInicio");

  try {
    const { destinos, categorias } = await inicializarDatos();
    const conCategoria = unirCategorias(destinos, categorias);
    const destacados = ordenarDestinos(conCategoria, "valoracion-desc").slice(0, 3);
    renderizarDestinos(contenedorDestacados, destacados);

    const indicadores = calcularIndicadores(destinos, categorias, destinos);
    contenedorIndicadores.innerHTML = `
      <div class="indicador"><span class="valor">${indicadores.total}</span><span class="etiqueta">Paquetes disponibles</span></div>
      <div class="indicador"><span class="valor">${indicadores.categorias}</span><span class="etiqueta">Categorías</span></div>
      <div class="indicador"><span class="valor">$ ${indicadores.promedio}</span><span class="etiqueta">Precio promedio</span></div>
      <div class="indicador"><span class="valor">${indicadores.masBarato ? "$ " + indicadores.masBarato.precio : "-"}</span><span class="etiqueta">Desde</span></div>
    `;

    // Delegación de eventos para el botón "Ver detalle" de los destacados
    contenedorDestacados.addEventListener("click", (evento) => {
      const boton = evento.target.closest('[data-accion="detalle"]');
      if (!boton) return;
      const destino = destacados.find((d) => d.id === Number(boton.dataset.id));
      if (destino) mostrarDetalleDestino(destino);
    });
  } catch (error) {
    contenedorDestacados.innerHTML = `<p class="mensaje-vacio">No se pudo cargar la información: ${error.message}</p>`;
    contenedorIndicadores.innerHTML = "";
    console.error(error);
  }
}

/* ============================================================
   Página de catálogo (CRUD completo)
   ============================================================ */
async function inicializarCatalogo() {
  const contenedorLista = document.getElementById("listaDestinos");
  const contenedorIndicadores = document.getElementById("panelIndicadores");
  const canvasGrafico = document.getElementById("graficoCategorias");
  const entradaBusqueda = document.getElementById("entradaBusqueda");
  const filtroCategoria = document.getElementById("filtroCategoria");
  const filtroEstado = document.getElementById("filtroEstado");
  const filtroPrecio = document.getElementById("filtroPrecio");
  const selectorOrden = document.getElementById("selectorOrden");
  const formulario = document.getElementById("formularioDestino");
  const selectCategoriaForm = document.getElementById("categoriaId");
  const botonNuevo = document.getElementById("botonNuevo");
  const botonCancelar = document.getElementById("botonCancelar");
  const botonRestablecer = document.getElementById("botonRestablecer");
  const tituloFormulario = document.getElementById("tituloFormulario");

  let categorias = [];
  let destinos = [];

  async function cargarTodo() {
    try {
      const datos = await inicializarDatos();
      categorias = datos.categorias;
      destinos = datos.destinos;
      poblarSelectsCategoria();
      actualizarVista();
    } catch (error) {
      contenedorLista.innerHTML = `<p class="mensaje-vacio">Error al cargar los datos: ${error.message}</p>`;
      console.error(error);
    }
  }

  function poblarSelectsCategoria() {
    const opciones = categorias.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");
    filtroCategoria.innerHTML = `<option value="">Todas las categorías</option>${opciones}`;
    selectCategoriaForm.innerHTML = opciones;
  }

  function actualizarVista() {
    const conCategoria = unirCategorias(destinos, categorias);
    const resultado = aplicarConsulta(conCategoria, {
      texto: entradaBusqueda.value,
      categoriaId: filtroCategoria.value,
      estado: filtroEstado.value,
      precioMax: filtroPrecio.value,
      orden: selectorOrden.value,
    });
    renderizarDestinos(contenedorLista, resultado);
    renderizarIndicadores(contenedorIndicadores, calcularIndicadores(destinos, categorias, resultado));
    renderizarGrafico(canvasGrafico, contarPorCategoria(destinos, categorias));
  }

  // Búsqueda en tiempo real
  entradaBusqueda.addEventListener("input", actualizarVista);
  // Filtros y orden
  [filtroCategoria, filtroEstado, filtroPrecio, selectorOrden].forEach((el) =>
    el.addEventListener("change", actualizarVista)
  );

  // Mostrar/ocultar formulario
  function abrirFormulario(modo, destino = null) {
    formulario.classList.remove("oculto");
    formulario.reset();
    formulario.querySelectorAll(".campo--invalido").forEach((c) => c.classList.remove("campo--invalido"));
    if (modo === "editar" && destino) {
      tituloFormulario.textContent = `Editar paquete: ${destino.nombre}`;
      document.getElementById("idDestino").value = destino.id;
      formulario.nombre.value = destino.nombre;
      formulario.categoriaId.value = destino.categoriaId;
      formulario.descripcion.value = destino.descripcion;
      formulario.destino.value = destino.destino;
      formulario.ciudadSalida.value = destino.ciudadSalida;
      formulario.precio.value = destino.precio;
      formulario.duracionDias.value = destino.duracionDias;
      formulario.cupos.value = destino.cuposDisponibles;
      formulario.valoracion.value = destino.valoracion;
      formulario.estado.value = destino.estado;
      formulario.imagen.value = destino.imagen;
    } else {
      tituloFormulario.textContent = "Agregar nuevo paquete";
      document.getElementById("idDestino").value = "";
    }
    formulario.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  botonNuevo.addEventListener("click", () => abrirFormulario("nuevo"));
  botonCancelar.addEventListener("click", () => formulario.classList.add("oculto"));

  // Envío del formulario (alta y edición)
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const idEnEdicion = document.getElementById("idDestino").value;
    const { valido, datos } = validarFormularioDestino(formulario, destinos, idEnEdicion || null);
    if (!valido) {
      notificar("Revisa los campos marcados en rojo.", "error");
      return;
    }

    if (idEnEdicion) {
      destinos = actualizarDestino(destinos, idEnEdicion, datos);
      notificar("Paquete actualizado correctamente.");
    } else {
      destinos = agregarDestino(destinos, datos);
      notificar("Paquete agregado correctamente.");
    }
    guardarDestinos(destinos);
    formulario.classList.add("oculto");
    actualizarVista();
  });

  // Delegación de eventos para detalle / editar / eliminar (elementos generados dinámicamente)
  contenedorLista.addEventListener("click", async (evento) => {
    const boton = evento.target.closest("button[data-accion]");
    if (!boton) return;
    const id = Number(boton.dataset.id);
    const destino = unirCategorias(destinos, categorias).find((d) => d.id === id);
    if (!destino) return;

    if (boton.dataset.accion === "detalle") {
      mostrarDetalleDestino(destino);
    } else if (boton.dataset.accion === "editar") {
      abrirFormulario("editar", destino);
    } else if (boton.dataset.accion === "eliminar") {
      const confirmado = await confirmarEliminacion(destino.nombre);
      if (!confirmado) return;
      destinos = eliminarDestino(destinos, id);
      guardarDestinos(destinos);
      notificar("Paquete eliminado.", "info");
      actualizarVista();
    }
  });

  // Restablecer datos originales
  botonRestablecer.addEventListener("click", async () => {
    const confirmado = await confirmarRestablecer();
    if (!confirmado) return;
    try {
      const datos = await restablecerDatos();
      categorias = datos.categorias;
      destinos = datos.destinos;
      poblarSelectsCategoria();
      actualizarVista();
      notificar("Datos restablecidos desde los archivos JSON originales.", "info");
    } catch (error) {
      notificar("No se pudieron restablecer los datos.", "error");
    }
  });

  await cargarTodo();
}

/* ============================================================
   Página de registro de usuario (sección 8 del proyecto)
   ============================================================ */
async function inicializarRegistro() {
  const formulario = document.getElementById("formularioUsuario");
  const entradaPais = document.getElementById("entradaPais");
  const listaPaises = document.getElementById("listaPaises");
  const paisSeleccionadoDiv = document.getElementById("paisSeleccionado");
  const cuerpoTabla = document.getElementById("cuerpoTablaUsuarios");

  let paises = [];
  let paisElegido = null;
  let usuarios = [];

  try {
    const datos = await inicializarDatos();
    usuarios = datos.usuarios;
    renderizarTablaUsuarios();
  } catch (error) {
    cuerpoTabla.innerHTML = `<tr><td colspan="5" class="texto-centro">Error al cargar usuarios: ${error.message}</td></tr>`;
  }

  try {
    paises = await obtenerPaises();
  } catch (error) {
    notificar("No se pudo consultar la API de países, se usará una lista de respaldo.", "error");
  }

  function renderizarTablaUsuarios() {
    if (!usuarios.length) {
      cuerpoTabla.innerHTML = `<tr><td colspan="5" class="texto-centro">Aún no hay usuarios registrados.</td></tr>`;
      return;
    }
    cuerpoTabla.innerHTML = usuarios
      .slice(-15)
      .reverse()
      .map(
        (u) => `<tr>
          <td>${u.nombres}</td><td>${u.apellidos}</td><td>${u.correo}</td>
          <td>${u.contacto?.ciudad || "-"}</td><td>${u.nacionalidad?.nombre || "-"}</td>
        </tr>`
      )
      .join("");
  }

  // Búsqueda en tiempo real dentro del selector de países
  entradaPais.addEventListener("input", () => {
    paisElegido = null;
    const termino = entradaPais.value.trim().toLowerCase();
    if (!termino) { listaPaises.classList.add("oculto"); return; }
    const coincidencias = paises.filter((p) => p.nombre.toLowerCase().includes(termino));
    renderizarListaPaises(listaPaises, coincidencias, (pais) => {
      paisElegido = pais;
      entradaPais.value = pais.nombre;
      mostrarPaisSeleccionado(paisSeleccionadoDiv, pais);
    });
  });

  document.addEventListener("click", (evento) => {
    if (!evento.target.closest(".selector-pais")) listaPaises.classList.add("oculto");
  });

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const valido = validarFormularioUsuario(formulario, paisElegido);
    if (!valido) {
      notificar("Revisa los campos marcados en rojo.", "error");
      return;
    }

    const nuevoUsuario = {
      id: usuarios.length ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1,
      nombres: formulario.nombres.value.trim(),
      apellidos: formulario.apellidos.value.trim(),
      correo: formulario.correo.value.trim(),
      contacto: { telefono: formulario.telefono.value.trim(), ciudad: formulario.ciudad.value.trim() || "No especificada" },
      nacionalidad: { codigo: paisElegido.codigo, nombre: paisElegido.nombre },
      fechaNacimiento: formulario.fechaNacimiento.value || null,
      fechaRegistro: new Date().toISOString().slice(0, 10),
    };

    usuarios = [...usuarios, nuevoUsuario];
    guardarUsuarios(usuarios);
    renderizarTablaUsuarios();

    Swal.fire({
      title: "¡Cuenta creada!",
      html: `Bienvenido/a <strong>${nuevoUsuario.nombres}</strong>. Tu nacionalidad registrada es <strong>${paisElegido.nombre}</strong>.`,
      icon: "success",
      confirmButtonColor: "#0E3B36",
    });
    notificar("Usuario registrado correctamente.");

    formulario.reset();
    paisElegido = null;
    mostrarPaisSeleccionado(paisSeleccionadoDiv, null);
  });
}

/* ============================================================
   Página de clima (API contextual Open-Meteo)
   ============================================================ */
function inicializarClima() {
  const selector = document.getElementById("selectorCiudades");
  const resultado = document.getElementById("resultadoClima");

  selector.innerHTML = CIUDADES_CLIMA
    .map((c, indice) => `<button type="button" class="chip-ciudad${indice === 0 ? " activo" : ""}" data-indice="${indice}">${c.nombre}</button>`)
    .join("");

  async function mostrarClima(indice) {
    const ciudad = CIUDADES_CLIMA[indice];
    resultado.innerHTML = `<div class="spinner"></div>`;
    try {
      const clima = await obtenerClima(ciudad.lat, ciudad.lon);
      const [descripcion, icono] = describirClima(clima.weather_code);
      resultado.innerHTML = `
        <div class="tarjeta-clima" style="max-width:340px; margin:0 auto;">
          <h3>${ciudad.nombre}</h3>
          <div class="temp">${icono} ${Math.round(clima.temperature_2m)}°C</div>
          <p>${descripcion}</p>
          <p>Humedad relativa: ${clima.relative_humidity_2m}%</p>
          <p>Viento: ${clima.wind_speed_10m} km/h</p>
        </div>`;
    } catch (error) {
      resultado.innerHTML = `<p class="mensaje-vacio">No se pudo obtener el clima de ${ciudad.nombre}: ${error.message}</p>`;
    }
  }

  selector.addEventListener("click", (evento) => {
    const chip = evento.target.closest(".chip-ciudad");
    if (!chip) return;
    selector.querySelectorAll(".chip-ciudad").forEach((c) => c.classList.remove("activo"));
    chip.classList.add("activo");
    mostrarClima(Number(chip.dataset.indice));
  });

  mostrarClima(0);
}

/* ============================================================
   Página de contacto
   ============================================================ */
function inicializarContacto() {
  const formulario = document.getElementById("formularioContacto");
  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const valido = validarFormularioContacto(formulario);
    if (!valido) {
      notificar("Revisa los campos marcados en rojo.", "error");
      return;
    }
    Swal.fire({
      title: "Mensaje enviado",
      text: "Gracias por escribirnos, te responderemos a la brevedad.",
      icon: "success",
      confirmButtonColor: "#0E3B36",
    });
    notificar("Tu mensaje fue enviado.");
    formulario.reset();
  });
}
