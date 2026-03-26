/* app.js */
// 🚀 CLOUD DEPLOYMENT STEP: Fully connected to live Render backend!
const API_BASE = 'https://hmpi-groundwater-monitoring-system-live.onrender.com/api';

const map = L.map('map', {zoomControl: false}).setView([22.0, 79.0], 5);
L.control.zoom({ position: 'topright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);
let currentLocations = [];
let selectedLocationId = null;

// DOM Elements
const aiPredValue = document.getElementById('ai-pred-value');
const currentHmpi = document.getElementById('current-hmpi');
const qualityBadge = document.getElementById('quality-badge');
const refreshBtn = document.getElementById('refresh-btn');
const loadHistBtn = document.getElementById('load-history-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const locationCardsContainer = document.getElementById('location-cards');

// Converted User Logic: Generating precise status values based on the 4 provided thresholds
function getStatusObject(hmpi) {
    if (hmpi < 50) return { color: '#22c55e', text: 'Low Pollution', class: 'quality-low-pollution', bgClass: 'bg-green', textClass: 'text-green' };
    if (hmpi < 100) return { color: '#eab308', text: 'Moderate', class: 'quality-moderate', bgClass: 'bg-yellow', textClass: 'text-yellow' };
    if (hmpi < 200) return { color: '#f97316', text: 'High Pollution', class: 'quality-high-pollution', bgClass: 'bg-orange', textClass: 'text-orange' };
    return { color: '#ef4444', text: 'Critical', class: 'quality-critical', bgClass: 'bg-red', textClass: 'text-red' };
}

function updateDashboardUI(data) {
    if (!Array.isArray(data)) {
        currentHmpi.textContent = data.HMPI.toFixed(1);
        const statusObj = getStatusObject(data.HMPI);
        qualityBadge.textContent = statusObj.text;
        qualityBadge.className = `quality-badge ${statusObj.class}`;
        
        if(data.Predicted_Future_HMPI) {
            aiPredValue.textContent = data.Predicted_Future_HMPI.toFixed(1);
        } else {
            aiPredValue.textContent = "N/A";
        }
    } else {
        currentHmpi.textContent = "Multi-Point";
        qualityBadge.textContent = "Region View";
        qualityBadge.className = "quality-badge quality-moderate";
        aiPredValue.textContent = "Analysis Mode";
    }
}

// User Logic: Handling clicks on the cards grid or map pins to focus on specific zones
function selectLocation(loc) {
    selectedLocationId = loc.Sample_ID || loc.Latitude.toString();
    map.flyTo([loc.Latitude, loc.Longitude], 9, { duration: 1.5 });
    updateDashboardUI(loc);
    renderLocationCards();
}

// User Logic: Rendering the grid of selectable location cards in the sidebar
function renderLocationCards() {
    locationCardsContainer.innerHTML = '';
    
    currentLocations.slice(0, 50).forEach(loc => {
        const hmpi = loc.HMPI;
        const statusObj = getStatusObject(hmpi);
        const id = loc.Sample_ID || loc.Latitude.toString();
        
        const btn = document.createElement('button');
        btn.className = `loc-btn ${selectedLocationId === id ? 'selected' : ''}`;
        btn.onclick = () => selectLocation(loc);
        
        btn.innerHTML = `
            <div class="loc-top">
                <div class="dot ${statusObj.bgClass}" style="width:12px;height:12px;border-radius:50%; box-shadow: 0 0 5px ${statusObj.color};"></div>
                <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${loc.Sample_ID || 'Live Ping'}</span>
            </div>
            <div class="loc-hmpi">Index Score: ${hmpi.toFixed(1)}</div>
            <div class="loc-status ${statusObj.textClass}">${statusObj.text}</div>
        `;
        locationCardsContainer.appendChild(btn);
    });
}

// Deep integration of the custom Marker logic
function createMarker(loc) {
    const lat = loc.Latitude;
    const lng = loc.Longitude;
    const hmpi = loc.HMPI;
    const statusObj = getStatusObject(hmpi);

    let marker;
    
    // Applying the user's specific "AlertTriangle" pulsing marker for critical zones (>200)
    if (hmpi >= 200) {
        const criticalIcon = L.divIcon({
            className: 'critical-marker-icon',
            html: `
                <div class="critical-marker-pulse"></div>
                <div class="critical-marker-core"></div>
                <!-- Inline glowing SVG alert triangle matching lucide-react -->
                <svg class="lucide-triangle" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                    <path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
        marker = L.marker([lat, lng], {icon: criticalIcon});
    } else {
        marker = L.circleMarker([lat, lng], {
            radius: 8,
            fillColor: statusObj.color,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.9
        });
    }

    const popupContent = `
        <div class="popup-title">HMPI Profile: ${hmpi.toFixed(1)}</div>
        <div class="popup-stat" style="color:${statusObj.color}; font-size: 1.1rem; filter: brightness(1.2);"><strong>${statusObj.text}</strong></div>
        <div class="popup-stat" style="margin-top: 5px;"><strong>Coords:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
        ${loc.Date ? `<div class="popup-stat"><strong>Timestamp:</strong> ${loc.Date}</div>` : ''}
    `;
    
    marker.bindPopup(popupContent, { className: 'custom-popup' });
    
    marker.on('click', () => {
        selectedLocationId = loc.Sample_ID || loc.Latitude.toString();
        updateDashboardUI(loc);
        renderLocationCards();
    });
    
    return marker;
}

// Data Fetching logic
async function loadHistoricalData() {
    loadingOverlay.classList.remove('hidden');
    markersLayer.clearLayers();
    try {
        const response = await fetch(`${API_BASE}/data`);
        let data = await response.json();
        
        currentLocations = data;
        selectedLocationId = null;
        
        data.forEach(point => markersLayer.addLayer(createMarker(point)));
        renderLocationCards();
        updateDashboardUI(data);

        const bounds = L.latLngBounds(data.map(p => [p.Latitude, p.Longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
    } catch (err) {
        console.error("Error connecting to API:", err);
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

        data.Sample_ID = 'LIVE_' + Math.floor(Math.random() * 10000);
        currentLocations = [data]; 
        selectedLocationId = data.Sample_ID;

        markersLayer.addLayer(createMarker(data));
        renderLocationCards();
        updateDashboardUI(data);
        
        map.flyTo([data.Latitude, data.Longitude], 8, { duration: 1.5 });
    } catch (err) {
        console.error("Error fetching live data:", err);
    } finally {
        loadingOverlay.classList.add('hidden');
    }
}

refreshBtn.addEventListener('click', fetchLiveData);
loadHistBtn.addEventListener('click', loadHistoricalData);
window.addEventListener('load', loadHistoricalData);
