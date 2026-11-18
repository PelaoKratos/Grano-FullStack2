param([switch]$Aplicar)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

# Cerramos el backend antes para que nadie cambie datos durante la copia.
if (Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue) {
    throw 'Cierra el backend con Ctrl+C antes de continuar. Docker puede seguir abierto.'
}
if (Test-Path "$env:ProgramFiles\Java\jdk-17\bin\java.exe") {
    $env:JAVA_HOME = "$env:ProgramFiles\Java\jdk-17"
    $env:Path = "$env:JAVA_HOME\bin;$env:Path"
}
if (!(Test-Path 'data/grano.mv.db')) { throw 'No encuentro la base H2 en backend/data.' }
docker compose up -d --wait
if ($LASTEXITCODE -ne 0) { throw 'No se pudo iniciar PostgreSQL.' }

if ($Aplicar) {
    # Cada intento tiene su propio respaldo y no reemplaza los anteriores.
    $carpeta = Join-Path $PSScriptRoot ('respaldos/' + [DateTime]::Now.ToString('yyyyMMdd-HHmmss-fff'))
    New-Item -ItemType Directory -Path $carpeta | Out-Null
    Copy-Item -LiteralPath 'data/grano.mv.db' -Destination $carpeta
    docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f /tmp/grano-migracion.dump'
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo respaldar PostgreSQL. No se aplicará la migración.' }
    $contenedor = (docker compose ps -q postgres).Trim()
    if ($LASTEXITCODE -ne 0 -or !$contenedor) { throw 'No encuentro el contenedor de PostgreSQL.' }
    docker cp "${contenedor}:/tmp/grano-migracion.dump" (Join-Path $carpeta 'postgres.dump')
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo guardar el respaldo de PostgreSQL.' }
    Write-Host "Respaldos guardados en $carpeta"
}

& mvn dependency:build-classpath '-Dmdep.outputFile=target/migracion-classpath.txt' '-DincludeScope=runtime' -q
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron preparar los drivers JDBC.' }
$classpath = (Get-Content 'target/migracion-classpath.txt' -Raw).Trim()
$opciones = @()
if ($Aplicar) { $opciones += '--aplicar' }
& java --class-path $classpath 'tools/MigrarDatos.java' @opciones
if ($LASTEXITCODE -ne 0) { throw 'La migración no se completó. Revisa el mensaje anterior.' }
