@echo off
echo Stopping Python server on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do taskkill /F /PID %%a
echo Server stopped!
pause
