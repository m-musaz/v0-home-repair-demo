from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import os
import math
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging - both console and file
from logging.handlers import RotatingFileHandler

# Create logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Create formatter
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')

# Console handler (existing functionality)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# File handler (new - rotates when file gets too big)
file_handler = RotatingFileHandler(
    'contractor_api.log',
    maxBytes=10*1024*1024,  # 10MB max file size
    backupCount=5           # Keep 5 backup files
)
file_handler.setLevel(logging.INFO)
file_handler.setFormatter(formatter)

# Add handlers to logger
logger.addHandler(console_handler)
logger.addHandler(file_handler)

# Set root logger level
logging.getLogger().setLevel(logging.INFO)

# Initialize OpenAI client
openai_client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

app = FastAPI(title="Home Repair Contractor Matcher", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Contractor Dataset for calculations
CONTRACTORS = [
    {
        "id": "c1",
        "name": "NorthPeak Roofing",
        "vertical": "roofing",
        "years_in_business": 18,
        "rating": 4.7,
        "review_count": 312,
        "service_area": "Salt Lake City",
        "pricing_band": "$$$",
        "speed_weeks": 2,
        "licenses": ["UT-ROOF-44121"],
        "flags": []
    },
    {
        "id": "c2",
        "name": "Beehive Home Repair",
        "vertical": "handyman",
        "years_in_business": 6,
        "rating": 4.4,
        "review_count": 128,
        "service_area": "Salt Lake City",
        "pricing_band": "$$",
        "speed_weeks": 3,
        "licenses": ["UT-GEN-99812"],
        "flags": ["limited_roofing_experience"]
    },
    {
        "id": "c3",
        "name": "Wasatch Elite Exteriors",
        "vertical": "siding",
        "years_in_business": 12,
        "rating": 4.8,
        "review_count": 205,
        "service_area": "Salt Lake City",
        "pricing_band": "$$$",
        "speed_weeks": 4,
        "licenses": ["UT-EXT-77421"],
        "flags": ["premium_pricing"]
    },
    {
        "id": "c4",
        "name": "Granite Peak Roofing Co.",
        "vertical": "roofing",
        "years_in_business": 9,
        "rating": 4.5,
        "review_count": 164,
        "service_area": "Salt Lake City",
        "pricing_band": "$$",
        "speed_weeks": 3,
        "licenses": ["UT-ROOF-55210"],
        "flags": []
    },
    {
        "id": "c5",
        "name": "QuickFix Pros",
        "vertical": "roofing",
        "years_in_business": 3,
        "rating": 4.2,
        "review_count": 59,
        "service_area": "Salt Lake City",
        "pricing_band": "$",
        "speed_weeks": 2,
        "licenses": ["UT-ROOF-12003"],
        "flags": ["newer_company"]
    }
]

# Simple system prompt for GPT (only for ±5 adjustments)
system_prompt = """You are an expert contractor evaluation assistant. 

Your role is to make small qualitative adjustments (±5 points maximum) to pre-calculated base scores and provide reasoning.

You will receive contractor candidates with their base scores already calculated using mathematical normalization. Your job is to:

1. Select the top 3 contractors from the candidates
2. Make a ±5 point adjustment to each base score based on qualitative factors
3. Provide brief reasoning for each adjustment
4. NEVER exceed ±5 points from the base score
5. NEVER EXCEED 100 POINTS for score

Focus on qualitative aspects like:
- Warranty reputation
- Customer service quality  
- Special expertise
- Risk factors
- User-specific preferences in their notes
"""

# Normalization and scoring functions
def normalize_experience(years: int) -> float:
    """Normalize experience with cap at 20 years (0-100 scale)"""
    return min(years / 20.0, 1.0) * 100

def normalize_reviews(review_count: int) -> float:
    """Normalize review count using log scale (0-100 scale)"""
    if review_count <= 1:
        return 0
    # Log scale: log(review_count) / log(500) * 100, capped at 100
    max_reviews = 500
    return min(math.log(review_count) / math.log(max_reviews), 1.0) * 100

def normalize_rating(rating: float) -> float:
    """Normalize rating from 1-5 scale to 0-100 scale"""
    # Convert 1-5 to 0-100: (rating - 1) / 4 * 100
    return ((rating - 1.0) / 4.0) * 100

def normalize_price(pricing_band: str, price_weight: float) -> float:
    """Normalize pricing band (0-100 scale, higher score = better value)"""
    # If user values price highly, cheaper is better
    # If user doesn't care about price, expensive might mean better quality
    price_mapping = {
        "$": 100,    # Cheapest = best if price matters
        "$$": 70,    # Mid-tier
        "$$$": 40,   # Most expensive = worst if price matters
        "": 50       # Unknown pricing
    }
    base_score = price_mapping.get(pricing_band, 50)
    
    # If price weight is low, invert the scoring (expensive = quality)
    if price_weight < 0.2:  # Low price importance
        inverted_mapping = {"$": 60, "$$": 80, "$$$": 100, "": 50}
        return inverted_mapping.get(pricing_band, 50)
    
    return base_score

def normalize_speed(speed_weeks: int) -> float:
    """Normalize speed (0-100 scale, lower weeks = higher score)"""
    # Assuming 1-6 weeks range, with 1 week being perfect (100) and 6+ weeks being poor (0)
    max_weeks = 6
    return max(0, (max_weeks - speed_weeks) / (max_weeks - 1)) * 100

def calculate_base_score(contractor: Dict[str, Any], request: 'ScoreRequest') -> float:
    """Calculate base score using normalization formulas and weights"""
    
    # Normalize all attributes
    exp_score = normalize_experience(contractor["years_in_business"])
    review_score = normalize_reviews(contractor["review_count"])
    rating_score = normalize_rating(contractor["rating"])
    price_score = normalize_price(contractor["pricing_band"], request.weights.get("price", 0.1))
    speed_score = normalize_speed(contractor.get("speed_weeks", 4))
    
    # Apply weights
    weighted_score = (
        exp_score * request.weights.get("experience", 0.0) +
        review_score * request.weights.get("reviews", 0.0) +
        rating_score * request.weights.get("rating", 0.0) +
        price_score * request.weights.get("price", 0.0) +
        speed_score * request.weights.get("speed", 0.0)
    )
    
    # Apply project type bonuses/penalties
    if contractor["vertical"].lower() == request.project_type.lower():
        weighted_score *= 1.2  # 20% bonus for exact match
    elif contractor["vertical"] == "handyman" and request.project_type.lower() in ["roofing", "siding"]:
        weighted_score *= 0.8  # 20% penalty for handyman doing specialized work
    
    # Apply flag penalties
    negative_flags = ["limited_roofing_experience", "newer_company", "premium_pricing"]
    for flag in contractor.get("flags", []):
        if flag in negative_flags:
            weighted_score *= 0.9  # 10% penalty per negative flag
    
    return min(weighted_score, 100.0)  # Cap at 100

class BaseScoreInfo(BaseModel):
    id: str
    name: str
    base_score: float
    experience_norm: float
    reviews_norm: float
    rating_norm: float
    price_norm: float
    speed_norm: float

# Pydantic models
class ScoreRequest(BaseModel):
    city: str
    project_type: str
    notes: str
    weights: Dict[str, float]

class ScoredContractor(BaseModel):
    id: str
    name: str
    vertical: str
    years_in_business: int
    rating: float
    review_count: int
    service_area: str
    pricing_band: str
    speed_weeks: int
    licenses: List[str]
    flags: List[str]
    score: float
    reasoning: Optional[str] = None

class ScoreResponse(BaseModel):
    top_contractors: List[ScoredContractor]

@app.post("/score", response_model=ScoreResponse)
async def score_contractors_with_openai(request: ScoreRequest):
    """
    Score contractors using Python normalization + GPT ±5 adjustment
    """
    try:
        logger.info(f"Scoring contractors for {request.project_type} in {request.city}")
        
        # Step 1: Calculate base scores using Python normalization
        available_contractors = [
            c for c in CONTRACTORS 
            if c["service_area"].lower() == request.city.lower()
        ]
        
        base_scores = []
        for contractor in available_contractors:
            base_score = calculate_base_score(contractor, request)
            base_scores.append({
                "id": contractor["id"],
                "name": contractor["name"],
                "base_score": round(base_score, 1),
                "vertical": contractor["vertical"],
                "years_in_business": contractor["years_in_business"],
                "rating": contractor["rating"],
                "review_count": contractor["review_count"],
                "service_area": contractor["service_area"],
                "pricing_band": contractor["pricing_band"],
                "speed_weeks": contractor.get("speed_weeks", 4),
                "licenses": contractor.get("licenses", []),
                "flags": contractor.get("flags", [])
            })
        
        # Sort by base score with tie-breakers and get top 5 for GPT to choose from
        # Tie-breaker hierarchy: base_score > rating > review_count
        base_scores.sort(key=lambda x: (
            x["base_score"],           # Primary: highest base score
            x["rating"],               # Tie-breaker 1: higher rating
            x["review_count"]          # Tie-breaker 2: higher review count
        ), reverse=True)
        top_candidates = base_scores[:5]
        
        # Log base scores with tie-breaker info
        logger.info("Base scores calculated (with tie-breakers):")
        for i, contractor in enumerate(base_scores):
            logger.info(f"  {i+1}. {contractor['name']}: {contractor['base_score']:.1f} (rating: {contractor['rating']}, reviews: {contractor['review_count']})")
            if i >= 4:  # Only log top 5
                break
        
        # Step 2: Create GPT prompt for ±5 adjustment
        candidates_text = ""
        for contractor in top_candidates:
            candidates_text += f"""
Contractor ID: {contractor["id"]}
Name: {contractor["name"]}
Base Score: {contractor["base_score"]} (calculated using Python normalization)
Details: {contractor["vertical"]}, {contractor["years_in_business"]} yrs, {contractor["rating"]}/5 rating, {contractor["review_count"]} reviews, {contractor["pricing_band"]} pricing, {contractor["speed_weeks"]} weeks
Flags: {', '.join(contractor["flags"]) if contractor["flags"] else 'None'}
---
"""

        user_prompt = f"""
USER REQUEST:
City: {request.city}
Project Type: {request.project_type}
Notes: {request.notes}
User Weights: {request.weights}

CANDIDATES WITH CALCULATED BASE SCORES:
{candidates_text}

TASK: Select the top 3 contractors and provide a ±5 point adjustment to their base scores based on qualitative factors and user notes.

RULES:
1. Your final score MUST be within ±5 points of the base score
2. If base score is 85.2, your final score must be between 80.2 and 90.2
3. Consider user notes for qualitative adjustments
4. Provide brief reasoning for the adjustment

Format as JSON with ALL contractor details:
{{
  "top_contractors": [
    {{
      "id": "contractor_id",
      "name": "contractor_name", 
      "vertical": "contractor_vertical",
      "years_in_business": years_as_number,
      "rating": rating_as_number,
      "review_count": review_count_as_number,
      "service_area": "service_area",
      "pricing_band": "pricing_band",
      "speed_weeks": speed_weeks_as_number,
      "licenses": ["license1", "license2"],
      "flags": ["flag1", "flag2"],
      "score": final_score_within_plus_minus_5,
      "reasoning": "Brief reason for ±X adjustment from base score"
    }}
  ]
}}

IMPORTANT: Include ALL contractor details exactly as provided, don't modify the data.
"""

        # Step 3: Call OpenAI API for ±5 adjustment
        response = openai_client.responses.create(
            model="gpt-5",
            instructions=system_prompt,
            input=user_prompt,
        )
        
        gpt_response = response.output_text
        logger.info("Received GPT response for scoring adjustment")
        
        # Step 4: Parse and validate GPT response (enforce ±5 constraint)
        import json
        try:
            parsed_response = json.loads(gpt_response)
            top_contractors = []
            
            # Create lookup for base scores and full contractor details
            base_score_lookup = {c["id"]: c["base_score"] for c in top_candidates}
            contractor_details_lookup = {c["id"]: c for c in top_candidates}
            
            for contractor_data in parsed_response.get("top_contractors", []):
                contractor_id = contractor_data.get("id", "")
                suggested_score = float(contractor_data.get("score", 0))
                base_score = base_score_lookup.get(contractor_id, 0)
                
                # Get full contractor details
                full_contractor = contractor_details_lookup.get(contractor_id)
                if not full_contractor:
                    logger.warning(f"Contractor {contractor_id} not found in candidates")
                    continue
                
                # Enforce ±5 constraint
                min_allowed = base_score - 5
                max_allowed = base_score + 5
                final_score = max(min_allowed, min(suggested_score, max_allowed))
                
                # Log if GPT tried to exceed ±5
                if suggested_score != final_score:
                    logger.warning(f"GPT suggested {suggested_score} for {contractor_id}, clamped to {final_score} (base: {base_score})")
                
                top_contractors.append(ScoredContractor(
                    id=contractor_id,
                    name=full_contractor["name"],
                    vertical=full_contractor["vertical"],
                    years_in_business=full_contractor["years_in_business"],
                    rating=full_contractor["rating"],
                    review_count=full_contractor["review_count"],
                    service_area=full_contractor["service_area"],
                    pricing_band=full_contractor["pricing_band"],
                    speed_weeks=full_contractor["speed_weeks"],
                    licenses=full_contractor["licenses"],
                    flags=full_contractor["flags"],
                    score=round(final_score, 1),
                    reasoning=contractor_data.get("reasoning", "")
                ))
            
            # Log the scoring breakdown
            logger.info("Final scores with base comparisons:")
            for contractor in top_contractors:
                base = base_score_lookup.get(contractor.id, 0)
                adjustment = contractor.score - base
                logger.info(f"  {contractor.name}: {base:.1f} → {contractor.score:.1f} ({adjustment:+.1f})")
            
            return ScoreResponse(
                top_contractors=top_contractors[:3]  # Ensure only top 3
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse GPT response as JSON: {e}")
            # Fallback: return top 3 base scores without adjustment
            fallback_contractors = []
            for contractor in top_candidates[:3]:
                fallback_contractors.append(ScoredContractor(
                    id=contractor["id"],
                    name=contractor["name"],
                    vertical=contractor["vertical"],
                    years_in_business=contractor["years_in_business"],
                    rating=contractor["rating"],
                    review_count=contractor["review_count"],
                    service_area=contractor["service_area"],
                    pricing_band=contractor["pricing_band"],
                    speed_weeks=contractor["speed_weeks"],
                    licenses=contractor["licenses"],
                    flags=contractor["flags"],
                    score=contractor["base_score"],
                    reasoning="Base score (GPT adjustment failed)"
                ))
            
            return ScoreResponse(
                top_contractors=fallback_contractors
            )
            
    except Exception as e:
        logger.error(f"Error scoring contractors with OpenAI: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to score contractors: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Home Repair Contractor Matcher API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}