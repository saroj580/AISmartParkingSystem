import { v2 as cloudinary } from "cloudinary";
import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export async function uploadImageFromBase64(dataUri: string, folder: string): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `smart-parking/${folder}`,
    resource_type: "image",
  });
  return result.secure_url;
}

export async function deleteImageByUrl(secureUrl: string): Promise<void> {
  const publicId = extractPublicId(secureUrl);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

function extractPublicId(secureUrl: string): string | null {
  const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match?.[1] ?? null;
}
