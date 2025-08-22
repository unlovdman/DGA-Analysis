# 🔬 Transformer Analysis Web Application

[![React](https://img.shields.io/badge/React-19.x-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-cyan.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> **Professional Web Application for Comprehensive Transformer Analysis**  
> Supporting both **Dissolved Gas Analysis (DGA)** and **Breakdown Voltage Analysis**

A modern, responsive web application designed for electrical engineers to perform comprehensive transformer analysis using industry-standard methods. The platform supports **Dissolved Gas Analysis (DGA)** with Duval Triangle Method and **Breakdown Voltage Analysis** with IEC standards compliance.

## ✨ Key Features

### 🔬 **Dual Analysis Methods**
- **DGA Analysis** - Triangle 1, 4, and 5 methods (IEEE C57.104-2019)
- **Breakdown Voltage Analysis** - IEC 60156-95 with IEC 60422:2013 standards
- **Unified Landing Page** - Choose your analysis method with elegant interface
- **Context-Aware Navigation** - Separate dashboards for each analysis type

### ⚡ **Breakdown Voltage Analysis**
- **Dielectric Strength Testing** - 6 measurement inputs (1×5min, 5×2min)
- **Transformer Type Classification** - O, A, B, C types with specific thresholds
- **Automatic Calculation** - Average voltage and condition assessment
- **Professional Reports** - Structured PDF output with comprehensive analysis
- **Bulk Export** - Multiple analyses in single PDF document

### 🔬 **DGA Analysis Features**
- **Manual Triangle Analysis** - Triangle 1, 4, and 5 methods
- **Multi-Classification Support** - Data 1 (CO-based) to Data 8 (fault-based)
- **Real-time Fault Detection** - Automatic severity assessment
- **IEEE C57.104-2019 Compliance** - Industry standard methodology

### 📊 **Enhanced Dashboard & Analytics**
- **Dual Dashboard System** - Separate analytics for DGA and Breakdown Voltage
- **Real-time Statistics** - Analysis counts, success rates, condition distribution
- **Monthly Trend Analysis** - 6-month historical data visualization
- **Type Distribution** - Transformer type usage patterns (Breakdown Voltage)
- **Fault Analysis** - Severity breakdown and triangle method usage (DGA)

### 🖼️ **Advanced Image Management**
- **Multiple Images per Analysis** - Upload multiple images per triangle/test
- **Dual Upload Methods** - File upload + clipboard paste (Print Screen → Ctrl+V)
- **Image Source Tracking** - File vs clipboard identification with timestamps
- **PDF Image Embedding** - High-quality images in reports with proper sizing

### 📄 **Professional PDF Export**
- **Dual Report Types** - Separate formats for DGA and Breakdown Voltage
- **Customizable Headers** - Dynamic transformer information
- **Bulk Export** - Multiple analyses in single PDF (Breakdown Voltage)
- **Selective Export** - Choose triangles/content to include (DGA)
- **Structured Layout** - Professional formatting with proper tables and spacing

### 💾 **Comprehensive Data Management**
- **Separate History Systems** - Independent storage for each analysis type
- **Advanced Filtering** - By result, date, transformer type, voltage range
- **Export Tracking** - Mark which analyses have been exported
- **Load Previous Work** - Resume analysis from history
- **Bulk Operations** - Select and export multiple analyses simultaneously

### 🎨 **Modern UI/UX**
- **Dual-Theme Design** - Yellow/Orange for Breakdown, Blue for DGA
- **Context-Aware Navigation** - Smart routing based on analysis type
- **Dark/Light Mode Toggle** - Consistent theming across all components
- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Framer Motion Animations** - Smooth transitions and interactions

## 📸 Screenshots

### 🏠 **Landing Page - Analysis Selection**
![Landing Page](https://github.com/user-attachments/assets/47488ae0-4d47-4420-8e58-2692927cfb64)
*Professional landing page with analysis method selection - choose between Breakdown Voltage and Dissolved Gas Analysis with clear method descriptions and standards information*

### ⚡ **Breakdown Voltage Dashboard**
![Breakdown Voltage Dashboard](https://github.com/user-attachments/assets/ee4f9c21-a302-45cc-bb6f-158c28504a77)
*Dedicated dashboard for breakdown voltage analysis with voltage condition distribution, transformer type analytics, monthly trends, and recent analysis history*

### 🔬 **DGA Analysis Interface**
![DGA Analysis Interface](https://github.com/user-attachments/assets/d23b73ba-5de8-4097-aa76-98fa342e82d7)
*Comprehensive DGA analysis interface with triangle selection, gas concentration inputs, fault type selection, and triangle visualization for transformer analysis*

### 📄 **Professional PDF Reports**
![PDF Export](https://github.com/user-attachments/assets/af28a3f8-8bc8-4b09-9373-137f03670394)
*Enhanced PDF export with transformer information, structured tables, analysis results, and professional formatting for both analysis types*

### 💾 **History & Bulk Export**
![History Management](https://github.com/user-attachments/assets/b0e02f3d-a5e4-4fc9-8a61-e53af0d62d38)
*Advanced history management with filtering, sorting, bulk selection, and multi-analysis PDF export capabilities for comprehensive data management*

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ (LTS recommended)
- **pnpm** (recommended) or npm/yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/unlovdman/Transformer-Analysis.git
cd Transformer-Analysis

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the project
pnpm run build

# Preview the build
pnpm run preview
```

## 📋 Usage Guide

### 1. **Analysis Method Selection**
- Choose between **Breakdown Voltage** or **DGA Analysis** from landing page
- Each method has dedicated workflows and dashboards
- Context-aware navigation maintains your analysis type

### 2. **Breakdown Voltage Analysis**
- Input transformer ID and select type (O, A, B, C)
- Enter 6 dielectric strength measurements
- View automatic average calculation and condition assessment
- Export professional PDF reports with structured tables

### 3. **DGA Analysis**
- Choose triangle method (1, 4, or 5)
- Select data classification (Data 1-8)
- Upload images via file or clipboard (optional)
- Input gas concentration values
- Review fault detection and recommendations

### 4. **Dashboard Analytics**
- **Breakdown Voltage Dashboard**: Voltage conditions, transformer types, trends
- **DGA Dashboard**: Fault distribution, triangle usage, severity analysis
- Real-time statistics and historical data visualization

### 5. **Advanced Export Features**
- **Single Export**: Individual analysis to PDF
- **Bulk Export**: Multiple analyses in one PDF (Breakdown Voltage)
- **Customizable Content**: Select what to include in reports
- **Professional Formatting**: Structured layouts with proper tables

### 6. **History Management**
- Separate history for each analysis type
- Advanced filtering by result, date, type
- Bulk selection and export capabilities
- Load previous analyses for review or continuation

## 🔧 Technical Stack

### **Frontend Framework**
- **React 19** - Latest version with enhanced performance
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Advanced animations and transitions
- **Material-UI Icons** - Professional icon set
- **Dual Theme System** - Context-aware color schemes

### **State Management**
- **React Hooks** - Modern state management
- **Context API** - Theme and global state
- **localStorage** - Persistent data storage

### **Analysis & Export**
- **jsPDF** - Client-side PDF generation with custom tables
- **Canvas API** - High-quality image processing
- **Custom Algorithms** - DGA fault detection and voltage analysis
- **IEEE/IEC Standards** - Compliant calculation methods

## 📁 Project Structure

```
src/
├── components/
│   ├── features/
│   │   ├── LandingPage.tsx          # Analysis method selection
│   │   ├── Dashboard.tsx            # DGA analytics dashboard
│   │   ├── BreakdownVoltageDashboard.tsx # Breakdown voltage dashboard
│   │   ├── DuvalAnalysis.tsx        # DGA analysis interface
│   │   ├── BreakdownVoltageAnalysis.tsx # Breakdown voltage interface
│   │   ├── BreakdownVoltageHistory.tsx # History with bulk export
│   │   ├── HistoryModal.tsx         # DGA history management
│   │   └── ReportHeaderModal.tsx    # PDF export configuration
│   ├── layout/
│   │   └── Header.tsx               # Context-aware navigation
│   └── ui/
│       ├── Button.tsx               # Reusable components
│       └── LoadingSpinner.tsx       # Loading indicators
├── contexts/
│   └── ThemeContext.tsx             # Dark/light mode management
├── data/
│   ├── duvalTriangles.ts            # DGA triangle definitions
│   ├── breakdownVoltage.ts          # Voltage analysis constants
│   └── faultRecommendations.ts      # IEEE standard recommendations
├── types/
│   └── index.ts                     # TypeScript type definitions
├── utils/
│   ├── coAnalysis.ts                # CO-based DGA analysis
│   ├── duvalAnalysis.ts             # Triangle analysis logic
│   └── pdfGenerator.ts              # Dual PDF export system
└── index.css                       # Global styles and themes
```

## 🎯 Analysis Methods

### **Breakdown Voltage Analysis**
- **Standard**: IEC 60156-95 with IEC 60422:2013 limits
- **Transformer Types**: O (>400KV), A (170-400KV), B (72.5KV), C (<72.5KV)
- **Measurements**: 1×5min + 5×2min dielectric strength tests
- **Conditions**: Good, Fair, Poor based on type-specific thresholds

### **DGA Triangle Methods**

#### **Triangle 1** (CH4, C2H4, C2H2)
- **Primary Detection**: Thermal and electrical faults
- **Fault Types**: PD, D1, D2, T1, T2, T3, DT
- **Use Case**: General fault detection in oil-filled transformers

#### **Triangle 4** (H2, CH4, C2H6)  
- **Primary Detection**: Low energy electrical discharges
- **Fault Types**: S, PD, ND, DT, C, D2
- **Use Case**: Sensitive detection of partial discharges

#### **Triangle 5** (CH4, C2H4, C2H6)
- **Primary Detection**: Thermal faults classification
- **Fault Types**: O, S, ND, C, T2, T3
- **Use Case**: Detailed thermal fault analysis

## 📊 Data Classification Systems

### **Breakdown Voltage Classification**
- **Input**: 6 dielectric strength measurements
- **Calculation**: Automatic average computation
- **Assessment**: Type-specific condition evaluation
- **Output**: Good/Fair/Poor with maintenance recommendations

### **DGA Classification**

#### **Data 1** - CO-Based Analysis
- **AUTO**: Automatic analysis based on CO levels
- **Severity**: LOW (<500), MEDIUM (500-600), HIGH (>600)
- **Recommendations**: Based on CO concentration ranges

#### **Data 2-8** - Manual Fault Selection
- **MANUAL**: Engineer selects specific fault type
- **Fault Options**: Varies by triangle method
- **Recommendations**: Based on selected fault characteristics

## 🛠️ Configuration

### **Environment Variables**
```env
# Optional: Customize app behavior
VITE_APP_TITLE="Transformer Analysis Platform"
VITE_APP_VERSION="2.0.0"
```

### **Theme Customization**
Edit `tailwind.config.js` to customize colors and design system:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* DGA blue theme */ },
        yellow: { /* Breakdown voltage theme */ },
        dark: { /* Dark mode palette */ }
      }
    }
  }
}
```

## 🔍 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

### Required APIs
- **Clipboard API** (for screenshot paste)
- **Canvas API** (for image processing)
- **localStorage** (for data persistence)
- **File API** (for image upload)

## 📈 Performance

- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Lighthouse Score**: 95+
- **Bundle Size**: <600KB (gzipped)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**unlovdman**
- GitHub: [@unlovdman](https://github.com/unlovdman)
- Email: rizalefendy22@gmail.com

## 🙏 Acknowledgments

- **IEEE C57.104-2019** standard for DGA methodology
- **IEC 60156-95 & IEC 60422:2013** for breakdown voltage standards
- **Duval Triangle** method by Michel Duval
- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first approach
- **Framer Motion** for smooth animations

---

### 🚀 **Ready to analyze your transformers? Get started now!**

```bash
git clone https://github.com/unlovdman/Transformer-Analysis.git
cd Transformer-Analysis
pnpm install
pnpm run dev
```

---

**⭐ If this project helps you, please give it a star!**
