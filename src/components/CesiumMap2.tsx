// // geoserver map (user_dashobard and admin)
// import React, { useEffect, useRef } from 'react';
// import {
//   MapContainer,
//   TileLayer,
//   useMapEvents,
//   CircleMarker,
//   Polyline,
//   useMap,
//   Marker,
//   Popup,
//   LayersControl,
// } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Card } from '@/components/ui/card';

// interface Waypoint {
//   flight_id: string;
//   lat: number;
//   lng: number;
//   elev: number;
//   sequence: number;
// }

// interface SearchLocation {
//   lat: number;
//   lng: number;
//   name?: string;
// }

// interface User {
//   id: string;
//   username: string;
//   operatorCategoryName?: string;
//   commandName?: string;
//   divisionName?: string;
//   brigadeName?: string;
//   corpsName?: string;
//   unit?: string;
// }

// interface CesiumMapProps {
//   waypoints?: Waypoint[];
//   center?: { lat: number; lng: number };
//   zoom?: number;
//   onMapClick?: (lat: number, lng: number, elev: number) => void;
//   onCursorMove?: (lat: number, lng: number, elev: number) => void;
//   searchLocation?: SearchLocation | null;
//   selectedUser?: User | null;
// }

// // Create custom search marker icon
// const createSearchIcon = () => {
//   return L.divIcon({
//     html: `
//       <div style="
//         background-color: #ef4444;
//         border: 3px solid white;
//         border-radius: 50%;
//         width: 24px;
//         height: 24px;
//         box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         animation: pulse 2s infinite;
//       ">
//         <div style="
//           background-color: white;
//           border-radius: 50%;
//           width: 8px;
//           height: 8px;
//         "></div>
//       </div>
//       <style>
//         @keyframes pulse {
//           0% { transform: scale(1); }
//           50% { transform: scale(1.2); }
//           100% { transform: scale(1); }
//         }
//       </style>
//     `,
//     className: 'custom-search-marker',
//     iconSize: [24, 24],
//     iconAnchor: [12, 12],
//     popupAnchor: [0, -12],
//   });
// };

// // Component to handle GeoServer layers
//   const GeoServerLayers: React.FC = () => {
//     const map = useMap();
//     const GEOSERVER_URL = 'http://localhost:8080/geoserver/wms';
//     const WORKSPACE = 'AIRSPACE';
//     const RASTER_LAYER = 'INDIA IMAGE';
  
//     useEffect(() => {
//       let baseLayer: L.TileLayer.WMS;
//       let FiveKMLayer: L.TileLayer.WMS;
//       let EightKMLayer: L.TileLayer.WMS;
//       let TwoevelKMLayer : L.TileLayer.WMS;
    
//       let layerControl: L.Control.Layers;
  
    
  
//       // Define GeoServer WMS layers
//       baseLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:${RASTER_LAYER}`,
//         format: 'image/png',
//         transparent: false,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         attribution: '&copy; Your Attribution',
//         maxZoom: 18,
//         minZoom: 5,
//         opacity: 1,
//       });
  
//       FiveKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:5 KM`,
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         zIndex: 10,
//         maxZoom: 18,
//         minZoom: 5,
//       });
  
//       EightKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:8 KM`,
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         zIndex: 11,
//         maxZoom: 18,
//         minZoom: 5,
//       });
//       TwoevelKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:12 KM`,
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         zIndex: 11,
//         maxZoom: 18,
//         minZoom: 5,
//       });
  
  
   
  
//       // Add layer control
//       layerControl = L.control.layers(
//         { Satellite: baseLayer },
//         {
//           '5 KM': FiveKMLayer,
//           '8 KM': EightKMLayer,
//           '12 KM': TwoevelKMLayer, 
     
//         },
//         { position: 'topright' }
//       ).addTo(map);

//     // Style layer control
//     const styleLayerControl = () => {
//       const control = document.querySelector('.leaflet-control-layers');
//       if (control) {
        
//         const inputs = control.querySelectorAll('input, label');
//         inputs.forEach((el) => {
//           el.setAttribute(
//             'style',
//             'cursor: pointer; color: #e5e7eb; font-family: Inter, sans-serif; font-size: 14px;'
//           );
//         });
//       }
//     };

//     styleLayerControl();




//     // Add base layer to map
//     map.addLayer(baseLayer);

//     // Function to generate GetFeatureInfo URL
//     const getFeatureInfoUrl = (latlng: L.LatLng, layers: string, queryLayers: string) => {
//       const point = map.latLngToContainerPoint(latlng);
//       const size = map.getSize();
//       const params = {
//         request: 'GetFeatureInfo',
//         service: 'WMS',
//         srs: 'EPSG:4326',
//         styles: '',
//         transparent: 'true',
//         version: '1.1.0',
//         format: 'image/png',
//         bbox: map.getBounds().toBBoxString(),
//         height: size.y.toString(),
//         width: size.x.toString(),
//         layers,
//         query_layers: queryLayers,
//         info_format: 'application/json',
//         feature_count: '20',
//         x: Math.round(point.x).toString(),
//         y: Math.round(point.y).toString(),
//       };
//       return `${GEOSERVER_URL}?${new URLSearchParams(params).toString()}`;
//     };

//     // Handle single click for landslide points
//     const handleMapSingleClick = (e: L.LeafletMouseEvent) => {
//       const url = getFeatureInfoUrl(
//         e.latlng,
//         `${WORKSPACE}:5KM`,
//         `${WORKSPACE}:5KM`
//       );
//       fetch(url)
//         .then((response) => {
//           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//           return response.json();
//         })
//         .then((data) => {
     
//           const features = data.features || [];
//           let content = `
//             <div style="
//               background: rgba(31, 41, 55, 0.95);
//               padding: 15px;
//               border-radius: 12px;
//               font-family: Inter, sans-serif;
//               line-height: 1.5;
//               color: #e5e7eb;
//             ">
//               <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
//                 Airspace Details
//               </h3>
//               <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
//           `;

//           if (features.length === 0) {
//             content += `
//               <li style="margin-bottom: 8px;">No data available.</li>
//             `;
//           } else {
//             features.forEach((feature: any) => {
//               const props = feature.properties;
              
//               content += `
//                 <li style="display: flex; margin-bottom: 8px;">
//                   <span style="font-weight: 600; color: #f3f4f6; min-width: 100px;">Name:</span>
//                   <span style="margin-left: 8px;">${props.name || 'Unknown'}</span>
//                 </li>
//                 <li style="display: flex; margin-bottom: 8px;">
//                   <span style="font-weight: 600; color: #f3f4f6; min-width: 100px;">GPS Code:</span>
//                   <span style="margin-left: 8px;">${props.gps_code || 'Unknown'}</span>
//                 </li>
                
              
//               `;
//             });
//           }

//           content += `</ul></div>`;
//           L.popup({
//             maxWidth: 320,
//             className: 'custom-leaflet-popup',
//           })
//             .setLatLng(e.latlng)
//             .setContent(content)
//             .openOn(map);
//         })
//         .catch((error) => {
//           console.error('Error fetching landslide info:', error);
//           L.popup({
//             maxWidth: 320,
//             className: 'custom-leaflet-popup',
//           })
//             .setLatLng(e.latlng)
//             .setContent(`
//               <div style="
//                 background: rgba(31, 41, 55, 0.95);
//                 padding: 15px;
//                 border-radius: 12px;
//                 font-family: Inter, sans-serif;
//                 line-height: 1.5;
//                 color: #e5e7eb;
//               ">
//                 <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
//                   Error
//                 </h3>
//                 <p>Unable to fetch landslide details. Please try again.</p>
//               </div>
//             `)
//             .openOn(map);
//         });
//     };

    

//     // Add click and double-click event handlers
//     map.on('click', handleMapSingleClick);
  
//     // Cleanup
//     return () => {
    
//       layerControl.remove();
//       map.off('click', handleMapSingleClick);
    
//     };
//   }, [map]);

//   return null;
// };

// // Component to handle map center and zoom changes
// const MapController: React.FC<{
//   center?: { lat: number; lng: number };
//   zoom?: number;
// }> = ({ center, zoom }) => {
//   const map = useMap();

//   useEffect(() => {
//     if (center && zoom) {
//       map.setView([center.lat, center.lng], zoom, {
//         animate: true,
//         duration: 1.0,
//       });
//     }
//   }, [map, center, zoom]);

//   return null;
// };

// // Component to open popup for the first waypoint
// const AutoOpenPopup: React.FC<{
//   waypoints: Waypoint[];
//   selectedUser: User | null;
// }> = ({ waypoints, selectedUser }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (waypoints.length > 0 && waypoints[0].sequence === 1 && selectedUser) {
//       console.log('Opening popup for first waypoint:', {
//         waypoint: waypoints[0],
//         user: selectedUser,
//       });
//       map.openPopup(
//         L.popup()
//           .setLatLng([waypoints[0].lat, waypoints[0].lng])
//           .setContent(`
//             <div style="background-color: rgba(255, 255, 255, 0.9); padding: 10px; border-radius: 5px;">
//               <div style="font-weight: bold; color: #1e40af;">User: ${selectedUser.username || 'Unknown'}</div>
//               <div>Category: ${selectedUser.operatorCategoryName || 'N/A'}</div>
//               <div>Command: ${selectedUser.commandName || 'N/A'}</div>
//               <div>Unit: ${selectedUser.unit || 'N/A'}</div>
//               <div>Waypoint: ${waypoints[0].sequence}</div>
//             </div>
//           `),
//       );
//     }
//   }, [map, waypoints, selectedUser]);
//   return null;
// };

// const CoordinateTracker: React.FC<{
//   onMapClick?: (lat: number, lng: number, elev: number) => void;
//   onCursorMove?: (lat: number, lng: number, elev: number) => void;
//   setCoords: React.Dispatch<
//     React.SetStateAction<{ lat: number; lng: number; elev: number }>
//   >;
// }> = ({ onMapClick, onCursorMove, setCoords }) => {
//   useMapEvents({
//     click(e) {
//       const elev = 900;
//       setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, elev });
//       onMapClick?.(e.latlng.lat, e.latlng.lng, elev);
//     },
//     mousemove(e) {
//       const elev = 900;
//       setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, elev });
//       onCursorMove?.(e.latlng.lat, e.latlng.lng, elev);
//     },
//   });
//   return null;
// };

// const CesiumMap: React.FC<CesiumMapProps> = ({
//   waypoints = [],
//   center,
//   zoom,
//   onMapClick,
//   onCursorMove,
//   searchLocation,
//   selectedUser,
// }) => {
//   const [coordinates, setCoordinates] = React.useState({
//     lat: 28.584296,
//     lng: 77.191487,
//     elev: 900,
//   });

//   // Debug waypoints and polyline data
//   useEffect(() => {
//     const polylinePositions = waypoints.map((wp) => [wp.lat, wp.lng]);
//     console.log('CesiumMap Props:', {
//       waypoints: waypoints.map((w) => ({
//         flight_id: w.flight_id,
//         lat: w.lat,
//         lng: w.lng,
//         sequence: w.sequence,
//         elev: w.elev,
//       })),
//       polylinePositions,
//       waypointsLength: waypoints.length,
//       validWaypoints: waypoints.filter(
//         (w) => typeof w.lat === 'number' && !isNaN(w.lat) && typeof w.lng === 'number' && !isNaN(w.lng),
//       ).length,
//       selectedUser,
//       center,
//       zoom,
//       searchLocation,
//     });
//   }, [waypoints, selectedUser, center, zoom, searchLocation]);

//   // Default center and zoom if not provided
//   const defaultCenter: [number, number] = [22.0, 80.0];
//   const defaultZoom = 6;

//   // Use provided center and zoom, or defaults
//   const mapCenter: [number, number] = center ? [center.lat, center.lng] : defaultCenter;
//   const mapZoom = zoom || defaultZoom;

//   const polylinePositions: [number, number][] = waypoints.map((wp) => [wp.lat, wp.lng]);

//   return (
//     <div className="relative w-full h-full [z-index:1]">
//       <MapContainer
//         center={mapCenter}
//         zoom={mapZoom}
//         style={{ width: '100%', height: '100%' }}
//         attributionControl={false}
//       >
//         <GeoServerLayers />

//         <MapController center={center} zoom={zoom} />

//         <div className="[z-index:10000000000]">
//           <CoordinateTracker
//             onMapClick={onMapClick}
//             onCursorMove={onCursorMove}
//             setCoords={setCoordinates}
//           />

//           <AutoOpenPopup waypoints={waypoints} selectedUser={selectedUser} />

//           {waypoints.map((wp) => (
//             <CircleMarker
//               key={wp.sequence}
//               center={[wp.lat, wp.lng]}
//               radius={6}
//               pathOptions={{ color: 'blue', fillColor: 'white', weight: 2 }}
//               eventHandlers={{
//                 click: () => {
//                   setCoordinates({ lat: wp.lat, lng: wp.lng, elev: wp.elev });
//                   onMapClick?.(wp.lat, wp.lng, wp.elev);
//                 },
//               }}
//             >
//               {wp.sequence === 1 && selectedUser && (
//                 <Popup>
//                   <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px', borderRadius: '5px' }}>
//                     <div style={{ fontWeight: 'bold', color: '#1e40af' }}>
//                       User: {selectedUser.username || 'Unknown'}
//                     </div>
//                     <div>Category: {selectedUser.operatorCategoryName || 'N/A'}</div>
//                     <div>Command: {selectedUser.commandName || 'N/A'}</div>
//                     <div>Unit: {selectedUser.unit || 'N/A'}</div>
//                     <div>Waypoint: {wp.sequence}</div>
//                   </div>
//                 </Popup>
//               )}
//             </CircleMarker>
//           ))}

//           {searchLocation && (
//             <Marker
//               position={[searchLocation.lat, searchLocation.lng]}
//               icon={createSearchIcon()}
//             >
//               <Popup>
//                 <div className="text-center">
//                   <div className="font-semibold text-red-600 mb-1">Search Result</div>
//                   <div className="text-sm text-gray-700">
//                     <div>Lat: {searchLocation.lat.toFixed(6)}°</div>
//                     <div>Lng: {searchLocation.lng.toFixed(6)}°</div>
//                   </div>
//                   {searchLocation.name && (
//                     <div className="text-xs text-gray-500 mt-1">
//                       {searchLocation.name}
//                     </div>
//                   )}
//                 </div>
//               </Popup>
//             </Marker>
//           )}
//         </div>

//         {polylinePositions.length > 1 && (
//           <Polyline
//             positions={polylinePositions}
//             pathOptions={{ color: 'blue', weight: 2, dashArray: '4 2' }}
//           />
//         )}
//       </MapContainer>

//       <Card className="absolute top-4 left-14 p-3 bg-white/90 backdrop-blur border-blue-200 [z-index:10000000] shadow-lg">
//         <div className="text-sm font-mono">
//           <div className="text-blue-700 font-semibold">COORDINATES</div>
//           <div className="text-gray-700">LAT: {coordinates.lat.toFixed(6)}°</div>
//           <div className="text-gray-700">LNG: {coordinates.lng.toFixed(6)}°</div>
//           <div className="text-gray-700">ELV: {coordinates.elev.toFixed(0)} ft</div>
//         </div>
//       </Card>

      

      
//     </div>
//   );
// };

// export default CesiumMap;





// // geoserver map (user_dashobard and admin)
// import React, { useEffect, useRef } from 'react';
// import {
//   MapContainer,
//   TileLayer,
//   useMapEvents,
//   CircleMarker,
//   Polyline,
//   useMap,
//   Marker,
//   Popup,
//   LayersControl,
// } from 'react-leaflet';
// import L from 'leaflet';
// import 'leaflet/dist/leaflet.css';
// import { Card } from '@/components/ui/card';

// interface Waypoint {
//   flight_id: string;
//   lat: number;
//   lng: number;
//   elev: number;
//   sequence: number;
// }

// interface SearchLocation {
//   lat: number;
//   lng: number;
//   name?: string;
// }

// interface User {
//   id: string;
//   username: string;
//   operatorCategoryName?: string;
//   commandName?: string;
//   divisionName?: string;
//   brigadeName?: string;
//   corpsName?: string;
//   unit?: string;
// }

// interface CesiumMapProps {
//   waypoints?: Waypoint[];
//   center?: { lat: number; lng: number };
//   zoom?: number;
//   onMapClick?: (lat: number, lng: number, elev: number) => void;
//   onCursorMove?: (lat: number, lng: number, elev: number) => void;
//   searchLocation?: SearchLocation | null;
//   selectedUser?: User | null;
// }

// // Create custom search marker icon
// const createSearchIcon = () => {
//   return L.divIcon({
//     html: `
//       <div style="
//         background-color: #ef4444;
//         border: 3px solid white;
//         border-radius: 50%;
//         width: 24px;
//         height: 24px;
//         box-shadow: 0 2px 8px rgba(0,0,0,0.3);
//         display: flex;
//         align-items: center;
//         justify-content: center;
//         animation: pulse 2s infinite;
//       ">
//         <div style="
//           background-color: white;
//           border-radius: 50%;
//           width: 8px;
//           height: 8px;
//         "></div>
//       </div>
//       <style>
//         @keyframes pulse {
//           0% { transform: scale(1); }
//           50% { transform: scale(1.2); }
//           100% { transform: scale(1); }
//         }
//       </style>
//     `,
//     className: 'custom-search-marker',
//     iconSize: [24, 24],
//     iconAnchor: [12, 12],
//     popupAnchor: [0, -12],
//   });
// };

// // Component to handle GeoServer layers
//   const GeoServerLayers: React.FC = () => {
//     const map = useMap();
//     const GEOSERVER_URL = 'http://localhost:8080/geoserver/wms';
//     const WORKSPACE = 'AIRSPACE';
//     const RASTER_LAYER = 'INDIA IMAGE';
  
//     useEffect(() => {
//       let baseLayer: L.TileLayer.WMS;
//       let FiveKMLayer: L.TileLayer.WMS;
//       let EightKMLayer: L.TileLayer.WMS;
//       let TwoevelKMLayer : L.TileLayer.WMS;
    
//       let layerControl: L.Control.Layers;
  
    
  
//       // Define GeoServer WMS layers
//       baseLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:${RASTER_LAYER}`,
//         format: 'image/png',
//         transparent: false,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         attribution: '&copy; Your Attribution',
//         maxZoom: 18,
//         minZoom: 5,
//         opacity: 1,
//       });
  
//       FiveKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:5 KM`,
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         zIndex: 10,
//         maxZoom: 18,
//         minZoom: 5,
//       });
  
//       EightKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:8 KM`,
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         zIndex: 11,
//         maxZoom: 18,
//         minZoom: 5,
//       });
//       TwoevelKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
//         layers: `${WORKSPACE}:12 KM`,
//         format: 'image/png',
//         transparent: true,
//         version: '1.1.0',
//         crs: L.CRS.EPSG4326,
//         zIndex: 11,
//         maxZoom: 18,
//         minZoom: 5,
//       });
  
  
   
  
//       // Add layer control
//       layerControl = L.control.layers(
//         { Satellite: baseLayer },
//         {
//           '5 KM': FiveKMLayer,
//           '8 KM': EightKMLayer,
//           '12 KM': TwoevelKMLayer, 
     
//         },
//         { position: 'topright' }
//       ).addTo(map);

//     // Style layer control
//     const styleLayerControl = () => {
//       const control = document.querySelector('.leaflet-control-layers');
//       if (control) {
        
//         const inputs = control.querySelectorAll('input, label');
//         inputs.forEach((el) => {
//           el.setAttribute(
//             'style',
//             'cursor: pointer; color: #e5e7eb; font-family: Inter, sans-serif; font-size: 14px;'
//           );
//         });
//       }
//     };

//     styleLayerControl();




//     // Add base layer to map
//     map.addLayer(baseLayer);

//     // Function to generate GetFeatureInfo URL
//     const getFeatureInfoUrl = (latlng: L.LatLng, layers: string, queryLayers: string) => {
//       const point = map.latLngToContainerPoint(latlng);
//       const size = map.getSize();
//       const params = {
//         request: 'GetFeatureInfo',
//         service: 'WMS',
//         srs: 'EPSG:4326',
//         styles: '',
//         transparent: 'true',
//         version: '1.1.0',
//         format: 'image/png',
//         bbox: map.getBounds().toBBoxString(),
//         height: size.y.toString(),
//         width: size.x.toString(),
//         layers,
//         query_layers: queryLayers,
//         info_format: 'application/json',
//         feature_count: '20',
//         x: Math.round(point.x).toString(),
//         y: Math.round(point.y).toString(),
//       };
//       return `${GEOSERVER_URL}?${new URLSearchParams(params).toString()}`;
//     };

//     // Handle single click for landslide points
//     const handleMapSingleClick = (e: L.LeafletMouseEvent) => {
//       const url = getFeatureInfoUrl(
//         e.latlng,
//         `${WORKSPACE}:5KM`,
//         `${WORKSPACE}:5KM`
//       );
//       fetch(url)
//         .then((response) => {
//           if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
//           return response.json();
//         })
//         .then((data) => {
     
//           const features = data.features || [];
//           let content = `
//             <div style="
//               background: rgba(31, 41, 55, 0.95);
//               padding: 15px;
//               border-radius: 12px;
//               font-family: Inter, sans-serif;
//               line-height: 1.5;
//               color: #e5e7eb;
//             ">
//               <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
//                 Airspace Details
//               </h3>
//               <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
//           `;

//           if (features.length === 0) {
//             content += `
//               <li style="margin-bottom: 8px;">No data available.</li>
//             `;
//           } else {
//             features.forEach((feature: any) => {
//               const props = feature.properties;
              
//               content += `
//                 <li style="display: flex; margin-bottom: 8px;">
//                   <span style="font-weight: 600; color: #f3f4f6; min-width: 100px;">Name:</span>
//                   <span style="margin-left: 8px;">${props.name || 'Unknown'}</span>
//                 </li>
//                 <li style="display: flex; margin-bottom: 8px;">
//                   <span style="font-weight: 600; color: #f3f4f6; min-width: 100px;">GPS Code:</span>
//                   <span style="margin-left: 8px;">${props.gps_code || 'Unknown'}</span>
//                 </li>
                
              
//               `;
//             });
//           }

//           content += `</ul></div>`;
//           L.popup({
//             maxWidth: 320,
//             className: 'custom-leaflet-popup',
//           })
//             .setLatLng(e.latlng)
//             .setContent(content)
//             .openOn(map);
//         })
//         .catch((error) => {
//           console.error('Error fetching landslide info:', error);
//           L.popup({
//             maxWidth: 320,
//             className: 'custom-leaflet-popup',
//           })
//             .setLatLng(e.latlng)
//             .setContent(`
//               <div style="
//                 background: rgba(31, 41, 55, 0.95);
//                 padding: 15px;
//                 border-radius: 12px;
//                 font-family: Inter, sans-serif;
//                 line-height: 1.5;
//                 color: #e5e7eb;
//               ">
//                 <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
//                   Error
//                 </h3>
//                 <p>Unable to fetch landslide details. Please try again.</p>
//               </div>
//             `)
//             .openOn(map);
//         });
//     };

    

//     // Add click and double-click event handlers
//     map.on('click', handleMapSingleClick);
  
//     // Cleanup
//     return () => {
    
//       layerControl.remove();
//       map.off('click', handleMapSingleClick);
    
//     };
//   }, [map]);

//   return null;
// };

// // Component to handle map center and zoom changes
// const MapController: React.FC<{
//   center?: { lat: number; lng: number };
//   zoom?: number;
// }> = ({ center, zoom }) => {
//   const map = useMap();

//   useEffect(() => {
//     if (center && zoom) {
//       map.setView([center.lat, center.lng], zoom, {
//         animate: true,
//         duration: 1.0,
//       });
//     }
//   }, [map, center, zoom]);

//   return null;
// };

// // Component to open popup for the first waypoint
// const AutoOpenPopup: React.FC<{
//   waypoints: Waypoint[];
//   selectedUser: User | null;
// }> = ({ waypoints, selectedUser }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (waypoints.length > 0 && waypoints[0].sequence === 1 && selectedUser) {
//       console.log('Opening popup for first waypoint:', {
//         waypoint: waypoints[0],
//         user: selectedUser,
//       });
//       map.openPopup(
//         L.popup()
//           .setLatLng([waypoints[0].lat, waypoints[0].lng])
//           .setContent(`
//             <div style="background-color: rgba(255, 255, 255, 0.9); padding: 10px; border-radius: 5px;">
//               <div style="font-weight: bold; color: #1e40af;">User: ${selectedUser.username || 'Unknown'}</div>
//               <div>Category: ${selectedUser.operatorCategoryName || 'N/A'}</div>
//               <div>Command: ${selectedUser.commandName || 'N/A'}</div>
//               <div>Unit: ${selectedUser.unit || 'N/A'}</div>
//               <div>Waypoint: ${waypoints[0].sequence}</div>
//             </div>
//           `),
//       );
//     }
//   }, [map, waypoints, selectedUser]);
//   return null;
// };

// const CoordinateTracker: React.FC<{
//   onMapClick?: (lat: number, lng: number, elev: number) => void;
//   onCursorMove?: (lat: number, lng: number, elev: number) => void;
//   setCoords: React.Dispatch<
//     React.SetStateAction<{ lat: number; lng: number; elev: number }>
//   >;
// }> = ({ onMapClick, onCursorMove, setCoords }) => {
//   useMapEvents({
//     click(e) {
//       const elev = 900;
//       setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, elev });
//       onMapClick?.(e.latlng.lat, e.latlng.lng, elev);
//     },
//     mousemove(e) {
//       const elev = 900;
//       setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, elev });
//       onCursorMove?.(e.latlng.lat, e.latlng.lng, elev);
//     },
//   });
//   return null;
// };

// const CesiumMap: React.FC<CesiumMapProps> = ({
//   waypoints = [],
//   center,
//   zoom,
//   onMapClick,
//   onCursorMove,
//   searchLocation,
//   selectedUser,
// }) => {
//   const [coordinates, setCoordinates] = React.useState({
//     lat: 28.584296,
//     lng: 77.191487,
//     elev: 900,
//   });

//   // Debug waypoints and polyline data
//   useEffect(() => {
//     const polylinePositions = waypoints.map((wp) => [wp.lat, wp.lng]);
//     console.log('CesiumMap Props:', {
//       waypoints: waypoints.map((w) => ({
//         flight_id: w.flight_id,
//         lat: w.lat,
//         lng: w.lng,
//         sequence: w.sequence,
//         elev: w.elev,
//       })),
//       polylinePositions,
//       waypointsLength: waypoints.length,
//       validWaypoints: waypoints.filter(
//         (w) => typeof w.lat === 'number' && !isNaN(w.lat) && typeof w.lng === 'number' && !isNaN(w.lng),
//       ).length,
//       selectedUser,
//       center,
//       zoom,
//       searchLocation,
//     });
//   }, [waypoints, selectedUser, center, zoom, searchLocation]);

//   // Default center and zoom if not provided
//   const defaultCenter: [number, number] = [22.0, 80.0];
//   const defaultZoom = 6;

//   // Use provided center and zoom, or defaults
//   const mapCenter: [number, number] = center ? [center.lat, center.lng] : defaultCenter;
//   const mapZoom = zoom || defaultZoom;

//   const polylinePositions: [number, number][] = waypoints.map((wp) => [wp.lat, wp.lng]);

//   return (
//     <div className="relative w-full h-full [z-index:1]">
//       <MapContainer
//         center={mapCenter}
//         zoom={mapZoom}
//         style={{ width: '100%', height: '100%' }}
//         attributionControl={false}
//       >
//         <TileLayer
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//         />
//         <GeoServerLayers />

//         <MapController center={center} zoom={zoom} />

//         <div className="[z-index:10000000000]">
//           <CoordinateTracker
//             onMapClick={onMapClick}
//             onCursorMove={onCursorMove}
//             setCoords={setCoordinates}
//           />

//           <AutoOpenPopup waypoints={waypoints} selectedUser={selectedUser} />

//           {waypoints.map((wp) => (
//             <CircleMarker
//               key={wp.sequence}
//               center={[wp.lat, wp.lng]}
//               radius={6}
//               pathOptions={{ color: 'blue', fillColor: 'white', weight: 2 }}
//               eventHandlers={{
//                 click: () => {
//                   setCoordinates({ lat: wp.lat, lng: wp.lng, elev: wp.elev });
//                   onMapClick?.(wp.lat, wp.lng, wp.elev);
//                 },
//               }}
//             >
//               {wp.sequence === 1 && selectedUser && (
//                 <Popup>
//                   <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px', borderRadius: '5px' }}>
//                     <div style={{ fontWeight: 'bold', color: '#1e40af' }}>
//                       User: {selectedUser.username || 'Unknown'}
//                     </div>
//                     <div>Category: {selectedUser.operatorCategoryName || 'N/A'}</div>
//                     <div>Command: {selectedUser.commandName || 'N/A'}</div>
//                     <div>Unit: {selectedUser.unit || 'N/A'}</div>
//                     <div>Waypoint: {wp.sequence}</div>
//                   </div>
//                 </Popup>
//               )}
//             </CircleMarker>
//           ))}

//           {searchLocation && (
//             <Marker
//               position={[searchLocation.lat, searchLocation.lng]}
//               icon={createSearchIcon()}
//             >
//               <Popup>
//                 <div className="text-center">
//                   <div className="font-semibold text-red-600 mb-1">Search Result</div>
//                   <div className="text-sm text-gray-700">
//                     <div>Lat: {searchLocation.lat.toFixed(6)}°</div>
//                     <div>Lng: {searchLocation.lng.toFixed(6)}°</div>
//                   </div>
//                   {searchLocation.name && (
//                     <div className="text-xs text-gray-500 mt-1">
//                       {searchLocation.name}
//                     </div>
//                   )}
//                 </div>
//               </Popup>
//             </Marker>
//           )}
//         </div>

//         {polylinePositions.length > 1 && (
//           <Polyline
//             positions={polylinePositions}
//             pathOptions={{ color: 'blue', weight: 2, dashArray: '4 2' }}
//           />
//         )}
//       </MapContainer>

//       <Card className="absolute top-4 left-14 p-3 bg-white/90 backdrop-blur border-blue-200 [z-index:10000000] shadow-lg">
//         <div className="text-sm font-mono">
//           <div className="text-blue-700 font-semibold">COORDINATES</div>
//           <div className="text-gray-700">LAT: {coordinates.lat.toFixed(6)}°</div>
//           <div className="text-gray-700">LNG: {coordinates.lng.toFixed(6)}°</div>
//           <div className="text-gray-700">ELV: {coordinates.elev.toFixed(0)} ft</div>
//         </div>
//       </Card>

      

      
//     </div>
//   );
// };

// export default CesiumMap;




// geoserver map (user_dashobard and admin)
import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  CircleMarker,
  Polyline,
  useMap,
  Marker,
  Popup,
  LayersControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';

interface Waypoint {
  flight_id: string;
  lat: number;
  lng: number;
  elev: number;
  sequence: number;
}

interface FlightPath {
  id: string;
  waypoints: Waypoint[];
  color: string;
  status: string;
  isSelected: boolean;
}

interface SearchLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface User {
  id: string;
  username: string;
  operatorCategoryName?: string;
  commandName?: string;
  divisionName?: string;
  brigadeName?: string;
  corpsName?: string;
  unit?: string;
}

interface CesiumMapProps {
  flightPaths?: FlightPath[];
  waypoints?: Waypoint[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number, elev: number) => void;
  onCursorMove?: (lat: number, lng: number, elev: number) => void;
  searchLocation?: SearchLocation | null;
  selectedUser?: User | null;
}

// Create custom search marker icon
const createSearchIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        background-color: #ef4444;
        border: 3px solid white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s infinite;
      ">
        <div style="
          background-color: white;
          border-radius: 50%;
          width: 8px;
          height: 8px;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      </style>
    `,
    className: 'custom-search-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component to handle GeoServer layers
  const GeoServerLayers: React.FC = () => {
    const map = useMap();
    const GEOSERVER_URL = 'http://localhost:8080/geoserver/wms';
    const WORKSPACE = 'AIRSPACE';
    const RASTER_LAYER = 'INDIA IMAGE';
  
    useEffect(() => {
      let baseLayer: L.TileLayer.WMS;
      let FiveKMLayer: L.TileLayer.WMS;
      let EightKMLayer: L.TileLayer.WMS;
      let TwoevelKMLayer : L.TileLayer.WMS;
    
      let layerControl: L.Control.Layers;
  
    
  
      // Define GeoServer WMS layers
      baseLayer = L.tileLayer.wms(GEOSERVER_URL, {
        layers: `${WORKSPACE}:${RASTER_LAYER}`,
        format: 'image/png',
        transparent: false,
        version: '1.1.0',
        crs: L.CRS.EPSG4326,
        attribution: '&copy; Your Attribution',
        maxZoom: 18,
        minZoom: 5,
        opacity: 1,
      });
  
      FiveKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
        layers: `${WORKSPACE}:5 KM`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        crs: L.CRS.EPSG4326,
        zIndex: 10,
        maxZoom: 18,
        minZoom: 5,
      });
  
      EightKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
        layers: `${WORKSPACE}:8 KM`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        crs: L.CRS.EPSG4326,
        zIndex: 11,
        maxZoom: 18,
        minZoom: 5,
      });
      TwoevelKMLayer = L.tileLayer.wms(GEOSERVER_URL, {
        layers: `${WORKSPACE}:12 KM`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        crs: L.CRS.EPSG4326,
        zIndex: 11,
        maxZoom: 18,
        minZoom: 5,
      });
  
  
   
  
      // Add layer control
      layerControl = L.control.layers(
        { Satellite: baseLayer },
        {
          '5 KM': FiveKMLayer,
          '8 KM': EightKMLayer,
          '12 KM': TwoevelKMLayer, 
     
        },
        { position: 'topright' }
      ).addTo(map);

    // Style layer control
    const styleLayerControl = () => {
      const control = document.querySelector('.leaflet-control-layers');
      if (control) {
        
        const inputs = control.querySelectorAll('input, label');
        inputs.forEach((el) => {
          el.setAttribute(
            'style',
            'cursor: pointer; color: #e5e7eb; font-family: Inter, sans-serif; font-size: 14px;'
          );
        });
      }
    };

    styleLayerControl();




    // Add base layer to map
    map.addLayer(baseLayer);

    // Function to generate GetFeatureInfo URL
    const getFeatureInfoUrl = (latlng: L.LatLng, layers: string, queryLayers: string) => {
      const point = map.latLngToContainerPoint(latlng);
      const size = map.getSize();
      const params = {
        request: 'GetFeatureInfo',
        service: 'WMS',
        srs: 'EPSG:4326',
        styles: '',
        transparent: 'true',
        version: '1.1.0',
        format: 'image/png',
        bbox: map.getBounds().toBBoxString(),
        height: size.y.toString(),
        width: size.x.toString(),
        layers,
        query_layers: queryLayers,
        info_format: 'application/json',
        feature_count: '20',
        x: Math.round(point.x).toString(),
        y: Math.round(point.y).toString(),
      };
      return `${GEOSERVER_URL}?${new URLSearchParams(params).toString()}`;
    };

    // Handle single click for landslide points
    const handleMapSingleClick = (e: L.LeafletMouseEvent) => {
      const url = getFeatureInfoUrl(
        e.latlng,
        `${WORKSPACE}:5KM`,
        `${WORKSPACE}:5KM`
      );
      fetch(url)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          return response.json();
        })
        .then((data) => {
     
          const features = data.features || [];
          let content = `
            <div style="
              background: rgba(31, 41, 55, 0.95);
              padding: 15px;
              border-radius: 12px;
              font-family: Inter, sans-serif;
              line-height: 1.5;
              color: #e5e7eb;
            ">
              <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
                Airspace Details
              </h3>
              <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px;">
          `;

          if (features.length === 0) {
            content += `
              <li style="margin-bottom: 8px;">No data available.</li>
            `;
          } else {
            features.forEach((feature: any) => {
              const props = feature.properties;
              
              content += `
                <li style="display: flex; margin-bottom: 8px;">
                  <span style="font-weight: 600; color: #f3f4f6; min-width: 100px;">Name:</span>
                  <span style="margin-left: 8px;">${props.name || 'Unknown'}</span>
                </li>
                <li style="display: flex; margin-bottom: 8px;">
                  <span style="font-weight: 600; color: #f3f4f6; min-width: 100px;">GPS Code:</span>
                  <span style="margin-left: 8px;">${props.gps_code || 'Unknown'}</span>
                </li>
                
              
              `;
            });
          }

          content += `</ul></div>`;
          L.popup({
            maxWidth: 320,
            className: 'custom-leaflet-popup',
          })
            .setLatLng(e.latlng)
            .setContent(content)
            .openOn(map);
        })
        .catch((error) => {
          console.error('Error fetching landslide info:', error);
          L.popup({
            maxWidth: 320,
            className: 'custom-leaflet-popup',
          })
            .setLatLng(e.latlng)
            .setContent(`
              <div style="
                background: rgba(31, 41, 55, 0.95);
                padding: 15px;
                border-radius: 12px;
                font-family: Inter, sans-serif;
                line-height: 1.5;
                color: #e5e7eb;
              ">
                <h3 style="font-size: 18px; font-weight: 600; color: #ffffff; margin: 0 0 12px 0;">
                  Error
                </h3>
                <p>Unable to fetch landslide details. Please try again.</p>
              </div>
            `)
            .openOn(map);
        });
    };

    

    // Add click and double-click event handlers
    map.on('click', handleMapSingleClick);
  
    // Cleanup
    return () => {
    
      layerControl.remove();
      map.off('click', handleMapSingleClick);
    
    };
  }, [map]);

  return null;
};

// Component to handle map center and zoom changes
const MapController: React.FC<{
  center?: { lat: number; lng: number };
  zoom?: number;
}> = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center && zoom) {
      map.setView([center.lat, center.lng], zoom, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [map, center, zoom]);

  return null;
};

// Component to open popup for the first waypoint
const AutoOpenPopup: React.FC<{
  waypoints: Waypoint[];
  selectedUser: User | null;
}> = ({ waypoints, selectedUser }) => {
  const map = useMap();
  useEffect(() => {
    if (waypoints.length > 0 && waypoints[0].sequence === 1 && selectedUser) {
      console.log('Opening popup for first waypoint:', {
        waypoint: waypoints[0],
        user: selectedUser,
      });
      map.openPopup(
        L.popup()
          .setLatLng([waypoints[0].lat, waypoints[0].lng])
          .setContent(`
            <div style="background-color: rgba(255, 255, 255, 0.9); padding: 10px; border-radius: 5px;">
              <div style="font-weight: bold; color: #1e40af;">User: ${selectedUser.username || 'Unknown'}</div>
              <div>Category: ${selectedUser.operatorCategoryName || 'N/A'}</div>
              <div>Command: ${selectedUser.commandName || 'N/A'}</div>
              <div>Unit: ${selectedUser.unit || 'N/A'}</div>
              <div>Waypoint: ${waypoints[0].sequence}</div>
            </div>
          `),
      );
    }
  }, [map, waypoints, selectedUser]);
  return null;
};

const CoordinateTracker: React.FC<{
  onMapClick?: (lat: number, lng: number, elev: number) => void;
  onCursorMove?: (lat: number, lng: number, elev: number) => void;
  setCoords: React.Dispatch<
    React.SetStateAction<{ lat: number; lng: number; elev: number }>
  >;
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

const FlightPathsLayer: React.FC<{ flightPaths: FlightPath[] }> = ({ flightPaths }) => {
  return (
    <>
      {flightPaths.map((path) => {
        const positions = path.waypoints
          .filter((w) => typeof w.lat === 'number' && typeof w.lng === 'number' && !isNaN(w.lat) && !isNaN(w.lng))
          .map((w) => [w.lat, w.lng] as [number, number]);
        if (positions.length < 2) return null;
        return (
          <Polyline
            key={path.id}
            positions={positions}
            pathOptions={{
              color: path.color,
              weight: path.isSelected ? 4 : 2,
              opacity: 0.8,
              dashArray: path.isSelected ? undefined : '5 10',
            }}
          />
        );
      })}
    </>
  );
};

const SelectedWaypointsLayer: React.FC<{
  waypoints: Waypoint[];
  selectedUser: User | null;
  onMapClick?: (lat: number, lng: number, elev: number) => void;
  setCoords: React.Dispatch<React.SetStateAction<{ lat: number; lng: number; elev: number }>>;
}> = ({ waypoints, selectedUser, onMapClick, setCoords }) => {
  return (
    <>
      {waypoints.map((wp) => (
        <CircleMarker
          key={wp.sequence}
          center={[wp.lat, wp.lng]}
          radius={6}
          pathOptions={{ color: 'blue', fillColor: 'white', weight: 2 }}
          eventHandlers={{
            click: () => {
              setCoords({ lat: wp.lat, lng: wp.lng, elev: wp.elev });
              onMapClick?.(wp.lat, wp.lng, wp.elev);
            },
          }}
        >
          {wp.sequence === 1 && selectedUser && (
            <Popup>
              <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px', borderRadius: '5px' }}>
                <div style={{ fontWeight: 'bold', color: '#1e40af' }}>
                  User: {selectedUser.username || 'Unknown'}
                </div>
                <div>Category: {selectedUser.operatorCategoryName || 'N/A'}</div>
                <div>Command: {selectedUser.commandName || 'N/A'}</div>
                <div>Unit: {selectedUser.unit || 'N/A'}</div>
                <div>Waypoint: {wp.sequence}</div>
              </div>
            </Popup>
          )}
        </CircleMarker>
      ))}
      {waypoints.length > 1 && (
        <Polyline
          positions={waypoints.map((wp) => [wp.lat, wp.lng] as [number, number])}
          pathOptions={{ color: 'blue', weight: 3, opacity: 1 }}
        />
      )}
    </>
  );
};

const CesiumMap: React.FC<CesiumMapProps> = ({
  flightPaths = [],
  waypoints = [],
  center,
  zoom,
  onMapClick,
  onCursorMove,
  searchLocation,
  selectedUser,
}) => {
  const [coordinates, setCoordinates] = React.useState({
    lat: 28.584296,
    lng: 77.191487,
    elev: 900,
  });

  // Debug waypoints and polyline data
  useEffect(() => {
    console.log('CesiumMap Props:', {
      flightPaths: flightPaths.map((p) => ({
        id: p.id,
        waypointsCount: p.waypoints.length,
        color: p.color,
        status: p.status,
        isSelected: p.isSelected,
      })),
      selectedWaypoints: waypoints.map((w) => ({
        flight_id: w.flight_id,
        lat: w.lat,
        lng: w.lng,
        sequence: w.sequence,
        elev: w.elev,
      })),
      selectedWaypointsLength: waypoints.length,
      validSelectedWaypoints: waypoints.filter(
        (w) => typeof w.lat === 'number' && !isNaN(w.lat) && typeof w.lng === 'number' && !isNaN(w.lng),
      ).length,
      selectedUser,
      center,
      zoom,
      searchLocation,
    });
  }, [flightPaths, waypoints, selectedUser, center, zoom, searchLocation]);

  // Default center and zoom if not provided
  const defaultCenter: [number, number] = [22.0, 80.0];
  const defaultZoom = 6;

  // Use provided center and zoom, or defaults
  const mapCenter: [number, number] = center ? [center.lat, center.lng] : defaultCenter;
  const mapZoom = zoom || defaultZoom;

  return (
    <div className="relative w-full h-full [z-index:1]">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoServerLayers />

        <MapController center={center} zoom={zoom} />

        <div className="[z-index:10000000000]">
          <CoordinateTracker
            onMapClick={onMapClick}
            onCursorMove={onCursorMove}
            setCoords={setCoordinates}
          />

          <AutoOpenPopup waypoints={waypoints} selectedUser={selectedUser} />

          <FlightPathsLayer flightPaths={flightPaths} />

          <SelectedWaypointsLayer
            waypoints={waypoints}
            selectedUser={selectedUser}
            onMapClick={onMapClick}
            setCoords={setCoordinates}
          />

          {searchLocation && (
            <Marker
              position={[searchLocation.lat, searchLocation.lng]}
              icon={createSearchIcon()}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-red-600 mb-1">Search Result</div>
                  <div className="text-sm text-gray-700">
                    <div>Lat: {searchLocation.lat.toFixed(6)}°</div>
                    <div>Lng: {searchLocation.lng.toFixed(6)}°</div>
                  </div>
                  {searchLocation.name && (
                    <div className="text-xs text-gray-500 mt-1">
                      {searchLocation.name}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
        </div>
      </MapContainer>

      <Card className="absolute top-4 left-14 p-3 bg-white/90 backdrop-blur border-blue-200 [z-index:10000000] shadow-lg">
        <div className="text-sm font-mono">
          <div className="text-blue-700 font-semibold">COORDINATES</div>
          <div className="text-gray-700">LAT: {coordinates.lat.toFixed(6)}°</div>
          <div className="text-gray-700">LNG: {coordinates.lng.toFixed(6)}°</div>
          <div className="text-gray-700">ELV: {coordinates.elev.toFixed(0)} ft</div>
        </div>
      </Card>

      

      
    </div>
  );
};

export default CesiumMap;