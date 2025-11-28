import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';

interface Waypoint {
  lat: number;
  lng: number;
  elev: number;
  sequence: number;
}

interface CesiumMapProps {
  waypoints?: Waypoint[];
  onMapClick?: (lat: number, lng: number, elev: number) => void;
  onCursorMove?: (lat: number, lng: number, elev: number) => void;
}

const CoordinateTracker: React.FC<{
  onMapClick?: (lat: number, lng: number, elev: number) => void;
  onCursorMove?: (lat: number, lng: number, elev: number) => void;
  setCoords: React.Dispatch<React.SetStateAction<{ lat: number; lng: number; elev: number }>>;
}> = ({ onMapClick, onCursorMove, setCoords }) => {
  useMapEvents({
    click(e) {
      const elev = 900;
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, elev });
      onMapClick?.(e.latlng.lat, e.latlng.lng, elev);
    },
    mousemove(e) {
      const elev = 900;
      setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, elev });
      onCursorMove?.(e.latlng.lat, e.latlng.lng, elev);
    },
  });
  return null;
};

const CesiumMap: React.FC<CesiumMapProps> = ({
  waypoints = [],
  onMapClick,
  onCursorMove,
}) => {
  const [coordinates, setCoordinates] = React.useState({ lat: 28.5895, lng: 77.1637, elev: 900 });

  // prepare positions array for polyline
  const polylinePositions: [number, number][] = waypoints.map(wp => [wp.lat, wp.lng]);

  return (
    <div className="relative w-full h-full [z-index:1]">
      <MapContainer

        center={[28.5895, 77.1637]}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >

        <div>
          <TileLayer
            // url="/tiles/{z}/{x}/{y}.png"
            url="dist\DELHI_MAPTILES_0 TO 19/{z}/{x}/{y}.png"
            minZoom={8}
            maxZoom={19}
            attribution="Created by QGIS"
          />
        </div>
        <CoordinateTracker
          onMapClick={onMapClick}
          onCursorMove={onCursorMove}
          setCoords={setCoordinates}
        />

        {/* ← NEW: render each waypoint as a circle marker */}
        {waypoints.map((wp) => (
          <CircleMarker
            key={wp.sequence}
            center={[wp.lat, wp.lng]}
            radius={8}
            pathOptions={{ color: 'blue', fillColor: 'white', weight: 6 }}
          />
        ))}

        {/* ← NEW: connect waypoints in order */}
        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: 'blue', weight: 4, dashArray: '4 2' }}
          />
        )}
      </MapContainer>

      <Card className="absolute top-4 left-14 p-3 bg-white/90 backdrop-blur border-blue-200 [z-index:10000000] shadow-lg">
        <div className="text-sm font-mono">
          <div className="text-blue-700 font-semibold">COORDINATES</div>
          <div className="text-gray-700">LAT: {coordinates.lat.toFixed(6)}°</div>           <div className="text-gray-700">LNG: {coordinates.lng.toFixed(6)}°</div>          <div className="text-gray-700">ELV: {coordinates.elev.toFixed(0)} ft</div>
        </div>
      </Card>

      <Card className="absolute top-4 right-4 p-3 bg-secondary/80 backdrop-blur border-tactical-green/30">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-tactical-green rounded-full animate-pulse"></div>
          <span className="text-sm font-mono text-tactical-green" >MAP ONLINE</span>
        </div>
      </Card>
    </div>
  );
};

export default CesiumMap;

