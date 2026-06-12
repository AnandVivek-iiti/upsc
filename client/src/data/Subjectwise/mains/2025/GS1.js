/**
 * mainsGS1Data.js
 * UPSC Mains GS Paper 1 — 2025
 *
 * Schema (descriptive / Mains variant):
 * {
 *   _id          : string   — unique identifier
 *   year         : number
 *   paper        : string   — "GS Paper 1"
 *   subject      : string   — broad subject tag
 *   topic        : string   — more specific topic for filter chips
 *   subTopic     : string   — shown as small badge on card
 *   marks        : number   — 10 or 15
 *   questionText : string   — full question as printed
 *   directive    : string   — "Discuss" | "Comment" | "Examine" | "Explain" | etc.
 *   wordLimit    : number   — suggested word limit (marks × 10 as UPSC norm)
 *   idealAnswer  : string   — structured model answer (shown only after user reveals)
 *   keyPoints    : string[] — bullet checklist of must-cover points
 *   sources      : { name, chapter }[]
 * }
 */

const mainsGS1Data = [
  // ─── INDIAN SOCIETY ───────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_01",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Tribal Issues",
    subTopic: "Displacement & Rehabilitation",
    marks: 15,
    directive: "Opinion",
    wordLimit: 150,
    questionText:
      "Does tribal development in India centre around two axes, those of displacement and of rehabilitation? Give your opinion.",
    keyPoints: [
      "Historical context of tribal displacement — dams, mines, wildlife reserves",
      "Data: 50%+ of displaced are tribals (Fernandes estimate)",
      "Rehabilitation policy failures — LARR Act 2013, Fifth/Sixth Schedule gaps",
      "Alternative model: in-situ development, PESA, Forest Rights Act",
      "Balanced opinion: displacement is one axis but not the only lens",
    ],
    idealAnswer: `Introduction: Tribal development in India has long been entangled with displacement and rehabilitation, but reducing it to just these two axes risks an incomplete picture.

The Displacement–Rehabilitation Axis:
Tribal communities constitute nearly 8.6% of India's population but account for an estimated 40–50% of all development-induced displacement (W. Fernandes). Projects like large dams (Sardar Sarovar, Hirakud), mining, and the creation of Protected Areas have repeatedly uprooted tribal households. The inadequacy of rehabilitation — delays in land allotment, poor resettlement packages, and loss of community identity — has made rehabilitation the reactive companion to displacement, forming a painful cycle.

Key legislative responses include the Land Acquisition, Rehabilitation and Resettlement Act (LARR) 2013 and the Forest Rights Act 2006, yet implementation gaps persist.

Beyond the Two Axes:
However, tribal development cannot be reduced to these two vectors alone. The Fifth and Sixth Schedules of the Constitution, PESA 1996, and various tribal sub-plans represent a broader vision: self-governance, cultural preservation, education (Eklavya Model Residential Schools), and livelihoods rooted in forest resources.

Dimensions such as health (sickle-cell anaemia, malnutrition), literacy, gender, and digital access increasingly define the tribal development discourse.

Opinion:
While displacement and rehabilitation remain the most acute and visible crises, they are symptoms of a deeper structural issue — the absence of tribal agency in development planning. Meaningful tribal development must shift from a compensatory model (rehabilitate after displacing) to a preventive, participatory one where tribal consent (Free, Prior, Informed Consent) is non-negotiable.

Conclusion: The two axes are real and urgent, but tribal development must be reimagined as a multi-dimensional process centred on rights, identity, and self-determination — not just remediation after harm.`,
    sources: [
      { name: "NCERT — Indian Society", chapter: "Tribal Communities" },
      { name: "Laxmikanth — Indian Polity", chapter: "Fifth & Sixth Schedules" },
      { name: "Ministry of Tribal Affairs Reports", chapter: "Annual Reports" },
    ],
  },

  {
    _id: "mains_gs1_2025_02",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Environment & Development",
    subTopic: "Sustainable Growth vs Poverty",
    marks: 15,
    directive: "Comment",
    wordLimit: 150,
    questionText:
      "Achieving sustainable growth with emphasis on environmental protection could come into conflict with poor people's needs in a country like India – Comment.",
    keyPoints: [
      "Definition of sustainable development — Brundtland Commission",
      "Conflict: forest-dependent livelihoods vs conservation; energy access vs clean energy costs",
      "Examples: coal dependence, coastal regulation zones, NTFP restrictions",
      "Reconciliation: green jobs, Just Transition framework, PM-KUSUM, MGNREGS + environment",
      "SDG 1 (No Poverty) and SDG 13 (Climate Action) are complementary, not opposed",
    ],
    idealAnswer: `Introduction: The Brundtland Commission defined sustainable development as meeting present needs without compromising future generations. In India, this principle intersects with acute poverty, creating apparent but not irreconcilable tensions.

Where Conflict Arises:
1. Energy Access vs Clean Energy: Over 700 million Indians depend on traditional biomass for cooking. Shifting to LPG/solar (PM Ujjwala) has costs that the poorest cannot always bear. Coal remains the backbone of India's power sector, and a hasty transition could raise electricity prices, hitting the poor hardest.

2. Forest Conservation vs Tribal Livelihoods: Protected Area expansion and eco-sensitive zone regulations restrict Non-Timber Forest Produce (NTFP) collection, which is the primary livelihood for millions of Adivasis.

3. Coastal Regulation Zones: CRZ norms restrict fishing activities of coastal communities.

Why the Conflict is Not Inevitable:
- Green jobs: India's solar and wind sectors now employ millions; skill linkage with MGNREGS can target the rural poor.
- Co-benefits: reducing indoor air pollution (through clean cooking fuels) directly improves health outcomes of the poor.
- Forest Rights Act + REDD+: linking forest conservation to community rights aligns incentives.
- Just Transition: the UNFCCC framework explicitly requires protecting vulnerable workers and communities.

Comment:
The conflict is real in the short run but is largely a result of policy design failures — not an inherent contradiction. When environmental protection is designed with the poor as co-stakeholders (not obstacles), it becomes a vehicle for poverty alleviation. India's NDC targets and its 2070 net-zero goal must embed social equity as a prerequisite, not an afterthought.

Conclusion: Sustainable growth and poverty alleviation are complementary in the long run; the challenge lies in equitable transition mechanisms that do not impose the costs of sustainability on those least able to bear them.`,
    sources: [
      { name: "NCERT — Environment", chapter: "Sustainable Development" },
      { name: "Economic Survey", chapter: "Climate and Development" },
      { name: "MoEFCC Reports", chapter: "Green India Mission" },
    ],
  },

  {
    _id: "mains_gs1_2025_03",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Social Change",
    subTopic: "Fast Food Industry & Health",
    marks: 15,
    directive: "Account for / Illustrate",
    wordLimit: 150,
    questionText:
      "How do you account for the growing fast food industries given that there are increased health concerns in modern society? Illustrate your answer with the Indian experience.",
    keyPoints: [
      "Urbanisation, nuclear families, dual-income households → time scarcity",
      "Rising disposable incomes + aspirational consumption",
      "Aggressive marketing targeting youth",
      "Globalisation and cultural westernisation",
      "Indian health paradox: rising obesity + undernutrition simultaneously",
      "FSSAI regulations, Eat Right India, traffic-light labelling debate",
    ],
    idealAnswer: `Introduction: Despite rising awareness of health hazards, the fast food industry has grown at ~12% CAGR in India, reflecting deeper socio-economic and cultural forces that outpace health concerns.

Drivers of Fast Food Growth:

1. Urbanisation and Time Poverty: Over 500 million Indians now live in cities. Nuclear families with both partners working leave little time for home cooking. Fast food offers convenience at affordable price points.

2. Rising Disposable Incomes & Aspirational Consumption: India's growing middle class (estimated 350 million by 2030) associates branded fast food with modernity, status, and globalised identity.

3. Youth Demographics: With 65% of India's population under 35, marketers target a demographic that prioritises taste, peer influence, and social media food culture over nutritional considerations.

4. Aggressive Marketing and Digital Reach: Platforms like Zomato and Swiggy have democratised food delivery; algorithms push high-margin, calorie-dense items.

5. Adaptation of Local Tastes: McAlooTikki, paneer burgers, and masala pizzas demonstrate localisation strategies that make global fast food culturally acceptable.

The Indian Health Paradox:
India simultaneously faces the double burden of malnutrition — undernutrition in rural/tribal populations and obesity + lifestyle diseases (Type 2 diabetes, hypertension) in urban areas. ICMR data shows that processed food consumption correlates with rising urban diabetes rates.

Regulatory Response:
- FSSAI's Eat Right India campaign promotes balanced diets.
- Front-of-Pack labelling (FOPL) regulations are under debate.
- Restricting junk food advertisements targeting children (school proximity rules).

Conclusion: The growth of fast food is structurally driven by urbanisation, aspirational consumption, and time poverty — forces stronger than health awareness alone. Effective regulation must pair consumer education with structural incentives: subsidised healthy options, transparent labelling, and restrictions on predatory marketing to children.`,
    sources: [
      { name: "NCERT — Indian Society", chapter: "Social Change in India" },
      { name: "FSSAI Annual Report", chapter: "Eat Right India" },
      { name: "ICMR Dietary Guidelines", chapter: "Nutrition Transition" },
    ],
  },

  // ─── INDIAN GEOGRAPHY ────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_04",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Geography",
    topic: "Population Geography",
    subTopic: "Ganga Basin — Population & Resources",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Discuss the distribution and density of population in the Ganga River Basin with special reference to land, soil and water resources.",
    keyPoints: [
      "Basin spans 8 states, ~26% of India's area, ~43% of population",
      "Density gradient: IGP >500 persons/km², upper vs lower Ganga plains",
      "Alluvial soil (Bhangar/Khadar) — agricultural carrying capacity",
      "Water resources: perennial rivers, groundwater table, canal irrigation",
      "Urbanisation corridor: Kanpur, Allahabad, Varanasi, Patna, Kolkata",
      "Challenges: arsenic contamination, groundwater depletion, flooding",
    ],
    idealAnswer: `Introduction: The Ganga River Basin, stretching across ~8.6 lakh km² and supporting ~500 million people (~43% of India's population), is the world's most densely populated river basin. Its population distribution is intimately linked to its land, soil, and water endowments.

Distribution and Density:

The basin can be divided into three zones:
1. Upper Ganga Plains (Uttarakhand, UP-west): Density ~300–600 persons/km². Rich khadar (new alluvium) soils and easy irrigation access support intensive cultivation (wheat-rice rotation).

2. Middle Ganga Plains (UP-east, Bihar): Density >700 persons/km² in parts. Bihar has some of India's highest district-level densities (Sheohar: ~1,880 persons/km²). Fertile Indo-Gangetic alluvium and multiple tributaries (Gomti, Ghaghra, Gandak, Kosi) support dense agrarian settlement.

3. Lower Ganga Plains / Delta (West Bengal): The Hugli deltaic plain supports mega-city Kolkata and one of the most densely populated agricultural landscapes globally.

Role of Land and Soil:
The Indo-Gangetic alluvium is among the world's most fertile soils. Khadar (newer, lower floodplain) deposits are especially productive. Bhangar (older, higher terrace) soils are less fertile but widely cultivated. This agricultural richness historically attracted dense settlement and remains the backbone of the basin's food economy.

Role of Water Resources:
The basin receives perennial flow from Himalayan glaciers and monsoon rainfall. Extensive canal networks (Upper Ganga Canal, Sarda Canal) and tube-well irrigation have enabled year-round agriculture, directly sustaining population density. However, groundwater depletion (CPCB data shows falling water tables in Punjab, Haryana, and UP) and arsenic contamination in Bihar and Bengal now threaten long-term sustainability.

Challenges:
- Flooding (Kosi, Brahmaputra tributaries) periodically displaces millions.
- Over-extraction of groundwater endangers future agricultural viability.
- Pollution of the Ganga (industrial + domestic effluents) poses water security risks.

Conclusion: Population density in the Ganga Basin is a direct function of its resource richness — fertile alluvial soils, perennial water supply, and flat terrain enabling large-scale agriculture. Sustaining this density requires urgent attention to groundwater governance, flood management, and soil health.`,
    sources: [
      { name: "NCERT Geography — Class XI", chapter: "Drainage Systems of India" },
      { name: "NCERT Geography — Class XII", chapter: "Population: Distribution and Density" },
      { name: "National Mission for Clean Ganga", chapter: "Basin Profile" },
    ],
  },

  // ─── PHYSICAL GEOGRAPHY ─────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_05",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Physical Geography",
    topic: "Plate Tectonics",
    subTopic: "Continental & Ocean Basin Changes",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Discuss how the changes in shape and sizes of continents and ocean basins take place due to tectonic movements of the crustal masses.",
    keyPoints: [
      "Theory of Plate Tectonics — lithospheric plates, asthenosphere",
      "Types of plate boundaries: convergent, divergent, transform",
      "Sea-floor spreading (mid-ocean ridges) → ocean basins widening",
      "Subduction zones → ocean basins shrinking, trench formation",
      "Continental collision → mountain building (Himalayas)",
      "Wilson Cycle — opening and closing of ocean basins over geological time",
      "Pangaea breakup as a case study",
    ],
    idealAnswer: `Introduction: The theory of plate tectonics, developed from Wegener's Continental Drift hypothesis and confirmed by sea-floor spreading evidence, explains how continents and ocean basins continuously change shape and size over geological timescales.

Mechanism of Change:

1. Divergent Boundaries — Ocean Basins Grow:
At mid-ocean ridges (e.g., Mid-Atlantic Ridge), magma wells up from the asthenosphere, creating new oceanic crust through sea-floor spreading. This pushes the existing plates apart, widening the ocean basin. The Atlantic Ocean has been widening at ~2.5 cm/year since the breakup of Pangaea (~200 Ma). Similarly, the East African Rift Valley represents a nascent divergent boundary where Africa is beginning to split, potentially forming a new ocean basin over millions of years.

2. Convergent Boundaries — Ocean Basins Shrink:
When oceanic crust meets continental crust, the denser oceanic plate subducts (sinks) beneath the lighter continental crust, forming deep trenches (Mariana Trench, ~11 km depth). This reduces the size of ocean basins. The Pacific Ocean is currently shrinking due to subduction along the Pacific Ring of Fire.

3. Continental Collision — Continents Merge, Mountains Rise:
When two continental plates collide (neither dense enough to subduct), they crumple and thicken, forming fold mountain ranges. The collision of the Indian Plate with the Eurasian Plate (~50 Ma ago) formed the Himalayas and closed the ancient Tethys Sea — an entire ocean basin that no longer exists.

4. Transform Boundaries:
Lateral movement (e.g., San Andreas Fault) changes the shape of coastlines and ocean basins without creating or destroying crust significantly.

The Wilson Cycle:
Named after J. Tuzo Wilson, this concept describes the full lifecycle of an ocean basin: rifting (divergence) → ocean widening → subduction → basin closure → continental collision → orogenesis. The Appalachians and Caledonides record ancient Wilson Cycles.

Case Study — Pangaea Breakup:
~200 Ma, all landmasses formed the supercontinent Pangaea. Rifting created the Atlantic, Indian, and Southern Oceans. The Tethys Ocean closed as India drifted north. This single event remapped the entire planet's geography.

Conclusion: Tectonic movements are the engine of continental and oceanic change — operating on timescales of millions of years through sea-floor spreading, subduction, and collision. Understanding these processes is essential for predicting seismic hazards and interpreting Earth's geological history.`,
    sources: [
      { name: "NCERT Geography — Class XI", chapter: "Interior of the Earth & Distribution of Continents" },
      { name: "Savindra Singh — Physical Geography", chapter: "Plate Tectonics" },
    ],
  },

  // ─── WORLD GEOGRAPHY ────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_06",
    year: 2025,
    paper: "GS Paper 1",
    subject: "World Geography",
    topic: "Technology in Planning",
    subTopic: "AI, Drones, GIS & RS in Planning",
    marks: 15,
    directive: "How",
    wordLimit: 150,
    questionText:
      "How can Artificial Intelligence (AI) and drones be effectively used along with GIS and RS techniques in locational and areal planning?",
    keyPoints: [
      "GIS: spatial data layering for land-use, infrastructure, demographics",
      "RS: satellite imagery for land cover, urban sprawl, crop mapping",
      "AI/ML: pattern recognition, predictive modelling, automated classification",
      "Drones: high-resolution real-time data, 3D mapping, inaccessible terrain",
      "Applications: smart city planning, disaster management, agricultural zoning",
      "India examples: SVAMITVA, ISRO's Bhuvan, National Urban Digital Mission",
    ],
    idealAnswer: `Introduction: Locational and areal planning — deciding where to place infrastructure, how to zone land, and how to manage spatial resources — has been transformed by the convergence of AI, drones, GIS, and Remote Sensing (RS) technologies.

Integration of Technologies:

1. GIS as the Planning Foundation:
Geographic Information Systems integrate spatial data layers — topography, land use, population density, infrastructure networks, and administrative boundaries. Planners use GIS to identify optimal sites for schools, hospitals, industrial zones, or transport corridors by overlaying multiple data layers (multi-criteria analysis).

2. Remote Sensing for Real-Time Land Intelligence:
Satellite imagery (ISRO's Resourcesat, ESA Sentinel) provides synoptic views of land cover, vegetation health (NDVI), urban sprawl, water bodies, and flood extent. In India, ISRO's Bhuvan platform provides RS data for district-level planning and disaster response.

3. AI/ML — From Data to Decisions:
AI enhances GIS and RS by:
- Automated image classification (identifying illegal constructions, encroachments)
- Predictive modelling (forecasting urban growth patterns, traffic congestion)
- Natural language-based query interfaces for non-technical planners
- Object detection in drone imagery (counting trees, mapping rooftops for solar potential)

4. Drones — High-Resolution Ground Truth:
Drones fill the resolution gap between satellite imagery and ground surveys. Applications include:
- SVAMITVA Scheme: drones map inhabited rural land, enabling property rights documentation for ~6.6 lakh villages
- 3D terrain modelling for road and dam alignment
- Disaster response: real-time flood mapping, search and rescue
- Precision agriculture zoning: soil variability mapping

Integrated Planning Example — Smart Cities:
Chennai and Pune have used AI + GIS integration to model flood risk zones, identify informal settlements, and plan drainage infrastructure. The National Urban Digital Mission (NUDM) aims to create digital twins of 100 cities using these technologies.

Challenges:
- Data sovereignty and privacy (drone imagery of populated areas)
- Digital divide: rural planners lack capacity to use advanced tools
- Standardisation of data formats across agencies

Conclusion: AI, drones, GIS, and RS form a complementary technology stack for evidence-based, precise, and dynamic spatial planning. India's initiatives like SVAMITVA and Smart Cities Mission demonstrate the transformative potential, but capacity building and data governance frameworks are essential prerequisites.`,
    sources: [
      { name: "ISRO — Bhuvan Platform Documentation", chapter: "Applications" },
      { name: "Ministry of Panchayati Raj — SVAMITVA", chapter: "Scheme Guidelines" },
      { name: "NCERT Geography", chapter: "Remote Sensing and GIS" },
    ],
  },

  {
    _id: "mains_gs1_2025_07",
    year: 2025,
    paper: "GS Paper 1",
    subject: "World Geography",
    topic: "Economic Geography",
    subTopic: "Offshore vs Onshore Oil Reserves",
    marks: 15,
    directive: "Give / How",
    wordLimit: 150,
    questionText:
      "Give a geographical explanation of the distribution of off-shore oil reserves of the world. How are they different from the on-shore occurrences of oil reserves?",
    keyPoints: [
      "Offshore major regions: Persian Gulf offshore, Gulf of Mexico, North Sea, Caspian Sea, West Africa (Niger Delta offshore), Brazil pre-salt",
      "Geological basis: continental shelf sedimentary basins, ancient marine deposits",
      "Offshore vs Onshore: depth, extraction cost, environmental risk, infrastructure",
      "Technology: deepwater drilling platforms, FPSOs, subsea pipelines",
      "India: KG Basin, Mumbai High",
    ],
    idealAnswer: `Introduction: Offshore oil reserves — those beneath the seabed — account for approximately 30% of global oil production and are distributed along specific geological formations, primarily on continental shelves.

Geographical Distribution of Offshore Reserves:

1. The Persian Gulf / Arabian Sea Shelf: The world's largest concentration of offshore reserves lies in the Persian Gulf — Saudi Arabia's Safaniya (world's largest offshore field), Kuwait, UAE, and Iran's offshore zones. The geology involves thick Mesozoic carbonate sedimentary sequences.

2. Gulf of Mexico: A mature offshore province spanning US and Mexican waters. US deepwater fields (Deepwater Horizon basin) are particularly significant. Advanced deepwater technology has unlocked ultra-deep reserves (>1,500 m).

3. North Sea: Between the UK and Norway, the North Sea is a major offshore province with fields like Brent, Ekofisk, and Johan Sverdrup. Production has matured but Enhanced Oil Recovery (EOR) continues.

4. West Africa — Niger Delta Offshore: Nigeria and Angola's offshore zones contain significant reserves. Pre-salt deepwater fields off Angola rival Brazil's reserves in geological similarity.

5. Brazil — Pre-Salt Deepwater: Tupi (now Lula) and Santos Basin pre-salt fields represent among the largest discoveries of the 21st century, lying under thick salt layers at >5,000 m depth beneath the ocean floor.

6. Caspian Sea: Legally classified as a sea (enabling offshore extraction), the Caspian holds major fields — Kashagan (Kazakhstan), Azeri-Chirag-Gunashli (Azerbaijan).

7. India: Mumbai High (Arabian Sea, ~1,400 km² of productive area) and the Krishna-Godavari (KG) Basin are India's primary offshore producing zones.

Geological Basis of Distribution:
Offshore reserves form in ancient sedimentary basins on continental shelves where marine organic matter was deposited, buried, and transformed into hydrocarbons under heat and pressure. The breakup of Gondwana/Pangaea created passive continental margins — the most oil-rich offshore environments.

Offshore vs Onshore Differences:

| Parameter | Offshore | Onshore |
|---|---|---|
| Extraction cost | Higher ($40–80/barrel) | Lower ($10–40/barrel) |
| Environmental risk | Oil spills, marine ecology impact | Land contamination, groundwater risk |
| Infrastructure | FPSOs, subsea pipelines, platforms | Pipelines, trucking |
| Discovery technology | 3D seismic, ROVs | Conventional seismic |
| Reserves depth | 100 m – 3,000+ m water depth | Surface to 6 km underground |
| Examples | Safaniya, Mumbai High | Ghawar (Saudi Arabia), Permian Basin |

Conclusion: Offshore oil distribution follows ancient continental margin geology, concentrated in the Persian Gulf, Atlantic margins, and deepwater frontier basins. While geologically similar to onshore reserves in origin, offshore extraction demands advanced technology, higher capital investment, and robust environmental safeguards.`,
    sources: [
      { name: "NCERT Geography — Class XII", chapter: "Mineral and Energy Resources" },
      { name: "BP Statistical Review of World Energy", chapter: "Oil Production" },
    ],
  },

  // ─── WORLD HISTORY ───────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_08",
    year: 2025,
    paper: "GS Paper 1",
    subject: "World History",
    topic: "Revolutions",
    subTopic: "French Revolution — Contemporary Relevance",
    marks: 15,
    directive: "Explain",
    wordLimit: 150,
    questionText:
      "The French Revolution has enduring relevance to the contemporary world. Explain.",
    keyPoints: [
      "Liberté, Égalité, Fraternité — foundational values of modern democracies",
      "Separation of Church and State — secularism",
      "Declaration of the Rights of Man — precursor to UDHR 1948",
      "Rise of nationalism — still reshaping borders today",
      "Social contract theory and popular sovereignty",
      "Contemporary relevance: Arab Spring, Black Lives Matter, populism debates",
    ],
    idealAnswer: `Introduction: The French Revolution (1789–1799) was not merely a European political event; it was an ideological earthquake whose tremors continue to shape political thought, governance structures, and social movements worldwide.

Core Ideas and Their Contemporary Relevance:

1. Liberty, Equality, Fraternity:
The Revolutionary trinity remains the standard against which democratic governments are measured. The right to free speech, equal treatment before the law, and solidarity across social divides are cornerstones of modern constitutionalism — including India's Constitution.

2. Declaration of the Rights of Man and Citizen (1789):
This document directly influenced the Universal Declaration of Human Rights (1948) and subsequent international human rights law. Concepts like natural rights, due process, and equality before the law trace directly to Revolutionary ideology.

3. Secularism and Separation of Church and State:
The Revolution's aggressive dechristianisation and the eventual Concordat led to the principle of laïcité — the separation of religion from public life. France's model of secularism continues to influence debates on religion in public life globally, from India's secularism debates to Turkey's transformation.

4. Nationalism as a Political Force:
The Revolution birthed the modern concept of the nation-state — that political authority derives from the "nation" (the people), not dynastic inheritance. This concept reshaped 19th-century European borders and continues to drive secessionist movements and national identity politics in the 21st century.

5. Social Contract and Popular Sovereignty:
Rousseau's ideas, operationalised by the Revolution, established that governments derive legitimacy from the consent of the governed — a foundational principle tested in every democratic transition since, from post-colonial Africa to the Arab Spring (2010–2011).

6. Radical Change and Its Dangers — The Reign of Terror:
The Terror (1793–94) remains a cautionary lesson: revolutionary idealism without institutional checks can produce authoritarian violence. This is referenced in analyses of the Bolshevik Revolution, Maoist China, and contemporary authoritarian populism.

7. Economic Liberalism:
The Revolution's abolition of feudal obligations, guilds, and internal tariffs laid intellectual groundwork for free-market capitalism. Debates about inequality — the Revolution's driving grievance (the Third Estate) — remain central to global political economy.

Conclusion: The French Revolution's relevance is not historical nostalgia but active contestation — its principles are simultaneously invoked by human rights activists, nationalists, and populists. The enduring struggle to reconcile liberty, equality, and social order makes the Revolution perpetually contemporary.`,
    sources: [
      { name: "NCERT History — Class IX", chapter: "The French Revolution" },
      { name: "Eric Hobsbawm — The Age of Revolution", chapter: "1-3" },
    ],
  },

  // ─── POST-INDEPENDENCE HISTORY ──────────────────────────────────────────

  {
    _id: "mains_gs1_2025_09",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Post Independence History",
    topic: "Nation Building",
    subTopic: "Early Independence — Consolidation",
    marks: 15,
    directive: "Trace",
    wordLimit: 150,
    questionText:
      "Trace India's consolidation process during early phase of independence in terms of polity, economy, education and international relations.",
    keyPoints: [
      "Polity: Integration of princely states (Sardar Patel), Constitution 1950, first general elections 1952",
      "Economy: Mixed economy model, Five-Year Plans, land reforms, industrial licensing",
      "Education: University Education Commission (Radhakrishnan), IITs, IIMs establishment",
      "International Relations: Non-Alignment, Panchsheel, role in UN, Korean War mediation",
      "Challenges: Partition aftermath, refugees, food scarcity",
    ],
    idealAnswer: `Introduction: India's early post-independence decades (1947–1964, broadly the Nehru era) were defined by the monumental task of converting a colonially fractured subcontinent into a unified, sovereign, democratic republic.

Political Consolidation:

1. Integration of Princely States: Sardar Vallabhbhai Patel, as Deputy PM and Home Minister, integrated 562 princely states through diplomacy, persuasion, and — in cases like Hyderabad (Operation Polo, 1948) — military action. This was arguably the most complex nation-building exercise of the 20th century.

2. Constitution-Making: The Constituent Assembly (1946–49), chaired by Dr. B.R. Ambedkar's Drafting Committee, produced the world's longest written Constitution, enacted on 26 January 1950 — establishing parliamentary democracy, fundamental rights, and federal structure.

3. First General Elections (1951–52): Universal adult franchise was implemented for the first time — 176 million voters — a democratic experiment unprecedented in scale. The Congress won decisively under Nehru.

Economic Consolidation:

1. Mixed Economy Model: Nehru's economic philosophy, influenced by Fabian socialism and Soviet planning, led to the adoption of a mixed economy — public sector dominance in heavy industries (Steel, Defence, Atomic Energy) alongside private enterprise.

2. Five-Year Plans: The Planning Commission (1950) launched Five-Year Plans. The First Plan (1951–56) prioritised agriculture and rehabilitation; the Second Plan (Mahalanobis model) emphasised heavy industry.

3. Land Reforms: Abolition of zamindari, tenancy reforms, and land ceilings were legislated — though implementation was uneven.

Education:

1. Radhakrishnan Commission (1948): Recommended restructuring university education; its recommendations formed the basis of modern Indian higher education.

2. IITs and Scientific Institutions: IIT Kharagpur (1951) was established first, followed by others. BARC (1954), CSIR, and ICAR networks built India's scientific infrastructure. Nehru called IITs "temples of modern India."

3. Universal Primary Education: The Constitution's Directive Principles (Article 45) mandated free and compulsory education for children — laying groundwork for subsequent Right to Education.

International Relations:

1. Non-Alignment Movement (NAM): India, under Nehru, refused alignment with either the US-led NATO bloc or the USSR-led Warsaw Pact, championing the right of newly independent nations to pursue independent foreign policies. NAM was formally launched at Bandung (1955).

2. Panchsheel (1954): The Five Principles of Peaceful Coexistence — articulated with China — became India's foreign policy doctrine: sovereignty, non-aggression, non-interference, equality, peaceful coexistence.

3. UN Engagement: India was among the most active early UN members — mediating in the Korean War (V.K. Krishna Menon's role), advocating decolonisation, and championing nuclear disarmament.

Conclusion: India's early consolidation was remarkable in its speed and scale — integrating a diverse, newly independent nation into a functioning democracy, planned economy, and respected international actor, all while managing the aftermath of the most traumatic partition in modern history. The foundations laid in this period — constitutional democracy, scientific institutions, and strategic autonomy — continue to define India's trajectory.`,
    sources: [
      { name: "Bipin Chandra — India Since Independence", chapter: "1–5" },
      { name: "NCERT History — Class XII", chapter: "Politics in India Since Independence" },
    ],
  },

  // ─── MODERN HISTORY ──────────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_10",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Modern History",
    topic: "Social Reform Movements",
    subTopic: "Jotirao Phule — Subaltern Classes",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Mahatma Jotirao Phule's writings and efforts of social reforms touched issues of almost all subaltern classes. Discuss.",
    keyPoints: [
      "Phule's background: Mali (gardener) caste, educated by missionaries",
      "Gulamgiri (1873): comparison of caste slavery to American slavery, dedicated to abolitionists",
      "Satyashodhak Samaj (1873): anti-Brahmin, rationalist, universal",
      "Women's education: Savitribai Phule co-founded India's first girls' school (1848)",
      "Peasant class: Shetkaryacha Asud (Cultivator's Whipcord) on agrarian exploitation",
      "Untouchables: advocacy for untouchable rights, public water access",
      "Legacy: influenced Ambedkar, precursor to anti-caste movement",
    ],
    idealAnswer: `Introduction: Mahatma Jotirao Phule (1827–1890) was one of the first systematic critics of caste-based social hierarchy in modern India. Unlike many reformers of his era who focused on single communities, Phule's vision embraced virtually every subaltern class — Dalits, OBCs, women, peasants, and workers.

Key Contributions Across Subaltern Categories:

1. Dalits and Untouchables:
Phule opened a well on his property for untouchable use — a radical act in 19th-century Maharashtra. He argued that "untouchability" was an instrument of Brahminical oppression, not divinely ordained. His advocacy for public access to water and wells anticipated B.R. Ambedkar's Mahad Satyagraha (1927) by decades.

2. Women:
In 1848, Phule and his wife Savitribai established India's first school for girls at Pune — an act for which he was ostracised by his family. He advocated widow remarriage, opposed child marriage, and ran a home for widows and rape survivors (Balhatya Pratibandhak Griha). His feminism was intersectional — recognising that caste and gender oppression were interlinked.

3. Peasants and Agricultural Labour:
His Marathi work Shetkaryacha Asud (The Cultivator's Whipcord, 1883) is a comprehensive critique of the exploitation of peasants by moneylenders, landlords, colonial administrators, and Brahmin priests. He argued that the agricultural castes (kunbis, malis) were the true producers of India's wealth, yet received the least.

4. OBCs and Shudras:
Phule's conceptual framework identified Shudras and Ati-Shudras (OBCs and Dalits) as the twin victims of the Brahminic social order. His Satyashodhak Samaj (Truth-Seekers Society, 1873) provided an organisational platform for these communities, conducting marriages without Brahmin priests and challenging ritual dependence.

5. Gulamgiri (Slavery, 1873):
This landmark text dedicated to abolitionists in the United States drew a direct parallel between Black American slavery and caste slavery in India — an early example of transnational solidarity thinking. It argued that caste-based discrimination was no less dehumanising than racial slavery.

6. Religious and Ideological Critique:
Phule attacked the religious legitimation of caste — arguing that Hindu scriptures were Brahminic fabrications designed to perpetuate hierarchy. He called for rational, humanist education as the foundation of social liberation.

Legacy:
Phule's multi-directional social critique directly influenced B.R. Ambedkar, who acknowledged Phule as one of his three great gurus (alongside Buddha and Kabir). The social justice movements of 20th-century Maharashtra — the non-Brahmin movement, the OBC assertion, and Dalit politics — all trace intellectual lineage to Phule.

Conclusion: Phule's uniqueness lies in his simultaneous engagement with caste, gender, class, and rationalism — making him a precursor not just to anti-caste politics but to a comprehensive subaltern liberation philosophy that remains urgently relevant in contemporary India.`,
    sources: [
      { name: "NCERT History — Class VIII", chapter: "Social Change — 19th Century" },
      { name: "Gail Omvedt — Seeking Begumpura", chapter: "Phule and Anti-Caste Thought" },
    ],
  },

  // ─── 10-MARK QUESTIONS ───────────────────────────────────────────────────

  {
    _id: "mains_gs1_2025_11",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Globalisation",
    subTopic: "Globalisation & Consumer Culture",
    marks: 10,
    directive: "Justify",
    wordLimit: 100,
    questionText:
      "Do you think that globalization results in only an aggressive consumer culture? Justify your answer.",
    keyPoints: [
      "Aggressive consumerism: McDonaldization, brand culture, planned obsolescence",
      "Counter-argument: cultural exchange, revival of indigenous products (GI tags), global civil society",
      "Glocalization: fusion of global and local (Indian examples: Bollywood, cuisine fusion)",
      "Digital globalisation: access to global ideas, human rights movements",
      "Balanced view: consumerism is dominant but not the only outcome",
    ],
    idealAnswer: `Introduction: Globalisation has undoubtedly accelerated consumer culture, but reducing its outcomes to "only aggressive consumerism" is an oversimplification.

The Consumerism Argument (Yes):
Globalisation has driven the global spread of branded consumption — McDonald's, Amazon, fast fashion (Zara, H&M), and planned obsolescence. In India, shopping malls replaced local bazaars; aspirational brand consumption grew with the middle class. Multinational advertising creates standardised global desires — Ritzer's "McDonaldization" captures this homogenising tendency.

Beyond Consumerism (No — Multiple Outcomes):
1. Cultural Exchange: Globalisation enables the spread of yoga, Bollywood, and Indian cuisine globally — and the reverse (K-pop, Latin music, Japanese aesthetics in India). This is cultural enrichment, not merely consumerism.

2. Glocalization: Global companies adapt to local cultures (McAloo Tikki, Maggi India-style). Indian artisans use global platforms (Amazon Karigar, GI-tagged products) to reach international markets.

3. Global Civil Society: Globalisation empowered transnational social movements — environmental activism, #MeToo, human rights advocacy — none of which are "consumer culture."

4. Knowledge Globalisation: Open access journals, MOOC platforms, and digital libraries democratise education — a non-commercial outcome.

Conclusion: Globalisation creates conditions for aggressive consumerism, but it simultaneously enables cultural exchange, grassroots activism, and knowledge democratisation. The outcome depends on the agency of nations and communities in shaping how they engage with global forces.`,
    sources: [
      { name: "NCERT Sociology — Class XII", chapter: "Globalisation and Social Change" },
    ],
  },

  {
    _id: "mains_gs1_2025_12",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Governance & Society",
    subTopic: "Civil Service Ethos — Professionalism & Nationalism",
    marks: 10,
    directive: "Elucidate",
    wordLimit: 100,
    questionText:
      "The ethos of civil service in India stand for the combination of professionalism with nationalistic consciousness – Elucidate.",
    keyPoints: [
      "Professionalism: merit, rule of law, apolitical functioning, domain expertise",
      "Nationalistic consciousness: service to citizens, constitutional values, public interest",
      "ICS legacy vs post-independence transformation",
      "ARC recommendations on civil service reform",
      "Examples: IAS officers in disaster response, welfare scheme delivery",
    ],
    idealAnswer: `Introduction: The Indian civil service was designed to be simultaneously a professional institution (merit-based, politically neutral, expert) and a patriotic one (committed to national interest and constitutional values).

Professionalism in Civil Services:
- Merit-based selection through UPSC ensures technical competence.
- Rule-based functioning, adherence to procedures, and accountability mechanisms maintain institutional integrity.
- Specialisation in domains (revenue, police, foreign service) builds expertise.
- All India Services (IAS, IPS, IFS) provide a cadre of trained administrators insulated from short-term political pressures.

Nationalistic Consciousness:
- Civil servants are custodians of the Constitution — committed to its values of justice, liberty, equality, and fraternity — not just to political masters.
- The ethos demands service orientation: the IAS officer in a drought-affected district or a disaster-hit village embodies "nation first."
- Sardar Patel's vision for the IAS as the "Steel Frame" of India reflected this nationalistic purpose.
- Training at LBSNAA instils public service values alongside professional skills.

The Synthesis:
The most effective civil servants are those who combine technical mastery (professionalism) with an unwavering commitment to the larger public good (nationalistic consciousness). This synthesis prevents both bureaucratic rigidity (professionalism without purpose) and populist overreach (nationalism without institutional discipline).

Challenges: Political interference, transfers as punishment, and lack of functional autonomy sometimes undermine this balance.

Conclusion: The civil service ethos is not just about efficient governance — it is about being guardians of the nation's democratic promise, where professional rigour serves the national conscience.`,
    sources: [
      { name: "2nd ARC Report", chapter: "Civil Service Reforms" },
      { name: "Laxmikanth — Public Administration", chapter: "Civil Services in India" },
    ],
  },

  {
    _id: "mains_gs1_2025_13",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Society",
    topic: "Urbanisation",
    subTopic: "Smart Cities — Urban Poverty & Justice",
    marks: 10,
    directive: "How",
    wordLimit: 100,
    questionText:
      "How does smart city in India address the issues of urban poverty and distributive justice?",
    keyPoints: [
      "Smart Cities Mission: 100 cities, area-based development + pan-city solutions",
      "Urban poor inclusion: slum upgradation, affordable housing (PMAY-U)",
      "Digital inclusion: e-governance, citizen grievance portals",
      "Limitations: island development, exclusion of informal settlers",
      "Distributive justice critique: smart cities favour already-developed areas",
    ],
    idealAnswer: `Introduction: India's Smart Cities Mission (SCM), launched in 2015, aims to transform 100 cities through technology-driven urban development. Its relationship with urban poverty and distributive justice is, however, complex and contested.

How Smart Cities Address Urban Poverty:
1. Basic Infrastructure: SCM mandates assured water supply, sanitation, waste management, and affordable housing — directly impacting the urban poor.
2. PMAY-Urban Integration: Smart city projects include slum redevelopment and affordable housing under Pradhan Mantri Awas Yojana.
3. Digital Governance: Integrated Command and Control Centres (ICCCs) enable faster grievance redressal, benefiting all residents including the poor.
4. Livelihood Support: Some smart city projects include market upgradation, street vendor zones, and skill development centres.

Distributive Justice Concerns:
1. Area-Based Development Bias: The "retrofitting" and "greenfield" models focus on selected zones, often benefiting wealthier neighbourhoods first (the "island of excellence" critique).
2. Displacement of Informal Settlers: Urban renewal frequently displaces slum dwellers without adequate rehabilitation — reproducing spatial inequality.
3. Technology Divide: Smart solutions (app-based services, digital payments) assume smartphone access, excluding the digitally marginalised.
4. Governance Structure: Special Purpose Vehicles (SPVs) bypass elected municipal bodies, reducing democratic accountability.

Conclusion: Smart Cities can contribute to distributive justice only if inclusion is built into their design — prioritising marginalised neighbourhoods, ensuring displacement-free development, and bridging the digital divide. Without intentional equity frameworks, smart cities risk being "smart" for some and invisible for others.`,
    sources: [
      { name: "Ministry of Housing & Urban Affairs — SCM Annual Report", chapter: "Mission Overview" },
      { name: "ICLEI Urban Sustainability Reports", chapter: "India Urban" },
    ],
  },

  {
    _id: "mains_gs1_2025_14",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Physical Geography",
    topic: "Natural Hazards",
    subTopic: "Tsunamis — Formation & Consequences",
    marks: 10,
    directive: "Explain with examples",
    wordLimit: 100,
    questionText:
      "What are Tsunamis? How and where are they formed? What are their consequences? Explain with examples.",
    keyPoints: [
      "Definition: series of ocean waves triggered by underwater seismic/volcanic/landslide events",
      "Formation: subduction zone earthquakes (vertical displacement of water column)",
      "Formation zones: Pacific Ring of Fire, Sumatra-Andaman, Japan Trench",
      "Behaviour: low amplitude in open ocean, amplifies near shore (wave shoaling)",
      "2004 Indian Ocean Tsunami: 9.1 Mw, 2.3 lakh deaths, 14 countries",
      "2011 Tōhoku (Japan): Fukushima nuclear disaster triggered",
      "Early warning systems: PTWS, IOPTWS",
    ],
    idealAnswer: `What are Tsunamis?
Tsunamis are a series of large ocean waves generated by sudden, large-scale displacement of water, typically caused by underwater earthquakes, volcanic eruptions, submarine landslides, or meteorite impacts. The term is Japanese for "harbour wave."

How and Where They Form:
Tsunamis most commonly originate at subduction zone boundaries, where one tectonic plate is forced beneath another. A megathrust earthquake causes the ocean floor to suddenly rise or fall, displacing a massive column of water. This displacement propagates as a series of waves in all directions.

In the open ocean, tsunami waves have low amplitude (< 1 m) but very long wavelengths (100–500 km) and travel at ~800 km/hr (the speed of a jet aircraft). As they approach shallow coastal waters, wave shoaling reduces speed but dramatically increases wave height — sometimes to 30–40 m.

Major formation zones: Pacific Ring of Fire (Japan, Chile, Alaska subduction zones); Sumatra-Andaman subduction zone (Indian Ocean); Puerto Rico Trench (Caribbean).

Consequences:

1. 2004 Indian Ocean Tsunami (Sumatra–Andaman Earthquake, 9.1 Mw):
- ~2,27,000 deaths across 14 countries (Indonesia, Sri Lanka, India, Thailand, Somalia)
- India's Andaman & Nicobar Islands, Tamil Nadu, Andhra Pradesh, Kerala severely affected
- Triggered the establishment of the Indian Ocean Tsunami Warning System (IOPTWS)

2. 2011 Tōhoku Tsunami (Japan, 9.0 Mw):
- ~18,500 deaths; Fukushima Daiichi nuclear disaster
- Demonstrated that modern infrastructure could not fully mitigate tsunami impacts

3. General Consequences:
- Mass casualties and displacement
- Destruction of coastal infrastructure, ports, fisheries
- Saltwater intrusion damaging agricultural land
- Long-term psychological trauma in affected communities

Early Warning Systems: The Pacific Tsunami Warning System (PTWS) and IOPTWS provide seismic alerts, but warning times may be only minutes for near-source events.

Conclusion: Tsunamis are low-frequency, high-impact events — their destructive potential demands robust coastal planning, early warning infrastructure, and community preparedness, especially for densely populated coasts.`,
    sources: [
      { name: "NCERT Geography — Class XI", chapter: "Natural Hazards and Disasters" },
      { name: "NDMA Guidelines", chapter: "Tsunami Management" },
    ],
  },

  {
    _id: "mains_gs1_2025_15",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Geography",
    topic: "Energy Geography",
    subTopic: "Solar Energy — Ecological & Economic Benefits",
    marks: 10,
    directive: "Explain briefly",
    wordLimit: 100,
    questionText:
      "Explain briefly the ecological and economic benefits of solar energy generation in India with suitable examples.",
    keyPoints: [
      "India: 3rd largest solar market globally; 300+ sunny days/year",
      "Ecological: zero direct emissions, reduced coal dependence, land dual-use (agrivoltaics)",
      "Economic: falling costs (₹2/unit), rural energy access, export potential (green hydrogen)",
      "PM-KUSUM for farmers, Kisan Urja Suraksha evam Utthaan Mahabhiyan",
      "National Solar Mission: 100 GW target (achieved ~80 GW by 2024)",
      "Job creation: ~1 million solar jobs projected by 2030",
    ],
    idealAnswer: `Introduction: India, with 300+ sunny days per year and over 5,000 trillion kWh of solar energy incident annually, is uniquely positioned to leverage solar energy. Its transition has yielded both ecological and economic dividends.

Ecological Benefits:
1. GHG Emission Reduction: Each GW of solar displaces approximately 1.5 million tonnes of CO₂ annually compared to coal. India's ~80 GW solar capacity (2024) represents a significant emission reduction.
2. Reduced Air Pollution: Solar displaces coal combustion, reducing PM2.5, SO₂, and NOx emissions that cause respiratory disease.
3. Water Conservation: Solar PV requires negligible water versus coal plants (which require ~1.5 litres/kWh for cooling).
4. Land Synergies: Agrivoltaic projects (e.g., in Gujarat, Rajasthan) combine solar panels with crop cultivation, reducing water evaporation and providing shade — dual land use.

Economic Benefits:
1. Cost Competitiveness: Solar tariffs have fallen from ₹17/unit (2010) to ~₹2/unit (2023) — among the lowest in the world. This reduces electricity costs for industry and households.
2. Energy Access: Off-grid solar (PM-KUSUM, solar microgrids) electrifies remote villages and enables farmers to run pumps without diesel costs. PM-KUSUM has provided solar pumps to ~3.5 lakh farmers.
3. Foreign Exchange Savings: Reduced coal and oil imports improve India's current account.
4. Export Potential: India's vision for green hydrogen (SIGHT Programme) positions solar as a production asset for export.
5. Employment: The solar sector employs ~1 lakh people currently, with projections of 1 million by 2030.

Examples:
- Bhadla Solar Park (Rajasthan): 2,245 MW — one of the world's largest
- Rewa Ultra Mega Solar (MP): 750 MW, supplies Delhi Metro
- National Solar Mission: 100 GW target under its ambit

Conclusion: Solar energy in India is simultaneously an ecological imperative and an economic opportunity — reducing emissions, creating jobs, and driving energy security. The challenge is scaling manufacturing (reducing import dependence on Chinese panels) and ensuring equitable distribution of its benefits.`,
    sources: [
      { name: "MNRE Annual Report", chapter: "Solar Energy Mission" },
      { name: "CEEW Solar Reports", chapter: "India Solar Handbook" },
    ],
  },

  {
    _id: "mains_gs1_2025_16",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Indian Geography",
    topic: "Economic Activities",
    subTopic: "Non-Farm Primary Activities & Physiography",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "What are non-farm primary activities? How are these activities related to physiographic features in India? Discuss with suitable examples.",
    keyPoints: [
      "Non-farm primary: fishing, forestry, mining, animal husbandry, quarrying",
      "Plains: animal husbandry (dairy, Anand model), fishing (rivers)",
      "Coastal/Marine: marine fishing (Kerala, Tamil Nadu, Gujarat)",
      "Hills/Forests: tribal NTFP, timber, medicinal plants (Northeast, Central India)",
      "Plateau: mining (Chhota Nagpur — coal, iron ore, manganese)",
      "Deserts: camel herding, salt extraction (Rajasthan, Rann of Kutch)",
    ],
    idealAnswer: `Non-Farm Primary Activities Defined:
Primary activities involve extraction of natural resources directly from the environment. Non-farm primary activities exclude crop cultivation and include fishing, forestry, animal husbandry, mining, quarrying, and NTFP collection.

Relationship with Physiographic Features:

1. Northern Plains (IGP):
Flat terrain, fertile alluvium, and abundant water support large-scale animal husbandry (cattle, buffalo for dairy). The Anand Cooperative Model (Amul, Gujarat) exemplifies how plains topography and water availability enable organised dairying. River fishing (Ganga, Brahmaputra systems) is also significant.

2. Peninsular Plateau (Deccan, Chhota Nagpur):
The Chhota Nagpur Plateau is India's "mineral heartland" — rich in coal (Jharia, Raniganj), iron ore (Singhbhum), manganese (Odisha), and bauxite. The ancient metamorphic and sedimentary geology of this plateau concentrates mineral wealth. Tribal communities here depend on NTFP (kendu leaves, mahua, bamboo) from Dry Deciduous forests.

3. Coastal Regions:
India's 7,500 km coastline supports one of the world's largest marine fishing sectors. Kerala, Tamil Nadu, Andhra Pradesh, and Gujarat are major maritime fishing states. The continental shelf (up to 200 m depth) is rich in fish, crustaceans, and molluscs. The varied physiography — backwaters (Kerala), estuaries, mangroves — supports diverse aquatic species.

4. Himalayan and Hilly Regions:
Forests of the Northeast (Assam, Arunachal, Meghalaya) support timber extraction, bamboo industry, and medicinal plant collection. Steep terrain makes crop farming difficult, pushing communities toward forest-based livelihoods.

5. Arid Zones (Rajasthan, Rann of Kutch):
Camel herding (Rajasthan), salt extraction (Sambhar Lake, Rann of Kutch's salt flats), and seasonal pastoral nomadism are characteristic non-farm primary activities adapted to scarce water and extreme climate.

Conclusion: Non-farm primary activities are geography-determined — each physiographic zone generates the activities best suited to its terrain, climate, and resource endowment. Policy for these sectors must be spatially differentiated, recognising the ecological and cultural specificity of each zone.`,
    sources: [
      { name: "NCERT Geography — Class XII", chapter: "Primary Activities" },
      { name: "NCERT — India: People and Economy", chapter: "Resources and Development" },
    ],
  },

  {
    _id: "mains_gs1_2025_17",
    year: 2025,
    paper: "GS Paper 1",
    subject: "World Geography",
    topic: "Climate Change",
    subTopic: "Sea Level Rise & Island Nations",
    marks: 10,
    directive: "Discuss with examples",
    wordLimit: 100,
    questionText:
      "How are climate change and the sea level rise affecting the very existence of many island nations? Discuss with examples.",
    keyPoints: [
      "Sea level rise rate: ~3.3 mm/year globally; accelerating",
      "Small Island Developing States (SIDS): Maldives, Tuvalu, Kiribati, Marshall Islands",
      "Threats: inundation, saltwater intrusion, coral bleaching, extreme weather",
      "UNFCCC: SIDS recognised as most vulnerable yet least responsible",
      "Responses: migration (Tuvalu–Australia deal), artificial islands (Maldives), relocation",
      "Legal issues: maritime boundaries if land disappears",
    ],
    idealAnswer: `Introduction: Global mean sea levels have risen ~20 cm since 1900, with the rate accelerating to ~3.7 mm/year in recent decades (IPCC AR6). For Small Island Developing States (SIDS), this is not a future threat — it is a present crisis.

How Sea Level Rise Threatens Island Nations:

1. Physical Inundation:
Many Pacific and Indian Ocean atolls have average elevations of only 1–2 metres above sea level. Tuvalu's highest point is ~4.5 m; many islands are already experiencing regular flooding during king tides. At current trajectories, significant portions of Tuvalu and Kiribati could be uninhabitable by 2050–2070.

2. Saltwater Intrusion:
Rising seas contaminate freshwater aquifers — the only source of drinking water on many atolls. This threatens both human survival and agriculture. In Tuvalu and Marshall Islands, saltwater intrusion has already rendered some agricultural land unproductive.

3. Coral Bleaching and Ecosystem Collapse:
Coral reefs protect low-lying islands from wave erosion. Ocean warming (1.5°C above pre-industrial) causes mass bleaching. The Great Barrier Reef and Pacific reefs have experienced multiple bleaching events. Without reef barriers, wave energy directly erodes island shores.

4. Extreme Weather Intensification:
Warmer seas intensify tropical cyclones. In 2015, Cyclone Pam devastated Vanuatu; in 2020, Harold caused catastrophic damage in Fiji, Tonga, and Vanuatu — nations with minimal carbon footprints.

Country-Specific Examples:
- Maldives: Average elevation ~1.5 m; constructing artificial elevated islands (Hulhumalé) as adaptation. Has declared climate emergency.
- Tuvalu: Signed a historic agreement with Australia (2023) for climate-induced migration rights — the first formal recognition of climate refugees from an entire nation.
- Kiribati: Purchased land in Fiji as a land bank for future relocation.
- Marshall Islands: Faces the loss of legal territorial sovereignty if its EEZ disappears underwater.

Legal and Geopolitical Dimensions:
UNCLOS rules on maritime boundaries assume permanent land. If islands disappear, affected nations could lose their EEZs — worth billions in fishing rights. This creates an urgent need for new international legal frameworks.

Conclusion: Island nations face an existential threat from climate change — a crisis they did not create. Their plight represents the starkest injustice of the climate crisis: the most vulnerable nations are those with the lowest emissions. Their survival demands not just adaptation but radical global emissions reduction and climate finance.`,
    sources: [
      { name: "IPCC AR6 — Working Group II", chapter: "Small Islands" },
      { name: "UNFCCC SIDS Reports", chapter: "Vulnerability Assessments" },
    ],
  },

  {
    _id: "mains_gs1_2025_18",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Art & Culture",
    topic: "Temple Art & Architecture",
    subTopic: "Chandella Art — Sculpture",
    marks: 10,
    directive: "Elucidate",
    wordLimit: 100,
    questionText:
      "The sculptors filled the Chandella artform with resilient vigor and breadth of life. Elucidate.",
    keyPoints: [
      "Chandella dynasty: 9th–13th century CE, Bundelkhand (Madhya Pradesh)",
      "Khajuraho temples: UNESCO WHS, 85 original temples, 25 survive",
      "Three temple groups: Western (largest), Eastern, Southern",
      "Nagara style shikhara; dense sculptural programmes",
      "Erotica: only ~10% of total sculpture; Tantra, Shakta, Vaishnava themes",
      "Artistic qualities: movement, sensuality, organic form, human vitality",
    ],
    idealAnswer: `Introduction: The Chandella rulers of Bundelkhand (9th–13th century CE) commissioned the Khajuraho temple complex, one of the finest expressions of medieval Indian sculptural art. The UNESCO World Heritage Site comprises 25 surviving temples (of an original 85), built primarily between 950–1050 CE.

The Sculptural Programme — Vigor and Vitality:

1. Dynamic Human Form:
Chandella sculptors mastered the depiction of the human body in motion — apsaras (celestial nymphs) applying kajal, musicians lost in performance, warriors in battle posture. Unlike the rigid frontality of earlier traditions, Chandella figures exhibit tribhanga (triple-flexed) and multiple-flexed poses that communicate organic life.

2. Breadth of Life — Secular and Sacred:
The temples' sculptural narratives encompass the full range of human experience: divine mythology (Vishnu, Shiva, Devi), erotic imagery (maithuna panels), court scenes, royal processions, battle scenes, and quotidian domestic life. This encyclopaedic scope — from celestial to earthy — gives the Chandella tradition its "breadth of life."

3. The Erotic Sculptures:
Often over-emphasised, the erotic (maithuna) panels constitute only ~10% of the total sculptural programme. Interpreted variously as Tantric symbolism (Shakti worship), Vatsyayana's Kamasutra illustration, or apotropaic protections against lightning, they represent a frank celebration of human sexuality as part of the cosmic life-force — not pornographic but philosophical.

4. Technical Mastery:
The sculptors used the sandstone's warmth to create surfaces that seem to breathe. High relief carving (almost three-dimensional) and subtle facial expressions give figures psychological depth. The Lakshmana, Kandariya Mahadeva, and Vishvanatha temples demonstrate the highest level of this craft.

5. Resilient Vigor:
Chandella sculpture avoided the ethereal, otherworldly quality of some Buddhist traditions. Even divine figures are depicted with muscular bodies, sensuous curves, and human emotions — a philosophical statement that the sacred is found within the fullness of life, not in its negation.

Conclusion: The Chandella artform endures as a testament to a civilisation that embraced life in its totality — where sensuality, spirituality, power, and play were not contradictions but complementary expressions of a vibrant cosmic order. Their sculptures remain among humanity's most honest and joyful portrayals of the human condition.`,
    sources: [
      { name: "Nitin Singhania — Indian Art & Culture", chapter: "Temple Architecture" },
      { name: "NCERT — An Introduction to Indian Art", chapter: "Medieval Temple Art" },
    ],
  },

  {
    _id: "mains_gs1_2025_19",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Art & Culture",
    topic: "Medieval History",
    subTopic: "Akbar's Religious Syncretism",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText: "Examine the main aspects of Akbar's religious syncretism.",
    keyPoints: [
      "Din-i-Ilahi (1582): eclectic spiritual order, not a state religion",
      "Ibadat Khana debates: Sunni, Shia, Hindu, Jain, Christian, Zoroastrian",
      "Sulh-i-kul: universal peace/tolerance as state policy",
      "Administrative measures: abolition of jizya (1579), pilgrimage tax",
      "Marriages across religious lines: Rajput queens",
      "Role of Birbal, Todar Mal, Tansen at court",
    ],
    idealAnswer: `Introduction: Akbar (r. 1556–1605) was arguably the most religiously syncretic ruler in Indian history — not merely tolerant of other faiths, but genuinely intellectually curious about them, fashioning a novel spiritual and administrative philosophy from this curiosity.

Key Aspects of Akbar's Religious Syncretism:

1. Ibadat Khana (House of Worship, 1575):
Akbar constructed a special hall at Fatehpur Sikri for inter-religious debates. Initially open to Muslim scholars, it was soon expanded to include Hindu, Jain, Zoroastrian, and Christian (Portuguese Jesuit) theologians. These debates exposed Akbar to diverse religious perspectives and deepened his scepticism of orthodox Islam.

2. Din-i-Ilahi (Divine Faith, 1582):
Rather than a new religion imposed on subjects, Din-i-Ilahi was a syncretic spiritual fellowship drawing from Islam, Hinduism, Zoroastrianism, Jainism, and Christianity. Its elements included veneration of light (Zoroastrian influence), vegetarianism (Jain influence), and solar worship. It attracted only a small elite; Birbal was reportedly the only Hindu initiate.

3. Sulh-i-kul (Universal Peace):
Akbar articulated the political philosophy of sulh-i-kul — tolerance of all religions without discrimination as a state principle. This was not mere tactical pluralism but a philosophical commitment: no religion had a monopoly on truth.

4. Administrative Measures:
- Abolished jizyah (tax on non-Muslims) in 1579 — a profound statement of religious equality.
- Abolished the pilgrimage tax on Hindus.
- Appointed Hindus to the highest administrative positions (Todar Mal as finance minister, Raja Man Singh as general).

5. Religious Marriages and Court Culture:
Akbar married Rajput princesses of different faiths, allowing them to maintain their religious practices in the harem. His court was a multicultural space: Hindu musician Tansen, Jain advisor Hiravijaya Suri, and Christian missionaries like Father Acquaviva all found patronage.

6. Translation Projects:
Akbar commissioned Sanskrit texts (Mahabharata, Ramayana, Atharva Veda) into Persian — a cultural bridge-building exercise led by Abul Fazl and Faizi.

Limitations and Assessment:
Akbar's syncretism was primarily an elite, court-level phenomenon. It did not fundamentally transform the social structures of his empire. Some scholars argue it was as much political strategy (consolidating Rajput alliance) as genuine spirituality. Yet his articulation of sulh-i-kul as state policy remains a remarkable pre-modern experiment in pluralism.

Conclusion: Akbar's religious syncretism was multi-dimensional — intellectual curiosity, political pragmatism, spiritual innovation, and genuine empathy for diverse traditions combined to create a governance philosophy that recognised India's civilisational diversity as strength rather than threat.`,
    sources: [
      { name: "Satish Chandra — Medieval India", chapter: "Akbar's Religious Policy" },
      { name: "NCERT History — Class VII", chapter: "The Mughal Empire" },
    ],
  },

  {
    _id: "mains_gs1_2025_20",
    year: 2025,
    paper: "GS Paper 1",
    subject: "Art & Culture",
    topic: "Ancient History",
    subTopic: "Harappan Architecture",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText: "Discuss the salient features of the Harappan architecture.",
    keyPoints: [
      "Grid pattern town planning: streets at right angles",
      "Burnt brick standardisation: 1:2:4 ratio",
      "Two-part city: citadel (west, elevated) + lower town (east)",
      "Great Bath (Mohenjo-daro): religious/civic use",
      "Granaries: Mohenjo-daro, Harappa — economic function",
      "Drainage system: covered drains, world's first urban sanitation",
      "No monumental religious architecture; absence of temples",
    ],
    idealAnswer: `Introduction: The Harappan (Indus Valley) Civilisation (c. 2600–1900 BCE) produced the ancient world's most systematic urban architecture, distinguished by a rationality and public hygiene consciousness that was not equalled for millennia.

Salient Features:

1. Grid Pattern Town Planning:
Harappan cities (Mohenjo-daro, Harappa, Dholavira, Lothal) were laid out on a grid plan with streets running north-south and east-west at right angles. Main roads were up to 10 metres wide, flanked by narrower lanes. This reflects centralised planning authority.

2. Standardised Burnt Bricks:
Bricks were made of kiln-fired (burnt) clay in a standardised ratio of 1:2:4 (thickness:width:length). This standardisation — consistent across cities thousands of kilometres apart — suggests either a common authority or a widely shared building tradition.

3. Two-Part City Structure:
Most major Harappan cities comprised a raised, fortified Citadel (west) and a Lower Town (east). The Citadel housed civic/administrative structures (granaries, the Great Bath), while the Lower Town contained residential buildings of varying sizes — suggesting social stratification.

4. The Great Bath (Mohenjo-daro):
The most remarkable public structure of Harappan architecture, the Great Bath (11.9 m × 7 m × 2.4 m depth) was lined with bitumen-sealed bricks to make it watertight. Its precise function is debated — ritual purification and public civic bathing are the most accepted interpretations. It demonstrates advanced engineering knowledge.

5. Granaries:
Large granary structures at both Mohenjo-daro and Harappa indicate centralised storage of agricultural surplus — possibly a state-controlled redistributive economy.

6. Advanced Drainage System:
Harappan cities had the ancient world's most sophisticated urban drainage: covered brick-lined drains ran below street level, connecting individual household drains to main city drains. This level of public sanitation was not matched in Western civilisations for over 2,000 years.

7. Residential Architecture:
Houses had multiple rooms, bathrooms, wells, and often two stories. The focus on interior courtyards (with streets having blank outer walls) suggests a privacy-oriented culture.

8. Absence of Monumental Religious Architecture:
Unlike Mesopotamia (ziggurats) or Egypt (pyramids), the Harappan civilisation left no clearly identifiable temples or palaces — suggesting either a different relationship between religion and public architecture, or that we have not yet correctly identified religious structures.

Conclusion: Harappan architecture is remarkable for its rationality, standardisation, and attention to public hygiene — qualities of a mature, planned urban civilisation. The absence of monumental ego-architecture (no pharaoh's pyramid, no emperor's palace) suggests a fundamentally different — possibly more egalitarian — social and political order.`,
    sources: [
      { name: "NCERT History — Class VI", chapter: "The Earliest Cities" },
      { name: "R.S. Sharma — Ancient India", chapter: "Indus Valley Civilisation" },
    ],
  },
];

export default mainsGS1Data;