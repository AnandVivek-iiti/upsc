/**
 * mainsGS3Data.js
 * UPSC Mains GS Paper 3 — 2024
 *
 * Schema (descriptive / Mains variant):
 * {
 *   _id          : string   — unique identifier
 *   year         : number
 *   paper        : string   — "GS Paper 3"
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

const mainsGS3Data = [
  // ─── INTERNAL SECURITY ────────────────────────────────────────────────────

  {
    _id: "mains_gs3_2024_01",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Internal Security",
    topic: "Cyber Security",
    subTopic: "Social Media & Encrypted Messaging",
    marks: 15,
    directive: "Discuss / Suggest",
    wordLimit: 150,
    questionText:
      "Social media and encrypting messaging services pose a serious security challenge. What measures have been adopted at various levels to address the security implications of social media? Also suggest any other remedies to address the problem.",
    keyPoints: [
      "Security threats: terrorism recruitment, radicalization, fake news, coordinated disinformation",
      "Encrypted messaging (WhatsApp, Signal, Telegram): end-to-end encryption hinders lawful interception",
      "Domestic measures: IT Act 2000 (amended 2021), IT Rules 2021 — traceability requirement for significant social media intermediaries",
      "CERT-In guidelines, National Cyber Security Policy",
      "International cooperation: Budapest Convention, FATF recommendations",
      "Remedies: social media literacy, AI-based content moderation, lawful access frameworks, dedicated cyber courts",
    ],
    idealAnswer: `Introduction: Social media platforms and encrypted messaging services have become dual-use technologies — tools for communication and commerce that are simultaneously exploited by malicious actors for terrorism, disinformation, and organised crime.

Security Challenges Posed:
1. Radicalisation and Recruitment: Terror groups use platforms like Telegram to recruit, radicalise, and coordinate — as evidenced in multiple terrorist attacks where perpetrators were found active in closed groups.
2. Disinformation and Mob Violence: Fabricated content shared on WhatsApp has triggered mob lynchings in India (Jharkhand, Karnataka incidents).
3. Encryption as a Shield: End-to-end encryption (E2EE) prevents lawful interception, creating "going dark" problem for intelligence agencies.
4. Foreign State Interference: Coordinated inauthentic behaviour by foreign actors (documented in India's 2019 elections) undermines democratic processes.

Measures Adopted:

Domestic Level:
- Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021: Significant Social Media Intermediaries (SSMIs) with 5 million+ users must appoint grievance officers, compliance officers, and enable traceability of first originator of messages.
- IT Act 2000 (Section 66A struck down, but Sections 67, 69 remain): Empowers government to intercept, monitor, and block content.
- CERT-In (Computer Emergency Response Team — India): Issues guidelines, coordinates cyber incident response.
- National Cyber Security Policy 2013: Framework for protecting cyberspace.
- Unlawful Activities Prevention Act (UAPA): Used against online radicalisation.

Platform Level:
- Proactive Grievance Redressal by Meta, Google per IT Rules.
- WhatsApp's message forwarding limit (5 chats) introduced post-India government pressure.

International Level:
- Budapest Convention on Cybercrime (India not a signatory but cooperates bilaterally).
- FATF recommendations on terrorist financing through digital channels.
- Christchurch Call: Global initiative against terrorist and violent extremist content online.

Additional Remedies Suggested:
1. Digital Literacy Programme: Nationwide media and digital literacy curriculum (like Australia's eSafety Commissioner model).
2. Lawful Access Framework: Legislation mandating a warrant-based lawful access mechanism without breaking E2EE for all users — targeting only specific accounts under judicial oversight.
3. AI-Powered Content Moderation: Mandate platforms to deploy AI to detect hate speech and coordinated inauthentic behaviour in Indian languages.
4. Dedicated Cyber Courts: Fast-track adjudication of cyber crime and content moderation disputes.
5. Real-Name Registration for SSMIs: Voluntary KYC-based verification to reduce anonymity-enabled abuse, while protecting whistleblowers.

Conclusion: The challenge is balancing privacy (a fundamental right post-Puttaswamy judgment) with security imperatives. A calibrated, judicially supervised framework — rather than blanket encryption bans — is the sustainable path forward.`,
    sources: [
      { name: "IT Rules 2021", chapter: "Intermediary Guidelines" },
      { name: "MHA Annual Report", chapter: "Cyber Crime & Internal Security" },
      { name: "NITI Aayog — National Strategy for AI", chapter: "AI Governance" },
    ],
  },

  {
    _id: "mains_gs3_2024_02",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Internal Security",
    topic: "Border Management",
    subTopic: "India-China & India-Pakistan Border Issues",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "India has a long and troubled border with China and Pakistan fraught with contentious issues. Examine the conflicting issues and security challenges along the border. Also give out the development being undertaken in these areas under the Border Area Development Programme (BADP) and Border Infrastructure and Management (BIM) Scheme.",
    keyPoints: [
      "India-China: LAC dispute, Galwan 2020, Depsang, Demchok, Tawang; CPEC strategic threat",
      "India-Pakistan: LoC infiltration, terrorism sponsorship, cross-border tunnels, drone-dropped weapons",
      "BADP: villages near border, infrastructure, health, education — ₹3,000+ crore annually",
      "BIM Scheme (Vibrant Villages Programme): border village development, connectivity, border haats",
      "Border infrastructure: roads (BRO), helipads, tunnels (Atal Tunnel), ITBP outposts",
    ],
    idealAnswer: `Introduction: India shares a 3,488 km border with China and approximately 3,323 km with Pakistan. Both borders remain active flashpoints with distinct but overlapping security challenges.

India-China Border — Conflicting Issues:
1. Line of Actual Control (LAC): The LAC is neither delineated nor demarcated, leading to differing perceptions of the boundary in sectors like Eastern Ladakh (Depsang, Galwan, Gogra-Hot Springs, Demchok) and Arunachal Pradesh (Tawang).
2. Galwan Valley Clash (2020): Resulted in casualties on both sides; triggered review of India's border infrastructure and deployment posture.
3. CPEC Threat: China-Pakistan Economic Corridor passes through Pakistan-Occupied Kashmir, which India considers its territory, creating a strategic encirclement concern.
4. Salami-Slicing: China's incremental encroachments along the LAC (building villages inside disputed areas) present a gradual boundary-shift strategy.

India-Pakistan Border — Conflicting Issues:
1. Line of Control (LoC) Infiltration: Despite the 2021 ceasefire agreement, cross-border infiltration of terrorists continues.
2. Terrorism Sponsorship: State-sponsored terrorist groups (JeM, LeT) continue to operate from Pakistani soil.
3. Cross-Border Tunnels: Multiple tunnels discovered in Jammu sector enabling smuggling of weapons and militants.
4. Drone-Dropped Weapons: Drones carrying AK-47s, RDX discovered in Jammu and Punjab — new-generation infiltration tactic.
5. Drug Trafficking: Punjab border sees large-scale narcotics and arms smuggling linked to terrorist financing.

Border Area Development:

BADP (Border Area Development Programme):
- Centrally Sponsored Scheme since 1987; covers 396 border districts.
- Focus: infrastructure (roads, drinking water, schools, health centres), economic development of border villages.
- Annual outlay: ~₹3,000–4,000 crore; administered by MHA with State governments.
- Key outputs: village connectivity roads, community halls, water supply projects.

BIM Scheme and Vibrant Villages Programme:
- Vibrant Villages Programme (2023): Covers 663 border villages in 19 districts of Himachal Pradesh, Uttarakhand, Sikkim, Arunachal Pradesh, and Ladakh.
- Aims to reverse migration from border villages, creating a human shield of resident population.
- Provides: road connectivity, renewable energy, broadband, livelihood support.
- BRO (Border Roads Organisation): Constructed strategic highways (Darbuk-Shyok-DBO road), Atal Tunnel (Rohtang), Sela Tunnel — reducing winter cut-off of strategic sectors.
- Border Haats: Trade facilitation along India-Bangladesh and India-Myanmar borders (model applicable to LoC).

Conclusion: India's border security strategy has evolved from a purely defensive posture to a development-centric approach — recognising that populated, economically viable border villages serve as the first line of defence. However, sustained diplomatic engagement alongside infrastructure development remains indispensable.`,
    sources: [
      { name: "MHA Annual Report", chapter: "Border Management" },
      { name: "Ministry of Development of North East Region", chapter: "Vibrant Villages Programme" },
      { name: "BRO Annual Report", chapter: "Strategic Infrastructure" },
    ],
  },

  // ─── DISASTER MANAGEMENT ──────────────────────────────────────────────────

  {
    _id: "mains_gs3_2024_03",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Disaster Management",
    topic: "Urban Flooding",
    subTopic: "Climate-Induced Urban Floods",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Flooding in urban areas is an emerging climate-induced disaster. Discuss the causes of this disaster. Mention the features of two such major floods that occurred in India in the last two decades. Describe the policies and frameworks in India that aim at tackling such floods.",
    keyPoints: [
      "Causes: rapid urbanisation, concretisation, encroachment on floodplains, inadequate drainage, extreme rainfall events (climate change)",
      "Mumbai 2005: 944 mm rainfall in 24 hours, 1,094 deaths, infrastructure collapse",
      "Chennai 2015: Adyar river overflow, 400+ deaths, ₹20,000 crore economic losses",
      "Policies: National Disaster Management Plan, National Flood Risk Mitigation Project, Smart Cities Mission, AMRUT",
      "NDMA guidelines on urban flooding (2010)",
    ],
    idealAnswer: `Introduction: Urban flooding has emerged as one of India's most recurrent and economically devastating climate-induced disasters, affecting over 100 cities in the last two decades. The IPCC projects a 2–3x increase in extreme precipitation events in South Asia by 2100.

Causes of Urban Flooding:

Natural Factors:
- Extreme Rainfall Events: Intensified by climate change, cloud bursts deliver unprecedented precipitation in short durations (e.g., Bengaluru 2022: 131 mm in 3 hours).
- Sea Level Rise: Exacerbates coastal urban flooding in Mumbai, Chennai, Kochi.

Anthropogenic Factors:
- Rapid Urbanisation and Concretisation: Impervious surfaces increase surface runoff by 40–60% compared to natural land cover.
- Encroachment of Floodplains and Wetlands: Chennai lost 90% of its wetlands between 1980–2015 — wetlands that historically absorbed floodwaters.
- Inadequate Stormwater Drainage: Most Indian cities have colonial-era drainage systems designed for 12–25 mm/hour — grossly inadequate for current rainfall intensities.
- Solid Waste Blockage: Drainage channels choked by solid waste.
- Unregulated Construction: Buildings on natural drainage channels, nullahs, and low-lying areas.

Case Study 1 — Mumbai Floods (July 2005):
- Rainfall: 944 mm in 24 hours at Santacruz — highest ever recorded in India for a 24-hour period.
- Deaths: ~1,094; Economic Loss: ~₹550 crore (direct); total losses estimated at ₹4,500 crore.
- Features: Mithi River overflow; airport and rail disruptions; Kurla, Dharavi, and low-lying suburbs submerged for days.
- Legacy: Triggered the Chitale Committee Report (2005) recommending floodplain protection; led to Brihanmumbai Storm Water Disposal System (BRIMSTOWAD) upgradation.

Case Study 2 — Chennai Floods (November–December 2015):
- Cause: Adyar and Cooum river overflow; record rainfall of 1,049 mm in November — highest in 100 years.
- Deaths: 400+; Economic Loss: ₹20,000+ crore; over 1.8 million displaced.
- Features: Chembarambakkam reservoir's emergency release flooded residential areas without adequate warning; airport shut for 14 days; IT corridor severely impacted.
- Legacy: Highlighted need for integrated urban flood early warning systems and reservoir management protocols.

Policies and Frameworks:

1. National Disaster Management Plan (NDMP) 2016: Provides comprehensive framework aligned with Sendai Framework for Disaster Risk Reduction (2015–2030); includes urban flood as a priority hazard.

2. NDMA Guidelines on Management of Urban Flooding (2010): Recommendations on stormwater management, flood-proofing, early warning systems, and inter-agency coordination.

3. National Flood Risk Mitigation Project (NFRMP): World Bank-assisted project for flood mapping and risk assessment in 16 flood-prone states.

4. AMRUT (Atal Mission for Rejuvenation and Urban Transformation): Mandates stormwater drainage as a core urban infrastructure component for 500 cities.

5. Smart Cities Mission: Some cities (Pune, Surat) have deployed sensor-based flood monitoring and integrated command centres.

6. State Disaster Management Plans: State-level SDMAs required to prepare city-specific urban flood management plans.

Conclusion: Urban flooding in India is as much a governance failure as a climate crisis. Integrating nature-based solutions (urban wetlands, permeable surfaces), upgrading drainage to modern standards, enforcing floodplain zoning, and establishing real-time early warning systems are imperative to building flood-resilient cities.`,
    sources: [
      { name: "NDMA Guidelines — Urban Flooding", chapter: "2010" },
      { name: "IPCC AR6", chapter: "South Asia Regional Chapter" },
      { name: "Chitale Committee Report", chapter: "Mumbai Floods 2005" },
    ],
  },

  {
    _id: "mains_gs3_2024_04",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Disaster Management",
    topic: "Disaster Resilience",
    subTopic: "Sendai Framework & Resilience Framework",
    marks: 15,
    directive: "Discuss / Describe",
    wordLimit: 150,
    questionText:
      "What is disaster resilience? How is it determined? Describe various elements of a resilience framework. Also mention the global targets of Sendai Framework for Disaster Risk Reduction (2015-2030).",
    keyPoints: [
      "Disaster resilience: ability of systems/communities to anticipate, absorb, accommodate, adapt, transform",
      "Determined by: exposure, vulnerability, adaptive capacity, coping capacity",
      "Resilience framework elements: Prevention, Mitigation, Preparedness, Response, Recovery",
      "Sendai Framework 7 targets: reduce mortality, affected people, economic losses, damage to infrastructure, increase DRR strategies, international cooperation, access to early warning",
      "Sendai Framework 4 priorities: understanding risk, governance, investment, preparedness",
    ],
    idealAnswer: `What is Disaster Resilience?
Disaster resilience is the ability of a system, community, or society exposed to hazards to resist, absorb, accommodate, adapt to, transform, and recover from the effects of a hazard in a timely and efficient manner, including through the preservation and restoration of its essential basic structures and functions. (UNDRR definition)

It is fundamentally about bouncing forward — not merely restoring the status quo ante, but building back better.

How is Disaster Resilience Determined?
Resilience is a function of:
1. Exposure: The degree to which a community faces hazards (geographic location, climate vulnerability).
2. Sensitivity/Vulnerability: Characteristics that make a community susceptible to harm (poverty, inadequate infrastructure, marginalisation).
3. Adaptive Capacity: The ability to adjust to potential damage, take advantage of opportunities, or cope with consequences — depends on institutional strength, resources, social capital.
4. Coping Capacity: Immediate ability to manage adverse conditions using available skills and resources.
The inverse relationship of vulnerability and adaptive capacity determines resilience: higher adaptive capacity + lower vulnerability = greater resilience.

Elements of a Resilience Framework:

1. Prevention: Measures to eliminate or reduce the probability of a disaster occurring (e.g., land-use planning, building codes, flood-proofing, earthquake-resistant construction).

2. Risk Assessment and Understanding: Hazard mapping, vulnerability assessment, risk profiling at district and city level.

3. Mitigation: Reducing the impact of unavoidable hazards (flood embankments, cyclone shelters, firebreaks).

4. Preparedness: Training, early warning systems, evacuation plans, stockpiling relief materials, mock drills.

5. Response: Rapid mobilisation of emergency services, search and rescue, evacuation, first aid. (NDRF, SDRF, community first responders).

6. Recovery and Build-Back-Better: Post-disaster reconstruction that integrates risk reduction — not rebuilding vulnerabilities. Includes livelihood restoration, psychological support, infrastructure upgrade.

7. Governance and Institutions: Multi-level coordination (National, State, District, Local) — NDMA, SDMAs, DDMAs under Disaster Management Act 2005.

8. Community Participation: Aapda Mitra scheme (India) — training community volunteers as first responders. Community-Based Disaster Risk Management (CBDRM).

Sendai Framework for Disaster Risk Reduction (2015–2030):

The Sendai Framework is the global blueprint for disaster risk reduction adopted at the 3rd UN World Conference on Disaster Risk Reduction (Sendai, Japan, 2015). It succeeded the Hyogo Framework for Action (2005–2015).

4 Priorities for Action:
1. Understanding disaster risk
2. Strengthening disaster risk governance
3. Investing in disaster risk reduction for resilience
4. Enhancing disaster preparedness for effective response and to "Build Back Better"

7 Global Targets (by 2030):
A. Substantially reduce global disaster mortality — target: reduce average per 100,000 global mortality rate 2020–2030 vs 2005–2015 baseline.
B. Substantially reduce the number of affected people globally.
C. Reduce direct disaster economic loss in relation to global GDP.
D. Substantially reduce disaster damage to critical infrastructure and disruption of basic services (health, education).
E. Increase the number of countries with national and local disaster risk reduction strategies.
F. Substantially enhance international cooperation to developing countries for disaster risk reduction.
G. Substantially increase the availability of and access to multi-hazard early warning systems and disaster risk information.

India's Alignment:
India has aligned its National Disaster Management Plan (2016, revised 2019) with the Sendai Framework and is among the first countries to develop a National DRR Plan. The Coalition for Disaster Resilient Infrastructure (CDRI), launched by India in 2019, is India's multilateral contribution to Sendai Framework target D.

Conclusion: Disaster resilience is not an endpoint but a continuous process of assessment, investment, and institutional learning. The Sendai Framework provides the global scaffolding; national and local frameworks must operationalise it with community at the centre.`,
    sources: [
      { name: "UNDRR — Sendai Framework 2015–2030", chapter: "Full Text" },
      { name: "NDMA — National Disaster Management Plan 2019", chapter: "Overview" },
      { name: "CDRI Website", chapter: "About CDRI" },
    ],
  },

  // ─── SCIENCE & TECHNOLOGY ────────────────────────────────────────────────

  {
    _id: "mains_gs3_2024_05",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Science & Technology",
    topic: "Space & Planetary Science",
    subTopic: "Asteroids — Threat and Mitigation",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "What are asteroids? How real is the threat of them causing extinction of life? What strategies have been developed to prevent such a catastrophe?",
    keyPoints: [
      "Asteroids: rocky bodies orbiting Sun, mainly in Asteroid Belt between Mars and Jupiter",
      "Threat assessment: Chicxulub impactor (66 Ma) caused K-Pg extinction; modern NEOs tracked by NASA",
      "Torino Scale: 0–10 impact hazard classification",
      "DART mission (NASA, 2022): kinetic impactor successfully deflected Dimorphos",
      "Planetary defence: NEO surveillance, gravitational tractor, nuclear deflection, Hera mission (ESA)",
    ],
    idealAnswer: `What are Asteroids?
Asteroids are rocky, metallic, or carbon-rich small bodies orbiting the Sun, ranging in size from a few metres to hundreds of kilometres. The majority reside in the Asteroid Belt between Mars and Jupiter, though Near-Earth Objects (NEOs) — those with orbits that bring them close to Earth — number over 32,000 catalogued as of 2024. Potentially Hazardous Asteroids (PHAs) are a subset that are both large (>140 m diameter) and approach within 7.5 million km of Earth.

How Real is the Extinction Threat?

Historical Evidence:
- The Chicxulub impactor (~10 km diameter, 66 million years ago) triggered the Cretaceous-Paleogene (K-Pg) mass extinction, wiping out ~75% of all species including non-avian dinosaurs. It released energy equivalent to billions of nuclear bombs, causing global wildfires, a "nuclear winter" (dust blocking sunlight), and ecosystem collapse.
- Tunguska Event (1908, Siberia): A ~50–80 m asteroid/comet fragment exploded mid-air, flattening 2,000 km² of forest — equivalent to a major nuclear detonation.
- Chelyabinsk (2013): A ~20 m object released 500 kilotons of energy, injuring 1,500 people in Russia.

Current Assessment:
NASA's Planetary Defense Coordination Office (PDCO) tracks ~2,300 PHAs. Objects >1 km can cause regional-to-global catastrophe. The probability of a civilisation-ending impact in any given century is assessed at <0.1%, but the consequence magnitude justifies serious planetary defence investment. The Torino Scale (0–10) quantifies impact risk.

Planetary Defence Strategies Developed:

1. Detection and Early Warning:
- NASA's Spaceguard Survey: Has catalogued >95% of near-Earth asteroids larger than 1 km.
- Next Generation Survey: NASA's NEO Surveyor space telescope (launch planned 2026) will survey smaller (>140 m) PHAs.
- ESA's Space Situational Awareness (SSA) Programme.

2. Kinetic Impactor (Active Deflection):
- DART Mission (Double Asteroid Redirection Test, NASA, 2022): Successfully impacted Dimorphos (moonlet of Didymos, ~160 m diameter), altering its orbital period by 33 minutes — first successful demonstration of planetary defence.

3. ESA's Hera Mission (2024 launch):
- Follow-up to DART; will characterise the Dimorphos impact crater, enabling calibration of kinetic impactor models for future missions.

4. Gravitational Tractor:
- A spacecraft hovering near an asteroid over years can use mutual gravitational attraction to slowly alter the asteroid's trajectory — suitable for long-lead-time threats.

5. Nuclear Deflection:
- For short-warning scenarios, a nuclear device detonated near (not on) an asteroid could vaporise surface material, generating thrust to deflect it. Debated due to treaty implications (Outer Space Treaty 1967).

6. Laser Ablation and Ion Beam Shepherd:
- Theoretical: concentrated laser energy or ion beams ablate surface material, generating thrust.

India's Contribution:
ISRO's tracking facilities and the proposed next-generation observatories contribute to the global NEO detection network.

Conclusion: While a civilisation-ending asteroid impact in our lifetime is unlikely, it is not impossible — and uniquely among existential risks, it is entirely preventable with sufficient warning and technology. DART's success demonstrates that planetary defence has moved from science fiction to operational capability.`,
    sources: [
      { name: "NASA Planetary Defense Coordination Office", chapter: "NEO Overview" },
      { name: "DART Mission — NASA", chapter: "Mission Results 2022" },
      { name: "ESA Space Situational Awareness", chapter: "Hera Mission" },
    ],
  },

  {
    _id: "mains_gs3_2024_06",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Science & Technology",
    topic: "Electronic Toll Collection",
    subTopic: "FASTag Technology",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "What is the technology being employed for electronic toll collection on highways? What are its advantages and limitations? What are the proposed changes that will make this process seamless? Would this transition carry any potential hazards?",
    keyPoints: [
      "FASTag: RFID-based passive tag; 915 MHz frequency; NPCI managed",
      "Advantages: reduced congestion, fuel savings, digital audit trail, faster collection",
      "Limitations: non-FASTag vehicles, tag malfunction, scanner issues, exemption misuse",
      "GPS-based tolling (GNSS): proposed — distance-based, no toll booths, OBU device",
      "Hazards: data privacy, cybersecurity, rural digital divide, OBU cost",
    ],
    idealAnswer: `Technology Employed — FASTag (RFID-based):
FASTag uses Radio Frequency Identification (RFID) technology operating at 915 MHz (UHF band). A passive RFID tag affixed to the vehicle's windscreen is read by overhead scanners at toll plazas. The tag is linked to a prepaid/bank account; the toll amount is automatically deducted and the boom barrier lifts. NPCI's National Electronic Toll Collection (NETC) platform processes transactions. FASTag became mandatory for all vehicles in India from February 2021.

Advantages:
- Reduced Congestion: Vehicles pass without stopping (dedicated FASTag lanes), reducing average toll plaza delay from 8 minutes to ~47 seconds.
- Fuel Savings: NHAI estimates ₹20,000+ crore annual fuel savings from reduced idling.
- Digital Audit Trail: Reduces revenue leakage and corruption at toll booths.
- Data for Traffic Management: Transaction data enables real-time traffic analytics.

Limitations:
- Non-FASTag Vehicles: Despite mandatory status, a significant percentage still use cash lanes (double toll charged but evasion occurs).
- Technical Failures: Tag delamination, scanner malfunctions, and poor RFID signal in multi-vehicle pileups.
- Exemption Abuse: Vehicles claiming emergency/exemption status to evade toll.
- Server Downtime: Backend NETC platform outages cause chaos at toll plazas.
- Financial Exclusion: Not all rural users have bank accounts linked to FASTag.

Proposed Change — GNSS-Based (GPS) Tolling:
India is piloting a Global Navigation Satellite System (GNSS)-based tolling system where an On-Board Unit (OBU) device tracks vehicle movement via GPS/GNSS. Toll is charged based on actual distance travelled on national highways — no physical toll booths needed ("free-flow tolling"). Pilot underway on NH-275 (Bangalore-Mysore) and NH-58 (Delhi-Haridwar).

This enables distance-based, equitable charging eliminating all gantry congestion.

Potential Hazards of Transition:
1. Data Privacy: Continuous vehicle location tracking creates a mass surveillance infrastructure — requires robust data protection law.
2. Cybersecurity: GNSS spoofing and OBU hacking could enable toll evasion or location data theft.
3. Rural Digital Divide: OBU device installation costs (₹3,000–5,000) and technical literacy requirements create barriers for small transporters.
4. Enforcement Challenges: Detecting GNSS-disabled OBUs requires complementary camera-based enforcement.

Conclusion: GNSS tolling represents a generational upgrade in road revenue management, but its success depends on strong data governance, affordable OBU rollout, and robust cybersecurity frameworks.`,
    sources: [
      { name: "NHAI FASTag Portal", chapter: "Technology Overview" },
      { name: "MoRTH — GNSS Tolling Pilot", chapter: "Policy Documents" },
    ],
  },

  {
    _id: "mains_gs3_2024_07",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Science & Technology",
    topic: "Intellectual Property Rights",
    subTopic: "IPR and Life Sciences",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "What is the present world scenario of intellectual property rights with respect to life materials? Although India is second in the world to file patents, still only a few have been commercialized. Explain the reasons behind this less commercialization.",
    keyPoints: [
      "TRIPS Agreement: patents on life forms (microorganisms, genetically modified organisms)",
      "Biodiversity and biopiracy concerns: CBD, Nagoya Protocol",
      "India: Section 3(j) of Patents Act — no patent on plants/animals; Section 3(d) — anti-evergreening",
      "India patent filing: WIPO data; high filings, low commercialisation",
      "Reasons for low commercialisation: TRL gap, funding, industry-academia disconnect, regulatory hurdles, patent thickets",
    ],
    idealAnswer: `Global IPR Scenario on Life Materials:
The TRIPS Agreement (1994) under WTO mandated patent protection for microorganisms and non-biological processes, opening life sciences to IPR. Key global trends include:
- Gene Patenting: CRISPR-Cas9 (Cas9 gene editing) has been the subject of fierce patent battles between MIT/Harvard Broad Institute and UC Berkeley.
- Biodiversity and Biopiracy: The Convention on Biological Diversity (CBD) and Nagoya Protocol (2010) address Access and Benefit Sharing (ABS) — ensuring that genetic resources are accessed with prior informed consent and benefits shared with source communities.
- Plant Varieties: UPOV Convention protects plant breeders' rights globally.

India's Position on Life Material Patents:
India's Patents Act (1970, amended 2005) has protective provisions:
- Section 3(j): Excludes plants, animals, and essentially biological processes from patentability.
- Section 3(d): Prohibits patents on new forms of known substances unless significantly enhanced efficacy — the anti-evergreening provision upheld in Novartis v. Union of India (2013).

India and Patent Filing vs. Commercialisation:
India files ~80,000+ patents annually (second globally in filing growth by residents per WIPO), yet patent commercialisation rates are among the lowest globally (estimated <5% of granted patents generate commercial returns).

Reasons for Low Commercialisation:

1. Technology Readiness Level (TRL) Gap: Most university/public sector patents are at TRL 1–3 (basic research), far from market-ready TRL 7–9. Industry requires proven prototypes.

2. Inadequate Industry-Academia Linkages: Research institutions (IITs, CSIR) operate independently of market demand signals. Technology Transfer Offices (TTOs) are nascent.

3. Funding Gaps: No dedicated venture capital ecosystem for deep-tech/life sciences patent commercialisation; seed funding for proof-of-concept is scarce.

4. Regulatory Hurdles: Drug/biotech patents face CDSCO approval timelines of 3–5+ years, discouraging commercialisation investment.

5. Patent Thickets: In pharma/biotech, overlapping patent claims by MNCs create barriers for Indian inventors seeking to commercialise without expensive licensing.

6. Low Awareness Among Inventors: Many researchers patent without a commercialisation strategy; patents lapse due to non-payment of renewal fees.

7. Risk Aversion in Industry: Indian industry prefers licensed foreign technology over untested domestic innovations.

Conclusion: Bridging India's patent-to-market gap requires dedicated TTOs at institutions, ANRF-linked commercialisation funds, regulatory fast-tracking for priority innovations, and structured industry-academia partnerships — as envisioned in the National IPR Policy 2016.`,
    sources: [
      { name: "WIPO Global Innovation Index", chapter: "India Country Profile" },
      { name: "National IPR Policy 2016", chapter: "Commercialisation" },
      { name: "Patents Act 1970 (amended 2005)", chapter: "Section 3" },
    ],
  },

  // ─── ENVIRONMENT & ECOLOGY ────────────────────────────────────────────────

  {
    _id: "mains_gs3_2024_08",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Environment & Ecology",
    topic: "Water Resources",
    subTopic: "Freshwater Crisis — Alternative Technologies",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "The world is facing an acute shortage of clean and safe freshwater. What are the alternative technologies which can solve this crisis? Briefly discuss any three such technologies citing their key merits and demerits.",
    keyPoints: [
      "Global freshwater crisis: 2 billion lack safe water (WHO); water stress in 40+ countries",
      "Technology 1: Desalination (RO/MSF) — merits: large scale; demerits: energy intensive, brine disposal",
      "Technology 2: Atmospheric Water Generation (AWG) — merits: decentralised; demerits: humidity-dependent, energy use",
      "Technology 3: Wastewater Recycling/Water Reuse — merits: circular economy; demerits: public perception, treatment cost",
      "Other options: fog collection, solar distillation, nanofiltration",
    ],
    idealAnswer: `Introduction: The global freshwater crisis is acute — over 2 billion people lack access to safely managed drinking water (WHO/UNICEF 2023), and 4 billion face severe water scarcity for at least one month per year. Climate change, population growth, and agricultural overuse are intensifying the crisis. Alternative technologies beyond conventional surface/groundwater extraction are essential.

Technology 1: Desalination

Process: Removes salt from seawater or brackish water. Two primary methods:
- Reverse Osmosis (RO): Seawater forced through semi-permeable membranes under pressure. (~70% of global desalination capacity)
- Multi-Stage Flash (MSF) Distillation: Seawater heated; steam condensed into freshwater. (common in Gulf states)

Merits:
- Large-scale output: Saudi Arabia, UAE, and Israel meet 70–90% of drinking water needs through desalination.
- Tap saline sources (oceans, brackish groundwater) — theoretically limitless.
- Israel's Sorek plant produces water at $0.50/m³ — approaching conventional source costs.

Demerits:
- High Energy Consumption: RO requires 3–10 kWh/m³; carbon footprint is significant unless powered by renewables.
- Brine Discharge: Concentrated salt brine returned to ocean harms marine ecosystems (increased salinity, temperature, oxygen depletion).
- High Capital Cost: Infrastructure-intensive; not easily deployable in landlocked or poor regions.

India's Application: Chennai Metropolitan Water Supply and Sewerage Board operates two desalination plants (100 MLD each) at Nemmeli and Minjur.

Technology 2: Atmospheric Water Generation (AWG)

Process: Extracts water vapour from air through condensation (cooling air below dew point) or hygroscopic materials that adsorb moisture, which is then released as liquid water.

Merits:
- Decentralised: Can function in remote, landlocked areas without access to water bodies.
- No Groundwater Depletion: Accesses the ~12,900 km³ of water vapour in the atmosphere.
- Emerging Low-Cost Solutions: WARKA Tower (Ethiopia), SOURCE Hydropanels using solar energy for AWG.

Demerits:
- Humidity-Dependent: Output drops significantly in arid regions (<30% relative humidity) — precisely where water stress is highest.
- Energy Intensive: Refrigeration-based AWG consumes 0.3–1 litre water per kWh of electricity.
- Limited Scale: Current AWG units produce 20–5,000 litres/day — insufficient for agricultural or large municipal use.

Technology 3: Wastewater Recycling and Reuse (Water Reclamation)

Process: Treating municipal wastewater or industrial effluent to potable or non-potable standards for reuse. Includes:
- Indirect Potable Reuse (IPR): Treated water discharged to aquifers/reservoirs, blended with natural water before re-abstraction.
- Direct Potable Reuse (DPR): Highly treated water fed directly into drinking water system.
- Non-Potable Reuse: Irrigation, industrial cooling, toilet flushing.

Merits:
- Circular Water Economy: Converts a waste stream into a resource; reduces pressure on freshwater sources.
- Singapore's NEWater: Produces ultra-pure recycled water meeting WHO standards; meets 40% of Singapore's water needs.
- Economic: Lower cost than desalination (~$0.30–0.50/m³ for IPR).

Demerits:
- Public Perception (Yuck Factor): Psychological resistance to drinking recycled wastewater; requires public education.
- Trace Contaminants: Pharmaceuticals, microplastics, and emerging contaminants require advanced treatment.
- Infrastructure Investment: Requires dual piping systems for non-potable reuse.

India Application: Bengaluru's STPs recycle treated water for lake recharge and industry; AMRUT 2.0 mandates wastewater recycling.

Conclusion: No single technology will resolve the global water crisis. A portfolio approach — context-specific deployment of desalination for coastal areas, AWG for remote communities, and wastewater recycling for water-stressed cities — combined with demand management and conservation, offers the most viable path.`,
    sources: [
      { name: "WHO/UNICEF Joint Monitoring Programme — Water 2023", chapter: "Global Access" },
      { name: "NITI Aayog — Composite Water Management Index", chapter: "Technology Options" },
      { name: "Singapore PUB — NEWater", chapter: "Programme Overview" },
    ],
  },

  {
    _id: "mains_gs3_2024_09",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Environment & Ecology",
    topic: "Environmental Governance",
    subTopic: "Environmental NGOs and EIA",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "What role do Environmental NGOs and activists play in influencing Environmental Impact Assessment (EIA) outcomes for major projects in India? Cite four examples with all important details.",
    keyPoints: [
      "EIA process: notification 2006, public hearing, expert appraisal committee",
      "NGO roles: public hearing participation, PIL, scientific critique, community mobilisation",
      "Example 1: Vedanta Niyamgiri (Odisha) — Dongria Kondh, Supreme Court 2013",
      "Example 2: Save Aarey movement (Mumbai metro car shed)",
      "Example 3: Sterlite Copper (Thoothukudi) — community protests leading to closure",
      "Example 4: Ken-Betwa river link — environmental groups challenging clearance",
    ],
    idealAnswer: `Role of Environmental NGOs and Activists in EIA:
The EIA Notification 2006 mandates public hearings as a mandatory component of environmental clearance for Category A and B projects. This creates a legal space for NGOs, local communities, and activists to engage with and influence project outcomes.

Key Roles:
1. Public Hearing Participation: Submitting expert scientific objections and representing communities whose voices might otherwise be excluded.
2. Judicial Intervention (PILs): Using Public Interest Litigation to challenge inadequate EIAs or clearances granted without due process.
3. Scientific Counter-Analysis: Commissioning independent environmental assessments to challenge project proponents' EIA reports.
4. Community Mobilisation: Organising affected communities (especially indigenous peoples) to assert rights under Forest Rights Act and PESA.
5. Media Advocacy: Publicising environmental and social impacts to generate public pressure.

Four Key Examples:

Example 1 — Vedanta Niyamgiri Mine (Odisha, 2013):
Vedanta Resources sought to mine bauxite in Niyamgiri Hills, sacred to the Dongria Kondh tribe. NGOs (Survival International, Amnesty) supported the Dongria Kondh's legal battle. The Supreme Court (2013) ruled that gram sabhas of 12 villages must decide through a democratic vote — all 12 rejected the mine. The forest clearance was denied. This established the precedent of FPIC (Free, Prior, Informed Consent) for forest-dwelling communities in EIA.

Example 2 — Save Aarey Campaign (Mumbai, 2019–2022):
Mumbai Metro Rail Corporation's plan to build a metro car shed in Aarey Colony (urban forest, home to leopards) triggered mass protests by activists and NGOs. The Bombay High Court upheld the clearance initially. The new Maharashtra government (2022) shifted the car shed to Kanjurmarg following sustained civil society pressure — protecting ~800 acres of urban forest.

Example 3 — Sterlite Copper, Thoothukudi (Tamil Nadu, 2018):
Sterlite Industries (Vedanta) sought to expand its copper smelter. Years of community protests over air and water pollution (supported by local NGOs) culminated in a police firing killing 13 protesters in May 2018. The Tamil Nadu government ordered the plant's closure. NGO documentation of pollution data was central to establishing environmental violations.

Example 4 — Ken-Betwa River Interlinking Project:
Environmental groups (WWF India, local NGOs) have challenged the environmental clearance for India's first river-interlinking project, citing submergence of ~10,000 hectares of Panna Tiger Reserve's buffer zone and core areas. They conducted independent biodiversity assessments; the National Board for Wildlife and Forest Advisory Committee clearances face ongoing judicial scrutiny.

Conclusion: Environmental NGOs function as essential checks on the EIA process — not as project-blockers but as accountability mechanisms ensuring that environmental and social costs are honestly assessed. Strengthening EIA public consultations while preventing their capture by vested interests is essential for balanced development.`,
    sources: [
      { name: "EIA Notification 2006", chapter: "MoEFCC" },
      { name: "Supreme Court — Niyamgiri Case 2013", chapter: "Judgment" },
      { name: "MoEFCC — Forest Clearances Database", chapter: "Project Database" },
    ],
  },

  {
    _id: "mains_gs3_2024_10",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Environment & Ecology",
    topic: "Water Pollution",
    subTopic: "Industrial River Pollution",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "Industrial pollution of river water is a significant environmental issue in India. Discuss the various mitigation measures to deal with this problem and also the government's initiatives in this regard.",
    keyPoints: [
      "Major polluters: textile (dyes), tanneries, paper mills, pharma (Patancheru), sugar mills",
      "Mitigation: CETPsAnd ETPs, ZLD (Zero Liquid Discharge), green chemistry",
      "Government initiatives: CPCB effluent standards, National Mission for Clean Ganga, MARPOL equivalent",
      "Namami Gange: STP construction, CETP for industries, real-time monitoring (OCEMS)",
      "CPCB's Online Continuous Effluent Monitoring System (OCEMS) for 17 heavily polluting industries",
    ],
    idealAnswer: `Introduction: Industrial effluents are a major source of river pollution in India. The Ganga, Yamuna, Godavari, and Cauvery carry significant industrial load — heavy metals (chromium, mercury), BOD from organic waste, dyes, and toxic chemicals — threatening aquatic ecosystems and public health.

Key Industrial Polluters:
- Textile (dyeing and bleaching): Major BOD and colour load — Tiruppur (Noyyal river), Surat (Tapi river).
- Leather Tanneries: Hexavalent chromium — Kanpur's Ganga pollution.
- Pharmaceutical Industry: Patancheru (Hyderabad) — antibiotics in groundwater affecting global antimicrobial resistance.
- Paper and Pulp Mills: BOD, chlorinated compounds — rivers in UP, Odisha.
- Sugar Mills: High BOD from molasses, bagasse — seasonal pollution in UP.

Mitigation Measures:

Technical Measures:
1. Common Effluent Treatment Plants (CETPs): Shared facilities for clusters of small industries unable to afford individual ETPs. ~350 CETPs operational across India.
2. Effluent Treatment Plants (ETPs): Mandatory for 17 categories of heavily polluting industries under Environment Protection Act 1986.
3. Zero Liquid Discharge (ZLD): Technology mandating complete internal recycling — no effluent released to water bodies. Mandatory for textile industries in Tamil Nadu.
4. Green Chemistry: Redesigning industrial processes to eliminate hazardous inputs (e.g., chrome-free tanning using plant-based tannins).
5. Phytoremediation: Using wetland plants (Phragmites, water hyacinth management) to absorb pollutants from effluent.

Regulatory Measures:
1. CPCB Effluent Standards: Industry-specific standards under Schedule I of Environment Protection Rules 1986.
2. Online Continuous Effluent Monitoring System (OCEMS): Real-time effluent monitoring for 17 categories of heavily polluting industries; data transmitted to CPCB servers.
3. Extended Producer Responsibility (EPR): Chemical waste tracking from generation to disposal.

Government Initiatives:

Namami Gange Programme (2015, outlay ₹20,000 crore):
- Industrial Effluent Management: Real-time monitoring of tanneries and textile units in Ganga basin; closure of non-compliant units.
- CETPs funded for leather clusters (Kanpur) and textile clusters.
- 180+ STPs under construction/commissioned to intercept sewage before it reaches the Ganga.

CPCB's Heavily Polluting Industries (HPI) Monitoring:
- 17 categories of HPIs (sugar, textile, cement, thermal power, etc.) mandated for OCEMS.
- District-level enforcement through State Pollution Control Boards.

National Water Quality Monitoring Programme:
- CPCB monitors 2,500+ water quality stations on 521 rivers — data informs enforcement action.

Conclusion: Tackling industrial river pollution requires the triple approach of technology (ZLD, CETPs), regulation (OCEMS, strict enforcement), and economic instruments (pollution tax, green credit). Sustainable compliance is achieved only when pollution control becomes economically rational for industry.`,
    sources: [
      { name: "CPCB — Annual Report on Water Quality", chapter: "Industrial Effluents" },
      { name: "National Mission for Clean Ganga", chapter: "Progress Report" },
      { name: "MoEFCC — Environment Protection Act 1986", chapter: "Schedule I — Effluent Standards" },
    ],
  },

  // ─── ECONOMY ─────────────────────────────────────────────────────────────

  {
    _id: "mains_gs3_2024_11",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Agriculture",
    subTopic: "Buffer Stocks",
    marks: 15,
    directive: "Elucidate / Discuss",
    wordLimit: 150,
    questionText:
      "Elucidate the importance of buffer stocks for stabilizing agricultural prices in India. What are the challenges associated with the storage of buffer stocks? Discuss.",
    keyPoints: [
      "Buffer stock: government-held grain reserve for price stabilisation and food security",
      "FCI, CWC, SWC roles; Minimum Buffer Norms",
      "Importance: price stabilisation, NFSA implementation, export regulation, drought/flood response",
      "Challenges: storage infrastructure deficit, grain wastage, fiscal burden, MSP-procurement distortion, FCI inefficiencies",
      "Reforms: end-to-end computerisation, silo storage, private warehousing (WDRA), DBT linkage",
    ],
    idealAnswer: `Introduction: Buffer stocks are government-maintained reserves of essential foodgrains (primarily wheat and rice) used to stabilise agricultural prices, ensure food security, and manage supply shocks. In India, the Food Corporation of India (FCI) is the primary agency for procurement, storage, and distribution.

Importance of Buffer Stocks for Price Stabilisation:

1. Price Stabilisation Mechanism:
Buffer stocks act as a countercyclical tool — government releases stocks when market prices rise (to increase supply and dampen prices) and procures when prices fall below MSP (to support farmers). This dampens agricultural price volatility, which can be severe due to monsoon-dependency.

2. National Food Security Act (NFSA) 2013 Implementation:
Buffer stocks enable the government to supply subsidised grain to ~81 crore beneficiaries under NFSA's Antyodaya Anna Yojana (AAY) and Priority Households (PHH) scheme — requiring consistent monthly offtake of ~5 kg/person.

3. PM Garib Kalyan Anna Yojana (PMGKAY):
During COVID-19, buffer stocks enabled the free distribution of 5 kg grain/month to ~80 crore beneficiaries for nearly 3 years — a demonstration of buffer stock strategic utility.

4. Export Regulation:
Adequate buffer stocks provide flexibility to regulate grain exports during domestic scarcity without supply disruption.

5. Drought/Flood Response:
Buffer stocks enable rapid deployment of grain to disaster-affected regions, preventing acute food crises.

Buffer Norms: Government maintains Minimum Buffer Norms — e.g., for April 1: 7.46 MT wheat + 11.82 MT rice. Actual stocks often far exceed these norms (e.g., FCI held ~75 MT in 2022 against a norm of ~21 MT).

Challenges in Storage:

1. Storage Infrastructure Deficit:
FCI's covered storage capacity (~75 MT) is often insufficient during peak procurement. The overhang leads to storage of grain in Cover and Plinth (CAP) storage — exposed to moisture, pests, and weather, causing significant quality deterioration.

2. Grain Wastage and Quality Loss:
CAI-NABARD studies estimate 4–5% post-harvest losses in government grain storage — translating to millions of tonnes annually. Rodent, pest, and moisture damage are pervasive.

3. Fiscal Burden — Carrying Costs:
The Economic Cost of foodgrain to FCI (procurement, storage, distribution) significantly exceeds Central Issue Price charged under NFSA, creating a subsidy burden of ~₹2–3 lakh crore annually. Storage, transportation, and interest costs are major components.

4. MSP-Procurement Distortion:
Highly remunerative MSPs incentivise over-procurement of wheat and rice at the expense of pulses and oilseeds, creating nutritional imbalance in buffer stocks and skewing cropping patterns toward water-intensive crops.

5. FCI Operational Inefficiencies:
Decentralised Procurement System (DCP) faces challenges of varying state-level procurement efficiency; FCI's bloated workforce and operational rigidities increase costs.

6. Cold Storage Deficit:
For perishables (potatoes, onions, horticulture), cold chain infrastructure is woefully inadequate — estimated deficit of 35 million MT cold storage capacity vs. availability of ~37 million MT.

Reforms and Way Forward:
- Silo Storage: Steel grain silos (FCI has ~10 MT capacity; needs expansion to 35 MT) preserve quality better than godowns.
- Private Warehousing (WDRA): Warehouse Development and Regulatory Authority enables electronic warehouse receipts for private storage — reduces burden on FCI.
- End-to-End Computerisation: FCI's integrated digital platform for real-time stock tracking.
- Shifting to DBT: Direct Benefit Transfer for food subsidies (piloted in Chandigarh) to reduce physical procurement-distribution chain costs.
- Diversification: Including pulses, millets in buffer stocks to address nutritional and crop diversification goals.

Conclusion: Buffer stocks remain India's insurance against food price volatility and are indispensable for social safety nets. However, their effectiveness is constrained by storage deficits, wastage, and fiscal unsustainability. Modernising storage infrastructure and rationalising the procurement-distribution chain are essential reforms.`,
    sources: [
      { name: "FCI Annual Report", chapter: "Buffer Stock Operations" },
      { name: "Economic Survey", chapter: "Agriculture and Food Management" },
      { name: "CAG Report on FCI", chapter: "Performance Audit" },
    ],
  },

  {
    _id: "mains_gs3_2024_12",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Agriculture — Irrigation",
    subTopic: "Irrigation Challenges and Management",
    marks: 15,
    directive: "Discuss / State",
    wordLimit: 150,
    questionText:
      "What are the major challenges faced by the Indian irrigation system in recent times? State the measures taken by the government for efficient irrigation management.",
    keyPoints: [
      "Gross irrigated area: ~70 million ha; irrigation potential created vs. utilised gap",
      "Challenges: waterlogging and soil salinity, groundwater over-exploitation, inter-state water disputes, CAD infrastructure gap, poor O&M",
      "PMKSY (Har Khet Ko Pani, More Crop Per Drop), AIBP, CADWM",
      "Micro-irrigation: drip and sprinkler — PM-KUSUM for solar pumps",
      "Jal Shakti Abhiyan, Atal Bhujal Yojana for groundwater management",
    ],
    idealAnswer: `Introduction: Irrigation is the lifeline of Indian agriculture — about 52% of gross cropped area (~70 million hectares) is irrigated, supporting the food security of 1.4 billion people. However, the irrigation sector faces deep structural challenges that limit its efficiency and sustainability.

Major Challenges:

1. Gap Between Irrigation Potential Created and Utilised:
India has created an irrigation potential of ~113 million hectares but actually utilises only ~90 million hectares — a 23 million hectare gap attributable to poor command area development and distribution infrastructure.

2. Waterlogging and Soil Salinity:
Poorly designed canal systems and over-irrigation have waterlogged ~8.5 million hectares and salinised ~5.5 million hectares, rendering productive agricultural land barren — especially in the Indus-Gangetic Plain and coastal areas.

3. Groundwater Over-Exploitation:
India is the world's largest extractor of groundwater (~251 BCM/year). Punjab, Haryana, and Rajasthan have "over-exploited" aquifers (extraction >100% of recharge). The Green Revolution's success in these states has come at the cost of long-term groundwater depletion.

4. Inter-State Water Disputes:
Disputes over Cauvery (Karnataka-Tamil Nadu), Krishna (Andhra Pradesh-Telangana), Mahadayi (Goa-Karnataka), and Sutlej-Yamuna Link (Punjab-Haryana) create political bottlenecks delaying irrigation infrastructure completion.

5. Command Area Development (CAD) and Last-Mile Connectivity:
Most canal irrigation systems lack adequate on-farm development — field channels, land levelling, and watercourse construction are incomplete, preventing water from reaching the last farmer in the command area.

6. Poor Operation and Maintenance (O&M):
Canal systems suffer from inadequate maintenance funding, resulting in silted canals, breached embankments, and malfunctioning regulators — reducing irrigation efficiency from potential 60% to actual 30–40%.

7. Low Water Use Efficiency:
Surface irrigation achieves only 35–40% field-level efficiency vs. 75–90% for drip irrigation. Flood irrigation (the dominant method) wastes enormous water volumes.

Government Measures:

1. Pradhan Mantri Krishi Sinchayee Yojana (PMKSY) — 2015:
Umbrella scheme with three components:
- Accelerated Irrigation Benefits Programme (AIBP): Completing 99 major/medium irrigation projects stalled for years; 68 projects completed by 2023.
- Har Khet Ko Pani: Extending irrigation coverage to uncovered districts.
- More Crop Per Drop: Promoting micro-irrigation (drip, sprinkler) — target of 10 million hectares under micro-irrigation.

2. Command Area Development and Water Management (CADWM):
Modernisation of water distribution systems in canal command areas; completion of field channels and farm ponds.

3. PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthan Mahabhiyan):
Solar-powered agricultural pumps for farmers — reducing groundwater extraction through solar energy pricing signals and providing income from surplus solar power sale to grid.

4. Atal Bhujal Yojana (ABY):
Groundwater management in 7 water-stressed states (Gujarat, Haryana, Karnataka, MP, Maharashtra, Rajasthan, UP) using participatory groundwater management approach.

5. Jal Shakti Abhiyan — Catch the Rain:
Community-level rainwater harvesting and groundwater recharge campaigns to replenish depleted aquifers.

6. River Interlinking:
Ken-Betwa Link (first approved interlinking project) aims to transfer surplus Betwa water to water-deficit Ken basin — addressing regional water imbalances.

Conclusion: Efficient irrigation management in India requires not just more infrastructure but smarter water use — achieving more crop per drop through micro-irrigation, pricing reforms, participatory irrigation management, and groundwater governance. Technology (remote sensing for soil moisture, IoT-based flow measurement) and institutional reform (farmer water user associations) are equally essential.`,
    sources: [
      { name: "PMKSY Annual Report", chapter: "Progress Report" },
      { name: "CWC — Water and Related Statistics", chapter: "Irrigation Data" },
      { name: "NITI Aayog — Water Security", chapter: "Composite Water Management Index" },
    ],
  },

  {
    _id: "mains_gs3_2024_13",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Infrastructure",
    subTopic: "Regional Air Connectivity — UDAN Scheme",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "What is the need for expanding the regional air connectivity in India? In this context, discuss the government's UDAN Scheme and its achievements.",
    keyPoints: [
      "India's aviation paradox: 3rd largest market globally; 90% traffic concentrated in top 10 airports",
      "UDAN (Ude Desh ka Aam Naagrik): RCS scheme, 2016; viability gap funding model",
      "Routes: 500+ operational; airports: 70 underserved airports activated",
      "Capped fares: ₹2,500 for 1-hour flight",
      "Achievements: tier 2/3 city connectivity, tourism boost, cargo, seaplanes, helicopter routes",
      "Challenges: airline viability, airport infrastructure, cancellation rate",
    ],
    idealAnswer: `Introduction: India is the world's third-largest domestic aviation market by passengers (~150 million domestic passengers in 2023). However, over 90% of air traffic is concentrated in 10 major airports while ~450 airstrips remain underutilised. This paradox reflects India's unmet regional connectivity potential.

Need for Expanding Regional Air Connectivity:

1. Geographic Diversity and Distance: India's vast geography makes air travel the only practical option for reaching remote areas (Northeast states, Andaman & Nicobar, Lakshadweep, Jammu & Kashmir, tribal hinterlands).

2. Economic Development of Tier 2/3 Cities: Air connectivity catalyses investment, tourism, and skilled labour mobility — cities like Shirdi, Deoghar, and Rupsi (Assam) have seen tourism surge post-UDAN activation.

3. Reducing Travel Time and Cost: Road/rail connectivity in hilly and remote terrain is time-prohibitive. Air connectivity provides time-sensitive economic links.

4. Inclusive Growth: Air travel has historically been accessible only to the affluent. Affordable regional flights democratise mobility.

5. COVID-19 Lesson: During the pandemic, regional air connectivity was critical for medical supply chains and evacuation — demonstrating its strategic importance beyond economics.

UDAN (Ude Desh ka Aam Naagrik) Scheme — 2016:

Objective: Make air travel affordable and widespread, activating unserved and underserved airports.

Mechanism — Viability Gap Funding (VGF):
Airlines bidding for UDAN routes propose a VGF requirement per seat. The Central Government (80%) and State Governments (20%) provide VGF to make routes commercially viable. In return, airlines must offer a minimum number of seats at capped fares (₹2,500 for ~1-hour flight).

Features:
- Route Types: Covers fixed-wing aircraft, helicopters (UDAN 2.0), seaplanes (UDAN 4.0), and international regional routes.
- Selected Routes: Routes connecting tier 2/3 cities with major hubs and with each other.
- Airport Development: AAI develops/upgrades underserved airports under the scheme.

Achievements:

Connectivity:
- 500+ routes operationalised under UDAN (as of 2023–24).
- 70+ underserved airports/airstrips activated (Rupsi-Assam, Deoghar-Jharkhand, Kalaburagi-Karnataka among new entrants).
- Connectivity extended to Northeast (9 states), J&K, Andaman & Nicobar.

Passenger Traffic:
- ~1 crore passengers have flown on UDAN routes since inception (Ministry of Civil Aviation, 2023).
- Airfare democratisation: cities like Shimla, Kullu now accessible by air at prices competitive with AC train travel.

Tourism and Economy:
- Shirdi, Dholpur, Kishangarh (Ajmer) saw tourist arrivals multiply post-UDAN activation.
- Cargo UDAN: Agricultural produce from remote areas (flowers from Northeast, fish from coastal districts) airlifted to markets.

Seaplanes:
- UDAN 4.0 launched seaplane services — Statue of Unity (Gujarat) seaplane route operational.

Challenges:
- Airline Viability: Several operators (Air Odisha, Turbo Megha) withdrew due to operational losses; high aircraft leasing costs undermine UDAN economics.
- Airport Infrastructure: Many activated airports lack instrument landing systems, night landing capability, and terminal capacity.
- High Cancellation Rate: UDAN routes have above-average cancellation rates due to small aircraft operating in difficult weather.
- ATF Taxation: High Aviation Turbine Fuel taxes (some states levy VAT at 25–30%) increase operating costs, necessitating higher VGF.

Conclusion: UDAN has been transformative in expanding India's aviation map and demonstrating political commitment to regional connectivity. Sustaining and deepening its impact requires stable airline partnerships, airport infrastructure upgradation, ATF tax rationalisation, and integration with multimodal transport hubs.`,
    sources: [
      { name: "Ministry of Civil Aviation — UDAN Progress Report", chapter: "Annual Data" },
      { name: "AAI — Airport Connectivity Data", chapter: "UDAN Routes" },
      { name: "Economic Survey", chapter: "Infrastructure — Aviation" },
    ],
  },

  {
    _id: "mains_gs3_2024_14",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Labour",
    subTopic: "Four Labour Codes — Reform Assessment",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Discuss the merits and demerits of the four 'Labour Codes' in the context of labour market reforms in India. What has been the progress so far in these regards?",
    keyPoints: [
      "Four codes: Code on Wages (2019), Industrial Relations Code (2020), Code on Social Security (2020), OSH Code (2020)",
      "Consolidate 44 central labour laws into 4",
      "Merits: simplification, ease of doing business, coverage of gig workers, floor wage",
      "Demerits: flexibility concerns (hire and fire), weakening of trade unions, rollback of worker protections",
      "Progress: Parliament passed all 4; most states yet to notify rules; implementation pending",
    ],
    idealAnswer: `Introduction: India's labour law framework comprised 44 Central Acts and hundreds of State laws — a labyrinthine system criticised for high compliance costs, overlapping jurisdictions, and perverse incentives (exemptions that kept firms small to avoid labour regulations). The four Labour Codes rationalise this into four comprehensive statutes.

The Four Labour Codes:
1. Code on Wages, 2019 — Consolidates Payment of Wages Act, Minimum Wages Act, Payment of Bonus Act, Equal Remuneration Act.
2. Industrial Relations Code, 2020 — Consolidates Trade Unions Act, Industrial Disputes Act, Industrial Employment (Standing Orders) Act.
3. Code on Social Security, 2020 — Consolidates EPF, ESIC, Gratuity, Maternity Benefit, and Building Construction Workers Acts.
4. Occupational Safety, Health and Working Conditions (OSH) Code, 2020 — Consolidates 13 Acts including Factories Act, Mines Act, Contract Labour Act.

Merits:

1. Simplification and Consolidation: Reducing 44 Acts to 4 significantly reduces compliance burden; a single registration portal, unified inspection (Inspector-cum-Facilitator), and unified returns.

2. Floor Wage: National Floor Wage concept (Code on Wages) ensures no state can set minimum wage below a nationally determined floor — protecting the most vulnerable workers.

3. Gig and Platform Worker Coverage: Code on Social Security for the first time extends social security benefits (accident insurance, health insurance) to gig workers and platform workers (Ola, Swiggy, Zomato drivers) — covering ~7.7 million gig workers.

4. Ease of Doing Business: Simplified compliance enables firms to scale without being penalised by compliance costs — potentially reducing the "smallness trap" (firms deliberately staying below headcount thresholds to avoid labour laws).

5. Fixed-Term Employment: Legitimises fixed-term contracts with same benefits as permanent workers — provides employers flexibility without precluding worker protections.

6. Universal Social Security Portability: Unified social security framework enables workers to carry benefits across sectors and states.

Demerits / Concerns:

1. Hire and Fire Flexibility — Weakening Worker Protections:
Industrial Relations Code raises the threshold for prior government permission before retrenchment/closure from 100 to 300 workers. Critics argue this removes security for a large proportion of factory workers; union approval for strikes becomes harder.

2. Weakening Trade Union Rights:
IR Code requires at least 51% of workers to recognise a trade union (from a lower threshold) — making unionisation harder in large, fragmented workforces. Right to strike is procedurally constrained.

3. Threshold Exclusions:
OSH Code applies only to establishments with 10+ workers (factories) — leaving the vast majority of India's MSMEs and informal sector outside its purview.

4. Outsourcing Complexity:
Despite consolidation, contract labour, inter-state migrant workers, and sub-contracting supply chains remain complexly regulated.

5. State-Level Implementation Gaps:
Labour is a Concurrent List subject; states must frame their own rules under the Codes. Most states have not yet notified rules — creating a legislative-implementation gap.

Progress:
- All four Codes were passed by Parliament (2019–2020).
- Rules notified by the Central Government; most states have drafted but not fully notified state-specific rules.
- Implementation remains pending nationally as of 2024 — partially due to trade union opposition (national trade union federations called for review) and COVID-19 disruption.
- Several states (Gujarat, UP) had temporarily suspended some labour laws during COVID-19 — foreshadowing Code-style flexibility.

Conclusion: The Labour Codes represent India's most significant labour reform in decades — potentially beneficial for formalisation, gig worker coverage, and ease of doing business. However, the devil lies in implementation: state-specific rules, enforcement machinery, and social security fund adequacy will determine whether workers gain or lose from the transition.`,
    sources: [
      { name: "Ministry of Labour & Employment — Labour Codes", chapter: "Official Text & Rules" },
      { name: "Economic Survey", chapter: "Labour Market Reforms" },
      { name: "ILO — India Labour Overview", chapter: "Labour Regulation" },
    ],
  },

  {
    _id: "mains_gs3_2024_15",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Agriculture",
    subTopic: "Millets and Food Security",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "Explain the role of millets for ensuring health and nutritional security in India.",
    keyPoints: [
      "IYoM 2023: International Year of Millets declared at India's initiative",
      "Types: sorghum (jowar), pearl millet (bajra), finger millet (ragi), foxtail, barnyard, kodo, little, proso",
      "Nutritional profile: high fibre, iron, calcium, zinc, protein; low glycaemic index",
      "Health benefits: diabetes management, anaemia prevention, bone health",
      "Climate-smart: drought-resistant, low water/input requirement",
      "Policy: PM-POSHAN (MDM), NFSA inclusion, PLI for food processing",
    ],
    idealAnswer: `Introduction: India's International Year of Millets 2023 (declared at India's initiative at the UN) drew global attention to what Indian agriculture has cultivated for 5,000 years. Millets — a group of small-seeded grasses including sorghum (jowar), pearl millet (bajra), finger millet (ragi), and several minor millets — are powerhouses of nutrition and climate resilience.

Nutritional Profile:
- Iron: Finger millet (ragi) contains 3.9 mg iron/100g — higher than most cereals; critical for India's anaemia burden (57% of women, 67% of children anaemic, NFHS-5).
- Calcium: Ragi has 364 mg calcium/100g — nearly 10 times that of rice; vital for bone health and prevention of osteoporosis.
- Protein: Sorghum provides 10.4g protein/100g with a balanced amino acid profile.
- Dietary Fibre: High fibre content supports gut health and cardiovascular health.
- Low Glycaemic Index (GI): Pearl millet and sorghum have GI of 50–55 (vs. rice at 64–72) — ideal for India's 77 million diabetics (2nd globally).
- Zinc and Magnesium: Support immune function and metabolic processes.
- Gluten-Free: Safe for the growing population with gluten intolerance/celiac disease.

Role in Health and Nutritional Security:

1. Addressing Anaemia: Ragi-based weaning foods and school meal integration can address the iron deficiency anaemia crisis in children and women.

2. Diabetes Management: Low GI millets as dietary staples can reduce postprandial blood sugar spikes — critical as India faces a "diabetes epidemic" (IDF data).

3. Child Nutrition: PM-POSHAN (formerly Mid-Day Meal Scheme) inclusion of millets in school meals improves micronutrient intake of 12+ crore children.

4. Tribal and Rural Food Security: Millets are traditional staples for tribal communities in Odisha, Chhattisgarh, Jharkhand, and Northeast — their revival supports culturally appropriate nutrition.

5. Climate-Smart Nutrition: Millets require 70–80% less water than rice and thrive in poor soils with minimal inputs. In a climate-changed future with erratic monsoons, millets secure nutrition even when paddy and wheat fail.

Government Policy Support:
- Procurement under MSP and inclusion in PDS/NFSA in some states (Chhattisgarh's Millets Mission).
- PLI Scheme for Food Processing: Incentivising millet-based product manufacturing (biscuits, noodles, flour) for mainstream market adoption.
- NITI Aayog's Millet Mission: Demand creation through branding "Nutri-Cereals" and international market development.
- IIMR (Indian Institute of Millets Research, Hyderabad): R&D on high-yielding, nutritionally enhanced millet varieties.

Conclusion: Millets offer India a rare convergence of nutritional security, agricultural sustainability, and climate resilience. Their mainstreaming — from farm to table and PDS to premium food products — is essential for addressing India's twin burdens of undernutrition and lifestyle diseases.`,
    sources: [
      { name: "NITI Aayog — Millets Mission Report", chapter: "Nutri-Cereals" },
      { name: "ICRISAT — Millet Nutritional Data", chapter: "Crop Profiles" },
      { name: "NFHS-5", chapter: "Nutritional Status" },
    ],
  },

  {
    _id: "mains_gs3_2024_16",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Agriculture — Land Reforms",
    subTopic: "Land Reforms — Success Factors",
    marks: 10,
    directive: "Elaborate",
    wordLimit: 100,
    questionText:
      "What were the factors responsible for the successful implementation of land reforms in some parts of the country? Elaborate.",
    keyPoints: [
      "Successful states: Kerala, West Bengal (Operation Barga), Jammu & Kashmir",
      "Political will: left governments, land-to-tiller ideology",
      "Operation Barga (1978–81, WB): recording of sharecroppers; 1.5 million recorded",
      "Kerala land reforms: 1969 Kerala Land Reforms Act; ceilings, distribution",
      "Factors: strong political will, land records digitisation, grassroots mobilisation, judicial support",
      "Contrast: UP, Bihar — zamindari abolition but not ceiling reforms; land records corruption",
    ],
    idealAnswer: `Introduction: Land reforms in India — encompassing abolition of intermediaries (zamindars), tenancy reforms, land ceiling legislation, and redistribution — were constitutionally mandated (9th Schedule protection) but unevenly implemented. Kerala, West Bengal, and Jammu & Kashmir stand out as relative successes.

Factors Responsible for Successful Land Reforms:

1. Strong Political Will and Ideological Commitment:
In Kerala (1957, 1969 Land Reforms Acts under CPI/M governments) and West Bengal (1977 onwards under Left Front), the ruling parties had ideological commitment to land redistribution. Without political will to confront landlord interests, reforms remained on paper.

2. Grassroots Mobilisation and Peasant Organisation:
Kerala's strong kisan sabhas (peasant unions) and West Bengal's CPI(M)-affiliated Kisan Sabhas educated and mobilised landless labourers and tenants to assert rights. In states without organised peasant movements, beneficiaries were unaware of or unable to claim their rights.

3. Effective Administrative Machinery:
West Bengal's Operation Barga (1978–1981): A door-to-door campaign by government officials and party workers to register sharecroppers (bargadars) under the Bargadars Temporary Regulation Act 1947 — avoiding lengthy litigation. Result: ~1.5 million sharecroppers registered, securing 25% crop share legally.

4. Land Records Modernisation:
Success in recording tenant rights required accurate, tamper-resistant land records. West Bengal's Bhumi Samskar (land records reform) and Kerala's updated Record of Rights maintained reliable cadastral data — preventing landlord manipulation of records.

5. Judicial Support:
Supreme Court's upholding of land ceiling laws under 9th Schedule protection (despite compensation disputes) provided legal certainty. State High Courts in Kerala and West Bengal generally supported reform implementation.

6. Linkage with Agricultural Development:
West Bengal's post-Barga settlement saw a 52% increase in paddy productivity (Banerjee, Gertler, Ghatak study) — demonstrating that tenure security motivates investment. This success validated the reform, creating political support for its continuation.

7. Integration with Credit and Input Access:
Beneficiaries who received land were also linked to institutional credit (cooperative banks), seeds, and fertiliser — making the redistribution economically viable, unlike states where land was given but supporting services were absent.

8. Contrast — Factors for Failure in Other States:
In Bihar and UP, zamindari abolition nominally succeeded but ceiling implementation failed because: (i) landlords used benami transactions and family partitions to circumvent ceiling laws; (ii) land records were corrupt; (iii) political parties were aligned with landlord interests; (iv) tenants lacked documentation to claim rights.

J&K Success: The 1950 Big Landed Estates Abolition Act (under Sheikh Abdullah) redistributed ~450,000 acres — driven by strong leadership and the political context of State accession.

Conclusion: The success of land reforms depended less on the quality of legislation and more on the political economy of implementation — specifically, the alignment of government, party organisation, administrative machinery, and peasant mobilisation in service of reform. These lessons remain relevant as India grapples with contemporary land rights issues for tribals and urban poor.`,
    sources: [
      { name: "Planning Commission — Land Reforms in India", chapter: "State-Wise Review" },
      { name: "Banerjee, Gertler & Ghatak — Operation Barga Study", chapter: "Economic Research" },
      { name: "NCERT History — Class VIII", chapter: "Land Reforms" },
    ],
  },

  {
    _id: "mains_gs3_2024_17",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Monetary Policy",
    subTopic: "Food Inflation and RBI Policy",
    marks: 10,
    directive: "Discuss / Comment",
    wordLimit: 100,
    questionText:
      "What are the causes of persistent high food inflation in India? Comment on the effectiveness of the monetary policy of the RBI to control this type of inflation.",
    keyPoints: [
      "Food inflation drivers: supply-side (monsoon failure, vegetable price spikes, tomato/onion crises), structural (logistics, APMC, MSP)",
      "CPI weight: food & beverages = 45.86% of CPI basket",
      "RBI's inflation target: 4% ±2% (Flexible Inflation Targeting framework, 2016)",
      "Monetary policy limitations: cannot address supply-side inflation; repo rate hikes don't grow more tomatoes",
      "Supply-side solutions: better cold chain, agri-market reforms, crop insurance",
    ],
    idealAnswer: `Causes of Persistent High Food Inflation in India:

Supply-Side Factors (Dominant):
1. Monsoon Variability and Climate Shocks: Erratic rainfall causes crop damage, reducing supply of vegetables, cereals, and pulses. The 2023 tomato price crisis (₹200+/kg) was directly linked to excess rains in Andhra Pradesh and Karnataka.
2. Perishability and Cold Chain Deficit: India loses 15–30% of perishable produce post-harvest due to inadequate cold storage and logistics — supply reduction driving price spikes.
3. Fragmented APMC Markets: Agricultural Produce Market Committee (APMC) mandis create cartelised intermediation, adding 50–80% to farm-gate prices by the time produce reaches consumers.
4. MSP-Driven Crop Concentration: High MSPs for wheat and rice encourage their cultivation at the expense of pulses, oilseeds, and vegetables — creating structural shortages in non-MSP crops.
5. Input Cost Pass-Through: Rising fertiliser, diesel, and labour costs raise farm production costs, transmitted to food prices.
6. Global Commodity Prices: Edible oil (India imports ~60% of consumption) prices track global palm oil markets (influenced by Indonesia/Malaysia policies).

Demand-Side Factors:
- Rising incomes increase demand for protein-rich foods (eggs, chicken, dairy) — pushing up prices.
- Increasing ethanol blending demand for sugarcane/maize reduces food supply.

CPI Weight: Food and beverages constitute 45.86% of India's CPI basket — making food price volatility decisive for headline inflation.

RBI's Monetary Policy — Effectiveness Assessment:

Framework: Since 2016, India operates a Flexible Inflation Targeting (FIT) framework — RBI targets CPI inflation at 4% (±2% tolerance band). The Monetary Policy Committee (MPC) uses the repo rate as the primary instrument.

Effectiveness Limitations for Food Inflation:
1. Supply-Side Nature: Food inflation in India is predominantly supply-side — a drought, flood, or pest attack causes prices to rise regardless of interest rates. Raising the repo rate does not produce more tomatoes or pulses.
2. Rural-Urban Transmission Gap: Monetary policy transmission to rural credit markets is weak — farmers' borrowing costs are not significantly affected by repo rate changes in the short run.
3. Collateral Damage: Higher interest rates, while potentially damping demand-pull components of inflation, also raise borrowing costs for businesses — slowing investment and growth without addressing the supply-side root cause.
4. Core vs. Food Inflation Distinction: RBI's tools more effectively address core inflation (services, manufactured goods) where demand management is relevant.

When Monetary Policy Helps:
- Second-round effects: if food inflation spills over into wages and services (wage-price spiral), tighter monetary policy can contain generalisation of inflation — the "credibility effect."
- Exchange rate: higher rates attract capital, strengthening the rupee and reducing import costs for edible oils and pulses.

Conclusion: RBI's monetary policy is a necessary but insufficient tool for food inflation. The primary solutions are supply-side: cold chain infrastructure, APMC reform (e-NAM), crop diversification incentives, and targeted buffer stock releases. RBI should focus on containing second-round inflationary effects while supply-side reforms address the root cause.`,
    sources: [
      { name: "RBI Monetary Policy Report", chapter: "Inflation Analysis" },
      { name: "Economic Survey", chapter: "Prices and Inflation" },
      { name: "MOSPI — CPI Weightage", chapter: "Base Year 2012" },
    ],
  },

  {
    _id: "mains_gs3_2024_18",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Economy",
    topic: "Social Sector Expenditure",
    subTopic: "Public Expenditure and Inclusive Growth",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "Examine the pattern and trend of public expenditure on social services in the post-reform period in India. To what extent has this been in consonance with achieving the objective of inclusive growth?",
    keyPoints: [
      "Social services: education, health, housing, social protection, water supply",
      "Trend: increased in absolute terms; as % of GDP fluctuated; 2022-23 at ~7.3% of GDP",
      "Inclusive growth: decline in poverty (5.13% HCR 2019 UNDP); HDI improvements",
      "Challenges: low per capita spend, quality gaps, urban bias, scheme leakages",
      "SDG alignment: goals 1, 3, 4, 6, 10",
    ],
    idealAnswer: `Introduction: Post-1991 reforms introduced fiscal compression — social sector spending as a share of GDP declined in the 1990s. However, the 2000s and especially the MNREGA era (2005+) saw a reversal, with social sector spending rising as a policy priority.

Pattern and Trend of Public Expenditure on Social Services:

Absolute Increase: Combined Centre+State social sector expenditure has grown from ~₹3 lakh crore (2005-06) to ~₹20 lakh crore (2022-23) in nominal terms — a massive absolute expansion.

As Percentage of GDP:
- 2005-06: ~6% of GDP
- 2013-14: ~7.1% of GDP (NDA/UPA-2 period peak)
- 2022-23: ~7.3% of GDP (2023-24 Budget estimates)

Sector-wise trends:
- Education: Increased from 2.5% to ~4% of GDP; still below 6% recommended by NEP 2020.
- Health: Improved from 1.1% to ~2.1% of GDP post-COVID; target is 2.5% by 2025 (NHP 2017).
- Social Protection: MGNREGA, PM-KISAN, PMAY, PM Garib Kalyan Anna Yojana have substantially increased direct transfers.

Consonance with Inclusive Growth:

Evidence of Progress:
1. Poverty Reduction: India reduced its Multidimensional Poor from 55% (2005-06) to 16.4% (2019-21) per UNDP MPI — attributed partly to targeted social spending (MGNREGA, PDS, PMAY).
2. HDI Improvement: India's HDI rank improved from 132 (2015) to 132 (2022) — limited improvement but significant in absolute terms.
3. Education Outcomes: Gross Enrolment Ratio (primary): near universal. Female literacy improved from 54% (2001) to 70% (2021).
4. Health Outcomes: IMR declined from 58 (2005) to 28 (2022); MMR from 254 to 97/lakh live births.
5. Ayushman Bharat — PM-JAY: Provides ₹5 lakh health cover to 55 crore beneficiaries — largest public health insurance programme globally.

Gaps and Challenges:

1. Quality vs. Quantity: High spending on schools has not always translated to learning outcomes — Annual Status of Education Report (ASER) consistently shows poor foundational literacy and numeracy.
2. Urban Bias: Per capita social expenditure remains lower in rural areas despite reverse need.
3. Scheme Implementation Leakages: JAM (Jan Dhan-Aadhaar-Mobile) trinity has reduced leakages but not eliminated them.
4. Low Per Capita Spend: India's health spending per capita ($73) remains far below China ($535) and even lower-middle-income country averages.
5. Inequality: Despite growth, Gini coefficient worsened; top 10% hold 65% of wealth (Oxfam 2023) — questioning whether growth has been sufficiently inclusive.

Conclusion: Post-reform India has significantly scaled up social sector expenditure, contributing to measurable poverty reduction and human development improvements. However, the quality of expenditure, equity in distribution, and pace relative to targets (SDGs, NEP) remain areas for improvement. Inclusive growth requires not just more spending but smarter, outcome-oriented spending with strong accountability mechanisms.`,
    sources: [
      { name: "Economic Survey — Social Sector Expenditure", chapter: "Annual Data" },
      { name: "UNDP — Multidimensional Poverty Index India", chapter: "2023 Report" },
      { name: "NITI Aayog — SDG India Index", chapter: "Progress Report" },
    ],
  },

  {
    _id: "mains_gs3_2024_19",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Internal Security",
    topic: "Cyber Security",
    subTopic: "Digital Personal Data Protection Act 2023",
    marks: 10,
    directive: "Describe",
    wordLimit: 100,
    questionText:
      "Describe the context and salient features of the Digital Personal Data Protection Act, 2023.",
    keyPoints: [
      "Context: Puttaswamy judgment 2017; Justice Srikrishna Committee; GDPR influence; data economy growth",
      "Key provisions: Data Principal rights, Data Fiduciary obligations, Consent Managers, Data Protection Board",
      "Significant Data Fiduciaries, cross-border data transfer, children's data",
      "Exemptions: national security, state agencies — concerns raised",
      "Penalties: up to ₹250 crore for breach",
    ],
    idealAnswer: `Context of the DPDP Act, 2023:
The Act was enacted in August 2023, following a decade-long process:
- Justice K.S. Puttaswamy vs Union of India (2017): Supreme Court unanimously declared privacy a fundamental right under Article 21 — creating the constitutional imperative for data protection legislation.
- Justice Srikrishna Committee (2018): Submitted the Personal Data Protection Bill with a comprehensive framework; subsequent Parliamentary Standing Committee review led to extensive revisions.
- Data Economy Growth: India has 750 million+ internet users generating vast personal data — creating commercial and governance imperatives for a data protection framework.
- GDPR Influence: EU's General Data Protection Regulation (2018) established global standards that India's law broadly aligns with, facilitating data transfer partnerships.

Salient Features of the DPDP Act, 2023:

1. Scope: Applies to processing of digital personal data within India, and to processing outside India if it involves offering goods/services to individuals in India.

2. Data Principal Rights (Individual Rights):
- Right to access information about data processing.
- Right to correction and erasure of personal data.
- Right to nominate a representative in case of death/incapacity.
- Right to grievance redressal.

3. Data Fiduciary Obligations (Entity Processing Data):
- Obtain explicit, informed, specific consent before processing.
- Implement reasonable security safeguards.
- Notify the Data Protection Board (DPB) and affected individuals of any data breach.
- Erase data when purpose is fulfilled or consent is withdrawn.
- Appoint Data Protection Officer for Significant Data Fiduciaries (SDFs).

4. Significant Data Fiduciaries (SDFs): Government may designate entities processing large volumes of sensitive data as SDFs — subject to additional obligations including periodic audits, Data Protection Impact Assessments.

5. Children's Data: Verifiable parental consent required for processing data of children (<18 years). Behavioural targeting and tracking of children's data prohibited.

6. Cross-Border Data Transfers: Data may be transferred to countries/territories notified by the Central Government as permissible — replaces blanket data localisation approach of earlier drafts.

7. Data Protection Board of India: Quasi-judicial body to adjudicate complaints and impose penalties. Members appointed by the government.

8. Penalties: Up to ₹250 crore for failure to implement security safeguards; ₹200 crore for breach notification failure.

Concerns and Criticisms:
- Broad government exemptions: Section 17 exempts state agencies from most provisions on national security/public order grounds — criticized as enabling mass surveillance.
- DPB Independence: Board appointed by the government — concerns about regulatory independence.
- Consent fatigue: Heavy reliance on consent mechanism may not adequately protect against dark patterns.

Conclusion: The DPDP Act 2023 establishes India's foundational data rights framework and creates accountability obligations for data handlers. Its implementation will significantly depend on the robustness of DPB enforcement and the nature of exemptions granted to state agencies.`,
    sources: [
      { name: "Digital Personal Data Protection Act 2023", chapter: "Full Text" },
      { name: "Justice Srikrishna Committee Report 2018", chapter: "Recommendations" },
      { name: "MeitY — DPDP Explainer", chapter: "Official Overview" },
    ],
  },

  {
    _id: "mains_gs3_2024_20",
    year: 2024,
    paper: "GS Paper 3",
    subject: "Internal Security",
    topic: "Narco-Terrorism",
    subTopic: "Drug-Terror Nexus",
    marks: 10,
    directive: "Explain / Suggest",
    wordLimit: 100,
    questionText:
      "Explain how narcoterrorism has emerged as a serious threat across the country. Suggest suitable measures to counter narcoterrorism.",
    keyPoints: [
      "Definition: narcoterrorism — use of drug trafficking to fund and support terrorist activities",
      "Golden Crescent (Pakistan-Afghanistan-Iran) and Golden Triangle (Myanmar-Laos-Thailand) routes",
      "Punjab-J&K corridor: drone-dropped drugs/arms, ISI-D-Company nexus",
      "Northeast: ULFA, NSCN drug funding",
      "Measures: NCB strengthening, NDPS Act, international cooperation (FATF, UNODC), financial tracking",
    ],
    idealAnswer: `Narcoterrorism — Emergence as a Serious Threat:

Definition: Narcoterrorism refers to the nexus between terrorist organisations and drug trafficking networks, where drug proceeds fund terrorist activities or where terror groups use violence to facilitate drug trade.

Emergence in India:

1. Golden Crescent Connection:
Pakistan, Afghanistan, and Iran form the Golden Crescent — the world's largest opium-producing zone. Smuggling routes from this zone feed through Pakistan into Punjab and J&K. Pakistan's ISI and D-Company have allegedly used drug trafficking to destabilise Punjab — drug money funds Khalistan elements and arms procurement.

2. Drone-Based Smuggling:
Post-2020, drones have been used to simultaneously drop drugs and weapons (AK-47s, pistols, RDX) into Punjab from across the Pakistan border — creating a combined narco-terrorism delivery mechanism. CRPF and BSF have intercepted 300+ drones (2021–2023).

3. Punjab Drug Crisis:
Punjab's estimated 2.3 lakh drug addicts (AIIMS survey) reflect the scale of narco-penetration. Drug money has funded local criminal networks with terrorist linkages.

4. Northeast India:
Myanmar's Wa State — part of the Golden Triangle — produces amphetamines and heroin smuggled through Mizoram and Manipur. Insurgent groups (NSCN factions, Meitei groups) are alleged to fund operations through narco-trafficking.

5. Coastal Narcotics:
Gujarat coast and Kerala have seen large heroin seizures (500 kg+ in single operations) linked to international trafficking networks with terrorist financing implications.

Suggested Measures:

1. Strengthening NCB (Narcotics Control Bureau):
Enhance NCB's intelligence capacity, inter-state coordination cells, and dedicated narco-terrorism units with powers analogous to NIA.

2. NIA-NCB Joint Operations:
Formal Joint Task Forces combining NIA's terrorism investigation expertise with NCB's drug enforcement — to prosecute narco-terrorism as a unified crime.

3. Anti-Drone Technology at Borders:
Deploy counter-drone systems (DRDO-developed anti-drone systems) along Punjab border; integrate with BSF's border surveillance grid.

4. Financial Intelligence and FATF Compliance:
Track drug money through FIU-India (Financial Intelligence Unit) — follow drug proceeds to terrorist financiers. PMLA (Prevention of Money Laundering Act) provisions should be strengthened for narco-proceeds.

5. International Cooperation:
Bilateral treaties with Pakistan, Myanmar (challenging), and Golden Crescent countries; UNODC's SMART programme (Support for Monitoring Afghan Drug Trade); FATF standards on drug financing.

6. Demand Reduction:
Community de-addiction programmes (NDDTCP — National Drug Dependence Treatment Centres), school education programmes, and treatment centres reduce the drug consumer base that funds narco networks.

7. NDPS Act Strengthening:
Close loopholes in the Narcotic Drugs and Psychotropic Substances Act; enhance penalties for narco-financing; enable property attachment for drug-linked terrorism.

Conclusion: Narcoterrorism represents the convergence of India's two most serious security threats — terrorism and organised crime. Countering it requires a multi-agency, multi-domain approach combining border security, financial intelligence, judicial efficiency, and community resilience.`,
    sources: [
      { name: "NCB Annual Report", chapter: "Drug Seizure and Narcoterrorism" },
      { name: "MHA Annual Report", chapter: "Internal Security Threats" },
      { name: "UNODC World Drug Report", chapter: "South Asia" },
    ],
  },
];

export default mainsGS3Data;