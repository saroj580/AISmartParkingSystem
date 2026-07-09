import { env } from "@/lib/env";
import { createModuleLogger } from "@/lib/logger";
import { BadRequestError } from "@/errors/AppError";

const log = createModuleLogger("google-maps");

export interface GeocodedAddress {
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

/** Geocodes a free-text address into coordinates. Used when operators create parking lots. */
export async function geocodeAddress(address: string): Promise<GeocodedAddress> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": `${env.APP_NAME} (${env.APP_URL})`,  // required by Nominatim policy
      Accept: "application/json",
    },
  });
  // ... parses lat/lon/display_name — no API key needed
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance in kilometers, used for nearby-lot search alongside the DB bounding-box filter. */
export function haversineDistanceKm(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number }
): number {
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Bounding box (in degrees) for a radius search — a cheap pre-filter before precise haversine ranking. */
export function boundingBoxForRadius(latitude: number, longitude: number, radiusKm: number) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(toRadians(latitude)));

  return {
    minLat: latitude - latDelta,
    maxLat: latitude + latDelta,
    minLng: longitude - lngDelta,
    maxLng: longitude + lngDelta,
  };
}
