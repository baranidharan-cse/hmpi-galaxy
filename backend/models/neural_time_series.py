import pandas as pd
from sklearn.neural_network import MLPRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score
import numpy as np
import os
import joblib
import sys

def train_deep_neural_network(csv_path='../data/groundwater_sample.csv'):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(current_dir)
    sys.path.append(backend_dir)
        
    from hmpi_engine import process_groundwater_data
    from wris_interface import fetch_live_wris_telemetry
    
    if not os.path.exists(csv_path):
        return None
        
    print("Initializing Deep Learning Neural Network Architecture Phase...")
    historical_df = process_groundwater_data(csv_path)
    live_df = fetch_live_wris_telemetry()
    df = pd.concat([historical_df, live_df], ignore_index=True)
    
    features = ['Latitude', 'Longitude', 'As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe']
    X = df[features]
    
    # Simulate historical multi-year exponential drift target for Neural Net
    np.random.seed(42)
    y_future = df['HMPI'] * np.random.uniform(1.25, 1.45, size=len(df))
    
    X_train, X_test, y_train, y_test = train_test_split(X, y_future, test_size=0.2, random_state=42)
    
    print("Compiling Multi-Layer Perceptron (LSTM-Simulated) Neural Network...")
    # This Deep Neural Network uses 3 hidden layers (100, 50, and 25 neurons)
    nn_model = MLPRegressor(hidden_layer_sizes=(100, 50, 25), max_iter=1000, random_state=42, learning_rate_init=0.01)
    nn_model.fit(X_train, y_train)
    
    score = nn_model.score(X_test, y_test)
    print(f"Deep Neural Network Successfully Compiled! R^2 Score Validation: {score:.3f}")
    
    model_path = os.path.join(current_dir, 'deep_neural_network.pkl')
    joblib.dump(nn_model, model_path)
    
    return nn_model

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(os.path.dirname(current_dir), 'data', 'groundwater_sample.csv')
    train_deep_neural_network(csv_path=data_path)
