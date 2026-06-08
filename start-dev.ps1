$ErrorActionPreference = 'Stop'
Write-Host "Preparing NextHire development environment..."

# 1) Python service
if (-not (Test-Path "ai-service/.venv")) {
    Write-Host "Creating Python virtualenv and installing requirements..."
    python -m venv ai-service/.venv
    & "ai-service/.venv/Scripts/python.exe" -m pip install --upgrade pip
    & "ai-service/.venv/Scripts/python.exe" -m pip install -r ai-service/requirements.txt
} else {
    Write-Host "Python venv already exists. Skipping creation."
}

Write-Host "Starting AI service (uvicorn) in new window..."
Start-Process powershell -ArgumentList '-NoExit','-Command','cd ai-service; .\\venv\\Scripts\\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload'

# 2) Backend
Write-Host "Starting backend (installing dependencies if needed) in new window..."
Start-Process powershell -ArgumentList '-NoExit','-Command','cd backend; if (-not (Test-Path node_modules)) { npm install }; npm run dev'

# 3) Frontend
Write-Host "Starting frontend (installing dependencies if needed) in new window..."
Start-Process powershell -ArgumentList '-NoExit','-Command','cd frontend; if (-not (Test-Path node_modules)) { npm install }; npm run dev'

Write-Host "All start commands launched. Check the three new windows for logs."