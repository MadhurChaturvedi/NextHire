import os
import shutil
import json
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from utils import extract_text, extract_contact_info, extract_skills, extract_education_experience, analyze_resume_ats
from rag import chunk_text, retrieve_relevant_chunks, generate_llm_response, build_local_fallback

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

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    resume_text: Optional[str] = ""
    skills: Optional[List[str]] = []
    target_role: Optional[str] = ""
    missing_skills: Optional[List[str]] = []
    roadmap: Optional[List[dict]] = []
    recommendedProjects: Optional[List[dict]] = []
    interview_prep: Optional[dict] = {}
    name: Optional[str] = "Applicant"

@app.get("/")
def read_root():
    return {"message": "NextHire AI NLP Service is active."}

@app.post("/parse")
def parse_resume_path(payload: ParseRequest):
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

@app.post("/chat")
def chat_endpoint(payload: ChatRequest):
    """
    RAG Chat endpoint. Chunks resume text, retrieves relevant portions,
    and calls LLM (Gemini/OpenAI) or falls back to an intelligent template.
    """
    # 1. Chunk and Retrieve
    chunks = chunk_text(payload.resume_text or "")
    # Improve retrieval accuracy by augmenting the query with role and skills
    augmented_query_parts = [payload.message or ""]
    if payload.target_role:
        augmented_query_parts.append(payload.target_role)
    if payload.skills:
        augmented_query_parts.append(" ".join(payload.skills))
    augmented_query = " ".join([p for p in augmented_query_parts if p])
    retrieved = retrieve_relevant_chunks(augmented_query, chunks, top_k=3)
    
    # 2. Build system instructions
    retrieved_context_str = "\n".join([f"- Chunk (score {r['score']:.2f}): {r['chunk']}" for r in retrieved])
    
    skills_str = ", ".join(payload.skills) if payload.skills else "None listed"
    missing_str = ", ".join(payload.missing_skills) if payload.missing_skills else "None"
    
    system_prompt = f"""You are the NextHire AI Career Assistant — act like a human career coach and recruiter.
Use a warm, conversational tone (short sentences, natural phrasing). Ask a clarifying follow-up question when helpful.

Your goal is to help {payload.name} prepare for a role as a {payload.target_role}.

Context retrieved from the applicant's resume:
{retrieved_context_str}

Key Profile Details:
- Target Role: {payload.target_role}
- Matching Skills: {skills_str}
- Missing Skills/Gap: {missing_str}

Roadmap Steps:
{json.dumps(payload.roadmap or [])}

Recommended Projects:
{json.dumps(payload.recommendedProjects or [])}

Interview Preparation Details:
{json.dumps(payload.interview_prep or {})}

Guidelines for your response:
1. Be friendly, concise, and practical — sound like a human.
2. Use retrieved resume chunks and profile context to ground answers; cite context briefly.
3. Prefer plain sentences over heavy markdown; avoid robotic phrases like "As an AI".
4. If unsure, ask one short clarifying question rather than guessing.
5. Do not hallucinate contact info or experiences not in the resume context.
"""
    
    # Format history for LLM call
    history_list = [{"role": m.role, "content": m.content} for m in payload.history]
    
    # 3. Call LLM
    response_text = generate_llm_response(system_prompt, payload.message, history_list)
    
    # 4. Fallback if LLM output was empty (no API keys set or API failed)
    is_fallback = False
    if not response_text:
        is_fallback = True
        context_dict = {
            "target_role": payload.target_role,
            "skills": payload.skills,
            "missing_skills": payload.missing_skills,
            "roadmap": payload.roadmap,
            "recommendedProjects": payload.recommendedProjects,
            "interview_prep": payload.interview_prep,
            "name": payload.name
        }
        response_text = build_local_fallback(payload.message, context_dict, retrieved)
        
    return {
        "response": response_text,
        "is_fallback": is_fallback,
        "retrieved_chunks": [r["chunk"] for r in retrieved]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

