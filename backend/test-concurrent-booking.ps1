# CineVista 3D - Concurrent Booking Stress Test
# Executes synchronized 50 simultaneous booking requests on the same seat
# Proves atomic booking and zero double bookings under heavy load

$ErrorActionPreference = "Continue"

$JAVA_HOME = "C:\Program Files\Java\jdk-26.0.2.1"
$JAVA = "$JAVA_HOME\bin\java.exe"

$M2 = "C:\Users\vijit\.m2\repository"
$CP = "$M2\com\google\code\gson\gson\2.10.1\gson-2.10.1.jar;$M2\org\postgresql\postgresql\42.7.1\postgresql-42.7.1.jar;$M2\com\google\zxing\core\3.5.2\core-3.5.2.jar;$M2\com\google\zxing\javase\3.5.2\javase-3.5.2.jar;C:\Cinevista-3D\backend\target\classes"

$output = & $JAVA -cp $CP com.cinevista.ConcurrentBookingTest 2>&1
$output | ForEach-Object {
    if ($_ -match "PASS") {
        Write-Host $_ -ForegroundColor Green
    } elseif ($_ -match "FAIL" -or $_ -match "Error") {
        Write-Host $_ -ForegroundColor Red
    } elseif ($_ -match "201 Created") {
        Write-Host $_ -ForegroundColor Green
    } elseif ($_ -match "409 Conflict") {
        Write-Host $_ -ForegroundColor Yellow
    } else {
        Write-Host $_
    }
}
