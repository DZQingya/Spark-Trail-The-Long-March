@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d "%~dp0"
set "GAME=%~dp0index.html"
set "EDGE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not exist "%EDGE%" set "EDGE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if exist "%EDGE%" (
  set "GAME_URI=!GAME:\=/!"
  start "" "%EDGE%" --app="file:///!GAME_URI!" --window-size=1400,900 --no-first-run
  exit /b 0
)
start "" "%GAME%"