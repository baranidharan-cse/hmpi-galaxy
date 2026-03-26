import joblib
import pandas as pd
import matplotlib.pyplot as plt
import sys
import os

def generate_shap_explanations():
    print("Initiating Explainable AI (SHAP) Matrix...")
    try:
        import shap
    except ImportError:
        print("Please run `pip install shap` to generate Explainable AI graphics.")
        return

    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, 'advanced_rf_model.pkl')
    csv_path = os.path.join(os.path.dirname(current_dir), 'data', 'groundwater_sample.csv')
    
    sys.path.append(os.path.dirname(current_dir))
    from hmpi_engine import process_groundwater_data
    
    df = process_groundwater_data(csv_path)
    features = ['Latitude', 'Longitude', 'As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe']
    X = df[features]
    
    # Load the Advanced Gradient Boosting Model
    model = joblib.load(model_path)
    
    # Generate SHAP values
    explainer = shap.Explainer(model, X)
    shap_values = explainer(X)
    
    # We must strictly define the plot to bypass matplotlib threaded UI limits
    plt.figure(figsize=(10, 6))
    shap.summary_plot(shap_values, X, show=False)
    plt.title("Explainable AI: Mathematical SHAP Value Impact on Toxicity")
    
    os.makedirs(os.path.join(current_dir, 'plots'), exist_ok=True)
    plot_path = os.path.join(current_dir, 'plots', 'shap_summary.png')
    plt.savefig(plot_path, bbox_inches='tight')
    plt.close()
    
    print(f"SHAP Explanation Graph Generated Natively: {plot_path}")

if __name__ == "__main__":
    generate_shap_explanations()
