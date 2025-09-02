# Home Repair Contractor Matcher Backend

A simple FastAPI backend that matches users with contractors based on their preferences and criteria.

## Features

- **POST /find-contractors**: Find top 3 contractors based on user criteria (algorithmic scoring)
- **POST /score**: Score contractors using OpenAI GPT-4 based on system prompt
- **GET /contractors**: Get all available contractors
- **GET /health**: Health check endpoint

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```bash
# .env
OPENAI_API_KEY=your_openai_api_key_here
ENVIRONMENT=development
```

4. Run the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

Interactive API documentation: http://localhost:8000/docs

## API Usage

### Find Contractors

**POST /find-contractors**

Request body:
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

Response: Top 3 contractors with match scores

### Score Contractors with OpenAI

**POST /score**

Request body:
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

Response: Top 3 contractors scored by GPT with reasoning

Note: Contractor data is hardcoded in the system prompt.

### Available Project Types
- roofing
- siding  
- handyman

### Available Cities
- Salt Lake City

## Matching Algorithm

The algorithm scores contractors based on:
- **Experience**: Years in business (weighted)
- **Reviews**: Number of reviews (weighted)
- **Rating**: Average rating (weighted)
- **Price**: Pricing band preference (weighted)
- **Speed**: Estimated response time (weighted)

Additional factors:
- Exact vertical match bonus (+20%)
- Handyman penalty for specialized work (-20%)
- Negative flags penalty (-10% each)
