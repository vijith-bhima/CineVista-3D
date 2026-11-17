@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.2.1"
set "JAVAC=%JAVA_HOME%\bin\javac.exe"
set "M2=C:\Users\vijit\.m2\repository"
set "CP=%M2%\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar;%M2%\org\postgresql\postgresql\42.7.1\postgresql-42.7.1.jar;%M2%\com\google\zxing\core\3.5.2\core-3.5.2.jar;%M2%\com\google\zxing\javase\3.5.2\javase-3.5.2.jar"

cd /d "%~dp0"
if not exist "target\classes" mkdir "target\classes"

echo Compiling Java source files...
dir /s /b src\main\java\*.java > sources.txt
"%JAVAC%" -cp "%CP%" -d target\classes @sources.txt
del sources.txt

if %ERRORLEVEL% EQU 0 (
    echo Compilation successful!
) else (
    echo Compilation failed.
)

