import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Exact badge colors from screenshot
        "badge-in-review": {
          DEFAULT: "#F97316", // Orange background
          foreground: "#FFFFFF", // White text
        },
        "badge-pending": {
          DEFAULT: "#FECACA", // Light pink background
          foreground: "#991B1B", // Dark red text
        },
        "badge-completed": {
          DEFAULT: "#16A34A", // Green background
          foreground: "#FFFFFF", // White text
        },
        "badge-withdrawn": {
          DEFAULT: "#7F1D1D", // Dark maroon background
          foreground: "#FFFFFF", // White text
        },
        "badge-high": {
          DEFAULT: "#DC2626", // Red background
          foreground: "#FFFFFF", // White text
        },
        "badge-medium": {
          DEFAULT: "#F97316", // Orange background
          foreground: "#FFFFFF", // White text
        },
        "badge-low": {
          DEFAULT: "#BBF7D0", // Light green background
          foreground: "#166534", // Dark green text
        },
        "badge-full-time": {
          DEFAULT: "#9333EA", // Purple background
          foreground: "#FFFFFF", // White text
        },
        "badge-internship": {
          DEFAULT: "#3B82F6", // Blue background
          foreground: "#FFFFFF", // White text
        },
        // Custom colors for Hiring Requests summary cards
        "card-blue-bg": "#E0F2FE", // Total Requests background
        "card-blue-text": "#1E40AF", // Total Requests text
        "card-orange-bg": "#FFF7ED", // Pending Reviews background
        "card-orange-text": "#C2410C", // Pending Reviews text
        "card-green-bg": "#D1FAE5", // Finished background
        "card-green-text": "#065F46", // Finished text
        "card-gray-bg": "#F3F4F6", // Resting background
        "card-gray-text": "#4B5563", // Resting text
        // New badge colors for Companies section
        "badge-active": {
          DEFAULT: "#D1FAE5", // Active (green)
          foreground: "#065F46",
        },
        "badge-inactive": {
          DEFAULT: "#E5E7EB", // Inactive (light gray)
          foreground: "#4B5563", // Darker gray text
        },
        // Chart colors for Analytics section with proper nomenclature
        "chart-new-requests": "#1F2937", // Dark gray for New Requests
        "chart-completed-requests": "#4B5563", // Lighter gray for Completed Requests
        "chart-completed": "#16A34A", // Green for Completed slice
        "chart-in-progress": "#3B82F6", // Blue for In Progress slice
        "chart-withdrawn": "#EF4444", // Red for Withdrawn slice
        "chart-pending": "#F97316", // Orange for Pending slice
        "chart-follow-ups": "#06B6D4", // Cyan for Follow-ups
        "chart-success": "#10B981", // Green for Success Rate
        "chart-volume": "#3B82F6", // Blue for Volume
        // New badge colors for Calendar section
        "badge-interview": {
          DEFAULT: "#DBEAFE", // Light blue for Interview
          foreground: "#1D4ED8",
        },
        "badge-followup": {
          DEFAULT: "#FFEDD5", // Light orange for Follow-up
          foreground: "#C2410C",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
