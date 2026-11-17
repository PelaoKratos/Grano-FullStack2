@echo off
setlocal
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo No encuentro Docker. Abre Docker Desktop y vuelve a intentarlo.
  pause
  exit /b 1
)

docker compose up -d --wait
if errorlevel 1 (
  echo No se pudo iniciar PostgreSQL. Revisa Docker Desktop y vuelve a intentarlo.
  pause
  exit /b 1
)

if exist "%ProgramFiles%\Java\jdk-17\bin\java.exe" set "JAVA_HOME=%ProgramFiles%\Java\jdk-17"
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
where mvn >nul 2>nul
if errorlevel 1 (
  echo Instala Maven y configura JAVA_HOME con la carpeta de tu JDK 17.
  pause
  exit /b 1
)

set "SPRING_PROFILES_ACTIVE=postgres"
call mvn spring-boot:run
set "RESULTADO=%ERRORLEVEL%"
if not "%RESULTADO%"=="0" pause
exit /b %RESULTADO%
