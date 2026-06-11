import QRCode from 'qrcode'

export interface AppDownloadConfig {
  type: 'patient' | 'doctor'
  appUrl: string
}

/**
 * Generate QR codes for easy app downloading
 * Points to the Vercel web deployments.
 */
export async function generateAppQRCode(
  config: AppDownloadConfig
): Promise<string> {
  const downloadUrl = `${window.location.origin}/download?app=${config.type}`

  try {
    return await QRCode.toDataURL(downloadUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
      color: {
        dark: '#0284c7', // TensPilot blue
        light: '#f0f7ff', // Light blue
      },
    })
  } catch (err) {
    console.error('QR code generation failed:', err)
    throw err
  }
}

/**
 * Get the link for the web app deployment.
 */
export function getDownloadLink(appType: 'patient' | 'doctor'): string {
  const config = {
    patient: 'https://remix-of-tenspilot1.vercel.app',
    doctor: 'https://tenspilot-doctor-dashboard.vercel.app',
  }

  return config[appType] || config.patient
}
