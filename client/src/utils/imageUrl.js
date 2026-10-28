/**
 * Resolves a product image path to a full URL.
 * Handles:
 * - Full external URLs (e.g. Cloudinary, AWS S3)
 * - Relative paths (e.g. 'uploads/green-tea.jpg')
 * - Custom VITE_API_URL if configured
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const cleanPath = imagePath.replace(/^\/+/, '')
  const backend = import.meta.env.VITE_API_URL
  if (backend) {
    return `${backend.replace(/\/+$/, '')}/${cleanPath}`
  }
  return `/${cleanPath}`
}
