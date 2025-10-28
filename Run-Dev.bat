@echo off
REM Arranca backend (3000) y Vite (5173) en ventanas separadas. Corrige problemas donde solo se abria la ruta sin ejecutar comandos.
SETLOCAL ENABLEEXTENSIONS ENABLEDELAYEDEXPANSION

REM 1) Verificar Node y npm en PATH
where node >nul 2>nul || (echo [ERROR] Node.js no esta en el PATH. Instale Node.js y reinicie la sesion. & pause & exit /b 1)
where npm  >nul 2>nul || (echo [ERROR] npm no esta en el PATH. & pause & exit /b 1)

REM 2) Backend: usar start + cmd /k con & escapados (^&) para que CMD no corte el argumento.
start "backend" /D "%~dp0backend" cmd /k "(if not exist node_modules (echo Instalando dependencias backend... ^& npm install)) ^& npm run dev"

REM 3) Frontend (Vite)
start "frontend" /D "%~dp0frontEnd\react-app" cmd /k "(if not exist node_modules (echo Instalando dependencias frontend... ^& npm install)) ^& npm run dev"

REM 4) Abrir el navegador hacia la URL del frontend de desarrollo
start "" http://localhost:5173/views/paginaPrincipal.html

ENDLOCAL
