@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-26.0.2.1"
set "JAVA=%JAVA_HOME%\bin\java.exe"
set "M2=C:\Users\vijit\.m2\repository"
set "CP=%M2%\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar;%M2%\org\postgresql\postgresql\42.7.1\postgresql-42.7.1.jar;%M2%\com\google\zxing\core\3.5.2\core-3.5.2.jar;%M2%\com\google\zxing\javase\3.5.2\javase-3.5.2.jar;target\classes"

cd /d "%~dp0"
echo Starting CineVista 3D Java Server on port 8080...
"%JAVA%" -cp "%CP%" com.cinevista.CineVistaServer
pause

