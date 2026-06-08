Quick start (Windows PowerShell)

1. Copy `.env.example` to `.env` and fill in values (especially `GEMINI_API_KEY`).

2. From the repository root run the helper script (PowerShell):

```powershell
.\start-dev.ps1
```

This will:

- Create a Python venv in `ai-service/.venv` and install requirements.
- Launch the AI service (uvicorn) on `http://127.0.0.1:8000`.
- Install backend/frontend npm deps if needed and start them in separate windows.

Manual steps (if you prefer):

AI service (Python):

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Backend (Node):

```powershell
cd backend
npm install
npm run dev
```

Frontend (Node):

```powershell
cd frontend
npm install
npm run dev
```

After all services are running:

- The backend expects the AI service at `http://127.0.0.1:8000` by default (see `PYTHON_SERVICE_URL`).
- Upload a resume via the frontend UI; the backend will stream the file to the AI service for parsing.

Troubleshooting:

- If parsing still returns "Unknown Applicant", check the ai-service logs (the uvicorn window) to see parsing errors.
- If ports conflict, change the host/port values in `.env` and in `backend` env variables.
- Ensure you rotated any posted API key and placed the new key in `.env`.
