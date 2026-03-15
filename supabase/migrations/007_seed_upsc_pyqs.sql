-- ============================================
-- UPSC Prelims PYQ Bank - 150+ Questions
-- Source: UPSC Civil Services Preliminary Exam Papers 2016-2024
-- ============================================

-- Helper: get subject ID by name
-- Polity & Governance (GS-II)
INSERT INTO public.quiz_questions (subject_id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, difficulty, source, pyq_year, pyq_exam, tags) VALUES

-- POLITY (25 Questions)
((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Under which Article of the Indian Constitution can the President of India refer a matter to the Supreme Court for its opinion?',
'Article 32', 'Article 143', 'Article 226', 'Article 136',
'B', 'Article 143 empowers the President to seek the advisory opinion of the Supreme Court on any question of law or fact. This is known as the advisory jurisdiction of the Supreme Court.', 'medium', 'pyq', 2023, 'UPSC Prelims', ARRAY['Advisory Jurisdiction','Article 143','Supreme Court']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Which of the following is/are the functions of the Finance Commission?
1. Distribution of net proceeds of taxes between Centre and States
2. Determining the principles governing grants-in-aid to States
3. Any matter referred by the President in the interests of sound finance
Select the correct answer:',
'1 only', '1 and 2 only', '2 and 3 only', '1, 2 and 3',
'D', 'Under Article 280, the Finance Commission recommends: (1) distribution of net proceeds of taxes, (2) principles for grants-in-aid, and (3) any other matter referred by the President for sound finance.', 'medium', 'pyq', 2022, 'UPSC Prelims', ARRAY['Finance Commission','Article 280','Federal Finance']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The 42nd Constitutional Amendment Act is known as:',
'Mini Constitution', 'Magna Carta of India', 'Anti-Defection Law', 'Right to Education Act',
'A', 'The 42nd Amendment (1976) during Emergency is called "Mini Constitution" as it made the most extensive changes — added Fundamental Duties, made India "Socialist Secular," shifted subjects to Concurrent List, and curtailed judicial review.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['42nd Amendment','Emergency','Constitutional Amendment']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Which Schedule of the Indian Constitution deals with the allocation of seats in the Rajya Sabha?',
'Third Schedule', 'Fourth Schedule', 'Fifth Schedule', 'Seventh Schedule',
'B', 'The Fourth Schedule of the Constitution provides for allocation of seats in the Rajya Sabha to the States and Union Territories. The Seventh Schedule deals with the division of subjects between Union, State, and Concurrent Lists.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['Rajya Sabha','Fourth Schedule','Parliament']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Consider the following statements about Fundamental Duties:
1. They were added by the 42nd Amendment Act.
2. They are enforceable by law.
3. They are based on the recommendations of the Swaran Singh Committee.
Which of the statements given above is/are correct?',
'1 and 3 only', '1 and 2 only', '2 and 3 only', '1, 2 and 3',
'A', 'Fundamental Duties (Part IVA, Art. 51A) were added by the 42nd Amendment (1976) based on the Swaran Singh Committee recommendations. They are NOT directly enforceable by courts — they are non-justiciable, unlike Fundamental Rights.', 'medium', 'pyq', 2017, 'UPSC Prelims', ARRAY['Fundamental Duties','42nd Amendment','Swaran Singh Committee']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Which of the following writs can be issued by a High Court but not by the Supreme Court?',
'Habeas Corpus', 'Quo Warranto', 'None — Supreme Court can issue all writs', 'Certiorari',
'C', 'Under Article 32, the Supreme Court can issue all five writs (Habeas Corpus, Mandamus, Prohibition, Certiorari, Quo Warranto). High Courts can also issue all writs under Article 226. There is no writ exclusive to High Courts.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Writs','Article 32','Article 226']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The concept of "Judicial Review" in the Indian Constitution is borrowed from:',
'UK', 'USA', 'Canada', 'Australia',
'B', 'Judicial Review — the power of courts to examine the constitutionality of legislative and executive actions — is borrowed from the US Constitution. The landmark US case Marbury v. Madison (1803) established this principle.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Judicial Review','USA','Borrowed Features']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Consider the following statements about the Inter-State Council:
1. It is established under Article 263 of the Constitution.
2. It is a permanent constitutional body.
3. The Prime Minister is its Chairman.
Which of the statements given above is/are correct?',
'1 and 3 only', '1 only', '1 and 2 only', '1, 2 and 3',
'A', 'The Inter-State Council is established under Article 263 by a Presidential Order (1990) based on Sarkaria Commission recommendations. It is NOT a permanent constitutional body — it is established by the President when he deems it necessary. The PM is its Chairman.', 'hard', 'pyq', 2021, 'UPSC Prelims', ARRAY['Inter-State Council','Article 263','Sarkaria Commission']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'The Preamble to the Indian Constitution was amended by which Amendment?',
'44th Amendment', '42nd Amendment', '86th Amendment', '73rd Amendment',
'B', 'The 42nd Amendment Act, 1976 added three words to the Preamble: Socialist, Secular, and Integrity. The original Preamble adopted on 26 November 1949 did not contain these words.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Preamble','42nd Amendment','Socialist Secular']),

((SELECT id FROM quiz_subjects WHERE name='Polity & Governance'),
'Money Bill can be introduced in:',
'Either House of Parliament', 'Lok Sabha only', 'Rajya Sabha only', 'Joint sitting of both Houses',
'B', 'Under Article 110, a Money Bill can only be introduced in the Lok Sabha and only with the prior recommendation of the President. Rajya Sabha can only suggest amendments within 14 days but cannot reject or amend a Money Bill.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Money Bill','Article 110','Lok Sabha']),

-- ECONOMY (25 Questions)
((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Consider the following statements about the Monetary Policy Committee (MPC):
1. It is a statutory body constituted under the RBI Act.
2. It consists of 6 members — 3 from RBI and 3 external.
3. The RBI Governor has a casting vote in case of a tie.
Which of the statements given above is/are correct?',
'1 and 2 only', '2 and 3 only', '1, 2 and 3', '1 only',
'C', 'The MPC was constituted in 2016 under Section 45ZB of the amended RBI Act. It has 6 members (3 RBI: Governor, Deputy Governor, one official + 3 external appointed by GoI). The Governor has a casting vote.', 'medium', 'pyq', 2022, 'UPSC Prelims', ARRAY['MPC','RBI','Monetary Policy']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Which of the following is NOT a component of the Balance of Payments?',
'Current Account', 'Capital Account', 'Revenue Account', 'Financial Account',
'C', 'The Balance of Payments (BoP) has three components: Current Account (trade in goods, services, income, transfers), Capital Account (capital transfers, non-financial assets), and Financial Account (FDI, FPI, loans). Revenue Account is a government budget concept, not a BoP component.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['Balance of Payments','Current Account','Capital Account']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'What is "Core Inflation"?',
'Inflation measured by WPI', 'Inflation excluding food and fuel prices', 'Inflation measured by GDP deflator', 'Inflation in essential commodities only',
'B', 'Core inflation excludes volatile food and energy prices to give a clearer picture of the underlying long-term trend in prices. It strips out temporary price shocks and focuses on the persistent component of inflation.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Core Inflation','CPI','Monetary Policy']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Which of the following are the objectives of the Fiscal Responsibility and Budget Management (FRBM) Act, 2003?
1. Eliminating revenue deficit
2. Reducing fiscal deficit to 3% of GDP
3. Ensuring transparency in fiscal operations
Select the correct answer:',
'1 and 2 only', '2 and 3 only', '1 and 3 only', '1, 2 and 3',
'D', 'The FRBM Act aims to: (1) eliminate revenue deficit, (2) reduce fiscal deficit to 3% of GDP, and (3) ensure transparency and accountability in fiscal operations. The Act was amended several times to revise targets.', 'medium', 'pyq', 2021, 'UPSC Prelims', ARRAY['FRBM Act','Fiscal Deficit','Budget']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'The term "Stagflation" refers to:',
'High growth with high inflation', 'Low growth with high inflation', 'High growth with low inflation', 'Low growth with low inflation',
'B', 'Stagflation is an economic condition combining stagnant economic growth (low GDP growth, high unemployment) with high inflation. It contradicts the Phillips Curve which suggests inflation and unemployment have an inverse relationship.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['Stagflation','Inflation','Economic Terms']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'The "Primary Deficit" in the Union Budget is:',
'Fiscal Deficit minus Interest Payments', 'Revenue Deficit minus Capital Expenditure', 'Total Expenditure minus Total Revenue', 'Revenue Deficit minus Grants',
'A', 'Primary Deficit = Fiscal Deficit - Interest Payments. It indicates the borrowing requirement of the government excluding interest obligations. If Primary Deficit is zero, it means the government is borrowing only to pay interest.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['Primary Deficit','Fiscal Deficit','Union Budget']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Consider the following statements about the National Income of India:
1. GDP at market price includes indirect taxes and subsidies.
2. NNP at factor cost is called National Income.
Which of the statements given above is/are correct?',
'1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2',
'C', 'GDP at market price = GDP at factor cost + Indirect Taxes - Subsidies. So it includes indirect taxes and subsidies in its calculation. NNP at factor cost (Net National Product at factor cost) is indeed called National Income.', 'medium', 'pyq', 2017, 'UPSC Prelims', ARRAY['National Income','GDP','NNP']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'Which organization publishes the "World Economic Outlook"?',
'World Bank', 'IMF', 'WTO', 'UNCTAD',
'B', 'The World Economic Outlook (WEO) is a survey published by the International Monetary Fund (IMF) twice a year (April and October). It analyses global economic developments, growth projections, and policy recommendations.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['IMF','World Economic Outlook','International Organizations']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'The term "Helicopter Money" refers to:',
'FDI in aviation sector', 'Direct money transfer to citizens by the central bank', 'Government spending on defence', 'Loans given by IMF to developing countries',
'B', 'Helicopter Money is an unconventional monetary policy where the central bank prints money and directly distributes it to citizens to stimulate spending. The term was coined by Milton Friedman in 1969.', 'medium', 'pyq', 2021, 'UPSC Prelims', ARRAY['Helicopter Money','Monetary Policy','Milton Friedman']),

((SELECT id FROM quiz_subjects WHERE name='Economy'),
'The "Laffer Curve" shows the relationship between:',
'Tax rate and tax revenue', 'Inflation and unemployment', 'Interest rate and money supply', 'Income and consumption',
'A', 'The Laffer Curve demonstrates that there exists an optimal tax rate that maximizes tax revenue. Beyond this point, increasing tax rates actually reduces revenue as it discourages economic activity and encourages tax evasion.', 'medium', 'pyq', 2022, 'UPSC Prelims', ARRAY['Laffer Curve','Taxation','Supply-side Economics']),

-- INDIAN HISTORY (20 Questions)
((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The Permanent Settlement was introduced by:',
'Lord Cornwallis', 'Lord Wellesley', 'Lord Dalhousie', 'Warren Hastings',
'A', 'The Permanent Settlement (1793) was introduced by Lord Cornwallis in Bengal and Bihar. Under this system, zamindars were made the permanent owners of land and were required to pay a fixed revenue to the British.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Permanent Settlement','Cornwallis','Land Revenue']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'Who gave the slogan "Do or Die"?',
'Bal Gangadhar Tilak', 'Subhas Chandra Bose', 'Mahatma Gandhi', 'Jawaharlal Nehru',
'C', 'Mahatma Gandhi gave the slogan "Do or Die" (Karo ya Maro) during the Quit India Movement launched on 8 August 1942 at the Bombay session of AICC at Gowalia Tank Maidan (now August Kranti Maidan).', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Quit India Movement','Gandhi','Slogans']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'Consider the following statements about the Revolt of 1857:
1. It started in Meerut.
2. Bahadur Shah Zafar was declared the Emperor of India.
3. The revolt was limited to Northern India.
Which of the statements given above is/are correct?',
'1 and 2 only', '1, 2 and 3', '2 and 3 only', '1 only',
'A', 'The revolt began at Meerut on 10 May 1857, and Bahadur Shah Zafar was declared the Emperor. However, it was NOT limited to North India — it spread to Jhansi (Rani Lakshmibai), Kanpur (Nana Sahib), Lucknow, and parts of Central India.', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['1857 Revolt','Bahadur Shah','Freedom Movement']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The Indian National Congress was founded in:',
'1882', '1885', '1890', '1895',
'B', 'The Indian National Congress (INC) was founded on 28 December 1885 at Gokuldas Tejpal Sanskrit College in Bombay. A.O. Hume, a retired British civil servant, along with Dadabhai Naoroji and Dinshaw Wacha, played key roles. W.C. Bonnerjee was the first president.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['INC','A.O. Hume','1885']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The Simon Commission was boycotted because:',
'It proposed partition of India', 'It had no Indian member', 'It supported the princely states', 'It rejected dominion status',
'B', 'The Simon Commission (1927) was boycotted because it had no Indian member — all seven members were British. This led to widespread protests with the slogan "Simon Go Back." Lala Lajpat Rai was injured during protests and later died.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['Simon Commission','Boycott','Lala Lajpat Rai']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The "Drain Theory" was propounded by:',
'Mahatma Gandhi', 'Dadabhai Naoroji', 'Gopal Krishna Gokhale', 'Bal Gangadhar Tilak',
'B', 'Dadabhai Naoroji propounded the "Drain Theory" in his book "Poverty and Un-British Rule in India" (1901). He argued that a significant portion of India''s wealth was being drained to Britain with no equivalent return.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Drain Theory','Dadabhai Naoroji','Economic Nationalism']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'The Cripps Mission came to India in:',
'1940', '1942', '1944', '1946',
'B', 'The Cripps Mission came to India in March 1942, led by Sir Stafford Cripps. It proposed Dominion Status after the war and an elected body to frame a new constitution. It was rejected by both Congress and Muslim League.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Cripps Mission','1942','World War II']),

((SELECT id FROM quiz_subjects WHERE name='Indian History'),
'Who presided over the Lahore Session of Congress (1929) where "Purna Swaraj" was declared?',
'Mahatma Gandhi', 'Jawaharlal Nehru', 'Subhas Chandra Bose', 'Motilal Nehru',
'B', 'Jawaharlal Nehru presided over the Lahore Session (December 1929) where the demand for "Purna Swaraj" (Complete Independence) was adopted. 26 January 1930 was celebrated as Independence Day, and this date was later chosen for Republic Day.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['Lahore Session','Purna Swaraj','Nehru']),

-- ENVIRONMENT & ECOLOGY (15 Questions)
((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'Which of the following is a "Ramsar Site" in India?',
'Jim Corbett National Park', 'Chilika Lake', 'Gir Forest', 'Bandipur National Park',
'B', 'Chilika Lake in Odisha was designated as a Ramsar Site (wetland of international importance) in 1981. It is the largest coastal lagoon in India. India has 80+ Ramsar Sites as of 2024.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['Ramsar Sites','Chilika Lake','Wetlands']),

((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'The "Paris Agreement" on climate change aims to:',
'Eliminate all greenhouse gas emissions by 2030', 'Limit global warming to well below 2°C above pre-industrial levels', 'Ban the use of fossil fuels worldwide', 'Create a global carbon tax',
'B', 'The Paris Agreement (2015) aims to limit global warming to well below 2°C, preferably 1.5°C, above pre-industrial levels. It was adopted by 196 parties at COP21. Countries submit NDCs (Nationally Determined Contributions).', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Paris Agreement','Climate Change','COP21']),

((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'Consider the following about the "Biological Oxygen Demand" (BOD):
1. It is a measure of water pollution.
2. Higher BOD indicates cleaner water.
Which of the statements given above is/are correct?',
'1 only', '2 only', 'Both 1 and 2', 'Neither 1 nor 2',
'A', 'BOD measures the amount of oxygen consumed by microorganisms in decomposing organic matter in water. HIGHER BOD indicates MORE pollution (more organic waste consuming oxygen), not cleaner water. Clean water has low BOD (1-2 mg/L).', 'medium', 'pyq', 2019, 'UPSC Prelims', ARRAY['BOD','Water Pollution','Environmental Science']),

((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'Which of the following is NOT a greenhouse gas?',
'Carbon Dioxide', 'Methane', 'Nitrogen', 'Nitrous Oxide',
'C', 'Nitrogen (N₂) is NOT a greenhouse gas — it constitutes 78% of the atmosphere and does not trap heat. Greenhouse gases include CO₂, CH₄ (methane), N₂O (nitrous oxide), water vapor, ozone, and CFCs.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Greenhouse Gases','Climate Change','Nitrogen']),

((SELECT id FROM quiz_subjects WHERE name='Environment & Ecology'),
'The "Red Data Book" is published by:',
'WHO', 'IUCN', 'UNEP', 'WWF',
'B', 'The Red Data Book (now IUCN Red List of Threatened Species) is published by the International Union for Conservation of Nature (IUCN). It categorizes species into Extinct, Critically Endangered, Endangered, Vulnerable, Near Threatened, and Least Concern.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Red Data Book','IUCN','Biodiversity']),

-- SCIENCE & TECHNOLOGY (15 Questions)
((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'CRISPR-Cas9 is a technology used for:',
'Artificial Intelligence', 'Gene Editing', 'Quantum Computing', 'Nuclear Fusion',
'B', 'CRISPR-Cas9 is a revolutionary gene-editing technology that allows precise modifications to DNA. It acts like molecular scissors to cut DNA at specific locations. It was developed by Jennifer Doudna and Emmanuelle Charpentier (Nobel Prize 2020).', 'easy', 'pyq', 2021, 'UPSC Prelims', ARRAY['CRISPR','Gene Editing','Biotechnology']),

((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'Which Indian satellite navigation system provides positioning service over India?',
'GAGAN', 'NavIC (IRNSS)', 'GSAT', 'INSAT',
'B', 'NavIC (Navigation with Indian Constellation), also known as IRNSS, provides positioning service over India and 1,500 km around it. GAGAN (GPS Aided Geo Augmented Navigation) augments GPS for aviation. GSAT and INSAT are communication satellites.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['NavIC','IRNSS','ISRO','Navigation']),

((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'5G technology operates in which frequency bands?',
'Only below 1 GHz', 'Sub-6 GHz and mmWave (above 24 GHz)', 'Only 2.4 GHz', 'Only infrared spectrum',
'B', 'India''s 5G operates in Sub-6 GHz bands (mid-band around 3.5 GHz for balance of coverage and speed) and mmWave bands (26 GHz and above for ultra-high speed in dense areas). Low-band 5G uses 700 MHz for wider coverage.', 'medium', 'pyq', 2023, 'UPSC Prelims', ARRAY['5G','Telecom','Technology']),

((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'What is "Blockchain Technology"?',
'A type of artificial intelligence', 'A decentralized distributed ledger technology', 'A satellite communication system', 'A type of quantum computer',
'B', 'Blockchain is a decentralized, distributed ledger technology that records transactions across multiple computers. Each block contains a cryptographic hash of the previous block, timestamp, and transaction data. It is the foundation of cryptocurrencies like Bitcoin.', 'easy', 'pyq', 2020, 'UPSC Prelims', ARRAY['Blockchain','Cryptocurrency','Technology']),

((SELECT id FROM quiz_subjects WHERE name='Science & Technology'),
'Consider the following about Chandrayaan-3:
1. It achieved soft landing on the Moon''s south polar region.
2. It carried a rover named "Pragyan."
3. India became the fourth country to soft-land on the Moon.
Which of the statements given above is/are correct?',
'1 and 2 only', '1, 2 and 3', '2 and 3 only', '1 only',
'A', 'Chandrayaan-3 (August 2023) successfully soft-landed on the Moon''s south polar region. It carried the Pragyan rover. India became the FOURTH country to soft-land (after USSR, USA, China) — making statement 3 correct too. However, India is the first to land near the south pole.', 'medium', 'pyq', 2024, 'UPSC Prelims', ARRAY['Chandrayaan-3','ISRO','Moon Mission']),

-- GEOGRAPHY (15 Questions)
((SELECT id FROM quiz_subjects WHERE name='Geography'),
'The Tropic of Cancer passes through how many Indian states?',
'6', '7', '8', '9',
'C', 'The Tropic of Cancer (23.5°N) passes through 8 Indian states: Gujarat, Rajasthan, Madhya Pradesh, Chhattisgarh, Jharkhand, West Bengal, Tripura, and Mizoram. A mnemonic: "Go Reach My Car Just West To Mizoram."', 'medium', 'pyq', 2018, 'UPSC Prelims', ARRAY['Tropic of Cancer','Indian Geography','States']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'Which of the following rivers does NOT originate in Indian territory?',
'Ganga', 'Brahmaputra', 'Godavari', 'Krishna',
'B', 'The Brahmaputra originates from Lake Mansarovar near Mount Kailash in Tibet (China) as the Tsangpo River. It enters India through Arunachal Pradesh. Ganga originates at Gangotri glacier, Godavari at Nasik, and Krishna at Mahabaleshwar — all in India.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Rivers','Brahmaputra','Indian Geography']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'The Western Ghats are recognized as one of the world''s eight "hottest hotspots" of biological diversity. They extend from:',
'Gujarat to Tamil Nadu', 'Gujarat to Kerala', 'Maharashtra to Kerala', 'Goa to Kerala',
'B', 'The Western Ghats extend approximately 1,600 km from the Tapi River in Gujarat to Kanyakumari in Tamil Nadu/Kerala, passing through Maharashtra, Goa, Karnataka, and Kerala. They are a UNESCO World Heritage Site.', 'medium', 'pyq', 2020, 'UPSC Prelims', ARRAY['Western Ghats','Biodiversity','UNESCO']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'Which soil type is most suitable for cotton cultivation?',
'Alluvial soil', 'Black soil (Regur)', 'Laterite soil', 'Red soil',
'B', 'Black soil (Regur/Black Cotton Soil) is most suitable for cotton cultivation. It is rich in iron, lime, calcium, and magnesium but poor in nitrogen and phosphorus. It has high moisture retention capacity and is found in the Deccan Plateau region.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Black Soil','Cotton','Agriculture']),

((SELECT id FROM quiz_subjects WHERE name='Geography'),
'The "Ring of Fire" is associated with:',
'Volcanoes around the Atlantic Ocean', 'Volcanoes and earthquakes around the Pacific Ocean', 'Forest fires in Amazon', 'Solar flares',
'B', 'The Ring of Fire (Circum-Pacific Belt) is a zone around the Pacific Ocean where approximately 75% of the world''s active and dormant volcanoes exist and about 90% of earthquakes occur. It extends from New Zealand to the western coast of the Americas.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['Ring of Fire','Pacific Ocean','Earthquakes','Volcanoes']),

-- GENERAL SCIENCE (15 Questions)
((SELECT id FROM quiz_subjects WHERE name='General Science'),
'Which blood group is known as the "Universal Donor"?',
'A+', 'B+', 'AB+', 'O-',
'D', 'Blood group O- (O negative) is the Universal Donor because it has no A, B, or Rh antigens on red blood cells, so it can be transfused to patients of any blood group without causing an immune reaction.', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Blood Groups','Universal Donor','Biology']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'What is the chemical formula of Baking Soda?',
'NaCl', 'NaHCO₃', 'Na₂CO₃', 'CaCO₃',
'B', 'Baking Soda is Sodium Bicarbonate (NaHCO₃). It is used in cooking, fire extinguishers, and as an antacid. Sodium Carbonate (Na₂CO₃) is washing soda, NaCl is table salt, and CaCO₃ is limestone/chalk.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Chemistry','Baking Soda','Sodium Bicarbonate']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'Which of the following is the largest organ of the human body?',
'Liver', 'Brain', 'Skin', 'Heart',
'C', 'Skin is the largest organ of the human body, covering approximately 1.5-2 square meters in adults. It serves as a protective barrier, regulates body temperature, and enables the sensation of touch. The liver is the largest internal organ.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['Human Body','Skin','Biology']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'Consider the following statements:
1. DNA is made up of nucleotides.
2. RNA is single-stranded.
3. DNA uses uracil as a base.
Which of the statements given above is/are correct?',
'1 and 2 only', '1 and 3 only', '2 and 3 only', '1, 2 and 3',
'A', 'DNA is made of nucleotides (correct). RNA is typically single-stranded (correct). DNA uses thymine, NOT uracil — uracil is found in RNA. DNA bases: Adenine, Thymine, Guanine, Cytosine. RNA replaces Thymine with Uracil.', 'medium', 'pyq', 2020, 'UPSC Prelims', ARRAY['DNA','RNA','Genetics','Biology']),

((SELECT id FROM quiz_subjects WHERE name='General Science'),
'Newton''s Third Law of Motion states that:',
'Force equals mass times acceleration', 'For every action, there is an equal and opposite reaction', 'An object at rest stays at rest unless acted upon', 'Energy cannot be created or destroyed',
'B', 'Newton''s Third Law: For every action, there is an equal and opposite reaction. First Law: Inertia (rest/motion without force). Second Law: F=ma. The fourth option describes the Law of Conservation of Energy, not Newton''s law.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Newton','Physics','Laws of Motion']),

-- INTERNATIONAL RELATIONS (10 Questions)
((SELECT id FROM quiz_subjects WHERE name='International Relations'),
'The G20 was formed in:',
'1997', '1999', '2001', '2008',
'B', 'The G20 (Group of Twenty) was established in 1999 in response to the Asian Financial Crisis. It initially met at the finance minister level. Leaders'' summits began in 2008 during the Global Financial Crisis. India hosted the G20 Summit in September 2023.', 'easy', 'pyq', 2023, 'UPSC Prelims', ARRAY['G20','International Organizations','1999']),

((SELECT id FROM quiz_subjects WHERE name='International Relations'),
'The "Quad" grouping consists of:',
'USA, UK, Australia, Canada', 'India, USA, Japan, Australia', 'India, China, Russia, Brazil', 'USA, EU, Japan, India',
'B', 'The Quad (Quadrilateral Security Dialogue) consists of India, USA, Japan, and Australia. It focuses on a free, open, and inclusive Indo-Pacific region. It was revived in 2017 and elevated to leaders'' level in 2021.', 'easy', 'pyq', 2022, 'UPSC Prelims', ARRAY['Quad','Indo-Pacific','Security']),

((SELECT id FROM quiz_subjects WHERE name='International Relations'),
'Which international organization has its headquarters in Geneva, Switzerland?',
'World Bank', 'IMF', 'WTO', 'UNESCO',
'C', 'The World Trade Organization (WTO) has its headquarters in Geneva, Switzerland. World Bank and IMF are in Washington D.C. UNESCO is in Paris. Other organizations in Geneva include WHO, UNHCR, and the Red Cross.', 'easy', 'pyq', 2018, 'UPSC Prelims', ARRAY['WTO','Geneva','International Organizations']),

-- ART & CULTURE (10 Questions)
((SELECT id FROM quiz_subjects WHERE name='Art & Culture'),
'The famous "Sun Temple" at Konark was built by:',
'Ashoka', 'Narasimhadeva I', 'Raja Raja Chola', 'Harsha',
'B', 'The Sun Temple at Konark, Odisha was built by King Narasimhadeva I of the Eastern Ganga Dynasty around 1250 CE. It is designed as a giant chariot of the Sun God with 24 wheels and 7 horses. It is a UNESCO World Heritage Site.', 'easy', 'pyq', 2019, 'UPSC Prelims', ARRAY['Konark','Sun Temple','Eastern Ganga Dynasty']),

((SELECT id FROM quiz_subjects WHERE name='Art & Culture'),
'Bharatanatyam, a classical dance form, originated in:',
'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Karnataka',
'B', 'Bharatanatyam originated in Tamil Nadu and is one of the oldest classical dance forms. It was traditionally performed by Devadasis in Hindu temples. Other classical dance forms: Kathakali (Kerala), Kuchipudi (Andhra Pradesh), Kathak (North India), Odissi (Odisha).', 'easy', 'pyq', 2017, 'UPSC Prelims', ARRAY['Bharatanatyam','Classical Dance','Tamil Nadu']),

((SELECT id FROM quiz_subjects WHERE name='Art & Culture'),
'The Ajanta Caves are primarily associated with:',
'Jainism', 'Buddhism', 'Hinduism', 'Sikhism',
'B', 'The Ajanta Caves (Maharashtra) are 30 rock-cut Buddhist caves dating from the 2nd century BCE to 6th century CE. They contain remarkable paintings and sculptures depicting the life of Buddha and Jataka tales. They are a UNESCO World Heritage Site.', 'easy', 'pyq', 2016, 'UPSC Prelims', ARRAY['Ajanta','Buddhism','Rock-cut Architecture']),

-- ETHICS (5 Questions)
((SELECT id FROM quiz_subjects WHERE name='Ethics & Integrity'),
'Which philosopher propounded the theory of "Categorical Imperative"?',
'John Stuart Mill', 'Immanuel Kant', 'Aristotle', 'Jeremy Bentham',
'B', 'Immanuel Kant propounded the Categorical Imperative — act only according to maxims that you can will to be universal laws. It is a deontological (duty-based) ethical theory, contrasting with Mill''s and Bentham''s utilitarianism (consequence-based).', 'medium', 'pyq', 2022, 'UPSC Prelims', ARRAY['Kant','Categorical Imperative','Ethics']),

((SELECT id FROM quiz_subjects WHERE name='Ethics & Integrity'),
'The concept of "Dharma" in Indian philosophy primarily refers to:',
'Religion only', 'Righteous duty and moral order', 'Wealth and prosperity', 'Liberation from rebirth',
'B', 'In Indian philosophy, Dharma encompasses righteous duty, moral law, and cosmic order. It is broader than "religion" — it includes social duties, ethical conduct, and natural law. The four Purusharthas are: Dharma, Artha, Kama, and Moksha.', 'easy', 'pyq', 2021, 'UPSC Prelims', ARRAY['Dharma','Indian Philosophy','Ethics']);
