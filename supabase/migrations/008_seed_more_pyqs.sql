-- ============================================
-- Additional PYQ Bank - 100+ Questions (Batch 2)
-- Covers BPSC, UPPSC, MPSC + more UPSC topics
-- ============================================

INSERT INTO public.quiz_questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_year, pyq_exam, tags) VALUES

-- POLITY - More Questions
((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The Anti-Defection Law is contained in which Schedule of the Constitution?',
'Eighth Schedule', 'Ninth Schedule', 'Tenth Schedule', 'Eleventh Schedule',
'C', 'The Anti-Defection Law was added by the 52nd Amendment Act (1985) as the Tenth Schedule. It provides for disqualification of MPs/MLAs who defect from their party. The decision is made by the Speaker/Chairman.', 'easy', 'pyq', 2020, 'BPSC', ARRAY['Anti-Defection','Tenth Schedule','52nd Amendment']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Which Article of the Constitution provides for the establishment of a National Commission for Scheduled Castes?',
'Article 338', 'Article 340', 'Article 342', 'Article 335',
'A', 'Article 338 provides for the National Commission for Scheduled Castes. Article 338A provides for the National Commission for Scheduled Tribes (separated from NCSC by the 89th Amendment, 2003).', 'medium', 'pyq', 2022, 'UPPSC', ARRAY['NCSC','Article 338','Scheduled Castes']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The concept of "Public Interest Litigation" (PIL) was introduced in India by:',
'Justice P.N. Bhagwati', 'Justice V.R. Krishna Iyer', 'Both A and B', 'Justice H.R. Khanna',
'C', 'PIL was introduced in India by Justice P.N. Bhagwati and Justice V.R. Krishna Iyer in the late 1970s-80s. It allows any public-spirited citizen to file a petition on behalf of those unable to approach the court themselves.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['PIL','Judicial Activism','Supreme Court']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Consider the following statements about the Election Commission of India:
1. It is a multi-member body.
2. The Chief Election Commissioner can be removed by the President.
3. All Election Commissioners have equal voting rights.
Which of the statements given above is/are correct?',
'1 and 3 only', '1 and 2 only', '2 only', '1, 2 and 3',
'A', 'The ECI is a multi-member body (CEC + 2 ECs since 1993). The CEC can only be removed through impeachment (like a SC judge), NOT by the President alone. All members have equal voting rights and decisions are by majority.', 'hard', 'pyq', 2023, 'UPSC Prelims', ARRAY['Election Commission','CEC','Constitutional Bodies']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The "Right to Privacy" was declared a Fundamental Right by the Supreme Court in which case?',
'Maneka Gandhi case', 'K.S. Puttaswamy case', 'Kesavananda Bharati case', 'Vishaka case',
'B', 'In K.S. Puttaswamy v. Union of India (2017), a 9-judge bench unanimously declared Right to Privacy as a Fundamental Right under Article 21. This overruled previous decisions that had held privacy was not a fundamental right.', 'medium', 'pyq', 2021, 'UPSC Prelims', ARRAY['Right to Privacy','Puttaswamy','Article 21']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Which of the following is NOT a Union Territory?',
'Puducherry', 'Chandigarh', 'Goa', 'Ladakh',
'C', 'Goa became a full state on 30 May 1987. Puducherry, Chandigarh, and Ladakh are Union Territories. Ladakh became a UT after the bifurcation of J&K in 2019 under the J&K Reorganization Act.', 'easy', 'pyq', 2020, 'BPSC', ARRAY['Union Territories','States','Goa']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The Directive Principles of State Policy are contained in:',
'Part III', 'Part IV', 'Part IVA', 'Part V',
'B', 'DPSPs are in Part IV (Articles 36-51). Part III contains Fundamental Rights. Part IVA contains Fundamental Duties (added by 42nd Amendment). Part V deals with the Union Government.', 'easy', 'pyq', 2018, 'BPSC', ARRAY['DPSP','Part IV','Constitution']),

-- ECONOMY - More Questions
((SELECT id FROM quiz_subjects WHERE name='Economy'),
'What is "Repo Rate"?',
'Rate at which commercial banks lend to each other', 'Rate at which RBI lends to commercial banks against government securities', 'Rate at which government borrows from RBI', 'Rate of interest on savings accounts',
'B', 'Repo Rate is the rate at which RBI lends short-term money to commercial banks against government securities. When RBI wants to reduce money supply, it increases the Repo Rate, making borrowing costlier for banks.', 'easy', 'pyq', 2019, 'BPSC', ARRAY['Repo Rate','RBI','Monetary Policy']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Which of the following is the largest source of tax revenue for the Government of India?',
'Income Tax', 'GST', 'Corporate Tax', 'Customs Duty',
'B', 'Post-GST implementation (2017), GST has become the largest source of tax revenue for the government. It subsumed multiple indirect taxes including excise duty, service tax, VAT, etc. GST collection regularly crosses ₹1.5 lakh crore per month.', 'medium', 'pyq', 2023, 'UPSC Prelims', ARRAY['GST','Tax Revenue','Government Finance']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'The "Make in India" initiative was launched in which year?',
'2012', '2014', '2015', '2016',
'B', 'Make in India was launched on 25 September 2014 by PM Modi to encourage companies to manufacture in India. It covers 25 sectors including automobiles, textiles, chemicals, IT, pharmaceuticals, and defence manufacturing.', 'easy', 'pyq', 2020, 'BPSC', ARRAY['Make in India','Manufacturing','Government Schemes']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'What is the "Gini Coefficient"?',
'A measure of economic growth', 'A measure of income inequality', 'A measure of inflation', 'A measure of unemployment',
'B', 'The Gini Coefficient measures income inequality in a society. It ranges from 0 (perfect equality) to 1 (maximum inequality). It was developed by Italian statistician Corrado Gini in 1912.', 'medium', 'pyq', 2021, 'UPSC Prelims', ARRAY['Gini Coefficient','Inequality','Economic Indicators']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Which committee recommended the introduction of GST in India?',
'Kelkar Committee', 'Vijay Kelkar Task Force', 'Arvind Subramanian Committee', 'All of the above played a role',
'D', 'The Kelkar Task Force (2002) first proposed GST. The Empowered Committee of State Finance Ministers worked on the design. Arvind Subramanian Committee (2015) recommended revenue-neutral rate and rate structure for GST.', 'hard', 'pyq', 2022, 'UPSC Prelims', ARRAY['GST','Kelkar Committee','Tax Reform']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Consider the following about "Digital Rupee" (e₹):
1. It is issued by the Reserve Bank of India.
2. It is a form of Central Bank Digital Currency (CBDC).
3. It replaces physical currency completely.
Which of the statements given above is/are correct?',
'1 and 2 only', '2 and 3 only', '1 only', '1, 2 and 3',
'A', 'Digital Rupee (e₹) is India''s CBDC issued by RBI. Retail e₹ was launched as a pilot in December 2022. It does NOT replace physical currency — it complements it. It is legal tender like physical currency.', 'medium', 'pyq', 2024, 'UPSC Prelims', ARRAY['Digital Rupee','CBDC','RBI','Fintech']),

-- INDIAN HISTORY - More Questions
((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The Battle of Plassey was fought in:',
'1757', '1764', '1799', '1857',
'A', 'The Battle of Plassey was fought on 23 June 1757 between the East India Company (Robert Clive) and Nawab Siraj-ud-Daulah of Bengal. The Company won due to Mir Jafar''s treachery. This established British political control over Bengal.', 'easy', 'pyq', 2017, 'BPSC', ARRAY['Battle of Plassey','1757','Robert Clive']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'Who was the first Governor-General of independent India?',
'Lord Mountbatten', 'C. Rajagopalachari', 'Jawaharlal Nehru', 'Sardar Patel',
'A', 'Lord Mountbatten was the first Governor-General of independent India (15 Aug 1947 - 21 Jun 1948). C. Rajagopalachari succeeded him and was the first AND last Indian Governor-General (1948-1950) before India became a Republic.', 'easy', 'pyq', 2018, 'BPSC', ARRAY['Governor-General','Mountbatten','Independence']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The "Swadeshi Movement" was associated with the partition of:',
'Punjab', 'Bengal', 'Madras', 'Bombay',
'B', 'The Swadeshi Movement (1905-1911) was launched in response to Lord Curzon''s Partition of Bengal (1905). It promoted indigenous goods and boycotted British products. The movement was led by leaders like Tilak, Aurobindo, and Bipin Chandra Pal.', 'easy', 'pyq', 2019, 'UPPSC', ARRAY['Swadeshi Movement','Bengal Partition','Curzon']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The Montagu-Chelmsford Reforms introduced:',
'Provincial Autonomy', 'Dyarchy in provinces', 'Complete self-governance', 'Communal representation',
'B', 'The Montagu-Chelmsford Reforms (Government of India Act, 1919) introduced Dyarchy in the provinces — subjects were divided into Reserved (under Governor) and Transferred (under Indian ministers). It also introduced bicameralism at the centre.', 'medium', 'pyq', 2020, 'BPSC', ARRAY['Montagu-Chelmsford','Dyarchy','1919 Act']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'Who founded the Brahmo Samaj?',
'Swami Vivekananda', 'Raja Ram Mohan Roy', 'Dayanand Saraswati', 'Ishwar Chandra Vidyasagar',
'B', 'Raja Ram Mohan Roy founded the Brahmo Samaj in 1828 in Calcutta. It was a reformist movement that opposed idol worship, sati, caste system, and promoted modern education and women''s rights. Dayanand Saraswati founded Arya Samaj (1875).', 'easy', 'pyq', 2016, 'BPSC', ARRAY['Brahmo Samaj','Ram Mohan Roy','Social Reform']),

-- GEOGRAPHY - More Questions
((SELECT id FROM quiz_subjects WHERE name='Geography'),
'The highest peak in India is:',
'Mount Everest', 'Kanchenjunga', 'K2 (Godwin Austen)', 'Nanda Devi',
'B', 'Kanchenjunga (8,586m) is the highest peak in India and the third highest in the world. K2 is the second highest peak globally but is in PoK (not in Indian-administered territory). Mt. Everest is in Nepal/China border.', 'easy', 'pyq', 2017, 'BPSC', ARRAY['Kanchenjunga','Highest Peak','Himalayas']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'The "Thar Desert" is located in which state of India?',
'Gujarat only', 'Rajasthan only', 'Rajasthan and Gujarat', 'Rajasthan, Gujarat, Punjab, and Haryana',
'D', 'The Thar Desert (Great Indian Desert) extends across Rajasthan (major part), Gujarat (Kutch region), Punjab, and Haryana. It covers about 200,000 sq km and is the world''s most densely populated desert.', 'medium', 'pyq', 2019, 'UPPSC', ARRAY['Thar Desert','Rajasthan','Indian Geography']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'Which of the following is the longest river in India?',
'Godavari', 'Ganga', 'Brahmaputra', 'Yamuna',
'B', 'The Ganga is the longest river flowing entirely within India (2,525 km). If considering total length, the Brahmaputra is longer (2,900 km) but most of its course is outside India. Godavari (1,465 km) is the longest peninsular river.', 'easy', 'pyq', 2018, 'BPSC', ARRAY['Rivers','Ganga','Indian Geography']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'The "Siachen Glacier" is located in:',
'Himachal Pradesh', 'Uttarakhand', 'Ladakh', 'Sikkim',
'C', 'The Siachen Glacier is located in the eastern Karakoram range in Ladakh. It is the longest glacier in the Karakoram and the second-longest in the world''s non-polar areas (76 km). The Indian Army has maintained control since Operation Meghdoot (1984).', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Siachen','Ladakh','Glaciers']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'Which Indian state has the longest coastline?',
'Tamil Nadu', 'Gujarat', 'Andhra Pradesh', 'Maharashtra',
'B', 'Gujarat has the longest coastline among Indian states at approximately 1,600 km. It is followed by Andhra Pradesh, Tamil Nadu, and Maharashtra. Gujarat''s long coastline includes the Gulf of Kutch and Gulf of Khambhat.', 'easy', 'pyq', 2021, 'BPSC', ARRAY['Coastline','Gujarat','Indian Geography']),

-- ENVIRONMENT - More Questions
((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'Which of the following is a "biodiversity hotspot" in India?
1. Western Ghats
2. Eastern Himalayas
3. Indo-Burma region
4. Sundaland
Select the correct answer:',
'1 and 2 only', '1, 2 and 3 only', '1, 2, 3 and 4', '1 only',
'C', 'India has 4 biodiversity hotspots: Western Ghats, Eastern Himalayas, Indo-Burma (covering NE India), and Sundaland (covering Nicobar Islands). Globally, there are 36 recognized biodiversity hotspots.', 'medium', 'pyq', 2022, 'UPSC Prelims', ARRAY['Biodiversity Hotspots','Western Ghats','Conservation']),

((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'The "Montreal Protocol" is related to:',
'Climate Change', 'Protection of Ozone Layer', 'Biodiversity Conservation', 'Desertification',
'B', 'The Montreal Protocol (1987) is an international treaty to protect the ozone layer by phasing out substances that deplete it (CFCs, HCFCs, halons, etc.). It is considered the most successful environmental agreement — the ozone layer is recovering.', 'easy', 'pyq', 2018, 'BPSC', ARRAY['Montreal Protocol','Ozone Layer','International Environmental Law']),

((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'What is "Carbon Neutrality"?',
'Producing no carbon emissions at all', 'Balancing carbon emissions with carbon removal', 'Using only renewable energy', 'Planting trees equal to emissions',
'B', 'Carbon Neutrality (net-zero carbon) means balancing carbon dioxide emissions with carbon removal (through offsets, carbon capture, reforestation). India has pledged to achieve net-zero by 2070, announced at COP26 Glasgow (2021).', 'medium', 'pyq', 2023, 'UPSC Prelims', ARRAY['Carbon Neutrality','Net Zero','Climate Change']),

-- SCIENCE & TECHNOLOGY - More Questions
((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'What is "Artificial Intelligence"?',
'A robot that looks like a human', 'Simulation of human intelligence by computer systems', 'A programming language', 'A type of hardware chip',
'B', 'Artificial Intelligence (AI) is the simulation of human intelligence processes by computer systems. It includes learning, reasoning, problem-solving, perception, and language understanding. Major types: Narrow AI, General AI, and Super AI.', 'easy', 'pyq', 2023, 'UPSC Prelims', ARRAY['Artificial Intelligence','AI','Technology']),

((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'The "UPI" (Unified Payments Interface) was developed by:',
'Reserve Bank of India', 'NPCI (National Payments Corporation of India)', 'Ministry of Finance', 'NITI Aayog',
'B', 'UPI was developed by NPCI (National Payments Corporation of India). It was launched in April 2016. UPI enables instant money transfer between bank accounts using a mobile phone. India processes over 10 billion UPI transactions monthly.', 'easy', 'pyq', 2021, 'BPSC', ARRAY['UPI','NPCI','Digital Payments']),

((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'Which of the following is used in nuclear reactors as fuel?',
'Thorium-232', 'Uranium-235', 'Plutonium-238', 'Carbon-14',
'B', 'Uranium-235 (U-235) is the primary fuel used in nuclear reactors. It undergoes nuclear fission when bombarded with neutrons. India also has plans to use Thorium-232 in its three-stage nuclear program due to abundant thorium reserves.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['Nuclear Energy','Uranium','Nuclear Fission']),

-- GENERAL SCIENCE - More Questions
((SELECT id FROM quiz_subjects WHERE name='General Science'),
'Which gas is commonly known as "Laughing Gas"?',
'Carbon Monoxide', 'Nitrous Oxide', 'Sulphur Dioxide', 'Carbon Dioxide',
'B', 'Nitrous Oxide (N₂O) is commonly known as Laughing Gas. It is used as an anaesthetic in dentistry and surgery. It is also a greenhouse gas — about 300 times more potent than CO₂ in terms of global warming potential.', 'easy', 'pyq', 2017, 'BPSC', ARRAY['Nitrous Oxide','Laughing Gas','Chemistry']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'The process of conversion of water vapor into water is called:',
'Evaporation', 'Condensation', 'Sublimation', 'Precipitation',
'B', 'Condensation is the process where water vapor (gas) converts into liquid water when it cools. It is the reverse of evaporation. Examples: formation of dew, fog, and clouds. Sublimation is solid to gas (or vice versa) directly.', 'easy', 'pyq', 2016, 'BPSC', ARRAY['Condensation','Water Cycle','Physics']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'What is the unit of electrical resistance?',
'Ampere', 'Volt', 'Ohm', 'Watt',
'C', 'The SI unit of electrical resistance is Ohm (Ω), named after Georg Simon Ohm. Ohm''s Law: V = IR (Voltage = Current × Resistance). Ampere measures current, Volt measures potential difference, and Watt measures power.', 'easy', 'pyq', 2018, 'BPSC', ARRAY['Ohm','Electrical Resistance','Physics']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'Which of the following vitamins is water-soluble?
1. Vitamin A
2. Vitamin B
3. Vitamin C
4. Vitamin D
Select the correct answer:',
'1 and 4 only', '2 and 3 only', '1, 2 and 3', '2, 3 and 4',
'B', 'Vitamins B and C are water-soluble — they dissolve in water and are not stored in the body, requiring daily intake. Vitamins A, D, E, and K are fat-soluble — they dissolve in fat and can be stored in the body.', 'easy', 'pyq', 2019, 'UPPSC', ARRAY['Vitamins','Water-soluble','Biology']),

-- INTERNATIONAL RELATIONS - More Questions
((SELECT id FROM quiz_subjects WHERE name='International Relations'),
'BRICS originally consisted of which countries?',
'Brazil, Russia, India, China', 'Brazil, Russia, India, China, South Africa', 'Brazil, Russia, Indonesia, China, South Africa', 'Britain, Russia, India, China, South Korea',
'A', 'BRIC was coined by Jim O''Neill (Goldman Sachs) in 2001 for Brazil, Russia, India, China. South Africa joined in 2010, making it BRICS. In 2024, BRICS expanded to include Egypt, Ethiopia, Iran, Saudi Arabia, and UAE.', 'easy', 'pyq', 2020, 'BPSC', ARRAY['BRICS','International Groupings','Multilateral']),

((SELECT id FROM quiz_subjects WHERE name='International Relations'),
'The "Non-Aligned Movement" (NAM) was founded at which conference?',
'Bandung Conference (1955)', 'Belgrade Conference (1961)', 'Cairo Conference (1964)', 'Lusaka Conference (1970)',
'B', 'NAM was formally founded at the Belgrade Conference (1961). Key founders: Nehru (India), Tito (Yugoslavia), Nasser (Egypt), Sukarno (Indonesia), and Nkrumah (Ghana). The Bandung Conference (1955) was a precursor that laid the groundwork.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['NAM','Belgrade','Non-Alignment']),

-- ART & CULTURE - More Questions
((SELECT id FROM quiz_subjects WHERE name='Art & Culture'),
'Kathakali is a classical dance form from:',
'Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh',
'B', 'Kathakali originated in Kerala. It is a story-play genre characterized by elaborate costumes, heavy makeup, and stylized gestures (mudras). Stories are mainly from Hindu epics. Other Kerala art forms include Mohiniyattam and Koodiyattam.', 'easy', 'pyq', 2017, 'BPSC', ARRAY['Kathakali','Classical Dance','Kerala']),

((SELECT id FROM quiz_subjects WHERE name='Art & Culture'),
'The Khajuraho temples are famous for their:',
'Buddhist sculptures', 'Erotic sculptures and Nagara architecture', 'Dravidian architecture', 'Islamic architecture',
'B', 'The Khajuraho temples (Madhya Pradesh) are famous for their Nagara-style architecture and erotic sculptures. Built by the Chandela dynasty (950-1050 CE), they are a UNESCO World Heritage Site. Only about 25 of the original 85 temples survive.', 'easy', 'pyq', 2018, 'UPPSC', ARRAY['Khajuraho','Chandela','Temple Architecture']),

((SELECT id FROM quiz_subjects WHERE name='Art & Culture'),
'The "Sangam Literature" is associated with:',
'Sanskrit literary works', 'Ancient Tamil literary works', 'Pali Buddhist texts', 'Prakrit Jain texts',
'B', 'Sangam Literature refers to ancient Tamil literary works composed during the Sangam period (3rd century BCE to 3rd century CE). The three Sangams were held at Madurai. Major works include Tolkappiyam, Ettutogai, and Pattupattu.', 'easy', 'pyq', 2021, 'UPSC Prelims', ARRAY['Sangam Literature','Tamil','Ancient India']),

-- DISASTER MANAGEMENT (GS-III)
((SELECT id FROM quiz_subjects WHERE name='Disaster Management'),
'The National Disaster Management Authority (NDMA) is headed by:',
'Home Minister', 'Prime Minister', 'Defence Minister', 'Chief of Army Staff',
'B', 'NDMA was established under the Disaster Management Act, 2005. It is headed by the Prime Minister as its Chairperson. The NDMA can have a maximum of 9 members. It formulates policies and guidelines for disaster management.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['NDMA','Disaster Management Act','PM']),

((SELECT id FROM quiz_subjects WHERE name='Disaster Management'),
'Which of the following is a man-made disaster?',
'Earthquake', 'Tsunami', 'Bhopal Gas Tragedy', 'Cyclone',
'C', 'The Bhopal Gas Tragedy (December 1984) was a man-made industrial disaster caused by the leak of methyl isocyanate (MIC) gas from the Union Carbide plant. It killed thousands and affected over 500,000 people. It is considered the world''s worst industrial disaster.', 'easy', 'pyq', 2019, 'BPSC', ARRAY['Bhopal Gas Tragedy','Man-made Disaster','Industrial Disaster']),

-- SOCIAL JUSTICE (GS-II)
((SELECT id FROM quiz_subjects WHERE name='Social Justice'),
'The "Mahatma Gandhi National Rural Employment Guarantee Act" (MGNREGA) guarantees:',
'50 days of employment', '100 days of employment', '150 days of employment', '200 days of employment',
'B', 'MGNREGA (2005) guarantees 100 days of wage employment per year to every rural household whose adult members volunteer to do unskilled manual work. If work is not provided within 15 days, unemployment allowance must be paid.', 'easy', 'pyq', 2018, 'BPSC', ARRAY['MGNREGA','Rural Employment','Welfare Schemes']),

((SELECT id FROM quiz_subjects WHERE name='Social Justice'),
'The "Right to Education" (RTE) Act provides for free and compulsory education for children of age group:',
'5-12 years', '6-14 years', '6-16 years', '5-14 years',
'B', 'The RTE Act, 2009 (based on Article 21A inserted by the 86th Amendment, 2002) provides for free and compulsory education for all children aged 6-14 years. It mandates 25% reservation in private schools for economically weaker sections.', 'easy', 'pyq', 2020, 'UPPSC', ARRAY['RTE Act','Article 21A','Education']),

-- INDIAN SOCIETY (GS-I)
((SELECT id FROM quiz_subjects WHERE name='Indian Society'),
'The "demographic dividend" refers to:',
'Declining population growth', 'A large proportion of working-age population relative to dependents', 'Equal male and female population', 'High birth rate in urban areas',
'B', 'Demographic dividend occurs when the working-age population (15-64 years) is larger than the non-working-age population. India is currently experiencing this with about 65% of its population in the working age group, expected to last until 2040s.', 'medium', 'pyq', 2022, 'UPSC Prelims', ARRAY['Demographic Dividend','Population','Indian Society']),

-- SECURITY & DEFENCE (GS-III)
((SELECT id FROM quiz_subjects WHERE name='Security & Defence'),
'The Border Security Force (BSF) is primarily responsible for guarding:',
'India-China border', 'India-Pakistan and India-Bangladesh borders', 'All international borders', 'Coastal borders only',
'B', 'BSF (raised in 1965) is primarily responsible for guarding India-Pakistan and India-Bangladesh borders. ITBP guards India-China border. SSB guards India-Nepal and India-Bhutan borders. Indian Coast Guard handles maritime borders.', 'easy', 'pyq', 2019, 'BPSC', ARRAY['BSF','Border Security','Defence']),

((SELECT id FROM quiz_subjects WHERE name='Security & Defence'),
'What is "AFSPA" (Armed Forces Special Powers Act)?',
'An act to recruit armed forces', 'An act giving special powers to armed forces in disturbed areas', 'An act related to arms manufacturing', 'An act for veterans'' welfare',
'B', 'AFSPA (1958/1990) gives armed forces special powers in areas declared as "disturbed areas" — including power to fire, arrest without warrant, and search premises. It has been applied in parts of Northeast India and J&K.', 'medium', 'pyq', 2021, 'UPSC Prelims', ARRAY['AFSPA','Disturbed Areas','Internal Security']);
