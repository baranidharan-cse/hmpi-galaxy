/* app.js */
// 🚀 CLOUD DEPLOYMENT STEP: 
const API_BASE = 'https://hmpi-groundwater-monitoring-system-live.onrender.com/api';

const map = L.map('map', {zoomControl: false}).setView([22.0, 79.0], 5);
L.control.zoom({ position: 'topright' }).addTo(map);

L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap', subdomains: 'abcd', maxZoom: 20
}).addTo(map);

let markersLayer = L.layerGroup().addTo(map);
let currentLocations = [];
let selectedLocationId = null;

// DOM Elements - Master Dashboard
const aiPredValue = document.getElementById('ai-pred-value');
const currentHmpi = document.getElementById('current-hmpi');
const qualityBadge = document.getElementById('quality-badge');
const refreshBtn = document.getElementById('refresh-btn');
const loadHistBtn = document.getElementById('load-history-btn');
const loadingOverlay = document.getElementById('loading-overlay');
const locationCardsContainer = document.getElementById('location-cards');

// DOM Elements - LocationDetails Module
const locDetailsName = document.getElementById('loc-details-name');
const locAlertIcon = document.getElementById('loc-alert-icon');
const hmpiProgressContainer = document.getElementById('hmpi-progress-container');
const hmpiProgress = document.getElementById('hmpi-progress');
const locExtendedDetails = document.getElementById('loc-extended-details');
const detectedMetalsGrid = document.getElementById('detected-metals-grid');
const statusDesc = document.getElementById('status-desc');
const statusRec = document.getElementById('status-rec');

// ----------------------------------------------------------------------
// LOCATION DETAILS REACT LOGIC MAPPER
// ----------------------------------------------------------------------
function getStatusObject(hmpi) {
    if (hmpi < 50) return { 
        color: '#22c55e', text: 'Low Pollution', class: 'quality-low-pollution', bgClass: 'bg-green', textClass: 'text-green',
        desc: 'Groundwater quality is within acceptable limits.', rec: 'Continue regular monitoring.'
    };
    if (hmpi < 100) return { 
        color: '#eab308', text: 'Moderate Pollution', class: 'quality-moderate', bgClass: 'bg-yellow', textClass: 'text-yellow',
        desc: 'Groundwater shows moderate contamination levels.', rec: 'Increase monitoring frequency and consider remediation measures.'
    };
    if (hmpi < 200) return { 
        color: '#f97316', text: 'High Pollution', class: 'quality-high-pollution', bgClass: 'bg-orange', textClass: 'text-orange',
        desc: 'Groundwater is significantly contaminated.', rec: 'Immediate remediation required. Not suitable for consumption.'
    };
    return { 
        color: '#ef4444', text: 'Critical Pollution', class: 'quality-critical', bgClass: 'bg-red', textClass: 'text-red',
        desc: 'Groundwater is severely contaminated with heavy metals.', rec: 'Urgent intervention required. Site should be closed for use.'
    };
}

function updateDashboardUI(data) {
    if (!Array.isArray(data)) {
        locDetailsName.textContent = data.Sample_ID || `Location [${data.Latitude.toFixed(2)}, ${data.Longitude.toFixed(2)}]`;
        currentHmpi.textContent = data.HMPI.toFixed(1);
        
        const statusObj = getStatusObject(data.HMPI);
        qualityBadge.textContent = statusObj.text;
        qualityBadge.className = `quality-badge ${statusObj.class}`;
        
        if (data.HMPI >= 200) locAlertIcon.classList.remove('hidden');
        else locAlertIcon.classList.add('hidden');

        hmpiProgressContainer.classList.remove('hidden');
        locExtendedDetails.classList.remove('hidden');
        
        const percent = Math.min(100, (data.HMPI / 300) * 100);
        setTimeout(() => {
            hmpiProgress.style.width = `${percent}%`;
            hmpiProgress.style.backgroundColor = statusObj.color;
        }, 50);

        statusDesc.textContent = statusObj.desc;
        statusRec.textContent = statusObj.rec;

        detectedMetalsGrid.innerHTML = '';
        const allMetals = ['As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe', 'Ni', 'Cu', 'Zn'];
        let foundMetals = 0;
        allMetals.forEach(m => {
            if (data[m] && parseFloat(data[m]) > 0) {
                foundMetals++;
                detectedMetalsGrid.innerHTML += `<div class="metal-tag">${m} <span>${parseFloat(data[m]).toFixed(4)} mg/L</span></div>`;
            }
        });
        
        if (foundMetals === 0) {
           if (data.metals && data.metals.length > 0) {
               data.metals.forEach(m => {
                   let symbol = m.name.match(/\(([^)]+)\)/); 
                   symbol = symbol ? symbol[1] : m.name.substring(0,2);
                   detectedMetalsGrid.innerHTML += `<div class="metal-tag" title="${m.name}">${symbol} <span>${m.concentration}</span></div>`;
               });
           } else {
               detectedMetalsGrid.innerHTML = `<div class="metal-tag" style="grid-column: span 2; justify-content:center;">Simulated Set (7 Metrics)</div>`;
           }
        }
        
        if(data.Predicted_Future_HMPI) aiPredValue.textContent = data.Predicted_Future_HMPI.toFixed(1);
        else if (data.Sample_ID && data.Sample_ID.startsWith('MANUAL')) aiPredValue.textContent = "Calculated Input";
        else aiPredValue.textContent = "N/A";

    } else {
        locDetailsName.textContent = "Global Region View";
        locAlertIcon.classList.add('hidden');
        currentHmpi.textContent = "Multi";
        qualityBadge.textContent = "Analysis Mode";
        qualityBadge.className = "quality-badge quality-moderate";
        aiPredValue.textContent = "Awaiting";
        hmpiProgressContainer.classList.add('hidden');
        locExtendedDetails.classList.add('hidden');
    }
}

function selectLocation(loc) {
    selectedLocationId = loc.Sample_ID || loc.Latitude.toString();
    map.flyTo([loc.Latitude, loc.Longitude], 9, { duration: 1.5 });
    updateDashboardUI(loc);
    renderLocationCards();
}

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

function createMarker(loc) {
    const lat = loc.Latitude;
    const lng = loc.Longitude;
    const hmpi = loc.HMPI;
    const statusObj = getStatusObject(hmpi);

    let marker;
    if (hmpi >= 200) {
        const criticalIcon = L.divIcon({
            className: 'critical-marker-icon',
            html: `<div class="critical-marker-pulse"></div><div class="critical-marker-core"></div>
                <svg class="lucide-triangle" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                </svg>`,
            iconSize: [20, 20], iconAnchor: [10, 10]
        });
        marker = L.marker([lat, lng], {icon: criticalIcon});
    } else {
        marker = L.circleMarker([lat, lng], { radius: 8, fillColor: statusObj.color, color: '#fff', weight: 2, opacity: 1, fillOpacity: 0.9});
    }

    const popupContent = `
        <div class="popup-title">HMPI Profile: ${hmpi.toFixed(1)}</div>
        <div class="popup-stat" style="color:${statusObj.color}; font-size: 1.1rem; filter: brightness(1.2);"><strong>${statusObj.text}</strong></div>
        <div class="popup-stat" style="margin-top: 5px;"><strong>Coords:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
    `;
    marker.bindPopup(popupContent, { className: 'custom-popup' });
    marker.on('click', () => { selectLocation(loc); });
    return marker;
}

// -------------------------------------------------------------
// MANUAL HMPI CALCULATOR OVERLAY
// -------------------------------------------------------------
const COMMON_METALS = [
  { name: 'Lead (Pb)', standard: 0.01 }, { name: 'Arsenic (As)', standard: 0.01 },
  { name: 'Cadmium (Cd)', standard: 0.003 }, { name: 'Chromium (Cr)', standard: 0.05 },
  { name: 'Mercury (Hg)', standard: 0.001 }, { name: 'Nickel (Ni)', standard: 0.02 },
  { name: 'Copper (Cu)', standard: 2.0 }, { name: 'Zinc (Zn)', standard: 3.0 },
  { name: 'Uranium (U)', standard: 0.03 }
];
let calcMetals = [{ name: 'Lead (Pb)', concentration: 0, standard: 0.01 }];

const calcModal = document.getElementById('calculator-modal');
document.getElementById('open-calc-btn').onclick = () => { calcModal.classList.remove('hidden'); renderMetals(); };
document.getElementById('close-calc-btn').onclick = () => calcModal.classList.add('hidden');
const metalsContainer = document.getElementById('metals-container');

function renderMetals() {
    metalsContainer.innerHTML = '';
    calcMetals.forEach((metal, index) => {
        const row = document.createElement('div');
        row.className = 'flex gap-2 items-center';
        let options = '<option value="">Select Metal</option>';
        COMMON_METALS.forEach(m => options += `<option value="${m.name}" ${m.name === metal.name ? 'selected' : ''}>${m.name}</option>`);
        
        row.innerHTML = `<div class="flex-1"><select class="input-field w-full metal-name-select" data-index="${index}">${options}</select></div><div class="w-32"><input type="number" class="input-field w-full metal-conc-input" data-index="${index}" value="${metal.concentration}" placeholder="mg/L" step="0.001"></div><div class="w-32"><input type="number" class="input-field w-full metal-std-input" data-index="${index}" value="${metal.standard}" placeholder="Std" step="0.001"></div>`;
        if (calcMetals.length > 1) {
            const rmBtn = document.createElement('button');
            rmBtn.className = 'icon-btn'; rmBtn.innerHTML = '×';
            rmBtn.onclick = () => { calcMetals.splice(index, 1); renderMetals(); };
            row.appendChild(rmBtn);
        }
        metalsContainer.appendChild(row);
    });

    document.querySelectorAll('.metal-name-select').forEach(sel => sel.onchange = (e) => {
        const idx = e.target.dataset.index;
        const found = COMMON_METALS.find(m => m.name === e.target.value);
        if(found) { calcMetals[idx].name = found.name; calcMetals[idx].standard = found.standard; }
        renderMetals();
    });
    document.querySelectorAll('.metal-conc-input').forEach(inp => inp.onchange = (e) => calcMetals[e.target.dataset.index].concentration = parseFloat(e.target.value) || 0);
    document.querySelectorAll('.metal-std-input').forEach(inp => inp.onchange = (e) => calcMetals[e.target.dataset.index].standard = parseFloat(e.target.value) || 0);
}
document.getElementById('add-metal-btn').onclick = () => { calcMetals.push({ name: '', concentration: 0, standard: 0 }); renderMetals(); };
document.getElementById('run-calc-btn').onclick = () => {
    const locName = document.getElementById('calc-name').value;
    const lat = parseFloat(document.getElementById('calc-lat').value);
    const lng = parseFloat(document.getElementById('calc-lng').value);
    if (!locName || isNaN(lat) || isNaN(lng)) { alert('Please fill in complete location details'); return; }

    const validMetals = calcMetals.filter(m => m.name && m.concentration > 0 && m.standard > 0);
    if (validMetals.length === 0) return alert('Add at least one valid heavy metal concentration > 0');

    const subIndices = validMetals.map(m => (m.concentration / m.standard) * 100);
    const hmpi = subIndices.reduce((sum, si) => sum + si, 0) / validMetals.length;

    const newLoc = { Sample_ID: 'MANUAL: ' + locName, Latitude: lat, Longitude: lng, HMPI: hmpi, metals: validMetals };
    currentLocations.unshift(newLoc); selectedLocationId = newLoc.Sample_ID;
    
    markersLayer.addLayer(createMarker(newLoc));
    renderLocationCards(); updateDashboardUI(newLoc);
    map.flyTo([lat, lng], 10, { duration: 1.5 });
    calcModal.classList.add('hidden');
};

// ----------------------------------------------------------------------
// NEXT LEVEL INTEGRATION: ANALYTICAL STATISTICS DASHBOARD PORT
// ----------------------------------------------------------------------
let hmpiChartInstance = null;

function renderGlobalStatistics() {
    const locations = currentLocations;
    if (!locations || locations.length === 0) return;

    const low = locations.filter(l => l.HMPI < 50).length;
    const mod = locations.filter(l => l.HMPI >= 50 && l.HMPI < 100).length;
    const high = locations.filter(l => l.HMPI >= 100 && l.HMPI < 200).length;
    const crit = locations.filter(l => l.HMPI >= 200).length;

    document.getElementById('stat-low').textContent = low;
    document.getElementById('stat-mod').textContent = mod;
    document.getElementById('stat-high').textContent = high;
    document.getElementById('stat-crit').textContent = crit;

    const allMetals = ['As', 'Pb', 'Cd', 'Cr', 'Hg', 'U', 'Fe', 'Ni', 'Cu', 'Zn'];
    let metalCounts = {};
    allMetals.forEach(m => metalCounts[m] = 0);

    locations.forEach(loc => {
        allMetals.forEach(m => {
            if (loc[m] && parseFloat(loc[m]) > 0) metalCounts[m]++;
        });
        if (loc.metals && loc.metals.length > 0) {
            loc.metals.forEach(m => {
                let sym = m.name.match(/\(([^)]+)\)/);
                sym = sym ? sym[1] : m.name.substring(0,2);
                if(metalCounts[sym] !== undefined) metalCounts[sym]++; else metalCounts[sym] = 1;
            });
        }
    });

    const topMetals = Object.entries(metalCounts)
         .filter(entry => entry[1] > 0)
         .sort((a,b) => b[1] - a[1]).slice(0, 5);

    const topMetalsDiv = document.getElementById('top-metals-list');
    topMetalsDiv.innerHTML = '';
    topMetals.forEach(([metal, count]) => {
        const pct = (count / locations.length) * 100;
        topMetalsDiv.innerHTML += `
            <div>
                <div class="flex justify-between mb-1"><span class="font-bold text-main" style="font-size:0.9rem;">${metal}</span><span class="text-xs text-muted">${count} Site(s)</span></div>
                <div class="progress-bar-bg" style="height:6px; background:rgba(255,255,255,0.05);">
                    <div class="progress-bar-fill bg-blue" style="width:${pct}%; background:#3b82f6;"></div>
                </div>
            </div>`;
    });

    // Chart.js React Replacement
    const ctx = document.getElementById('hmpiChart').getContext('2d');
    const chartRenderLocs = locations.slice(0, 25); // Limit bars to top 25 so it doesnt crowd
    
    const labels = chartRenderLocs.map(l => l.Sample_ID || `Loc ${parseFloat(l.Latitude).toFixed(1)}`);
    const dataVals = chartRenderLocs.map(l => l.HMPI);
    const bgColors = chartRenderLocs.map(l => getStatusObject(l.HMPI).color);

    if (hmpiChartInstance) hmpiChartInstance.destroy();

    hmpiChartInstance = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ label: 'HMPI Score', data: dataVals, backgroundColor: bgColors, borderRadius: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display:false }, ticks: { color: '#94a3b8', maxRotation: 45, minRotation: 45 } }
            }
        }
    });
}

const statsModal = document.getElementById('stats-modal');
document.getElementById('open-stats-btn').onclick = () => { statsModal.classList.remove('hidden'); renderGlobalStatistics(); };
document.getElementById('close-stats-btn').onclick = () => statsModal.classList.add('hidden');

// -------------------------------------------------------------
// DATA FETCHING MAPPER
// -------------------------------------------------------------
async function loadHistoricalData() {
    loadingOverlay.classList.remove('hidden');
    markersLayer.clearLayers();
    try {
        const response = await fetch(`${API_BASE}/data`);
        let data = await response.json();
        
        currentLocations = data; selectedLocationId = null;
        data.forEach(point => markersLayer.addLayer(createMarker(point)));
        renderLocationCards();
        updateDashboardUI(data);
        map.fitBounds(L.latLngBounds(data.map(p => [p.Latitude, p.Longitude])), { padding: [50, 50] });
    } catch (err) { console.error(err); } 
    finally { loadingOverlay.classList.add('hidden'); }
}

async function fetchLiveData() {
    loadingOverlay.classList.remove('hidden');
    markersLayer.clearLayers();
    try {
        const response = await fetch(`${API_BASE}/live`);
        let data = await response.json();

        data.Sample_ID = 'LIVE_' + Math.floor(Math.random() * 10000);
        currentLocations = [data]; selectedLocationId = data.Sample_ID;

        markersLayer.addLayer(createMarker(data));
        renderLocationCards();
        updateDashboardUI(data);
        map.flyTo([data.Latitude, data.Longitude], 8, { duration: 1.5 });
    } catch (err) { console.error(err); } 
    finally { loadingOverlay.classList.add('hidden'); }
}

refreshBtn.addEventListener('click', fetchLiveData);
loadHistBtn.addEventListener('click', loadHistoricalData);
window.addEventListener('load', loadHistoricalData);
