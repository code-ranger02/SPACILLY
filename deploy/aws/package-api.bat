@echo off
REM Package the API for Elastic Beanstalk upload (run from repo root in CMD)
cd /d "%~dp0..\..\server"
call npm ci
call npm run build
powershell -Command "Compress-Archive -Path * -DestinationPath ..\deploy\aws\spacilly-api.zip -Force"
echo Created deploy\aws\spacilly-api.zip - upload in EB Console - Upload and deploy
