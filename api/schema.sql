-- Farm Management System Database Schema & Initial Seed Data

CREATE DATABASE IF NOT EXISTS `farm_management` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `farm_management`;

-- 1. Cows / Animal Profiles
CREATE TABLE IF NOT EXISTS `cows` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `tag_number` VARCHAR(50) NOT NULL UNIQUE,
    `name` VARCHAR(100) NOT NULL,
    `breed` VARCHAR(100) NOT NULL,
    `date_of_birth` DATE NOT NULL,
    `source` ENUM('born on farm', 'purchased') DEFAULT 'born on farm',
    `parity` INT DEFAULT 0,
    `reproductive_status` ENUM('Pregnant', 'In heat', 'Fresh', 'Dry', 'Open') DEFAULT 'Open',
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
