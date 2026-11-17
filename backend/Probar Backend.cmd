@echo off
setlocal
cd /d "%~dp0"
if exist "%ProgramFiles%\Java\jdk-17\bin\java.exe" set "JAVA_HOME=%ProgramFiles%\Java\jdk-17"
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"
where mvn >nul 2>nul
if errorlevel 1 (
  echo Instala Maven y configura JAVA_HOME con la carpeta de tu JDK 17.
  if /i not "%~1"=="--sin-pausa" pause
  exit /b 1
)
echo Las pruebas usan H2 temporal. No modifican la base habitual.
call mvn test
set "granoResultado=%errorlevel%"
if /i not "%~1"=="--sin-pausa" pause
exit /b %granoResultado%
