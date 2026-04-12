from fastapi import APIRouter, HTTPException
import os
from dotenv import load_dotenv
import json
import random

load_dotenv()
from database.db import questions_collection
from database.models import Question

router = APIRouter()

# Try importing google.generativeai but do not fail if missing
try:
    import google.generativeai as genai
    HAS_GEMINI = True
except ImportError:
    HAS_GEMINI = False

@router.post("/api/generate-questions/{subject}")
async def generate_questions(subject: str):
    """
    Generate 10 multiple choice questions using AI and save them to MongoDB.
    Uses Gemini API if key exists. No dummy data fallback.
    """
    gemini_key = os.getenv("GEMINI_API_KEY")
    generated_questions = []

    if HAS_GEMINI and gemini_key:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        Generate 10 multiple choice questions for {subject} at a university level.
        Each question must include:
        - question
        - 4 options (array of strings)
        - answer (string, exactly matching one of the options)
        - difficulty (Easy, Medium, Hard)
        
        Return ONLY valid JSON format like:
        [
            {{
                "question": "What is...?",
                "options": ["A", "B", "C", "D"],
                "answer": "B",
                "difficulty": "Medium"
            }}
        ]
        Do not use markdown blocks like ```json ...``` just return the raw JSON array.
        """
        try:
            response = model.generate_content(prompt)
            text = response.text
            start = text.find('[')
            end = text.rfind(']') + 1
            if start != -1 and end != -1:
                json_str = text[start:end]
                generated_questions = json.loads(json_str)
        except Exception as e:
            print(f"Gemini API generation failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate AI questions.")
    else:
        raise HTTPException(status_code=500, detail="Gemini API not configured.")

    if not generated_questions:
        raise HTTPException(status_code=500, detail="Gemini returned invalid or empty JSON.")
            
    # Insert cleanly into DB
    inserted_count = 0
    for q_data in generated_questions:
        # Avoid exact duplicates if possible
        existing = questions_collection.find_one({"subject": subject, "question": q_data["question"]})
        if not existing:
            doc = {
                "subject": subject,
                "question": q_data["question"],
                "options": q_data["options"],
                "answer": q_data["answer"],
                "difficulty": q_data.get("difficulty", "Medium")
            }
            questions_collection.insert_one(doc)
            inserted_count += 1
            
    return {"message": f"Successfully generated and inserted {inserted_count} questions"}


@router.get("/api/questions/{subject}")
async def get_questions(subject: str):
    """
    Always generate new questions on request and return 10 random questions for the exam.
    Raises an error if generation completely fails.
    """
    # Always attempt to generate fresh questions for the user
    try:
        await generate_questions(subject)
    except Exception as e:
        print(f"Could not generate new questions this time: {e}")
        # Find all questions for subject to see if we have ANY existing cache
        cursor = questions_collection.find({"subject": subject}, {"_id": 0})
        questions = list(cursor)
        
        if not questions:
            # We have nothing to show the user, so throw the generation error upwards
            raise e

    # Find all questions for subject
    cursor = questions_collection.find({"subject": subject}, {"_id": 0})
    questions = list(cursor)
    
    if not questions:
        raise HTTPException(status_code=500, detail="No questions available and generation failed.")
        
    # Return 10 random questions
    if len(questions) > 10:
        questions = random.sample(questions, 10)
        
    return questions
