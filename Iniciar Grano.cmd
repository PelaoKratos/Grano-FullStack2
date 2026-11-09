@echo off
setlocal
cd /d "%~dp0"
set "granoNode="
for /f "delims=" %%N in ('where node 2^>nul') do if not defined granoNode set "granoNode=%%N"
if not exist "%granoNode%" (
  echo Instala Node.js 22.12 o superior y vuelve a abrir este archivo.
  pause
  exit /b 1
)
for %%N in ("%granoNode%") do set "PATH=%%~dpN;%PATH%"
if not exist "node_modules\vite\bin\vite.js" (
  where npm >nul 2>nul
  if not errorlevel 1 (
    call npm install
  ) else (
    where pnpm >nul 2>nul
    if not errorlevel 1 (
      call pnpm install --frozen-lockfile
    ) else (
      echo Instala las dependencias con npm install y vuelve a abrir este archivo.
      pause
      exit /b 1
    )
  )
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
"%granoNode%" "node_modules\vite\bin\vite.js" --host 127.0.0.1 --open
if errorlevel 1 pause
