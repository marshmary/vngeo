-- Sample Quiz Data for Vietnam Economic Zones
-- Run this in Supabase SQL Editor after creating the schema
-- NOTE: Replace 'YOUR_USER_ID_HERE' with an actual user ID from auth.users table

-- You can get a user ID by running: SELECT id FROM auth.users LIMIT 1;

-- Variables (replace with actual values)
-- For this script to work, first run: SELECT id FROM auth.users LIMIT 1;
-- Then replace the user_id in the INSERT statements below

-- Quiz 1: Vietnam Economic Zones - Basic Knowledge
INSERT INTO quizzes (id, title, description, difficulty, status, time_limit, created_by)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Vietnam Economic Zones - Basic Knowledge',
  'Test your understanding of the fundamental concepts of Vietnam''s economic zones and their role in national development.',
  'easy',
  'published',
  15,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Quiz 1 Questions
INSERT INTO quiz_questions (id, quiz_id, question, explanation, allow_multiple_answers, order_index)
VALUES
  (
    '11111111-1111-1111-1111-111111111101',
    '11111111-1111-1111-1111-111111111111',
    'What is the primary purpose of establishing economic zones in Vietnam?',
    'Economic zones are established to attract foreign investment, promote exports, and create employment opportunities while developing specific industries and technologies.',
    false,
    1
  ),
  (
    '11111111-1111-1111-1111-111111111102',
    '11111111-1111-1111-1111-111111111111',
    'Which of the following is one of the key economic zones in Southern Vietnam?',
    'The Southern Key Economic Zone includes Ho Chi Minh City and surrounding provinces, forming Vietnam''s largest economic hub.',
    false,
    2
  ),
  (
    '11111111-1111-1111-1111-111111111103',
    '11111111-1111-1111-1111-111111111111',
    'What benefits do companies typically receive in Vietnam''s economic zones?',
    'Companies in economic zones enjoy various incentives including tax breaks, simplified customs procedures, and better infrastructure to encourage investment and growth.',
    true,
    3
  ),
  (
    '11111111-1111-1111-1111-111111111104',
    '11111111-1111-1111-1111-111111111111',
    'Which year marked a significant milestone in Vietnam''s economic zone development policy?',
    '2006 was significant as it marked the implementation of comprehensive regulations for economic zones, accelerating their development nationwide.',
    false,
    4
  ),
  (
    '11111111-1111-1111-1111-111111111105',
    '11111111-1111-1111-1111-111111111111',
    'What role do coastal economic zones play in Vietnam''s economy?',
    'Coastal economic zones leverage Vietnam''s strategic maritime location to facilitate international trade, develop shipping industries, and attract export-oriented manufacturing.',
    false,
    5
  );

-- Quiz 1 Options
INSERT INTO quiz_options (question_id, text, is_correct, order_index)
VALUES
  -- Q1 Options
  ('11111111-1111-1111-1111-111111111101', 'To attract foreign investment and promote economic development', true, 1),
  ('11111111-1111-1111-1111-111111111101', 'To restrict foreign businesses from entering the market', false, 2),
  ('11111111-1111-1111-1111-111111111101', 'To increase taxes on local businesses', false, 3),
  ('11111111-1111-1111-1111-111111111101', 'To limit industrial development', false, 4),

  -- Q2 Options
  ('11111111-1111-1111-1111-111111111102', 'Southern Key Economic Zone (Ho Chi Minh City area)', true, 1),
  ('11111111-1111-1111-1111-111111111102', 'Hanoi Capital Region', false, 2),
  ('11111111-1111-1111-1111-111111111102', 'Central Highlands Economic Zone', false, 3),
  ('11111111-1111-1111-1111-111111111102', 'Mekong River Delta Zone', false, 4),

  -- Q3 Options (Multiple answers)
  ('11111111-1111-1111-1111-111111111103', 'Tax incentives and exemptions', true, 1),
  ('11111111-1111-1111-1111-111111111103', 'Streamlined customs procedures', true, 2),
  ('11111111-1111-1111-1111-111111111103', 'Modern infrastructure facilities', true, 3),
  ('11111111-1111-1111-1111-111111111103', 'Higher corporate tax rates', false, 4),

  -- Q4 Options
  ('11111111-1111-1111-1111-111111111104', '2006', true, 1),
  ('11111111-1111-1111-1111-111111111104', '1995', false, 2),
  ('11111111-1111-1111-1111-111111111104', '2010', false, 3),
  ('11111111-1111-1111-1111-111111111104', '2015', false, 4),

  -- Q5 Options
  ('11111111-1111-1111-1111-111111111105', 'Facilitating international trade and export-oriented industries', true, 1),
  ('11111111-1111-1111-1111-111111111105', 'Focusing solely on agriculture development', false, 2),
  ('11111111-1111-1111-1111-111111111105', 'Restricting maritime activities', false, 3),
  ('11111111-1111-1111-1111-111111111105', 'Promoting only domestic trade', false, 4);

-- Quiz 2: Industrial Parks and Export Processing Zones
INSERT INTO quizzes (id, title, description, difficulty, status, time_limit, created_by)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Industrial Parks and Export Processing Zones',
  'Explore the characteristics and functions of Vietnam''s industrial parks and export processing zones.',
  'medium',
  'published',
  20,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Quiz 2 Questions
INSERT INTO quiz_questions (id, quiz_id, question, explanation, allow_multiple_answers, order_index)
VALUES
  (
    '22222222-2222-2222-2222-222222222201',
    '22222222-2222-2222-2222-222222222222',
    'What is the main difference between an Industrial Park (IP) and an Export Processing Zone (EPZ)?',
    'EPZs are specifically designed for export-oriented production with special customs privileges, while IPs can serve both domestic and export markets with more flexible operations.',
    false,
    1
  ),
  (
    '22222222-2222-2222-2222-222222222202',
    '22222222-2222-2222-2222-222222222222',
    'Which sectors are commonly found in Vietnam''s industrial parks?',
    'Vietnam''s industrial parks host diverse sectors including electronics, textiles, food processing, and automotive industries to create a balanced industrial ecosystem.',
    true,
    2
  ),
  (
    '22222222-2222-2222-2222-222222222203',
    '22222222-2222-2222-2222-222222222222',
    'What infrastructure requirements must industrial parks meet?',
    'Industrial parks must provide comprehensive infrastructure including power, water, waste treatment, roads, and telecommunications to support industrial operations.',
    true,
    3
  ),
  (
    '22222222-2222-2222-2222-222222222204',
    '22222222-2222-2222-2222-222222222222',
    'Which province is known for having the highest concentration of industrial parks in Northern Vietnam?',
    'Bac Ninh province has emerged as a major industrial hub in Northern Vietnam, hosting numerous industrial parks with significant foreign investment, particularly in electronics manufacturing.',
    false,
    4
  ),
  (
    '22222222-2222-2222-2222-222222222205',
    '22222222-2222-2222-2222-222222222222',
    'What environmental requirements must industrial parks comply with?',
    'Industrial parks must implement comprehensive environmental protection measures including waste treatment systems, emissions control, and environmental impact assessments.',
    false,
    5
  ),
  (
    '22222222-2222-2222-2222-222222222206',
    '22222222-2222-2222-2222-222222222222',
    'What is the typical corporate income tax rate for enterprises in export processing zones?',
    'Enterprises in EPZs typically enjoy preferential tax rates of 10% for 15 years, compared to the standard 20% rate, to encourage export-oriented production.',
    false,
    6
  );

-- Quiz 2 Options
INSERT INTO quiz_options (question_id, text, is_correct, order_index)
VALUES
  -- Q1 Options
  ('22222222-2222-2222-2222-222222222201', 'EPZs focus on export production with customs privileges, IPs serve both markets', true, 1),
  ('22222222-2222-2222-2222-222222222201', 'There is no difference between them', false, 2),
  ('22222222-2222-2222-2222-222222222201', 'IPs are only for foreign companies, EPZs are for domestic companies', false, 3),
  ('22222222-2222-2222-2222-222222222201', 'EPZs are larger than IPs', false, 4),

  -- Q2 Options (Multiple answers)
  ('22222222-2222-2222-2222-222222222202', 'Electronics and technology', true, 1),
  ('22222222-2222-2222-2222-222222222202', 'Textiles and garments', true, 2),
  ('22222222-2222-2222-2222-222222222202', 'Food processing', true, 3),
  ('22222222-2222-2222-2222-222222222202', 'Space exploration', false, 4),

  -- Q3 Options (Multiple answers)
  ('22222222-2222-2222-2222-222222222203', 'Reliable power supply', true, 1),
  ('22222222-2222-2222-2222-222222222203', 'Water and waste treatment systems', true, 2),
  ('22222222-2222-2222-2222-222222222203', 'Road and telecommunications infrastructure', true, 3),
  ('22222222-2222-2222-2222-222222222203', 'Shopping malls and entertainment centers', false, 4),

  -- Q4 Options
  ('22222222-2222-2222-2222-222222222204', 'Bac Ninh', true, 1),
  ('22222222-2222-2222-2222-222222222204', 'Hanoi', false, 2),
  ('22222222-2222-2222-2222-222222222204', 'Hai Phong', false, 3),
  ('22222222-2222-2222-2222-222222222204', 'Quang Ninh', false, 4),

  -- Q5 Options
  ('22222222-2222-2222-2222-222222222205', 'Comprehensive environmental protection and waste treatment measures', true, 1),
  ('22222222-2222-2222-2222-222222222205', 'No environmental requirements', false, 2),
  ('22222222-2222-2222-2222-222222222205', 'Only air quality monitoring', false, 3),
  ('22222222-2222-2222-2222-222222222205', 'Environmental requirements are optional', false, 4),

  -- Q6 Options
  ('22222222-2222-2222-2222-222222222206', '10% for 15 years', true, 1),
  ('22222222-2222-2222-2222-222222222206', '20% standard rate', false, 2),
  ('22222222-2222-2222-2222-222222222206', '5% for 10 years', false, 3),
  ('22222222-2222-2222-2222-222222222206', '15% for 20 years', false, 4);

-- Quiz 3: Investment and Business in Economic Zones
INSERT INTO quizzes (id, title, description, difficulty, status, time_limit, created_by)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Investment and Business in Economic Zones',
  'Advanced knowledge about investment procedures, regulations, and business operations in Vietnam''s economic zones.',
  'hard',
  'published',
  25,
  (SELECT id FROM auth.users LIMIT 1)
);

-- Quiz 3 Questions
INSERT INTO quiz_questions (id, quiz_id, question, explanation, allow_multiple_answers, order_index)
VALUES
  (
    '33333333-3333-3333-3333-333333333301',
    '33333333-3333-3333-3333-333333333333',
    'What documents are typically required for foreign investors to establish a business in an economic zone?',
    'Foreign investors must provide comprehensive documentation including investment certificates, business licenses, capital proof, and project proposals to ensure compliance with Vietnamese regulations.',
    true,
    1
  ),
  (
    '33333333-3333-3333-3333-333333333302',
    '33333333-3333-3333-3333-333333333333',
    'How long is the typical tax exemption period for priority sectors in economic zones?',
    'Priority sectors such as high-tech, environmental protection, and R&D typically receive 4 years of tax exemption followed by 50% reduction for the next 9 years.',
    false,
    2
  ),
  (
    '33333333-3333-3333-3333-333333333303',
    '33333333-3333-3333-3333-333333333333',
    'Which of the following are considered priority investment sectors in Vietnam''s economic zones?',
    'Vietnam prioritizes high-tech industries, renewable energy, supporting industries, and R&D to drive technological advancement and sustainable development.',
    true,
    3
  ),
  (
    '33333333-3333-3333-3333-333333333304',
    '33333333-3333-3333-3333-333333333333',
    'What is the minimum capital requirement for foreign-invested projects in most economic zones?',
    'While requirements vary by sector and project type, many economic zones have minimum capital requirements around $2-5 million USD to ensure substantial investment and commitment.',
    false,
    4
  ),
  (
    '33333333-3333-3333-3333-333333333305',
    '33333333-3333-3333-3333-333333333333',
    'What are the key advantages of the "One-Stop Shop" mechanism in economic zones?',
    'The One-Stop Shop mechanism streamlines administrative procedures by consolidating multiple government services in one location, significantly reducing processing time and bureaucratic complexity.',
    true,
    5
  ),
  (
    '33333333-3333-3333-3333-333333333306',
    '33333333-3333-3333-3333-333333333333',
    'Which international agreements does Vietnam participate in that benefit economic zone businesses?',
    'Vietnam''s participation in CPTPP, EVFTA, and RCEP provides economic zone businesses with enhanced market access, reduced tariffs, and streamlined trade procedures across major markets.',
    true,
    6
  ),
  (
    '33333333-3333-3333-3333-333333333307',
    '33333333-3333-3333-3333-333333333333',
    'What is the maximum land lease term for industrial projects in economic zones?',
    'Industrial projects can typically lease land for up to 50 years with possible extensions, providing long-term stability for major investments and infrastructure development.',
    false,
    7
  );

-- Quiz 3 Options
INSERT INTO quiz_options (question_id, text, is_correct, order_index)
VALUES
  -- Q1 Options (Multiple answers)
  ('33333333-3333-3333-3333-333333333301', 'Investment Registration Certificate', true, 1),
  ('33333333-3333-3333-3333-333333333301', 'Business Registration Certificate', true, 2),
  ('33333333-3333-3333-3333-333333333301', 'Capital verification documents', true, 3),
  ('33333333-3333-3333-3333-333333333301', 'Driver''s license', false, 4),

  -- Q2 Options
  ('33333333-3333-3333-3333-333333333302', '4 years exemption + 9 years 50% reduction', true, 1),
  ('33333333-3333-3333-3333-333333333302', '2 years exemption + 4 years 50% reduction', false, 2),
  ('33333333-3333-3333-3333-333333333303', '10 years full exemption', false, 3),
  ('33333333-3333-3333-3333-333333333302', 'No tax exemption available', false, 4),

  -- Q3 Options (Multiple answers)
  ('33333333-3333-3333-3333-333333333303', 'High-technology industries', true, 1),
  ('33333333-3333-3333-3333-333333333303', 'Renewable energy projects', true, 2),
  ('33333333-3333-3333-3333-333333333303', 'Supporting industries for manufacturing', true, 3),
  ('33333333-3333-3333-3333-333333333303', 'Traditional handicrafts only', false, 4),

  -- Q4 Options
  ('33333333-3333-3333-3333-333333333304', 'Varies, but often $2-5 million USD', true, 1),
  ('33333333-3333-3333-3333-333333333304', '$100,000 USD', false, 2),
  ('33333333-3333-3333-3333-333333333304', '$50 million USD', false, 3),
  ('33333333-3333-3333-3333-333333333304', 'No minimum requirement', false, 4),

  -- Q5 Options (Multiple answers)
  ('33333333-3333-3333-3333-333333333305', 'Centralized administrative services', true, 1),
  ('33333333-3333-3333-3333-333333333305', 'Reduced processing time', true, 2),
  ('33333333-3333-3333-3333-333333333305', 'Simplified procedures', true, 3),
  ('33333333-3333-3333-3333-333333333305', 'Higher fees for faster service', false, 4),

  -- Q6 Options (Multiple answers)
  ('33333333-3333-3333-3333-333333333306', 'CPTPP (Comprehensive and Progressive Agreement for Trans-Pacific Partnership)', true, 1),
  ('33333333-3333-3333-3333-333333333306', 'EVFTA (EU-Vietnam Free Trade Agreement)', true, 2),
  ('33333333-3333-3333-3333-333333333306', 'RCEP (Regional Comprehensive Economic Partnership)', true, 3),
  ('33333333-3333-3333-3333-333333333306', 'Antarctic Treaty', false, 4),

  -- Q7 Options
  ('33333333-3333-3333-3333-333333333307', 'Up to 50 years with possible extension', true, 1),
  ('33333333-3333-3333-3333-333333333307', '10 years maximum', false, 2),
  ('33333333-3333-3333-3333-333333333307', '99 years', false, 3),
  ('33333333-3333-3333-3333-333333333307', '25 years fixed', false, 4);

-- Success message
SELECT 'Sample quiz data inserted successfully!' as message,
       COUNT(*) as total_quizzes FROM quizzes WHERE id IN (
         '11111111-1111-1111-1111-111111111111',
         '22222222-2222-2222-2222-222222222222',
         '33333333-3333-3333-3333-333333333333'
       );
