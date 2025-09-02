# Home Repair Contractor Matching - Frontend

A modern Next.js web application that provides an intuitive interface for homeowners to find and match with qualified contractors using AI-powered scoring.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://v0-home-repair-web-app.vercel.app)

## 🌟 Live Demo

**[https://v0-home-repair-web-app.vercel.app](https://v0-home-repair-web-app.vercel.app)**

## 🚀 Features

### Smart Search Interface
- **Location & Project Type**: Easy selection of city and project category
- **Custom Notes**: Text area for specific requirements and preferences
- **Advanced Weight System**: Intelligent sliders with user-friendly controls

### Enhanced Weight Sliders
- **Independent Controls**: Each factor (experience, reviews, rating, price, speed) has its own 0-100 scale
- **Real-time Percentages**: Shows both raw values and normalized percentages that always sum to 100%
- **Preset Configurations**: Quick buttons for common preferences (Balanced, Quality-First, Budget-Focus, Speed-Priority)
- **Largest Remainder Method**: Mathematical algorithm ensures percentages never exceed 100%

### Comprehensive Contractor Cards
- **Uniform Heights**: All cards maintain consistent 720px height with perfectly aligned content
- **Complete Information Display**: Shows all contractor details from the API
- **Visual Score Representation**: Progress bars for final scores
- **Color-coded Badges**: Green for licenses, yellow for flags, blue for services
- **GPT Analysis**: AI-powered reasoning for scoring adjustments

## 🛠️ Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom utilities
- **Components**: Shadcn/ui component library
- **Icons**: Lucide React icon set
- **API Integration**: Native Fetch API for backend communication
- **State Management**: React useState hooks
- **Responsive Design**: Mobile-first approach

## 📦 Installation & Setup

```bash
# Install dependencies (use --force if needed for compatibility)
npm install --force

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Development

### Environment Setup

The frontend connects to the backend API running on `http://localhost:8000`. Make sure your backend is running before testing the frontend.

### Key Components

#### `app/page.tsx` - Main Application
- **Search Form**: Handles user input and weight configurations
- **API Integration**: Makes POST requests to `/score` endpoint
- **Results Display**: Renders contractor cards with complete information
- **State Management**: Manages search state, loading state, and results

#### Component Architecture
```
page.tsx
├── Search Form Section
│   ├── Location Input (Select)
│   ├── Project Type Input (Select)
│   ├── Notes Input (Textarea)
│   └── Weight Sliders
│       ├── Individual Sliders (0-100 scale)
│       ├── Percentage Display (normalized)
│       └── Preset Buttons
└── Results Section
    ├── Loading State
    ├── Error Handling
    └── Contractor Cards
        ├── Header (Name, Title, Avatar)
        ├── Description
        ├── Final Score (Progress Bar)
        ├── Details Grid (2-column)
        ├── Licenses (Green Badges)
        ├── Flags (Yellow Badges)
        ├── Services (Blue Badges)
        ├── GPT Analysis
        └── Action Button
```

#### Custom Utilities

**Weight Normalization (`getNormalizedWeights`)**:
```typescript
// Converts raw 0-100 slider values to 0-1 API format
const normalizedWeights = rawWeights.map(w => w / totalWeight)
```

**Percentage Calculation (`getNormalizedPercentages`)**:
```typescript
// Ensures displayed percentages always sum to exactly 100%
// Uses Largest Remainder Method for proper rounding
```

## 🎨 Styling & UI/UX

### Custom CSS Classes (`app/globals.css`)
```css
.line-clamp-3 { /* 3-line text truncation */ }
.line-clamp-4 { /* 4-line text truncation */ }
```

### Card Layout System
- **Fixed Heights**: Each section has a specific height for alignment
- **Flexbox Layout**: Uses flex-grow and justify-between for proper spacing
- **Responsive Design**: Adapts to different screen sizes
- **Consistent Spacing**: 4px margins and padding throughout

### Color Scheme
- **Primary**: Blue (#2563eb) for actions and scores
- **Success**: Green for licenses and positive indicators
- **Warning**: Yellow for flags and cautions
- **Neutral**: Gray scale for text and backgrounds

## 🔌 API Integration

### Request Format
```typescript
interface ScoreRequest {
  city: string;
  project_type: string;
  notes: string;
  weights: {
    experience: number;
    reviews: number;
    rating: number;
    price: number;
    speed: number;
  };
}
```

### Response Handling
```typescript
interface ApiContractor {
  id: string;
  name: string;
  vertical: string;
  years_in_business: number;
  rating: number;
  review_count: number;
  service_area: string;
  pricing_band: string;
  speed_weeks: number;
  licenses: string[];
  flags: string[];
  score: number;
  reasoning?: string;
}
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Search form accepts all inputs
- [ ] Weight sliders show correct percentages
- [ ] Preset buttons work correctly
- [ ] API calls return contractor data
- [ ] Cards display all information
- [ ] Responsive design works on mobile
- [ ] Loading states appear during API calls
- [ ] Error handling shows appropriate messages

### Test Data
Use the example payload from the main README to test the complete flow:
```json
{
  "city": "Salt Lake City",
  "project_type": "roofing",
  "notes": "I value experience and warranty over price. Prefer bids under 3 weeks.",
  "weights": { "experience": 0.4, "reviews": 0.25, "rating": 0.2, "price": 0.1, "speed": 0.05 }
}
```

## 📱 Responsive Design

- **Desktop**: 3-column contractor card grid
- **Tablet**: 2-column contractor card grid  
- **Mobile**: Single-column layout with optimized spacing

## 🔄 Build Process

```bash
# Development build with hot reloading
npm run dev

# Production build (optimized and minified)
npm run build

# Type checking
npm run build

# Deploy to Vercel (automatic on git push)
git push origin main
```

## 🤝 Contributing

When adding new features:
1. Maintain the existing TypeScript interfaces
2. Follow the established component structure
3. Use Tailwind classes consistently
4. Test responsive design on all breakpoints
5. Ensure accessibility standards are met

## 📄 Related Documentation

- See `../backend/README.md` for API endpoint details
- See `../README.md` for complete system architecture
- Check `package.json` for available scripts and dependencies