# 🔬 DGA Web Application

**Advanced Dissolved Gas Analysis Platform** - IEEE C57.104-2019 Compliant

A modern, award-winning web application for automated Dissolved Gas Analysis (DGA) using Duval Triangle methodology. Built with cutting-edge technologies and Awwwards-inspired design.

![DGA App Screenshot](https://via.placeholder.com/800x400?text=DGA+Analysis+Dashboard)

## ✨ Features

### 🎯 Core Functionality
- **🔺 Multi-Triangle Analysis**: Supports Triangle 1, 4, and 5 methodologies
- **🖼️ Smart Image Upload**: Drag & drop interface with real-time preview
- **🤖 Automated OCR**: Extract gas concentration values from images
- **📊 Interactive Dashboard**: Real-time monitoring and analytics
- **⚠️ Fault Detection**: IEEE C57.104-2019 compliant fault classification
- **📋 Smart Recommendations**: Automated maintenance suggestions

### 🎨 Modern UI/UX
- **✨ Awwwards-Inspired Design**: Award-winning aesthetic principles
- **🌊 Fluid Animations**: Framer Motion powered interactions
- **🧊 Glassmorphism**: Modern glass-like UI elements
- **🔵 Neumorphism**: Soft, tactile interface components
- **📱 Mobile-First**: Fully responsive across all devices
- **🌙 Dark Mode Ready**: Future-ready theme system

### 🚀 Performance & Technology
- **⚡ Lightning Fast**: Optimized with Vite and React 19
- **📦 Code Splitting**: Efficient bundle management
- **🔄 Real-time Updates**: Live data with React Query
- **♿ Accessibility**: WCAG 2.1 AA compliant
- **🔒 Type Safety**: Full TypeScript implementation

## 🛠️ Tech Stack

### Frontend
- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Vite** - Ultra-fast development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Advanced animations
- **Material-UI** - Professional components
- **React Query** - Server state management

### Image Processing
- **Tesseract.js** - OCR capabilities
- **Canvas API** - Image manipulation
- **File API** - Modern file handling

### Development Tools
- **ESLint** - Code quality
- **PostCSS** - CSS processing
- **Autoprefixer** - Browser compatibility

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dga-web-app.git
   cd dga-web-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:5173
   ```

### Available Scripts

```bash
# Development
pnpm run dev          # Start dev server
pnpm run build        # Build for production
pnpm run preview      # Preview production build
pnpm run lint         # Run ESLint
```

## 📚 Usage Guide

### 1. Dashboard Overview
Access real-time statistics, recent analyses, and quick actions from the main dashboard.

### 2. Image Upload
- Drag and drop DGA images or click to browse
- Supports PNG, JPG formats up to 10MB
- Real-time upload progress and preview

### 3. Analysis Results
- Automatic fault detection using Duval Triangle methods
- Confidence scores and severity levels
- Interactive triangle visualizations

### 4. Recommendations
- IEEE C57.104-2019 compliant maintenance suggestions
- Priority-based action plans
- Detailed fault descriptions

## 🔺 Duval Triangle Methods

### Triangle 1 (Primary)
- **Gases**: CH₄, C₂H₄, C₂H₂
- **Faults**: PD, D1, D2, T1, T2, T3, DT
- **Use**: Primary fault detection

### Triangle 4 (Secondary) 
- **Gases**: H₂, CH₄, C₂H₆
- **Faults**: S, C, PD, D2, DT, ND
- **Use**: Enhanced analysis

### Triangle 5 (Tertiary)
- **Gases**: CH₄, C₂H₄, C₂H₆
- **Faults**: S, C, O, T2, T3, ND
- **Use**: Comprehensive evaluation

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── layout/          # Layout components
│   └── features/        # Feature-specific components
├── data/               # Static data and configurations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── services/           # API and external services
```

## 🎨 Design System

### Colors
```css
/* Primary Palette */
--primary-blue: #1a365d
--primary-accent: #3182ce
--secondary-teal: #319795

/* Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
--gradient-success: linear-gradient(135deg, #6fd89a 0%, #4fd1c7 100%)
```

### Typography
- **Primary**: Inter (System)
- **Display**: Space Grotesk
- **Monospace**: JetBrains Mono

### Components
- **Glass Cards**: Glassmorphism styling
- **Neumorphic Buttons**: Soft UI elements
- **Gradient Overlays**: Modern color transitions

## 🔧 Configuration

### Tailwind CSS
Custom design tokens and utilities are configured in `tailwind.config.js`.

### Animations
Framer Motion variants and transitions are defined in component files.

### TypeScript
Comprehensive type definitions in `src/types/index.ts`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Add tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **IEEE C57.104-2019** - Standard for interpretation of gases generated in oil-immersed transformers
- **Awwwards** - Design inspiration
- **React Team** - Amazing framework
- **Framer** - Incredible animation library

## 📞 Support

For support, email support@dgaapp.com or create an issue on GitHub.

---

**Built with ❤️ for the electrical engineering community**
