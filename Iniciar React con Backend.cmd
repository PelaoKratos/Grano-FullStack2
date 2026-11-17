@echo off
setlocal
cd /d "%~dp0"
echo Abre primero backend\Iniciar Backend.cmd y deja su ventana abierta.
echo Este acceso inicia React conectado a ese servidor, usando H2.
echo Para detener React, pulsa Ctrl+C en esta ventana.
call "%~dp0Iniciar Grano.cmd" --backend
exit /b %errorlevel%
