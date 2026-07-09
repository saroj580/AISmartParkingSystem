"use client";

import { useRouter } from "next/navigation";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import type { ParkingLot } from "@/types/domain";
import { formatCurrency } from "@/lib/format";

function pinIcon(active: boolean) {
  const color = active ? "#2ecc71" : "#4f46e5";
  return divIcon({
    className: "",
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgb(0 0 0 / 0.3));">
        <path d="M12 2C7.86 2 4.5 5.36 4.5 9.5c0 5.25 6.55 11.62 6.83 11.89a1 1 0 0 0 1.34 0c.28-.27 6.83-6.64 6.83-11.89C19.5 5.36 16.14 2 12 2Z" fill="${color}"/>
        <circle cx="12" cy="9.5" r="3" fill="white"/>
      </svg>`,
    iconSize: [32, 32],
    iconAnchor: [16, 30],
    popupAnchor: [0, -28],
  });
}

function FitBounds({ lots }: { lots: ParkingLot[] }) {
  const map = useMap();
  useEffect(() => {
    if (lots.length === 0) return;
    if (lots.length === 1) {
      map.setView([lots[0]!.latitude, lots[0]!.longitude], 15);
      return;
    }
    const bounds = lots.map((l) => [l.latitude, l.longitude] as [number, number]);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [lots, map]);
  return null;
}

export default function NearbyLotsMapInner({
  lots,
  activeLotId,
}: {
  lots: ParkingLot[];
  activeLotId?: string;
}) {
  const router = useRouter();
  const center: [number, number] = lots[0] ? [lots[0].latitude, lots[0].longitude] : [20.5937, 78.9629];

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom className="z-0 h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds lots={lots} />
      {lots.map((lot) => (
        <Marker
          key={lot.id}
          position={[lot.latitude, lot.longitude]}
          icon={pinIcon(lot.id === activeLotId)}
          eventHandlers={{ click: () => router.push(`/driver/parking/${lot.id}`) }}
        >
          <Popup>
            <span className="text-[13px] font-semibold">{lot.name}</span>
            <br />
            <span className="text-xs">{lot.addressLine}, {lot.city}</span>
            <br />
            <span className="text-xs font-medium">{formatCurrency(lot.pricing.FOUR_WHEELER.baseRatePerHour)}/hr from</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
