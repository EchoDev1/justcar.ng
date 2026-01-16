/**
 * Push Notifications Library
 * Capacitor Push Notifications + Web Push integration
 */

// Check if we're in a Capacitor native environment
export function isNative() {
  return typeof window !== 'undefined' && window.Capacitor?.isNativePlatform()
}

// Check if push notifications are supported
export function isPushSupported() {
  if (isNative()) return true
  return typeof window !== 'undefined' && 'PushManager' in window && 'serviceWorker' in navigator
}

/**
 * Register for push notifications
 * @returns {Promise<object>} - Push subscription or token
 */
export async function registerForPush() {
  if (isNative()) {
    return registerNativePush()
  }
  return registerWebPush()
}

/**
 * Register for native push notifications (iOS/Android)
 */
async function registerNativePush() {
  const { PushNotifications } = await import('@capacitor/push-notifications')

  try {
    // Request permission
    const permStatus = await PushNotifications.requestPermissions()

    if (permStatus.receive !== 'granted') {
      throw new Error('Push notification permission not granted')
    }

    // Register with APNS/FCM
    await PushNotifications.register()

    // Return promise that resolves with token
    return new Promise((resolve, reject) => {
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value)
        resolve({
          type: 'native',
          token: token.value,
          platform: window.Capacitor?.getPlatform()
        })
      })

      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error)
        reject(error)
      })
    })
  } catch (error) {
    console.error('Native push registration error:', error)
    throw error
  }
}

/**
 * Register for web push notifications
 */
async function registerWebPush() {
  if (!isPushSupported()) {
    throw new Error('Push notifications not supported')
  }

  try {
    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted')
    }

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Get VAPID public key from server
    const response = await fetch('/api/push/vapid')
    const { publicKey } = await response.json()

    if (!publicKey) {
      throw new Error('VAPID public key not configured')
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey)
    })

    return {
      type: 'web',
      subscription: subscription.toJSON(),
      endpoint: subscription.endpoint
    }
  } catch (error) {
    console.error('Web push registration error:', error)
    throw error
  }
}

/**
 * Convert VAPID key to Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

/**
 * Save push subscription to server
 * @param {object} subscription - Push subscription data
 * @param {string} userId - User ID
 */
export async function savePushSubscription(subscription, userId) {
  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subscription,
        userId
      })
    })

    if (!response.ok) {
      throw new Error('Failed to save subscription')
    }

    return await response.json()
  } catch (error) {
    console.error('Save subscription error:', error)
    throw error
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribe() {
  if (isNative()) {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    await PushNotifications.removeAllListeners()
    return true
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
    }

    return true
  } catch (error) {
    console.error('Unsubscribe error:', error)
    throw error
  }
}

/**
 * Add notification received listener (native)
 * @param {function} callback - Callback function
 */
export async function addNotificationReceivedListener(callback) {
  if (!isNative()) {
    // For web, notifications are handled by service worker
    console.log('Web push notifications handled by service worker')
    return
  }

  const { PushNotifications } = await import('@capacitor/push-notifications')

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received:', notification)
    callback(notification)
  })
}

/**
 * Add notification action listener (native)
 * @param {function} callback - Callback function
 */
export async function addNotificationActionListener(callback) {
  if (!isNative()) return

  const { PushNotifications } = await import('@capacitor/push-notifications')

  PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
    console.log('Push notification action performed:', notification)
    callback(notification)
  })
}

/**
 * Get delivered notifications (native only)
 */
export async function getDeliveredNotifications() {
  if (!isNative()) return []

  const { PushNotifications } = await import('@capacitor/push-notifications')

  const { notifications } = await PushNotifications.getDeliveredNotifications()
  return notifications
}

/**
 * Remove all delivered notifications (native only)
 */
export async function removeAllDeliveredNotifications() {
  if (!isNative()) return

  const { PushNotifications } = await import('@capacitor/push-notifications')
  await PushNotifications.removeAllDeliveredNotifications()
}

/**
 * Check push notification permission status
 */
export async function checkPermission() {
  if (isNative()) {
    const { PushNotifications } = await import('@capacitor/push-notifications')
    const status = await PushNotifications.checkPermissions()
    return status.receive
  }

  // Web permission
  if (typeof Notification !== 'undefined') {
    return Notification.permission
  }

  return 'denied'
}

/**
 * Create local notification (for testing/immediate alerts)
 * @param {object} options - Notification options
 */
export async function showLocalNotification(options) {
  const { title, body, data, icon } = options

  if (isNative()) {
    // Use Capacitor Local Notifications if needed
    // For now, just log
    console.log('Local notification:', options)
    return
  }

  // Web notification
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: icon || '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      data,
      vibrate: [200, 100, 200]
    })

    notification.onclick = () => {
      window.focus()
      if (data?.url) {
        window.location.href = data.url
      }
      notification.close()
    }

    return notification
  }
}

export default {
  isNative,
  isPushSupported,
  registerForPush,
  savePushSubscription,
  unsubscribe,
  addNotificationReceivedListener,
  addNotificationActionListener,
  getDeliveredNotifications,
  removeAllDeliveredNotifications,
  checkPermission,
  showLocalNotification
}
