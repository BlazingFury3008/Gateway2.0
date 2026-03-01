@echo off
set "BASEDIR=%~dp0"

wt ^
  new-tab --title "API" -d "%BASEDIR%api" powershell -NoExit ^
  ; new-tab --title "Frontend" -d "%BASEDIR%frontend" powershell -NoExit ^
  ; new-tab --title "Discord" -d "%BASEDIR%discord" powershell -NoExit