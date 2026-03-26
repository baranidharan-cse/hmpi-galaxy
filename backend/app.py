from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import uvicorn
import os

from hmpi_engine import process_groundwater_data, calculate_hmpi, categorize_water
from wris_interface import fetch_live_wris_data

app = FastAPI(title="HMPI Galaxy API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "data/groundwater_sample.csv"

@app.get("/api/data")
def get_historical_data():
    if not os.path.exists(DATA_FILE):
        raise HTTPException(status_code=404, detail="Data file not found")
    df = process_groundwater_data(DATA_FILE)
    return df.to_dict(orient="records")

@app.get("/api/live")
def get_live_data():
    live_data = fetch_live_wris_data()
    # Calculate HMPI for the live slice
    live_hmpi = calculate_hmpi(live_data)
    live_data['HMPI'] = live_hmpi
    live_data['Status'] = categorize_water(live_hmpi)
    
    # Try to get prediction if model exists
    model_path = "models/rf_model.pkl"
    if os.path.exists(model_path):
        import joblib
        model = joblib.load(model_path)
        features = {k: live_data[k] for k in ['Latitude', 'Longitude', 'As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe']}
        pred_df = pd.DataFrame([features])
        live_data['Predicted_Future_HMPI'] = float(model.predict(pred_df)[0])
    
    return live_data

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
