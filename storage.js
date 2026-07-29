/* ============================================================
   ViajaYa · storage.js
   Los archivos JSON son la fuente inicial de información.
   A partir de la primera ejecución, localStorage conserva las
   operaciones de registro, edición y eliminación entre sesiones.
   ============================================================ */

const CLAVES = {
  destinos: "viajaya_destinos",
  categorias: "viajaya_categorias",
  usuarios: "viajaya_usuarios",
  inicializado: "viajaya_inicializado",
};

/** Lee un arreglo desde localStorage; retorna [] si no existe o está corrupto. */
function leerStorage(clave) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo ? JSON.parse(crudo) : [];
  } catch (error) {
    console.error(`No fue posible leer "${clave}" de localStorage:`, error);
    return [];
  }
}

function guardarStorage(clave, arreglo) {
  localStorage.setItem(clave, JSON.stringify(arreglo));
}

/**
 * Garantiza que localStorage tenga datos. En la primera ejecución los
 * carga desde los archivos JSON mediante fetch; en las siguientes
 * ejecuciones reutiliza lo que ya está almacenado en el navegador.
 */
async function inicializarDatos() {
  const yaInicializado = localStorage.getItem(CLAVES.inicializado);
  if (yaInicializado) {
    return {
      destinos: leerStorage(CLAVES.destinos),
      categorias: leerStorage(CLAVES.categorias),
      usuarios: leerStorage(CLAVES.usuarios),
    };
  }

  const [destinos, categorias, usuarios] = await Promise.all([
    cargarJSON("destinos"),
    cargarJSON("categorias"),
    cargarJSON("usuarios"),
  ]);

  guardarStorage(CLAVES.destinos, destinos);
  guardarStorage(CLAVES.categorias, categorias);
  guardarStorage(CLAVES.usuarios, usuarios);
  localStorage.setItem(CLAVES.inicializado, "true");

  return { destinos, categorias, usuarios };
}

/** Restablece localStorage con los datos originales de los archivos JSON. */
async function restablecerDatos() {
  const [destinos, categorias, usuarios] = await Promise.all([
    cargarJSON("destinos"),
    cargarJSON("categorias"),
    cargarJSON("usuarios"),
  ]);
  guardarStorage(CLAVES.destinos, destinos);
  guardarStorage(CLAVES.categorias, categorias);
  guardarStorage(CLAVES.usuarios, usuarios);
  localStorage.setItem(CLAVES.inicializado, "true");
  return { destinos, categorias, usuarios };
}

function obtenerDestinos() { return leerStorage(CLAVES.destinos); }
function obtenerCategorias() { return leerStorage(CLAVES.categorias); }
function obtenerUsuarios() { return leerStorage(CLAVES.usuarios); }

function guardarDestinos(lista) { guardarStorage(CLAVES.destinos, lista); }
function guardarUsuarios(lista) { guardarStorage(CLAVES.usuarios, lista); }
