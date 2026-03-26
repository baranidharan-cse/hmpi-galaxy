@echo off
set "PATH=%PATH%;C:\Program Files\nodejs"
call npx -y create-vite@latest hmpi-web-app --template react-ts
cd hmpi-web-app
call npm install
call npm install lucide-react recharts leaflet react-leaflet @types/leaflet tailwindcss postcss autoprefixer
call npx tailwindcss init -p
