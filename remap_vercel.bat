@echo off
cd "e:\HMPI Project-Hack"
del deploy_vercel.bat
del deploy_docs.bat
rmdir /s /q "frontend"
ren "hmpi-web-app" "frontend"
git add -A
git commit -m "Remap React Vite source code strictly into legacy frontend hierarchy for native Vercel compilation"
git push
