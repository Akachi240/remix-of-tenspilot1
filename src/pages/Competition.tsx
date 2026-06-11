import React from 'react'
import { motion } from 'framer-motion'
import { Heart, Brain, Zap, TrendingUp, Shield, Users } from 'lucide-react'

export default function CompetitionLanding() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:py-32 max-w-6xl mx-auto">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 mb-6">
            <Heart className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">Clinical TENS Therapy Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight">
            TensPilot+<br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Connected Pain Management
            </span>
          </h1>

          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Real-time patient monitoring + safety insights = Clinical excellence in your hands
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <motion.a
              href="/download?app=patient"
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all"
            >
              Patient App
            </motion.a>
            <motion.a
              href="/download?app=doctor"
              whileHover={{ scale: 1.05 }}
              className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-all"
            >
              Doctor Dashboard
            </motion.a>
          </div>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {[
            {
              icon: <Zap className="w-8 h-8" />,
              title: 'Real-time Monitoring',
              description: 'Instant session tracking & pain metrics sync between patient & clinician',
            },
            {
              icon: <Brain className="w-8 h-8" />,
              title: 'Personalized Insights',
              description: 'Therapy recommendations based on historical session patterns',
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: 'Progress Analytics',
              description: 'Visual tracking for pain relief & treatment timelines',
            },
            {
              icon: <Shield className="w-8 h-8" />,
              title: 'Medical Safety',
              description: 'Contraindication checks + medication notes integration',
            },
            {
              icon: <Users className="w-8 h-8" />,
              title: 'Patient-Clinician Hub',
              description: 'Secure telemetry system for managing 1→Many patient relationships',
            },
            {
              icon: <Heart className="w-8 h-8" />,
              title: 'Privacy-Focused',
              description: 'Role-based access control & secure system logging',
            },
          ].map((feature, i) => (
            <motion.div
              key={i}
              {...fadeInUp}
              transition={{ delay: 0.1 * i }}
              className="p-6 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all group"
            >
              <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="px-4 py-20 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Modern Technology Stack</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {[
              { name: 'React 19', icon: '⚛️' },
              { name: 'Firebase', icon: '🔥' },
              { name: 'TypeScript', icon: '📘' },
              { name: 'Analytics', icon: '📈' },
              { name: 'Framer Motion', icon: '✨' },
              { name: 'Tailwind CSS', icon: '🎨' },
            ].map((tech) => (
              <motion.div
                key={tech.name}
                whileHover={{ scale: 1.1 }}
                className="p-4 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
              >
                <div className="text-2xl mb-2">{tech.icon}</div>
                <p className="text-xs font-semibold text-slate-300">{tech.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
