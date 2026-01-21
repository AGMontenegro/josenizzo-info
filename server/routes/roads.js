import express from 'express';

const router = express.Router();

// Cache para almacenar datos y no hacer tantas peticiones
let roadsCache = {
  data: null,
  lastFetch: 0
};

const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos

// Rutas principales de Vaca Muerta y zona petrolera
const VACA_MUERTA_ROUTES = [
  'RP 7',   // Añelo - corazón de Vaca Muerta
  'RP 8',   // Acceso a yacimientos
  'RP 17',  // Conexión logística
  'RP 51',  // Ruta petrolera
  'RP 69',  // Zona de operaciones
  'RN 22',  // Ruta nacional principal
  'RN 151', // Conexión con Mendoza
  'RN 40',  // Ruta 40
  'RN 237', // Hacia Confluencia
];

// Parsear el CSV de Vialidad Neuquén
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const roads = [];

  // Saltar la primera línea (header)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // El CSV tiene formato: Ruta,Tipo,Tramo,Estado,Observaciones
    const parts = line.split(';');
    if (parts.length >= 4) {
      const ruta = parts[0]?.trim() || '';
      const tipo = parts[1]?.trim() || '';
      const tramo = parts[2]?.trim() || '';
      const estado = parts[3]?.trim() || '';
      const observaciones = parts[4]?.trim() || '';

      roads.push({
        ruta,
        tipo,
        tramo,
        estado,
        observaciones
      });
    }
  }

  return roads;
}

// Filtrar rutas relevantes para Vaca Muerta
function filterVacaMuertaRoutes(allRoads) {
  return allRoads.filter(road => {
    const rutaNormalizada = road.ruta.toUpperCase().replace(/\s+/g, ' ');
    return VACA_MUERTA_ROUTES.some(vr => {
      const vrNormalizada = vr.toUpperCase();
      return rutaNormalizada.includes(vrNormalizada) ||
             rutaNormalizada.includes(vrNormalizada.replace(' ', ''));
    });
  });
}

// Determinar el estado general de una ruta
function getStatusColor(estado, observaciones) {
  const texto = `${estado} ${observaciones}`.toLowerCase();

  if (texto.includes('cortada') || texto.includes('intransitable') || texto.includes('cerrada')) {
    return 'red'; // Peligro/Cerrada
  }
  if (texto.includes('precaución') || texto.includes('tcp') || texto.includes('barro') ||
      texto.includes('poceado') || texto.includes('deteriorad') || texto.includes('obra')) {
    return 'yellow'; // Precaución
  }
  if (texto.includes('despejada') || texto.includes('normal') || texto.includes('buena')) {
    return 'green'; // Normal
  }
  return 'yellow'; // Por defecto, precaución
}

// GET /api/roads/status - Obtener estado de rutas de Vaca Muerta
router.get('/status', async (req, res) => {
  try {
    const now = Date.now();

    // Usar cache si está disponible y no ha expirado
    if (roadsCache.data && (now - roadsCache.lastFetch) < CACHE_DURATION) {
      return res.json(roadsCache.data);
    }

    let roadData = {
      lastUpdate: new Date().toISOString(),
      source: 'Dirección Provincial de Vialidad del Neuquén',
      routes: []
    };

    try {
      // Intentar obtener el CSV de Vialidad Neuquén
      const response = await fetch('https://w2.dpvneuquen.gov.ar/ParteDiario.csv', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });

      if (response.ok) {
        const csvText = await response.text();
        const allRoads = parseCSV(csvText);
        const vacaMuertaRoads = filterVacaMuertaRoutes(allRoads);

        roadData.routes = vacaMuertaRoads.map(road => ({
          ...road,
          statusColor: getStatusColor(road.estado, road.observaciones)
        }));
      }
    } catch (err) {
      console.warn('Error fetching road status from Vialidad:', err.message);
    }

    // Si no hay datos, usar valores por defecto
    if (roadData.routes.length === 0) {
      roadData.routes = [
        { ruta: 'RP 7', tramo: 'Neuquén - Añelo', estado: 'TCP', observaciones: 'Tránsito intenso', statusColor: 'yellow' },
        { ruta: 'RP 17', tramo: 'Zona Vaca Muerta', estado: 'TCP', observaciones: 'Equipos operando', statusColor: 'yellow' },
        { ruta: 'RN 22', tramo: 'Neuquén - Zapala', estado: 'Despejada', observaciones: '', statusColor: 'green' },
        { ruta: 'RN 151', tramo: 'Neuquén - Mendoza', estado: 'Despejada', observaciones: '', statusColor: 'green' },
      ];
      roadData.source = 'Datos estimados - Sin conexión a Vialidad';
    }

    // Guardar en cache
    roadsCache = {
      data: roadData,
      lastFetch: now
    };

    res.json(roadData);
  } catch (error) {
    console.error('Error fetching road status:', error);
    res.json(roadsCache.data || {
      lastUpdate: new Date().toISOString(),
      source: 'Error - Datos no disponibles',
      routes: []
    });
  }
});

// GET /api/roads/summary - Resumen rápido del estado de rutas
router.get('/summary', async (req, res) => {
  try {
    const now = Date.now();

    // Usar cache si está disponible
    if (roadsCache.data && (now - roadsCache.lastFetch) < CACHE_DURATION) {
      const routes = roadsCache.data.routes;
      const summary = {
        total: routes.length,
        normal: routes.filter(r => r.statusColor === 'green').length,
        precaucion: routes.filter(r => r.statusColor === 'yellow').length,
        cerradas: routes.filter(r => r.statusColor === 'red').length,
        lastUpdate: roadsCache.data.lastUpdate
      };
      return res.json(summary);
    }

    // Si no hay cache, devolver valores por defecto
    res.json({
      total: 4,
      normal: 2,
      precaucion: 2,
      cerradas: 0,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error getting road summary:', error);
    res.status(500).json({ error: 'Error obteniendo resumen de rutas' });
  }
});

export default router;
