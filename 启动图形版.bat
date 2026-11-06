@echo off
setlocal EnableExtensions
cd /d "%~dp0"
set "SERVER=%~dp0tools\LongMarchServer.exe"
if exist "%SERVER%" (
  start "" "%SERVER%" --root "%~dp0."
  exit /b 0
)
set "GAME=%~dp0web\index.html"
if not exist "%GAME%" set "GAME=%~dp0index.html"
if exist "%GAME%" start "" "%GAME%"
