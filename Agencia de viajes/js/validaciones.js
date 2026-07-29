/* ============================================================
   ViajaYa · validaciones.js
   Funciones puras de validación reutilizadas por los distintos
   formularios. Cada función retorna true/false; el módulo
   componentes.js se encarga de mostrar el mensaje en el DOM.
   ============================================================ */

function esRequerido(valor) {
  return typeof valor === "string" ? valor.trim().length > 0 : valor !== null && valor !== undefined;
}

function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function esNumeroPositivo(valor) {
  return !isNaN(valor) && Number(valor) > 0;
}

function esFechaValida(valor) {
  return !isNaN(new Date(valor).getTime());
}

function esUrlOimagenValida(valor) {
  if (!valor) return true; // opcional
  return /^(https?:\/\/|assets\/)/.test(valor.trim());
}

function tienenLongitudMinima(valor, minimo) {
  return typeof valor === "string" && valor.trim().length >= minimo;
}

/**
 * Marca visualmente un campo como inválido o válido y muestra el mensaje de error.
 * @param {HTMLElement} campoContenedor elemento .campo que envuelve el input
 * @param {boolean} esValido
 */
function marcarCampo(campoContenedor, esValido) {
  campoContenedor.classList.toggle("campo--invalido", !esValido);
  return esValido;
}

/**
 * Valida el formulario de registro/edición de un destino.
 * @returns {{valido: boolean, datos: object}}
 */
function validarFormularioDestino(form, listaDestinos, idEnEdicion = null) {
  let valido = true;

  const nombre = form.nombre.value.trim();
  valido = marcarCampo(form.nombre.closest(".campo"), tienenLongitudMinima(nombre, 3)) && valido;

  const categoriaId = form.categoriaId.value;
  valido = marcarCampo(form.categoriaId.closest(".campo"), esRequerido(categoriaId)) && valido;

  const descripcion = form.descripcion.value.trim();
  valido = marcarCampo(form.descripcion.closest(".campo"), tienenLongitudMinima(descripcion, 10)) && valido;

  const precio = form.precio.value;
  valido = marcarCampo(form.precio.closest(".campo"), esNumeroPositivo(precio)) && valido;

  const duracionDias = form.duracionDias.value;
  valido = marcarCampo(form.duracionDias.closest(".campo"), esNumeroPositivo(duracionDias)) && valido;

  const destino = form.destino.value.trim();
  valido = marcarCampo(form.destino.closest(".campo"), esRequerido(destino)) && valido;

  const imagen = form.imagen.value.trim();
  valido = marcarCampo(form.imagen.closest(".campo"), esUrlOimagenValida(imagen)) && valido;

  return {
    valido,
    datos: {
      nombre,
      categoriaId: Number(categoriaId),
      descripcion,
      precio: Number(precio),
      duracionDias: Number(duracionDias),
      destino,
      ciudadSalida: form.ciudadSalida.value.trim() || "Santo Domingo",
      imagen: imagen || "assets/img/generico.jpg",
      estado: form.estado.value,
      cuposDisponibles: Number(form.cupos.value) || 0,
      valoracion: Number(form.valoracion.value) || 4.5,
    },
  };
}

/** Valida el formulario de registro de usuario (sección 8). */
function validarFormularioUsuario(form, paisSeleccionado) {
  let valido = true;

  valido = marcarCampo(form.nombres.closest(".campo"), tienenLongitudMinima(form.nombres.value, 2)) && valido;
  valido = marcarCampo(form.apellidos.closest(".campo"), tienenLongitudMinima(form.apellidos.value, 2)) && valido;
  valido = marcarCampo(form.correo.closest(".campo"), esCorreoValido(form.correo.value)) && valido;
  valido = marcarCampo(form.clave.closest(".campo"), tienenLongitudMinima(form.clave.value, 6)) && valido;
  valido = marcarCampo(form.confirmarClave.closest(".campo"), form.confirmarClave.value === form.clave.value && form.clave.value !== "") && valido;
  valido = marcarCampo(form.telefono.closest(".campo"), tienenLongitudMinima(form.telefono.value, 7)) && valido;
  valido = marcarCampo(form.nacionalidad.closest(".campo"), !!paisSeleccionado) && valido;
  valido = marcarCampo(form.terminos.closest(".campo"), form.terminos.checked) && valido;

  return valido;
}

/** Valida el formulario de contacto. */
function validarFormularioContacto(form) {
  let valido = true;
  valido = marcarCampo(form.nombre.closest(".campo"), tienenLongitudMinima(form.nombre.value, 2)) && valido;
  valido = marcarCampo(form.correo.closest(".campo"), esCorreoValido(form.correo.value)) && valido;
  valido = marcarCampo(form.mensaje.closest(".campo"), tienenLongitudMinima(form.mensaje.value, 10)) && valido;
  return valido;
}
