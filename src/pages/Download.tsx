import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import { generateAppQRCode, getDownloadLink } from '@/lib/qr-service'
import { theme, typography } from '@/lib/theme'
import { Smartphone, Stethoscope } from 'lucide-react'

export default function DownloadPage() {
  const [searchParams] = useSearchParams()
  const appType = (searchParams.get('app') || 'patient') as 'patient' | 'doctor'
  const [qrCode, setQrCode] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await generateAppQRCode({
          type: appType,
          appUrl: window.location.href,
        })
        setQrCode(url)
      } catch (err) {
        console.error('Failed to generate QR code:', err)
      } finally {
        setLoading(false)
      }
    }

    generateQR()
  }, [appType])

  const appConfig = {
    patient: {
      title: 'TensPilot+ Patient App',
      description: 'Track your pain, manage therapy, connect with your doctor',
      icon: <Smartphone className="w-12 h-12" />,
      color: theme.primary[500],
      features: [
        '📊 Real-time pain tracking',
        '⚡ TENS therapy sessions',
        '💬 Personalized insights',
        '👨‍⚕️ Doctor communication',
        '📈 Progress visualization',
      ],
    },
    doctor: {
      title: 'TensPilot+ Doctor Dashboard',
      description: 'Monitor your patients, track therapy outcomes, provide remote guidance',
      icon: <Stethoscope className="w-12 h-12" />,
      color: theme.medical.therapy,
      features: [
        '👥 Patient management hub',
        '📊 Real-time session tracking',
        '📈 Pain trend analysis',
        '💬 Secure messaging',
        '📋 Clinical reports',
      ],
    },
  }

  const config = appConfig[appType] || appConfig.patient

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
            style={{ backgroundColor: `${config.color}20` }}
          >
            <div style={{ color: config.color }}>{config.icon}</div>
          </div>
          <h1 className={`${typography.heading.lg} text-white mb-2`}>
            {config.title}
          </h1>
          <p className={`${typography.body.lg} text-slate-400`}>
            {config.description}
          </p>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white rounded-2xl p-8 shadow-2xl">
              {loading ? (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-100 rounded-lg">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-8 h-8 border-4 border-slate-300 border-t-blue-500 rounded-full"
                  />
                </div>
              ) : (
                <>
                  <img
                    src={qrCode}
                    alt="Web App Access QR Code"
                    className="w-64 h-64 rounded-lg"
                  />
                  <p className="mt-4 text-sm text-slate-600 text-center font-medium">
                    Scan with your phone to open the web app
                  </p>
                </>
              )}
            </div>

            {/* Web App Access Button */}
            <div className="mt-8 w-full">
              <motion.a
                href={getDownloadLink(appType)}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors text-center shadow-lg"
              >
                Open {appType === 'patient' ? 'Patient App' : 'Doctor Dashboard'}
              </motion.a>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col justify-center"
          >
            <div className="space-y-4">
              <h2 className={`${typography.heading.md} text-white mb-6`}>
                Key Features
              </h2>
              {config.features.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className={`${typography.body.md} text-slate-200`}>
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* Toggle to other app */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newApp = appType === 'patient' ? 'doctor' : 'patient'
                window.location.href = `/download?app=${newApp}`
              }}
              className="mt-8 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors text-center"
            >
              Switch to {appType === 'patient' ? 'Doctor Dashboard' : 'Patient App'}
            </motion.button>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className={`${typography.body.sm} text-slate-500 mb-2`}>
            TensPilot+ — Connected Pain Management Platform
          </p>
          <p className={`${typography.body.sm} text-slate-600`}>
            Privacy-Focused | Competition Demo
          </p>
        </motion.div>
      </div>
    </div>
  )
}
