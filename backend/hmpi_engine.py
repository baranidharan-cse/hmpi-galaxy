import pandas as pd
from constants import WEIGHTS, PERMISSIBLE_LIMITS

def calculate_hmpi(row):
    """
    Calculate the Heavy Metal Pollution Index (HMPI) for a single sample (row).
    Formula: HMPI = sum(Wi * Qi) / sum(Wi)
    Where Sub-index Qi = (Mi / Si) * 100
    Mi = measured concentration, Si = standard permissible limit
    """
    numerator = 0
    denominator = 0
    
    for metal in WEIGHTS.keys():
        if pd.isna(row.get(metal)):
            continue
        
        Mi = float(row[metal])
        Si = PERMISSIBLE_LIMITS[metal]
        Wi = WEIGHTS[metal]
        
        Qi = (Mi / Si) * 100
        numerator += Wi * Qi
        denominator += Wi
        
    if denominator == 0:
        return 0
    return numerator / denominator

def categorize_water(hmpi_score):
    if hmpi_score < 100:
        return 'Good'
    elif hmpi_score <= 150:
        return 'Poor'
    else:
        return 'Unsafe'

def process_groundwater_data(filepath):
    df = pd.read_csv(filepath)
    df['HMPI'] = df.apply(calculate_hmpi, axis=1)
    df['Status'] = df['HMPI'].apply(categorize_water)
    return df
