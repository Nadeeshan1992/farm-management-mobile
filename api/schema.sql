-- Farm Management System Database Schema & Initial Seed Data

CREATE DATABASE IF NOT EXISTS `farm_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `farm_management`;

-- 1. Cows / Animal Profiles
CREATE TABLE IF NOT EXISTS `cows` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tag_number` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `breed` VARCHAR(100) NOT NULL,
    `gender` ENUM('Female', 'Male') NOT NULL DEFAULT 'Female',
    `date_of_birth` DATE NOT NULL,
    `source` ENUM('born on farm', 'purchased') DEFAULT 'born on farm',
    `parity` INT DEFAULT 0,
    `reproductive_status` ENUM('Pregnant', 'In heat', 'Fresh', 'Dry', 'Open', 'Breeding Sire', 'Young Bull', 'Steer', 'Heifer') DEFAULT 'Open',
    `photo_url` VARCHAR(255) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Heat / Estrus Detection
CREATE TABLE IF NOT EXISTS `heat_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `detection_date` DATE NOT NULL,
    `detection_time` TIME NOT NULL,
    `status` ENUM('Possible Heat', 'AI Reminder') NOT NULL,
    `previous_heat_date` DATE NULL,
    `inter_estrus_interval` INT NULL, -- days between heats
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 3. Reproductive & AI Management
CREATE TABLE IF NOT EXISTS `ai_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `heat_date` DATE NOT NULL,
    `ai_date` DATE NOT NULL,
    `service_number` INT DEFAULT 1,
    `ai_technician` VARCHAR(100) NOT NULL,
    `bull_semen_id` VARCHAR(100) NULL,
    `pregnancy_check_date` DATE NULL,
    `pregnancy_result` ENUM('Pending', 'Positive', 'Negative') DEFAULT 'Pending',
    `expected_calving_date` DATE NULL,
    `actual_calving_date` DATE NULL,
    `calving_interval` INT NULL, -- days
    `reproductive_problems` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 4. Calving Management
CREATE TABLE IF NOT EXISTS `calving_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `calving_date` DATE NOT NULL,
    `calving_type` ENUM('Normal', 'Assisted', 'Difficult calving') DEFAULT 'Normal',
    `calf_tag_number` VARCHAR(50) NOT NULL,
    `calf_sex` ENUM('Heifer', 'Bull') NOT NULL,
    `birth_weight` DECIMAL(5,2) NULL, -- kg
    `post_calving_problems` VARCHAR(255) DEFAULT 'None',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 5. Milk Production Records
CREATE TABLE IF NOT EXISTS `milk_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `record_date` DATE NOT NULL,
    `morning_yield` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `evening_yield` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `total_yield` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    `yesterday_yield` DECIMAL(5,2) NULL,
    `drop_percentage` DECIMAL(5,2) DEFAULT 0.00, -- e.g. 18.4%
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 6. Health & Treatment Records
CREATE TABLE IF NOT EXISTS `health_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `record_date` DATE NOT NULL,
    `disease` VARCHAR(150) NOT NULL,
    `symptoms` TEXT NOT NULL,
    `treatment` TEXT NOT NULL,
    `medicine` VARCHAR(150) NULL,
    `dosage` VARCHAR(100) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NULL,
    `veterinary_visit` VARCHAR(150) NULL,
    `recovery_status` ENUM('Active', 'In Treatment', 'Recovered', 'Chronic') DEFAULT 'Active',
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 7. Vaccination & Treatment Records
CREATE TABLE IF NOT EXISTS `vaccination_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `vaccine_name` VARCHAR(150) NOT NULL,
    `date_given` DATE NOT NULL,
    `next_vaccination_date` DATE NOT NULL,
    `treatment_type` VARCHAR(100) DEFAULT 'Routine Vaccination',
    `follow_up_date` DATE NULL,
    `status` ENUM('Given', 'Due', 'Overdue') DEFAULT 'Given',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 8. Weight & Growth Records
CREATE TABLE IF NOT EXISTS `growth_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `record_date` DATE NOT NULL,
    `weight` DECIMAL(6,2) NOT NULL, -- in kg
    `age_months` INT NOT NULL,
    `weight_gain` DECIMAL(5,2) DEFAULT 0.00,
    `growth_rate` DECIMAL(5,2) DEFAULT 0.00, -- ADG kg/day
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 9. Heat Stress & THI Monitoring
CREATE TABLE IF NOT EXISTS `thi_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `recorded_at` DATETIME NOT NULL,
    `temperature` DECIMAL(4,1) NOT NULL, -- Celsius
    `humidity` DECIMAL(4,1) NOT NULL, -- %
    `thi_value` DECIMAL(4,1) NOT NULL,
    `stress_level` ENUM('Normal', 'Mild Stress', 'Moderate Stress', 'Severe Stress', 'Emergency') NOT NULL,
    `notes` VARCHAR(255) NULL
);

-- 10. Dairy Feed Database (Nutritional Composition)
CREATE TABLE IF NOT EXISTS `feeds` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(150) NOT NULL UNIQUE,
    `category` VARCHAR(50) DEFAULT 'Forage / TMR',
    `dm_pct` DECIMAL(6,2) NOT NULL DEFAULT 90.00,       -- Dry Matter (DM %)
    `cp_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,        -- Crude Protein (% DM)
    `fat_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,       -- Crude Fat (% DM)
    `fiber_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,     -- Crude Fiber (% DM)
    `ndf_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,       -- NDF (% DM)
    `adf_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,       -- ADF (% DM)
    `starch_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,    -- Starch (% DM)
    `sugar_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,     -- Sugar (% DM)
    `ash_pct` DECIMAL(6,2) NOT NULL DEFAULT 0.00,       -- Ash (% DM)
    `ca_pct` DECIMAL(6,3) NOT NULL DEFAULT 0.000,      -- Calcium (Ca % DM)
    `p_pct` DECIMAL(6,3) NOT NULL DEFAULT 0.000,       -- Phosphorus (P % DM)
    `mg_pct` DECIMAL(6,3) NOT NULL DEFAULT 0.000,      -- Magnesium (Mg % DM)
    `k_pct` DECIMAL(6,3) NOT NULL DEFAULT 0.000,       -- Potassium (K % DM)
    `na_pct` DECIMAL(6,3) NOT NULL DEFAULT 0.000,      -- Sodium (Na % DM)
    `s_pct` DECIMAL(6,3) NOT NULL DEFAULT 0.000,       -- Sulfur (S % DM)
    `me_mj` DECIMAL(6,2) NOT NULL DEFAULT 0.00,        -- ME (MJ/kg DM)
    `nel_mj` DECIMAL(6,2) NOT NULL DEFAULT 0.00,       -- NEL (MJ/kg DM)
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 11. Daily Feed Logs (Aggregated per cow & day)
CREATE TABLE IF NOT EXISTS `daily_feed_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `cow_id` INT NOT NULL,
    `log_date` DATE NOT NULL,
    `total_as_fed_kg` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_dm_kg` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_cp_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_fat_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_fiber_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_ndf_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_adf_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_starch_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_sugar_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_ash_kg` DECIMAL(8,3) NOT NULL DEFAULT 0.000,
    `total_ca_g` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_p_g` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_mg_g` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_k_g` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_na_g` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_s_g` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_me_mj` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `total_nel_mj` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    `notes` TEXT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`cow_id`) REFERENCES `cows`(`id`) ON DELETE CASCADE
);

-- 12. Daily Feed Line Items (Per feed breakdown)
CREATE TABLE IF NOT EXISTS `daily_feed_items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `feed_log_id` INT NOT NULL,
    `feed_id` INT NULL,
    `feed_name` VARCHAR(150) NOT NULL,
    `amount_as_fed_kg` DECIMAL(8,2) NOT NULL,
    `dm_intake_kg` DECIMAL(8,2) NOT NULL,
    `cp_intake_kg` DECIMAL(8,3) NOT NULL,
    `fat_intake_kg` DECIMAL(8,3) NOT NULL,
    `fiber_intake_kg` DECIMAL(8,3) NOT NULL,
    `ndf_intake_kg` DECIMAL(8,3) NOT NULL,
    `adf_intake_kg` DECIMAL(8,3) NOT NULL,
    `starch_intake_kg` DECIMAL(8,3) NOT NULL,
    `sugar_intake_kg` DECIMAL(8,3) NOT NULL,
    `ash_intake_kg` DECIMAL(8,3) NOT NULL,
    `ca_intake_g` DECIMAL(8,2) NOT NULL,
    `p_intake_g` DECIMAL(8,2) NOT NULL,
    `mg_intake_g` DECIMAL(8,2) NOT NULL,
    `k_intake_g` DECIMAL(8,2) NOT NULL,
    `na_intake_g` DECIMAL(8,2) NOT NULL,
    `s_intake_g` DECIMAL(8,2) NOT NULL,
    `me_intake_mj` DECIMAL(8,2) NOT NULL,
    `nel_intake_mj` DECIMAL(8,2) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`feed_log_id`) REFERENCES `daily_feed_logs`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON DELETE SET NULL
);
