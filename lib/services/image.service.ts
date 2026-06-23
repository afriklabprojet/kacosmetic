import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadProductImage(
  file: Buffer,
  productSlug: string
): Promise<{ url: string; blurHash: string }> {
  const result = await new Promise<{ secure_url: string; width: number; height: number }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder:         `kacosmetic/products/${productSlug}`,
            transformation: [{ quality: "auto:best", fetch_format: "webp" }],
          },
          (err, res) => {
            if (err || !res) return reject(err)
            resolve(res as { secure_url: string; width: number; height: number })
          }
        )
        .end(file)
    }
  )

  const blurHash = cloudinary.url(result.secure_url, {
    transformation: [
      { width: 30, height: 38, crop: "fill" },
      { quality: 1, fetch_format: "webp" },
      { effect: "blur:1000" },
    ],
  })

  return { url: result.secure_url, blurHash }
}

export async function uploadRituelMedia(
  file: Buffer,
  mimeType: string
): Promise<{ url: string; mediaType: "image" | "video" }> {
  const isVideo = mimeType.startsWith("video/")
  const resourceType = isVideo ? "video" : "image"

  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "kacosmetic/site/rituel",
            resource_type: resourceType,
            overwrite: true,
            public_id: "rituel-media",
          },
          (err, res) => {
            if (err || !res) return reject(err)
            resolve(res as { secure_url: string })
          }
        )
        .end(file)
    }
  )

  return { url: result.secure_url, mediaType: isVideo ? "video" : "image" }
}

export async function uploadCategoryImage(
  file: Buffer,
  categorySlug: string
): Promise<{ url: string }> {
  const result = await new Promise<{ secure_url: string }>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: `kacosmetic/categories`,
            public_id: categorySlug,
            overwrite: true,
            transformation: [{ quality: "auto:best", fetch_format: "webp", width: 800, height: 800, crop: "fill", gravity: "auto" }],
          },
          (err, res) => {
            if (err || !res) return reject(err)
            resolve(res as { secure_url: string })
          }
        )
        .end(file)
    }
  )
  return { url: result.secure_url }
}

export function getOptimizedUrl(
  publicId: string,
  options: { width?: number; height?: number; crop?: string } = {}
): string {
  return cloudinary.url(publicId, {
    transformation: [
      {
        width:        options.width,
        height:       options.height,
        crop:         options.crop ?? "fill",
        gravity:      "auto",
        quality:      "auto:good",
        fetch_format: "webp",
      },
    ],
    secure: true,
  })
}
