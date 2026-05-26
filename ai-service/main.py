import os
import shutil
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from utils import extract_text, extract_contact_info, extract_skills, extract_education_experience, analyze_resume_ats

app = FastAPI(
    title="NextHire AI Service",
    description="Python NLP Service for Resume Parsing and Skill Gap Analysis",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ParseRequest(BaseModel):
    file_path: str

class AnalyzeRequest(BaseModel):
    text: str
    skills: List[str]
    target_role: str

@app.get("/")
def read_root():
    return {"message": "NextHire AI NLP Service is active."}

@app.post("/parse")
async def parse_resume_path(payload: ParseRequest):
    """
    Parse a resume file located at the specified local path.
    Extracts text, contact info, skills, education, and experience.
    """
    file_path = payload.file_path
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"File not found at: {file_path}")
        
    text = extract_text(file_path)
    if not text:
        raise HTTPException(status_code=422, detail="Unable to extract text from the file.")
        
    contact = extract_contact_info(text)
    skills = extract_skills(text)
    structure = extract_education_experience(text)
    
    return {
        "text": text,
        "contact": contact,
        "skills": skills,
        "structure": structure
    }

@app.post("/parse-file")
async def parse_resume_file(file: UploadFile = File(...)):
    """
    Parse an uploaded resume file directly.
    Saves it temporarily, parses, and deletes it.
    """
    # Create temp directory
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)
    
    temp_file_path = os.path.join(temp_dir, file.filename)
    try:
        # Write to temp file
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        text = extract_text(temp_file_path)
        if not text:
            raise HTTPException(status_code=422, detail="Unable to extract text from file.")
            
        contact = extract_contact_info(text)
        skills = extract_skills(text)
        structure = extract_education_experience(text)
        
        return {
            "text": text,
            "contact": contact,
            "skills": skills,
            "structure": structure
        }
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

@app.post("/analyze")
def analyze_resume(payload: AnalyzeRequest):
    """
    Compute ATS score, skill gap, and learning roadmap for a target job role.
    """
    text = payload.text
    skills = payload.skills
    target_role = payload.target_role
    
    analysis = analyze_resume_ats(text, target_role, skills)
    return analysis

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
