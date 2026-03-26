/* app.js */
// 🚀 CLOUD DEPLOYMENT STEP: 
// Replace 'http://localhost:8000/api' with your deployed backend URL (e.g., 'https://hmpi-backend.onrender.com/api')
const API_BASE = 'http://localhost:8000/api';

const map = L.map('map').setView([22.0, 79.0], 5);

// Add Carto Dark Matter tiles for a beautiful dark theme map
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);

const aiPredValue = document.getElementById('ai-pred-value');
const currentHmpi = document.getElementById('current-hmpi');
const qualityBadge = document.getElementById('quality-badge');
const refreshBtn = document.getElementById('refresh-btn');
const loadHistBtn = document.getElementById('load-history-btn');
const loadingOverlay = document.getElementById('loading-overlay');

function getColorForStatus(status) {
    if (status === 'Good') return '#10b981';
    if (status === 'Poor') return '#f59e0b';
    return '#ef4444';
}

function updateDashboardUI(data) {
    if (!Array.isArray(data)) {
        currentHmpi.textContent = data.HMPI.toFixed(2);
        qualityBadge.textContent = data.Status;
        qualityBadge.className = `quality-badge quality-${data.Status.toLowerCase()}`;
        
        if(data.Predicted_Future_HMPI) {
            aiPredValue.textContent = data.Predicted_Future_HMPI.toFixed(2);
        } else {
            aiPredValue.textContent = "N/A";
        }
    } else {
        // Just show averages or reset
        currentHmpi.textContent = "Multi";
        qualityBadge.textContent = "Historical View";
        qualityBadge.className = "quality-badge";
        aiPredValue.textContent = "Historical";
    }
}

function createMarker(lat, lng, hmpi, status, date) {
    const color = getColorForStatus(status);
    
    // Create custom circle marker
    const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 1,
        fillOpacity: 0.8
    });

    const popupContent = `
        <div class="popup-title">HMPI Score: ${hmpi.toFixed(2)}</div>
        <div class="popup-stat"><strong>Status:</strong> <span style="color:${color}">${status}</span></div>
        <div class="popup-stat"><strong>Lat/Lng:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        ${date ? `<div class="popup-stat"><strong>Date:</strong> ${date}</div>` : ''}
    `;
    
    marker.bindPopup(popupContent);
    return marker;
}

async function loadHistoricalData() {
    loadingOverlay.classList.remove('hidden');
    markersLayer.clearLayers();
    try {
        const response = await fetch(`${API_BASE}/data`);
        const data = await response.json();
        
        data.forEach(point => {
            const marker = createMarker(point.Latitude, point.Longitude, point.HMPI, point.Status, point.Date);
            markersLayer.addLayer(marker);
        });

        const bounds = L.latLngBounds(data.map(p => [p.Latitude, p.Longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });

        updateDashboardUI(data);
    } catch (err) {
        console.error("Error loading historical data:", err);
        alert("Ensure FastAPI backend is running on port 8000!");
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

async function fetchLiveData() {
    loadingOverlay.classList.remove('hidden');
    markersLayer.clearLayers();
    
    try {
        const response = await fetch(`${API_BASE}/live`);
        const data = await response.json();
        
        updateDashboardUI(data);
        
        const marker = createMarker(data.Latitude, data.Longitude, data.HMPI, data.Status, 'LIVE (Just now)');
        markersLayer.addLayer(marker);
        
        map.flyTo([data.Latitude, data.Longitude], 8, { duration: 1.5 });
        
    } catch (err) {
        console.error("Error fetching live data:", err);
        alert("Ensure FastAPI backend is running on port 8000!");
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

refreshBtn.addEventListener('click', fetchLiveData);
loadHistBtn.addEventListener('click', loadHistoricalData);

window.addEventListener('load', loadHistoricalData);
