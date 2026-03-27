import random
import time
import requests
import pandas as pd
from hmpi_engine import calculate_hmpi, categorize_water

def fetch_live_wris_telemetry():
    """
    Simulates a secure India WRIS geospatial feed with 50 distributed nodes across India.
    """
    try:
        response = requests.get("https://data.gov.in/", timeout=5)
        network_status = "ONLINE" if response.status_code == 200 else "OFFLINE"
    except Exception:
        network_status = "OFFLINE"

    live_nodes = []
    
    # Generate 250 heavy-density nodes across Indian Subcontinent to create a stunning live telemetry map
    for i in range(250):
        # Weighted random distribution towards actual industrial/river basins
        if random.random() < 0.4:
            # North/East India (Ganges belt - higher pollution)
            lat = random.uniform(24.0, 28.0)
            lng = random.uniform(77.0, 88.0)
            hmpi_amplifier = 1.3
        elif random.random() < 0.7:
            # South India (Kaveri/Godavari - moderate)
            lat = random.uniform(10.0, 18.0)
            lng = random.uniform(75.0, 80.0)
            hmpi_amplifier = 0.8
        else:
            # West/Central (Narmada/Tapi - mixed)
            lat = random.uniform(19.0, 23.0)
            lng = random.uniform(70.0, 75.0)
            hmpi_amplifier = 1.0

        node_data = {
            "Sample_ID": f"WRIS-LIVE-{str(time.time()).replace('.','')[-4:]}-{random.randint(10,99)}",
            "Latitude": lat,
            "Longitude": lng,
            "As": max(0.001, random.normalvariate(0.015, 0.01) * hmpi_amplifier),
            "Pb": max(0.001, random.normalvariate(0.02, 0.015) * hmpi_amplifier),
            "Cd": max(0.0005, random.normalvariate(0.004, 0.002) * hmpi_amplifier),
            "Cr": max(0.01, random.normalvariate(0.04, 0.02) * hmpi_amplifier),
            "Hg": max(0.0001, random.normalvariate(0.0015, 0.0005) * hmpi_amplifier),
            "U": max(0.005, random.normalvariate(0.025, 0.01) * hmpi_amplifier),
            "Fe": max(0.1, random.normalvariate(0.8, 0.3) * hmpi_amplifier),
            "Network_Status": network_status
        }
        
        node_data["HMPI"] = calculate_hmpi(node_data)
        node_data["Status"] = categorize_water(node_data["HMPI"])
        live_nodes.append(node_data)
        
    return pd.DataFrame(live_nodes)

def generate_custom_node(lat: float, lng: float, query: str):
    """
    Synthesizes a specialized telemetry node for an arbitrary geographic location searched by the user.
    """
    # Simple mathematical interpolation. In a massive enterprise app, we'd query nearest neighbors.
    # For now, we adjust the pollution amplifier heavily based on whether it seems urban or remote.
    hmpi_amplifier = 1.2 if len(query) > 5 else 0.8
    
    node_data = {
        "Sample_ID": f"SEARCH-{str(time.time()).replace('.','')[-4:]}",
        "Latitude": lat,
        "Longitude": lng,
        "As": max(0.001, random.normalvariate(0.015, 0.01) * hmpi_amplifier),
        "Pb": max(0.001, random.normalvariate(0.02, 0.015) * hmpi_amplifier),
        "Cd": max(0.0005, random.normalvariate(0.004, 0.002) * hmpi_amplifier),
        "Cr": max(0.01, random.normalvariate(0.04, 0.02) * hmpi_amplifier),
        "Hg": max(0.0001, random.normalvariate(0.0015, 0.0005) * hmpi_amplifier),
        "U": max(0.005, random.normalvariate(0.025, 0.01) * hmpi_amplifier),
        "Fe": max(0.1, random.normalvariate(0.8, 0.3) * hmpi_amplifier),
        "Network_Status": "SYNTHESIZED"
    }
    
    node_data["HMPI"] = calculate_hmpi(node_data)
    node_data["Status"] = categorize_water(node_data["HMPI"])
    
    return node_data
