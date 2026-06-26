/**
 * mainsGS1Data.js
 * UPSC Mains GS Paper 1 - 2024
 *
 * Schema (descriptive / Mains variant):
 * {
 *   _id          : string   - unique identifier
 *   year         : number
 *   paper        : string   - "GS Paper 1"
 *   subject      : string   - broad subject tag
 *   topic        : string   - more specific topic for filter chips
 *   subTopic     : string   - shown as small badge on card
 *   marks        : number   - 10 or 15
 *   questionText : string   - full question as printed
 *   directive    : string   - "Discuss" | "Examine" | "Explain" | etc.
 *   wordLimit    : number   - suggested word limit (marks × 10 as UPSC norm)
 *   idealAnswer  : string   - structured model answer (shown only after user reveals)
 *   keyPoints    : string[] - bullet checklist of must-cover points
 *   sources      : { name, chapter }[]
 * }
 */

const mainsGS1Data = [
  // ─── INDIAN SOCIETY ───────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_01",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Cultural Diversity",
    subTopic: "Social Marginalisation",
    marks: 15,
    directive: "Critically Analyze",
    wordLimit: 150,
    questionText:
      "Critically analyze the proposition that there is a high correlation between India's cultural diversities and socio-economic marginalities.",
    keyPoints: [
      "India's cultural diversity: language, religion, caste, ethnicity, region",
      "Socio-economic marginalisation: poverty, lack of education, limited political voice",
      "Correlation: SC/ST communities, religious minorities, linguistic minorities often marginalised",
      "Historical roots: colonial legacy, caste hierarchy, uneven development",
      "Counter-arguments: cultural diversity as strength, successful communities",
      "Constitutional safeguards: reservations, minority rights, language protections",
      "Way forward: inclusive growth, affirmative action, cultural sensitivity in policy",
    ],
    idealAnswer: `Introduction: India is among the world's most culturally diverse nations - home to 22 scheduled languages, hundreds of dialects, six major religions, thousands of castes and sub-castes, and distinct regional identities. The proposition that this diversity correlates with socio-economic marginalisation is both analytically compelling and empirically contested.

Arguments Supporting the Correlation:

1. Caste and Economic Exclusion: The caste system, a defining feature of India's socio-cultural landscape, has historically consigned Scheduled Castes (SCs) and Scheduled Tribes (STs) to occupational servitude, land deprivation, and social exclusion. NFHS-5 data shows SCs and STs have significantly higher poverty rates, malnutrition indices, and lower educational attainment compared to upper castes.

2. Religious Minority Marginalisation: The Sachar Committee Report (2006) documented that Muslims - despite forming ~14% of India's population - are underrepresented in government jobs, have lower literacy rates, and face economic exclusion. Cultural markers (dress, language, religious practice) correlate with economic disadvantage.

3. Linguistic Minority Disadvantage: Speakers of non-dominant languages often face barriers in education, employment, and access to government services, which are conducted predominantly in Hindi or English. Tribal communities speaking languages outside the Eighth Schedule face particular disadvantage.

4. Gender and Cultural Norms: Cultural practices - son preference, restrictions on female mobility, child marriage (concentrated in specific communities) - reinforce socio-economic marginalisation of women within already vulnerable communities.

5. Regional and Ethnic Identities: The Northeast's persistent underdevelopment is partially attributable to its ethnic distinctiveness, geographical isolation, and historical neglect. Cultural distance from the mainstream has reinforced structural disadvantage.

Counter-Arguments and Nuances:

1. Cultural Diversity as Economic Strength: Communities like the Marwaris, Parsis, and certain NRI diaspora groups demonstrate that cultural distinctiveness need not imply economic marginalisation. Cultural capital (entrepreneurship networks, community solidarity) can be a resource.

2. Intra-Community Inequality: Significant socio-economic variation exists within cultural groups - upper-caste poor, prosperous Dalit entrepreneurs - suggesting that culture is not destiny.

3. State Interventions: Constitutional provisions (Articles 15, 16, 17, 46), reservations, the Scheduled Tribes and Other Traditional Forest Dwellers Act (FRA), and minority welfare schemes have partially decoupled cultural identity from economic fate.

4. Causality Questions: The correlation may reflect historical discrimination rather than culture per se - it is the social response to cultural difference (discrimination, exclusion) rather than the cultural difference itself that drives marginalisation.

Critical Assessment:
The correlation is real but mediated by history, political economy, and institutional responses. India's cultural diversity becomes a source of marginalisation when it intersects with discriminatory social hierarchies, unequal resource distribution, and inadequate state protection - not inherently.

Conclusion: The proposition holds significant empirical support but requires nuance: it is not cultural diversity per se, but the hierarchical valuation of cultural identities - rooted in historical power structures - that produces socio-economic marginalisation. India's challenge is to celebrate pluralism while dismantling the structures that transform cultural difference into economic disadvantage.`,
    sources: [
      { name: "Sachar Committee Report 2006", chapter: "Muslim Socio-Economic Status" },
      { name: "NFHS-5 (2019-21)", chapter: "Socio-Economic Indicators" },
      { name: "NCERT Sociology - Class XII", chapter: "Social Stratification" },
    ],
  },

  {
    _id: "mains_gs1_2024_02",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Women and Society",
    subTopic: "Urbanisation & Female Migration",
    marks: 15,
    directive: "How",
    wordLimit: 150,
    questionText:
      "Globalization has increased the urban migration by skilled, young, unmarried women from various classes. How has this trend impacted upon their personal freedom and relationship with family?",
    keyPoints: [
      "Globalisation driving female urban migration: IT, BPO, garment, healthcare sectors",
      "Enhanced personal freedom: financial independence, delayed marriage, lifestyle choices",
      "Changed family dynamics: remittances vs. reduced caregiving, negotiated patriarchy",
      "Challenges: safety, housing, loneliness, social surveillance",
      "Class dimension: upper-class vs. working-class migrant women's experiences differ",
      "Changing gender norms: returning women as agents of change in rural areas",
    ],
    idealAnswer: `Introduction: Globalisation - through the expansion of IT, BPO, garment, healthcare, and retail sectors - has catalysed unprecedented urban migration by young, skilled, and increasingly unmarried women from varied socio-economic backgrounds. This demographic shift is reshaping personal autonomy and family relations in profound ways.

Impact on Personal Freedom:

1. Financial Independence: Economic autonomy is the most transformative gain. Women who earn their own income - whether software engineers in Bengaluru or garment workers in Tiruppur - gain leverage in family decision-making, marriage timing, and lifestyle choices. Studies show female IT workers delay marriage by an average of 3-4 years compared to non-migrant counterparts.

2. Spatial and Social Mobility: Living away from natal homes exposes women to new social networks, cultural practices, and worldviews. Urban spaces - however imperfect - offer relative freedom from village-level social surveillance and caste/community scrutiny.

3. Deferred Marriage and Fertility: Urban professional women are reshaping India's demographic landscape by choosing to marry later (average age at marriage rising to 22+ in urban areas) and having fewer children. This represents a fundamental renegotiation of traditional gender expectations.

4. Consumption and Lifestyle: Independent income enables women to consume - fashion, entertainment, travel - outside family-sanctioned norms, constructing identities not solely defined by familial roles.

Limitations on Personal Freedom:

1. Safety and Harassment: Urban spaces are not automatically safe. Incidents of workplace harassment, unsafe housing conditions, and vulnerability during commutes represent real constraints on freedom - particularly for working-class women in informal employment.

2. Social Surveillance Reimagined: Urban landlords, PG accommodation rules, moral policing by neighbours, and the gaze of male colleagues replicate elements of the rural social surveillance that migration sought to escape.

3. Intersectionality: Dalit, tribal, or Muslim women migrants face compounded discrimination - class, caste, religion, and gender intersect to shape their urban experiences differently from upper-caste, middle-class migrant women.

Impact on Family Relationships:

1. Remittances and Economic Contribution: Working women's financial contributions elevate their status within families. Remittances support younger siblings' education, parents' healthcare, and household improvements - transforming daughters from 'burdens' to 'assets' in family calculations.

2. Renegotiated Patriarchy: The traditional expectation that daughters remain under family control until marriage is being renegotiated. Families increasingly acquiesce to daughters' migration, though often with ongoing monitoring (daily phone calls, restrictions on social life).

3. Marital Autonomy: Urban women develop greater agency in spouse selection - choosing partners of their own choosing, sometimes across caste lines - creating tension with family expectations of arranged marriage.

4. Emotional Strain and Distance: Physical separation creates loneliness, guilt (particularly for elder-care obligations), and weakened kinship ties - a cost often borne silently by migrant women.

5. Agents of Change: Return migrants bring transformed gender attitudes back to villages - educating daughters, challenging dowry, supporting daughters' education - making female migration a vector of normative change.

Conclusion: Globalisation-driven female urban migration is a complex, class-differentiated phenomenon. It has substantially expanded personal freedoms - financial, spatial, social - while simultaneously exposing women to new forms of vulnerability. It is renegotiating family relationships rather than severing them, creating a more negotiated rather than submissive family dynamic. The net effect is a gradual, uneven, but real transformation of gender relations in contemporary India.`,
    sources: [
      { name: "NCERT Sociology - Class XII", chapter: "Globalisation and Social Change" },
      { name: "Economic Survey", chapter: "Female Labour Force Participation" },
    ],
  },

  {
    _id: "mains_gs1_2024_03",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Social Justice",
    subTopic: "Affirmative Action & Policy",
    marks: 15,
    directive: "Comment",
    wordLimit: 150,
    questionText:
      "Despite comprehensive policies for equity and social justice, underprivileged sections are not yet getting the full benefits of the affirmative actions envisaged by the constitutions. Comment",
    keyPoints: [
      "Constitutional provisions: Articles 15(4), 16(4), 46, 335, Fifth and Sixth Schedules",
      "Affirmative action tools: reservations in education/jobs, welfare schemes, special courts",
      "Gap between policy and outcome: leakages, awareness gaps, institutional barriers",
      "Creamy layer issue: benefits captured by relatively privileged within reserved categories",
      "Structural barriers: land ownership, social capital, geographic remoteness",
      "Need: sub-categorisation, better targeting, grievance redress, addressing intersectionality",
    ],
    idealAnswer: `Introduction: The Indian Constitution, through its transformative vision, mandated affirmative action for historically marginalised communities - Scheduled Castes, Scheduled Tribes, Other Backward Classes, and religious minorities. Article 46 directs the state to promote educational and economic interests of weaker sections; Articles 15(4) and 16(4) enable reservations. Seven decades of policy implementation reveal a significant gap between constitutional intent and ground reality.

Constitutional and Policy Framework:
India has one of the world's most comprehensive affirmative action frameworks: reservations in government jobs (15% SC, 7.5% ST, 27% OBC) and educational institutions; scholarship schemes; special courts under the SC/ST (Prevention of Atrocities) Act; Fifth and Sixth Schedule protections for tribal areas; and targeted welfare schemes (PM-JANMAN for PVTGs, Eklavya Model Residential Schools).

Why Benefits Remain Incomplete:

1. Creamy Layer and Elite Capture: Within reserved categories, relatively more privileged families (those with better education, urban location, social capital) capture a disproportionate share of reservation benefits. First-generation beneficiaries are left behind. The Supreme Court's Jarnail Singh judgment (2018) mandated 'creamy layer' exclusion for promotions, reflecting this concern.

2. Poor Implementation and Leakages: Welfare schemes suffer from targeting errors, ghost beneficiaries, and middlemen. The Direct Benefit Transfer (DBT) has improved efficiency but digital and banking access gaps exclude the most marginalised.

3. Structural Barriers: Reservations address public sector employment and government educational institutions - a shrinking share of the economy. The private sector, which absorbs most new jobs, has no mandatory reservations. Land ownership gaps, lack of social capital, and geographic remoteness (tribal areas) compound exclusion.

4. Quality Education Deficit: Reservation of seats is rendered hollow if pre-college education quality is poor. The majority of SC/ST students attend under-resourced government schools, creating a pipeline problem that seats in IITs cannot solve without accompanying pre-school and school-level interventions.

5. Intra-Category Inequality: The SC and OBC categories contain enormous internal diversity. Sub-categorisation (recognised by the Supreme Court in the Punjab State vs. Davinder Singh case, 2024) is needed to ensure the most backward communities within reserved categories are not permanently displaced by relatively advanced ones.

6. Social Discrimination Persists: Economic advancement alone does not dissolve social discrimination. Dalits face continued caste-based violence, untouchability practices in rural areas, and social exclusion even when economically upwardly mobile.

7. Awareness and Access Gaps: Many eligible beneficiaries remain unaware of entitlements, lack documentation (caste certificates, income proof), or face bureaucratic barriers to accessing benefits.

Way Forward:
Sub-categorisation within reserved categories, extending affirmative action to the private sector (voluntary in the first instance), strengthening pre-primary and school-level education in tribal and Dalit habitations, simplifying documentation requirements, and robust grievance redress mechanisms are needed.

Conclusion: The constitutional promise of equity remains aspirational rather than achieved. The gap reflects not a failure of vision but of implementation, targeting, and structural change. Fulfilling the constitutional mandate requires addressing root causes - land, education quality, social discrimination - alongside procedural reforms in affirmative action delivery.`,
    sources: [
      { name: "Ministry of Social Justice Annual Report", chapter: "Welfare Schemes" },
      { name: "NCERT Political Science - Class XI", chapter: "Rights in the Indian Constitution" },
    ],
  },

  {
    _id: "mains_gs1_2024_04",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Regional Disparities",
    subTopic: "Diversity vs. Disparity",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "What is regional disparity? How does it differ from diversity? How serious is the issue of regional disparity in India?",
    keyPoints: [
      "Regional disparity: unequal distribution of income, development, and opportunities across regions",
      "Diversity vs. disparity: diversity is natural variation; disparity is inequitable outcomes",
      "India's inter-state disparities: GSDP per capita, HDI, infrastructure, industrialisation",
      "BIMARU states vs. developed states: the 'two Indias' problem",
      "Causes: historical underdevelopment, resource distribution, geographic disadvantage, governance",
      "PM-UDAY, aspirational districts, special category status debates",
      "Need: equalisation transfers, Finance Commission, infrastructure investment in lagging regions",
    ],
    idealAnswer: `Regional Disparity - Definition:
Regional disparity refers to systematic, structural inequalities in economic output, human development, infrastructure, and living standards across different geographical areas within a country. It is characterised by persistent gaps that do not narrow through normal market processes without policy intervention.

Regional Disparity vs. Regional Diversity:
Regional diversity refers to natural, historically evolved differences in culture, language, ecology, cuisine, and traditions - the varied textures that make India unique. Diversity is descriptive and inherently neutral. Regional disparity, by contrast, is normative - it describes unequal access to resources, opportunities, and outcomes that disadvantage people in particular regions through no fault of their own. Diversity enriches; disparity excludes.

Seriousness of Regional Disparity in India:

1. Per Capita Income Gaps: Goa's per capita GSDP (~₹5.5 lakh) is over 10 times that of Bihar (~₹50,000). The top 5 states (Maharashtra, Tamil Nadu, Karnataka, Gujarat, Uttar Pradesh) account for ~50% of national GDP.

2. Human Development Disparities: Kerala's HDI approaches that of middle-income countries; Bihar and UP rank among the world's worst-performing territories on health and education indicators. Child mortality in UP remains 2-3x higher than in Kerala.

3. Infrastructure Deficit: States like Jharkhand, Bihar, and the Northeast lag severely in road connectivity, power supply, internet access, and urban infrastructure - creating a self-reinforcing cycle of low investment and slow growth.

4. Industrialisation Gap: The BIMARU (Bihar, Madhya Pradesh, Rajasthan, Uttar Pradesh - now partially reformed) states have not attracted manufacturing investment proportionate to their labour supply. Special Economic Zones and industrial corridors remain concentrated in coastal and western India.

5. Northeast and Island Territories: Geographic isolation, ethnic complexity, and historical neglect have left the Northeast significantly behind mainland India despite considerable natural resources.

Causes:
Historical factors (unequal colonial extraction, zamindari systems), geographic disadvantage (landlocked states, difficult terrain), governance quality differences, and the path-dependent nature of industrial agglomeration all contribute.

Government Responses:
Finance Commission equalisation transfers, the Aspirational Districts Programme (targeting 112 lagging districts), PM-UDAY, special category status debates, and the Act East Policy for the Northeast represent policy attempts to address disparities.

Conclusion: Regional disparity in India is serious and widening in some dimensions despite overall growth. It threatens national cohesion, perpetuates inter-generational poverty, and represents an enormous unrealised economic potential. Addressing it requires sustained, targeted investment in human capital, infrastructure, and governance capacity in lagging regions - alongside structural fiscal equalisation.`,
    sources: [
      { name: "NITI Aayog SDG India Index", chapter: "State Rankings" },
      { name: "Finance Commission Reports", chapter: "Fiscal Devolution" },
      { name: "Economic Survey", chapter: "Regional Development" },
    ],
  },

  // ─── WORLD GEOGRAPHY ─────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_05",
    year: 2024,
    paper: "GS Paper 1",
    subject: "World Geography",
    topic: "Atmospheric Phenomena",
    subTopic: "Twisters / Tornadoes",
    marks: 15,
    directive: "Explain",
    wordLimit: 150,
    questionText:
      "What is a twister? Why are the majority of twisters observed in areas around the Gulf of Mexico?",
    keyPoints: [
      "Twister = tornado: violently rotating column of air connecting cumulonimbus cloud to ground",
      "Formation: supercell thunderstorms, wind shear (change in speed/direction with height)",
      "Gulf of Mexico: warm moist air (Gulf) meets cold dry air (Rockies/Canada) → instability",
      "Tornado Alley: Texas, Oklahoma, Kansas, Nebraska - flat terrain aids wind shear",
      "Enhanced Fujita (EF) Scale: EF0 to EF5",
      "India: limited tornadoes due to different atmospheric dynamics",
    ],
    idealAnswer: `What is a Twister?
A twister, more formally called a tornado, is a violently rotating column of air that extends from a cumulonimbus (thunderstorm) cloud to the Earth's surface. It appears as a funnel-shaped cloud and is characterised by extreme wind speeds (ranging from 65 km/h in weak tornadoes to over 480 km/h in the most violent ones), a narrow width (typically 100–2,000 metres), and a path of destruction along its track. Tornadoes are rated on the Enhanced Fujita (EF) Scale from EF0 (minor damage) to EF5 (catastrophic destruction).

Formation Process:
Tornadoes form within supercell thunderstorms - the most powerful class of thunderstorms. The key ingredients are:
(i) Wind shear - change in wind speed and/or direction with altitude, which causes horizontal rotation in the atmosphere.
(ii) A lifting mechanism - a front, dryline, or surface heating - that tilts horizontal rotation into the vertical.
(iii) Atmospheric instability - warm, moist air near the surface overlain by cooler, drier air aloft, creating the energy for violent convection.
When these conditions align, a rotating updraft (mesocyclone) develops within the thunderstorm; under the right conditions, this rotation tightens and intensifies into a tornado.

Why the Gulf of Mexico Region?

The area around the Gulf of Mexico - particularly "Tornado Alley" spanning Texas, Oklahoma, Kansas, and Nebraska - is the world's most tornado-prone region due to a unique convergence of geographic and atmospheric factors:

1. Warm, Moist Air Supply: The Gulf of Mexico acts as a vast reservoir of warm, moisture-laden air. Southerly winds continuously transport this unstable, buoyant air mass northward into the continental interior.

2. Cold, Dry Air from the North: The Rocky Mountains and the Canadian prairies supply cold, dry polar air masses that push southward across the Great Plains. When these collide with Gulf moisture, an explosive vertical instability is created.

3. Dry Line: A sharp moisture boundary called the "dryline" forms on the eastern slopes of the Rockies where Gulf moisture meets continental dry air. This dryline is a powerful trigger for supercell thunderstorms.

4. Intense Wind Shear: The contrast between the low-level southerly Gulf winds and upper-level westerly jet stream winds creates exceptional vertical wind shear - the essential ingredient for tornado formation.

5. Flat Terrain: The Great Plains' flat topography allows air masses to travel large distances without topographic interruption, enabling the persistent collision of contrasting air masses and providing unobstructed paths for tornado development and movement.

Conclusion: The Gulf of Mexico's warm moisture, combined with cold Rocky Mountain/polar air, a triggering dryline, strong wind shear, and flat terrain creates the world's most favourable tornado incubator - making Tornado Alley a globally unique meteorological phenomenon.`,
    sources: [
      { name: "NCERT Physical Geography - Class XI", chapter: "Atmospheric Circulation and Weather Systems" },
      { name: "NOAA Storm Prediction Center", chapter: "Tornado Formation" },
    ],
  },

  {
    _id: "mains_gs1_2024_06",
    year: 2024,
    paper: "GS Paper 1",
    subject: "World Geography",
    topic: "Atmospheric Phenomena",
    subTopic: "Aurora Australis & Borealis",
    marks: 15,
    directive: "Explain",
    wordLimit: 150,
    questionText:
      "What are aurora australis and aurora borealis? How are these triggered?",
    keyPoints: [
      "Aurora borealis (Northern Lights) and aurora australis (Southern Lights)",
      "Caused by solar wind (charged particles) interacting with Earth's magnetosphere",
      "Particles funnelled to polar regions by Earth's magnetic field",
      "Collision with atmospheric gases (O, N) produces coloured light",
      "Colours: green (oxygen at 100-150 km), red (oxygen >200 km), blue/purple (nitrogen)",
      "Solar maximum intensifies auroral activity",
      "India's Ladakh and Antarctica India connection",
    ],
    idealAnswer: `What are Auroras?
Aurora borealis (Northern Lights) and aurora australis (Southern Lights) are spectacular natural light displays that appear in the high-latitude night sky, typically as shimmering curtains, arcs, rays, or rippling bands of coloured light. Aurora borealis occurs near the North Pole (visible from Norway, Canada, Alaska, Iceland), while aurora australis occurs near the South Pole (visible from Antarctica, southern New Zealand, Tasmania).

How Are Auroras Triggered?

The aurora is produced by the interaction between charged particles from the Sun and Earth's upper atmosphere, mediated by Earth's magnetic field. The process unfolds in stages:

1. Solar Wind: The Sun continuously emits a stream of charged particles (mainly protons and electrons) called the solar wind. During solar flares and coronal mass ejections (CMEs), this stream intensifies dramatically.

2. Earth's Magnetosphere: Earth's magnetic field (magnetosphere) deflects most of the solar wind around the planet, protecting life from radiation. However, the magnetosphere is compressed on the Sun-facing side and stretched into a long tail on the opposite side.

3. Magnetic Reconnection: When the solar wind's magnetic field opposes Earth's at the magnetopause, magnetic field lines can "reconnect," allowing charged particles to enter the magnetosphere and be channelled toward the polar regions along magnetic field lines.

4. Funnel to Poles: The charged particles travel along Earth's magnetic field lines, which converge at the magnetic poles. This is why auroras are concentrated in oval-shaped "auroral zones" around both poles.

5. Atmospheric Collision and Light Emission: As energised electrons and protons collide with oxygen and nitrogen atoms in the upper atmosphere (80–300 km altitude), they excite these atoms to higher energy states. When the atoms return to their ground state, they release the excess energy as photons of visible light:
   - Green: Oxygen at ~100–150 km altitude (most common)
   - Red: Oxygen at altitudes above ~200 km
   - Blue/Violet: Nitrogen molecules
   - Pink/Purple: Nitrogen at lower altitudes

6. Solar Cycle Enhancement: Auroral activity peaks during solar maximum (the peak of the ~11-year sunspot cycle) when solar flares and CMEs are most frequent. The exceptional aurora events of May 2024 were linked to an unusually active solar maximum period.

India Connection:
India's Maitri and Bharati research stations in Antarctica monitor aurora australis. In extraordinary solar storm conditions, auroras have been observed as far south as Ladakh in India.`,
    sources: [
      { name: "NCERT Physical Geography - Class XI", chapter: "Earth's Magnetism" },
      { name: "NASA Space Weather", chapter: "Aurora Science" },
    ],
  },

  // ─── INDIAN GEOGRAPHY ────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_07",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Geography",
    topic: "Water Resources",
    subTopic: "Groundwater & Food Security",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "The groundwater potential of the Gangetic valley is on a serious decline. How may it affect the food security of India?",
    keyPoints: [
      "Gangetic valley: granary of India - wheat, rice, sugarcane, pulses",
      "Over-extraction for irrigation; Green Revolution legacy (paddy-wheat rotation)",
      "NASA GRACE satellite data: water table declining 0.3–0.5 m/year in parts of Punjab/Haryana",
      "Impact on food security: crop failure, increased costs, migration, price inflation",
      "Small/marginal farmers most vulnerable: cannot afford deeper borewells",
      "Policy: PMKSY, Atal Bhujal Yojana, crop diversification incentives, PM-KUSUM",
    ],
    idealAnswer: `Introduction: The Gangetic valley - encompassing the Indo-Gangetic plain across Punjab, Haryana, Uttar Pradesh, Bihar, and West Bengal - is India's agricultural heartland, contributing nearly 40% of national food grain production. Its productivity is critically dependent on groundwater irrigation, making the observed depletion of aquifers a food security emergency.

State of Groundwater Depletion:
NASA's GRACE satellite mission documented groundwater depletion in northwestern India at an alarming rate - water tables in parts of Punjab and Haryana have been falling at 0.3–0.5 metres per year. Central Ground Water Board (CGWB) data classifies several districts in Punjab, Haryana, and western UP as "over-exploited." The Green Revolution's paddy-wheat rotation, combined with free electricity for pumping, has created a structural over-extraction crisis.

Impact on Food Security:

1. Agricultural Productivity Decline: As water tables fall, shallow borewells fail, and the cost of deeper drilling and pumping rises sharply. Small and marginal farmers - who constitute ~86% of India's farm households - cannot afford deeper borewells or submersible pumps, leading to crop abandonment and productivity collapse.

2. Crop Failure and Distress Migration: Water-stressed agriculture leads to crop failures in drought years, driving distress migration of farming communities - weakening the very labour force that sustains agricultural production.

3. Shift in Cropping Patterns: Farmers facing water scarcity will shift from water-intensive crops (paddy, sugarcane) to less productive, drought-tolerant crops - reducing the overall nutritional output of the Gangetic plain.

4. Food Price Inflation: Supply disruptions in India's primary food grain belt will cause price volatility in wheat and rice - disproportionately affecting the urban poor and net food-purchasing rural households.

5. Impact on Buffer Stocks: India's food security architecture depends on Minimum Support Price (MSP) procurement of wheat and rice primarily from Punjab, Haryana, and UP. Groundwater depletion threatening yields in these states directly risks national buffer stock maintenance.

6. Long-Term Irreversibility: Aquifer depletion - especially of deep confined aquifers - may be irreversible on human timescales. Unlike surface water, depleted aquifers do not refill quickly, making groundwater depletion a permanent structural threat.

Policy Responses:
Atal Bhujal Yojana (community-led groundwater management), PMKSY's "More Crop Per Drop" (drip/sprinkler irrigation), PM-KUSUM (solar pumps reducing extraction incentive), and crop diversification incentives (direct income support for paddy farmers who shift crops in Punjab) are key interventions.

Conclusion: Groundwater depletion in the Gangetic valley is not merely an environmental issue - it is a slow-moving food security crisis. India's ability to feed 1.4 billion people while achieving export surpluses depends critically on reversing this trend through behavioural, technological, and policy interventions - before the aquifer crisis becomes irreversible.`,
    sources: [
      { name: "Central Ground Water Board Reports", chapter: "Indo-Gangetic Plain" },
      { name: "Economic Survey", chapter: "Agriculture and Water" },
    ],
  },

  // ─── WORLD HISTORY ───────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_08",
    year: 2024,
    paper: "GS Paper 1",
    subject: "World History",
    topic: "Colonialism",
    subTopic: "Industrial Revolution & India",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "How far was the Industrial Revolution in England responsible for the decline of handicrafts and cottage industries in India?",
    keyPoints: [
      "Industrial Revolution (1760s–1840s): mechanised production, cheap textiles (Manchester mills)",
      "Pre-colonial India: thriving textile industry - Dacca muslin, Patola silk, Murshidabad silk",
      "Mechanism: cheap machine-made goods flooded Indian markets; British free trade policy destroyed Indian industry",
      "Tariff discrimination: Indian goods taxed in Britain; British goods entered India duty-free",
      "Deindustrialisation thesis (R.C. Dutt, Dadabhai Naoroji, drain of wealth)",
      "Limits: internal factors - caste restrictions, lack of capital, market fragmentation",
      "Swadeshi movement as response",
    ],
    idealAnswer: `Introduction: The Industrial Revolution in England (c. 1760–1840) transformed Britain from an agrarian into the world's first industrial economy. Its impact on India's pre-existing craft and cottage industries was devastating - though the degree of responsibility requires nuanced assessment.

Pre-Industrial India's Craft Economy:
Before British paramountcy, India was among the world's leading manufacturing nations. Its textile exports - Dacca muslin (so fine it was called "woven air"), Patola silk, Benaras brocade, Coromandel calico - were prized globally. India contributed ~25% of global GDP in 1700, much of it from manufacturing and handicrafts.

How the Industrial Revolution Caused Decline:

1. Cheap Machine-Made Substitutes: Lancashire's power looms produced cotton textiles at a fraction of the cost of handloom production. By the 1820s, machine-made British cloth flooded Indian markets, undercutting Indian weavers who could not compete on price.

2. Tariff Manipulation: Indian textiles were subject to prohibitive tariffs (up to 70-80%) when exported to Britain, while British manufactured goods entered India under free trade or minimal tariffs. This asymmetric trade policy - classic colonialism - destroyed Indian competitive advantage.

3. Drain of Wealth: R.C. Dutt, Dadabhai Naoroji, and later historians argued that colonial economic policy systematically drained India's resources - tax revenues, agricultural surplus - leaving no capital for industrial modernisation. The "drain of wealth" thesis links deindustrialisation to colonial extraction.

4. Destruction of Royal Patronage: The decline of Mughal and regional courts under British conquest destroyed the luxury patronage system that had sustained fine craft traditions - silk weavers, metal workers, jewellers - who produced for aristocratic consumption.

5. Forced Commercialisation of Agriculture: Colonial policy shifted India toward raw material production (cotton, indigo, jute) for British factories, converting artisan producers into agricultural labourers dependent on primary commodities.

Limits of the Industrial Revolution Explanation:

1. Internal Structural Weaknesses: Indian handicraft industries had internal limitations - caste restrictions on occupational mobility, absence of credit markets, fragmented internal markets, and technological stagnation - that would have constrained growth even without British competition.

2. Pre-Existing Decline: Some historians (Morris D. Morris) argue that Indian textile decline preceded the full impact of British industrialisation, reflecting internal market problems and Mughal imperial collapse.

3. Partial Survival: Many craft traditions - Banarasi weaving, Kanchipuram silk, Bidri metalwork, Channapatna toys - survived and even thrived in niche markets, suggesting the impact was selective rather than total.

Conclusion: The Industrial Revolution in England was the primary external cause of India's deindustrialisation, amplified by deliberate colonial economic policies (tariff discrimination, free trade imperialism). However, internal structural weaknesses and the collapse of indigenous political patronage systems were contributing factors. The responsible verdict is that the Industrial Revolution, mediated by colonial policy, was largely - but not solely - responsible for the destruction of India's handicraft economy.`,
    sources: [
      { name: "Bipin Chandra - History of Modern India", chapter: "Economic Impact of British Rule" },
      { name: "R.C. Dutt - Economic History of India", chapter: "Deindustrialisation" },
    ],
  },

  {
    _id: "mains_gs1_2024_09",
    year: 2024,
    paper: "GS Paper 1",
    subject: "World History",
    topic: "World Wars",
    subTopic: "First World War - Balance of Power",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "How far is it correct to say that the First World War was fought essentially for the balance of power?",
    keyPoints: [
      "Balance of power theory: preventing dominance by any single power through alliances",
      "Alliance system: Triple Alliance (Germany, Austria-Hungary, Italy) vs. Triple Entente (France, Russia, Britain)",
      "German rise threatening balance: naval challenge to Britain, Moroccan crises",
      "Other factors: nationalism (Serbia, Pan-Slavism), imperialism (colonial rivalry), militarism, immediate trigger (assassination of Archduke Franz Ferdinand)",
      "Fischer Controversy: German war guilt vs. systemic causes",
      "Conclusion: balance of power was a major structural factor but not the only explanation",
    ],
    idealAnswer: `Introduction: The First World War (1914–1918) emerged from a complex web of causes. The balance of power - the 19th-century European system designed to prevent hegemonic dominance through shifting alliances - was unquestionably a major structural factor. Whether it was the essential cause is a more contested proposition.

The Balance of Power Argument (Supportive Evidence):

1. The Alliance System: The very architecture of pre-war Europe was designed around balance of power logic. The Triple Alliance (Germany, Austria-Hungary, Italy) and Triple Entente (France, Russia, Britain) were explicit balance mechanisms. When the assassination of Archduke Franz Ferdinand triggered Austrian mobilisation, the alliance system transformed a Balkan crisis into a continental war.

2. German Rise as Systemic Threat: Germany's rapid industrialisation, naval expansion (the Anglo-German naval race), and aggressive foreign policy (Moroccan Crises of 1905 and 1911) were perceived by Britain and France as threatening the European balance. Britain's entry into the war was largely motivated by preventing German hegemony over Europe.

3. Pre-emptive Logic: Germany's fear of a two-front war (Schlieffen Plan) and Russia's fear of falling permanently behind in military power both reflect balance of power anxieties - states acting pre-emptively to prevent unfavourable shifts in the balance.

4. British Strategic Calculation: Britain had no formal obligation to France under the Triple Entente. Its decision to fight was driven by the strategic imperative of preventing German domination of the European continent - a classic balance of power calculation.

Limitations of the Balance of Power Explanation:

1. Nationalism: Fierce nationalist sentiments - Pan-Slavism in the Balkans (fuelling Serbia's ambitions), German nationalism, and the nationalist movements of subject peoples (Czechs, Poles, South Slavs) - were independent drivers of the conflict not reducible to balance calculations.

2. Imperialism: Colonial rivalries in Africa and Asia (Fashoda Crisis, Morocco) generated tensions rooted in economic competition and prestige, not just strategic balance.

3. Militarism: The celebration of military values, arms racing, and the influence of military establishments on civilian decision-making (the "short war illusion") created a culture in which war seemed manageable and even desirable.

4. Immediate Trigger: The assassination of Archduke Franz Ferdinand set in motion a crisis escalation that the alliance system amplified - but the particular sequence of misperceptions, miscommunications, and diplomatic failures was contingent, not structurally determined.

5. Fischer Controversy: Fritz Fischer's argument that Germany deliberately sought a European war for expansionist aims (September Programme) suggests intentional aggression rather than systemic balance maintenance.

Assessment:
The balance of power framework provides the best single structural explanation for why a Balkan assassination escalated into a world war - through the alliance system that transformed bilateral conflicts into multilateral ones. However, nationalism, imperialism, militarism, and specific German foreign policy choices were co-equal contributing factors.

Conclusion: It is partially correct to say the First World War was fought essentially for balance of power, but this explanation is incomplete. The war was the product of multiple converging causes - structural (alliance systems, imperial competition), ideological (nationalism, militarism), and contingent (the assassination and the specific crisis management failures of July 1914). The balance of power system was the trap; the other factors provided the trigger.`,
    sources: [
      { name: "Norman Rich - Great Power Diplomacy 1814-1914", chapter: "Origins of WWI" },
      { name: "NCERT History - Class XI", chapter: "The First World War" },
    ],
  },

  // ─── ART & CULTURE ───────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_10",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Art & Culture",
    topic: "Temple Architecture",
    subTopic: "Chola Art & Architecture",
    marks: 15,
    directive: "Comment",
    wordLimit: 150,
    questionText:
      "Though the great Cholas are no more, their name is still remembered with great pride because of their highest achievements in the domain of art and architecture. Comment.",
    keyPoints: [
      "Chola dynasty (9th–13th century CE): apex under Rajaraja I and Rajendra I",
      "Dravidian temple architecture: gopuram, vimana, mandapa, garbhagriha",
      "Brihadeeswarar Temple (Thanjavur): UNESCO World Heritage, 216-foot vimana, single capstone",
      "Gangaikonda Cholapuram and Darasuram temples - Great Living Chola Temples",
      "Bronze casting: lost-wax (cire perdue) technique; Nataraja (Shiva as Cosmic Dancer)",
      "Naval power enabling artistic patronage: Southeast Asian influence",
      "Literary contributions: Kamban's Ramavataram",
    ],
    idealAnswer: `Introduction: The Chola dynasty (c. 850–1279 CE), which ruled from their heartland in the Kaveri delta, achieved a synthesis of military power, administrative genius, and artistic patronage that produced some of humanity's most enduring cultural treasures. Their contributions to art and architecture represent the apex of Dravidian civilisation.

Temple Architecture:

1. Brihadeeswarar Temple, Thanjavur (1010 CE): Commissioned by Rajaraja I, this is the supreme achievement of Chola architecture and of Dravidian temple building tradition. Its vimana (tower over the sanctum sanctorum) rises to 216 feet - making it the tallest in South India at the time of construction. The single capstone (kalasa) weighing 80 tonnes atop the tower is believed to have been raised via a 6-kilometre inclined ramp. The temple's granite construction, precise astronomical orientation, and elaborate fresco paintings within the sanctum demonstrate mastery of architecture, engineering, and visual art simultaneously. It is now a UNESCO World Heritage Site.

2. Gangaikonda Cholapuram (c. 1035 CE): Built by Rajendra I to celebrate his conquest extending to the Ganga, this temple rivals Thanjavur in sculptural richness. Its slightly concave vimana and the graceful Devi sculpture are considered among the finest expressions of Chola aesthetics.

3. Darasuram (Airavatesvara Temple, c. 12th century): The third of the "Great Living Chola Temples" (collectively UNESCO-listed), known for its miniaturist sculptural detail, the chariot-form mandapa, and the stone staircase that produces musical notes when struck.

Bronze Casting - Nataraja and Beyond:

The Chola contribution to Indian art is perhaps most globally recognised through their bronze sculptures, produced using the lost-wax (cire perdue) technique. The Nataraja (Shiva as Lord of the Dance) is the canonical image: Shiva dancing within a ring of fire (prabha mandala), representing the cosmic cycle of creation, preservation, and destruction. This image has become one of India's most internationally recognised cultural symbols - displayed at CERN as a metaphor for the dance of subatomic particles.

Other Chola bronzes - of Ardhanarishvara, Uma-Maheshvara, the Alvars and Nayanmars - display an unparalleled combination of spiritual expression, anatomical precision, and aesthetic grace.

Literary and Other Contributions:
Kamban's Tamil Ramavataram (Kamba Ramayanam), composed during the Chola period, is one of Tamil literature's greatest masterpieces. Chola patronage sustained classical Carnatic music, Bharatanatyam dance, and Tamil literature.

Naval Power and Cultural Diffusion:
Chola maritime power - demonstrated in Rajendra I's naval expedition to Southeast Asia (c. 1025 CE) - enabled the diffusion of South Indian cultural forms to Cambodia (Angkor Wat), Thailand, Myanmar, and Indonesia, making the Cholas agents of a broader Indic civilisational sphere.

Conclusion: The Cholas' greatness endures because their artistic legacy is not merely historical - the Brihadeeswarar Temple still functions as a living religious site, the bronzes animate museums worldwide, and Nataraja has become a universal symbol of cosmic energy. They achieved a rare integration of spiritual vision, technical mastery, and aesthetic refinement that few civilisations have matched.`,
    sources: [
      { name: "NCERT History - Class XI", chapter: "Early Empires" },
      { name: "UNESCO World Heritage - Great Living Chola Temples", chapter: "Outstanding Universal Value" },
    ],
  },

  // ─── INDIAN SOCIETY ──────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_11",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Development",
    subTopic: "Government-NGO-Private Sector Collaboration",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "In dealing with socio-economic issues of development, what kind of collaboration between government, NGOs and private sector would be most productive?",
    keyPoints: [
      "Government: policy, regulation, funding, scale, legitimacy",
      "NGOs: last-mile delivery, community trust, innovation, accountability",
      "Private sector: capital, technology, efficiency, employment",
      "Models: PPP, CSR, SHG-Bank linkage, social enterprise",
      "Productive collaboration: complementary roles, clear accountability, shared data",
      "Examples: ASHA workers, Nandghar (Vedanta), Teach For India",
    ],
    idealAnswer: `Introduction: Socio-economic development challenges - poverty, malnutrition, education gaps, health deficits - are too complex and large-scale for any single actor. Productive collaboration between government, NGOs, and the private sector leverages the comparative advantage of each.

Most Productive Collaboration Model:

1. Government as Framework-Setter and Funder: Government provides the policy framework, public financing (through schemes like MGNREGS, PM-POSHAN), regulatory standards, and the scale that neither NGOs nor private entities can replicate. It provides legitimacy and universal coverage.

2. NGOs as Last-Mile Implementers and Innovators: NGOs possess community trust, local language capacity, and flexibility to innovate. Productive collaboration involves government contracting well-performing NGOs for last-mile service delivery (as in ASHA workers under NHM, or child protection under ICPS). NGOs also serve as accountability mechanisms, monitoring government scheme implementation.

3. Private Sector as Capital and Technology Provider: Through Corporate Social Responsibility (CSR - mandated under Companies Act, 2013 for eligible companies), public-private partnerships, and social enterprise models, the private sector brings capital, technology, and managerial efficiency. Examples: Vedanta's Nandghar (upgraded anganwadis), ITC's e-Choupal (agricultural information platform), Azim Premji Foundation (education).

4. Optimal Collaboration Structure: The most productive models feature clear role demarcation, shared data systems (avoiding duplication), joint accountability frameworks, and regular performance review. The Jan Dhan-Aadhaar-Mobile (JAM) trinity is a government-led technology platform that NGOs and private entities use to deliver last-mile benefits.

Conclusion: No single actor can achieve development at scale with quality. Government provides reach and resources; NGOs provide community trust and innovation; private sector provides capital and efficiency. Productive collaboration harnesses all three in a complementary, accountable partnership - as exemplified by the ASHA model, the SHG-bank linkage programme, and successful PPP health insurance schemes.`,
    sources: [
      { name: "Ministry of Rural Development", chapter: "PPP in Development" },
      { name: "Economic Survey", chapter: "Social Sector" },
    ],
  },

  {
    _id: "mains_gs1_2024_12",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Social Change",
    subTopic: "Intercaste & Interreligious Marriages",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "Intercaste marriages between castes which have socio-economic parity have increased, to some extent, but this is less true of interreligious marriages. Discuss.",
    keyPoints: [
      "Rising intercaste marriages: education, urbanisation, shared professional spaces",
      "Endogamy still dominant: IHDS data shows <10% intercaste marriages nationally",
      "Socio-economic parity reducing caste barriers: class convergence weakening caste identity",
      "Interreligious marriages rarer: religious identity more emotionally charged, communal politics",
      "Special Marriage Act 1954: legal framework; anti-conversion laws creating deterrence",
      "Social violence: honour killings, khap panchayats",
    ],
    idealAnswer: `The observation captures a real sociological trend in contemporary India. Intercaste marriages have gradually increased, particularly in urban areas and among educated, professionally employed young people. When caste groups share similar socio-economic status - both parties are college-educated, urban professionals - the material and cultural distance that historically enforced endogamy narrows. IHDS data, however, still shows fewer than 10% of Indian marriages are intercaste, indicating dominant endogamy.

Factors enabling more intercaste marriages: co-educational institutions, urban anonymity, shared workplaces, digitally mediated courtship, and declining salience of caste as primary identity among educated youth.

Interreligious marriages remain rarer for distinct reasons: religious identity carries deeper emotional, ritual, and community significance than caste. Religious communities perceive intermarriage as an existential threat to the community's reproduction. The political environment - with anti-conversion laws (Love Jihad legislation in several states), communal polarisation, and religious nationalist mobilisation - has created additional deterrents.

The Special Marriage Act (1954) provides a legal framework for marriages outside caste and religion without requiring religious conversion, but its provisions require 30-day notice publication, exposing couples to social violence. Honour killings and khap panchayat interventions, while declining, remain real threats.

Conclusion: Socio-economic convergence is gradually weakening caste barriers to marriage, but religious identity - reinforced by political mobilisation and communal tensions - maintains a stronger endogamy norm. Social legislation exists but requires social change to be effective.`,
    sources: [
      { name: "IHDS Survey", chapter: "Marriage Patterns" },
      { name: "NCERT Sociology - Class XII", chapter: "Change and Development in India" },
    ],
  },

  {
    _id: "mains_gs1_2024_13",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Gender",
    subTopic: "Gender Equality, Equity & Empowerment",
    marks: 10,
    directive: "Distinguish / Explain",
    wordLimit: 100,
    questionText:
      "Distinguish between gender equality, gender equity and women's empowerment. Why is it important to take gender concerns into account in programme design and implementation?",
    keyPoints: [
      "Gender equality: same treatment/rights regardless of gender",
      "Gender equity: fair treatment accounting for different needs/disadvantages (corrective)",
      "Women's empowerment: process by which women gain power, agency, and autonomy",
      "Distinction: equality is formal; equity is substantive; empowerment is transformative",
      "Programme design: gender-blind programmes perpetuate inequality; gender-responsive improves outcomes",
      "Examples: MGNREGS (33% women; equal wages), PM Ujjwala (targeted women), SHGs",
    ],
    idealAnswer: `Distinctions:

Gender Equality refers to the equal rights, responsibilities, and opportunities of women and men. It implies identical treatment - the same access to education, healthcare, employment, and political participation. It is a formal, legal concept.

Gender Equity refers to fairness and justice in the distribution of benefits and responsibilities between women and men, taking into account their different needs, roles, and historical disadvantages. Equity may require differential treatment to achieve equal outcomes - for example, reserving seats for women in panchayats or providing maternity benefits.

Women's Empowerment is a transformative process through which women gain awareness of their rights, develop self-confidence, acquire economic independence, and exercise meaningful control over decisions affecting their lives. It goes beyond access (equality) and fairness (equity) to agency and voice.

The relationship: Equality provides formal rights; equity provides corrective tools to compensate for historical disadvantage; empowerment transforms the power relations that produced inequality in the first place.

Why Gender Concerns in Programme Design Matter:

Gender-blind programmes assume universal, neutral beneficiaries - but existing inequalities mean women face different constraints (time poverty, mobility restrictions, property rights deficits, decision-making exclusion) that prevent equal access to programme benefits.

Gender-responsive design - such as MGNREGS's mandate of 33% women participation and equal wages, PM Ujjwala targeting women as LPG beneficiaries, or SHG-based credit - improves both programme effectiveness and gender outcomes simultaneously. Women's nutritional status, child health, and education outcomes are strongly associated with women's control over household resources.

Conclusion: Ignoring gender in programme design perpetuates inequality; incorporating it multiplies development impact and accelerates progress toward SDG 5 (Gender Equality).`,
    sources: [
      { name: "UN Women", chapter: "Gender Equality and Equity" },
      { name: "NCERT Sociology - Class XII", chapter: "Gender Inequality" },
    ],
  },

  {
    _id: "mains_gs1_2024_14",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Population",
    subTopic: "Demographic Winter",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "What is the concept of 'demographic winter'? Is the world moving towards such a situation? Elaborate.",
    keyPoints: [
      "Demographic winter: sustained period of below-replacement fertility leading to population decline and ageing",
      "Replacement fertility: TFR of ~2.1 children per woman",
      "Global TFR declining: from 5.0 (1960) to ~2.3 (2023); some regions below replacement",
      "Affected: Japan, South Korea (TFR ~0.72), Europe, China (now declining population)",
      "Consequences: ageing workforce, pension system stress, labour shortage, healthcare costs",
      "Counterpoint: Sub-Saharan Africa still growing; India's TFR at replacement (~2.0)",
      "Not universal but a serious concern for specific countries/regions",
    ],
    idealAnswer: `Demographic Winter refers to a prolonged period during which a population's total fertility rate (TFR) falls significantly below the replacement rate of ~2.1 children per woman, leading to population ageing, shrinkage, and eventual decline. The metaphor evokes a "winter" - a dormant, contracting phase - following the demographic "summer" of high growth.

Is the World Moving Towards Demographic Winter?

The global picture is mixed rather than uniformly wintry:

Affected Regions: South Korea has the world's lowest TFR at approximately 0.72 (2023), an extraordinary demographic crisis. Japan, with a TFR of ~1.2, is already experiencing absolute population decline and severe ageing. Most of Europe (TFR ~1.5) is below replacement and relies on immigration to maintain population. China's population peaked in 2022 and is now declining - a consequence of decades of the one-child policy.

Consequences in Affected Countries: An ageing population creates severe fiscal stress - pension systems designed for young-heavy demographics face insolvency; healthcare costs rise sharply; labour shortages constrain economic growth; and social dynamism typically associated with young populations declines.

Counter-Trends: Sub-Saharan Africa retains high fertility rates (TFR ~4.5), and its population is projected to double by 2050. India's TFR has just reached replacement level (~2.0) and stabilised. Global population is still growing - projected to peak at ~10-11 billion around 2080-2100 before potentially declining.

Conclusion: Demographic winter is a real and serious phenomenon for specific countries (South Korea, Japan, parts of Europe and China), but not a universal global condition. The world faces a demographic divergence: ageing decline in developed and some middle-income countries; continued growth in developing regions. Managing this divergence - through migration, productivity gains, and social policy - is one of the 21st century's defining challenges.`,
    sources: [
      { name: "UN World Population Prospects 2022", chapter: "Fertility Trends" },
      { name: "Economic Survey", chapter: "Demographic Dividend" },
    ],
  },

  // ─── PHYSICAL GEOGRAPHY ──────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_15",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Physical Geography",
    topic: "Atmospheric Phenomena",
    subTopic: "Cloudbursts",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "What is the phenomenon of cloudbursts? Explain.",
    keyPoints: [
      "Cloudburst: extremely intense rainfall ≥100 mm/hour over a small area",
      "Mechanism: orographic lifting, convective instability, trapped moisture in mountains",
      "Himalayan region most affected: narrow valleys amplify runoff",
      "Kedarnath 2013, Leh 2010, Chamoli 2021 - disaster examples",
      "IMD definition and Early Warning System",
      "Urban heat islands increasing frequency in cities",
      "Climate change: intensifying extreme precipitation events",
    ],
    idealAnswer: `A cloudburst is an extreme meteorological event characterised by sudden, very intense rainfall - conventionally defined by the India Meteorological Department (IMD) as precipitation of 100 mm or more within one hour over a geographically small area (typically a few square kilometres).

Formation Mechanism:
Cloudbursts occur primarily in mountainous regions and are triggered by a combination of factors:
(i) Orographic Lifting: When moisture-laden winds strike a mountain barrier, they are forced upward rapidly. The sudden altitude gain causes rapid cooling and condensation.
(ii) Convective Instability: Intense solar heating creates powerful convective cells (cumulonimbus clouds), which can accumulate enormous quantities of moisture.
(iii) Moisture Entrapment: In narrow mountain valleys, prevailing winds may be blocked, preventing moisture-laden air from moving forward and forcing it to precipitate all at once.
(iv) Condensation Nuclei: Dust, pollutants, or aerosols provide nuclei around which water droplets rapidly form.

Unlike conventional rainfall, cloudbursts release enormous quantities of water (that would normally be distributed over hours or days) in a very short time, overwhelming the drainage capacity of valleys and slopes.

Impacts and Examples:
India is highly vulnerable to cloudbursts, particularly in the Himalayan region. Notable events include the Kedarnath cloudburst (June 2013) - which killed over 5,000 people and swept away entire settlements; the Leh cloudburst (August 2010); and cloudbursts in Chamoli and Uttarakhand's river valleys. The confined topography of Himalayan valleys transforms cloudburst runoff into flash floods and debris flows with catastrophic speed.

Urban cloudbursts are increasing as city heat islands intensify convective activity - Mumbai's record rain events and Delhi's flash floods are increasingly linked to localised extreme precipitation.

Climate Change Link:
A warmer atmosphere holds more moisture (Clausius-Clapeyron relationship: ~7% more moisture per 1°C warming), making extreme precipitation events like cloudbursts more frequent and intense - a documented trend in IPCC AR6.`,
    sources: [
      { name: "IMD - Extreme Weather Events", chapter: "Cloudburst Definition" },
      { name: "NCERT Physical Geography - Class XI", chapter: "Precipitation Types" },
    ],
  },

  {
    _id: "mains_gs1_2024_16",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Urbanisation",
    subTopic: "Rural-Urban Migration",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "Why do large cities tend to attract more migrants than smaller towns? Discuss in the light of conditions in developing countries.",
    keyPoints: [
      "Agglomeration economies: dense markets, specialised labour, knowledge spillovers",
      "Harris-Todaro model: expected urban wage > rural wage drives migration",
      "Infrastructure concentration: airports, hospitals, universities in large cities",
      "Network effects: migrant communities lower search costs for new migrants",
      "Informal sector absorbs excess labour: street vending, domestic work, construction",
      "Primate city phenomenon in developing countries: over-concentration in one city",
      "Negative externalities: congestion, slums, pollution - urbanisation challenges",
    ],
    idealAnswer: `Large cities attract disproportionately more migrants than smaller towns for structural economic and social reasons that are amplified in developing countries.

Agglomeration Economies: Large cities generate productivity gains from the concentration of firms, workers, and consumers - thick labour markets, specialised suppliers, knowledge spillovers, and access to large consumer bases. These gains attract investment and high-paying jobs unavailable in smaller towns.

Harris-Todaro Model: In developing countries, the expected urban income (even accounting for unemployment probability) exceeds rural income for most migrants. Large cities offer the highest expected wages - even for unskilled workers who may initially accept informal sector employment (construction, domestic work, street vending).

Infrastructure and Services Concentration: Developing countries tend to concentrate quality hospitals, universities, airports, and government offices in a few large cities - creating "primate cities" (Mumbai, Delhi, Lagos, Nairobi) that are disproportionately large relative to the next-tier cities. This concentration itself attracts further migration.

Network Effects: Established migrant communities in large cities reduce the risk and cost of migration for new arrivals - providing housing leads, job referrals, and social support. These migrant networks create self-reinforcing migration corridors to specific large cities.

Absorptive Informal Sector: Unlike smaller towns with limited employment diversity, large cities' informal sectors - construction, domestic service, street trade, recycling - can absorb large influxes of unskilled rural migrants, even without commensurate formal job creation.

Consequence - Urban Primacy and Slums: In developing countries, this results in urban primacy (excessive concentration in one or two cities) and massive informal settlements. Over 40% of Mumbai's population lives in slums - a symptom of migration exceeding formal housing and service provision capacity.

Conclusion: Large cities attract migrants because they offer the highest returns, the greatest economic diversity, the best infrastructure, and established social networks. Managing this migration through planned secondary city development is a central urbanisation challenge for developing countries.`,
    sources: [
      { name: "NCERT Sociology - Class XII", chapter: "Urbanisation" },
      { name: "Economic Survey", chapter: "Urbanisation and Migration" },
    ],
  },

  {
    _id: "mains_gs1_2024_17",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Physical Geography",
    topic: "Ocean & Climate",
    subTopic: "Sea Surface Temperature & Cyclones",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "What is sea surface temperature rise? How does it affect the formation of tropical cyclones?",
    keyPoints: [
      "SST: temperature of ocean's surface layer (top few metres)",
      "Global SST rising: 2023 saw record SST anomalies",
      "Tropical cyclone formation requires SST ≥ 26.5°C for sufficient evaporation and convection",
      "Higher SST → more evaporation → greater latent heat energy → more intense cyclones",
      "Rapid intensification events increasing: Bay of Bengal, Arabian Sea",
      "Poleward migration of cyclone genesis zones",
      "IPCC: climate change increasing proportion of Category 4-5 cyclones",
    ],
    idealAnswer: `Sea Surface Temperature (SST) refers to the temperature of the ocean water at or very near its surface (the top few metres). Global average SST has been rising due to climate change - the oceans absorb over 90% of excess heat trapped by greenhouse gases. The year 2023 saw unprecedented SST anomalies globally, with the North Atlantic and Bay of Bengal recording record temperatures.

How SST Rise Affects Tropical Cyclone Formation:

Tropical cyclones (known as hurricanes in the Atlantic, typhoons in the Pacific, and cyclones in the Indian Ocean) are heat engines powered by the ocean. The relationship between SST and cyclone formation is direct and significant:

1. Energy Source: Tropical cyclones require SST of at least 26.5°C to generate sufficient evaporation and latent heat to power and sustain the storm. As SST rises, this threshold is met over larger ocean areas and for longer periods each year, expanding the cyclone-prone season and geographic range.

2. Intensification: Higher SST means more evaporation - greater amounts of water vapour enter the atmosphere, releasing enormous latent heat when condensed. This latent heat drives stronger updrafts, lower central pressure, and higher wind speeds. Rapid intensification (a 35+ knot increase in maximum sustained winds within 24 hours) is becoming more frequent in the Bay of Bengal and Arabian Sea.

3. Cyclone Track Changes: Warming SSTs are enabling cyclone tracks to extend farther poleward, and the Arabian Sea - historically less cyclone-active than the Bay of Bengal - is seeing increased cyclonic activity.

4. Rainfall Enhancement: Higher SST increases moisture content of cyclones, amplifying rainfall totals and flood risks even from relatively weaker storms.

IPCC Assessment: While the total number of tropical cyclones may not increase significantly, climate change is increasing the proportion of very intense (Category 4-5) cyclones - precisely the ones that cause the greatest human and economic damage.

India's Vulnerability: Both the Bay of Bengal and the Arabian Sea are warming rapidly, increasing the threat to India's eastern and western coastlines. Cyclone Amphan (2020), Biparjoy (2023), and Michaung (2023) all exhibited rapid intensification linked to elevated SSTs.`,
    sources: [
      { name: "IPCC AR6 Working Group I", chapter: "Ocean Warming and Cyclones" },
      { name: "IMD Cyclone Warning Division", chapter: "Bay of Bengal Cyclones" },
    ],
  },

  // ─── MODERN HISTORY ──────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_18",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Modern History",
    topic: "Independence Movement",
    subTopic: "Quit India Movement",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "What were the events that led to the Quit India Movement? Point out its results",
    keyPoints: [
      "Context: WWII, Cripps Mission failure (March 1942), Fall of Singapore, Japanese threat",
      "Gandhi's 'Do or Die' call; 'Quit India' resolution - Bombay, August 8, 1942",
      "Mass arrests: Gandhi, Nehru, all Congress leaders on August 9",
      "Spontaneous uprising: parallel governments in Satara, Ballia, Midnapore",
      "British repression: 100,000+ arrests, 1,000 killed",
      "Results: failed in immediate objective; demonstrated mass participation; weakened colonial will; post-war independence inevitable",
    ],
    idealAnswer: `Events Leading to the Quit India Movement:

1. World War II Context: By 1942, Britain was facing severe military setbacks - Singapore fell to Japan in February 1942 (the largest British surrender in history), and Japanese forces were advancing through Southeast Asia toward India.

2. Cripps Mission Failure (March 1942): Winston Churchill sent Sir Stafford Cripps with proposals offering dominion status after the war. The Congress rejected these as offering too little too late - Gandhi described the offer as a "post-dated cheque on a failing bank." The failure of negotiations convinced nationalists that Britain would not voluntarily transfer power.

3. Threat of Japanese Invasion: The Japanese advance created both danger and opportunity. Some nationalists feared Japanese invasion; others (like Subhas Chandra Bose, operating outside India) saw it as leverage.

4. Congress Decision: At the Bombay session (August 8, 1942), the All India Congress Committee passed the Quit India Resolution, demanding immediate British withdrawal. Gandhi called for "Do or Die" - non-violent resistance until independence.

5. Mass Arrests (August 9, 1942): The British government, anticipating the movement, arrested Gandhi, Nehru, and virtually the entire Congress leadership within hours of the resolution. This transformed the planned organised movement into a spontaneous mass uprising.

The Quit India Movement (August 1942):
With Congress leadership in jail, local leaders and ordinary people organised strikes, hartals, and attacks on communication infrastructure (railways, telegraph lines). Parallel "national governments" emerged in Satara (Maharashtra), Ballia (UP), and Tamralipta (Bengal).

Results:
The movement failed in its immediate objective - it was suppressed within a few months with over 100,000 arrests and approximately 1,000 deaths. However, its long-term significance was profound: it demonstrated the mass character of the independence movement; it showed British administrators that holding India against the will of its population was ultimately untenable; and it accelerated post-war British willingness to negotiate independence, which came in 1947.`,
    sources: [
      { name: "Bipin Chandra - India's Struggle for Independence", chapter: "Quit India Movement" },
      { name: "NCERT History - Class XII", chapter: "The Last Phase of the National Movement" },
    ],
  },

  // ─── ART & CULTURE ───────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2024_19",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Art & Culture",
    topic: "South Indian History",
    subTopic: "Pallava Art & Literature",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "Estimate the contribution of the Pallavas of Kanchi for the development of art and literature of South India.",
    keyPoints: [
      "Pallavas (4th–9th century CE): Kanchipuram as capital",
      "Rock-cut architecture: Mahabalipuram Rathas (Seven Pagodas), Arjuna's Penance",
      "Structural temples: Shore Temple (Mahabalipuram), Kailasanatha Temple (Kanchipuram)",
      "Sculpture: Descent of the Ganga (world's largest bas-relief)",
      "Tamil literature: Bhakti movement poetry - Alvars and Nayanmars",
      "Grantha script and Sanskrit-Tamil literary synthesis",
      "Foundation for Chola and Vijayanagara art",
    ],
    idealAnswer: `The Pallavas of Kanchipuram (c. 4th–9th century CE) laid the foundations of South Indian art, architecture, and literature that later dynasties - the Cholas, Vijayanagara, and Nayakas - built upon and perfected.

Architectural Contributions:

1. Rock-Cut Architecture at Mahabalipuram: The Pallava rock-cut monuments at Mahabalipuram (Mamallapuram) represent a transitional phase from cave temples to structural temples. The Pancha Rathas (Five Chariots) - monolithic temples carved from single outcroppings of granite in different architectural styles (Dravidian, Nagara) - are among India's most remarkable sculptural achievements and are UNESCO World Heritage Sites.

2. Arjuna's Penance (Descent of the Ganga): The enormous bas-relief at Mahabalipuram - measuring 29 × 13 metres and carved with extraordinary naturalistic detail showing animals, celestial beings, and humans - is one of the world's largest open-air rock reliefs. It depicts either the descent of the Ganga or Arjuna's austerities.

3. Structural Temples: The Kailasanatha Temple at Kanchipuram (early 8th century, Rajasimha Pallava) is the first major structural stone temple in South India, establishing the architectural grammar (gopuram, vimana, mandapa) that the Cholas later perfected. The Shore Temple at Mahabalipuram is a direct precursor to the Great Chola Temples.

Literary Contributions:

1. Bhakti Movement: The Pallava period witnessed the flourishing of the Tamil Bhakti movement - the Alvars (Vaishnavite poet-saints) and Nayanmars (Shaivite poet-saints) composed devotional hymns that became the bedrock of Tamil religious literature. This corpus (Nalayira Divya Prabandham, Tevaram) remains spiritually and literarily central to Tamil culture.

2. Sanskrit-Tamil Synthesis: Pallava courts patronised both Sanskrit and Tamil scholarship, producing a literary bilingualism that enriched both traditions. The Grantha script - a hybrid of Sanskrit and Tamil - was developed under Pallava patronage.

Conclusion: The Pallavas transformed South Indian cultural expression from a predominantly Buddhist and Jain idiom to a Hindu (Shaivite/Vaishnavite) one, establishing architectural forms and literary traditions that defined South Indian civilisation for centuries thereafter.`,
    sources: [
      { name: "NCERT History - Class XI", chapter: "South Indian Kingdoms" },
      { name: "UNESCO World Heritage - Mahabalipuram", chapter: "Outstanding Universal Value" },
    ],
  },

  {
    _id: "mains_gs1_2024_20",
    year: 2024,
    paper: "GS Paper 1",
    subject: "Art & Culture",
    topic: "Ancient History",
    subTopic: "Vedic Society & Economy",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "Underline the changes in the field of society and economy from the rig vedic to the later vedic period.",
    keyPoints: [
      "Rig Vedic (c. 1500–1000 BCE): pastoral, semi-nomadic, cattle-based economy",
      "Later Vedic (c. 1000–600 BCE): settled agriculture, iron tools, eastward expansion",
      "Society: Rig Vedic - flexible varna (occupation-based); Later Vedic - rigid caste, birth-based",
      "Ashrama system codified; women's status declined (from Rigvedic 'brahmavadinis' to subordination)",
      "Economy: Rig Vedic - cattle, barter; Later Vedic - agriculture, trade guilds, coinage beginning",
      "Polity: from tribal chieftaincy (Rajan) to territorial kingship, Rajasuya/Ashvamedha rituals",
    ],
    idealAnswer: `The Rig Vedic period (c. 1500–1000 BCE) and the Later Vedic period (c. 1000–600 BCE) represent distinct phases of Aryan civilisation in the Indian subcontinent, with significant transformations in both social organisation and economic life.

Societal Changes:

Rig Vedic Society: The Rig Veda portrays a relatively fluid, pastoral society. The four varnas (Brahmin, Kshatriya, Vaishya, Shudra) were acknowledged but occupation-based rather than strictly birth-determined. Women participated in intellectual and religious discourse - brahmavadinis like Gargi and Maitreyi engaged in philosophical debate, and women composed hymns (the Rig Veda contains hymns attributed to women). The joint family system was prevalent.

Later Vedic Society: The varna system rigidified into an inflexible, birth-based hierarchical order - the caste system as later known began to crystallise. Brahmin priests gained significantly enhanced ritual authority; elaborate sacrificial ceremonies (yagnas) became complex, expensive affairs that reinforced Brahmin power. The status of women declined substantially - they were increasingly excluded from education, the Upanayana ceremony, and religious rites. The ashrama system (Brahmacharya, Grihastha, Vanaprastha, Sannyasa) was codified, systematising the stages of life.

Economic Changes:

Rig Vedic Economy: Predominantly pastoral and semi-nomadic. Cattle were the primary measure of wealth and the main form of barter. Agriculture existed but was secondary; there was no iron technology. Trade was limited and barter-based.

Later Vedic Economy: The discovery and use of iron tools (following the spread of iron technology c. 1000 BCE) enabled large-scale forest clearing and settled agriculture in the Gangetic plains. Rice cultivation expanded significantly. Specialised crafts - carpentry, smithy, leather work - developed alongside a more settled lifestyle. Trade guilds (shrenis) began forming; the use of nishka (gold pieces) suggests early monetisation.

Political Changes:
Rig Vedic polity centred on the tribal chieftain (Rajan), elected or acclaimed by the tribe. Later Vedic polity evolved toward hereditary, territorial kingship - the jana (tribe) became the rashtra (state). Elaborate royal consecration rituals (Rajasuya, Ashvamedha) reflected and reinforced royal power.`,
    sources: [
      { name: "R.S. Sharma - Ancient India", chapter: "Vedic Civilisation" },
      { name: "NCERT History - Class XI", chapter: "Early States and Economies" },
    ],
  },
];

export default mainsGS1Data;