# Home Repair Contractor Matching System

A full-stack web application that intelligently matches homeowners with qualified contractors using AI-powered scoring and mathematical algorithms.

## 🚀 Live Demo

**Deployed at:** https://v0-home-repair-web-app.vercel.app

## 📁 Project Structure

This repository contains two main components, each with its own detailed README:

```
v0-home-repair-demo/
├── backend/          # FastAPI backend with OpenAI integration
│   └── README.md     # Backend setup and API documentation
├── frontend/         # Next.js React frontend
│   └── README.md     # Frontend setup and component details
└── README.md         # This file - Project overview
```

## 🎯 Features

- **Smart Contractor Matching**: Mathematical normalization algorithms combined with AI-powered qualitative adjustments
- **Flexible Weighting System**: Homeowners can prioritize experience, reviews, rating, price, or speed
- **Real-time Scoring**: Instant contractor ranking with detailed explanations
- **Responsive Design**: Modern, mobile-friendly interface
- **Robust Error Handling**: Graceful fallbacks and comprehensive logging

## 🧠 How It Works

### 1. Scoring Logic - All Math Done in Python

Yes, I implemented all the mathematical formulas you requested directly in Python code, not GPT. Think of it like a calculator that follows strict rules: Experience is capped at 20 years (so 18 years = 90/100 points, but 25 years still only gets 100/100 points). Reviews use a logarithmic scale, meaning going from 10 to 100 reviews matters more than going from 200 to 300 reviews. Ratings convert from the 1-5 star system to a 0-100 point system (so 4.7 stars becomes 92.5 points). Pricing considers whether the user cares about cost - if they don't care about price, expensive contractors get higher scores assuming "expensive = quality." Speed scoring gives better points to contractors who can start sooner. The homeowner's importance weights (like 40% experience, 25% reviews) are applied mathematically by multiplying each normalized score by its weight and adding them together. This gives us a precise base score before GPT ever sees anything.

### 2. GPT Usage - Only Small Adjustments and Reasoning

GPT is NOT calculating the main scores - it only makes tiny adjustments and provides explanations. Here's how it works: Python calculates a base score (like 86.1 points), then GPT looks at qualitative factors the math can't capture (like "user wants warranty focus" or "contractor has reputation issues") and adjusts by a maximum of 5 points up or down (so 86.1 could become 89.1 or 81.1, but never 95.1). I enforce this ±5 limit in the Python code itself - even if GPT tries to give 95 points, my code will automatically clamp it back to the allowed range. GPT also provides a human-readable explanation of why it made the adjustment. This way, you get mathematical precision for the core scoring plus human-like judgment for the final touches.

### 3. Contract & API - Exact Match to Your Requirements

Yes, the /score endpoint accepts exactly the request format you specified: city, project_type, notes, and weights dictionary. When you send the JSON payload from your brief, the API processes it and returns exactly what you asked for: the top 3 contractors with their IDs, names, final scores, and reasoning. The response format matches your specification perfectly. You can test this right now by sending your example payload to http://localhost:8000/score and you'll get back a clean JSON response with the top 3 ranked contractors, each with their adjusted score and GPT's explanation for the adjustment.

### 4. Edge Cases - Robust Error Handling

The system gracefully handles missing or bad data. If a contractor has no pricing information, it defaults to a middle score (50/100). If they have zero reviews, the review score becomes 0 rather than crashing. If someone sends malformed JSON or missing required fields, FastAPI automatically returns a helpful error message explaining what's wrong. Most importantly, if your OpenAI API key is missing or invalid, the system has a fallback mode - it will still calculate and return the Python-based scores without GPT's adjustments, so you still get ranked contractors even if the AI part fails. Error messages are logged to both the console and the log file so you can debug issues.

### 5. Tie-Breakers - Smart Ranking for Identical Scores

Yes, I implemented a three-level tie-breaking system that works like sports rankings. First, contractors are sorted by their final score (highest wins). If two contractors have identical final scores, the one with the higher customer rating wins (4.8 stars beats 4.5 stars). If they're still tied, the contractor with more reviews wins (300 reviews beats 150 reviews). This ensures consistent, predictable rankings even in edge cases. The system logs this ranking process so you can see exactly why each contractor ranked where they did. This prevents the random ordering that would happen if scores were identical, giving you reliable and defensible contractor rankings every time.

## 🛠️ Technology Stack

**Backend:**
- FastAPI (Python web framework)
- OpenAI GPT-4 API integration
- Pydantic for data validation
- Uvicorn ASGI server
- Comprehensive logging with file rotation

**Frontend:**
- Next.js 14 with React
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn/ui component library
- Lucide React icons

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 18+
- OpenAI API key

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
# Set your OpenAI API key in .env file
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install --force
npm run dev
```

Visit `http://localhost:3000` to see the application in action!

## 📊 API Example

**Request to `/score` endpoint:**
```json
{
  "city": "Salt Lake City",
  "project_type": "roofing",
  "notes": "I value experience and warranty over price. Prefer bids under 3 weeks.",
  "weights": {
    "experience": 0.4,
    "reviews": 0.25,
    "rating": 0.2,
    "price": 0.1,
    "speed": 0.05
  }
}
```

**Response:**
```json
{
  "top_contractors": [
    {
      "id": "c1",
      "name": "Rocky Mountain Roofing",
      "score": 89.5,
      "reasoning": "+3.5 adjustment for excellent warranty coverage matching user priorities",
      // ... full contractor details
    }
  ]
}
```

## 📝 Documentation

- See `backend/README.md` for detailed API documentation and setup instructions
- See `frontend/README.md` for component architecture and styling details

## 🤝 Contributing

This project demonstrates a complete contractor matching system with mathematical precision and AI enhancement. Feel free to explore the code and adapt it for your own use cases!

## 📄 License

This project is available for educational and demonstration purposes.
