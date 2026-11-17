# CineVista 3D Backend Run Script
$JAVA_HOME = "C:\Program Files\Java\jdk-26.0.2.1"
$JAVA = "$JAVA_HOME\bin\java.exe"

$M2 = "C:\Users\vijit\.m2\repository"
$CP = "$M2\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar;$M2\org\postgresql\postgresql\42.7.1\postgresql-42.7.1.jar;$M2\com\google\zxing\core\3.5.2\core-3.5.2.jar;$M2\com\google\zxing\javase\3.5.2\javase-3.5.2.jar;target\classes"

Set-Location -Path $PSScriptRoot
& $JAVA -cp $CP com.cinevista.CineVistaServer

