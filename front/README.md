# ThreatLens

AI-Powered STRIDE Threat Modeling from Architecture Diagrams.

## Features

- 📊 **Diagram Input**: Upload architecture diagram images or paste Mermaid code
- 🔍 **Component Detection**: AI-powered identification of system components and data flows
- 🛡️ **STRIDE Analysis**: Comprehensive threat modeling using the STRIDE methodology
- ✅ **Mitigations**: Actionable security recommendations for each identified threat
- 📥 **Export**: Download reports in Markdown or PDF format
- 🌓 **Dark Mode**: Beautiful light and dark themes

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Development Mode

The app includes a development mode with mock API responses. To toggle between mock and real API:

1. Open `src/lib/api.ts`
2. Set `DEV_MODE = true` for mock data (default)
3. Set `DEV_MODE = false` for real API calls

## Backend Integration

The app is prepared to integrate with a backend API:

### Endpoint: `POST /api/analyze`

**Request (multipart/form-data):**
```json
{
  "inputType": "image" | "mermaid",
  "mermaidText": "string (optional)",
  "diagram": "File (optional)",
  "analysisDepth": "quick" | "full",
  "reportFormat": "markdown" | "pdf",
  "includeSeverity": "boolean",
  "includeAssumptions": "boolean"
}
```

**Response:**
```json
{
  "components": [
    { "id": "string", "type": "string", "name": "string", "trust_zone": "string", "confidence": "number" }
  ],
  "data_flows": [
    { "from": "string", "to": "string", "protocol": "string", "direction": "string", "data_types": ["string"], "confidence": "number" }
  ],
  "threats": [
    { "targetId": "string", "category": "S|T|R|I|D|E", "title": "string", "description": "string", "severity": "low|medium|high" }
  ],
  "mitigations": [
    { "targetId": "string", "title": "string", "steps": ["string"] }
  ],
  "assumptions": ["string"],
  "uncertainties": ["string"],
  "reportDownloadUrl": "string"
}
```

## Tech Stack

- **React 18** + TypeScript
- **Vite** for development
- **TailwindCSS** for styling
- **shadcn/ui** for components
- **Mermaid.js** for diagram rendering
- **Lucide React** for icons

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── results/         # Analysis result components
│   ├── Header.tsx       # App header with theme toggle
│   ├── HeroSection.tsx  # Landing hero section
│   ├── DiagramInput.tsx # Image/Mermaid input
│   ├── SettingsPanel.tsx # Analysis settings
│   └── ...
├── hooks/
│   └── useTheme.tsx     # Theme context provider
├── lib/
│   ├── api.ts           # API integration
│   ├── mockData.ts      # Development mock data
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utilities
└── pages/
    └── Index.tsx        # Main page
```
