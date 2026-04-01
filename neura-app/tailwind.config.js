/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: "#0F172A",
        surface: "#1E293B",
        surfaceHover: "#334155",
        
        // Primary actions & success
        primary: "#10B981",
        primaryLight: "#34D399",
        primaryDark: "#059669",
        
        // Accent & alerts
        accent: "#F97316",
        accentLight: "#FB923C",
        accentDark: "#EA580C",
        
        // Text
        textPrimary: "#F8FAFC",
        textSecondary: "#94A3B8",
        textTertiary: "#64748B",
        
        // Special
        neurons: "#FBBF24",
        neuronsLight: "#FCD34D",
        neuronsDark: "#F59E0B",
        
        // Status
        success: "#10B981",
        error: "#EF4444",
        warning: "#F59E0B",
        info: "#3B82F6",
      },
      
      fontFamily: {
        // Primary: Cairo (geometric, modern Arabic)
        sans: ["Cairo", "sans-serif"],
        
        // Display: Tajawal (bold, impactful for headers)
        display: ["Tajawal", "Cairo", "sans-serif"],
        
        // Accent: Amiri (elegant serif for special moments)
        accent: ["Amiri", "serif"],
      },
      
      fontSize: {
        // Display (hero text)
        'display-lg': ['56px', { lineHeight: '1.1', fontWeight: '700', letterSpacing: '-0.02em' }],
        'display': ['48px', { lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }],
        
        // Headings
        'h1': ['32px', { lineHeight: '1.3', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        
        // Body
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        
        // UI
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
        'overline': ['10px', { lineHeight: '1.2', fontWeight: '600', letterSpacing: '0.05em' }],
      },
      
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '16px',
        'lg': '24px',
        'xl': '32px',
        '2xl': '48px',
        '3xl': '64px',
        '4xl': '96px',
      },
      
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      
      boxShadow: {
        // Elevation shadows
        'elevation-base': '0 4px 12px rgba(16, 185, 129, 0.1)',
        'elevation-raised': '0 8px 20px rgba(16, 185, 129, 0.2)',
        'elevation-floating': '0 16px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
