// tailwind.config.js
const config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      colors: {
        Primary: "#1A1E24",
        Secondary: "#FFFFFF",
        BackgroundPrimary: "#1A1E24",
        BackgroundSecondary: "#FFFFFF",
        textPrimary: "#FFFFFF",
        textSecondary: "#363636",
        PlaceholderColor: "#DCDCDC",
        neonGreen: '#39FF14',
        button: {
          signup: "#55A96D",
          Primary: "#26C553",
          Secondary: "#27A84C",
          Text: "#0B6100",
          Hover: "#80F87E",
          HoverSecondary: "#258F43",
          Login: "#263238",
        },
      },

      animation: {
        'border-reverse': 'border-reverse 4s linear infinite',
        'hand-wave': 'hand-wave 3s ease-in-out infinite',
        'coin-float-1': 'coin-float 2.5s ease-in-out infinite',
        'coin-float-2': 'coin-float 2.8s ease-in-out infinite 0.3s',
        'coin-float-3': 'coin-float 2.2s ease-in-out infinite 0.6s',
        'scan-line': 'scan-line 3s ease-in-out infinite',
        'scan-pulse': 'scan-pulse 2s ease-in-out infinite',
        'handLeft': 'handLeft 3s ease-in-out infinite',
        'handRight': 'handRight 3s ease-in-out infinite',
        'float': 'float 2.5s ease-in-out infinite',
        'handWave': 'handWave 3s ease-in-out infinite',
        'scanPulse': 'scanRing 2s ease-in-out infinite',
      },

      keyframes: {
        'hand-wave': {
          '0%, 100%': { transform: 'rotate(0deg) translateY(0)' },
          '25%': { transform: 'rotate(-3deg) translateY(-2px)' },
          '75%': { transform: 'rotate(3deg) translateY(2px)' },
        },
        'coin-float': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)', opacity: '0.9' },
          '50%': { transform: 'translateY(-8px) rotate(5deg)', opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'scan-pulse': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'handLeft': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(8px) rotate(5deg)' },
        },
        'handRight': {
          '0%, 100%': { transform: 'translateX(0) rotate(0deg)' },
          '50%': { transform: 'translateX(-8px) rotate(-5deg)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'handWave': {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-2deg)' },
          '75%': { transform: 'rotate(2deg)' },
        },
        'scanRing': {
          '0%': { transform: 'translateX(-50%) scale(0.8)', opacity: '0' },
          '50%': { transform: 'translateX(-50%) scale(1.1)', opacity: '1' },
          '100%': { transform: 'translateX(-50%) scale(1.3)', opacity: '0' },
        },
        'scanVertical': {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '20%': { opacity: '1' },
          '80%': { opacity: '1' },
          '100%': { transform: 'translateY(100px)', opacity: '0' },
        },
        'border-reverse': {
          '0%': {
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            borderRightColor: 'transparent',
          },
          '25%': {
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderBottomColor: 'transparent',
            borderRightColor: 'neon-green',
          },
          '50%': {
            borderTopColor: 'transparent',
            borderLeftColor: 'transparent',
            borderBottomColor: 'neon-green',
            borderRightColor: 'neon-green',
          },
          '75%': {
            borderTopColor: 'transparent',
            borderLeftColor: 'neon-green',
            borderBottomColor: 'neon-green',
            borderRightColor: 'neon-green',
          },
          '100%': {
            borderTopColor: 'neon-green',
            borderLeftColor: 'neon-green',
            borderBottomColor: 'neon-green',
            borderRightColor: 'neon-green',
          },
        },
      },



      fontFamily: {
        sans: ["var(--font-titillium_web)"],
      },
      screens: {
        sm: "640px",
        md: "1439px",
        lg: "1440px",
      },
      maxWidth: {
        desktop: "1440px",
        navbar: "72%",
        section: "80%",
        screen: "100vw",
      },
    },
  },
  plugins: [],
};

export default config;
