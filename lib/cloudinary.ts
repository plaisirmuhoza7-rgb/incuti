import { v2 as cloudinary } from 'cloudinary';

let isCloudinaryConfigured = false;

// Lazy initialization inside function, never module top-level
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  if (!isCloudinaryConfigured) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    isCloudinaryConfigured = true;
  }

  return cloudinary;
}

export async function uploadImageToCloudinary(
  base64OrDataUri: string,
  folder: string = 'incuti_farm_scans'
): Promise<{ url: string; public_id: string }> {
  const cld = getCloudinary();

  if (!cld) {
    console.warn('Cloudinary environment variables not set. Using local base64/fallback data URI.');
    // If base64 is already a valid data URI, return it directly so image rendering still works!
    const fallbackId = `local_${Date.now()}`;
    return {
      url: base64OrDataUri,
      public_id: fallbackId,
    };
  }

  try {
    const uploadRes = await cld.uploader.upload(base64OrDataUri, {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    return {
      url: uploadRes.secure_url,
      public_id: uploadRes.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Fallback to data URI rather than failing completely
    return {
      url: base64OrDataUri,
      public_id: `fallback_${Date.now()}`,
    };
  }
}
