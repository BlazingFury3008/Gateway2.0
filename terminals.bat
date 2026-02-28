@echo off
set "BASEDIR=%~dp0"

wt -w 0 ^
  new-tab --title "API"      -d "%BASEDIR%api"      powershell ^
  ; new-tab --title "Frontend" -d "%BASEDIR%frontend" powershell ^
  ; new-tab --title "Discord"  -d "%BASEDIR%discordbot"  powershell