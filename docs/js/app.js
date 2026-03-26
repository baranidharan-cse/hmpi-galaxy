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
    map = L.map('map', { zoomControl: false }).setView([22.9734, 78.6569], 5);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CartoDB'
    }).addTo(map);
}

// --- Chart Logic ---
function initCharts(xaiData = [44, 55, 41, 64, 22], trendData = [31, 40, 28, 51, 42, 109, 100, 121, 142, 148, 153, 160]) {
    // SHAP Diagnostics
    const xaiOptions = {
        series: [{ name: 'Feature Impact', data: xaiData }],
        chart: { type: 'bar', height: 250, toolbar: { show: false }, background: 'transparent' },
        plotOptions: { bar: { borderRadius: 8, horizontal: true, colors: { ranges: [{ from: 0, to: 100, color: '#10b981' }] } } },
        dataLabels: { enabled: false },
        grid: { borderColor: 'rgba(255,255,255,0.05)', strokeDashArray: 4 },
        xaxis: { categories: ['Pb', 'As', 'Cd', 'Cr', 'Hg'], labels: { style: { colors: '#94a3b8' } } },
        yaxis: { labels: { style: { colors: '#94a3b8', fontSize: '10px' } } },
        theme: { mode: 'dark' }
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
        const res = await fetch(`${API_BASE}/telemetry`);
        const data = await res.json();
        updateTable(data.nodes);
        updateMap(data.nodes);
        updateKPI(data.nodes);
    } catch (err) {
        console.warn("Using fallback mock data for telemetry. Backend unreachable.");
    }
}

function updateKPI(nodes) {
    if (!nodes || nodes.length === 0) return;
    
    let totalHMPI = 0;
    let criticalCount = 0;
    
    nodes.forEach(n => {
        totalHMPI += n.hmpi;
        if (n.hmpi > 300) criticalCount++;
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
            <td class="py-4 px-2 text-brand-emerald">${node.id}</td>
            <td class="py-4 px-2 text-white/60">${node.lat.toFixed(2)}, ${node.lng.toFixed(2)}</td>
            <td class="py-4 px-2 text-right font-bold ${node.hmpi > 300 ? 'text-brand-rose' : (node.hmpi > 100 ? 'text-brand-amber' : 'text-brand-emerald')}">${node.hmpi}</td>
            <td class="py-4 px-2 text-center">
                <span class="bg-${node.hmpi > 300 ? 'brand-rose' : (node.hmpi > 100 ? 'brand-amber' : 'brand-emerald')}/10 text-${node.hmpi > 300 ? 'brand-rose' : (node.hmpi > 100 ? 'brand-amber' : 'brand-emerald')} px-2 py-1 rounded-lg text-[10px] ${node.hmpi > 300 ? 'animate-pulse' : ''}">
                    ${node.hmpi > 300 ? 'Critical' : (node.hmpi > 100 ? 'Moderate' : 'Optimal')}
                </span>
            </td>
        </tr>
    `).join('');
}

function updateMap(nodes) {
    if(!map) return;
    
    // Clear existing markers mapping if needed in real app, but for now we overlay
    nodes.forEach(node => {
        const color = node.hmpi > 300 ? '#f43f5e' : (node.hmpi > 100 ? '#f59e0b' : '#10b981');
        const glow = node.hmpi > 300 ? 'rgba(244,63,94,0.5)' : (node.hmpi > 100 ? 'rgba(245,158,11,0.5)' : 'rgba(16,185,129,0.5)');
        
        const icon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background-color:${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${glow};"></div>`,
            iconSize: [12, 12]
        });
        
        L.marker([node.lat, node.lng], { icon }).addTo(map)
            .bindPopup(`<div class="p-2 font-sans"><b>${node.id}</b><br>HMPI: ${node.hmpi}</div>`);
    });
}
