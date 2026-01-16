/**
 * Native Camera Integration
 * Capacitor Camera plugin wrapper for car photo capture
 */

// Check if we're in a Capacitor native environment
export function isNative() {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()
}

/**
 * Take a photo using native camera
 * @returns {Promise<string>} - Data URL of the captured photo
 */
export async function takePhoto() {
  if (!isNative()) {
    // Fallback to file input for web
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.capture = 'environment'
      input.onchange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        } else {
          reject(new Error('No file selected'))
        }
      }
      input.click()
    })
  }

  // Use Capacitor Camera
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      width: 1200,
      height: 900,
      correctOrientation: true,
      saveToGallery: false
    })

    return photo.dataUrl
  } catch (error) {
    console.error('Camera error:', error)
    throw error
  }
}

/**
 * Pick a photo from gallery
 * @returns {Promise<string>} - Data URL of the selected photo
 */
export async function pickFromGallery() {
  if (!isNative()) {
    // Fallback to file input for web
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = e.target.files?.[0]
        if (file) {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
        } else {
          reject(new Error('No file selected'))
        }
      }
      input.click()
    })
  }

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: 1200,
      height: 900,
      correctOrientation: true
    })

    return photo.dataUrl
  } catch (error) {
    console.error('Gallery error:', error)
    throw error
  }
}

/**
 * Pick multiple photos from gallery
 * @param {number} limit - Maximum number of photos
 * @returns {Promise<string[]>} - Array of data URLs
 */
export async function pickMultiplePhotos(limit = 10) {
  if (!isNative()) {
    // Fallback to file input for web
    return new Promise((resolve, reject) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.multiple = true
      input.onchange = async (e) => {
        const files = Array.from(e.target.files || []).slice(0, limit)
        if (files.length === 0) {
          reject(new Error('No files selected'))
          return
        }

        const dataUrls = await Promise.all(
          files.map(file => new Promise((res, rej) => {
            const reader = new FileReader()
            reader.onload = () => res(reader.result)
            reader.onerror = rej
            reader.readAsDataURL(file)
          }))
        )

        resolve(dataUrls)
      }
      input.click()
    })
  }

  const { Camera } = await import('@capacitor/camera')

  try {
    const result = await Camera.pickImages({
      quality: 85,
      limit
    })

    // Convert web paths to data URLs
    const dataUrls = await Promise.all(
      result.photos.map(async (photo) => {
        if (photo.dataUrl) return photo.dataUrl

        // Fetch web path and convert to data URL
        const response = await fetch(photo.webPath)
        const blob = await response.blob()
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })
      })
    )

    return dataUrls
  } catch (error) {
    console.error('Pick multiple photos error:', error)
    throw error
  }
}

/**
 * Show camera/gallery prompt
 * @returns {Promise<string>} - Data URL of the photo
 */
export async function promptForPhoto() {
  if (!isNative()) {
    // For web, just open file picker
    return pickFromGallery()
  }

  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')

  try {
    const photo = await Camera.getPhoto({
      quality: 85,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // Show prompt to choose camera or gallery
      width: 1200,
      height: 900,
      correctOrientation: true,
      promptLabelHeader: 'Add Photo',
      promptLabelCancel: 'Cancel',
      promptLabelPhoto: 'From Gallery',
      promptLabelPicture: 'Take Photo'
    })

    return photo.dataUrl
  } catch (error) {
    console.error('Photo prompt error:', error)
    throw error
  }
}

/**
 * Check camera permissions
 * @returns {Promise<boolean>} - Whether camera permission is granted
 */
export async function checkCameraPermission() {
  if (!isNative()) return true

  const { Camera } = await import('@capacitor/camera')

  try {
    const status = await Camera.checkPermissions()
    return status.camera === 'granted' && status.photos === 'granted'
  } catch (error) {
    console.error('Permission check error:', error)
    return false
  }
}

/**
 * Request camera permissions
 * @returns {Promise<boolean>} - Whether permission was granted
 */
export async function requestCameraPermission() {
  if (!isNative()) return true

  const { Camera } = await import('@capacitor/camera')

  try {
    const status = await Camera.requestPermissions({
      permissions: ['camera', 'photos']
    })
    return status.camera === 'granted' && status.photos === 'granted'
  } catch (error) {
    console.error('Permission request error:', error)
    return false
  }
}

export default {
  isNative,
  takePhoto,
  pickFromGallery,
  pickMultiplePhotos,
  promptForPhoto,
  checkCameraPermission,
  requestCameraPermission
}
