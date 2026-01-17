import { useState, useEffect } from 'react';
import { MapPin, Clock, Users, Check, Building2 } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Tooltip as LeafletTooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type CoverageStatus = 'available' | 'future' | 'unavailable';

interface Cidade {
  nome: string;
  coords: [number, number];
}

interface Estado {
  sigla: string;
  nome: string;
  status: CoverageStatus;
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  cidades?: Cidade[];
  polygon?: [number, number][];
}

const estados: Estado[] = [{
  sigla: 'SC',
  nome: 'Santa Catarina',
  status: 'available',
  center: { lat: -27.5, lng: -49.5 },
  zoom: 7,
  cidades: [
    { nome: 'Florianópolis', coords: [-27.5954, -48.5480] },
    { nome: 'Joinville', coords: [-26.3045, -48.8487] },
    { nome: 'Blumenau', coords: [-26.9194, -49.0661] },
    { nome: 'Itajaí', coords: [-26.9078, -48.6619] },
    { nome: 'Balneário Camboriú', coords: [-26.9906, -48.6352] },
    { nome: 'Criciúma', coords: [-28.6723, -49.3728] },
    { nome: 'Chapecó', coords: [-27.0963, -52.6158] },
    { nome: 'Lages', coords: [-27.8159, -50.3269] },
    { nome: 'Jaraguá do Sul', coords: [-26.4851, -49.0886] },
    { nome: 'São José', coords: [-27.6136, -48.6366] },
    { nome: 'Tubarão', coords: [-28.4700, -49.0067] },
    { nome: 'Brusque', coords: [-27.0979, -48.9173] },
  ],
  polygon: [
    [-26.0, -48.5],
    [-26.0, -49.5],
    [-26.5, -50.5],
    [-27.0, -51.5],
    [-27.5, -52.5],
    [-28.0, -53.5],
    [-29.0, -53.5],
    [-29.5, -52.0],
    [-29.0, -49.5],
    [-28.0, -48.5],
    [-27.0, -48.0],
    [-26.0, -48.5],
  ]
}, {
  sigla: 'PR',
  nome: 'Paraná',
  status: 'available',
  center: { lat: -25.0, lng: -51.0 },
  zoom: 7,
  cidades: [
    { nome: 'Curitiba', coords: [-25.4290, -49.2711] },
    { nome: 'Londrina', coords: [-23.3045, -51.1696] },
    { nome: 'Maringá', coords: [-23.4205, -51.9333] },
    { nome: 'Ponta Grossa', coords: [-25.0916, -50.1668] },
    { nome: 'Cascavel', coords: [-24.9578, -53.4595] },
    { nome: 'São José dos Pinhais', coords: [-25.5384, -49.2052] },
    { nome: 'Foz do Iguaçu', coords: [-25.5163, -54.5854] },
    { nome: 'Colombo', coords: [-25.2927, -49.2266] },
    { nome: 'Guarapuava', coords: [-25.3935, -51.4619] },
    { nome: 'Paranaguá', coords: [-25.5161, -48.5225] },
    { nome: 'Araucária', coords: [-25.5926, -49.4102] },
    { nome: 'Toledo', coords: [-24.7246, -53.7430] },
  ],
  polygon: [
    [-22.5, -49.0],
    [-22.5, -51.0],
    [-23.0, -53.0],
    [-24.0, -54.5],
    [-25.5, -54.5],
    [-26.5, -54.0],
    [-26.5, -52.0],
    [-26.0, -49.0],
    [-25.0, -48.0],
    [-23.5, -48.0],
    [-22.5, -49.0],
  ]
}, {
  sigla: 'SP',
  nome: 'São Paulo',
  status: 'future',
  center: { lat: -22.9099, lng: -47.0626 },
  zoom: 7
}, {
  sigla: 'RJ',
  nome: 'Rio de Janeiro',
  status: 'future',
  center: { lat: -22.9068, lng: -43.1729 },
  zoom: 8
}, {
  sigla: 'MG',
  nome: 'Minas Gerais',
  status: 'future',
  center: { lat: -18.5122, lng: -44.5550 },
  zoom: 6
}, {
  sigla: 'RS',
  nome: 'Rio Grande do Sul',
  status: 'future',
  center: { lat: -29.6842, lng: -53.8069 },
  zoom: 7
}, {
  sigla: 'BA',
  nome: 'Bahia',
  status: 'unavailable',
  center: { lat: -12.5797, lng: -41.7007 },
  zoom: 6
}, {
  sigla: 'GO',
  nome: 'Goiás',
  status: 'unavailable',
  center: { lat: -15.8270, lng: -49.8362 },
  zoom: 6
}, {
  sigla: 'DF',
  nome: 'Distrito Federal',
  status: 'unavailable',
  center: { lat: -15.7801, lng: -47.9292 },
  zoom: 10
}, {
  sigla: 'CE',
  nome: 'Ceará',
  status: 'unavailable',
  center: { lat: -5.4984, lng: -39.3206 },
  zoom: 7
}, {
  sigla: 'PE',
  nome: 'Pernambuco',
  status: 'unavailable',
  center: { lat: -8.3286, lng: -37.9820 },
  zoom: 7
}, {
  sigla: 'ES',
  nome: 'Espírito Santo',
  status: 'unavailable',
  center: { lat: -19.1834, lng: -40.3089 },
  zoom: 7
}, {
  sigla: 'MT',
  nome: 'Mato Grosso',
  status: 'unavailable',
  center: { lat: -12.6819, lng: -56.9211 },
  zoom: 6
}, {
  sigla: 'MS',
  nome: 'Mato Grosso do Sul',
  status: 'unavailable',
  center: { lat: -20.7722, lng: -54.7852 },
  zoom: 6
}, {
  sigla: 'PA',
  nome: 'Pará',
  status: 'unavailable',
  center: { lat: -3.4168, lng: -52.2161 },
  zoom: 5
}, {
  sigla: 'AM',
  nome: 'Amazonas',
  status: 'unavailable',
  center: { lat: -3.4168, lng: -65.8561 },
  zoom: 5
}];

function getStatusTextColor(status: CoverageStatus): string {
  switch (status) {
    case 'available': return 'text-green-600';
    case 'future': return 'text-yellow-600';
    case 'unavailable': return 'text-red-600';
  }
}

function getStatusLabel(status: CoverageStatus): string {
  switch (status) {
    case 'available': return 'Cobertura disponível';
    case 'future': return 'Em breve';
    case 'unavailable': return 'Sem cobertura';
  }
}

function getPolygonColor(status: CoverageStatus): string {
  switch (status) {
    case 'available': return '#22c55e';
    case 'future': return '#eab308';
    case 'unavailable': return '#ef4444';
  }
}

// Component to update map center when state changes
function MapUpdater({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.flyTo([center.lat, center.lng], zoom, {
      duration: 1
    });
  }, [center, zoom, map]);
  
  return null;
}

export function Coverage() {
  const [selectedEstado, setSelectedEstado] = useState<Estado>(estados.find(e => e.sigla === 'SC')!);

  const handleEstadoClick = (estado: Estado) => {
    setSelectedEstado(estado);
  };

  const availableStates = estados.filter(e => e.status === 'available');
  const futureStates = estados.filter(e => e.status === 'future');
  const unavailableStates = estados.filter(e => e.status === 'unavailable');

  return (
    <section id="cobertura" className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-secondary/30 to-background">
      <div className="section-container px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <span className="badge-neutral mb-3 md:mb-4 inline-flex bg-primary text-primary-foreground text-xs md:text-sm">
            Cobertura Nacional
          </span>
          <h2 className="section-title text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">Onde Atuamos</h2>
          <p className="section-subtitle mx-auto text-sm md:text-base lg:text-lg">
            Confira nossa área de cobertura e os estados onde atuamos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Map Area */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="hero-card !p-0 overflow-hidden rounded-xl">
              <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3] min-h-[250px] sm:min-h-[300px]">
                <MapContainer
                  center={[selectedEstado.center.lat, selectedEstado.center.lng]}
                  zoom={selectedEstado.zoom}
                  className="w-full h-full z-0"
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapUpdater center={selectedEstado.center} zoom={selectedEstado.zoom} />
                  
                  {/* Render polygons for available states */}
                  {estados.filter(e => e.polygon).map(estado => (
                    <Polygon
                      key={estado.sigla}
                      positions={estado.polygon!}
                      pathOptions={{
                        color: getPolygonColor(estado.status),
                        fillColor: getPolygonColor(estado.status),
                        fillOpacity: estado.sigla === selectedEstado.sigla ? 0.4 : 0.2,
                        weight: estado.sigla === selectedEstado.sigla ? 3 : 2,
                      }}
                      eventHandlers={{
                        click: () => handleEstadoClick(estado),
                      }}
                    >
                      <LeafletTooltip permanent={estado.sigla === selectedEstado.sigla}>
                        <span className="font-semibold">{estado.nome}</span>
                      </LeafletTooltip>
                    </Polygon>
                  ))}
                </MapContainer>
                
                {/* Legend */}
                <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 bg-background/95 backdrop-blur-sm px-3 py-2 md:px-4 md:py-3 rounded-lg md:rounded-xl shadow-lg z-[1000]">
                  <p className="text-[10px] md:text-xs font-semibold text-foreground mb-1.5 md:mb-2">Legenda</p>
                  <div className="flex flex-col gap-1 md:gap-1.5">
                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                      <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Cobertura ativa</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                      <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500" />
                      <span className="text-muted-foreground">Em breve</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs">
                      <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">Sem cobertura</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6 order-1 lg:order-2">
            {/* Selected State Info */}
            <div className="section-card p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4 mb-4 md:mb-6">
                <div className="icon-container w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-foreground">
                    {selectedEstado.nome}
                  </h3>
                  <p className={`text-xs md:text-sm font-medium ${getStatusTextColor(selectedEstado.status)}`}>
                    {getStatusLabel(selectedEstado.status)}
                  </p>
                </div>
              </div>

              {selectedEstado.status === 'available' && (
                <ul className="space-y-2 md:space-y-3">
                  <li className="feature-check text-sm">
                    <span className="feature-check-icon w-4 h-4 md:w-5 md:h-5">
                      <Check className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </span>
                    <span>Atendimento 24 horas</span>
                  </li>
                  <li className="feature-check text-sm">
                    <span className="feature-check-icon w-4 h-4 md:w-5 md:h-5">
                      <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </span>
                    <span>Tempo médio de chegada: 30 minutos</span>
                  </li>
                  <li className="feature-check text-sm">
                    <span className="feature-check-icon w-4 h-4 md:w-5 md:h-5">
                      <Users className="w-2.5 h-2.5 md:w-3 md:h-3" />
                    </span>
                    <span>+100 guinchos parceiros</span>
                  </li>
                </ul>
              )}

              {selectedEstado.status === 'future' && (
                <p className="text-muted-foreground text-xs md:text-sm">
                  Estamos expandindo nossa rede de parceiros para este estado. Em breve você poderá contar com nossos serviços aqui!
                </p>
              )}

              {selectedEstado.status === 'unavailable' && (
                <p className="text-muted-foreground text-xs md:text-sm">
                  Ainda não atuamos neste estado, mas estamos sempre crescendo. Fique de olho nas novidades!
                </p>
              )}
            </div>

            {/* Cities for available states */}
            {selectedEstado.status === 'available' && selectedEstado.cidades && (
              <div className="section-card p-4 md:p-6">
                <h4 className="font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                  <Building2 className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Cidades com Cobertura em {selectedEstado.sigla}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedEstado.cidades.map(cidade => (
                    <div 
                      key={cidade.nome}
                      className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                      <span className="truncate">{cidade.nome}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* States by Status */}
            <div className="section-card p-4 md:p-6">
              <h4 className="font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-green-500" />
                Cobertura disponível
              </h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                {availableStates.map(estado => (
                  <button 
                    key={estado.sigla} 
                    onClick={() => handleEstadoClick(estado)} 
                    className={selectedEstado.sigla === estado.sigla 
                      ? 'px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-green-500 text-white' 
                      : 'px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors'}
                  >
                    {estado.sigla}
                  </button>
                ))}
              </div>

              <h4 className="font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500" />
                Em breve
              </h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-4 md:mb-6">
                {futureStates.map(estado => (
                  <button 
                    key={estado.sigla} 
                    onClick={() => handleEstadoClick(estado)} 
                    className={selectedEstado.sigla === estado.sigla 
                      ? 'px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-yellow-500 text-white' 
                      : 'px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition-colors'}
                  >
                    {estado.sigla}
                  </button>
                ))}
              </div>

              <h4 className="font-bold text-foreground mb-3 md:mb-4 flex items-center gap-2 text-sm md:text-base">
                <span className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-500" />
                Sem cobertura
              </h4>
              <div className="flex flex-wrap gap-1.5 md:gap-2">
                {unavailableStates.map(estado => (
                  <button 
                    key={estado.sigla} 
                    onClick={() => handleEstadoClick(estado)} 
                    className={selectedEstado.sigla === estado.sigla 
                      ? 'px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-red-500 text-white' 
                      : 'px-2.5 py-1 md:px-3 md:py-1.5 rounded-full text-xs md:text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors'}
                  >
                    {estado.sigla}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
