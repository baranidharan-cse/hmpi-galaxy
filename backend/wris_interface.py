import random
import time

def fetch_live_wris_data():
    """
    Simulates fetching real-time groundwater data from the India-WRIS portal.
    """
    time.sleep(1) # Simulate network delay
    
    # Generate a random live reading that somewhat mimics realistic ranges
    data = {
        'Latitude': round(random.uniform(20.0, 30.0), 4),
        'Longitude': round(random.uniform(70.0, 85.0), 4),
        'As': round(random.uniform(0.001, 0.05), 4),
        'Pb': round(random.uniform(0.001, 0.03), 4),
        'Cd': round(random.uniform(0.0001, 0.01), 5),
        'Cr': round(random.uniform(0.01, 0.1), 3),
        'Hg': round(random.uniform(0.0001, 0.004), 5),
        'U': round(random.uniform(0.005, 0.06), 4),
        'Fe': round(random.uniform(0.1, 2.5), 2),
    }
    return data
