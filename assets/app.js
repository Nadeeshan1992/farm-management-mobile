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
        { id: 1, tag_number: 'COW-101', name: 'Daisy', breed: 'Frieglan', gender: 'Female', date_of_birth: '2021-03-15', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_1.jpg' },
        { id: 2, tag_number: 'COW-102', name: 'Bella', breed: 'Gir', gender: 'Female', date_of_birth: '2022-05-10', source: 'born on farm', parity: 1, reproductive_status: 'In heat', photo_url: 'assets/cow_2.jpg' },
        { id: 3, tag_number: 'COW-103', name: 'Luna', breed: 'Frieglan', gender: 'Female', date_of_birth: '2020-01-20', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_3.jpg' },
        { id: 4, tag_number: 'COW-104', name: 'Molly', breed: 'Brown Swiss', gender: 'Female', date_of_birth: '2021-08-12', source: 'born on farm', parity: 2, reproductive_status: 'Fresh', photo_url: 'assets/cow_4.jpg' },
        { id: 5, tag_number: 'COW-105', name: 'Rosie', breed: 'Frieglan', gender: 'Female', date_of_birth: '2020-11-05', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_5.jpg' },
        { id: 6, tag_number: 'COW-106', name: 'Penny', breed: 'Sahiwal', gender: 'Female', date_of_birth: '2022-02-14', source: 'born on farm', parity: 1, reproductive_status: 'Fresh', photo_url: 'assets/cow_6.jpg' },
        { id: 7, tag_number: 'COW-107', name: 'Maggie', breed: 'Ayrshire', gender: 'Female', date_of_birth: '2021-06-22', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_7.jpg' },
        { id: 8, tag_number: 'COW-108', name: 'Ruby', breed: 'Frieglan', gender: 'Female', date_of_birth: '2022-09-01', source: 'born on farm', parity: 1, reproductive_status: 'In heat', photo_url: 'assets/cow_8.jpg' },
        { id: 9, tag_number: 'COW-109', name: 'Chloe', breed: 'Gir', gender: 'Female', date_of_birth: '2019-12-10', source: 'purchased', parity: 4, reproductive_status: 'Dry', photo_url: 'assets/cow_9.jpg' },
        { id: 10, tag_number: 'COW-110', name: 'Stella', breed: 'Frieglan', gender: 'Female', date_of_birth: '2021-04-18', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_10.jpg' },
        { id: 11, tag_number: 'COW-111', name: 'Lucy', breed: 'Sahiwal', gender: 'Female', date_of_birth: '2020-07-29', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_1.jpg' },
        { id: 12, tag_number: 'COW-112', name: 'Emma', breed: 'Brown Swiss', gender: 'Female', date_of_birth: '2022-10-05', source: 'born on farm', parity: 1, reproductive_status: 'Fresh', photo_url: 'assets/cow_2.jpg' },
        { id: 13, tag_number: 'COW-113', name: 'Sadie', breed: 'Frieglan', gender: 'Female', date_of_birth: '2021-01-14', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_3.jpg' },
        { id: 14, tag_number: 'COW-114', name: 'Lily', breed: 'Gir', gender: 'Female', date_of_birth: '2023-01-02', source: 'born on farm', parity: 0, reproductive_status: 'In heat', photo_url: 'assets/cow_4.jpg' },
        { id: 15, tag_number: 'COW-115', name: 'Sophie', breed: 'Frieglan', gender: 'Female', date_of_birth: '2020-03-30', source: 'purchased', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_5.jpg' },
        { id: 16, tag_number: 'COW-116', name: 'Grace', breed: 'Ayrshire', gender: 'Female', date_of_birth: '2021-11-19', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_6.jpg' },
        { id: 17, tag_number: 'COW-117', name: 'Zoe', breed: 'Frieglan', gender: 'Female', date_of_birth: '2022-04-25', source: 'born on farm', parity: 1, reproductive_status: 'Pregnant', photo_url: 'assets/cow_7.jpg' },
        { id: 18, tag_number: 'COW-118', name: 'Nala', breed: 'Brown Swiss', gender: 'Female', date_of_birth: '2021-09-14', source: 'purchased', parity: 2, reproductive_status: 'Fresh', photo_url: 'assets/cow_8.jpg' },
        { id: 19, tag_number: 'COW-119', name: 'Coco', breed: 'Sahiwal', gender: 'Female', date_of_birth: '2020-08-11', source: 'born on farm', parity: 3, reproductive_status: 'Pregnant', photo_url: 'assets/cow_9.jpg' },
        { id: 20, tag_number: 'COW-120', name: 'Hazel', breed: 'Frieglan', gender: 'Female', date_of_birth: '2019-05-02', source: 'purchased', parity: 4, reproductive_status: 'Dry', photo_url: 'assets/cow_10.jpg' },
        { id: 21, tag_number: 'COW-121', name: 'Willow', breed: 'Gir', gender: 'Female', date_of_birth: '2022-07-08', source: 'born on farm', parity: 1, reproductive_status: 'Pregnant', photo_url: 'assets/cow_1.jpg' },
        { id: 22, tag_number: 'COW-122', name: 'Piper', breed: 'Frieglan', gender: 'Female', date_of_birth: '2021-12-03', source: 'born on farm', parity: 2, reproductive_status: 'Pregnant', photo_url: 'assets/cow_2.jpg' },
        { id: 23, tag_number: 'COW-123', name: 'Roxy', breed: 'Sahiwal', gender: 'Female', date_of_birth: '2023-03-12', source: 'born on farm', parity: 0, reproductive_status: 'Open', photo_url: 'assets/cow_3.jpg' },
        { id: 24, tag_number: 'COW-124', name: 'Ginger', breed: 'Ayrshire', gender: 'Female', date_of_birth: '2022-11-20', source: 'purchased', parity: 1, reproductive_status: 'Fresh', photo_url: 'assets/cow_4.jpg' },
        { id: 25, tag_number: 'BULL-101', name: 'Titan', breed: 'Frieglan', gender: 'Male', date_of_birth: '2020-05-18', source: 'purchased', parity: 0, reproductive_status: 'Breeding Sire', photo_url: 'assets/cow_5.jpg' },
        { id: 26, tag_number: 'BULL-102', name: 'Thor', breed: 'Gir', gender: 'Male', date_of_birth: '2022-08-12', source: 'born on farm', parity: 0, reproductive_status: 'Young Bull', photo_url: 'assets/cow_3.jpg' },
        { id: 27, tag_number: 'CALF-100', name: 'Hope (Calf)', breed: 'Frieglan', gender: 'Female', date_of_birth: '2026-01-01', source: 'born on farm', parity: 0, reproductive_status: 'Heifer', photo_url: 'assets/cow_1.jpg' },
        { id: 28, tag_number: 'CALF-201', name: 'Daisy Jr (Calf)', breed: 'Ayrshire', gender: 'Female', date_of_birth: '2026-06-01', source: 'born on farm', parity: 0, reproductive_status: 'Heifer', photo_url: 'assets/cow_2.jpg' },
        { id: 29, tag_number: 'CALF-202', name: 'Thor Jr (Bull Calf)', breed: 'Gir', gender: 'Male', date_of_birth: '2026-06-15', source: 'born on farm', parity: 0, reproductive_status: 'Young Bull', photo_url: 'assets/cow_3.jpg' }
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
        // Cow 1 (Daisy) - Daily, Weekly, Monthly
        { id: 101, cow_id: 1, record_date: '2026-09-30', morning_yield: 10.0, evening_yield: 8.6, total_yield: 18.6, yesterday_yield: 19.0, drop_percentage: 2.11 },
        { id: 102, cow_id: 1, record_date: '2026-09-29', morning_yield: 10.2, evening_yield: 8.7, total_yield: 18.9, yesterday_yield: 18.7, drop_percentage: 0.0 },
        { id: 103, cow_id: 1, record_date: '2026-09-28', morning_yield: 10.3, evening_yield: 8.7, total_yield: 19.0, yesterday_yield: 18.9, drop_percentage: 0.0 },
        { id: 104, cow_id: 1, record_date: '2026-09-25', morning_yield: 9.8, evening_yield: 8.5, total_yield: 18.3, yesterday_yield: 18.5, drop_percentage: 1.08 },
        { id: 105, cow_id: 1, record_date: '2026-09-20', morning_yield: 10.1, evening_yield: 8.8, total_yield: 18.9, yesterday_yield: 19.1, drop_percentage: 1.05 },
        { id: 106, cow_id: 1, record_date: '2026-09-14', morning_yield: 9.9, evening_yield: 8.6, total_yield: 18.5, yesterday_yield: 18.4, drop_percentage: 0.0 },
        { id: 107, cow_id: 1, record_date: '2026-09-07', morning_yield: 10.4, evening_yield: 8.9, total_yield: 19.3, yesterday_yield: 19.0, drop_percentage: 0.0 },
        { id: 108, cow_id: 1, record_date: '2026-08-28', morning_yield: 10.0, evening_yield: 8.5, total_yield: 18.5, yesterday_yield: 18.6, drop_percentage: 0.54 },
        { id: 109, cow_id: 1, record_date: '2026-08-21', morning_yield: 9.7, evening_yield: 8.4, total_yield: 18.1, yesterday_yield: 18.3, drop_percentage: 1.09 },
        { id: 110, cow_id: 1, record_date: '2026-08-14', morning_yield: 10.1, evening_yield: 8.7, total_yield: 18.8, yesterday_yield: 18.7, drop_percentage: 0.0 },
        // Cow 5 (Rosie) - Daily, Weekly, Monthly (including mastitis drop)
        { id: 1, cow_id: 5, record_date: '2026-09-30', morning_yield: 5.8, evening_yield: 4.8, total_yield: 10.6, yesterday_yield: 10.2, drop_percentage: 0.0 },
        { id: 2, cow_id: 5, record_date: '2026-09-29', morning_yield: 5.6, evening_yield: 4.6, total_yield: 10.2, yesterday_yield: 12.5, drop_percentage: 18.40 },
        { id: 3, cow_id: 5, record_date: '2026-09-28', morning_yield: 6.8, evening_yield: 5.7, total_yield: 12.5, yesterday_yield: 13.0, drop_percentage: 3.85 },
        { id: 4, cow_id: 5, record_date: '2026-09-21', morning_yield: 6.9, evening_yield: 5.8, total_yield: 12.7, yesterday_yield: 12.8, drop_percentage: 0.78 },
        { id: 5, cow_id: 5, record_date: '2026-09-14', morning_yield: 7.1, evening_yield: 6.0, total_yield: 13.1, yesterday_yield: 13.0, drop_percentage: 0.0 },
        { id: 6, cow_id: 5, record_date: '2026-08-28', morning_yield: 7.0, evening_yield: 5.9, total_yield: 12.9, yesterday_yield: 13.2, drop_percentage: 2.27 },
        { id: 7, cow_id: 5, record_date: '2026-08-20', morning_yield: 7.2, evening_yield: 6.1, total_yield: 13.3, yesterday_yield: 13.1, drop_percentage: 0.0 },
        // Cow 4 (Molly)
        { id: 201, cow_id: 4, record_date: '2026-09-30', morning_yield: 11.2, evening_yield: 9.9, total_yield: 21.1, yesterday_yield: 20.8, drop_percentage: 0.0 },
        { id: 202, cow_id: 4, record_date: '2026-09-25', morning_yield: 11.0, evening_yield: 9.8, total_yield: 20.8, yesterday_yield: 21.0, drop_percentage: 0.95 },
        { id: 203, cow_id: 4, record_date: '2026-09-18', morning_yield: 11.4, evening_yield: 10.1, total_yield: 21.5, yesterday_yield: 21.2, drop_percentage: 0.0 },
        { id: 204, cow_id: 4, record_date: '2026-08-25', morning_yield: 11.1, evening_yield: 9.8, total_yield: 20.9, yesterday_yield: 21.0, drop_percentage: 0.48 },
        // Cow 6 (Penny)
        { id: 301, cow_id: 6, record_date: '2026-09-30', morning_yield: 8.5, evening_yield: 7.6, total_yield: 16.1, yesterday_yield: 15.7, drop_percentage: 0.0 },
        { id: 302, cow_id: 6, record_date: '2026-09-25', morning_yield: 8.2, evening_yield: 7.5, total_yield: 15.7, yesterday_yield: 16.0, drop_percentage: 1.87 },
        { id: 303, cow_id: 6, record_date: '2026-08-22', morning_yield: 8.4, evening_yield: 7.4, total_yield: 15.8, yesterday_yield: 15.6, drop_percentage: 0.0 },
        // Cow 12 (Emma)
        { id: 401, cow_id: 12, record_date: '2026-09-30', morning_yield: 10.8, evening_yield: 9.6, total_yield: 20.4, yesterday_yield: 20.0, drop_percentage: 0.0 },
        { id: 402, cow_id: 12, record_date: '2026-09-25', morning_yield: 10.5, evening_yield: 9.5, total_yield: 20.0, yesterday_yield: 20.2, drop_percentage: 0.99 },
        { id: 403, cow_id: 12, record_date: '2026-08-29', morning_yield: 10.7, evening_yield: 9.4, total_yield: 20.1, yesterday_yield: 20.3, drop_percentage: 0.99 }
    ],
    health: [
        { id: 1, cow_id: 5, record_date: '2026-09-10', disease: 'Subclinical Mastitis', symptoms: 'Swelling in right rear quarter, clot in milk', treatment: 'Intramammary antibiotic infusion', medicine: 'Cefa-Lak & Flunixin', dosage: '1 tube / 10ml IV', start_date: '2026-09-10', veterinary_visit: 'Dr. Robert Miller (Today)', recovery_status: 'In Treatment', notes: 'Explains recent 18.4% drop in milk yield.' },
        { id: 2, cow_id: 11, record_date: '2026-09-08', disease: 'Hoof Rot (Lameness)', symptoms: 'Limping on right foreleg, foul odor', treatment: 'Hoof trim and systemic antibiotic', medicine: 'Oxytetracycline LA', dosage: '20ml IM', start_date: '2026-09-08', veterinary_visit: 'Dr. Sarah Jenkins', recovery_status: 'In Treatment', notes: 'Keep in dry recovery pen.' },
        { id: 3, cow_id: 18, record_date: '2026-09-09', disease: 'Bovine Ketosis', symptoms: 'Rapid weight loss, sweet acetone breath', treatment: 'Propylene glycol + IV Dextrose', medicine: 'Propylene Glycol & Dextrose 50%', dosage: '250g BID', start_date: '2026-09-09', veterinary_visit: 'Dr. Robert Miller', recovery_status: 'Active', notes: 'Monitor ketones daily.' }
    ],
    vaccinations: [
        { id: 1, cow_id: 5, vaccine_name: 'Foot and Mouth Disease (FMD)', date_given: '2026-03-14', next_vaccination_date: '2026-09-10', treatment_type: 'Routine Bi-Annual', status: 'Due' },
        { id: 2, cow_id: 11, vaccine_name: 'Anthrax Spore Vaccine', date_given: '2025-09-15', next_vaccination_date: '2026-09-12', treatment_type: 'Annual Booster', status: 'Due' },
        { id: 10, cow_id: 27, vaccine_name: 'HS Vaccine (Primary)', date_given: '2026-05-01', next_vaccination_date: '2026-08-01', treatment_type: 'HS Protocol Primary', status: 'Given' },
        { id: 11, cow_id: 27, vaccine_name: 'HS Vaccine (Secondary Booster)', date_given: '2026-08-01', next_vaccination_date: '2027-08-01', treatment_type: 'HS Secondary Booster', status: 'Given' },
        { id: 12, cow_id: 27, vaccine_name: 'BQ Vaccine (Primary)', date_given: '2026-05-01', next_vaccination_date: '2027-06-01', treatment_type: 'BQ Protocol Primary', status: 'Given' }
    ],
    growth: [
        { id: 1, cow_id: 23, record_date: '2026-09-10', weight: 290.0, age_months: 18, weight_gain: 28.0, growth_rate: 0.93 },
        { id: 2, cow_id: 25, record_date: '2026-09-10', weight: 320.0, age_months: 19, weight_gain: 31.0, growth_rate: 1.03 }
    ],
    thi: [
        { id: 1, recorded_at: '2026-09-10 12:00:00', temperature: 30.5, humidity: 68.0, thi_value: 81.2, stress_level: 'Moderate Stress', notes: 'Fans on' }
    ],
    feeds: [
        { id: 1, name: 'TMR', category: 'Forage / TMR', dm_pct: 45.00, cp_pct: 16.00, fat_pct: 3.50, fiber_pct: 18.00, ndf_pct: 35.00, adf_pct: 22.00, starch_pct: 24.00, sugar_pct: 4.50, ash_pct: 7.20, ca_pct: 0.800, p_pct: 0.450, mg_pct: 0.250, k_pct: 1.300, na_pct: 0.350, s_pct: 0.200, me_mj: 11.20, nel_mj: 6.80, notes: 'Total Mixed Ration' },
        { id: 2, name: 'Concentrate', category: 'Concentrate', dm_pct: 88.00, cp_pct: 18.00, fat_pct: 4.00, fiber_pct: 8.00, ndf_pct: 18.00, adf_pct: 11.00, starch_pct: 38.00, sugar_pct: 5.00, ash_pct: 6.50, ca_pct: 0.900, p_pct: 0.600, mg_pct: 0.350, k_pct: 1.100, na_pct: 0.450, s_pct: 0.220, me_mj: 12.80, nel_mj: 7.60, notes: 'Commercial Dairy Pellets 18%' },
        { id: 3, name: 'Maize Silage', category: 'Silage', dm_pct: 35.00, cp_pct: 8.00, fat_pct: 3.00, fiber_pct: 23.00, ndf_pct: 45.00, adf_pct: 26.00, starch_pct: 32.00, sugar_pct: 2.00, ash_pct: 4.50, ca_pct: 0.250, p_pct: 0.220, mg_pct: 0.180, k_pct: 1.150, na_pct: 0.020, s_pct: 0.120, me_mj: 10.80, nel_mj: 6.40, notes: 'Chopped corn silage' },
        { id: 4, name: 'Grass/Forage', category: 'Forage / TMR', dm_pct: 25.00, cp_pct: 10.50, fat_pct: 2.50, fiber_pct: 30.00, ndf_pct: 55.00, adf_pct: 35.00, starch_pct: 2.00, sugar_pct: 8.50, ash_pct: 8.00, ca_pct: 0.400, p_pct: 0.250, mg_pct: 0.200, k_pct: 2.200, na_pct: 0.150, s_pct: 0.220, me_mj: 9.50, nel_mj: 5.60, notes: 'Fresh green pasture forage' },
        { id: 5, name: 'Alfalfa Hay', category: 'Forage / TMR', dm_pct: 88.00, cp_pct: 19.50, fat_pct: 2.20, fiber_pct: 28.00, ndf_pct: 40.00, adf_pct: 30.00, starch_pct: 2.50, sugar_pct: 6.00, ash_pct: 9.50, ca_pct: 1.400, p_pct: 0.280, mg_pct: 0.300, k_pct: 2.400, na_pct: 0.100, s_pct: 0.250, me_mj: 9.80, nel_mj: 5.90, notes: 'Premium legume hay' },
        { id: 6, name: 'Soybean Meal', category: 'Concentrate', dm_pct: 90.00, cp_pct: 48.00, fat_pct: 1.50, fiber_pct: 6.00, ndf_pct: 11.00, adf_pct: 8.00, starch_pct: 5.00, sugar_pct: 9.00, ash_pct: 6.50, ca_pct: 0.320, p_pct: 0.650, mg_pct: 0.280, k_pct: 2.100, na_pct: 0.040, s_pct: 0.450, me_mj: 13.50, nel_mj: 8.20, notes: 'Solvent extracted 48% protein meal' },
        { id: 7, name: 'Cottonseed (Whole)', category: 'By-product', dm_pct: 91.00, cp_pct: 23.00, fat_pct: 19.50, fiber_pct: 24.00, ndf_pct: 48.00, adf_pct: 38.00, starch_pct: 1.50, sugar_pct: 3.00, ash_pct: 4.80, ca_pct: 0.160, p_pct: 0.600, mg_pct: 0.380, k_pct: 1.250, na_pct: 0.050, s_pct: 0.240, me_mj: 14.20, nel_mj: 8.80, notes: 'Fuzzy whole cottonseed' }
    ],
    feed_logs: [
        {
            id: 1,
            cow_id: 1,
            log_date: '2026-10-08',
            total_as_fed_kg: 43.00,
            total_dm_kg: 19.70,
            total_cp_kg: 2.943,
            total_fat_kg: 0.685,
            total_fiber_kg: 3.396,
            total_ndf_kg: 6.677,
            total_adf_kg: 4.417,
            total_starch_kg: 4.503,
            total_sugar_kg: 1.026,
            total_ash_kg: 1.345,
            total_ca_g: 141.60,
            total_p_g: 86.29,
            total_mg_g: 47.92,
            total_k_g: 280.90,
            total_na_g: 61.27,
            total_s_g: 37.89,
            total_me_mj: 224.36,
            total_nel_mj: 134.86,
            notes: 'Balanced standard lactation diet entry',
            items: [
                { feed_id: 1, feed_name: 'TMR', amount_as_fed_kg: 25.00, dm_intake_kg: 11.25, cp_intake_kg: 1.800, fat_intake_kg: 0.394, fiber_intake_kg: 2.025, ndf_intake_kg: 3.938, ca_intake_g: 90.00, p_intake_g: 50.63 },
                { feed_id: 2, feed_name: 'Concentrate', amount_as_fed_kg: 5.00, dm_intake_kg: 4.40, cp_intake_kg: 0.792, fat_intake_kg: 0.176, fiber_intake_kg: 0.352, ndf_intake_kg: 0.792, ca_intake_g: 39.60, p_intake_g: 26.40 },
                { feed_id: 3, feed_name: 'Maize Silage', amount_as_fed_kg: 8.00, dm_intake_kg: 2.80, cp_intake_kg: 0.224, fat_intake_kg: 0.084, fiber_intake_kg: 0.644, ndf_intake_kg: 1.260, ca_intake_g: 7.00, p_intake_g: 6.16 },
                { feed_id: 4, feed_name: 'Grass/Forage', amount_as_fed_kg: 5.00, dm_intake_kg: 1.25, cp_intake_kg: 0.131, fat_intake_kg: 0.031, fiber_intake_kg: 0.375, ndf_intake_kg: 0.688, ca_intake_g: 5.00, p_intake_g: 3.13 }
            ]
        }
    ]
};

// Local Storage Manager for Vercel / Offline Demo
function getLocalStore() {
    let store = localStorage.getItem('farm_management_db');
    if (!store) {
        localStorage.setItem('farm_management_db', JSON.stringify(DEFAULT_SEED_DATA));
        return JSON.parse(JSON.stringify(DEFAULT_SEED_DATA));
    }
    let parsed = JSON.parse(store);
    // Auto-migrate existing store to include gender, updated breeds, and calves if needed
    if (parsed.cows && parsed.cows.length > 0) {
        let changed = false;
        parsed.cows.forEach(c => {
            if (!c.gender) {
                c.gender = (c.tag_number && (c.tag_number.startsWith('BULL') || c.name === 'Titan' || c.name === 'Thor')) ? 'Male' : 'Female';
                changed = true;
            }
            if (c.breed === 'Holstein Friesian') {
                c.breed = 'Frieglan';
                changed = true;
            }
        });
        if (!parsed.cows.some(c => c.gender === 'Male')) {
            parsed.cows.push({ id: 25, tag_number: 'BULL-101', name: 'Titan', breed: 'Frieglan', gender: 'Male', date_of_birth: '2020-05-18', source: 'purchased', parity: 0, reproductive_status: 'Breeding Sire', photo_url: 'assets/cow_5.jpg' });
            parsed.cows.push({ id: 26, tag_number: 'BULL-102', name: 'Thor', breed: 'Gir', gender: 'Male', date_of_birth: '2022-08-12', source: 'born on farm', parity: 0, reproductive_status: 'Young Bull', photo_url: 'assets/cow_3.jpg' });
            changed = true;
        }
        if (!parsed.cows.some(c => c.tag_number === 'CALF-100')) {
            parsed.cows.push({ id: 27, tag_number: 'CALF-100', name: 'Hope (Calf)', breed: 'Frieglan', gender: 'Female', date_of_birth: '2026-01-01', source: 'born on farm', parity: 0, reproductive_status: 'Heifer', photo_url: 'assets/cow_1.jpg' });
            parsed.cows.push({ id: 28, tag_number: 'CALF-201', name: 'Daisy Jr (Calf)', breed: 'Ayrshire', gender: 'Female', date_of_birth: '2026-06-01', source: 'born on farm', parity: 0, reproductive_status: 'Heifer', photo_url: 'assets/cow_2.jpg' });
            parsed.cows.push({ id: 29, tag_number: 'CALF-202', name: 'Thor Jr (Bull Calf)', breed: 'Gir', gender: 'Male', date_of_birth: '2026-06-15', source: 'born on farm', parity: 0, reproductive_status: 'Young Bull', photo_url: 'assets/cow_3.jpg' });
            if (!parsed.vaccinations) parsed.vaccinations = [];
            parsed.vaccinations.push({ id: 10, cow_id: 27, vaccine_name: 'HS Vaccine (Primary)', date_given: '2026-05-01', next_vaccination_date: '2026-08-01', treatment_type: 'HS Protocol Primary', status: 'Given' });
            parsed.vaccinations.push({ id: 11, cow_id: 27, vaccine_name: 'HS Vaccine (Secondary Booster)', date_given: '2026-08-01', next_vaccination_date: '2027-08-01', treatment_type: 'HS Secondary Booster', status: 'Given' });
            parsed.vaccinations.push({ id: 12, cow_id: 27, vaccine_name: 'BQ Vaccine (Primary)', date_given: '2026-05-01', next_vaccination_date: '2027-06-01', treatment_type: 'BQ Protocol Primary', status: 'Given' });
            changed = true;
        }
        if (!parsed.feeds || parsed.feeds.length === 0) {
            parsed.feeds = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.feeds));
            parsed.feed_logs = JSON.parse(JSON.stringify(DEFAULT_SEED_DATA.feed_logs));
            changed = true;
        }
        if (changed) {
            saveLocalStore(parsed);
        }
    }
    return parsed;
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

// Helper: Add months to YYYY-MM-DD string
function addMonthsToDate(dateStr, months) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1 + months, d);
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const da = String(date.getDate()).padStart(2, '0');
    return `${yr}-${mo}-${da}`;
}

// Calculate automated HS & BQ vaccination schedule for a cow
function calculateVaccineSchedule(cow, existingVaccinations = []) {
    const dob = cow ? cow.date_of_birth : null;
    if (!dob) return { hs: [], bq: [] };

    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    let hsGivenPrimary = null;
    let hsGivenSecondary = null;
    let bqGivenPrimary = null;
    let bqGivenSecondary = null;

    (existingVaccinations || []).forEach(v => {
        const name = (v.vaccine_name || '').toLowerCase();
        const type = (v.treatment_type || '').toLowerCase();
        if (name.includes('hs') || name.includes('haemorrhagic') || type.includes('hs')) {
            if (name.includes('primary') || type.includes('primary')) hsGivenPrimary = v;
            else if (name.includes('secondary') || type.includes('secondary')) hsGivenSecondary = v;
        }
        if (name.includes('bq') || name.includes('blackquarter') || type.includes('bq')) {
            if (name.includes('primary') || type.includes('primary')) bqGivenPrimary = v;
            else if (name.includes('secondary') || type.includes('secondary')) bqGivenSecondary = v;
        }
    });

    // 1. HS Vaccine Schedule
    // Primary: 4 months from DOB
    const hsPrimaryDate = addMonthsToDate(dob, 4);
    // Secondary: 3 months from Primary (actual given or scheduled)
    const hsBasePrimary = (hsGivenPrimary && hsGivenPrimary.date_given) ? hsGivenPrimary.date_given : hsPrimaryDate;
    const hsSecondaryDate = addMonthsToDate(hsBasePrimary, 3);
    const hsBaseSecondary = (hsGivenSecondary && hsGivenSecondary.date_given) ? hsGivenSecondary.date_given : hsSecondaryDate;

    const hs = [
        {
            stage: 'Primary',
            vaccine_code: 'HS',
            vaccine_name: 'HS Vaccine (Primary)',
            due_date: hsPrimaryDate,
            next_due_date: hsSecondaryDate,
            treatment_type: 'HS Protocol Primary',
            description: 'Primary dose at 4 months of age (protects against Haemorrhagic Septicaemia)'
        },
        {
            stage: 'Secondary',
            vaccine_code: 'HS',
            vaccine_name: 'HS Vaccine (Secondary Booster)',
            due_date: hsSecondaryDate,
            next_due_date: addMonthsToDate(hsBaseSecondary, 12),
            treatment_type: 'HS Secondary Booster',
            description: 'Secondary booster dose 3 months after primary'
        }
    ];

    // Annual Boosters every 1 year from secondary
    const secDateObj = new Date(hsBaseSecondary);
    const diffYears = Math.max(1, Math.floor((today - secDateObj) / (365.25 * 86400000)) + 1);
    for (let i = 1; i <= diffYears + 1; i++) {
        const annDate = addMonthsToDate(hsBaseSecondary, 12 * i);
        const nextAnnDate = addMonthsToDate(hsBaseSecondary, 12 * (i + 1));
        const yr = annDate.split('-')[0];
        hs.push({
            stage: `Annual ${i}`,
            vaccine_code: 'HS',
            vaccine_name: `HS Vaccine (Annual Booster ${yr})`,
            due_date: annDate,
            next_due_date: nextAnnDate,
            treatment_type: `HS Annual Booster ${yr}`,
            description: `Annual booster dose every 1 year from secondary booster`
        });
    }

    // 2. BQ Vaccine Schedule
    // Primary: 4 months from DOB
    const bqPrimaryDate = addMonthsToDate(dob, 4);
    // Secondary: 13 months from Primary (actual given or scheduled)
    const bqBasePrimary = (bqGivenPrimary && bqGivenPrimary.date_given) ? bqGivenPrimary.date_given : bqPrimaryDate;
    const bqSecondaryDate = addMonthsToDate(bqBasePrimary, 13);
    const bqBaseSecondary = (bqGivenSecondary && bqGivenSecondary.date_given) ? bqGivenSecondary.date_given : bqSecondaryDate;

    const bq = [
        {
            stage: 'Primary',
            vaccine_code: 'BQ',
            vaccine_name: 'BQ Vaccine (Primary)',
            due_date: bqPrimaryDate,
            next_due_date: bqSecondaryDate,
            treatment_type: 'BQ Protocol Primary',
            description: 'Primary dose at 4 months of age (protects against Blackquarter)'
        },
        {
            stage: 'Secondary',
            vaccine_code: 'BQ',
            vaccine_name: 'BQ Vaccine (Secondary Booster)',
            due_date: bqSecondaryDate,
            next_due_date: addMonthsToDate(bqBaseSecondary, 22),
            treatment_type: 'BQ Secondary Booster',
            description: 'Secondary booster dose 13 months after primary'
        }
    ];

    // Periodic Boosters every 22 months from secondary
    const diffMonths = Math.max(22, Math.floor((today - secDateObj) / (30.4 * 86400000)));
    const numBoosters = Math.max(2, Math.ceil(diffMonths / 22) + 1);
    for (let i = 1; i <= numBoosters; i++) {
        const periodicDate = addMonthsToDate(bqBaseSecondary, 22 * i);
        const nextPeriodicDate = addMonthsToDate(bqBaseSecondary, 22 * (i + 1));
        const yr = periodicDate.split('-')[0];
        bq.push({
            stage: `Periodic ${i}`,
            vaccine_code: 'BQ',
            vaccine_name: `BQ Vaccine (22-Month Booster ${yr})`,
            due_date: periodicDate,
            next_due_date: nextPeriodicDate,
            treatment_type: `BQ 22-Month Booster ${yr}`,
            description: `Periodic booster dose every 22 months from secondary booster`
        });
    }

    const evaluate = (list) => {
        list.forEach(item => {
            let isGiven = false;
            let dateGiven = null;
            (existingVaccinations || []).forEach(v => {
                const vName = (v.vaccine_name || '').toLowerCase();
                const vType = (v.treatment_type || '').toLowerCase();
                if (vName.includes(item.vaccine_code.toLowerCase()) || vType.includes(item.vaccine_code.toLowerCase())) {
                    if (vName.includes(item.stage.toLowerCase()) ||
                        vType.includes(item.stage.toLowerCase()) ||
                        Math.abs(new Date(v.date_given) - new Date(item.due_date)) < 45 * 86400000) {
                        isGiven = true;
                        dateGiven = v.date_given;
                    }
                }
            });

            const dueDt = new Date(item.due_date);
            const daysDiff = Math.round((dueDt - today) / 86400000);

            item.is_given = isGiven;
            item.date_given = dateGiven;
            item.days_until_due = daysDiff;

            if (isGiven) {
                item.status = 'Given';
                item.badge_class = 'badge-green';
            } else if (daysDiff < 0) {
                item.status = 'Overdue';
                item.badge_class = 'badge-red';
            } else if (daysDiff <= 14) {
                item.status = 'Due Soon';
                item.badge_class = 'badge-teal';
            } else {
                item.status = 'Upcoming';
                item.badge_class = 'badge-slate';
            }
        });
    };

    evaluate(hs);
    evaluate(bq);

    return { hs, bq };
}

function toggleOtherDiseaseInput(checked) {
    const el = document.getElementById('healthDiseaseOther');
    if (el) {
        el.style.display = checked ? 'block' : 'none';
        if (checked) el.focus();
        else el.value = '';
    }
}

async function onHealthCowChange(cowId) {
    const banner = document.getElementById('healthCowVaxBanner');
    if (!banner) return;
    if (!cowId) {
        banner.style.display = 'none';
        banner.innerHTML = '';
        return;
    }

    let cow = cowsCache.find(c => c.id == cowId);
    let vaxes = [];
    if (isServerMode) {
        try {
            const res = await fetch(`${API_BASE}/cows.php?id=${cowId}`);
            if (res.ok) {
                const data = await res.json();
                cow = data;
                vaxes = data.vaccination_history || [];
            }
        } catch (e) {}
    } else {
        const store = getLocalStore();
        if (!cow) cow = (store.cows || []).find(c => c.id == cowId);
        vaxes = (store.vaccinations || []).filter(v => v.cow_id == cowId);
    }

    if (!cow || !cow.date_of_birth) {
        banner.style.display = 'none';
        return;
    }

    const sched = calculateVaccineSchedule(cow, vaxes);
    const nextHs = sched.hs.find(m => !m.is_given) || sched.hs[sched.hs.length - 1];
    const nextBq = sched.bq.find(m => !m.is_given) || sched.bq[sched.bq.length - 1];

    banner.style.display = 'block';
    banner.innerHTML = `
        <div class="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 rounded-xl p-2.5 text-xs shadow-xs">
            <div class="flex items-center justify-between mb-1.5 pb-1 border-b border-teal-100 font-bold text-teal-950">
                <span class="flex items-center gap-1.5">
                    <i class="fa-solid fa-shield-virus text-teal-600"></i>
                    Vaccine Protocol Status (HS & BQ)
                </span>
                <button type="button" class="text-[11px] text-teal-700 hover:text-teal-900 underline font-semibold" onclick="closeModal('modalLogHealth'); openLogVaccineModal(${cow.id})">
                    + Log Vaccine &rarr;
                </button>
            </div>
            <div class="space-y-1">
                <div class="flex items-center justify-between">
                    <span class="text-slate-600 font-medium">HS Vaccine:</span>
                    <span class="flex items-center gap-1.5">
                        <span class="text-slate-700 font-semibold">${nextHs.stage} (Due: ${nextHs.due_date})</span>
                        <span class="status-badge ${nextHs.badge_class}">${nextHs.status}</span>
                    </span>
                </div>
                <div class="flex items-center justify-between">
                    <span class="text-slate-600 font-medium">BQ Vaccine:</span>
                    <span class="flex items-center gap-1.5">
                        <span class="text-slate-700 font-semibold">${nextBq.stage} (Due: ${nextBq.due_date})</span>
                        <span class="status-badge ${nextBq.badge_class}">${nextBq.status}</span>
                    </span>
                </div>
            </div>
        </div>
    `;
}

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    initBreedSelect();
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

    const screenContent = document.querySelector('.screen-content');
    if (screenContent) screenContent.scrollTop = 0;

    try {
        if (tabName === 'dashboard') loadDashboard();
        if (tabName === 'herd') loadCows();
        if (tabName === 'milk') loadMilkLogs();
        if (tabName === 'feed') loadFeedModule();
        if (tabName === 'breeding') loadBreedingData();
        if (tabName === 'health') loadHealthAndVax();
        if (tabName === 'alerts') loadAllAlerts();
    } catch (e) {
        console.error('Error loading tab ' + tabName, e);
    }
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
                latest_milk: c.id === 5 ? 10.2 : (c.parity > 0 && c.gender !== 'Male' ? 16.5 : null),
                latest_drop_pct: c.id === 5 ? 18.4 : null
            }));

            if (statusFilter && statusFilter !== 'All') {
                if (statusFilter === 'Female' || statusFilter === 'Male') {
                    cows = cows.filter(c => (c.gender || 'Female') === statusFilter);
                } else if (statusFilter === 'Born' || statusFilter === 'born on farm') {
                    cows = cows.filter(c => (c.source || '').toLowerCase().includes('born'));
                } else if (statusFilter === 'Purchased' || statusFilter === 'purchased') {
                    cows = cows.filter(c => (c.source || '').toLowerCase().includes('purchas'));
                } else {
                    cows = cows.filter(c => c.reproductive_status === statusFilter);
                }
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
        const isMale = (cow.gender === 'Male');
        const isBorn = (cow.source || '').toLowerCase().includes('born');
        const avatar = isMale ? '🐂' : '🐄';
        const genderBadge = isMale 
            ? `<span class="status-badge bg-blue-100 text-blue-700 border border-blue-200 ml-1.5"><i class="fa-solid fa-mars"></i> Bull</span>` 
            : `<span class="status-badge bg-pink-100 text-pink-700 border border-pink-200 ml-1.5"><i class="fa-solid fa-venus"></i> Female</span>`;

        const sourceBadge = isBorn 
            ? `<span class="status-badge bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1"><i class="fa-solid fa-seedling mr-0.5"></i> Born</span>`
            : `<span class="status-badge bg-amber-50 text-amber-700 border border-amber-200 ml-1"><i class="fa-solid fa-cart-shopping mr-0.5"></i> Purchased</span>`;

        let badgeColor = 'badge-gray';
        if (cow.reproductive_status === 'In heat') badgeColor = 'badge-yellow';
        if (cow.reproductive_status === 'Pregnant') badgeColor = 'badge-green';
        if (cow.reproductive_status === 'Fresh') badgeColor = 'badge-blue';
        if (cow.reproductive_status === 'Dry') badgeColor = 'badge-orange';
        if (cow.reproductive_status === 'Breeding Sire' || cow.reproductive_status === 'Young Bull') badgeColor = 'badge-blue';
        if (cow.reproductive_status === 'Heifer') badgeColor = 'badge-purple';

        const dropBadge = (cow.latest_drop_pct && parseFloat(cow.latest_drop_pct) >= 10 && !isMale) ?
            `<span class="status-badge badge-red ml-1"><i class="fa-solid fa-arrow-trend-down"></i> -${cow.latest_drop_pct}%</span>` : '';

        return `
            <div class="cow-item" onclick="openCowDetail(${cow.id})">
                <div class="flex items-center">
                    <div class="cow-avatar">${avatar}</div>
                    <div class="cow-info">
                        <div class="flex items-center flex-wrap gap-1">
                            <span class="cow-tag">${cow.tag_number}</span>
                            ${genderBadge}
                            ${sourceBadge}
                            <span class="status-badge ${badgeColor}">${cow.reproductive_status}</span>
                            ${dropBadge}
                        </div>
                        <div class="cow-name">${cow.name} &bull; <span class="text-slate-600">${cow.breed}</span></div>
                        <div class="cow-meta">Age: ${cow.age_display} ${isMale ? `&bull; <span class="text-blue-700 font-semibold">Sire / Bull</span>` : `&bull; Parity: ${cow.parity}`} &bull; <span class="text-slate-500 font-medium">${isBorn ? '🌱 Born on farm' : '🏷️ Purchased'}</span> ${cow.latest_milk && !isMale ? `&bull; Latest: ${cow.latest_milk}L` : ''}</div>
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

        const isMale = (cow.gender === 'Male');
        document.getElementById('detailTag').innerText = cow.tag_number;
        document.getElementById('detailName').innerText = `${cow.name} (${cow.breed})`;
        document.getElementById('detailStatus').innerText = cow.reproductive_status;
        document.getElementById('detailAge').innerText = cow.age_display;
        document.getElementById('detailParity').innerText = isMale ? 'N/A' : `Lactation #${cow.parity}`;
        document.getElementById('detailSource').innerText = cow.source;
        document.getElementById('detailDob').innerText = cow.date_of_birth;

        const detailGenderEl = document.getElementById('detailGender');
        if (detailGenderEl) {
            detailGenderEl.innerHTML = isMale 
                ? '<span class="text-blue-700 font-bold"><i class="fa-solid fa-mars"></i> Male</span>' 
                : '<span class="text-pink-700 font-bold"><i class="fa-solid fa-venus"></i> Female</span>';
        }
        const parityBox = document.getElementById('detailParityBox');
        if (parityBox) {
            parityBox.style.display = isMale ? 'none' : 'block';
        }
        activeCowDetailId = cowId;
        cowDetailActivePeriod = 'daily';
        document.querySelectorAll('#cowDetailMilkPeriodTabs .filter-chip').forEach(c => {
            c.classList.toggle('active', c.getAttribute('data-period') === 'daily');
        });
        renderCowDetailMilkHistory(cowId, 'daily');

        // Render Recent Feed Intake
        const feedContainer = document.getElementById('detailFeedHistory');
        if (feedContainer) {
            let cowFeedLogs = cow.feed_history || [];
            if (!cowFeedLogs.length && !isServerMode) {
                const store = getLocalStore();
                cowFeedLogs = (store.feed_logs || []).filter(l => l.cow_id == cowId);
            }
            if (cowFeedLogs.length > 0) {
                feedContainer.innerHTML = cowFeedLogs.slice(0, 3).map(fl => `
                    <div class="py-2 px-2.5 bg-amber-50/60 border border-amber-200/80 rounded-xl mb-1.5 text-xs">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-amber-950">${fl.log_date}</span>
                            <span class="font-bold text-amber-800 text-[11px]">${parseFloat(fl.total_as_fed_kg).toFixed(2)} kg As-Fed</span>
                        </div>
                        <div class="grid grid-cols-4 gap-1 text-[10px] text-slate-600 bg-white p-1.5 rounded-lg border border-amber-100 text-center">
                            <div><span class="text-slate-400 block text-[9px]">DMI</span><b>${parseFloat(fl.total_dm_kg).toFixed(2)} kg</b></div>
                            <div><span class="text-slate-400 block text-[9px]">CP</span><b>${parseFloat(fl.total_cp_kg).toFixed(2)} kg</b></div>
                            <div><span class="text-slate-400 block text-[9px]">Ca</span><b>${parseFloat(fl.total_ca_g).toFixed(1)} g</b></div>
                            <div><span class="text-slate-400 block text-[9px]">P</span><b>${parseFloat(fl.total_p_g).toFixed(1)} g</b></div>
                        </div>
                    </div>
                `).join('');
            } else {
                feedContainer.innerHTML = `<p class="text-xs text-slate-400 py-1.5">No recent feeding records found.</p>`;
            }
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
        const sched = cow.vaccine_schedule || calculateVaccineSchedule(cow, cow.vaccination_history || []);

        let html = '';

        // 1. HS Vaccine Protocol Timeline
        html += `
            <div class="mb-3 bg-teal-50/50 border border-teal-200/80 rounded-xl p-2.5">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                        <i class="fa-solid fa-shield-virus text-teal-600"></i> Haemorrhagic Septicaemia (HS) Protocol
                    </span>
                    <span class="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">4mo &bull; +3mo &bull; Annual</span>
                </div>
                <div class="space-y-1.5">
                    ${sched.hs.map(m => `
                        <div class="flex items-center justify-between p-1.5 bg-white rounded-lg border border-teal-100 text-xs">
                            <div>
                                <div class="font-bold text-slate-800">${m.vaccine_name}</div>
                                <div class="text-[10px] text-slate-500">${m.description} &bull; Due: <b>${m.due_date}</b></div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="status-badge ${m.badge_class}">${m.status}</span>
                                ${!m.is_given ? `
                                    <button class="px-2 py-1 bg-slate-800 text-white rounded text-[10px] font-bold hover:bg-slate-700" onclick="closeModal('modalCowDetail'); openLogVaccineModal(${cow.id}, '${m.vaccine_name}', '${m.due_date}', '${m.next_due_date}', '${m.treatment_type}')">
                                        Record &rarr;
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 2. BQ Vaccine Protocol Timeline
        html += `
            <div class="mb-3 bg-blue-50/50 border border-blue-200/80 rounded-xl p-2.5">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <i class="fa-solid fa-syringe text-blue-600"></i> Blackquarter (BQ) Protocol
                    </span>
                    <span class="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">4mo &bull; +13mo &bull; 22mo</span>
                </div>
                <div class="space-y-1.5">
                    ${sched.bq.map(m => `
                        <div class="flex items-center justify-between p-1.5 bg-white rounded-lg border border-blue-100 text-xs">
                            <div>
                                <div class="font-bold text-slate-800">${m.vaccine_name}</div>
                                <div class="text-[10px] text-slate-500">${m.description} &bull; Due: <b>${m.due_date}</b></div>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <span class="status-badge ${m.badge_class}">${m.status}</span>
                                ${!m.is_given ? `
                                    <button class="px-2 py-1 bg-slate-800 text-white rounded text-[10px] font-bold hover:bg-slate-700" onclick="closeModal('modalCowDetail'); openLogVaccineModal(${cow.id}, '${m.vaccine_name}', '${m.due_date}', '${m.next_due_date}', '${m.treatment_type}')">
                                        Record &rarr;
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 3. Other Logged Vaccines
        if (cow.vaccination_history && cow.vaccination_history.length > 0) {
            html += `
                <div class="text-[11px] font-bold text-slate-600 mb-1">Other Recorded Vaccinations:</div>
                <div class="space-y-1">
                    ${cow.vaccination_history.map(v => `
                        <div class="flex justify-between py-1.5 px-2 bg-slate-50 border border-slate-100 rounded-lg text-xs">
                            <div>
                                <span class="font-bold text-slate-700">${v.vaccine_name}</span>
                                <span class="text-[10px] text-slate-400 block">Given: ${v.date_given} &bull; Next Due: ${v.next_vaccination_date}</span>
                            </div>
                            <span class="status-badge ${v.status === 'Due' ? 'badge-teal' : 'badge-green'}">${v.status}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        vaxContainer.innerHTML = html;

        openModal('modalCowDetail');
    } catch (e) {
        showToast('Failed to load cow details', true);
    }
}

// Individual Cow 360 Drawer - Milk Period Toggle
let cowDetailActivePeriod = 'daily';

async function switchCowDetailMilkPeriod(period, btn) {
    cowDetailActivePeriod = period;
    document.querySelectorAll('#cowDetailMilkPeriodTabs .filter-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    if (activeCowDetailId) {
        await renderCowDetailMilkHistory(activeCowDetailId, period);
    }
}

async function renderCowDetailMilkHistory(cowId, period = 'daily') {
    const container = document.getElementById('detailMilkHistory');
    if (!container) return;
    container.innerHTML = `<div class="py-2 text-center text-xs text-slate-400"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Loading ${period} records...</div>`;

    try {
        let records = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/milk.php?cow_id=${cowId}&period=${period}&limit=30`);
            const data = await res.json();
            records = data.records || [];
        } else {
            const store = getLocalStore();
            const raw = store.milk.filter(m => m.cow_id == cowId);
            if (period === 'weekly') {
                records = aggregateMilkWeekly(raw);
            } else if (period === 'monthly') {
                records = aggregateMilkMonthly(raw);
            } else {
                records = raw.sort((a,b) => (b.record_date > a.record_date ? 1 : -1));
            }
        }

        if (records.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 py-2 text-center">No ${period} milk records found for this cow.</p>`;
            return;
        }

        if (period === 'weekly') {
            container.innerHTML = records.map(w => `
                <div class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                    <div>
                        <div class="font-bold text-slate-800">${w.period_label}</div>
                        <div class="text-[10px] text-slate-500">M: ${w.morning_total || 0}L &bull; E: ${w.evening_total || 0}L (${w.days_recorded} days)</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-emerald-700">${w.total_yield} L</div>
                        <div class="text-[10px] text-slate-500">Avg: ${w.avg_daily_yield} L/day</div>
                    </div>
                </div>
            `).join('');
        } else if (period === 'monthly') {
            container.innerHTML = records.map(m => `
                <div class="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                    <div>
                        <div class="font-bold text-slate-800">${m.period_label}</div>
                        <div class="text-[10px] text-slate-500">${m.days_recorded} milking days recorded</div>
                    </div>
                    <div class="text-right">
                        <div class="font-bold text-emerald-700">${m.total_yield} L</div>
                        <div class="text-[10px] text-amber-700 font-semibold">Peak: ${m.max_day_yield || 0} L &bull; Avg: ${m.avg_daily_yield} L/d</div>
                    </div>
                </div>
            `).join('');
        } else {
            // Daily
            container.innerHTML = records.map(m => `
                <div class="flex justify-between py-1.5 border-b border-slate-100 text-xs">
                    <span>${m.record_date}</span>
                    <span class="font-bold">${m.total_yield} L <span class="text-slate-400 font-normal">(${m.morning_yield}M / ${m.evening_yield}E)</span></span>
                    ${m.drop_percentage >= 10 ? `<span class="status-badge badge-red">-${m.drop_percentage}%</span>` : `<span class="text-slate-400 text-[11px]">Normal</span>`}
                </div>
            `).join('');
        }
    } catch (err) {
        container.innerHTML = `<p class="text-xs text-red-500 py-2">Failed to load milk records.</p>`;
    }
}

// 3. Milk Production View (Daily, Weekly, Monthly for Individual Cows or All Herd)
let currentMilkPeriod = 'daily';
let selectedMilkCowId = 0;

function populateMilkCowFilter() {
    const sel = document.getElementById('milkCowFilterSelect');
    if (!sel) return;
    const current = sel.value || '0';
    let options = `<option value="0">🐄 All Herd (Farm View)</option>`;

    let cowsList = cowsCache;
    if (!cowsList || cowsList.length === 0) {
        const store = getLocalStore();
        cowsList = store.cows || [];
    }

    const milkingCows = cowsList.filter(c => (c.gender || 'Female') === 'Female');
    milkingCows.forEach(c => {
        options += `<option value="${c.id}">${c.tag_number} - ${c.name} (${c.breed})</option>`;
    });
    sel.innerHTML = options;
    sel.value = current;
}

function onMilkCowFilterChange(cowId) {
    selectedMilkCowId = parseInt(cowId) || 0;
    loadMilkLogs();
}

function switchMilkPeriod(period, btn) {
    currentMilkPeriod = period;
    document.querySelectorAll('#milkPeriodTabs .filter-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const titleEl = document.getElementById('milkViewTitle');
    if (titleEl) {
        if (period === 'daily') titleEl.innerText = selectedMilkCowId > 0 ? 'Individual Daily Production' : 'Daily Production Logs';
        else if (period === 'weekly') titleEl.innerText = selectedMilkCowId > 0 ? 'Weekly Milk Totals & Averages' : 'Herd Weekly Production Summary';
        else if (period === 'monthly') titleEl.innerText = selectedMilkCowId > 0 ? 'Monthly Milk Totals & Peak Yield' : 'Herd Monthly Production Summary';
    }
    loadMilkLogs();
}

function aggregateMilkWeekly(records) {
    const map = {};
    records.forEach(r => {
        const d = new Date(r.record_date);
        const oneJan = new Date(d.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((d - oneJan) / 86400000) + oneJan.getDay() + 1) / 7);
        const key = `${r.cow_id || 0}_${d.getFullYear()}_W${weekNum}`;
        if (!map[key]) {
            map[key] = {
                cow_id: r.cow_id,
                tag_number: r.tag_number,
                name: r.name,
                breed: r.breed,
                period_label: `Week ${weekNum} (${d.getFullYear()})`,
                total_yield: 0,
                morning_total: 0,
                evening_total: 0,
                max_day_yield: 0,
                days_recorded: 0
            };
        }
        map[key].total_yield += parseFloat(r.total_yield || 0);
        map[key].morning_total += parseFloat(r.morning_yield || 0);
        map[key].evening_total += parseFloat(r.evening_yield || 0);
        map[key].max_day_yield = Math.max(map[key].max_day_yield, parseFloat(r.total_yield || 0));
        map[key].days_recorded += 1;
    });
    return Object.values(map).map(item => ({
        ...item,
        total_yield: Math.round(item.total_yield * 100) / 100,
        avg_daily_yield: Math.round((item.total_yield / item.days_recorded) * 100) / 100,
        morning_total: Math.round(item.morning_total * 100) / 100,
        evening_total: Math.round(item.evening_total * 100) / 100
    }));
}

function aggregateMilkMonthly(records) {
    const map = {};
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    records.forEach(r => {
        const d = new Date(r.record_date);
        const key = `${r.cow_id || 0}_${d.getFullYear()}_${d.getMonth()}`;
        if (!map[key]) {
            map[key] = {
                cow_id: r.cow_id,
                tag_number: r.tag_number,
                name: r.name,
                breed: r.breed,
                period_label: `${months[d.getMonth()]} ${d.getFullYear()}`,
                total_yield: 0,
                morning_total: 0,
                evening_total: 0,
                max_day_yield: 0,
                days_recorded: 0
            };
        }
        map[key].total_yield += parseFloat(r.total_yield || 0);
        map[key].morning_total += parseFloat(r.morning_yield || 0);
        map[key].evening_total += parseFloat(r.evening_yield || 0);
        map[key].max_day_yield = Math.max(map[key].max_day_yield, parseFloat(r.total_yield || 0));
        map[key].days_recorded += 1;
    });
    return Object.values(map).map(item => ({
        ...item,
        total_yield: Math.round(item.total_yield * 100) / 100,
        avg_daily_yield: Math.round((item.total_yield / item.days_recorded) * 100) / 100,
        morning_total: Math.round(item.morning_total * 100) / 100,
        evening_total: Math.round(item.evening_total * 100) / 100
    }));
}

async function loadMilkLogs() {
    populateMilkCowFilter();
    const period = currentMilkPeriod || 'daily';
    const cowId = selectedMilkCowId || 0;

    const indivBox = document.getElementById('individualCowStatsBox');
    const farmKpis = document.getElementById('farmMilkKpiStrip');
    const cowBadge = document.getElementById('selectedCowBadge');
    const container = document.getElementById('milkLogsContainer');

    try {
        let stats, records, cowInfo, cowStats;
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/milk.php?cow_id=${cowId}&period=${period}&limit=60`);
            const data = await res.json();
            stats = data.stats;
            records = data.records;
            cowInfo = data.cow_info;
            cowStats = data.cow_stats;
        } else {
            const store = getLocalStore();
            stats = { daily_average: 16.6, weekly_average: 185.1, monthly_average: 173.0 };
            let raw = store.milk.map(m => {
                const cow = store.cows.find(c => c.id == m.cow_id) || {};
                return { ...m, tag_number: cow.tag_number || 'COW', name: cow.name || 'Cow', breed: cow.breed || '' };
            });
            if (cowId > 0) {
                raw = raw.filter(m => m.cow_id == cowId);
                const cow = store.cows.find(c => c.id == cowId);
                cowInfo = cow;
                const total = raw.reduce((sum, r) => sum + (parseFloat(r.total_yield) || 0), 0);
                const avg = raw.length > 0 ? (total / raw.length) : 0;
                const peak = raw.reduce((max, r) => Math.max(max, (parseFloat(r.total_yield) || 0)), 0);
                cowStats = {
                    total_yield: total.toFixed(2),
                    avg_yield: avg.toFixed(2),
                    peak_yield: peak.toFixed(2),
                    days_count: raw.length
                };
            }
            if (period === 'weekly') {
                records = aggregateMilkWeekly(raw);
            } else if (period === 'monthly') {
                records = aggregateMilkMonthly(raw);
            } else {
                records = raw.sort((a,b) => (b.record_date > a.record_date ? 1 : -1));
            }
        }

        if (stats) {
            const dAvg = document.getElementById('milkDailyAvg');
            const wAvg = document.getElementById('milkWeeklyAvg');
            const mAvg = document.getElementById('milkMonthlyAvg');
            if (dAvg) dAvg.innerText = `${stats.daily_average} L`;
            if (wAvg) wAvg.innerText = `${stats.weekly_average} L`;
            if (mAvg) mAvg.innerText = `${stats.monthly_average} L`;
        }

        // Handle Individual Cow Stats display
        if (cowId > 0 && cowInfo) {
            if (cowBadge) cowBadge.innerText = `${cowInfo.tag_number} (${cowInfo.name})`;
            if (indivBox) {
                indivBox.style.display = 'block';
                document.getElementById('indivCowTitle').innerText = `${cowInfo.tag_number} - ${cowInfo.name}`;
                document.getElementById('indivCowBreed').innerText = cowInfo.breed || 'Cow';
                document.getElementById('indivCowStatus').innerText = cowInfo.reproductive_status || 'Milking';
                if (cowStats) {
                    document.getElementById('indivTotalYield').innerText = `${cowStats.total_yield} L`;
                    document.getElementById('indivAvgYield').innerText = `${cowStats.avg_yield} L`;
                    document.getElementById('indivPeakYield').innerText = `${cowStats.peak_yield} L`;
                }
            }
            if (farmKpis) farmKpis.style.display = 'none';
        } else {
            if (cowBadge) cowBadge.innerText = 'All Herd';
            if (indivBox) indivBox.style.display = 'none';
            if (farmKpis) farmKpis.style.display = 'grid';
        }

        if (!container) return;

        if (!records || records.length === 0) {
            container.innerHTML = `<div class="text-center py-8 text-slate-400 text-xs">No ${period} milk records found.</div>`;
            return;
        }

        if (period === 'weekly') {
            container.innerHTML = records.map(r => `
                <div class="cow-item">
                    <div class="cow-info">
                        <div class="flex items-center justify-between">
                            <span class="status-badge badge-blue"><i class="fa-solid fa-calendar-week mr-1"></i> ${r.period_label}</span>
                            ${cowId === 0 ? `<span class="cow-tag ml-auto">${r.tag_number || ''} ${r.name || ''}</span>` : `<span class="text-xs text-slate-400 ml-auto">${r.days_recorded} days logged</span>`}
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-xs text-slate-600">Morning: <b>${r.morning_total || 0}L</b> &bull; Evening: <b>${r.evening_total || 0}L</b></span>
                            <span class="text-sm font-bold text-emerald-800">${r.total_yield} Liters</span>
                        </div>
                        <div class="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                            <span>Daily Avg: <b class="text-slate-700">${r.avg_daily_yield} L/day</b></span>
                            ${r.max_day_yield ? `<span class="text-amber-700"><i class="fa-solid fa-star text-[9px]"></i> Peak: ${r.max_day_yield}L</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else if (period === 'monthly') {
            container.innerHTML = records.map(r => `
                <div class="cow-item">
                    <div class="cow-info">
                        <div class="flex items-center justify-between">
                            <span class="status-badge badge-green"><i class="fa-solid fa-chart-line mr-1"></i> ${r.period_label}</span>
                            ${cowId === 0 ? `<span class="cow-tag ml-auto">${r.tag_number || ''} ${r.name || ''}</span>` : `<span class="text-xs text-slate-400 ml-auto">${r.days_recorded} days logged</span>`}
                        </div>
                        <div class="flex items-center justify-between mt-2">
                            <span class="text-xs text-slate-600">Daily Average: <b class="text-emerald-700">${r.avg_daily_yield} L/day</b></span>
                            <span class="text-sm font-bold text-slate-800">${r.total_yield} Liters</span>
                        </div>
                        <div class="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                            <span>Morning: <b>${r.morning_total || 0}L</b> &bull; Evening: <b>${r.evening_total || 0}L</b></span>
                            ${r.max_day_yield ? `<span class="text-amber-700 font-semibold"><i class="fa-solid fa-star text-[9px]"></i> Peak: ${r.max_day_yield}L</span>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            // Daily
            container.innerHTML = records.map(r => {
                const isDrop = r.drop_percentage && parseFloat(r.drop_percentage) >= 10;
                return `
                    <div class="cow-item ${isDrop ? 'border-red-300 bg-red-50/40' : ''}">
                        <div class="cow-info">
                            <div class="flex items-center">
                                <span class="cow-tag">${r.tag_number || (cowInfo ? cowInfo.tag_number : 'COW')}</span>
                                <span class="text-xs text-slate-600 font-medium ml-2">${r.name || (cowInfo ? cowInfo.name : '')}</span>
                                <span class="text-xs text-slate-400 ml-auto">${r.record_date}</span>
                            </div>
                            <div class="flex items-center justify-between mt-1.5">
                                <span class="text-xs text-slate-600">Morning: <b>${r.morning_yield}L</b> &bull; Evening: <b>${r.evening_yield}L</b></span>
                                <span class="text-sm font-bold text-slate-800">${r.total_yield} Liters</span>
                            </div>
                            ${isDrop ? `
                                <div class="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                                    <i class="fa-solid fa-triangle-exclamation"></i>
                                    Drop: -${r.drop_percentage}% vs previous (${r.yesterday_yield}L)
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
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
        let allCows = [];
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/vaccines.php`);
            const data = await res.json();
            vaccinations = data.vaccinations || [];
            allCows = cowsCache || [];
        } else {
            const store = getLocalStore();
            allCows = store.cows || [];
            vaccinations = (store.vaccinations || []).map(v => {
                const cow = allCows.find(c => c.id == v.cow_id) || {};
                return { ...v, tag_number: cow.tag_number, name: cow.name };
            });
        }

        // Calculate upcoming / overdue protocol milestones across herd
        const herdMilestones = [];
        allCows.forEach(c => {
            if (!c.date_of_birth) return;
            const cVaxes = vaccinations.filter(v => v.cow_id == c.id);
            const s = calculateVaccineSchedule(c, cVaxes);
            s.hs.forEach(m => {
                if (!m.is_given) herdMilestones.push({ ...m, cow: c });
            });
            s.bq.forEach(m => {
                if (!m.is_given) herdMilestones.push({ ...m, cow: c });
            });
        });

        herdMilestones.sort((a, b) => a.days_until_due - b.days_until_due);
        const urgentMilestones = herdMilestones.filter(m => m.status === 'Overdue' || m.status === 'Due Soon');

        let vaxHtml = `
            <!-- Protocol Summary Card -->
            <div class="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/90 rounded-2xl p-3.5 mb-3 shadow-xs">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                        <i class="fa-solid fa-shield-virus text-teal-600"></i> Herd Vaccination Protocols (HS & BQ)
                    </span>
                    <button class="px-2.5 py-1 bg-teal-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-teal-700" onclick="openLogVaccineModal()">
                        <i class="fa-solid fa-plus mr-1"></i> Log Vaccine
                    </button>
                </div>
                <div class="text-[11px] text-teal-900 bg-white/80 rounded-xl p-2.5 border border-teal-100/70 leading-relaxed space-y-1">
                    <div><b>1. HS Vaccine:</b> Primary after 4 mo &bull; Secondary Booster after +3 mo &bull; Annual Booster every 1 yr.</div>
                    <div><b>2. BQ Vaccine:</b> Primary after 4 mo &bull; Secondary Booster after +13 mo &bull; Booster every 22 months.</div>
                </div>
            </div>
        `;

        if (urgentMilestones.length > 0) {
            vaxHtml += `
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-xs font-bold text-slate-800">
                        <i class="fa-solid fa-bell text-red-500 mr-1"></i> Due & Overdue Protocol Doses (${urgentMilestones.length})
                    </span>
                </div>
                <div class="space-y-2 mb-4">
                    ${urgentMilestones.map(m => `
                        <div class="cow-item border-l-4 ${m.status === 'Overdue' ? 'border-l-red-500 bg-red-50/20' : 'border-l-teal-500 bg-teal-50/20'}">
                            <div class="cow-info">
                                <div class="flex items-center justify-between">
                                    <span class="cow-tag">${m.cow.tag_number} (${m.cow.name})</span>
                                    <span class="status-badge ${m.badge_class}">${m.status}</span>
                                </div>
                                <div class="text-xs font-bold text-slate-800 mt-1">${m.vaccine_name}</div>
                                <div class="text-xs text-slate-500 mt-0.5">
                                    DOB: ${m.cow.date_of_birth} &bull; Due Date: <b>${m.due_date}</b>
                                </div>
                                <div class="mt-2 flex justify-end">
                                    <button class="px-2.5 py-1 bg-slate-800 text-white rounded text-xs font-medium hover:bg-slate-700" onclick="openLogVaccineModal(${m.cow.id}, '${m.vaccine_name}', '${m.due_date}', '${m.next_due_date}', '${m.treatment_type}')">
                                        Record Dose &rarr;
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        vaxHtml += `
            <div class="text-xs font-bold text-slate-700 mb-2 mt-3">Vaccination History Records:</div>
        `;

        if (vaccinations.length === 0) {
            vaxHtml += `<div class="text-center py-6 text-slate-400 text-xs">No recorded vaccinations yet.</div>`;
        } else {
            vaxHtml += vaccinations.map(v => {
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
        }

        container.innerHTML = vaxHtml;
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
            const store = getLocalStore();
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

            // Compute dynamic HS and BQ alerts for offline store
            (store.cows || []).forEach(c => {
                if (!c.date_of_birth) return;
                const cVaxes = (store.vaccinations || []).filter(v => v.cow_id == c.id);
                const s = calculateVaccineSchedule(c, cVaxes);
                const pNextHs = s.hs.find(m => !m.is_given && (m.status === 'Due Soon' || m.status === 'Overdue'));
                if (pNextHs) {
                    const isO = pNextHs.status === 'Overdue';
                    alerts.push({
                        category: 'vaccination',
                        badge: isO ? 'HS Overdue' : 'HS Vaccine Due',
                        badge_class: isO ? 'badge-red' : 'badge-teal',
                        cow_id: c.id,
                        tag_number: c.tag_number,
                        title: `HS ${pNextHs.stage} Vaccine Due: Cow ${c.tag_number} (${c.name})`,
                        message: `Cow DOB: ${c.date_of_birth}. Haemorrhagic Septicaemia (HS) ${pNextHs.stage} dose due on ${pNextHs.due_date}.${isO ? ' (Overdue!)' : ' (Due soon)'}`,
                        action_label: 'Record HS Dose',
                        action_type: 'vaccine',
                        vaccine_name: pNextHs.vaccine_name,
                        due_date: pNextHs.due_date,
                        next_due_date: pNextHs.next_due_date,
                        treatment_type: pNextHs.treatment_type,
                        date: pNextHs.due_date
                    });
                }
                const pNextBq = s.bq.find(m => !m.is_given && (m.status === 'Due Soon' || m.status === 'Overdue'));
                if (pNextBq) {
                    const isO = pNextBq.status === 'Overdue';
                    alerts.push({
                        category: 'vaccination',
                        badge: isO ? 'BQ Overdue' : 'BQ Vaccine Due',
                        badge_class: isO ? 'badge-red' : 'badge-teal',
                        cow_id: c.id,
                        tag_number: c.tag_number,
                        title: `BQ ${pNextBq.stage} Vaccine Due: Cow ${c.tag_number} (${c.name})`,
                        message: `Cow DOB: ${c.date_of_birth}. Blackquarter (BQ) ${pNextBq.stage} dose due on ${pNextBq.due_date}.${isO ? ' (Overdue!)' : ' (Due soon)'}`,
                        action_label: 'Record BQ Dose',
                        action_type: 'vaccine',
                        vaccine_name: pNextBq.vaccine_name,
                        due_date: pNextBq.due_date,
                        next_due_date: pNextBq.next_due_date,
                        treatment_type: pNextBq.treatment_type,
                        date: pNextBq.due_date
                    });
                }
            });

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
                            <button class="px-2.5 py-1 text-xs bg-slate-800 text-white rounded font-medium hover:bg-slate-700" onclick="handleAlertAction('${a.action_type}', ${a.cow_id || 0}, ${a.ai_id || a.record_id || 0}, '${(a.vaccine_name || '').replace(/'/g, "\\'")}', '${a.due_date || a.date || ''}', '${a.next_due_date || ''}', '${(a.treatment_type || '').replace(/'/g, "\\'")}')">
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

function handleAlertAction(type, cowId, recordId, vaxName = '', dueDate = null, nextDueDate = null, treatmentType = '') {
    if (type === 'breeding') openLogAiModal(cowId);
    if (type === 'confirm_preg') openConfirmPregModal(recordId);
    if (type === 'calving') openLogCalvingModal(cowId);
    if (type === 'vaccine') openLogVaccineModal(cowId, vaxName, dueDate, nextDueDate, treatmentType);
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

// ================= BREED MANAGEMENT =================
const DEFAULT_BREEDS = ['Frieglan', 'Ayrshire', 'Sahiwal', 'Brown Swiss', 'Gir'];

function getSavedCustomBreeds() {
    try {
        return JSON.parse(localStorage.getItem('farm_custom_breeds') || '[]');
    } catch (e) {
        return [];
    }
}

function initBreedSelect(selectedBreed = null) {
    const select = document.getElementById('newCowBreed');
    if (!select) return;

    const customBreeds = getSavedCustomBreeds();
    const allBreeds = [...DEFAULT_BREEDS];
    customBreeds.forEach(b => {
        if (!allBreeds.includes(b)) allBreeds.push(b);
    });

    const activeVal = selectedBreed || select.value || allBreeds[0];

    let html = '';
    allBreeds.forEach(b => {
        html += `<option value="${b}">${b}</option>`;
    });
    html += `<option value="__add_new__" style="color: #059669; font-weight: bold;">+ Add New Breed...</option>`;
    
    select.innerHTML = html;

    if (allBreeds.includes(activeVal)) {
        select.value = activeVal;
    } else {
        select.value = allBreeds[0];
    }
    select.dataset.prevValue = select.value;
}

function openAddBreedModal() {
    const input = document.getElementById('customBreedInput');
    if (input) input.value = '';
    openModal('modalAddBreed');
    setTimeout(() => {
        if (input) input.focus();
    }, 200);
}

function onBreedSelectChange(select) {
    if (select.value === '__add_new__') {
        openAddBreedModal();
    } else {
        select.dataset.prevValue = select.value;
    }
}

function submitNewBreed(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('customBreedInput');
    if (!input) return;
    const breedName = input.value.trim();
    if (!breedName) return;

    let customBreeds = getSavedCustomBreeds();
    if (!customBreeds.includes(breedName) && !DEFAULT_BREEDS.includes(breedName)) {
        customBreeds.push(breedName);
        localStorage.setItem('farm_custom_breeds', JSON.stringify(customBreeds));
    }

    initBreedSelect(breedName);
    closeModal('modalAddBreed');
    showToast(`Breed "${breedName}" added!`);
}

function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (!el) {
        console.error('Modal not found:', modalId);
        return;
    }
    if (cowsCache && cowsCache.length > 0) {
        populateCowSelectors(cowsCache);
    }
    if (modalId === 'modalAddCow') {
        initBreedSelect();
    }
    el.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('show');
    if (modalId === 'modalAddBreed') {
        const select = document.getElementById('newCowBreed');
        if (select && select.value === '__add_new__') {
            select.value = select.dataset.prevValue || DEFAULT_BREEDS[0];
        }
    }
    if (!document.querySelector('.modal-overlay.show')) {
        document.body.style.overflow = '';
    }
}

function initFab() {
    const fabBtn = document.getElementById('fabMainBtn');
    const fabMenu = document.getElementById('fabMenu');
    if (!fabBtn || !fabMenu) return;

    fabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fabMenu.classList.toggle('show');
    });

    document.querySelectorAll('.fab-menu-item').forEach(item => {
        item.addEventListener('click', () => {
            fabMenu.classList.remove('show');
        });
    });

    document.addEventListener('click', (e) => {
        if (!fabMenu.contains(e.target) && e.target !== fabBtn) {
            fabMenu.classList.remove('show');
        }
    });
}

function populateCowSelectors(cows) {
    const selectors = ['milkCowSelect', 'heatCowSelect', 'aiCowSelect', 'calvCowSelect', 'healthCowSelect', 'vaxCowSelect', 'growthCowSelect', 'feedCowSelect'];
    selectors.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = `<option value="">-- Select Cow --</option>` + cows.map(c => `
            <option value="${c.id}">${c.tag_number} - ${c.name} (${c.reproductive_status})</option>
        `).join('');
    });
}

function onGenderSelectionChange(gender) {
    const parityGroup = document.getElementById('parityGroup');
    const statusSelect = document.getElementById('newCowStatus');
    if (gender === 'Male') {
        if (parityGroup) parityGroup.style.display = 'none';
        if (statusSelect) {
            statusSelect.innerHTML = `
                <option value="Breeding Sire">Breeding Sire</option>
                <option value="Young Bull">Young Bull</option>
                <option value="Steer">Steer / Castrated</option>
                <option value="Calf">Bull Calf</option>
            `;
        }
    } else {
        if (parityGroup) parityGroup.style.display = 'block';
        if (statusSelect) {
            statusSelect.innerHTML = `
                <option value="Open">Open</option>
                <option value="In heat">In heat</option>
                <option value="Pregnant">Pregnant</option>
                <option value="Fresh">Fresh</option>
                <option value="Dry">Dry</option>
                <option value="Heifer">Heifer</option>
            `;
        }
    }
}

// ----------------- SUBMIT FORMS (DUAL SERVER & VERCEL OFFLINE) -----------------

// 1. Submit New Cow Profile
async function submitNewCow(e) {
    e.preventDefault();
    const tag = document.getElementById('newCowTag').value.trim();
    const name = document.getElementById('newCowName').value.trim();
    const breed = document.getElementById('newCowBreed').value;
    const gender = document.getElementById('newCowGender') ? document.getElementById('newCowGender').value : 'Female';
    const dob = document.getElementById('newCowDob').value;
    const source = document.getElementById('newCowSource').value;
    const parity = (gender === 'Male' ? 0 : (parseInt(document.getElementById('newCowParity').value) || 0));
    const status = document.getElementById('newCowStatus').value;

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/cows.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tag_number: tag, name, breed, gender, date_of_birth: dob, source, parity, reproductive_status: status })
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
                gender,
                date_of_birth: dob,
                source,
                parity,
                reproductive_status: status,
                photo_url: gender === 'Male' ? 'assets/bull_1.jpg' : 'assets/cow_default.jpg'
            };
            store.cows.unshift(newCow);
            saveLocalStore(store);
        }

        showToast(`${gender === 'Male' ? 'Bull' : 'Cow'} ${tag} registered successfully!`);
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
                if (dropPct >= 10) alertTriggered = true;
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
function onHeatSymptomsChange(val) {
    const custom = document.getElementById('heatNotesCustom');
    if (custom) {
        if (val === 'Other') {
            custom.style.display = 'block';
            custom.focus();
        } else {
            custom.style.display = 'none';
        }
    }
}

async function submitHeatRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('heatCowSelect').value;
    const date = document.getElementById('heatDate').value;
    const time = document.getElementById('heatTime').value;
    const status = document.getElementById('heatStatus').value;
    let notes = document.getElementById('heatNotes').value;
    if (notes === 'Other') {
        const custom = document.getElementById('heatNotesCustom') ? document.getElementById('heatNotesCustom').value.trim() : '';
        notes = custom || 'Other symptom observed';
    }

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
        const custom = document.getElementById('heatNotesCustom');
        if (custom) {
            custom.value = '';
            custom.style.display = 'none';
        }
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
    const sel = document.getElementById('healthCowSelect');
    if (cowId && sel) {
        sel.value = cowId;
        onHealthCowChange(cowId);
    } else {
        const banner = document.getElementById('healthCowVaxBanner');
        if (banner) banner.style.display = 'none';
    }
    // Reset disease checkboxes
    document.querySelectorAll('input[name="healthDiseaseCheckbox"]').forEach(cb => cb.checked = false);
    const chkOther = document.getElementById('chkDiseaseOther');
    if (chkOther) chkOther.checked = false;
    const txtOther = document.getElementById('healthDiseaseOther');
    if (txtOther) {
        txtOther.value = '';
        txtOther.style.display = 'none';
    }
    openModal('modalLogHealth');
}

async function submitHealthRecord(e) {
    e.preventDefault();
    const cowId = document.getElementById('healthCowSelect').value;
    const date = document.getElementById('healthDate').value;
    
    // Multi-select disease checkboxes
    const checkedBoxes = Array.from(document.querySelectorAll('input[name="healthDiseaseCheckbox"]:checked')).map(cb => cb.value);
    const otherChecked = document.getElementById('chkDiseaseOther') && document.getElementById('chkDiseaseOther').checked;
    const otherVal = document.getElementById('healthDiseaseOther') ? document.getElementById('healthDiseaseOther').value.trim() : '';
    if (otherChecked && otherVal) {
        checkedBoxes.push(otherVal);
    }

    if (checkedBoxes.length === 0) {
        showToast('Please select at least one Disease / Problem.', true);
        return;
    }
    const disease = checkedBoxes.join(', ');

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

        showToast('Health record saved successfully!');
        closeModal('modalLogHealth');
        document.getElementById('formLogHealth').reset();
        document.querySelectorAll('input[name="healthDiseaseCheckbox"]').forEach(cb => cb.checked = false);
        if (document.getElementById('chkDiseaseOther')) document.getElementById('chkDiseaseOther').checked = false;
        if (document.getElementById('healthDiseaseOther')) {
            document.getElementById('healthDiseaseOther').value = '';
            document.getElementById('healthDiseaseOther').style.display = 'none';
        }
        if (document.getElementById('healthCowVaxBanner')) document.getElementById('healthCowVaxBanner').style.display = 'none';
        loadHealthAndVax('health');
        loadDashboard();
        loadAlertsCount();
    } catch (err) {
        showToast(err.message, true);
    }
}

// 8. Submit Vaccination Record
function openLogVaccineModal(cowId = null, vaccineName = '', dueDate = null, nextDueDate = null, treatmentType = '') {
    if (cowId) document.getElementById('vaxCowSelect').value = cowId;
    if (vaccineName) document.getElementById('vaxName').value = vaccineName;
    if (dueDate) document.getElementById('vaxDateGiven').value = dueDate;
    else document.getElementById('vaxDateGiven').value = new Date().toISOString().split('T')[0];
    if (nextDueDate) document.getElementById('vaxNextDate').value = nextDueDate;
    if (treatmentType) document.getElementById('vaxType').value = treatmentType;
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
            showToast('THI log saved! Index: 81.2 (Moderate Stress)');
        }
        closeModal('modalThiCalculator');
    } catch (e) {
        showToast('Failed to save THI log', true);
    }
}

// =========================================================================
// 10. DAIRY FEED NUTRIENT CALCULATION MODULE
// =========================================================================
let feedsCache = [];
let feedLogsCache = [];
let activeFeedSubTab = 'calculator';
let activeFeedCategory = 'all';

function switchFeedSubTab(subTab, btn) {
    activeFeedSubTab = subTab;
    document.querySelectorAll('#feedSubTabs .filter-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const viewCalc = document.getElementById('feedContentCalculator');
    const viewLib = document.getElementById('feedContentLibrary');
    const viewHist = document.getElementById('feedContentHistory');

    if (viewCalc) viewCalc.style.display = subTab === 'calculator' ? 'block' : 'none';
    if (viewLib) viewLib.style.display = subTab === 'library' ? 'block' : 'none';
    if (viewHist) viewHist.style.display = subTab === 'history' ? 'block' : 'none';

    if (subTab === 'library') renderFeedLibrary();
    if (subTab === 'history') loadFeedHistory();
}

async function loadFeedModule(subTab = null) {
    if (!cowsCache || !cowsCache.length) {
        await loadCows();
    } else {
        populateCowSelectors(cowsCache);
    }

    // Set today's date if empty
    const dateInput = document.getElementById('feedLogDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Load feed ingredients
    await loadFeedIngredients();

    // Ensure initial rows exist in calculator
    const container = document.getElementById('feedRowsContainer');
    if (container && container.children.length === 0) {
        loadExampleFeedRation();
    } else {
        recalculateRationTotals();
    }

    if (subTab) {
        const btn = document.getElementById(subTab === 'library' ? 'btnSubTabFeedLibrary' : (subTab === 'history' ? 'btnSubTabFeedHistory' : 'btnSubTabFeedCalc'));
        switchFeedSubTab(subTab, btn);
    }
}

async function loadFeedIngredients() {
    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/feeds.php?action=list_ingredients`);
            const data = await res.json();
            feedsCache = data.feeds || [];
        } else {
            const store = getLocalStore();
            feedsCache = store.feeds || [];
        }
    } catch (e) {
        console.error('Error fetching feeds:', e);
        const store = getLocalStore();
        feedsCache = store.feeds || [];
    }

    // Update badge count
    const badge = document.getElementById('feedCountBadge');
    if (badge) badge.innerText = feedsCache.length;
}

// Recalculate nutrient intake for each feed & daily total intake
function recalculateRationTotals() {
    const container = document.getElementById('feedRowsContainer');
    if (!container) return;

    const rowElements = container.querySelectorAll('.feed-row-item');
    const tableBody = document.getElementById('feedBreakdownTableBody');
    const tableFoot = document.getElementById('feedBreakdownTableFoot');

    let totalAsFed = 0;
    let totalDm = 0;
    let totalCp = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalNdf = 0;
    let totalAdf = 0;
    let totalStarch = 0;
    let totalSugar = 0;
    let totalAsh = 0;
    let totalCa = 0;
    let totalP = 0;
    let totalMg = 0;
    let totalK = 0;
    let totalNa = 0;
    let totalS = 0;
    let totalMe = 0;
    let totalNel = 0;

    let tableRowsHtml = '';

    rowElements.forEach(row => {
        const feedSelect = row.querySelector('.feed-select');
        const amountInput = row.querySelector('.feed-amount');
        if (!feedSelect || !amountInput) return;

        const feedId = parseInt(feedSelect.value);
        const asFedKg = parseFloat(amountInput.value) || 0;
        const feed = feedsCache.find(f => f.id === feedId);

        if (feed && asFedKg > 0) {
            const dmPct = parseFloat(feed.dm_pct || 0);
            const cpPct = parseFloat(feed.cp_pct || 0);
            const fatPct = parseFloat(feed.fat_pct || 0);
            const fiberPct = parseFloat(feed.fiber_pct || 0);
            const ndfPct = parseFloat(feed.ndf_pct || 0);
            const adfPct = parseFloat(feed.adf_pct || 0);
            const starchPct = parseFloat(feed.starch_pct || 0);
            const sugarPct = parseFloat(feed.sugar_pct || 0);
            const ashPct = parseFloat(feed.ash_pct || 0);
            const caPct = parseFloat(feed.ca_pct || 0);
            const pPct = parseFloat(feed.p_pct || 0);
            const mgPct = parseFloat(feed.mg_pct || 0);
            const kPct = parseFloat(feed.k_pct || 0);
            const naPct = parseFloat(feed.na_pct || 0);
            const sPct = parseFloat(feed.s_pct || 0);
            const meMj = parseFloat(feed.me_mj || 0);
            const nelMj = parseFloat(feed.nel_mj || 0);

            // 1. Dry Matter Intake (kg) = Feed Amount * DM% / 100
            const dmKg = asFedKg * (dmPct / 100);

            // 2. Nutrients (% DM basis): Intake (kg) = DM Intake * Nutrient% / 100
            const cpKg = dmKg * (cpPct / 100);
            const fatKg = dmKg * (fatPct / 100);
            const fiberKg = dmKg * (fiberPct / 100);
            const ndfKg = dmKg * (ndfPct / 100);
            const adfKg = dmKg * (adfPct / 100);
            const starchKg = dmKg * (starchPct / 100);
            const sugarKg = dmKg * (sugarPct / 100);
            const ashKg = dmKg * (ashPct / 100);

            // 3. Minerals (Ca, P, Mg, K, Na, S): Mineral Intake (g) = DM Intake * Mineral% / 100 * 1000
            const caG = dmKg * (caPct / 100) * 1000;
            const pG = dmKg * (pPct / 100) * 1000;
            const mgG = dmKg * (mgPct / 100) * 1000;
            const kG = dmKg * (kPct / 100) * 1000;
            const naG = dmKg * (naPct / 100) * 1000;
            const sG = dmKg * (sPct / 100) * 1000;

            // 4. Energy (ME, NEL): Energy Intake (MJ) = DM Intake * Energy (MJ/kg DM)
            const meTotal = dmKg * meMj;
            const nelTotal = dmKg * nelMj;

            // Accumulate Daily Totals
            totalAsFed += asFedKg;
            totalDm += dmKg;
            totalCp += cpKg;
            totalFat += fatKg;
            totalFiber += fiberKg;
            totalNdf += ndfKg;
            totalAdf += adfKg;
            totalStarch += starchKg;
            totalSugar += sugarKg;
            totalAsh += ashKg;
            totalCa += caG;
            totalP += pG;
            totalMg += mgG;
            totalK += kG;
            totalNa += naG;
            totalS += sG;
            totalMe += meTotal;
            totalNel += nelTotal;

            tableRowsHtml += `
                <tr>
                    <td class="font-bold text-slate-800">${feed.name}</td>
                    <td>${asFedKg.toFixed(2)}</td>
                    <td class="font-semibold text-emerald-800">${dmKg.toFixed(2)}</td>
                    <td class="text-blue-800 font-medium">${cpKg.toFixed(2)}</td>
                    <td>${fatKg.toFixed(2)}</td>
                    <td>${fiberKg.toFixed(2)}</td>
                    <td>${ndfKg.toFixed(2)}</td>
                    <td class="text-amber-800">${caG.toFixed(1)}</td>
                    <td class="text-amber-800">${pG.toFixed(1)}</td>
                </tr>
            `;
        }
    });

    if (tableRowsHtml === '') {
        tableRowsHtml = `<tr><td colspan="9" class="text-center py-4 text-slate-400">Select feed ingredients and enter amounts in kg as-fed.</td></tr>`;
    }

    if (tableBody) tableBody.innerHTML = tableRowsHtml;

    if (tableFoot) {
        tableFoot.innerHTML = `
            <tr>
                <td class="font-bold text-slate-900">TOTAL</td>
                <td class="font-bold text-slate-900">${totalAsFed.toFixed(2)}</td>
                <td class="font-bold text-emerald-900 bg-emerald-50/70">${totalDm.toFixed(2)}</td>
                <td class="font-bold text-blue-900 bg-blue-50/70">${totalCp.toFixed(2)}</td>
                <td class="font-bold text-slate-900">${totalFat.toFixed(2)}</td>
                <td class="font-bold text-slate-900">${totalFiber.toFixed(2)}</td>
                <td class="font-bold text-slate-900">${totalNdf.toFixed(2)}</td>
                <td class="font-bold text-amber-900 bg-amber-50/70">${totalCa.toFixed(1)}</td>
                <td class="font-bold text-amber-900 bg-amber-50/70">${totalP.toFixed(1)}</td>
            </tr>
        `;
    }

    // Update KPI summary cards
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.innerText = txt; };
    setText('totalKpiAsFed', totalAsFed.toFixed(2) + ' kg');
    setText('totalKpiDm', totalDm.toFixed(2) + ' kg');
    setText('totalKpiCp', totalCp.toFixed(2) + ' kg');
    setText('totalKpiFat', totalFat.toFixed(2) + ' kg');
    setText('totalKpiFiber', totalFiber.toFixed(2) + ' kg');
    setText('totalKpiNdf', totalNdf.toFixed(2) + ' kg');
    setText('totalKpiAdf', totalAdf.toFixed(2) + ' kg');
    setText('totalKpiStarch', totalStarch.toFixed(2) + ' kg');
    setText('totalKpiSugar', totalSugar.toFixed(2) + ' kg');
    setText('totalKpiAsh', totalAsh.toFixed(2) + ' kg');
    setText('totalKpiCa', totalCa.toFixed(1) + ' g');
    setText('totalKpiP', totalP.toFixed(1) + ' g');
    setText('totalKpiMg', totalMg.toFixed(1) + ' g');
    setText('totalKpiK', totalK.toFixed(1) + ' g');
    setText('totalKpiNa', totalNa.toFixed(1) + ' g');
    setText('totalKpiS', totalS.toFixed(1) + ' g');
    setText('totalKpiMe', totalMe.toFixed(1) + ' MJ');
    setText('totalKpiNel', totalNel.toFixed(1) + ' MJ');
}

function addFeedRationRow(feedId = null, amount = '') {
    const container = document.getElementById('feedRowsContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'feed-row-item feed-row-card flex items-center gap-2';

    let optionsHtml = `<option value="">-- Choose Feed --</option>`;
    feedsCache.forEach(f => {
        const isSel = (feedId && f.id == feedId) ? 'selected' : '';
        optionsHtml += `<option value="${f.id}" ${isSel}>${f.name} (${parseFloat(f.dm_pct).toFixed(0)}% DM &bull; ${f.category})</option>`;
    });

    row.innerHTML = `
        <div class="flex-1">
            <select class="feed-select form-control text-xs font-semibold py-1.5" style="border-radius: 8px;">
                ${optionsHtml}
            </select>
        </div>
        <div class="w-28 flex items-center gap-1">
            <input type="number" step="0.1" min="0.1" class="feed-amount form-control text-xs font-bold text-right py-1.5" placeholder="0.0" value="${amount}" style="border-radius: 8px;">
            <span class="text-[11px] font-bold text-slate-500">kg</span>
        </div>
        <button type="button" class="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent transition-colors" onclick="removeFeedRationRow(this)" title="Remove item">
            <i class="fa-solid fa-xmark text-sm"></i>
        </button>
    `;

    const sel = row.querySelector('.feed-select');
    const inp = row.querySelector('.feed-amount');
    sel.addEventListener('change', recalculateRationTotals);
    inp.addEventListener('input', recalculateRationTotals);

    container.appendChild(row);
    recalculateRationTotals();
}

function removeFeedRationRow(btn) {
    const row = btn.closest('.feed-row-item');
    if (row) {
        row.remove();
        recalculateRationTotals();
    }
}

function clearFeedRationRows() {
    const container = document.getElementById('feedRowsContainer');
    if (container) {
        container.innerHTML = '';
        addFeedRationRow();
    }
}

function loadExampleFeedRation() {
    const container = document.getElementById('feedRowsContainer');
    if (!container) return;
    container.innerHTML = '';

    const findId = (name) => {
        const f = feedsCache.find(x => x.name.toLowerCase().includes(name.toLowerCase()));
        return f ? f.id : null;
    };

    const tmrId = findId('TMR') || 1;
    const concId = findId('Concentrate') || 2;
    const silageId = findId('Maize Silage') || 3;
    const grassId = findId('Grass') || 4;

    addFeedRationRow(tmrId, 25);
    addFeedRationRow(concId, 5);
    addFeedRationRow(silageId, 8);
    addFeedRationRow(grassId, 5);

    showToast('Loaded standard example ration (43 kg As-Fed)');
}

async function onFeedCowSelectionChange(cowId) {
    if (!cowId) return;
    const container = document.getElementById('feedRowsContainer');
    if (container && container.children.length === 0) {
        loadExampleFeedRation();
    }
}

async function saveCurrentFeedRation() {
    const cowSelect = document.getElementById('feedCowSelect');
    const dateInput = document.getElementById('feedLogDate');
    const notesInput = document.getElementById('feedLogNotes');

    const cowId = parseInt(cowSelect.value);
    const logDate = dateInput.value || new Date().toISOString().split('T')[0];
    const notes = (notesInput ? notesInput.value : '').trim();

    if (!cowId) {
        showToast('Please select a cow first.', true);
        if (cowSelect) cowSelect.focus();
        return;
    }

    const container = document.getElementById('feedRowsContainer');
    const rowElements = container.querySelectorAll('.feed-row-item');
    const items = [];

    rowElements.forEach(row => {
        const feedSelect = row.querySelector('.feed-select');
        const amountInput = row.querySelector('.feed-amount');
        const feedId = parseInt(feedSelect.value);
        const amount = parseFloat(amountInput.value) || 0;
        if (feedId && amount > 0) {
            const feed = feedsCache.find(f => f.id === feedId);
            items.push({
                feed_id: feedId,
                feed_name: feed ? feed.name : 'Feed',
                amount_as_fed_kg: amount
            });
        }
    });

    if (items.length === 0) {
        showToast('Please enter at least one feed ingredient and amount.', true);
        return;
    }

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/feeds.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'save_log',
                    cow_id: cowId,
                    log_date: logDate,
                    notes: notes,
                    items: items
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save feed ration.');
        } else {
            const store = getLocalStore();
            if (!store.feed_logs) store.feed_logs = [];
            let tAsFed = 0, tDm = 0, tCp = 0, tFat = 0, tFiber = 0, tNdf = 0, tCa = 0, tP = 0;
            const processedItems = items.map(it => {
                const f = feedsCache.find(x => x.id === it.feed_id) || {};
                const dm = it.amount_as_fed_kg * (parseFloat(f.dm_pct || 90) / 100);
                const cp = dm * (parseFloat(f.cp_pct || 0) / 100);
                const fat = dm * (parseFloat(f.fat_pct || 0) / 100);
                const fiber = dm * (parseFloat(f.fiber_pct || 0) / 100);
                const ndf = dm * (parseFloat(f.ndf_pct || 0) / 100);
                const ca = dm * (parseFloat(f.ca_pct || 0) / 100) * 1000;
                const p = dm * (parseFloat(f.p_pct || 0) / 100) * 1000;
                tAsFed += it.amount_as_fed_kg;
                tDm += dm; tCp += cp; tFat += fat; tFiber += fiber; tNdf += ndf; tCa += ca; tP += p;
                return {
                    feed_id: it.feed_id,
                    feed_name: it.feed_name,
                    amount_as_fed_kg: it.amount_as_fed_kg,
                    dm_intake_kg: parseFloat(dm.toFixed(2)),
                    cp_intake_kg: parseFloat(cp.toFixed(3)),
                    fat_intake_kg: parseFloat(fat.toFixed(3)),
                    fiber_intake_kg: parseFloat(fiber.toFixed(3)),
                    ndf_intake_kg: parseFloat(ndf.toFixed(3)),
                    ca_intake_g: parseFloat(ca.toFixed(2)),
                    p_intake_g: parseFloat(p.toFixed(2))
                };
            });

            const newLog = {
                id: Date.now(),
                cow_id: cowId,
                log_date: logDate,
                total_as_fed_kg: parseFloat(tAsFed.toFixed(2)),
                total_dm_kg: parseFloat(tDm.toFixed(2)),
                total_cp_kg: parseFloat(tCp.toFixed(3)),
                total_fat_kg: parseFloat(tFat.toFixed(3)),
                total_fiber_kg: parseFloat(tFiber.toFixed(3)),
                total_ndf_kg: parseFloat(tNdf.toFixed(3)),
                total_ca_g: parseFloat(tCa.toFixed(2)),
                total_p_g: parseFloat(tP.toFixed(2)),
                notes: notes,
                items: processedItems
            };
            store.feed_logs.unshift(newLog);
            saveLocalStore(store);
        }

        showToast('Daily feeding record saved successfully!');
        if (notesInput) notesInput.value = '';
        loadFeedHistory(cowId);
    } catch (err) {
        showToast(err.message, true);
    }
}

function renderFeedLibrary(filterCat = 'all', searchQuery = '') {
    const container = document.getElementById('feedLibraryCardsContainer');
    if (!container) return;

    let filtered = feedsCache;
    if (filterCat && filterCat !== 'all') {
        filtered = filtered.filter(f => f.category === filterCat);
    }
    if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(f => f.name.toLowerCase().includes(q) || (f.category && f.category.toLowerCase().includes(q)));
    }

    if (filtered.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">No feed ingredients matching your criteria.</div>`;
        return;
    }

    container.innerHTML = filtered.map(f => `
        <div class="app-card mb-2.5 p-3 bg-white border border-slate-200">
            <div class="flex items-start justify-between">
                <div>
                    <div class="flex items-center gap-1.5">
                        <span class="font-bold text-slate-900 text-sm">${f.name}</span>
                        <span class="status-badge badge-gray text-[10px]">${f.category || 'Feed'}</span>
                    </div>
                    <div class="text-[11px] text-slate-500 mt-0.5">${f.notes || 'Nutritional composition on dry matter basis'}</div>
                </div>
                <div class="flex items-center gap-1">
                    <button class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-xs font-semibold" onclick="openModalFeedIngredient(${f.id})" title="Edit Feed">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="px-2 py-1 bg-red-50 hover:bg-red-100 rounded text-red-600 text-xs font-semibold" onclick="deleteFeedIngredient(${f.id})" title="Delete Feed">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>

            <!-- Key Nutrient Badges Grid -->
            <div class="grid grid-cols-4 gap-1.5 mt-2.5 text-center text-xs">
                <div class="p-1.5 bg-amber-50 rounded-lg border border-amber-200">
                    <span class="text-[9px] text-amber-800 font-bold block">DM</span>
                    <span class="font-bold text-amber-950">${parseFloat(f.dm_pct).toFixed(1)}%</span>
                </div>
                <div class="p-1.5 bg-blue-50 rounded-lg border border-blue-200">
                    <span class="text-[9px] text-blue-800 font-bold block">CP</span>
                    <span class="font-bold text-blue-950">${parseFloat(f.cp_pct).toFixed(1)}%</span>
                </div>
                <div class="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <span class="text-[9px] text-emerald-800 font-bold block">NDF</span>
                    <span class="font-bold text-emerald-950">${parseFloat(f.ndf_pct).toFixed(1)}%</span>
                </div>
                <div class="p-1.5 bg-purple-50 rounded-lg border border-purple-200">
                    <span class="text-[9px] text-purple-800 font-bold block">ME</span>
                    <span class="font-bold text-purple-950">${parseFloat(f.me_mj).toFixed(1)} MJ</span>
                </div>
            </div>

            <!-- Full composition pill detail -->
            <div class="flex flex-wrap gap-1.5 mt-2 text-[10px] text-slate-600">
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Fat: <b>${parseFloat(f.fat_pct).toFixed(1)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Fiber: <b>${parseFloat(f.fiber_pct).toFixed(1)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">ADF: <b>${parseFloat(f.adf_pct).toFixed(1)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Starch: <b>${parseFloat(f.starch_pct).toFixed(1)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Sugar: <b>${parseFloat(f.sugar_pct).toFixed(1)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">Ca: <b>${parseFloat(f.ca_pct).toFixed(2)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">P: <b>${parseFloat(f.p_pct).toFixed(2)}%</b></span>
                <span class="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">NEL: <b>${parseFloat(f.nel_mj).toFixed(1)} MJ</b></span>
            </div>
        </div>
    `).join('');
}

function filterFeedLibrary() {
    const q = document.getElementById('feedSearchInput') ? document.getElementById('feedSearchInput').value : '';
    renderFeedLibrary(activeFeedCategory, q);
}

function filterFeedCategory(category, btn) {
    activeFeedCategory = category;
    document.querySelectorAll('#feedCategoryFilters .filter-chip').forEach(c => c.classList.remove('active'));
    if (btn) btn.classList.add('active');
    const q = document.getElementById('feedSearchInput') ? document.getElementById('feedSearchInput').value : '';
    renderFeedLibrary(category, q);
}

function openModalFeedIngredient(feedId = null) {
    const titleEl = document.getElementById('modalFeedIngredientTitle');
    const form = document.getElementById('formFeedIngredient');
    if (form) form.reset();

    const idInput = document.getElementById('feedIngredientId');
    if (idInput) idInput.value = feedId || '';

    if (feedId) {
        const feed = feedsCache.find(f => f.id == feedId);
        if (feed) {
            if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-pen-to-square text-amber-600 mr-1.5"></i> Edit ${feed.name}`;
            document.getElementById('feedIngName').value = feed.name || '';
            document.getElementById('feedIngCategory').value = feed.category || 'Forage / TMR';
            document.getElementById('feedIngDm').value = feed.dm_pct || '';
            document.getElementById('feedIngCp').value = feed.cp_pct || '';
            document.getElementById('feedIngFat').value = feed.fat_pct || '';
            document.getElementById('feedIngFiber').value = feed.fiber_pct || '';
            document.getElementById('feedIngNdf').value = feed.ndf_pct || '';
            document.getElementById('feedIngAdf').value = feed.adf_pct || '';
            document.getElementById('feedIngStarch').value = feed.starch_pct || '';
            document.getElementById('feedIngSugar').value = feed.sugar_pct || '';
            document.getElementById('feedIngAsh').value = feed.ash_pct || '';
            document.getElementById('feedIngCa').value = feed.ca_pct || '';
            document.getElementById('feedIngP').value = feed.p_pct || '';
            document.getElementById('feedIngMg').value = feed.mg_pct || '';
            document.getElementById('feedIngK').value = feed.k_pct || '';
            document.getElementById('feedIngNa').value = feed.na_pct || '';
            document.getElementById('feedIngS').value = feed.s_pct || '';
            document.getElementById('feedIngMe').value = feed.me_mj || '';
            document.getElementById('feedIngNel').value = feed.nel_mj || '';
            document.getElementById('feedIngNotes').value = feed.notes || '';
        }
    } else {
        if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-seedling text-amber-600 mr-1.5"></i> Add New Feed Ingredient`;
    }

    openModal('modalFeedIngredient');
}

async function submitFeedIngredient(event) {
    event.preventDefault();
    const id = document.getElementById('feedIngredientId').value;
    const name = document.getElementById('feedIngName').value.trim();
    const category = document.getElementById('feedIngCategory').value;
    const dm_pct = parseFloat(document.getElementById('feedIngDm').value) || 0;
    const cp_pct = parseFloat(document.getElementById('feedIngCp').value) || 0;
    const fat_pct = parseFloat(document.getElementById('feedIngFat').value) || 0;
    const fiber_pct = parseFloat(document.getElementById('feedIngFiber').value) || 0;
    const ndf_pct = parseFloat(document.getElementById('feedIngNdf').value) || 0;
    const adf_pct = parseFloat(document.getElementById('feedIngAdf').value) || 0;
    const starch_pct = parseFloat(document.getElementById('feedIngStarch').value) || 0;
    const sugar_pct = parseFloat(document.getElementById('feedIngSugar').value) || 0;
    const ash_pct = parseFloat(document.getElementById('feedIngAsh').value) || 0;
    const ca_pct = parseFloat(document.getElementById('feedIngCa').value) || 0;
    const p_pct = parseFloat(document.getElementById('feedIngP').value) || 0;
    const mg_pct = parseFloat(document.getElementById('feedIngMg').value) || 0;
    const k_pct = parseFloat(document.getElementById('feedIngK').value) || 0;
    const na_pct = parseFloat(document.getElementById('feedIngNa').value) || 0;
    const s_pct = parseFloat(document.getElementById('feedIngS').value) || 0;
    const me_mj = parseFloat(document.getElementById('feedIngMe').value) || 0;
    const nel_mj = parseFloat(document.getElementById('feedIngNel').value) || 0;
    const notes = document.getElementById('feedIngNotes').value.trim();

    if (!name) {
        showToast('Feed name is required.', true);
        return;
    }
    if (dm_pct <= 0 || dm_pct > 100) {
        showToast('Dry Matter (DM %) must be between 0.1% and 100%.', true);
        return;
    }

    const payload = {
        action: 'save_ingredient',
        id: id ? parseInt(id) : null,
        name, category, dm_pct, cp_pct, fat_pct, fiber_pct, ndf_pct, adf_pct,
        starch_pct, sugar_pct, ash_pct, ca_pct, p_pct, mg_pct, k_pct, na_pct, s_pct,
        me_mj, nel_mj, notes
    };

    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/feeds.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save feed ingredient.');
            showToast(data.message || 'Feed ingredient saved successfully.');
        } else {
            const store = getLocalStore();
            if (!store.feeds) store.feeds = [];
            if (id) {
                const idx = store.feeds.findIndex(f => f.id == id);
                if (idx !== -1) store.feeds[idx] = { ...store.feeds[idx], ...payload };
            } else {
                payload.id = Date.now();
                store.feeds.push(payload);
            }
            saveLocalStore(store);
            showToast('Feed ingredient saved!');
        }

        closeModal('modalFeedIngredient');
        await loadFeedIngredients();
        renderFeedLibrary();
        updateFeedRowSelectOptions();
        recalculateRationTotals();
    } catch (err) {
        showToast(err.message, true);
    }
}

async function deleteFeedIngredient(feedId) {
    if (!confirm('Are you sure you want to delete this feed ingredient?')) return;
    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/feeds.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_ingredient', id: feedId })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to delete feed.');
        } else {
            const store = getLocalStore();
            store.feeds = (store.feeds || []).filter(f => f.id != feedId);
            saveLocalStore(store);
        }
        showToast('Feed ingredient deleted.');
        await loadFeedIngredients();
        renderFeedLibrary();
        updateFeedRowSelectOptions();
        recalculateRationTotals();
    } catch (err) {
        showToast(err.message, true);
    }
}

function updateFeedRowSelectOptions() {
    const container = document.getElementById('feedRowsContainer');
    if (!container) return;
    const selects = container.querySelectorAll('.feed-select');
    selects.forEach(sel => {
        const curVal = sel.value;
        let optHtml = `<option value="">-- Choose Feed --</option>`;
        feedsCache.forEach(f => {
            optHtml += `<option value="${f.id}" ${f.id == curVal ? 'selected' : ''}>${f.name} (${parseFloat(f.dm_pct).toFixed(0)}% DM &bull; ${f.category})</option>`;
        });
        sel.innerHTML = optHtml;
    });
}

async function loadFeedHistory(cowId = null) {
    const container = document.getElementById('feedHistoryContainer');
    const countBadge = document.getElementById('feedHistoryCount');
    if (!container) return;

    let logs = [];
    try {
        if (isServerMode) {
            let url = `${API_BASE}/feeds.php?action=list_logs&with_items=1`;
            if (cowId) url += `&cow_id=${cowId}`;
            const res = await fetch(url);
            const data = await res.json();
            logs = data.logs || [];
        } else {
            const store = getLocalStore();
            logs = store.feed_logs || [];
            if (cowId) logs = logs.filter(l => l.cow_id == cowId);
        }
    } catch (e) {
        console.error('Error loading feed history:', e);
    }

    if (countBadge) countBadge.innerText = `${logs.length} records`;

    if (logs.length === 0) {
        container.innerHTML = `<div class="p-6 text-center text-slate-400 text-xs">No feeding records found. Enter a ration in the calculator to get started!</div>`;
        return;
    }

    container.innerHTML = logs.map(l => {
        const cowName = l.cow_name || (cowsCache.find(c => c.id == l.cow_id) || {}).name || `Cow #${l.cow_id}`;
        const cowTag = l.tag_number || (cowsCache.find(c => c.id == l.cow_id) || {}).tag_number || '';
        const items = l.items || [];

        return `
            <div class="app-card mb-3 p-3 bg-white border border-slate-200">
                <div class="flex items-start justify-between mb-2">
                    <div>
                        <div class="flex items-center gap-1.5">
                            <span class="font-bold text-slate-900 text-sm">${cowName}</span>
                            <span class="text-xs text-slate-500 font-semibold">${cowTag}</span>
                        </div>
                        <div class="text-[11px] text-slate-400">${l.log_date} &bull; ${l.notes || 'Daily feeding log'}</div>
                    </div>
                    <button class="px-2.5 py-1 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold" onclick="reloadRationIntoCalculator(${l.id})">
                        <i class="fa-solid fa-arrow-rotate-left mr-1"></i> Reload
                    </button>
                </div>

                <!-- Summary Row -->
                <div class="grid grid-cols-4 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-100 text-center mb-2 text-xs">
                    <div>
                        <span class="text-[9px] text-slate-400 block font-semibold">AS-FED</span>
                        <span class="font-bold text-slate-800">${parseFloat(l.total_as_fed_kg).toFixed(1)} kg</span>
                    </div>
                    <div>
                        <span class="text-[9px] text-emerald-600 block font-semibold">DM INTAKE</span>
                        <span class="font-bold text-emerald-900">${parseFloat(l.total_dm_kg).toFixed(2)} kg</span>
                    </div>
                    <div>
                        <span class="text-[9px] text-blue-600 block font-semibold">CRUDE PROTEIN</span>
                        <span class="font-bold text-blue-900">${parseFloat(l.total_cp_kg).toFixed(2)} kg</span>
                    </div>
                    <div>
                        <span class="text-[9px] text-amber-700 block font-semibold">CALCIUM / P</span>
                        <span class="font-bold text-amber-950">${parseFloat(l.total_ca_g).toFixed(0)}g / ${parseFloat(l.total_p_g).toFixed(0)}g</span>
                    </div>
                </div>

                <!-- Feed Items Breakdown Pills -->
                ${items.length > 0 ? `
                    <div class="text-[10px] text-slate-500 font-semibold mb-1">Ration breakdown:</div>
                    <div class="space-y-1">
                        ${items.map(it => `
                            <div class="flex justify-between items-center text-[11px] py-0.5 border-b border-slate-50">
                                <span class="font-medium text-slate-700">${it.feed_name}</span>
                                <span class="text-slate-600 font-bold">${parseFloat(it.amount_as_fed_kg).toFixed(1)} kg as-fed &bull; <span class="text-emerald-700">${parseFloat(it.dm_intake_kg).toFixed(2)} kg DM</span></span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

async function reloadRationIntoCalculator(logId) {
    let log = null;
    try {
        if (isServerMode) {
            const res = await fetch(`${API_BASE}/feeds.php?action=get_log&id=${logId}`);
            log = await res.json();
        } else {
            const store = getLocalStore();
            log = (store.feed_logs || []).find(l => l.id == logId);
        }
    } catch (e) {
        console.error('Error fetching log for reload:', e);
    }

    if (!log) {
        showToast('Feed log not found', true);
        return;
    }

    // Switch to calculator
    switchTab('feed');
    switchFeedSubTab('calculator', document.getElementById('btnSubTabFeedCalc'));

    // Set cow
    const cowSelect = document.getElementById('feedCowSelect');
    if (cowSelect) cowSelect.value = log.cow_id;

    // Set date
    const dateInput = document.getElementById('feedLogDate');
    if (dateInput) dateInput.value = log.log_date;

    // Clear and populate rows
    const container = document.getElementById('feedRowsContainer');
    if (container) {
        container.innerHTML = '';
        const items = log.items || [];
        if (items.length > 0) {
            items.forEach(it => {
                addFeedRationRow(it.feed_id, it.amount_as_fed_kg);
            });
        } else {
            addFeedRationRow();
        }
    }

    showToast('Loaded past ration record into calculator');
}

function openLogFeedModal() {
    switchTab('feed');
    switchFeedSubTab('calculator', document.getElementById('btnSubTabFeedCalc'));
}

function openFeedCalculatorForCow(cowId) {
    switchTab('feed');
    switchFeedSubTab('calculator', document.getElementById('btnSubTabFeedCalc'));
    const sel = document.getElementById('feedCowSelect');
    if (sel) {
        sel.value = cowId;
        onFeedCowSelectionChange(cowId);
    }
}

