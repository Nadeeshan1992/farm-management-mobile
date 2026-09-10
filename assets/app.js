// assets/app.js - Farm Management Mobile App Interactive Logic with Vercel Cloud Fallback Engine

const API_BASE = 'api';
let isServerMode = true;
let currentTab = 'dashboard';
let cowsCache = [];
let milkChartInstance = null;
let activeCowDetailId = null;

// Initial Mock Seed Data for Vercel / Cloud Demo Mode
const DEFAULT_SEED_DATA = {
    cows: [
        { id: 1, tag_number: 'COW-101', name: 'Daisy', breed: 'Holstein Friesian', date_of_birth: '2021-03-15', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_1.jpg' },
        { id: 2, tag_number: 'COW-102', name: 'Bella', breed: 'Jersey', date_of_birth: '2022-05-10', source: 'born on farm', parity: 1, reproductive_status: 'In heat', photo_url: 'assets/cow_2.jpg' },
        { id: 3, tag_number: 'COW-103', name: 'Luna', breed: 'Holstein Friesian', date_of_birth: '2020-01-20', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_3.jpg' },
        { id: 4, tag_number: 'COW-104', name: 'Molly', breed: 'Brown Swiss', date_of_birth: '2021-08-12', source: 'born on farm', parity: 2, reproductive_status: 'Fresh', photo_url: 'assets/cow_4.jpg' },
        { id: 5, tag_number: 'COW-105', name: 'Rosie', breed: 'Holstein Friesian', date_of_birth: '2020-11-05', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_5.jpg' },
        { id: 6, tag_number: 'COW-106', name: 'Penny', breed: 'Jersey', date_of_birth: '2022-02-14', source: 'born on farm', parity: 1, reproductive_status: 'Fresh', photo_url: 'assets/cow_6.jpg' },
        { id: 7, tag_number: 'COW-107', name: 'Maggie', breed: 'Ayrshire', date_of_birth: '2021-06-22', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_7.jpg' },
        { id: 8, tag_number: 'COW-108', name: 'Ruby', breed: 'Holstein Friesian', date_of_birth: '2022-09-01', source: 'born on farm', parity: 1, reproductive_status: 'In heat', photo_url: 'assets/cow_8.jpg' },
        { id: 9, tag_number: 'COW-109', name: 'Chloe', breed: 'Guernsey', date_of_birth: '2019-12-10', source: 'purchased', parity: 4, reproductive_status: 'Dry', photo_url: 'assets/cow_9.jpg' },
        { id: 10, tag_number: 'COW-110', name: 'Stella', breed: 'Holstein Friesian', date_of_birth: '2021-04-18', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_10.jpg' },
        { id: 11, tag_number: 'COW-111', name: 'Lucy', breed: 'Jersey', date_of_birth: '2020-07-29', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_1.jpg' },
        { id: 12, tag_number: 'COW-112', name: 'Emma', breed: 'Brown Swiss', date_of_birth: '2022-10-05', source: 'born on farm', parity: 1, reproductive_status: 'Fresh', photo_url: 'assets/cow_2.jpg' },
        { id: 13, tag_number: 'COW-113', name: 'Sadie', breed: 'Holstein Friesian', date_of_birth: '2021-01-14', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_3.jpg' },
        { id: 14, tag_number: 'COW-114', name: 'Lily', breed: 'Jersey', date_of_birth: '2023-01-02', source: 'born on farm', parity: 0, reproductive_status: 'In heat', photo_url: 'assets/cow_4.jpg' },
        { id: 15, tag_number: 'COW-115', name: 'Sophie', breed: 'Holstein Friesian', date_of_birth: '2020-03-30', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_5.jpg' },
        { id: 16, tag_number: 'COW-116', name: 'Grace', breed: 'Ayrshire', date_of_birth: '2021-11-19', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_6.jpg' },
        { id: 17, tag_number: 'COW-117', name: 'Zoe', breed: 'Holstein Friesian', date_of_birth: '2022-04-25', source: 'born on farm', parity: 1, reproductive_status: 'Pregnant', photo_url: 'assets/cow_7.jpg' },
        { id: 18, tag_number: 'COW-118', name: 'Nala', breed: 'Brown Swiss', date_of_birth: '2021-09-14', source: 'purchased', parity: 2, reproductive_status: 'Fresh', photo_url: 'assets/cow_8.jpg' },
        { id: 19, tag_number: 'COW-119', name: 'Coco', breed: 'Jersey', date_of_birth: '2020-08-11', source: 'born on farm', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_9.jpg' },
        { id: 20, tag_number: 'COW-120', name: 'Hazel', breed: 'Holstein Friesian', date_of_birth: '2019-05-02', source: 'purchased', parity: 4, reproductive_status: 'Dry', photo_url: 'assets/cow_10.jpg' },
        { id: 21, tag_number: 'COW-121', name: 'Willow', breed: 'Guernsey', date_of_birth: '2022-07-08', source: 'born on farm', parity: 1, reproductive_status: 'Pregnant', photo_url: 'assets/cow_1.jpg' },
        { id: 22, tag_number: 'COW-122', name: 'Piper', breed: 'Holstein Friesian', date_of_birth: '2021-12-03', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_2.jpg' },
        { id: 23, tag_number: 'COW-123', name: 'Roxy', breed: 'Jersey', date_of_birth: '2023-03-12', source: 'born on farm', parity: 0, reproductive_status: 'Open', photo_url: 'assets/cow_3.jpg' },
        { id: 24, tag_number: 'COW-124', name: 'Ginger', breed: 'Ayrshire', date_of_birth: '2022-11-20', source: 'purchased', parity: 1, reproductive_status: 'Fresh', photo_url: 'assets/cow_4.jpg' },
        { id: 25, tag_number: 'COW-125', name: 'Honey', breed: 'Holstein Friesian', date_of_birth: '2023-02-18', source: 'born on farm', parity: 0, reproductive_status: 'Open', photo_url: 'assets/cow_5.jpg' }
    ],
    heats: [
        { id: 1, cow_id: 2, detection_date: '2026-09-10', detection_time: '06:30:00', status: 'Possible Heat', inter_estrus_interval: 21, notes: 'Mounting behavior observed, slight clear mucus discharge.' },
        { id: 2, cow_id: 14, detection_date: '2026-09-10', detection_time: '07:15:00', status: 'Possible Heat', inter_estrus_interval: 20, notes: 'Restless, vocalization, standing near gate.' },
        { id: 3, cow_id: 8, detection_date: '2026-09-10', detection_time: '05:45:00', status: 'AI Reminder', inter_estrus_interval: 21, notes: 'Standing heat confirmed. Optimal AI window: 12-18 hours.' }
    ],
    ai: [
        { id: 1, cow_id: 5, heat_date: '2025-12-10', ai_date: '2025-12-10', service_number: 1, ai_technician: 'Dr. Robert Miller', bull_semen_id: 'SEM-BULL-904', pregnancy_check_date: '2026-01-25', pregnancy_result: 'Positive', expected_calving_date: '2026-09-18', reproductive_problems: 'None' },
        { id: 2, cow_id: 3, heat_date: '2025-12-13', ai_date: '2025-12-13', service_number: 2, ai_technician: 'Dr. Sarah Jenkins', bull_semen_id: 'SEM-BULL-881', pregnancy_check_date: '2026-01-28', pregnancy_result: 'Positive', expected_calving_date: '2026-09-21', reproductive_problems: 'None' },
        { id: 3, cow_id: 10, heat_date: '2026-07-27', ai_date: '2026-07-27', service_number: 1, ai_technician: 'Dr. Robert Miller', bull_semen_id: 'SEM-BULL-904', pregnancy_check_date: '2026-09-10', pregnancy_result: 'Pending', expected_calving_date: '2027-05-06', reproductive_problems: 'Pending check' }
    ],
    calvings: [
        { id: 1, cow_id: 4, calving_date: '2026-08-16', calving_type: 'Normal', calf_tag_number: 'CALF-201', calf_sex: 'Heifer', birth_weight: 38.5, post_calving_problems: 'None' },
        { id: 2, cow_id: 6, calving_date: '2026-08-23', calving_type: 'Assisted', calf_tag_number: 'CALF-202', calf_sex: 'Bull', birth_weight: 42.0, post_calving_problems: 'Mild laceration, recovered' }
    ],
    milk: [
        { id: 1, cow_id: 5, record_date: '2026-09-10', morning_yield: 5.6, evening_yield: 4.6, total_yield: 10.2, yesterday_yield: 12.5, drop_percentage: 18.40 },
        { id: 2, cow_id: 5, record_date: '2026-09-09', morning_yield: 6.8, evening_yield: 5.7, total_yield: 12.5, yesterday_yield: 13.0, drop_percentage: 3.85 },
        { id: 3, cow_id: 1, record_date: '2026-09-10', morning_yield: 9.5, evening_yield: 8.5, total_yield: 18.0, yesterday_yield: 18.2, drop_percentage: 1.10 },
        { id: 4, cow_id: 4, record_date: '2026-09-10', morning_yield: 11.0, evening_yield: 9.8, total_yield: 20.8, yesterday_yield: 21.0, drop_percentage: 0.95 }
    ],
    health: [
        { id: 1, cow_id: 5, record_date: '2026-09-10', disease: 'Subclinical Mastitis', symptoms: 'Swelling in right rear quarter, clot in milk', treatment: 'Intramammary antibiotic infusion', medicine: 'Cefa-Lak & Flunixin', dosage: '1 tube / 10ml IV', start_date: '2026-09-10', veterinary_visit: 'Dr. Robert Miller (Today)', recovery_status: 'In Treatment', notes: 'Explains recent 18.4% drop in milk yield.' },
        { id: 2, cow_id: 11, record_date: '2026-09-08', disease: 'Hoof Rot (Lameness)', symptoms: 'Limping on right foreleg, foul odor', treatment: 'Hoof trim and systemic antibiotic', medicine: 'Oxytetracycline LA', dosage: '20ml IM', start_date: '2026-09-08', veterinary_visit: 'Dr. Sarah Jenkins', recovery_status: 'In Treatment', notes: 'Keep in dry recovery pen.' },
        { id: 3, cow_id: 18, record_date: '2026-09-09', disease: 'Bovine Ketosis', symptoms: 'Rapid weight loss, sweet acetone breath', treatment: 'Propylene glycol + IV Dextrose', medicine: 'Propylene Glycol & Dextrose 50%', dosage: '250g BID', start_date: '2026-09-09', veterinary_visit: 'Dr. Robert Miller', recovery_status: 'Active', notes: 'Monitor ketones daily.' }
    ],
    vaccinations: [
        { id: 1, cow_id: 5, vaccine_name: 'Foot and Mouth Disease (FMD)', date_given: '2026-03-14', next_vaccination_date: '2026-09-10', treatment_type: 'Routine Bi-Annual', status: 'Due' },
        { id: 2, cow_id: 11, vaccine_name: 'Anthrax Spore Vaccine', date_given: '2025-09-15', next_vaccination_date: '2026-09-12', treatment_type: 'Annual Booster', status: 'Due' }
    ],
    growth: [
        { id: 1, cow_id: 23, record_date: '2026-09-10', weight: 290.0, age_months: 18, weight_gain: 28.0, growth_rate: 0.93 },
        { id: 2, cow_id: 25, record_date: '2026-09-10', weight: 320.0, age_months: 19, weight_gain: 31.0, growth_rate: 1.03 }
    ],
    thi: [
        { id: 1, recorded_at: '2026-09-10 12:00:00', temperature: 30.5, humidity: 68.0, thi_value: 81.2, stress_level: 'Moderate Stress', notes: 'Fans on' }
    ]
};

// Local Storage Manager for Vercel / Offline Demo
function getLocalStore() {
    let store = localStorage.getItem('farm_management_db');
    if (!store) {
        localStorage.setItem('farm_management_db', JSON.stringify(DEFAULT_SEED_DATA));
        return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }
    return JSON.parse(store);
}

function saveLocalStore(store) {
    localStorage.setItem('farm_management_db', JSON.stringify(store));
}

// Calculate age string from birthdate
function calculateAge(dobStr) {
    if (!dobStr) return 'Unknown';
    const birth = new Date(dobStr);
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    if (months < 0) {
        years--;
        months += 12;
    }
    if (years > 0) return `${years} yr${years > 1 ? 's' : ''} ${months > 0 ? months + ' mo' : ''}`;
    return `${months} months`;
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    initTabs();
    initModals();
    initFab();
    initThiCalculator();

    // Check if running on local server or static Vercel
    await detectEnvironment();

    loadDashboard();
    loadCows();
    loadAlertsCount();
});

async function detectEnvironment() {
    try {
        const res = await fetch(`${API_BASE}/dashboard.php`);
        const text = await res.text();
        const data = JSON.parse(text);
        if (data && data.kpis) {
            isServerMode = true;
            updateStatusPill(true);
            return;
        }
    } catch (e) {
        // Fallback to local storage (Vercel static deploy)
    }
    isServerMode = false;
    updateStatusPill(false);
}

function updateStatusPill(isServer) {
    const pill = document.querySelector('.status-pill-bar');
    if (!pill) return;
    if (isServer) {
        pill.innerHTML = `
            <span><i class="fa-solid fa-circle text-emerald-500 mr-1 text-[10px]"></i> System Live &bull; Local MySQL API Connected</span>
            <span class="font-bold cursor-pointer" onclick="switchTab('alerts')">View Alerts &rarr;</span>
        `;
    } else {
        pill.innerHTML = `
            <span><i class="fa-solid fa-cloud text-blue-500 mr-1 text-[10px]"></i> Vercel Cloud Mode &bull; Persistent Storage</span>
            <span class="font-bold cursor-pointer" onclick="switchTab('alerts')">View Alerts &rarr;</span>
        `;
    }
}

// Fullscreen simulator toggle
function toggleFullscreen() {
    document.body.classList.toggle('fullscreen-mode');
    const icon = document.getElementById('screenModeIcon');
    if (document.body.classList.contains('fullscreen-mode')) {
        icon.className = 'fa-solid fa-mobile-screen-button';
    } else {
        icon.className = 'fa-solid fa-expand';
    }
}

// Toast Helper
function showToast(message, isError = false) {
    const toast = document.getElementById('toastMsg');
    toast.style.background = isError ? '#ef4444' : '#1e293b';
    toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'} mr-1"></i> ${message}`;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3500);
}

// Bottom Tab Navigation
function initTabs() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            switchTab(target);
        });
    });
}

function switchTab(tabName) {
    currentTab = tabName;
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.toggle('active', t.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.tab-view').forEach(view => {
        view.style.display = view.id === `view-${tabName}` ? 'block' : 'none';
    });

    if (tabName === 'dashboard') loadDashboard();
    if (tabName === 'herd') loadCows();
    if (tabName === 'milk') loadMilkLogs();
    if (tabName === 'breeding') loadBreedingData();
    if (tabName === 'health') loadHealthAndVax();
    if (tabName === 'alerts') loadAllAlerts();
}

// Load Alerts Count for Header Bell
async function loadAlertsCount() {
    try {
        let count = 0;
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/alerts.php`);
            const data = await res.json();
            count = data.total_alerts || 0;
        } else {
            const store = getLocalStore();
            count = 12; // Standard seeded alerts count
        }
        const badge = document.getElementById('bellBadge');
        if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    } catch (e) {
        console.warn('Could not load alerts count', e);
    }
}

// 1. Dashboard View
async function loadDashboard() {
    let data;
    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/dashboard.php`);
            data = await res.json();
        } else {
            const store = getLocalStore();
            data = {
                kpis: {
                    total_cows: store.cows.length,
                    possible_heat: 2,
                    ai_breeding_due: 1,
                    pregnant: store.cows.filter(c => c.reproductive_status === 'Pregnant').length,
                    expected_calving: 2,
                    milk_production: '145 L/day',
                    health_alerts: 3,
                    vaccination_due: 2
                },
                milk_trend: [
                    { record_date: '2026-09-04', daily_total: 142.0 },
                    { record_date: '2026-09-05', daily_total: 145.5 },
                    { record_date: '2026-09-06', daily_total: 140.0 },
                    { record_date: '2026-09-07', daily_total: 149.5 },
                    { record_date: '2026-09-08', daily_total: 137.0 },
                    { record_date: '2026-09-09', daily_total: 144.5 },
                    { record_date: '2026-09-10', daily_total: 145.0 }
                ],
                urgent_alerts: [
                    { severity: 'warning', title: 'Possible Heat: COW-102 (Bella)', message: 'Observed today at 06:30. Mounting behavior observed.' },
                    { severity: 'danger', title: 'AI Reminder: COW-108 (Ruby)', message: 'Standing heat confirmed. Optimal AI window active.' },
                    { severity: 'danger', title: 'Unusual Milk Decrease: COW-105 (Rosie)', message: 'Yield dropped by 18.4% (from 12.5L to 10.2L). Active mastitis.' },
                    { severity: 'warning', title: 'Expected Calving Approaching: COW-105 (Rosie)', message: 'Expected calving date: 2026-09-18. Move to maternity pen.' }
                ]
            };
        }

        document.getElementById('kpiTotalCows').innerText = data.kpis.total_cows;
        document.getElementById('kpiPossibleHeat').innerText = data.kpis.possible_heat;
        document.getElementById('kpiAiDue').innerText = data.kpis.ai_breeding_due;
        document.getElementById('kpiPregnant').innerText = data.kpis.pregnant;
        document.getElementById('kpiExpectedCalving').innerText = data.kpis.expected_calving;
        document.getElementById('kpiMilkProd').innerText = data.kpis.milk_production;
        document.getElementById('kpiHealthAlerts').innerText = data.kpis.health_alerts;
        document.getElementById('kpiVaccinationDue').innerText = data.kpis.vaccination_due;

        const alertList = document.getElementById('dashUrgentAlerts');
        if (data.urgent_alerts && data.urgent_alerts.length > 0) {
            alertList.innerHTML = data.urgent_alerts.slice(0, 4).map(a => `
                <div class="alert-banner ${a.severity}">
                    <div class="alert-banner-content">
                        <h4>${a.title}</h4>
                        <p>${a.message}</p>
                    </div>
                </div>
            `).join('');
        }

        renderMilkChart(data.milk_trend);
    } catch (err) {
        console.error('Error loading dashboard:', err);
    }
}

function renderMilkChart(trendData) {
    const ctx = document.getElementById('milkChartCanvas');
    if (!ctx) return;

    const labels = trendData.map(d => {
        const parts = d.record_date.split('-');
        return `${parts[1]}/${parts[2]}`;
    });
    const values = trendData.map(d => d.daily_total);

    if (milkChartInstance) {
        milkChartInstance.destroy();
    }

    milkChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Daily Milk (Liters)',
                data: values,
                borderColor: '#15803d',
                backgroundColor: 'rgba(34, 197, 94, 0.12)',
                borderWidth: 2.5,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#15803d',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => `Yield: ${ctx.parsed.y} Liters`
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { size: 10 } }
                },
                y: {
                    beginAtZero: false,
                    grid: { color: '#f1f5f9' },
                    ticks: { font: { size: 10 } }
                }
            }
        }
    });
}

// 2. Herd Management View
async function loadCows(statusFilter = '', searchTerm = '') {
    try {
        let cows = [];
        if (isServerMode) {
            const url = new URL(`${window.location.origin}${window.location.pathname.replace(/\/[^/]*$/, '')}/${API_BASE}/cows.php`);
            if (statusFilter && statusFilter !== 'All') url.searchParams.append('status', statusFilter);
            if (searchTerm) url.searchParams.append('search', searchTerm);
            const res = await fetch(url);
            const data = await res.json();
            cows = data.cows || [];
        } else {
            const store = getLocalStore();
            cows = store.cows.map(c => ({
                ...c,
                age_display: calculateAge(c.date_of_birth),
                latest_milk: c.id === 5 ? 10.2 : (c.parity > 0 ? 16.5 : null),
                latest_drop_pct: c.id === 5 ? 18.4 : null
            }));

            if (statusFilter && statusFilter !== 'All') {
                cows = cows.filter(c => c.reproductive_status === statusFilter);
            }
            if (searchTerm) {
                const s = searchTerm.toLowerCase();
                cows = cows.filter(c => c.tag_number.toLowerCase().includes(s) || c.name.toLowerCase().includes(s) || c.breed.toLowerCase().includes(s));
            }
        }

        cowsCache = cows;
        renderCowList(cowsCache);
        populateCowSelectors(cowsCache);
    } catch (err) {
        console.error('Error loading cows:', err);
    }
}

function renderCowList(cows) {
    const container = document.getElementById('cowListContainer');
    if (!container) return;

    if (cows.length === 0) {
        container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">No animals found matching criteria.</div>`;
        return;
    }

    container.innerHTML = cows.map(cow => {
        let badgeColor = 'badge-gray';
        if (cow.reproductive_status === 'In heat') badgeColor = 'badge-yellow';
        if (cow.reproductive_status === 'Pregnant') badgeColor = 'badge-green';
        if (cow.reproductive_status === 'Fresh') badgeColor = 'badge-blue';
        if (cow.reproductive_status === 'Dry') badgeColor = 'badge-orange';

        const dropBadge = (cow.latest_drop_pct && parseFloat(cow.latest_drop_pct) >= 15) ?
            `<span class="status-badge badge-red ml-1"><i class="fa-solid fa-arrow-trend-down"></i> -${cow.latest_drop_pct}%</span>` : '';

        return `
            <div class="cow-item" onclick="openCowDetail(${cow.id})">
                <div class="flex items-center">
                    <div class="cow-avatar">🐄</div>
                    <div class="cow-info">
                        <div class="flex items-center">
                            <span class="cow-tag">${cow.tag_number}</span>
                            <span class="status-badge ${badgeColor} ml-2">${cow.reproductive_status}</span>
                            ${dropBadge}
                        </div>
                        <div class="cow-name">${cow.name} &bull; <span class="text-slate-600">${cow.breed}</span></div>
                        <div class="cow-meta">Age: ${cow.age_display} &bull; Parity: ${cow.parity} ${cow.latest_milk ? `&bull; Latest: ${cow.latest_milk}L` : ''}</div>
                    </div>
                </div>
                <div class="text-slate-400 text-xs">
                    <i class="fa-solid fa-chevron-right"></i>
                </div>
            </div>
        `;
    }).join('');
}

function filterHerd(status, btn) {
    document.querySelectorAll('#herdFilters .filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    loadCows(status, document.getElementById('cowSearchInput').value);
}

function onCowSearch(input) {
    const activeChip = document.querySelector('#herdFilters .filter-chip.active');
    const status = activeChip ? activeChip.getAttribute('data-status') : '';
    loadCows(status, input.value);
}

// Cow Detail 360 View
async function openCowDetail(cowId) {
    activeCowDetailId = cowId;
    try {
        let cow;
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/cows.php?id=${cowId}`);
            cow = await res.json();
        } else {
            const store = getLocalStore();
            cow = store.cows.find(c => c.id == cowId);
            cow.age_display = calculateAge(cow.date_of_birth);
            cow.milk_history = store.milk.filter(m => m.cow_id == cowId);
            cow.health_history = store.health.filter(h => h.cow_id == cowId);
            cow.vaccination_history = store.vaccinations.filter(v => v.cow_id == cowId);
        }

        document.getElementById('detailTag').innerText = cow.tag_number;
        document.getElementById('detailName').innerText = `${cow.name} (${cow.breed})`;
        document.getElementById('detailStatus').innerText = cow.reproductive_status;
        document.getElementById('detailAge').innerText = cow.age_display;
        document.getElementById('detailParity').innerText = `Lactation #${cow.parity}`;
        document.getElementById('detailSource').innerText = cow.source;
        document.getElementById('detailDob').innerText = cow.date_of_birth;

        const milkContainer = document.getElementById('detailMilkHistory');
        if (cow.milk_history && cow.milk_history.length > 0) {
            milkContainer.innerHTML = cow.milk_history.map(m => `
                <div class="flex justify-between py-1.5 border-b border-slate-100 text-xs">
                    <span>${m.record_date}</span>
                    <span class="font-bold">${m.total_yield} L <span class="text-slate-400 font-normal">(${m.morning_yield}M / ${m.evening_yield}E)</span></span>
                    ${m.drop_percentage >= 15 ? `<span class="status-badge badge-red">-${m.drop_percentage}%</span>` : `<span class="text-slate-400">Normal</span>`}
                </div>
            `).join('');
        } else {
            milkContainer.innerHTML = `<p class="text-xs text-slate-400 py-2">No recent milk logs.</p>`;
        }

        const healthContainer = document.getElementById('detailHealthHistory');
        if (cow.health_history && cow.health_history.length > 0) {
            healthContainer.innerHTML = cow.health_history.map(h => `
                <div class="py-1.5 border-b border-slate-100 text-xs">
                    <div class="flex justify-between">
                        <span class="font-bold text-slate-800">${h.disease}</span>
                        <span class="status-badge ${h.recovery_status === 'Recovered' ? 'badge-green' : 'badge-orange'}">${h.recovery_status}</span>
                    </div>
                    <div class="text-slate-500 mt-0.5">${h.treatment} &bull; ${h.record_date}</div>
                </div>
            `).join('');
        } else {
            healthContainer.innerHTML = `<p class="text-xs text-slate-400 py-2">No health issues recorded.</p>`;
        }

        const vaxContainer = document.getElementById('detailVaxHistory');
        if (cow.vaccination_history && cow.vaccination_history.length > 0) {
            vaxContainer.innerHTML = cow.vaccination_history.map(v => `
                <div class="flex justify-between py-1.5 border-b border-slate-100 text-xs">
                    <span>${v.vaccine_name}</span>
                    <span class="text-slate-500">Next: ${v.next_vaccination_date}</span>
                    <span class="status-badge ${v.status === 'Due' ? 'badge-teal' : 'badge-green'}">${v.status}</span>
                </div>
            `).join('');
        } else {
            vaxContainer.innerHTML = `<p class="text-xs text-slate-400 py-2">No vaccinations recorded.</p>`;
        }

        openModal('modalCowDetail');
    } catch (e) {
        showToast('Failed to load cow details', true);
    }
}

// 3. Milk Production View
async function loadMilkLogs() {
    try {
        let stats, records;
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/milk.php`);
            const data = await res.json();
            stats = data.stats;
            records = data.records;
        } else {
            const store = getLocalStore();
            stats = { daily_average: 14.5, weekly_average: 143.5, monthly_average: 142.0 };
            records = store.milk.map(m => {
                const cow = store.cows.find(c => c.id == m.cow_id) || {};
                return { ...m, tag_number: cow.tag_number || 'COW-105', name: cow.name || 'Cow' };
            });
        }

        document.getElementById('milkDailyAvg').innerText = `${stats.daily_average} L`;
        document.getElementById('milkWeeklyAvg').innerText = `${stats.weekly_average} L`;
        document.getElementById('milkMonthlyAvg').innerText = `${stats.monthly_average} L`;

        const container = document.getElementById('milkLogsContainer');
        if (!container) return;

        container.innerHTML = records.map(r => {
            const isDrop = r.drop_percentage && parseFloat(r.drop_percentage) >= 15;
            return `
                <div class="cow-item ${isDrop ? 'border-red-300 bg-red-50/40' : ''}">
                    <div class="cow-info">
                        <div class="flex items-center">
                            <span class="cow-tag">${r.tag_number}</span>
                            <span class="text-xs text-slate-500 ml-2">${r.name}</span>
                            <span class="text-xs text-slate-400 ml-auto">${r.record_date}</span>
                        </div>
                        <div class="flex items-center justify-between mt-1">
                            <span class="text-xs text-slate-600">Morning: <b>${r.morning_yield}L</b> &bull; Evening: <b>${r.evening_yield}L</b></span>
                            <span class="text-sm font-bold text-slate-800">${r.total_yield} Liters</span>
                        </div>
                        ${isDrop ? `
                            <div class="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                <i class="fa-solid fa-triangle-exclamation"></i>
                                Unusual drop: -${r.drop_percentage}% vs yesterday (${r.yesterday_yield}L)
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Error loading milk logs:', e);
    }
}

// 4. Breeding & Calving View
async function loadBreedingData(subTab = 'heats') {
    const container = document.getElementById('breedingContentContainer');
    if (!container) return;

    if (subTab === 'heats') {
        let heats = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=heats`);
            const data = await res.json();
            heats = data.heats;
        } else {
            const store = getLocalStore();
            heats = store.heats.map(h => {
                const cow = store.cows.find(c => c.id == h.cow_id) || {};
                return { ...h, tag_number: cow.tag_number, name: cow.name };
            });
        }
        container.innerHTML = heats.map(h => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="cow-tag">${h.tag_number} (${h.name})</span>
                        <span class="status-badge ${h.status === 'AI Reminder' ? 'badge-red' : 'badge-yellow'}">
                            ${h.status === 'AI Reminder' ? 'AI Reminder (Red)' : 'Possible Heat (Yellow)'}
                        </span>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">
                        Detected: <b>${h.detection_date}</b> at <b>${h.detection_time.slice(0, 5)}</b>
                        ${h.inter_estrus_interval ? ` &bull; Interval: <b>${h.inter_estrus_interval} days</b>` : ''}
                    </div>
                    ${h.notes ? `<div class="text-xs text-slate-600 mt-1 italic">"${h.notes}"</div>` : ''}
                    <div class="mt-2 flex gap-2">
                        <button class="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded font-medium" onclick="openLogAiModal(${h.cow_id})">
                            <i class="fa-solid fa-syringe mr-1"></i> Perform AI
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else if (subTab === 'ai') {
        let records = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=ai`);
            const data = await res.json();
            records = data.ai_records;
        } else {
            const store = getLocalStore();
            records = store.ai.map(a => {
                const cow = store.cows.find(c => c.id == a.cow_id) || {};
                return { ...a, tag_number: cow.tag_number, name: cow.name };
            });
        }
        container.innerHTML = records.map(a => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="cow-tag">${a.tag_number} (${a.name})</span>
                        <span class="status-badge ${a.pregnancy_result === 'Positive' ? 'badge-green' : (a.pregnancy_result === 'Negative' ? 'badge-red' : 'badge-blue')}">
                            Pregnancy: ${a.pregnancy_result}
                        </span>
                    </div>
                    <div class="text-xs text-slate-600 mt-1">
                        AI Date: <b>${a.ai_date}</b> &bull; Service #${a.service_number} &bull; Tech: ${a.ai_technician}
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">
                        Expected Calving: <b>${a.expected_calving_date}</b>
                    </div>
                    ${a.pregnancy_result === 'Pending' ? `
                        <div class="mt-2 flex gap-2">
                            <button class="px-2.5 py-1 text-xs bg-blue-600 text-white rounded font-medium" onclick="openConfirmPregModal(${a.id}, '${a.tag_number}')">
                                <i class="fa-solid fa-stethoscope mr-1"></i> Confirm Pregnancy
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } else if (subTab === 'pregnant') {
        let pregnantCows = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=pregnant`);
            const data = await res.json();
            pregnantCows = data.pregnant_cows;
        } else {
            pregnantCows = [
                { id: 1, cow_id: 5, tag_number: 'COW-105', name: 'Rosie', days_pregnant: 275, days_to_calving: 8, gestation_progress_pct: 97.2 },
                { id: 2, cow_id: 3, tag_number: 'COW-103', name: 'Luna', days_pregnant: 272, days_to_calving: 11, gestation_progress_pct: 96.1 }
            ];
        }
        container.innerHTML = pregnantCows.map(p => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="cow-tag">${p.tag_number} (${p.name})</span>
                        <span class="status-badge badge-green">Pregnant (${p.days_pregnant} days)</span>
                    </div>
                    <div class="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
                        <div class="bg-emerald-600 h-2 rounded-full" style="width: ${Math.min(100, p.gestation_progress_pct)}%"></div>
                    </div>
                    <div class="flex justify-between text-xs text-slate-500 mt-1">
                        <span>Gestation: ${p.gestation_progress_pct}%</span>
                        <span>Calving Due in: <b>${p.days_to_calving} days</b></span>
                    </div>
                    <div class="mt-2 flex gap-2">
                        <button class="px-2.5 py-1 text-xs bg-purple-600 text-white rounded font-medium" onclick="openLogCalvingModal(${p.cow_id})">
                            <i class="fa-solid fa-baby mr-1"></i> Record Calving
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } else if (subTab === 'calvings') {
        let calvings = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=calvings`);
            const data = await res.json();
            calvings = data.calvings;
        } else {
            const store = getLocalStore();
            calvings = store.calvings.map(c => {
                const cow = store.cows.find(cw => cw.id == c.cow_id) || {};
                return { ...c, mother_tag: cow.tag_number, mother_name: cow.name };
            });
        }
        container.innerHTML = calvings.map(c => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="cow-tag">Calf ${c.calf_tag_number} (${c.calf_sex})</span>
                        <span class="status-badge badge-purple">${c.calving_type}</span>
                    </div>
                    <div class="text-xs text-slate-600 mt-1">
                        Mother: <b>${c.mother_tag} (${c.mother_name})</b> &bull; Date: ${c.calving_date}
                    </div>
                    <div class="text-xs text-slate-500 mt-0.5">
                        Birth Weight: ${c.birth_weight ? `${c.birth_weight} kg` : 'N/A'} &bull; Issues: ${c.post_calving_problems}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function switchBreedingSubTab(subTab, btn) {
    document.querySelectorAll('#breedingSubTabs .filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    loadBreedingData(subTab);
}

// 5. Health & Vaccines View
async function loadHealthAndVax(subTab = 'health') {
    const container = document.getElementById('healthContentContainer');
    if (!container) return;

    if (subTab === 'health') {
        let records = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/health.php`);
            const data = await res.json();
            records = data.health_records;
        } else {
            const store = getLocalStore();
            records = store.health.map(h => {
                const cow = store.cows.find(c => c.id == h.cow_id) || {};
                return { ...h, tag_number: cow.tag_number, name: cow.name };
            });
        }
        container.innerHTML = records.map(h => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="cow-tag">${h.tag_number} (${h.name})</span>
                        <span class="status-badge ${h.recovery_status === 'Recovered' ? 'badge-green' : 'badge-orange'}">
                            ${h.recovery_status}
                        </span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 mt-1">${h.disease}</div>
                    <div class="text-xs text-slate-600 mt-0.5">Symptoms: ${h.symptoms}</div>
                    <div class="text-xs text-slate-600 mt-0.5">Treatment: ${h.treatment} (${h.medicine} - ${h.dosage})</div>
                    <div class="text-xs text-slate-500 mt-1">
                        Vet Visit: ${h.veterinary_visit || 'None'} &bull; Started: ${h.start_date}
                    </div>
                </div>
            </div>
        `).join('');
    } else if (subTab === 'vaccines') {
        let vaccinations = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/vaccines.php`);
            const data = await res.json();
            vaccinations = data.vaccinations;
        } else {
            const store = getLocalStore();
            vaccinations = store.vaccinations.map(v => {
                const cow = store.cows.find(c => c.id == v.cow_id) || {};
                return { ...v, tag_number: cow.tag_number, name: cow.name };
            });
        }
        container.innerHTML = vaccinations.map(v => {
            const isDue = v.status === 'Due' || v.status === 'Overdue';
            return `
                <div class="cow-item ${isDue ? 'border-amber-300 bg-amber-50/30' : ''}">
                    <div class="cow-info">
                        <div class="flex items-center justify-between">
                            <span class="cow-tag">${v.tag_number} (${v.name})</span>
                            <span class="status-badge ${isDue ? 'badge-teal' : 'badge-green'}">${v.status}</span>
                        </div>
                        <div class="text-xs font-bold text-slate-800 mt-1">${v.vaccine_name}</div>
                        <div class="text-xs text-slate-500 mt-0.5">
                            Given: ${v.date_given} &bull; Next Due: <b>${v.next_vaccination_date}</b>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } else if (subTab === 'growth') {
        let growthRecords = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/growth.php`);
            const data = await res.json();
            growthRecords = data.growth_records;
        } else {
            const store = getLocalStore();
            growthRecords = store.growth.map(g => {
                const cow = store.cows.find(c => c.id == g.cow_id) || {};
                return { ...g, tag_number: cow.tag_number, name: cow.name };
            });
        }
        container.innerHTML = growthRecords.map(g => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="cow-tag">${g.tag_number} (${g.name})</span>
                        <span class="status-badge badge-blue">ADG: ${g.growth_rate} kg/day</span>
                    </div>
                    <div class="text-xs text-slate-600 mt-1">
                        Weight: <b>${g.weight} kg</b> &bull; Age: ${g.age_months} months &bull; Gain: +${g.weight_gain} kg
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function switchHealthSubTab(subTab, btn) {
    document.querySelectorAll('#healthSubTabs .filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    loadHealthAndVax(subTab);
}

// 6. Notifications & Alerts View
async function loadAllAlerts(category = 'all') {
    try {
        let alerts = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/alerts.php?category=${category}`);
            const data = await res.json();
            alerts = data.alerts;
        } else {
            alerts = [
                { category: 'possible_heat', badge: 'Possible Heat', badge_class: 'badge-yellow', cow_id: 14, title: 'Possible Heat: Cow COW-114 (Lily)', message: 'Observed today at 07:15. Restless, vocalization.', action_label: 'Log AI Breeding', action_type: 'breeding', date: '2026-09-10' },
                { category: 'possible_heat', badge: 'Possible Heat', badge_class: 'badge-yellow', cow_id: 2, title: 'Possible Heat: Cow COW-102 (Bella)', message: 'Observed today at 06:30. Mounting behavior observed.', action_label: 'Log AI Breeding', action_type: 'breeding', date: '2026-09-10' },
                { category: 'ai_breeding_reminder', badge: 'AI Due (Red)', badge_class: 'badge-red', cow_id: 8, title: 'AI Breeding Reminder: Cow COW-108 (Ruby)', message: 'Recommended Breeding window active! Inseminate within 12-18h.', action_label: 'Perform AI Now', action_type: 'breeding', date: '2026-09-10' },
                { category: 'pregnancy_check', badge: 'Pregnancy Check Due', badge_class: 'badge-blue', cow_id: 10, ai_id: 3, title: 'Cow ID COW-110 - Pregnancy check due', message: 'Inseminated on 2026-07-27. Vet check due today.', action_label: 'Confirm Result', action_type: 'confirm_preg', date: '2026-09-10' },
                { category: 'expected_calving', badge: 'Calving Approaching', badge_class: 'badge-purple', cow_id: 5, title: 'Cow ID COW-105 - Expected calving approaching', message: 'Due in 8 days on 2026-09-18. Move cow to maternity stall.', action_label: 'Record Calving', action_type: 'calving', date: '2026-09-18' },
                { category: 'vaccination', badge: 'Vaccination Due', badge_class: 'badge-teal', cow_id: 5, title: 'Vaccination due for Cow ID COW-105.', message: 'Schedule Foot and Mouth Disease (FMD) before today.', action_label: 'Record Dose', action_type: 'vaccine', date: '2026-09-10' },
                { category: 'milk_decrease', badge: 'Unusual Milk Drop', badge_class: 'badge-red', cow_id: 5, title: 'Unusual milk decrease: Cow COW-105 (Rosie)', message: 'Yesterday: 12.50 L -> Today: 10.20 L (Decreased by 18.40%). Possible mastitis.', action_label: 'Check Health', action_type: 'health_check', date: '2026-09-10' },
                { category: 'treatment_follow_up', badge: 'Treatment Follow-up', badge_class: 'badge-orange', cow_id: 5, record_id: 1, title: 'Treatment Follow-up: Cow COW-105 (Subclinical Mastitis)', message: 'Ongoing care since 2026-09-10. Status: In Treatment.', action_label: 'Update Status', action_type: 'health', date: '2026-09-10' }
            ];

            if (category !== 'all') {
                alerts = alerts.filter(a => a.category === category);
            }
        }

        const container = document.getElementById('alertsListContainer');
        if (!container) return;

        if (alerts.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm">No alerts in this category.</div>`;
            return;
        }

        container.innerHTML = alerts.map(a => `
            <div class="cow-item">
                <div class="cow-info">
                    <div class="flex items-center justify-between">
                        <span class="status-badge ${a.badge_class}">${a.badge}</span>
                        <span class="text-xs text-slate-400">${a.date}</span>
                    </div>
                    <div class="text-xs font-bold text-slate-800 mt-1.5">${a.title}</div>
                    <div class="text-xs text-slate-600 mt-0.5 leading-relaxed">${a.message}</div>
                    ${a.action_label ? `
                        <div class="mt-2">
                            <button class="px-2.5 py-1 text-xs bg-slate-800 text-white rounded font-medium hover:bg-slate-700" onclick="handleAlertAction('${a.action_type}', ${a.cow_id || 0}, ${a.ai_id || a.record_id || 0})">
                                ${a.action_label} &rarr;
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Error loading alerts:', e);
    }
}

function filterAlerts(category, btn) {
    document.querySelectorAll('#alertFilters .filter-chip').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    loadAllAlerts(category);
}

function handleAlertAction(type, cowId, recordId) {
    if (type === 'breeding') openLogAiModal(cowId);
    if (type === 'confirm_preg') openConfirmPregModal(recordId);
    if (type === 'calving') openLogCalvingModal(cowId);
    if (type === 'vaccine') openLogVaccineModal(cowId);
    if (type === 'health' || type === 'health_check') openLogHealthModal(cowId);
}

// THI Interactive Calculator Logic
function initThiCalculator() {
    const tempInput = document.getElementById('thiTempInput');
    const humInput = document.getElementById('thiHumidityInput');
    if (!tempInput || !humInput) return;

    const updateCalc = () => {
        const t = parseFloat(tempInput.value) || 28;
        const rh = parseFloat(humInput.value) || 60;
        const thi = Math.round(((0.8 * t) + ((rh / 100) * (t - 14.4)) + 46.4) * 10) / 10;
        document.getElementById('thiValueDisplay').innerText = thi;

        const badge = document.getElementById('thiStatusBadge');
        const advice = document.getElementById('thiAdviceText');

        if (thi < 72) {
            badge.className = 'status-badge badge-green';
            badge.innerText = 'Normal / Comfortable';
            advice.innerText = 'Comfort zone. Optimal feed intake and milk yield.';
        } else if (thi <= 78) {
            badge.className = 'status-badge badge-yellow';
            badge.innerText = 'Mild Heat Stress';
            advice.innerText = 'Mild stress. Ensure clean cool drinking water and airflow.';
        } else if (thi <= 88) {
            badge.className = 'status-badge badge-orange';
            badge.innerText = 'Moderate Stress';
            advice.innerText = 'Moderate stress! Turn on fans and sprinkler/misting systems.';
        } else {
            badge.className = 'status-badge badge-red';
            badge.innerText = 'Severe Stress / Danger';
            advice.innerText = 'Extreme danger! Heavy open-mouth panting. Direct active cooling needed immediately!';
        }
    };

    tempInput.addEventListener('input', updateCalc);
    humInput.addEventListener('input', updateCalc);
    updateCalc();
}

function initModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

function initFab() {
    const fabBtn = document.getElementById('fabMainBtn');
    const fabMenu = document.getElementById('fabMenu');
    fabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fabMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        fabMenu.classList.remove('show');
    });
}

function populateCowSelectors(cows) {
    const selectors = ['milkCowSelect', 'heatCowSelect', 'aiCowSelect', 'calvCowSelect', 'healthCowSelect', 'vaxCowSelect', 'growthCowSelect'];
    selectors.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = `<option value="">-- Select Cow --</option>` + cows.map(c => `
            <option value="${c.id}">${c.tag_number} - ${c.name} (${c.reproductive_status})</option>
        `).join('');
    });
}

// ----------------- SUBMIT FORMS (DUAL SERVER & VERCEL OFFLINE) -----------------

// 1. Submit New Cow Profile
async function submitNewCow(e) {
    e.preventDefault();
    const tag = document.getElementById('newCowTag').value.trim();
    const name = document.getElementById('newCowName').value.trim();
    const breed = document.getElementById('newCowBreed').value;
    const dob = document.getElementById('newCowDob').value;
    const source = document.getElementById('newCowSource').value;
    const parity = parseInt(document.getElementById('newCowParity').value) || 0;
    const status = document.getElementById('newCowStatus').value;

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/cows.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_number: tag, name, breed, date_of_birth: dob, source, parity, reproductive_status: status })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to register cow');
        } else {
            const store = getLocalStore();
            const newCow = {
                id: Date.now(),
                tag_number: tag,
                name,
                breed,
                date_of_birth: dob,
                source,
                parity,
                reproductive_status: status,
                photo_url: 'assets/cow_default.jpg'
            };
            store.cows.unshift(newCow);
            saveLocalStore(store);
        }

        showToast(`Cow ${tag} registered successfully!`);
        closeModal('modalAddCow');
        document.getElementById('formAddCow').reset();
        loadCows();
        loadDashboard();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 2. Submit Daily Milk Record
async function submitMilkRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('milkCowSelect').value;
    const date = document.getElementById('milkRecordDate').value;
    const morning = parseFloat(document.getElementById('milkMorningYield').value) || 0;
    const evening = parseFloat(document.getElementById('milkEveningYield').value) || 0;
    const total = Math.round((morning + evening) * 100) / 100;

    try {
        let alertTriggered = false;
        let dropPct = 0;

        if (isServerMode) {
            const res = await fetch(`${API_BASE}/milk.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cow_id: cowId, record_date: date, morning_yield: morning, evening_yield: evening })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save milk');
            alertTriggered = data.alert_triggered;
            dropPct = data.drop_percentage;
        } else {
            const store = getLocalStore();
            const prev = store.milk.find(m => m.cow_id == cowId);
            const yYield = prev ? prev.total_yield : 15.0;
            if (yYield > total) {
                dropPct = Math.round(((yYield - total) / yYield) * 1000) / 10;
                if (dropPct >= 15) alertTriggered = true;
            }
            store.milk.unshift({
                id: Date.now(),
                cow_id: parseInt(cowId),
                record_date: date,
                morning_yield: morning,
                evening_yield: evening,
                total_yield: total,
                yesterday_yield: yYield,
                drop_percentage: dropPct
            });
            saveLocalStore(store);
        }

        if (alertTriggered) {
            showToast(`Warning: Milk drop of ${dropPct}% detected! Check cow health.`, true);
        } else {
            showToast(`Milk recorded: ${total} Liters`);
        }

        closeModal('modalLogMilk');
        document.getElementById('formLogMilk').reset();
        loadMilkLogs();
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 3. Submit Heat Observation
async function submitHeatRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('heatCowSelect').value;
    const date = document.getElementById('heatDate').value;
    const time = document.getElementById('heatTime').value;
    const status = document.getElementById('heatStatus').value;
    const notes = document.getElementById('heatNotes').value;

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=log_heat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cow_id: cowId, detection_date: date, detection_time: time, status, notes })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to log heat');
        } else {
            const store = getLocalStore();
            store.heats.unshift({
                id: Date.now(),
                cow_id: parseInt(cowId),
                detection_date: date,
                detection_time: time + ':00',
                status,
                inter_estrus_interval: 21,
                notes
            });
            const targetCow = store.cows.find(c => c.id == cowId);
            if (targetCow) targetCow.reproductive_status = 'In heat';
            saveLocalStore(store);
        }

        showToast(`Heat recorded with status: ${status}`);
        closeModal('modalLogHeat');
        document.getElementById('formLogHeat').reset();
        loadDashboard();
        loadBreedingData('heats');
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 4. Submit AI Breeding Service
function openLogAiModal(cowId = null) {
    if (cowId) document.getElementById('aiCowSelect').value = cowId;
    openModal('modalLogAi');
}

async function submitAiRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('aiCowSelect').value;
    const heatDate = document.getElementById('aiHeatDate').value;
    const aiDate = document.getElementById('aiDate').value;
    const serviceNum = document.getElementById('aiServiceNum').value;
    const tech = document.getElementById('aiTechnician').value;
    const bullId = document.getElementById('aiBullId').value;
    const notes = document.getElementById('aiNotes').value;

    try {
        let expectedCalving = '2027-06-20';
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=log_ai`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cow_id: cowId, heat_date: heatDate, ai_date: aiDate, service_number: serviceNum,
                    ai_technician: tech, bull_semen_id: bullId, reproductive_problems: notes
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save AI record');
            expectedCalving = data.expected_calving_date;
        } else {
            const store = getLocalStore();
            const d = new Date(aiDate);
            d.setDate(d.getDate() + 283);
            expectedCalving = d.toISOString().split('T')[0];
            store.ai.unshift({
                id: Date.now(),
                cow_id: parseInt(cowId),
                heat_date: heatDate,
                ai_date: aiDate,
                service_number: parseInt(serviceNum),
                ai_technician: tech,
                bull_semen_id: bullId,
                pregnancy_result: 'Pending',
                expected_calving_date: expectedCalving
            });
            saveLocalStore(store);
        }

        showToast(`AI logged! Expected Calving: ${expectedCalving}`);
        closeModal('modalLogAi');
        document.getElementById('formLogAi').reset();
        loadBreedingData('ai');
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 5. Confirm Pregnancy Result
function openConfirmPregModal(aiId, tagNumber = '') {
    document.getElementById('confirmAiId').value = aiId;
    document.getElementById('confirmPregNotice').innerText = `Confirm result for record #${aiId} (${tagNumber})`;
    openModal('modalConfirmPreg');
}

async function submitConfirmPreg(result) {
    const aiId = document.getElementById('confirmAiId').value;
    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=confirm_pregnancy`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ai_id: aiId, pregnancy_result: result })
            });
            const data = await res.json();
            showToast(data.message);
        } else {
            const store = getLocalStore();
            const record = store.ai.find(a => a.id == aiId);
            if (record) {
                record.pregnancy_result = result;
                const cow = store.cows.find(c => c.id == record.cow_id);
                if (cow) cow.reproductive_status = result === 'Positive' ? 'Pregnant' : 'Open';
            }
            saveLocalStore(store);
            showToast(`Pregnancy confirmed: ${result}`);
        }

        closeModal('modalConfirmPreg');
        loadBreedingData('ai');
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 6. Submit Calving Record
function openLogCalvingModal(cowId = null) {
    if (cowId) document.getElementById('calvCowSelect').value = cowId;
    openModal('modalLogCalving');
}

async function submitCalvingRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('calvCowSelect').value;
    const date = document.getElementById('calvDate').value;
    const type = document.getElementById('calvType').value;
    const calfTag = document.getElementById('calvCalfTag').value;
    const calfSex = document.getElementById('calvCalfSex').value;
    const weight = document.getElementById('calvBirthWeight').value;
    const problems = document.getElementById('calvProblems').value;

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/reproduction.php?action=log_calving`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cow_id: cowId, calving_date: date, calving_type: type,
                    calf_tag_number: calfTag, calf_sex: calfSex, birth_weight: weight, post_calving_problems: problems
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to record calving');
        } else {
            const store = getLocalStore();
            const mother = store.cows.find(c => c.id == cowId);
            if (mother) {
                mother.parity = (mother.parity || 0) + 1;
                mother.reproductive_status = 'Fresh';
            }
            store.calvings.unshift({
                id: Date.now(),
                cow_id: parseInt(cowId),
                calving_date: date,
                calving_type: type,
                calf_tag_number: calfTag,
                calf_sex: calfSex,
                birth_weight: parseFloat(weight) || 38.0,
                post_calving_problems: problems
            });
            // Register calf
            store.cows.unshift({
                id: Date.now() + 1,
                tag_number: calfTag,
                name: `Calf of ${mother ? mother.name : 'Cow'}`,
                breed: mother ? mother.breed : 'Crossbred',
                date_of_birth: date,
                source: 'born on farm',
                parity: 0,
                reproductive_status: 'Open'
            });
            saveLocalStore(store);
        }

        showToast(`Calving recorded! Calf ${calfTag} added to herd.`);
        closeModal('modalLogCalving');
        document.getElementById('formLogCalving').reset();
        loadBreedingData('calvings');
        loadCows();
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 7. Submit Health Record
function openLogHealthModal(cowId = null) {
    if (cowId) document.getElementById('healthCowSelect').value = cowId;
    openModal('modalLogHealth');
}

async function submitHealthRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('healthCowSelect').value;
    const date = document.getElementById('healthDate').value;
    const disease = document.getElementById('healthDisease').value;
    const symptoms = document.getElementById('healthSymptoms').value;
    const treatment = document.getElementById('healthTreatment').value;
    const medicine = document.getElementById('healthMedicine').value;
    const dosage = document.getElementById('healthDosage').value;
    const vet = document.getElementById('healthVet').value;
    const status = document.getElementById('healthRecoveryStatus').value;

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/health.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cow_id: cowId, record_date: date, disease, symptoms,
                    treatment, medicine, dosage, veterinary_visit: vet, recovery_status: status
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save health record');
        } else {
            const store = getLocalStore();
            store.health.unshift({
                id: Date.now(),
                cow_id: parseInt(cowId),
                record_date: date,
                disease,
                symptoms,
                treatment,
                medicine,
                dosage,
                veterinary_visit: vet,
                recovery_status: status,
                start_date: date
            });
            saveLocalStore(store);
        }

        showToast('Health record saved!');
        closeModal('modalLogHealth');
        document.getElementById('formLogHealth').reset();
        loadHealthAndVax('health');
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 8. Submit Vaccination Record
function openLogVaccineModal(cowId = null) {
    if (cowId) document.getElementById('vaxCowSelect').value = cowId;
    openModal('modalLogVaccine');
}

async function submitVaccineRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('vaxCowSelect').value;
    const name = document.getElementById('vaxName').value;
    const dateGiven = document.getElementById('vaxDateGiven').value;
    const nextDate = document.getElementById('vaxNextDate').value;
    const type = document.getElementById('vaxType').value;

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/vaccines.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cow_id: cowId, vaccine_name: name, date_given: dateGiven,
                    next_vaccination_date: nextDate, treatment_type: type, status: 'Given'
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to record vaccine');
        } else {
            const store = getLocalStore();
            store.vaccinations.unshift({
                id: Date.now(),
                cow_id: parseInt(cowId),
                vaccine_name: name,
                date_given: dateGiven,
                next_vaccination_date: nextDate,
                treatment_type: type,
                status: 'Given'
            });
            saveLocalStore(store);
        }

        showToast('Vaccination recorded!');
        closeModal('modalLogVaccine');
        document.getElementById('formLogVaccine').reset();
        loadHealthAndVax('vaccines');
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 9. Save THI Log
async function saveThiReading() {
    const t = parseFloat(document.getElementById('thiTempInput').value) || 28;
    const rh = parseFloat(document.getElementById('thiHumidityInput').value) || 60;
    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/thi.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ temperature: t, humidity: rh })
            });
            const data = await res.json();
            showToast(`THI log saved! Index: ${data.thi} (${data.stress_level})`);
        } else {
            showToast(`THI log saved! Index: 81.2 (Moderate Stress)`);
        }
        closeModal('modalThiCalculator');
    } catch (e) {
        showToast('Failed to save THI log', true);
    }
}
