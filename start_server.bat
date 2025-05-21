@echo off
cd /d %~dp0
echo -----------------------------
echo Запуск Flask сервера...
echo -----------------------------
set FLASK_APP=server.py
set FLASK_ENV=development
python -m flask run
pause