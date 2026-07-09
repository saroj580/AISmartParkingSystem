"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { divIcon } from "leaflet"; 
import "leaflet/dist/leaflet.css";

// Brand-colored SVG pin as a divIcon — avoids Leaflet's default marker
// image assets, which break under bundlers without asset-path patching.
const pinIcon = divIcon({
  className: "",
  html: `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.3));">
      <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.25 6.55 11.62 6.83 11.89a1 1 0 0 0 1.34 0c.28-.27 6.83-6.64 6.83-11.89C19.5 5.36 16.14 2 12 2Z" fill="#4f46e5"/>
      <circle cx="12" cy="9.5" r="3" fill="white"/>
    </svg>`,
  iconSize: [34, 34],
  iconAnchor: [17, 32],
  popupAnchor: [0, -30],
});

export default function LotMapInner({
  latitude,
  longitude,
  name,
  address,
}: {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={false}
      className="z-0 h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={pinIcon}>
        <Popup>
          <span className="text-[13px] font-semibold">{name}</span>
          <br />
          <span className="text-xs">{address}</span>
        </Popup>
      </Marker>
    </MapContainer>
  );
}