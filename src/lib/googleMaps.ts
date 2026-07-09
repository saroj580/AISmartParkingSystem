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
  if (!env.GOOGLE_MAPS_API_KEY) {
    throw new BadRequestError("Geocoding is not configured on this server");
  }

  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", address);
  url.searchParams.set("key", env.GOOGLE_MAPS_API_KEY);

  const response = await fetch(url.toString());
  if (!response.ok) {
    log.error({ status: response.status }, "Google Maps geocoding request failed");
    throw new BadRequestError("Failed to geocode address");
  }

  const payload = (await response.json()) as {
    status: string;
    results: Array<{
      formatted_address: string;
      geometry: { location: { lat: number; lng: number } };
    }>;
  };

  if (payload.status !== "OK" || payload.results.length === 0) {
    throw new BadRequestError(`Unable to geocode address: ${payload.status}`);
  }

  const result = payload.results[0];
  if (!result) {
    throw new BadRequestError(`Unable to geocode address: ${payload.status}`);
  }

  return {
    latitude: result.geometry.location.lat,
    longitude: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
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
