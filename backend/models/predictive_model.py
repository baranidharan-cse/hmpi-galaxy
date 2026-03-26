import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import numpy as np
import os
import joblib

def train_model(csv_path='../data/groundwater_sample.csv'):
    import sys
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from hmpi_engine import process_groundwater_data
    
    if not os.path.exists(csv_path):
        print(f"Data file {csv_path} not found. Skipped training.")
        return None

    df = process_groundwater_data(csv_path)
    
    features = ['Latitude', 'Longitude', 'As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe']
    X = df[features]
    
    # Simulate "Future HMPI" by adding 5-15% variance
    np.random.seed(42)
    y = df['HMPI'] * np.random.uniform(1.05, 1.15, size=len(df))
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    score = model.score(X_test, y_test)
    print(f"Model trained. R^2 Score: {score:.2f}")
    
    # Save the model
    os.makedirs(os.path.dirname(__file__), exist_ok=True)
    joblib.dump(model, os.path.join(os.path.dirname(__file__), 'rf_model.pkl'))
    return model

def predict_future_hmpi(model_path, current_data):
    model = joblib.load(model_path)
    df = pd.DataFrame([current_data])
    prediction = model.predict(df)[0]
    return prediction

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(os.path.dirname(current_dir), 'data', 'groundwater_sample.csv')
    train_model(csv_path=data_path)
