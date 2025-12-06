/*
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

export default {
  content: ['./index.html', './src/**/   //*.{ts,tsx}'],
  /*
  darkMode: 'class',
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem'
      }
    },
  },
  plugins: [
    typography,
  ],
} satisfies Config
/*/
import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', 'class'],
  safelist: [
    { pattern: /(bg|text|border)-(femme-(magenta|rose|coral|orange|amber|softyellow))/ },
  ],
  theme: {
  	container: {
  		center: true,
  		padding: '1rem'
  	},
  	extend: {
  		colors: {
  			femme: {
  				magenta: '#C2185B',
  				rose: '#EC407A',
  				coral: '#F04E45',
  				orange: '#FB8C00',
  				amber: '#FFB300',
  				softyellow: '#FFE082'
  			},
  			ink: '#121212',
  			graphite: '#333333',
  			snow: '#FFFFFF',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography'), require("tailwindcss-animate")],
} satisfies Config

