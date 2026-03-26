from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import uvicorn
import os

from hmpi_engine import process_groundwater_data, calculate_hmpi, categorize_water
from wris_interface import fetch_live_wris_telemetry

app = FastAPI(title="HMPI Galaxy Enterprise API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MetalPayload(BaseModel):
    As: float = 0.0
    Pb: float = 0.0
    Cd: float = 0.0
    Cr: float = 0.0
    Hg: float = 0.0
    U: float = 0.0
    Fe: float = 0.0
    Latitude: float = 0.0
    Longitude: float = 0.0

@app.get("/api/map/nodes")
def get_historical_nodes():
    df = process_groundwater_data("data/groundwater_sample.csv")
    return df.to_dict(orient="records")

@app.get("/api/wris/sync")
def sync_wris_live_data():
    live_df = fetch_live_wris_telemetry()
    return live_df.to_dict(orient="records")

@app.post("/api/engine/calculate")
def calculate_manual_hmpi(payload: MetalPayload):
    # Convert payload to strict dict format matching our pandas row expectation
    data_dict = payload.dict()
    hmpi_score = calculate_hmpi(data_dict)
    status = categorize_water(hmpi_score)
    return {"calculated_hmpi": hmpi_score, "severity": status}

@app.post("/api/ai/predict")
def predict_future_trend(payload: MetalPayload):
    model_path = "models/rf_model.pkl"
    if not os.path.exists(model_path):
        return {"error": "AI Model not trained yet.", "predicted_hmpi": 0}
    
    import joblib
    model = joblib.load(model_path)
    # The Random Forest expects specific order: 'Latitude', 'Longitude', 'As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe'
    features = {
        'Latitude': payload.Latitude, 'Longitude': payload.Longitude,
        'As': payload.As, 'Pb': payload.Pb, 'Cd': payload.Cd, 
        'Cr': payload.Cr, 'Hg': payload.Hg, 'U': payload.U, 'Fe': payload.Fe
    }
    
    pred_df = pd.DataFrame([features])
    future_hmpi = float(model.predict(pred_df)[0])
    return {"predicted_hmpi": future_hmpi, "severity": categorize_water(future_hmpi)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
