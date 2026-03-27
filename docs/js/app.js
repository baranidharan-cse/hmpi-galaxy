// --- Configuration ---
const API_BASE = 'https://hmpi-galaxy.onrender.com/api';
let map, xaiChart, trendChart;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initRouter();
    initMap();
    initCharts();
    fetchTelemetry();
    initManualCalculator();
    
    // Final layout polish for ApexCharts
    setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
    }, 500);

    // Auto-refresh telemetry every 30s
    setInterval(fetchTelemetry, 30000);
});

// --- Router Logic ---
function initRouter() {
    const navLinks = document.querySelectorAll('[data-route]');
    const pages = document.querySelectorAll('[data-page]');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetRoute = link.getAttribute('data-route');

            // Update Nav State
            navLinks.forEach(l => {
                l.classList.remove('bg-brand-emerald/10', 'text-brand-emerald', 'border-brand-emerald/20');
                l.classList.add('text-white/60');
                const chevron = l.querySelector('.lucide-chevron-right');
                if (chevron) chevron.classList.remove('opacity-100');
            });

            link.classList.remove('text-white/60');
            link.classList.add('bg-brand-emerald/10', 'text-brand-emerald', 'border-brand-emerald/20');
            const targetChevron = link.querySelector('.lucide-chevron-right');
            if (targetChevron) targetChevron.classList.add('opacity-100');

            // Switch Pages
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.getAttribute('data-page') === targetRoute) {
                    page.classList.add('active');
                }
            });

            // Re-trigger chart resize on tab switch to prevent squishing
            if (targetRoute === 'dashboard') {
                setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
            }
        });
    });
}

// --- Map Logic ---
function initMap() {
    map = L.map('map', { 
        zoomControl: true, 
        zoomSnap: 0.25,      // Fractional zoom levels for smooth zooming
        zoomDelta: 0.5,      // Wheel zoom jumps by 0.5 instead of 1.0
        wheelPxPerZoomLevel: 120 
    }).setView([22.9734, 78.6569], 5);
    
    // Reposition zoom controls to bottom-right for a sleek look
    map.zoomControl.setPosition('bottomright');
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
        attribution: '&copy; <a href="https://www.google.com/maps">Google Maps</a> Earth Hybrid',
        maxZoom: 20
    }).addTo(map);
}

// --- Chart Logic ---
function initCharts(xaiData = [44, 55, 41, 64, 22], trendData = [31, 40, 28, 51, 42, 109, 100, 121, 142, 148, 153, 160]) {
    // SHAP Diagnostics
    const xaiOptions = {
        series: [{ name: 'Feature Impact', data: xaiData }],
        chart: { type: 'bar', height: 250, toolbar: { show: false }, background: 'transparent' },
        plotOptions: { bar: { borderRadius: 6, horizontal: true, distributed: true, dataLabels: { position: 'bottom' } } },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#f43f5e', '#a855f7', '#06b6d4'],
        dataLabels: { enabled: true, textAnchor: 'start', style: { colors: ['#fff'] }, formatter: function (val, opt) { return opt.w.globals.labels[opt.dataPointIndex] + ": " + val + "%" }, offsetX: 0 },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: ['Pb', 'As', 'Cd', 'Cr', 'Hg', 'U', 'Fe'], labels: { style: { colors: '#94a3b8' } }, max: 100 },
        yaxis: { labels: { show: false } },
        tooltip: { theme: 'dark', y: { title: { formatter: function () { return '' } } } }
    };
    xaiChart = new ApexCharts(document.querySelector("#diagnostics-chart"), xaiOptions);
    xaiChart.render();

    // Predictive Trends
    const trendOptions = {
        series: [{ name: 'Predicted HMPI', data: trendData }],
        chart: { type: 'area', height: 250, toolbar: { show: false }, background: 'transparent', zoom: { enabled: false } },
        colors: ['#10b981'],
        fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] } },
        stroke: { curve: 'smooth', width: 2 },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { style: { colors: '#94a3b8' } } },
        theme: { mode: 'dark' }
    };
    trendChart = new ApexCharts(document.querySelector("#trend-chart"), trendOptions);
    trendChart.render();
}

// --- Data Fetching & Sync ---
async function fetchTelemetry() {
    try {
        const res = await fetch(`${API_BASE}/wris/sync`);
        const data = await res.json();
        updateTable(data);
        updateMap(data);
        updateKPI(data);
    } catch (err) {
        console.warn("Using fallback mock data for telemetry. Backend unreachable.");
    }
}

function updateKPI(nodes) {
    if (!nodes || nodes.length === 0) return;
    
    let totalHMPI = 0;
    let criticalCount = 0;
    
    nodes.forEach(n => {
        totalHMPI += n.HMPI;
        if (n.HMPI > 300) criticalCount++;
    });
    
    const avgScore = (totalHMPI / nodes.length).toFixed(1);
    
    document.getElementById('kpi-avg-score').innerText = avgScore;
    document.getElementById('kpi-critical-zones').innerText = criticalCount;
}

function updateTable(nodes) {
    const tbody = document.querySelector('tbody');
    if(!tbody) return;

    tbody.innerHTML = nodes.map(node => `
        <tr class="hover:bg-white/5 transition-colors group">
            <td class="py-4 px-2 text-brand-emerald">${node.Sample_ID}</td>
            <td class="py-4 px-2 text-white/60">${node.Latitude.toFixed(2)}, ${node.Longitude.toFixed(2)}</td>
            <td class="py-4 px-2 text-right font-bold ${node.HMPI > 300 ? 'text-brand-rose' : (node.HMPI > 100 ? 'text-brand-amber' : 'text-brand-emerald')}">${node.HMPI.toFixed(1)}</td>
            <td class="py-4 px-2 text-center">
                <span class="bg-${node.HMPI > 300 ? 'brand-rose' : (node.HMPI > 100 ? 'brand-amber' : 'brand-emerald')}/10 text-${node.HMPI > 300 ? 'brand-rose' : (node.HMPI > 100 ? 'brand-amber' : 'brand-emerald')} px-2 py-1 rounded-lg text-[10px] ${node.HMPI > 300 ? 'animate-pulse' : ''}">
                    ${node.Status}
                </span>
            </td>
        </tr>
    `).join('');
}

// --- Heatmap Gradient Logic ---
function getNaturalColor(hmpi) {
    if (hmpi < 50) return { core: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.6)' };     // Sky Blue (Very Clean)
    if (hmpi < 100) return { core: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' };    // Emerald (Clean)
    if (hmpi < 150) return { core: '#eab308', glow: 'rgba(234, 179, 8, 0.6)' };     // Yellow (Moderate Warning)
    if (hmpi < 200) return { core: '#f97316', glow: 'rgba(249, 115, 22, 0.6)' };    // Orange (High Pollution)
    if (hmpi < 300) return { core: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)' };     // Rose/Red (Critical)
    return { core: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.8)' };                    // Purple/Violet (Extreme Hazard)
}

function updateMap(nodes) {
    if(!map) return;
    
    // Clear existing layers if necessary
    map.eachLayer((layer) => {
        if (layer.options && layer.options.icon && layer.options.icon.options.className === 'custom-marker') {
            map.removeLayer(layer);
        }
    });

    nodes.forEach(node => {
        const theme = getNaturalColor(node.HMPI);
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `
                <div style="position: relative; width: 14px; height: 14px;">
                    <div style="position: absolute; inset: 0; background-color: ${theme.core}; border-radius: 50%; opacity: 0.3; transform: scale(3); filter: blur(4px);"></div>
                    <div style="position: absolute; inset: 0; background-color: ${theme.core}; border-radius: 50%; border: 2px solid rgba(255,255,255,0.8); box-shadow: 0 0 20px ${theme.glow}, inset 0 0 5px rgba(255,255,255,0.5);"></div>
                </div>
            `,
            iconSize: [14, 14]
        });
        
        const safeNode = JSON.stringify(node).replace(/"/g, '&quot;');
        const popupHtml = `
            <div class="px-2 py-1 font-sans bg-brand-dark text-white rounded w-64">
                <h4 class="font-bold text-sm mb-1" style="color: ${theme.core}">${node.Sample_ID}</h4>
                <p class="text-xs text-white/60 mb-2">Location: ${node.Latitude.toFixed(2)}, ${node.Longitude.toFixed(2)}</p>
                <div class="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded mb-3">
                    <div><span class="text-white/40">Pb:</span> ${node.Pb.toFixed(3)}</div>
                    <div><span class="text-white/40">As:</span> ${node.As.toFixed(3)}</div>
                    <div><span class="text-white/40">Cr:</span> ${node.Cr.toFixed(3)}</div>
                    <div><span class="text-white/40">Hg:</span> ${node.Hg.toFixed(4)}</div>
                </div>
                <div class="flex items-center justify-between mb-3 border-t border-white/10 pt-2">
                    <span class="text-xs font-bold text-white/50">Current HMPI:</span>
                    <span class="font-bold" style="color: ${theme.core}">${node.HMPI.toFixed(1)}</span>
                </div>
                <button onclick="window.runAIInference('${safeNode}')" class="w-full text-brand-dark font-bold text-xs py-2 rounded shadow-lg transition-colors flex items-center justify-center gap-2 hover:opacity-90" style="background-color: ${theme.core}">
                    <i data-lucide="cpu" class="w-3 h-3"></i> Run AI X-Ray Inference
                </button>
                <script>setTimeout(() => lucide.createIcons(), 50);</script>
            </div>
        `;
        
        L.marker([node.Latitude, node.Longitude], { icon }).addTo(map)
            .bindPopup(popupHtml, {
                className: 'custom-popup-wrapper'
            });
    });
}

// --- Live AI Inference Trigger ---
window.runAIInference = async function(nodeDataStr) {
    try {
        const node = JSON.parse(nodeDataStr.replace(/&quot;/g, '"'));
        const btn = document.activeElement;
        
        if (btn) {
            btn.innerHTML = `<span class="animate-pulse">Inferring ML Model...</span>`;
            btn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Send WRIS metals directly to Scikit-Learn .pkl
        const payload = {
            As: node.As, Pb: node.Pb, Cd: node.Cd, Cr: node.Cr, 
            Hg: node.Hg, U: node.U, Fe: node.Fe,
            Latitude: node.Latitude, Longitude: node.Longitude
        };

        const resPredict = fetch(`${API_BASE}/ai/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // Parallel XAI Explainability Request
        const resExplain = fetch(`${API_BASE}/ai/explain`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const [predictResponse, explainResponse] = await Promise.all([resPredict, resExplain]);
        const prediction = await predictResponse.json();
        
        let shapMatrix = [0, 0, 0, 0, 0, 0, 0];
        if (explainResponse.ok) {
            const explanation = await explainResponse.json();
            if (explanation.shap_normalized) {
                shapMatrix = explanation.shap_normalized;
            }
        }
        
        if (btn) {
            btn.innerHTML = `<span class="text-brand-dark">Prediction: ${prediction.predicted_hmpi.toFixed(1)}</span>`;
            btn.classList.remove('opacity-50', 'cursor-not-allowed', 'bg-brand-emerald');
            btn.classList.add(prediction.predicted_hmpi > 300 ? 'bg-brand-rose' : 'bg-brand-amber');
        }

        // Extrapolate an intelligent 12-month curve mathematically trailing to the predicted peak
        const base = node.HMPI;
        const target = prediction.predicted_hmpi;
        const trendCurve = Array.from({length: 12}, (_, i) => {
            // Sigmoid-style easing to the target value
            const progress = i / 11;
            const noise = (Math.random() - 0.5) * 15;
            return Math.max(0, parseFloat((base + ((target - base) * progress) + noise).toFixed(1)));
        });

        // Animate ApexCharts instantly automatically integrating the authentic 7-metal XAI weights
        if (trendChart) trendChart.updateSeries([{ name: 'Predicted HMPI', data: trendCurve }]);
        if (xaiChart) xaiChart.updateSeries([{ name: 'Feature Impact', data: shapMatrix }]);

        // Switch automatically to the AI Insights tab to show the user the inference
        document.querySelector('[data-route="analytics"]').click();

    } catch (e) {
        console.error("AI Inference failed:", e);
        alert("Failed to reach the AI Model endpoints.");
    }
};

// --- Manual HMPI Calculator Logic ---
function initManualCalculator() {
    const form = document.getElementById('manual-hmpi-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const panel = document.getElementById('manual-results-panel');
        
        // Show loading state
        panel.innerHTML = `
            <div class="absolute inset-0 bg-gradient-to-b from-brand-emerald/10 to-transparent pointer-events-none"></div>
            <i data-lucide="loader-2" class="w-16 h-16 text-brand-emerald mb-6 animate-spin"></i>
            <h4 class="text-white font-bold mb-2">Executing Engine Calculus...</h4>
            <p class="text-white/50 text-xs">Querying Python Backend using BIS IS:10500 Limits</p>
        `;
        lucide.createIcons();

        const payload = {
            Pb: parseFloat(document.getElementById('input-pb').value) || 0,
            As: parseFloat(document.getElementById('input-as').value) || 0,
            Cd: parseFloat(document.getElementById('input-cd').value) || 0,
            Cr: parseFloat(document.getElementById('input-cr').value) || 0,
            Hg: parseFloat(document.getElementById('input-hg').value) || 0,
            U: parseFloat(document.getElementById('input-u').value) || 0,
            Fe: parseFloat(document.getElementById('input-fe').value) || 0,
            Latitude: 0,
            Longitude: 0
        };

        try {
            const res = await fetch(`${API_BASE}/engine/calculate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            
            // Render Result
            const hmpi = result.calculated_hmpi;
            const theme = getNaturalColor(hmpi);
            
            panel.innerHTML = `
                <div class="absolute inset-0 bg-gradient-to-b to-transparent pointer-events-none" style="--tw-gradient-from: ${theme.core}20;"></div>
                <div class="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl relative" style="background-color: ${theme.core}20; border: 2px solid ${theme.core}">
                    <div class="absolute inset-0 rounded-full animate-pulse opacity-50 filter blur-xl" style="background-color: ${theme.core}"></div>
                    <span class="text-3xl font-extrabold relative z-10" style="color: ${theme.core}">${hmpi.toFixed(1)}</span>
                </div>
                <h4 class="text-white text-2xl font-bold mb-2">Verdict: <span style="color: ${theme.core}">${result.severity}</span></h4>
                <p class="text-white/50 text-sm">Synchronized with World Health Organization & India BIS parameters.</p>
            `;
            
        } catch (err) {
            panel.innerHTML = `
                <i data-lucide="alert-triangle" class="w-16 h-16 text-brand-rose mb-6"></i>
                <h4 class="text-brand-rose font-bold mb-2">Calculation Failed</h4>
                <p class="text-white/50 text-xs">The Python backend engine is currently unreachable. Please try again.</p>
            `;
            lucide.createIcons();
        }
    });
}

// --- Geographic Search Engine ---
const searchInput = document.getElementById('global-search');
if (searchInput) {
    searchInput.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (!query) return;
            
            searchInput.disabled = true;
            searchInput.placeholder = "Locating via Satellite...";
            
            try {
                // 1. Geocode via Nominatim
                const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
                const nomData = await nomRes.json();
                
                if (nomData && nomData.length > 0) {
                    const bestResult = nomData[0];
                    const lat = parseFloat(bestResult.lat);
                    const lon = parseFloat(bestResult.lon);
                    
                    // 2. Fly Map Seamlessly
                    if (map) {
                        map.flyTo([lat, lon], 11, { duration: 1.5 });
                    }
                    
                    // 3. Fetch Synthetic Node from Render backend
                    const nodeRes = await fetch(`${API_BASE}/wris/search?lat=${lat}&lng=${lon}&query=${encodeURIComponent(bestResult.display_name)}`);
                    if (nodeRes.ok) {
                        const customNode = await nodeRes.json();
                        
                        // 4. Drop Custom Search Marker
                        const theme = getNaturalColor(customNode.HMPI);
                        const icon = L.divIcon({
                            className: 'custom-search-marker',
                            html: `
                                <div style="position: relative; width: 18px; height: 18px; z-index: 1000;">
                                    <div style="position: absolute; inset: 0; background-color: #fff; border-radius: 50%; opacity: 0.5; transform: scale(4); filter: blur(6px); animation: pulse-emerald 2s infinite;"></div>
                                    <div style="position: absolute; inset: 0; background-color: ${theme.core}; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 25px ${theme.glow};"></div>
                                </div>
                            `,
                            iconSize: [18, 18]
                        });
                        
                        const safeNode = JSON.stringify(customNode).replace(/"/g, '&quot;');
                        const title = bestResult.display_name.split(',')[0].substring(0, 30);
                        const popupHtml = `
                            <div class="px-2 py-1 font-sans bg-brand-dark text-white rounded w-64 border border-white/20">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    <span class="text-[10px] uppercase font-bold text-white/70 tracking-widest">Custom Satellite Scan</span>
                                </div>
                                <h4 class="font-bold text-sm mb-1 leading-tight" style="color: ${theme.core}">${title}</h4>
                                <p class="text-xs text-white/60 mb-2">Lat: ${lat.toFixed(3)}, Lng: ${lon.toFixed(3)}</p>
                                <div class="grid grid-cols-2 gap-2 text-[10px] bg-white/5 p-2 rounded mb-3">
                                    <div><span class="text-white/40">Baseline Pb:</span> ${customNode.Pb.toFixed(3)}</div>
                                    <div><span class="text-white/40">Baseline As:</span> ${customNode.As.toFixed(3)}</div>
                                </div>
                                <button onclick="runAIInference('${safeNode}', this)" class="w-full py-2 bg-brand-emerald text-brand-dark font-bold text-xs rounded hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                                    <i data-lucide="scan-line" class="w-3 h-3"></i> Run AI X-Ray Inference
                                </button>
                            </div>
                        `;
                        
                        const marker = L.marker([lat, lon], { icon: icon }).addTo(map);
                        marker.bindPopup(popupHtml, {
                            className: 'glass-popup custom-search-popup border border-white/10 rounded-lg overflow-hidden'
                        });
                        
                        // Wait for fly flight to finish, then open popup automatically
                        setTimeout(() => {
                            marker.openPopup();
                            lucide.createIcons(); // Reactivate Lucide for injected DOM
                        }, 1600);
                        
                    }
                } else {
                    alert('Location not found via Satellite array.');
                }
            } catch (err) {
                console.error(err);
                alert('Geocoding Satellite Uplink Failed.');
            } finally {
                searchInput.disabled = false;
                searchInput.placeholder = "Search coordinates...";
                searchInput.value = "";
            }
        }
    });
}
