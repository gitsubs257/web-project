/**
 * Resolves a product image path to a full URL.
 * Handles:
 * - Full external URLs (e.g. Cloudinary, AWS S3)
 * - Relative paths (e.g. 'uploads/green-tea.jpg' -> '/uploads/green-tea.jpg')
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const cleanPath = imagePath.replace(/^\/+/, '')

  // In production builds, always use the public CDN relative root path
  if (import.meta.env.PROD) {
    return `/${cleanPath}`
  }

  const backend = import.meta.env.VITE_API_URL
  if (backend && !backend.includes('localhost')) {
    return `${backend.replace(/\/+$/, '')}/${cleanPath}`
  }

  return `/${cleanPath}`
}
