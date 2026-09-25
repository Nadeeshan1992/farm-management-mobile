-- Initial Seed Data Matching All Requirements
USE `farm_management`;

-- Insert Cows & Bulls
INSERT INTO `cows` (`id`, `tag_number`, `name`, `breed`, `gender`, `date_of_birth`, `source`, `parity`, `reproductive_status`, `photo_url`) VALUES
(1, 'COW-101', 'Daisy', 'Holstein Friesian', 'Female', '2021-03-15', 'born on farm', 2, 'Pregnant', 'assets/cow_1.jpg'),
(2, 'COW-102', 'Bella', 'Jersey', 'Female', '2022-05-10', 'born on farm', 1, 'In heat', 'assets/cow_2.jpg'),
(3, 'COW-103', 'Luna', 'Holstein Friesian', 'Female', '2020-01-20', 'purchased', 3, 'Pregnant', 'assets/cow_3.jpg'),
(4, 'COW-104', 'Molly', 'Brown Swiss', 'Female', '2021-08-12', 'born on farm', 2, 'Fresh', 'assets/cow_4.jpg'),
(5, 'COW-105', 'Rosie', 'Holstein Friesian', 'Female', '2020-11-05', 'purchased', 3, 'Pregnant', 'assets/cow_5.jpg'),
(6, 'COW-106', 'Penny', 'Jersey', 'Female', '2022-02-14', 'born on farm', 1, 'Fresh', 'assets/cow_6.jpg'),
(7, 'COW-107', 'Maggie', 'Ayrshire', 'Female', '2021-06-22', 'born on farm', 2, 'Pregnant', 'assets/cow_7.jpg'),
(8, 'COW-108', 'Ruby', 'Holstein Friesian', 'Female', '2022-09-01', 'born on farm', 1, 'In heat', 'assets/cow_8.jpg'),
(9, 'COW-109', 'Chloe', 'Guernsey', 'Female', '2019-12-10', 'purchased', 4, 'Dry', 'assets/cow_9.jpg'),
(10, 'COW-110', 'Stella', 'Holstein Friesian', 'Female', '2021-04-18', 'born on farm', 2, 'Pregnant', 'assets/cow_10.jpg'),
(11, 'COW-111', 'Lucy', 'Jersey', 'Female', '2020-07-29', 'purchased', 3, 'Pregnant', 'assets/cow_1.jpg'),
(12, 'COW-112', 'Emma', 'Brown Swiss', 'Female', '2022-10-05', 'born on farm', 1, 'Fresh', 'assets/cow_2.jpg'),
(13, 'COW-113', 'Sadie', 'Holstein Friesian', 'Female', '2021-01-14', 'born on farm', 2, 'Pregnant', 'assets/cow_3.jpg'),
(14, 'COW-114', 'Lily', 'Jersey', 'Female', '2023-01-02', 'born on farm', 0, 'In heat', 'assets/cow_4.jpg'),
(15, 'COW-115', 'Sophie', 'Holstein Friesian', 'Female', '2020-03-30', 'purchased', 3, 'Pregnant', 'assets/cow_5.jpg'),
(16, 'COW-116', 'Grace', 'Ayrshire', 'Female', '2021-11-19', 'born on farm', 2, 'Pregnant', 'assets/cow_6.jpg'),
(17, 'COW-117', 'Zoe', 'Holstein Friesian', 'Female', '2022-04-25', 'born on farm', 1, 'Pregnant', 'assets/cow_7.jpg'),
(18, 'COW-118', 'Nala', 'Brown Swiss', 'Female', '2021-09-14', 'purchased', 2, 'Fresh', 'assets/cow_8.jpg'),
(19, 'COW-119', 'Coco', 'Jersey', 'Female', '2020-08-11', 'born on farm', 3, 'Pregnant', 'assets/cow_9.jpg'),
(20, 'COW-120', 'Hazel', 'Holstein Friesian', 'Female', '2019-05-02', 'purchased', 4, 'Dry', 'assets/cow_10.jpg'),
(21, 'COW-121', 'Willow', 'Guernsey', 'Female', '2022-07-08', 'born on farm', 1, 'Pregnant', 'assets/cow_1.jpg'),
(22, 'COW-122', 'Piper', 'Holstein Friesian', 'Female', '2021-12-03', 'born on farm', 2, 'Pregnant', 'assets/cow_2.jpg'),
(23, 'COW-123', 'Roxy', 'Jersey', 'Female', '2023-03-12', 'born on farm', 0, 'Open', 'assets/cow_3.jpg'),
(24, 'COW-124', 'Ginger', 'Ayrshire', 'Female', '2022-11-20', 'purchased', 1, 'Fresh', 'assets/cow_4.jpg'),
(25, 'BULL-101', 'Titan', 'Holstein Friesian', 'Male', '2020-05-18', 'purchased', 0, 'Breeding Sire', 'assets/cow_5.jpg'),
(26, 'BULL-102', 'Thor', 'Jersey', 'Male', '2022-08-12', 'born on farm', 0, 'Young Bull', 'assets/cow_3.jpg')
ON DUPLICATE KEY UPDATE name=VALUES(name), gender=VALUES(gender), reproductive_status=VALUES(reproductive_status);

-- Heat Records (Possible Heat: Yellow badge, AI Reminder: Red badge)
INSERT INTO `heat_records` (`cow_id`, `detection_date`, `detection_time`, `status`, `previous_heat_date`, `inter_estrus_interval`, `notes`) VALUES
(2, CURDATE(), '06:30:00', 'Possible Heat', DATE_SUB(CURDATE(), INTERVAL 21 DAY), 21, 'Mounting behavior observed, slight clear mucus discharge.'),
(14, CURDATE(), '07:15:00', 'Possible Heat', DATE_SUB(CURDATE(), INTERVAL 20 DAY), 20, 'Restless, vocalization, standing near gate.'),
(8, CURDATE(), '05:45:00', 'AI Reminder', DATE_SUB(CURDATE(), INTERVAL 21 DAY), 21, 'Standing heat confirmed. Optimal AI window: 12-18 hours from detection.');

-- Reproductive & AI Management Records
INSERT INTO `ai_records` (`cow_id`, `heat_date`, `ai_date`, `service_number`, `ai_technician`, `bull_semen_id`, `pregnancy_check_date`, `pregnancy_result`, `expected_calving_date`, `actual_calving_date`, `calving_interval`, `reproductive_problems`) VALUES
(5, DATE_SUB(CURDATE(), INTERVAL 275 DAY), DATE_SUB(CURDATE(), INTERVAL 275 DAY), 1, 'Dr. Robert Miller', 'SEM-BULL-904', DATE_SUB(CURDATE(), INTERVAL 215 DAY), 'Positive', DATE_ADD(CURDATE(), INTERVAL 8 DAY), NULL, 385, 'None'),
(3, DATE_SUB(CURDATE(), INTERVAL 272 DAY), DATE_SUB(CURDATE(), INTERVAL 272 DAY), 2, 'Dr. Sarah Jenkins', 'SEM-BULL-881', DATE_SUB(CURDATE(), INTERVAL 212 DAY), 'Positive', DATE_ADD(CURDATE(), INTERVAL 11 DAY), NULL, 392, 'Mild repeat breeder'),
(1, DATE_SUB(CURDATE(), INTERVAL 180 DAY), DATE_SUB(CURDATE(), INTERVAL 180 DAY), 1, 'Dr. Robert Miller', 'SEM-BULL-904', DATE_SUB(CURDATE(), INTERVAL 120 DAY), 'Positive', DATE_ADD(CURDATE(), INTERVAL 103 DAY), NULL, 378, 'None'),
(7, DATE_SUB(CURDATE(), INTERVAL 150 DAY), DATE_SUB(CURDATE(), INTERVAL 150 DAY), 1, 'Dr. Sarah Jenkins', 'SEM-BULL-772', DATE_SUB(CURDATE(), INTERVAL 90 DAY), 'Positive', DATE_ADD(CURDATE(), INTERVAL 133 DAY), NULL, 380, 'None'),
(10, DATE_SUB(CURDATE(), INTERVAL 45 DAY), DATE_SUB(CURDATE(), INTERVAL 45 DAY), 1, 'Dr. Robert Miller', 'SEM-BULL-904', CURDATE(), 'Pending', DATE_ADD(CURDATE(), INTERVAL 238 DAY), NULL, NULL, 'Pending check');

-- Calving Records
INSERT INTO `calving_records` (`cow_id`, `calving_date`, `calving_type`, `calf_tag_number`, `calf_sex`, `birth_weight`, `post_calving_problems`) VALUES
(4, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 'Normal', 'CALF-201', 'Heifer', 38.50, 'None'),
(6, DATE_SUB(CURDATE(), INTERVAL 18 DAY), 'Assisted', 'CALF-202', 'Bull', 42.00, 'Mild laceration, recovered'),
(12, DATE_SUB(CURDATE(), INTERVAL 12 DAY), 'Normal', 'CALF-203', 'Heifer', 36.00, 'None');

-- Milk Production Records (Showing exact example: Cow 105: Yesterday: 12.5 L, Today: 10.2 L -> Milk drop alert 18.4%)
INSERT INTO `milk_records` (`cow_id`, `record_date`, `morning_yield`, `evening_yield`, `total_yield`, `yesterday_yield`, `drop_percentage`) VALUES
(5, CURDATE(), 5.6, 4.6, 10.2, 12.5, 18.40),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 6.8, 5.7, 12.5, 13.0, 3.85),
(1, CURDATE(), 9.5, 8.5, 18.0, 18.2, 1.10),
(4, CURDATE(), 11.0, 9.8, 20.8, 21.0, 0.95),
(6, CURDATE(), 8.2, 7.5, 15.7, 16.0, 1.87),
(7, CURDATE(), 9.0, 8.2, 17.2, 17.5, 1.71),
(11, CURDATE(), 7.8, 7.0, 14.8, 15.0, 1.33),
(12, CURDATE(), 10.5, 9.5, 20.0, 20.2, 0.99),
(16, CURDATE(), 8.0, 7.4, 15.4, 15.5, 0.65),
(18, CURDATE(), 6.8, 6.1, 12.9, 13.1, 1.53);

-- Health Records (3 Active alerts: Mastitis, Lameness/Hoof rot, Ketosis)
INSERT INTO `health_records` (`cow_id`, `record_date`, `disease`, `symptoms`, `treatment`, `medicine`, `dosage`, `start_date`, `end_date`, `veterinary_visit`, `recovery_status`, `notes`) VALUES
(5, CURDATE(), 'Subclinical Mastitis', 'Swelling in right rear quarter, clot in milk, mild tenderness', 'Intramammary antibiotic infusion & anti-inflammatory', 'Cefa-Lak & Flunixin', '1 tube / 10ml IV', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 4 DAY), 'Dr. Robert Miller (Today)', 'In Treatment', 'Explains recent 18.4% drop in milk yield. Milk discarded from bulk tank.'),
(11, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Hoof Rot (Lameness)', 'Limping on right foreleg, interdigital necrosis and foul odor', 'Hoof trimming, antibacterial spray, and systemic antibiotic', 'Oxytetracycline LA', '20ml IM single shot', DATE_SUB(CURDATE(), INTERVAL 2 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Dr. Sarah Jenkins', 'In Treatment', 'Keep in dry recovery pen.'),
(18, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Bovine Ketosis', 'Rapid weight loss, reduced appetite, sweet acetone breath', 'Oral propylene glycol drench + IV Dextrose 50%', 'Propylene Glycol & Dextrose 50%', '250g BID + 500ml IV', DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Dr. Robert Miller', 'Active', 'Monitor blood beta-hydroxybutyrate levels daily.');

-- Vaccination Records (2 Due / Reminders)
INSERT INTO `vaccination_records` (`cow_id`, `vaccine_name`, `date_given`, `next_vaccination_date`, `treatment_type`, `follow_up_date`, `status`) VALUES
(5, 'Foot and Mouth Disease (FMD)', DATE_SUB(CURDATE(), INTERVAL 180 DAY), CURDATE(), 'Routine Bi-Annual', CURDATE(), 'Due'),
(11, 'Anthrax Spore Vaccine', DATE_SUB(CURDATE(), INTERVAL 360 DAY), DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Annual Booster', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'Due'),
(1, 'Brucellosis (RB51)', DATE_SUB(CURDATE(), INTERVAL 90 DAY), DATE_ADD(CURDATE(), INTERVAL 275 DAY), 'Heifer Vaccination', NULL, 'Given'),
(4, 'Clostridial 8-Way (Blackleg)', DATE_SUB(CURDATE(), INTERVAL 120 DAY), DATE_ADD(CURDATE(), INTERVAL 245 DAY), 'Annual Booster', NULL, 'Given');

-- Growth & Weight Records
INSERT INTO `growth_records` (`cow_id`, `record_date`, `weight`, `age_months`, `weight_gain`, `growth_rate`) VALUES
(23, CURDATE(), 290.00, 18, 28.00, 0.93),
(25, CURDATE(), 320.00, 19, 31.00, 1.03);

-- Heat Stress & THI Log
INSERT INTO `thi_records` (`recorded_at`, `temperature`, `humidity`, `thi_value`, `stress_level`, `notes`) VALUES
(NOW(), 30.5, 68.0, 81.2, 'Moderate Stress', 'Sprinklers and cooling fans activated in main barn.');
