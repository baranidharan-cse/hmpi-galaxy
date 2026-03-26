import pandas as pd
import numpy as np
import datetime
import os

def generate_sample_data():
    np.random.seed(42)
    num_samples = 50

    data = {
        'Sample_ID': [f'GW_{i:03d}' for i in range(1, num_samples + 1)],
        'Date': [str(datetime.date.today() - datetime.timedelta(days=i*7)) for i in range(num_samples)],
        'Latitude': np.random.uniform(20.0, 30.0, num_samples),
        'Longitude': np.random.uniform(70.0, 85.0, num_samples),
        'As': np.random.uniform(0.001, 0.05, num_samples),
        'Pb': np.random.uniform(0.001, 0.03, num_samples),
        'Cd': np.random.uniform(0.0001, 0.01, num_samples),
        'Cr': np.random.uniform(0.01, 0.1, num_samples),
        'Hg': np.random.uniform(0.0001, 0.004, num_samples),
        'U': np.random.uniform(0.005, 0.06, num_samples),
        'Fe': np.random.uniform(0.1, 2.5, num_samples),
    }

    df = pd.DataFrame(data)

    os.makedirs('data', exist_ok=True)
    df.to_csv('data/groundwater_sample.csv', index=False)
    print("Generated data/groundwater_sample.csv successfully.")

if __name__ == "__main__":
    generate_sample_data()
