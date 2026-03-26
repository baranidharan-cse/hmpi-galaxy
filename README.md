# 🌍 HMPI Galaxy | Groundwater Quality Assessment System

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)]()
[![FastAPI](https://img.shields.io/badge/FastAPI-0.103-009688.svg)]()
[![scikit-learn](https://img.shields.io/badge/AI-scikit--learn-F7931E.svg)]()
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet.js-BADA55.svg)]()

**HMPI Galaxy** is an autonomous, AI-driven web application built for the **CHEMOVATE 2.0** hackathon (Software / Miscellaneous). It completely automates the mathematical calculation of the Heavy Metal Pollution Index (HMPI), strictly adhering to official **WHO and BIS (IS 10500:2012)** drinking water guidelines. It utilizes machine learning to actively forecast future contamination degradation trends.

## 🚀 Key Features

*   **📊 Automated WHO/BIS Engine:** Bypasses manual calculation errors by computing HMPI formulas instantly for critical heavy metals (As, Pb, Cd, Cr, Hg, U, Fe) using the matrix: `HMPI = (1/n) × Σ(Ci/Si × 100)`.
*   **🤖 AI Predictive Forecasting:** Implements a localized `scikit-learn` RandomForestRegressor model capable of accurately predicting future groundwater pollution trajectories based on historical WRIS datasets.
*   **🗺️ Interactive GIS Dashboard:** An immersive dark-mode Glassmorphism web application mapping real-time heavy metal hotspots actively via Leaflet.js rendering.
*   **📈 Global Statistics Matrix:** Houses a built-in Chart.js analytics engine that visually tracks metal detection frequencies and severity thresholds mathematically across all aggregated geolocations.
*   **🧮 Manual HMPI Diagnostic Tool:** Provides a custom UI for field scientists to manually input raw groundwater sample values (mg/L) against standardized baselines, mapping hypothetical scenarios dynamically to the cloud.

## 🛠️ Technology Stack

*   **Frontend UI:** Vanilla JavaScript, HTML5, CSS3 Glassmorphism UI, Leaflet.js Map rendering, Chart.js Analytics, Lucide Integration.
*   **Backend API:** Python 3.10, FastAPI, Pandas, NumPy mathematical routing.
*   **Artificial Intelligence:** Scikit-Learn, Random Forests.
*   **Cloud Architecture:** Docker, Render (Data Engine), Vercel (Client Dashboard).

## 🏃‍♂️ How to Run Locally

### 1. Initialize the AI & Data API (Backend)
Navigate to the `backend` directory, install identical dependencies, and spin up the Python server:
```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```
*The FastAPI engine will mount securely on `http://127.0.0.1:8000`.*

### 2. Launch the Global Dashboard (Frontend)
Because the frontend operates optimally via native execution, simply launch the `frontend/index.html` file in any modern web browser.
*(Ensure your API endpoint variable in `app.js` is set back to `http://localhost:8000/api` for local testing instead of the live Render link).*

## 🧠 Retraining the AI Model
To recalibrate the Artificial Intelligence prediction model using raw live files from India-WRIS or the Central Ground Water Board, replace `backend/data/groundwater_sample.csv` with real tracking coordinates and execute:
```bash
python backend/models/predictive_model.py
```
This automatically recompiles and maps an updated `rf_model.pkl` binary for your FastAPI endpoints.

---
*Architected with precision by Team ARENA GALAXY for CHEMOVATE 2.0.*
