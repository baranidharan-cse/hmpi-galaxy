@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
cd hmpi-web-app
call npm install @tailwindcss/postcss
call npm run build
