@echo off
setlocal

REM If first arg is "c", open VS Code (but keep going)
if /I "%~1"=="c" (
  start "" code "%~dp0"
)

REM Always ensure venv exists (your venv.bat should create it if missing)
call "%~dp0venv.bat"
if errorlevel 1 (
  echo venv.bat failed.
  exit /b 1
)

REM Always activate venv
call "%~dp0venv\Scripts\activate.bat"
if errorlevel 1 (
  echo Failed to activate venv.
  exit /b 1
)

REM Always install requirements
python -m pip install --upgrade pip
python -m pip install -r "%~dp0requirements.txt"
if errorlevel 1 (
  echo pip install failed.
  exit /b 1
)

REM Always run
python "%~dp0main.py"
endlocal