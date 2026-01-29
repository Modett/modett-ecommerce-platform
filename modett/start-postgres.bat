@echo off
echo Starting PostgreSQL 17 service...
net start postgresql-x64-17
if %errorlevel% equ 0 (
    echo PostgreSQL started successfully!
) else (
    echo Failed to start PostgreSQL. Make sure to run this as Administrator.
    pause
)
