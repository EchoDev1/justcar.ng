-- =====================================================
-- SAFE SAMPLE DATA FOR JUSTCARS.NG
-- This script won't fail if data already exists
-- =====================================================

-- Clear existing sample data first
DELETE FROM car_images;

DELETE FROM car_videos;
DELETE FROM cars;
DELETE FROM dealers;

-- =====================================================
-- INSERT SAMPLE DEALERS (UUIDs auto-generated)
-- =====================================================

INSERT INTO dealers (name, email, phone, whatsapp, location, address, is_verified) VALUES
('Premium Motors Lagos', 'contact@premiummotors.ng', '+234 803 456 7890', '2348034567890', 'Lagos', 'Plot 45, Lekki-Epe Expressway, Lekki, Lagos', true),
('Abuja Luxury Cars', 'info@abujaluxury.ng', '+234 809 123 4567', '2348091234567', 'FCT (Abuja)', '12 Central Business District, Abuja', true),
('Port Harcourt Auto Mart', 'sales@phautomart.ng', '+234 807 890 1234', '2348078901234', 'Rivers', '88 Aba Road, Port Harcourt, Rivers State', true),
('Ibadan Car Gallery', 'ibadancars@gmail.com', '+234 805 678 9012', '2348056789012', 'Oyo', '23 Ring Road, Ibadan, Oyo State', false),
('Kano Auto Sales', 'info@kanoautos.ng', '+234 806 789 0123', '2348067890123', 'Kano', '15 Murtala Mohammed Way, Kano', true);

-- =====================================================
-- INSERT SAMPLE CARS (UUIDs auto-generated)
-- =====================================================

-- 2023 Toyota Camry
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured, inspection_report)
SELECT
  id,
  'Toyota',
  'Camry',
  2023,
  28500000,
  15000,
  'Foreign Used',
  'Sedan',
  'Petrol',
  'Automatic',
  'Silver',
  'Lagos',
  'Pristine 2023 Toyota Camry in excellent condition. This vehicle has been meticulously maintained with full service history. Features include leather interior, navigation system, reverse camera, and much more. Perfect for executives and families.

The car was imported from the USA and has cleared all customs. All documents are complete and ready for transfer.

Don''t miss this opportunity to own a premium sedan at an affordable price!',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Leather Seats", "Sunroof", "Navigation System", "Reverse Camera", "Bluetooth", "USB Port", "Touch Screen Display", "Climate Control", "Keyless Entry", "Push Start Button", "Airbags", "ABS", "Cruise Control"]'::jsonb,
  true,
  true,
  '{"engine": "Excellent", "transmission": "Excellent", "body": "Excellent", "interior": "Excellent", "ac_condition": "Working perfectly", "documents": "Complete", "notes": "Well maintained vehicle with no mechanical issues. Highly recommended.", "inspector_name": "Eng. John Okafor", "inspection_date": "2024-01-15"}'::jsonb
FROM dealers WHERE email = 'contact@premiummotors.ng';

-- 2020 Honda Accord
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Honda',
  'Accord',
  2020,
  18500000,
  42000,
  'Foreign Used',
  'Sedan',
  'Petrol',
  'Automatic',
  'Black',
  'FCT (Abuja)',
  'Clean 2020 Honda Accord Sport edition. This car is in great shape both mechanically and cosmetically. Fully loaded with premium features.

Accident-free, single owner vehicle. Regular maintenance done at authorized Honda service center. The car drives smoothly and all electronics are functioning perfectly.

Price is slightly negotiable for serious buyers.',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Fabric Seats", "Navigation System", "Reverse Camera", "Bluetooth", "Apple CarPlay", "Android Auto", "Premium Sound System", "Keyless Entry", "Push Start Button", "Airbags", "Lane Departure Warning"]'::jsonb,
  true,
  false
FROM dealers WHERE email = 'info@abujaluxury.ng';

-- 2019 Mercedes-Benz C300
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured, inspection_report)
SELECT
  id,
  'Mercedes-Benz',
  'C300',
  2019,
  32000000,
  38000,
  'Foreign Used',
  'Sedan',
  'Petrol',
  'Automatic',
  'White',
  'Lagos',
  'Luxury at its finest! 2019 Mercedes-Benz C300 with AMG package. This beauty comes with all the bells and whistles you can imagine.

Features include panoramic sunroof, premium Burmester sound system, heated/cooled seats, ambient lighting, and much more. The car has been garage kept and professionally maintained.

Full service history available. All original accessories intact. This is a must-see vehicle for luxury car enthusiasts!',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Leather Seats", "Sunroof", "Moonroof", "Navigation System", "Reverse Camera", "Parking Sensors", "Bluetooth", "Touch Screen Display", "Climate Control", "Heated Seats", "Cooled Seats", "Keyless Entry", "Push Start Button", "Premium Sound System", "Airbags", "ABS", "Traction Control", "Stability Control", "Blind Spot Monitor"]'::jsonb,
  true,
  true,
  '{"engine": "Excellent", "transmission": "Excellent", "body": "Excellent", "interior": "Excellent", "ac_condition": "Ice cold", "documents": "Complete with warranty", "notes": "Premium vehicle in showroom condition", "inspector_name": "Alhaji Musa Abubakar", "inspection_date": "2024-01-20"}'::jsonb
FROM dealers WHERE email = 'contact@premiummotors.ng';

-- 2021 Lexus RX350
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Lexus',
  'RX350',
  2021,
  42000000,
  28000,
  'Foreign Used',
  'SUV',
  'Petrol',
  'Automatic',
  'Grey',
  'Rivers',
  'Stunning 2021 Lexus RX350 F-Sport package. This luxury SUV combines comfort, performance, and reliability in one beautiful package.

The vehicle features a powerful V6 engine, adaptive suspension, premium leather interior, three-row seating, and state-of-the-art safety features. Perfect for families or business executives.

Imported from Canada, accident-free with clean title. All maintenance records available. Contact us for viewing and test drive.',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Leather Seats", "Sunroof", "Navigation System", "GPS", "Reverse Camera", "Parking Sensors", "Bluetooth", "USB Port", "Touch Screen Display", "Climate Control", "Heated Seats", "Keyless Entry", "Push Start Button", "Premium Sound System", "Airbags", "ABS", "Traction Control", "Hill Assist", "Cruise Control"]'::jsonb,
  true,
  true
FROM dealers WHERE email = 'sales@phautomart.ng';

-- 2018 Toyota Hilux
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Toyota',
  'Hilux',
  2018,
  22000000,
  65000,
  'Nigerian Used',
  'Pickup Truck',
  'Diesel',
  'Manual',
  'White',
  'Kano',
  'Rugged and reliable 2018 Toyota Hilux pickup truck. This workhorse has been well maintained and is ready for any job.

4x4 capability, diesel engine for fuel efficiency, spacious cabin, and excellent cargo capacity. Perfect for business, construction, or farming activities.

Nigerian used with first-body condition. All papers are up to date and genuine. Very strong engine and transmission. Test drive available.',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Fog Lights", "Tow Hitch", "Bed Liner", "Roll Bar", "ABS", "Airbags"]'::jsonb,
  true,
  false
FROM dealers WHERE email = 'info@kanoautos.ng';

-- 2022 BMW X5
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured, inspection_report)
SELECT
  id,
  'BMW',
  'X5',
  2022,
  58000000,
  18000,
  'Foreign Used',
  'SUV',
  'Petrol',
  'Automatic',
  'Blue',
  'FCT (Abuja)',
  'Premium 2022 BMW X5 xDrive40i with M Sport package. This exceptional SUV offers unmatched luxury, performance, and technology.

Features include gesture control, wireless charging, head-up display, 360-degree cameras, adaptive LED headlights, and much more. The interior is impeccable with Vernasca leather and carbon fiber trim.

Low mileage, one owner vehicle. Imported directly from Germany with full BMW service history. This is the ultimate driving machine!',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Leather Seats", "Sunroof", "Navigation System", "Reverse Camera", "Parking Sensors", "Bluetooth", "USB Port", "Touch Screen Display", "Climate Control", "Heated Seats", "Cooled Seats", "Keyless Entry", "Push Start Button", "Premium Sound System", "Airbags", "ABS", "Traction Control", "Lane Departure Warning", "Blind Spot Monitor", "Apple CarPlay", "Android Auto"]'::jsonb,
  true,
  true,
  '{"engine": "Excellent", "transmission": "Excellent", "body": "Perfect", "interior": "Showroom", "ac_condition": "Perfect", "documents": "Complete with warranty", "notes": "Exceptionally maintained luxury SUV", "inspector_name": "Dr. Chidi Eze", "inspection_date": "2024-01-25"}'::jsonb
FROM dealers WHERE email = 'info@abujaluxury.ng';

-- 2017 Honda CR-V
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Honda',
  'CR-V',
  2017,
  14500000,
  78000,
  'Nigerian Used',
  'SUV',
  'Petrol',
  'Automatic',
  'Red',
  'Oyo',
  'Well-maintained 2017 Honda CR-V touring edition. This family-friendly SUV offers great fuel economy and reliability.

Spacious interior with seating for 5, large cargo area, and smooth ride quality. All maintenance has been done on schedule. The vehicle has never been in an accident.

Clean Nigerian used car with genuine documents. Price is negotiable for quick sale. Serious buyers only please.',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Fabric Seats", "Sunroof", "Navigation System", "Reverse Camera", "Bluetooth", "USB Port", "Keyless Entry", "Push Start Button", "Airbags", "ABS"]'::jsonb,
  false,
  false
FROM dealers WHERE email = 'ibadancars@gmail.com';

-- 2020 Ford Explorer
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Ford',
  'Explorer',
  2020,
  35000000,
  35000,
  'Foreign Used',
  'SUV',
  'Petrol',
  'Automatic',
  'Black',
  'Rivers',
  'Powerful 2020 Ford Explorer with 3.5L EcoBoost engine. This full-size SUV offers three-row seating for up to 7 passengers.

Loaded with technology including SYNC 3 infotainment, Wi-Fi hotspot, adaptive cruise control, and more. Perfect for large families or those who need extra space.

Imported from USA, clean title, accident-free. All maintenance done at Ford service center. Don''t miss this great deal!',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Leather Seats", "Navigation System", "Reverse Camera", "Parking Sensors", "Bluetooth", "Apple CarPlay", "Android Auto", "Touch Screen Display", "Climate Control", "Keyless Entry", "Push Start Button", "Premium Sound System", "Airbags", "ABS", "Traction Control", "Cruise Control"]'::jsonb,
  true,
  false
FROM dealers WHERE email = 'sales@phautomart.ng';

-- 2019 Nissan Altima
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Nissan',
  'Altima',
  2019,
  15800000,
  52000,
  'Foreign Used',
  'Sedan',
  'Petrol',
  'Automatic',
  'Grey',
  'Lagos',
  'Reliable 2019 Nissan Altima SV model. Great fuel economy and comfortable ride make this an excellent daily driver.

Well-equipped with modern safety features including blind spot monitoring and automatic emergency braking. The 2.5L engine provides good power while maintaining efficiency.

Clean carfax report, regular oil changes, new tires. Ready for a new owner. Test drive available anytime.',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Fabric Seats", "Navigation System", "Reverse Camera", "Bluetooth", "Apple CarPlay", "Android Auto", "Keyless Entry", "Push Start Button", "Airbags", "ABS", "Blind Spot Monitor"]'::jsonb,
  true,
  false
FROM dealers WHERE email = 'contact@premiummotors.ng';

-- 2021 Hyundai Tucson
INSERT INTO cars (dealer_id, make, model, year, price, mileage, condition, body_type, fuel_type, transmission, color, location, description, features, is_verified, is_featured)
SELECT
  id,
  'Hyundai',
  'Tucson',
  2021,
  24500000,
  25000,
  'Foreign Used',
  'SUV',
  'Petrol',
  'Automatic',
  'White',
  'FCT (Abuja)',
  'Modern 2021 Hyundai Tucson with sleek design and advanced features. This compact SUV is perfect for city driving and weekend getaways.

Features include panoramic sunroof, dual-zone climate control, wireless phone charging, and comprehensive safety suite. The turbocharged engine provides spirited performance.

Excellent condition, well maintained with full service records. Hyundai warranty still valid. Great value for money!',
  '["Air Conditioning", "Power Steering", "Power Windows", "Central Locking", "Alloy Wheels", "Leather Seats", "Sunroof", "Navigation System", "Reverse Camera", "Parking Sensors", "Bluetooth", "USB Port", "Touch Screen Display", "Climate Control", "Keyless Entry", "Push Start Button", "Airbags", "ABS", "Lane Departure Warning"]'::jsonb,
  true,
  true
FROM dealers WHERE email = 'info@abujaluxury.ng';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Sample data inserted successfully!
-- You now have:
-- - 5 Dealers (4 verified, 1 unverified)
-- - 10 Cars (various makes, models, and conditions)
-- - 4 Featured cars
-- - 8 Verified cars
-- - Mix of foreign used, Nigerian used, and conditions
