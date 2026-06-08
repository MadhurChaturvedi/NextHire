NextHire AI Service

This folder contains the FastAPI service used for resume parsing, RAG, and LLM calls.

Quick start:

1. Create a `.env` file at the repo root (or set environment variables) and add:

GEMINI_API_KEY=your_gemini_api_key_here
PYTHON_SERVICE_URL=http://127.0.0.1:8000

2. Install dependencies (recommended in a venv):

pip install -r requirements.txt

3. Run the service:

uvicorn main:app --host 127.0.0.1 --port 8000 --reload

Notes:

- The service will use `GEMINI_API_KEY` for LLM generation when present. For embeddings it currently uses OpenAI embeddings or a local sentence-transformers fallback.
- Do NOT commit secrets to the repository. Use environment variables or a secrets manager.
