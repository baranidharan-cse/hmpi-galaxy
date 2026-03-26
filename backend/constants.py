# BIS IS 10500:2012 Permissible Limits (Si) and Calculated Weights (Wi)
# For HMPI, Wi = K / Si, where K = 1 / sum(1/Si)
# The metals: As, Pb, Cd, Cr, Hg, U, Fe

PERMISSIBLE_LIMITS = {
    'As': 0.01,
    'Pb': 0.01,
    'Cd': 0.003,
    'Cr': 0.05,
    'Hg': 0.001,
    'U': 0.03,
    'Fe': 1.0
}

# Calculate Weight (Wi) for each metal
sum_inverse_limits = sum(1 / limit for limit in PERMISSIBLE_LIMITS.values())
K = 1 / sum_inverse_limits

WEIGHTS = {metal: K / limit for metal, limit in PERMISSIBLE_LIMITS.items()}
