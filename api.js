/* ============================================================
   ViajaYa · api.js
   Responsable de: fetch a archivos JSON locales y a las APIs
   externas (países, clima). Todo error se maneja aquí y se
   propaga como una excepción controlada hacia quien invoque.
   ============================================================ */

const RUTAS_JSON = {
  destinos: "../json/destinos.json",
  categorias: "../json/categorias.json",
  usuarios: "../json/usuarios.json",
};

// Desde index.html (raíz) las rutas no llevan "../"
const RUTAS_JSON_RAIZ = {
  destinos: "json/destinos.json",
  categorias: "json/categorias.json",
  usuarios: "json/usuarios.json",
};

/**
 * Carga un archivo JSON local mediante fetch.
 * @param {"destinos"|"categorias"|"usuarios"} clave
 * @returns {Promise<Array>}
 */
async function cargarJSON(clave) {
  const enRaiz = !location.pathname.includes("/pages/");
  const ruta = (enRaiz ? RUTAS_JSON_RAIZ : RUTAS_JSON)[clave];
  if (!ruta) throw new Error(`No existe una ruta configurada para "${clave}".`);

  const respuesta = await fetch(ruta);
  if (!respuesta.ok) {
    throw new Error(`No fue posible cargar ${clave}.json (estado ${respuesta.status}).`);
  }
  try {
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) throw new Error("formato inesperado");
    return datos;
  } catch (error) {
    throw new Error(`El archivo ${clave}.json no contiene un JSON válido.`);
  }
}

/**
 * Consulta la API de países (nombre y bandera) para el selector de nacionalidad.
 * Ante cualquier fallo de red o de formato retorna una lista de respaldo mínima,
 * para que el formulario de registro nunca quede bloqueado.
 */
async function obtenerPaises() {
  try {
    const respuesta = await fetch("https://countries.dev/countries");
    if (!respuesta.ok) throw new Error(`Respuesta ${respuesta.status}`);
    const datos = await respuesta.json();
    const lista = Array.isArray(datos) ? datos : (datos.data || datos.countries || []);

    const normalizados = lista
      .map((p) => ({
        nombre: p.name?.common || p.name || p.nombre || "",
        codigo: p.cca2 || p.code || p.codigo || "",
        bandera: p.flags?.png || p.flag || p.bandera || "",
      }))
      .filter((p) => p.nombre);

    if (!normalizados.length) throw new Error("lista vacía");
    return normalizados.sort((a, b) => a.nombre.localeCompare(b.nombre));
  } catch (error) {
    console.error("Fallo al consultar la API de países:", error.message);
    return PAISES_RESPALDO;
  }
}

/** Lista mínima de respaldo, usada solo si la API de países no responde. */
const PAISES_RESPALDO = [
  { nombre: "Ecuador", codigo: "EC", bandera: "https://flagcdn.com/w80/ec.png" },
  { nombre: "Colombia", codigo: "CO", bandera: "https://flagcdn.com/w80/co.png" },
  { nombre: "Perú", codigo: "PE", bandera: "https://flagcdn.com/w80/pe.png" },
  { nombre: "México", codigo: "MX", bandera: "https://flagcdn.com/w80/mx.png" },
  { nombre: "España", codigo: "ES", bandera: "https://flagcdn.com/w80/es.png" },
  { nombre: "Argentina", codigo: "AR", bandera: "https://flagcdn.com/w80/ar.png" },
  { nombre: "Chile", codigo: "CL", bandera: "https://flagcdn.com/w80/cl.png" },
];

/** Ciudades de salida disponibles para consultar el clima (Open-Meteo). */
const CIUDADES_CLIMA = [
  { nombre: "Santo Domingo", lat: -0.25, lon: -79.15 },
  { nombre: "Quevedo", lat: -1.03, lon: -79.46 },
  { nombre: "Quito", lat: -0.18, lon: -78.47 },
  { nombre: "Guayaquil", lat: -2.17, lon: -79.90 },
];

/**
 * Consulta el clima actual (Open-Meteo) para una coordenada.
 * @param {number} lat
 * @param {number} lon
 */
async function obtenerClima(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;
  const respuesta = await fetch(url);
  if (!respuesta.ok) throw new Error(`El servicio de clima respondió con estado ${respuesta.status}.`);
  const datos = await respuesta.json();
  if (!datos.current) throw new Error("La respuesta del clima no tiene el formato esperado.");
  return datos.current;
}

/** Traduce el código de clima de Open-Meteo a una descripción y un ícono simple. */
function describirClima(codigo) {
  const mapa = {
    0: ["Cielo despejado", "☀️"], 1: ["Mayormente despejado", "🌤️"], 2: ["Parcialmente nublado", "⛅"],
    3: ["Nublado", "☁️"], 45: ["Neblina", "🌫️"], 48: ["Neblina con escarcha", "🌫️"],
    51: ["Llovizna ligera", "🌦️"], 61: ["Lluvia ligera", "🌧️"], 63: ["Lluvia moderada", "🌧️"],
    65: ["Lluvia fuerte", "🌧️"], 80: ["Chubascos", "🌦️"], 95: ["Tormenta eléctrica", "⛈️"],
  };
  return mapa[codigo] || ["Condición no disponible", "🌡️"];
}
