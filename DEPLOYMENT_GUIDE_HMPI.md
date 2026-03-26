# 🚀 HMPI Galaxy | Cloud Deployment Guide

To deploy the HMPI Automated System to the cloud so judges can open it on their phones and laptops, follow this exact step-by-step guide!

## 1. Prepare your GitHub Repository
Since cloud hosts pull code directly from GitHub, you need to push this project folder (`HMPI Project-Hack`) to a new GitHub repository:
1. Go to GitHub and create a new repository called `hmpi-galaxy`.
2. Open your terminal in `e:\HMPI Project-Hack` and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for HMPI Galaxy"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/hmpi-galaxy.git
   git push -u origin main
   ```

## 2. Deploy the Python Backend (via Render)
**Render** is an incredible free cloud host for Python APIs.
1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `hmpi-galaxy` repository.
4. **Configuration Details**:
   - **Name:** hmpi-backend
   - **Root Directory:** `backend` *(Critical: Type exactly "backend" here)*
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Click **Deploy**. Your backend will now be live on the internet! 
   *(Note: It will give you a URL like `https://hmpi-backend.onrender.com`. Copy this URL!)*

## 3. Link the Frontend to the Cloud Backend
1. Open `e:\HMPI Project-Hack\frontend\app.js` in your editor.
2. Find the top line: `const API_BASE = 'http://localhost:8000/api';`
3. Replace the `localhost` URL with the Render URL you just copied in Step 2:
   `const API_BASE = 'https://hmpi-backend.onrender.com/api';`
4. Commit and push this single change to GitHub:
   ```bash
   git add frontend/app.js
   git commit -m "Update API URL for production"
   git push
   ```

## 4. Deploy the Vanilla JS Frontend (via Vercel or GitHub Pages)
Because we built a lightning-fast Vanilla JS frontend, deployment takes 30 seconds.
1. Go to [Vercel.com](https://vercel.com/) and create a free account.
2. Click **Add New Project**, connect your GitHub, and select `hmpi-galaxy`.
3. **Configuration Details**:
   - **Root Directory:** Click "Edit" and choose the `frontend` folder.
   - **Framework Preset:** Leave it as "Other"
   - **Build Command:** *(Leave Empty)*
   - **Install Command:** *(Leave Empty)*
4. Click **Deploy**.

**🎉 Congratulations!** Vercel will immediately give you a live URL (e.g., `https://hmpi-galaxy.vercel.app`). 
Share this exact link with the CHEMOVATE 2.0 Hackathon judges!
