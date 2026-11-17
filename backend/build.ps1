# CineVista 3D Backend Build Script
$ErrorActionPreference = "Stop"

$JAVA_HOME = "C:\Program Files\Java\jdk-26.0.2.1"
$JAVAC = "$JAVA_HOME\bin\javac.exe"
$JAR = "$JAVA_HOME\bin\jar.exe"

$M2 = "C:\Users\vijit\.m2\repository"
$CP = "$M2\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar;$M2\org\postgresql\postgresql\42.7.1\postgresql-42.7.1.jar;$M2\com\google\zxing\core\3.5.2\core-3.5.2.jar;$M2\com\google\zxing\javase\3.5.2\javase-3.5.2.jar"

Write-Host "Compiling CineVista 3D Backend..." -ForegroundColor Cyan
if (!(Test-Path target\classes)) { New-Item -ItemType Directory -Path target\classes -Force | Out-Null }

$sources = Get-ChildItem src\main\java -Filter *.java -Recurse | Select-Object -ExpandProperty FullName
& $JAVAC -cp $CP -d target\classes $sources

if ($LASTEXITCODE -eq 0) {
    Write-Host "Compilation successful!" -ForegroundColor Green
} else {
    Write-Host "Compilation failed." -ForegroundColor Red
    exit 1
}

