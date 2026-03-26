@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
node update_pkg.js
cd hmpi-web-app
call npm install gh-pages --save-dev
call npm run build
call npm run deploy
