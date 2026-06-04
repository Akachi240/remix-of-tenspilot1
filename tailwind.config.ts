import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				ice: {
					ink: '#0c1f38',
					muted: '#5a7189',
					subtle: '#94a8bc',
					accent: '#4a8fc4',
					'accent-dark': '#2e6faa',
					50: '#eef4fb',
					100: '#d9e8f5',
					500: '#4a8fc4',
					600: '#2e6faa',
					700: '#245a8c',
				},
				medical: {
					50: '#eef4fb',
					100: '#d9e8f5',
					200: '#b8d4eb',
					500: '#4a8fc4',
					600: '#2e6faa',
					700: '#245a8c',
					900: '#0c1f38',
				},
				pain: {
					low: '#22c55e',
					medium: '#eab308',
					high: '#ef4444',
				},
				success: {
					DEFAULT: '#059669',
					soft: '#ecfdf5',
				},
				warning: {
					DEFAULT: '#d97706',
					soft: '#fffbeb',
				},
				device: {
					ring: 'var(--ring-fill)',
					track: 'var(--ring-track)',
				},
			},
			boxShadow: {
				'device-sm': 'var(--shadow-sm)',
				'device-md': 'var(--shadow-md)',
				'device-lg': 'var(--shadow-lg)',
				'device-float': 'var(--shadow-float)',
				'device-panel': 'var(--shadow-device)',
				'device-glow': 'var(--shadow-glow)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'device': '1.25rem',
				'device-lg': '1.75rem',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-ring': {
					'0%': { transform: 'scale(0.8)', opacity: '0.8' },
					'100%': { transform: 'scale(1.5)', opacity: '0' }
				},
				'live-pulse': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.85', transform: 'scale(1.02)' },
				},
				'ring-pulse': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.88' },
				},
				'device-glow': {
					'0%, 100%': { boxShadow: 'var(--shadow-device)' },
					'50%': {
						boxShadow: 'var(--shadow-device), 0 0 0 2px rgba(74, 143, 196, 0.2), 0 0 20px rgba(74, 143, 196, 0.15)',
					},
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
				'live-pulse': 'live-pulse 2s ease-in-out infinite',
				'ring-pulse': 'ring-pulse 2.5s ease-in-out infinite',
				'device-glow': 'device-glow 3s ease-in-out infinite',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
