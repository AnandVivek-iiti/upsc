/**
 * mainsGS2Data.js
 * UPSC Mains GS Paper 2 — 2024
 *
 * Schema (descriptive / Mains variant):
 * {
 *   _id          : string   — unique identifier
 *   year         : number
 *   paper        : string   — "GS Paper 2"
 *   subject      : string   — broad subject tag
 *   topic        : string   — more specific topic for filter chips
 *   subTopic     : string   — shown as small badge on card
 *   marks        : number   — 10 or 15
 *   questionText : string   — full question as printed
 *   directive    : string   — "Discuss" | "Examine" | "Explain" | etc.
 *   wordLimit    : number   — suggested word limit (marks × 10 as UPSC norm)
 *   idealAnswer  : string   — structured model answer (shown only after user reveals)
 *   keyPoints    : string[] — bullet checklist of must-cover points
 *   sources      : { name, chapter }[]
 * }
 */

const mainsGS2Data = [
  // ─── INTERNATIONAL RELATIONS ─────────────────────────────────────────────

  {
    _id: "mains_gs2_2024_01",
    year: 2024,
    paper: "GS Paper 2",
    subject: "International Relations",
    topic: "India & Neighbourhood",
    subTopic: "Maldives — Maritime Security",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Discuss the geopolitical and geostrategic importance of Maldives for India with a focus on global trade and energy flows. Further also discuss how this relationship affects India's maritime security and regional stability amidst international competition?",
    keyPoints: [
      "Maldives: 1,192 islands, 90,000 sq km EEZ, astride critical SLOC (Sea Lanes of Communication)",
      "~80% of India's trade and energy imports pass through adjacent Indian Ocean waters",
      "SAGAR doctrine: Security and Growth for All in the Region",
      "Neighbourhood First Policy: India's development assistance, EXIM Bank credits",
      "China factor: BRI, Hambantota model, Maldives debt — India's strategic concern",
      "Mohamed Muizzu government (2023): 'India Out' campaign, withdrawal of Indian military",
      "Way forward: comprehensive engagement, infrastructure, people-to-people ties",
    ],
    idealAnswer: `Introduction: The Republic of Maldives — an archipelago of 1,192 coral islands strung across 90,000 sq km of the central Indian Ocean — occupies a position of extraordinary strategic significance for India and the broader global trading system.

Geopolitical and Geostrategic Importance:

1. Control of Sea Lanes of Communication (SLOC): The Eight Degree and Nine Degree Channels between the Maldivian atolls are critical chokepoints through which approximately 80% of India's seaborne trade and energy imports (crude oil from the Gulf) pass. Disruption of these lanes would directly threaten India's economic security.

2. Indian Ocean as India's Strategic Backyard: India's SAGAR (Security and Growth for All in the Region) doctrine envisions a stable, India-friendly Indian Ocean. The Maldives, located ~700 km southwest of Sri Lanka, is integral to India's maritime domain awareness and presence across the central Indian Ocean.

3. Defence and Surveillance: India has historically provided hydrographic surveys, coastal surveillance radar systems, and defence training to the Maldives. Dornier aircraft and helicopters stationed in Malé under bilateral agreements extended India's maritime surveillance range significantly.

4. Tourism and People-to-People Ties: India is among the largest sources of tourists to the Maldives and provides significant medical tourism (Maldivian patients treated in India). These economic and human ties create mutual dependence.

Impact on India's Maritime Security and Regional Stability:

1. Chinese Footprint — Strategic Concern: China's Belt and Road Initiative (BRI) engagement with the Maldives, including a bridge and port projects, has raised concerns about the "string of pearls" strategy — the possibility of Chinese dual-use infrastructure encircling India. The debt distress model (as seen in Hambantota, Sri Lanka) represents a template India monitors carefully.

2. Muizzu Government Complications (2023): President Mohamed Muizzu's electoral campaign ('India Out') and his request for withdrawal of Indian military personnel stationed in the Maldives represents a significant diplomatic challenge. His initial pivot toward China (signing a Free Trade Agreement framework) tested India's Neighbourhood First policy.

3. India's Response — Recalibrated Engagement: India adapted through continued development assistance, economic cooperation (₹400 crore grant, EXIM Bank credit lines), and diplomatic engagement, demonstrating that India's commitment transcends short-term political fluctuations.

4. Regional Stability Implications: A Maldives pulled significantly into China's orbit would compromise India's ability to monitor Chinese naval activity in the central Indian Ocean and would establish a Chinese presence between India's east and west coasts.

Way Forward: India must pursue a multi-dimensional engagement — development partnership (housing, infrastructure, healthcare), people-to-people ties, and consistent respect for Maldivian sovereignty — while maintaining strategic clarity about India's irreplaceable geographic and economic role in Maldivian wellbeing.

Conclusion: The Maldives-India relationship is not optional for either party — geography, economics, and security make them natural partners. Managing Chinese competition without alienating Maldivian sovereignty is India's central diplomatic challenge in the archipelago.`,
    sources: [
      { name: "Ministry of External Affairs — Annual Report", chapter: "Neighbourhood First Policy" },
      { name: "Indian Ocean Regional Association (IORA)", chapter: "Maritime Security" },
    ],
  },

  {
    _id: "mains_gs2_2024_02",
    year: 2024,
    paper: "GS Paper 2",
    subject: "International Relations",
    topic: "International Organisations",
    subTopic: "UN Counter-Terrorism",
    marks: 15,
    directive: "Evaluate",
    wordLimit: 150,
    questionText:
      "Terrorism has become a significant threat to global peace and security. Evaluate the effectiveness of the United Nations Security Council's Counter Terrorism Committee (CTC) and its associated bodies in addressing and mitigating this threat at the international level.",
    keyPoints: [
      "CTC established post-9/11 under UNSC Resolution 1373 (2001)",
      "CTED: Counter-Terrorism Executive Directorate — implementation assessment",
      "UNSCR 1267 Committee: Al-Qaeda/ISIS sanctions list",
      "UNSCR 1540: WMD non-proliferation — preventing terrorist access",
      "Achievements: capacity building, technical assistance, standardised frameworks",
      "Limitations: P5 veto politics, Pakistan/China blocking listings, definitional consensus absent",
      "India's concerns: Pakistan-based groups, listing of Masood Azhar delayed",
    ],
    idealAnswer: `Introduction: The September 11, 2001 attacks transformed the United Nations Security Council's approach to terrorism from episodic condemnation to systematic institutional response. The Counter-Terrorism Committee (CTC), established under UNSCR 1373, became the cornerstone of the multilateral counter-terrorism architecture.

Structure of the UN Counter-Terrorism Architecture:

1. CTC (Counter-Terrorism Committee): Established by UNSCR 1373 (2001), it monitors member states' implementation of counter-terrorism obligations — criminalising terrorist financing, sharing information, and strengthening border controls. All 193 UN member states are obligated to report to the CTC.

2. CTED (Counter-Terrorism Executive Directorate): The CTC's expert arm, which conducts country visits and technical assessments, identifies implementation gaps, and facilitates technical assistance. It has assessed dozens of countries and helped build legal and institutional capacity.

3. UNSCR 1267 Committee (Al-Qaeda/ISIS Sanctions Committee): Maintains a consolidated list of individuals and entities associated with Al-Qaeda, ISIS (Daesh), and associated groups — subjecting them to asset freeze, travel ban, and arms embargo. This is the most operationally significant enforcement mechanism.

4. UNSCR 1540 Committee: Addresses the intersection of terrorism and WMD proliferation — preventing non-state actors from accessing nuclear, chemical, or biological weapons.

Effectiveness — Achievements:

1. Global Standard-Setting: UNSCR 1373 created binding legal obligations for all states to criminalise terrorist financing, freeze terrorist assets, and deny safe haven — establishing a universal counter-terrorism legal framework where none previously existed.

2. Capacity Building: CTED has facilitated technical assistance to over 40 countries in strengthening counter-terrorism legislation, border management, and financial intelligence systems.

3. Sanctions Effectiveness: The 1267 list has disrupted terrorist financing and restricted travel of hundreds of designated individuals. Targeted sanctions have had measurable impact on Al-Qaeda and ISIS operational capacity.

Effectiveness — Limitations:

1. P5 Veto Politics: The UNSC's permanent member veto has consistently been weaponised to block terrorism-related listings. China blocked the listing of Masood Azhar (Jaish-e-Mohammed) as a global terrorist for a decade (2009–2019), despite overwhelming evidence. Russia and China have blocked condemnations of state-sponsored terrorism.

2. Definitional Problem: There is no universally agreed definition of terrorism at the UN level. The inability to distinguish "terrorist" from "freedom fighter" — exploited by states that sponsor terrorism — has hampered comprehensive treaty development.

3. Implementation Gaps: Many states submit counter-terrorism reports that are pro forma rather than substantive. Actual implementation of legal obligations varies enormously.

4. New Threats: Lone-wolf radicalisation, online terrorist propaganda (addressed partially by UNSCR 2354), and use of new financial technologies (cryptocurrency) for terrorist financing outpace the CTC's institutional adaptation.

India's Perspective:
India has consistently advocated for comprehensive action against Pakistan-based terrorist groups (LeT, JeM). The decade-long blocking of Masood Azhar's designation by China remains a symbol of the UNSC's political limitations. India supports the Comprehensive Convention on International Terrorism (CCIT) — a proposal it has championed since 1996 — which remains stalled over definitional disputes.

Conclusion: The UN's counter-terrorism architecture has been moderately effective in standard-setting, capacity building, and financial sanctions. However, its operational effectiveness is severely constrained by great power politics, definitional disagreements, and the inability to act against state-sponsored terrorism. It remains an important, if imperfect, component of the global counter-terrorism toolkit.`,
    sources: [
      { name: "United Nations Security Council — CTED Reports", chapter: "Country Assessments" },
      { name: "Ministry of External Affairs", chapter: "India and Counter-Terrorism" },
    ],
  },

  // ─── GOVERNANCE ──────────────────────────────────────────────────────────

  {
    _id: "mains_gs2_2024_03",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Governance",
    topic: "E-Governance",
    subTopic: "Interactive Service Model",
    marks: 15,
    directive: "Evaluate",
    wordLimit: 150,
    questionText:
      "E-governance is not just about the routine application of digital technology in service delivery process. It is as much about multifarious interactions for ensuring transparency and accountability. In this context, evaluate the role of the \"Interactive Service Model\" of e-governance.",
    keyPoints: [
      "E-governance models: Information, Interaction, Transaction, Transformation (Gartner)",
      "Interactive Service Model (G2C, G2B, G2G interaction): two-way communication",
      "RTI online portals, grievance redress (CPGRAMS), feedback mechanisms",
      "Transparency: PFMS, MGNREGS MIS, Direct Benefit Transfer tracking",
      "Accountability: social audit, community monitoring, open data portals",
      "India examples: MyGov, PM-GATI Shakti, DigiLocker, e-Courts",
      "Challenges: digital divide, data privacy, language barriers",
    ],
    idealAnswer: `Introduction: E-governance has evolved from simply digitising existing services to creating platforms for substantive citizen-government interaction. The Interactive Service Model represents a qualitative advance — moving beyond information dissemination (G2C information portals) toward meaningful two-way engagement that serves accountability and transparency goals.

Understanding the Interactive Service Model:
The Interactive Service Model is the second stage in the Gartner model of e-governance maturity (after the basic Information stage). It enables two-way interactions between government and citizens/businesses — allowing users to query, respond, provide feedback, file grievances, track applications, and participate in decision-making. It encompasses Government-to-Citizen (G2C), Government-to-Business (G2B), and Government-to-Government (G2G) interactions.

Role in Ensuring Transparency:

1. Financial Transparency: The Public Financial Management System (PFMS) tracks Central government funds down to the last mile — citizens and civil society can access spending data in real time, reducing fund diversion. The Direct Benefit Transfer (DBT) system's online tracking enables beneficiaries to monitor their entitlements.

2. Scheme Monitoring: The MGNREGS Management Information System allows anyone to check worker attendance, job cards, and payment status — an unprecedented transparency layer on a program with Rs. 70,000+ crore annual outlay.

3. Open Government Data: data.gov.in — India's open data portal — makes government datasets accessible for research, journalism, and civic scrutiny, enabling external accountability.

4. Procurement Transparency: Government e-Marketplace (GeM) digitises public procurement, reducing corruption through price benchmarking and vendor rating systems visible to all stakeholders.

Role in Ensuring Accountability:

1. Grievance Redress: CPGRAMS (Centralised Public Grievance Redress and Monitoring System) enables citizens to lodge complaints against government departments and track resolution timelines — creating paper trails for departmental accountability.

2. Social Audit Platforms: Digital platforms supporting MGNREGS social audits allow community members to flag malpractices, which are then investigated by independent auditors — embedding grassroots accountability.

3. RTI Online: The RTI Online portal enables citizens to file Right to Information applications and receive responses digitally — dramatically lowering the cost and friction of exercising transparency rights.

4. MyGov Platform: MyGov.in enables citizen participation in policy consultations, feedback on draft rules, and crowdsourcing of government initiatives — a genuine interactive accountability mechanism.

Limitations and Challenges:

1. Digital Divide: The Interactive Service Model presupposes digital literacy and internet access — still unavailable to significant segments of India's population (rural, elderly, poor, women). Benefits are captured disproportionately by digitally literate urban populations.

2. Performative Interaction: Many "interactive" platforms are designed for display rather than genuine responsiveness — grievances logged but not resolved; consultations held but not incorporated into policy.

3. Data Privacy: Two-way digital interaction generates enormous personal data. The absence of a robust data protection framework (though the DPDP Act 2023 is a step forward) raises privacy risks.

4. Language and Accessibility Barriers: Governance portals predominantly operate in English and Hindi, excluding speakers of other languages and persons with disabilities.

Conclusion: The Interactive Service Model represents a genuine advance in the quality of citizen-government relationship — making interactions more transparent, accountable, and participatory. Its full potential will be realised only when combined with digital inclusion initiatives, robust data protection, genuine responsiveness to citizen inputs, and local language accessibility.`,
    sources: [
      { name: "DARPG — e-Governance in India Report", chapter: "Interactive Models" },
      { name: "MeitY Annual Report", chapter: "Digital Governance" },
    ],
  },

  // ─── SOCIAL JUSTICE ──────────────────────────────────────────────────────

  {
    _id: "mains_gs2_2024_04",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Social Justice",
    topic: "Health",
    subTopic: "Public Healthcare & Marketisation",
    marks: 15,
    directive: "Suggest",
    wordLimit: 150,
    questionText:
      "In a crucial domain like the public healthcare system, the Indian State should play a vital role to contain the adverse impact of marketisation of the system. Suggest some measures through which the State can enhance the reach of public healthcare at the grassroots level",
    keyPoints: [
      "Marketisation of healthcare: privatisation, out-of-pocket expenditure (OOP) — India ~62% OOP",
      "Adverse impacts: catastrophic health expenditure, medical impoverishment, access inequality",
      "State's role: regulator, provider, financer, enabler",
      "Measures: Ayushman Bharat (PM-JAY), HWCs, rural health infrastructure, ASHA workers",
      "Regulation: Clinical Establishment Act, drug price control (NPPA), diagnostics regulation",
      "Community health governance: Village Health Sanitation Committees, Jan Aushadhi",
      "Universal Health Coverage (SDG 3.8) goal",
    ],
    idealAnswer: `Introduction: India's healthcare system is characterised by a large, often underfunded public sector and a rapidly growing private sector. With out-of-pocket (OOP) expenditure constituting approximately 62% of total health expenditure (against WHO recommendation of below 15-20%), India ranks among the most privately financed health systems globally — driving millions into poverty annually through catastrophic health expenditure.

Adverse Impacts of Marketisation:
Private healthcare, while delivering quality services to those who can pay, creates access inequalities, aggressive treatment incentives, and price gouging. Studies estimate ~6 crore Indians fall into poverty each year due to healthcare costs. Rural and tribal populations, distant from private facilities and unable to afford private rates, are most vulnerable.

Measures for State to Enhance Grassroots Public Healthcare:

1. Strengthen Primary Health Infrastructure (Ayushman Bharat Health and Wellness Centres): Upgrading 1.5 lakh sub-health centres and primary health centres into Health and Wellness Centres (HWCs) — expanding the scope of services to include non-communicable diseases (diabetes, hypertension, cancer screening), mental health, and reproductive health — brings comprehensive primary care to rural India. Deployment of Community Health Officers (Mid-Level Health Providers) at each HWC addresses the acute rural doctor shortage.

2. PM-JAY (Pradhan Mantri Jan Arogya Yojana): The world's largest government-funded health insurance scheme (covering 55 crore people for ₹5 lakh annual hospitalisation) reduces catastrophic expenditure risk. Expanding coverage and reducing empanelment gaps in rural areas, where most hospitals are government-run, strengthens the scheme's impact.

3. ASHA and ANM Strengthening: Accredited Social Health Activists (ASHAs) are the critical last-mile link. Strengthening ASHA incentives, training, and supervisory support — and enhancing their role in NCDs and mental health — extends the State's healthcare reach to every village.

4. Regulatory Action on Private Sector Prices: The state must regulate private healthcare fees, diagnostic charges, and drug prices through enforcement of the Clinical Establishments (Registration and Regulation) Act, expansion of NPPA's drug price control (essential medicines list), and capping of diagnostic test prices (as Delhi's government has done).

5. Jan Aushadhi Kendras: Expanding the Pradhan Mantri Bharatiya Janaushadhi Pariyojana (generic drug stores) network reduces drug expenditure — generic drugs cost 50-90% less than branded equivalents. Integrating Jan Aushadhi outlets with HWCs ensures rural access.

6. Telemedicine (eSanjeevani): The eSanjeevani telemedicine platform has enabled millions of remote consultations, overcoming specialist shortages in rural areas. Expanding connectivity and digital health literacy makes this a scalable grassroots tool.

7. Community Governance: Village Health Sanitation and Nutrition Committees (VHSNCs) empower communities to monitor local health services, demand accountability, and participate in health planning — embedding demand-side pressure for quality public healthcare.

Conclusion: Containing the adverse effects of healthcare marketisation requires the state to simultaneously strengthen supply (public health infrastructure, workforce), reduce demand-side costs (insurance, generic drugs), regulate the private sector, and empower communities. India's SDG 3.8 commitment (Universal Health Coverage) demands nothing less than a comprehensive, rights-based public health system capable of delivering quality care at the grassroots.`,
    sources: [
      { name: "Ministry of Health and Family Welfare — National Health Policy 2017", chapter: "Universal Health Coverage" },
      { name: "NITI Aayog — Health Index", chapter: "State Health Performance" },
    ],
  },

  {
    _id: "mains_gs2_2024_05",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Governance",
    topic: "Citizen-Centric Governance",
    subTopic: "Citizen Charter",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "The citizen charter has been a landmark initiative in ensuring citizen- centric administration. But it is yet to reach its full potential. Identify the factors hindering the full realization of its promise and suggest measures to overcome them.",
    keyPoints: [
      "Citizen Charter: public commitment on service standards, time limits, grievance redress",
      "Origin: UK (1991, John Major); India adopted 1997 following 5th Pay Commission",
      "Content: vision, mission, services offered, time norms, grievance mechanism",
      "Achievements: set minimum standards, raised awareness, accountability framework",
      "Hindrances: lack of awareness among citizens, no legal enforceability, poor updating, bureaucratic indifference",
      "2nd ARC recommendations: make charters legally binding, link to RTI",
      "Way forward: digital charters, citizen feedback, penalties for violations",
    ],
    idealAnswer: `Introduction: The Citizen Charter, introduced in India in 1997 (following the UK's 1991 model), was a landmark step toward citizen-centric governance — committing public service departments to explicit standards of service, time norms, and grievance mechanisms. However, decades of implementation have revealed a significant gap between charter intent and citizen experience.

Achievements of Citizen Charters:
Citizen Charters have created institutional awareness of service delivery standards, provided citizens with a reference document for expected timelines (e.g., passport issue in 3 days, ration card in 30 days), and introduced the concept of grievance redress as a right. They have been adopted by over 700 central and state government departments.

Factors Hindering Full Realisation:

1. Lack of Legal Enforceability: Citizen Charters in India are voluntary commitments without statutory backing. There is no legal penalty for non-compliance, and citizens cannot seek compensation or judicial remedy for charter violations — fundamentally weakening the accountability mechanism.

2. Limited Citizen Awareness: Most citizens are unaware of the existence or content of Citizen Charters. Charters are rarely prominently displayed in service delivery offices, not translated into local languages, and not proactively communicated.

3. Bureaucratic Indifference: The preparation and maintenance of charters is often treated as a compliance exercise rather than a genuine service commitment. Targets in charters are sometimes set unrealistically high (inviting non-compliance) or unrealistically low (setting a poor standard).

4. Inadequate Consultation: Charters are frequently drafted without meaningful consultation with service recipients — resulting in commitments that are internally convenient rather than citizen-relevant.

5. Poor Monitoring and Updating: Charters are infrequently updated to reflect changed service delivery methods, new digital services, or revised time norms. Monitoring of charter compliance is minimal.

6. Disconnect with Grievance Redress: Even when charters specify grievance redress mechanisms, these are often unresponsive, slow, or purely formal — eroding citizen confidence.

7. No Individual Accountability: When services fail charter commitments, there is typically no individual official accountability — the institutional charter creates no personal responsibility.

Measures to Overcome:

1. Legal Backing (Right to Services Acts): Several states (MP, Bihar, Delhi, Punjab) have enacted Right to Public Services Acts, making service delivery timelines legally binding with monetary compensation for delays. Extending this model nationally — or enacting a Central Right to Services Act — would transform charters from aspirational to enforceable.

2. Citizen Participation in Charter Drafting: Structured consultation with user groups in drafting charters ensures relevance and builds legitimacy.

3. Digital Charters with Real-Time Tracking: Integrating charter commitments with digital service portals (allowing citizens to track application status against promised timelines) makes compliance visible and creates automatic audit trails.

4. Compensation Mechanisms: Automatic compensation for charter violations (as under some state Acts) creates strong institutional incentives for compliance.

5. Annual Citizen Satisfaction Surveys: Independent surveys of service recipients against charter commitments, with results published, create public accountability pressure.

6. 2nd ARC Recommendation Implementation: The Second Administrative Reforms Commission recommended making citizen charters legally binding and linking them to the RTI framework — recommendations still largely unimplemented.

Conclusion: Citizen Charters have the potential to be a powerful accountability instrument. Realising this potential requires the political will to make them legally enforceable, the administrative commitment to genuine compliance, and the civic infrastructure to make citizens aware of and capable of exercising their charter rights.`,
    sources: [
      { name: "2nd Administrative Reforms Commission Report", chapter: "Citizen Centric Administration" },
      { name: "DARPG — Citizen Charter Guidelines", chapter: "Implementation Framework" },
    ],
  },

  // ─── INDIAN POLITY ───────────────────────────────────────────────────────

  {
    _id: "mains_gs2_2024_06",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Constitutional Framework",
    subTopic: "Secularism — India vs USA",
    marks: 15,
    directive: "Discuss",
    wordLimit: 150,
    questionText:
      "Discuss India as a secular state and compare it with the secular principles of the US constitution.",
    keyPoints: [
      "India: 'secular' added by 42nd Amendment 1976; positive/active secularism (sarva dharma samabhav)",
      "Articles 25-28: freedom of religion; Article 15: no discrimination on religion; Article 44: UCC aspiration",
      "Indian secularism: state can regulate religious practices, provide financial support equally to religious institutions",
      "US: strict separation of church and state (First Amendment: Establishment Clause + Free Exercise Clause)",
      "US model: state neutrality — no financial support, no endorsement",
      "India-US distinction: Indian state interferes in religion for reform (Untouchability Abolition); US does not",
      "Criticism of Indian secularism: Uniform Civil Code, religious appeasement charges",
    ],
    idealAnswer: `Introduction: Secularism — the separation of religion and state — takes different institutional forms in different democracies. India and the United States both describe themselves as secular but embody distinct models reflecting their unique historical, social, and constitutional contexts.

India as a Secular State:

The word "secular" was inserted into the Preamble by the 42nd Constitutional Amendment (1976), but the secular spirit pervades the original Constitution. Indian secularism is characterised by:

1. Positive / Active Secularism (Sarva Dharma Samabhav): Unlike strict separationism, the Indian state does not wall itself off from religion. It engages with religion — protecting religious freedom (Articles 25-28), prohibiting religious discrimination (Articles 14-16), and reserving the right to intervene in religious practices for social reform (Hindu Code Bills, abolition of untouchability, temple entry legislation).

2. Articles 25-28: Guarantee freedom of conscience and religion, right to manage religious affairs, freedom from religious instruction in state institutions, and freedom from taxation for religious purposes.

3. State as Reformer: The state can regulate religious practices that are "non-essential" or harmful to social order. The Supreme Court's "essential religious practices" doctrine determines what the state can or cannot regulate.

4. Minority Rights: Special protections for religious minorities (Articles 29-30) — right to establish and administer educational institutions — reflect India's recognition that formal equality may be insufficient for minority protection.

Secular Principles of the US Constitution:

1. First Amendment — Two Clauses: The Establishment Clause ("Congress shall make no law respecting an establishment of religion") prohibits the state from establishing, endorsing, or financially supporting any religion. The Free Exercise Clause prohibits state interference with religious practice. Together, they create a "wall of separation between church and state" (Thomas Jefferson's metaphor).

2. Strict Neutrality: The US state is strictly neutral toward religion — it neither favours nor disfavours religious organisations, cannot fund religious schools (though recent Supreme Court decisions have modified this), and cannot display religious symbols in public spaces.

3. No Religious Oath: Article VI bars religious tests for public office.

Key Distinctions:

| Dimension | India | USA |
|---|---|---|
| Model | Positive / Active secularism | Strict separation |
| State and religion | State may engage with religion for reform | Strict neutrality — state stays out |
| Minority protection | Special constitutional rights for minorities | Non-discrimination; no special rights |
| Religious funding | State funds religious trusts, minority institutions | No state funding of religious bodies |
| Social reform | State can reform religious practices (untouchability) | State cannot regulate religious practice |

Critical Assessment:
Indian secularism has been criticised for inconsistency — the state controls Hindu temples but not mosques and churches; the Uniform Civil Code remains unrealised; electoral mobilisation of religious identity contradicts secular ideals. The US model faces its own tensions — growing "religious freedom" arguments used to justify discrimination, and Supreme Court decisions blurring the church-state wall.

Conclusion: India's secularism is contextually appropriate for a deeply pluralistic society with a history of caste-based religious discrimination — requiring the state to actively reform religion rather than simply ignoring it. The US model reflects a different history where religious liberty was the founding concern. Neither model is universally superior; both are evolving responses to the enduring challenge of governance in religiously plural societies.`,
    sources: [
      { name: "D.D. Basu — Introduction to the Constitution of India", chapter: "Secularism" },
      { name: "NCERT Political Science — Class XI", chapter: "Indian Constitution — Features" },
    ],
  },

  {
    _id: "mains_gs2_2024_07",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Judiciary",
    subTopic: "PIL & Judicial Power",
    marks: 15,
    directive: "Explain",
    wordLimit: 150,
    questionText:
      "Explain the reasons for the growth of PILs in India. As a result of it, has the India supreme court emerged as the most powerful judiciary?",
    keyPoints: [
      "PIL: Public Interest Litigation — locus standi relaxed; any person can file on behalf of public interest",
      "Origins: Justice P.N. Bhagwati and V.R. Krishna Iyer in the 1970s-80s",
      "Reasons: access to justice for the poor, executive inaction, Fundamental Rights enforcement",
      "Landmark PILs: Bandhua Mukti Morcha, MC Mehta (environment), Vishaka (sexual harassment)",
      "Supreme Court's expanded power: suo motu cognisance, structural injunctions, court-appointed committees",
      "Concern: judicial overreach, PIL misuse, democratic accountability questions",
      "Comparison: US (Marbury v. Madison), UK (parliamentary supremacy) — Indian court arguably most activist",
    ],
    idealAnswer: `Introduction: Public Interest Litigation (PIL) has transformed India's Supreme Court from a conventional court of last resort into an institution with sweeping jurisdiction over governance, environment, executive action, and social rights — making it arguably the world's most powerful and activist judiciary.

Reasons for the Growth of PILs:

1. Access to Justice Innovation: Traditional rules of locus standi required that only the directly aggrieved party could approach courts. Justices P.N. Bhagwati and V.R. Krishna Iyer, in the late 1970s and 1980s, relaxed this rule — allowing any citizen, NGO, or even a letter to a judge to constitute a PIL on behalf of persons unable to access courts (bonded labourers, prisoners, the poor).

2. Enforcement of Fundamental Rights: PIL provided a direct mechanism for enforcing the Fundamental Rights (Part III) of groups that face structural disadvantage — the poor, minorities, women, marginalised communities — who cannot afford conventional litigation.

3. Executive and Legislative Inaction: When governments fail to implement constitutional provisions, court orders, or statutory duties (environmental regulations, labour laws), PIL fills the accountability vacuum. The courts have used PILs to compel executive action — from implementing the midday meal scheme to removing encroachments on forest land.

4. A Rights-Conscious Civil Society: The growth of NGOs, environmental activists, legal aid organisations, and a free press created a supply of PIL petitioners who could bring systemic grievances to court.

5. Judicial Entrepreneurship: The Supreme Court actively encouraged PIL by simplifying filing procedures, reducing fees, entertaining informal petitions (postcards, letters), and issuing far-reaching directions.

Landmark PILs and Their Impact:
Bandhua Mukti Morcha (bonded labour) transformed rehabilitation law; MC Mehta cases created environmental jurisprudence and the principle of "polluter pays"; Vishaka v. Rajasthan (1997) established sexual harassment guidelines in workplaces (pre-legislative); PUCL v. Union of India food security cases created the midday meal scheme as a right.

Has the Supreme Court Become the Most Powerful Judiciary?

Arguments in Favour: India's Supreme Court has exercised powers unmatched by any other constitutional court — issuing structural injunctions, appointing court commissioners, monitoring scheme implementation across 29 states, directing legislative enactments, and invalidating constitutional amendments (basic structure doctrine). No comparable court routinely exercises such breadth of jurisdiction.

Concerns — Limits and Critiques:

1. Democratic Accountability: Judicial governance of executive schemes — however well-intentioned — raises questions about separation of powers. Courts lack democratic legitimacy for making policy choices.

2. PIL Misuse: PILs are increasingly filed for publicity ("PIL-tourism"), competitive disadvantage (business rivals), and political interference rather than genuine public interest. The Supreme Court itself has lamented this trend.

3. Implementation Deficit: Court orders without implementation capacity are often symbolic — the gap between judicial direction and ground-level change remains large.

4. Comparative Perspective: While the US Supreme Court established judicial review (Marbury v. Madison, 1803) and can strike down laws, it does not engage in the kind of ongoing executive monitoring that Indian courts do. UK courts, bound by parliamentary supremacy, have far more limited powers. The German Constitutional Court is powerful but more narrowly focused.

Conclusion: India's Supreme Court — through PIL — has genuinely emerged as one of the world's most powerful judiciaries, but this power is exercised in tension with democratic principles. PIL's contribution to social justice has been real but requires calibration — using judicial power to protect rights while restoring appropriate roles to the elected branches.`,
    sources: [
      { name: "P.N. Bhagwati — Judicial Activism and Public Interest Litigation", chapter: "PIL Development" },
      { name: "NCERT Political Science — Class XI", chapter: "Judiciary" },
    ],
  },

  {
    _id: "mains_gs2_2024_08",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Federalism",
    subTopic: "Centre-State Relations",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "What changes has the union government recently introduced in the domain of center- state relations ? Suggest measures to be adopted to build the trust between the center and the states and for strengthening federalism.",
    keyPoints: [
      "Recent changes: Article 370 revocation (J&K), GNCTD Amendment (Delhi governance), All India Services lateral entry controversy",
      "GST Council: cooperative federalism model; compensation disputes",
      "Concerns: centralization tendencies, misuse of Governor's office, discretionary grants",
      "Finance Commission 16th: states' share concerns",
      "Positive: PM-UDAY, Aspirational Districts, cooperative federalism rhetoric",
      "Suggestions: inter-state council activation, NITI Aayog reform, grant conditionality reduction, Governor's role reform",
    ],
    idealAnswer: `Introduction: India's federal system — characterised as "quasi-federal" or "cooperative federal" — has witnessed significant turbulence in Centre-state relations over recent years, with both centralising tendencies and efforts at cooperative governance.

Recent Changes in Centre-State Relations:

1. Article 370 Revocation and J&K Reorganisation (2019): The revocation of Jammu & Kashmir's special status and its bifurcation into two Union Territories represented an unprecedented unilateral exercise of central power over a state, raising constitutional questions about federal principles.

2. Government of National Capital Territory of Delhi (Amendment) Act 2021 and 2023: These amendments transferred significant powers from the elected Delhi government to the Lieutenant Governor — particularly regarding civil services — effectively reducing an elected government's authority over its own administration. The Supreme Court's ruling in favour of the elected government (2023) was partially overridden by legislation.

3. Governor's Office Controversies: Several states (Kerala, Tamil Nadu, Telangana, Punjab, West Bengal) have faced standoffs with Governors who withheld assent to state legislation or delayed acting on state Cabinet decisions — raising questions about constitutional propriety and the misuse of the gubernatorial office as a political instrument.

4. GST Compensation Dispute: The GST transition promised states compensation for revenue losses for 5 years. Disputes over the compensation mechanism and COVID-related borrowings created Centre-state tensions, testing the cooperative federalism model underlying the GST Council.

5. Centralisation of Schemes: The expansion of Centrally Sponsored Schemes (CSS) with rigid conditionalities reduces states' flexibility. The merger of schemes and changes in funding ratios (from 75:25 to 60:40 in several schemes) increased states' fiscal burden.

Positive Developments:
GST Council's functioning as a genuine federal forum; PM-UDAY for electricity discom reform; cooperative federalism in PMGSY (rural roads); Aspirational Districts Programme involving state partnership.

Measures to Build Trust and Strengthen Federalism:

1. Activate the Inter-State Council: The Inter-State Council (Article 263), moribund for years, should be revitalised as a regular platform for Centre-state dialogue on policy, fiscal, and legislative issues.

2. Governor's Role Reform: Clearer constitutional conventions (or statutory guidelines) should govern Governors' conduct — including time limits for giving assent to legislation and constitutional obligations to act on Cabinet advice.

3. Reduce Conditionalities in CSS: Allowing states greater flexibility in implementing centrally funded schemes — while maintaining accountability for outcomes — respects states' local knowledge and governing capacity.

4. Finance Commission Autonomy: Ensuring the Finance Commission operates independently and its recommendations are fully implemented strengthens the predictable fiscal federalism framework.

5. NITI Aayog Reform: Restoring an effective Planning Commission-type body with genuine Centre-state consultation (rather than a Centre-dominated policy body) would restore a federal planning dialogue.

6. Regularise GST Council: Formalise the GST Council's dispute resolution mechanism and honour compensation commitments to build fiscal trust.

Conclusion: Strong federalism is not in tension with national unity — it is its foundation. Building genuine trust requires the Centre to respect constitutional boundaries, honour fiscal commitments, and treat states as genuine partners rather than subordinate units in governance.`,
    sources: [
      { name: "Sarkaria Commission Report", chapter: "Centre-State Relations" },
      { name: "Punchhi Commission Report", chapter: "Federal Architecture" },
      { name: "NCERT Political Science — Class XI", chapter: "Federalism" },
    ],
  },

  {
    _id: "mains_gs2_2024_09",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Fundamental Rights",
    subTopic: "Right to Privacy & DNA Testing",
    marks: 15,
    directive: "Explain",
    wordLimit: 150,
    questionText:
      "Right to privacy is intrinsic to life and personal liberty and is inherently protected under Article 21 of the constitution. Explain. In this reference discuss the law relating to D.N.A. testing of a child in the womb to establish its paternity.",
    keyPoints: [
      "Puttaswamy judgment (2017): Right to Privacy as fundamental right under Article 21",
      "Privacy dimensions: bodily integrity, informational privacy, decisional autonomy",
      "Doctrine of Proportionality: state can limit privacy only for legitimate aim, through law, proportionately",
      "DNA testing of foetus: intersection of privacy, bodily integrity, right of unborn child",
      "Courts' approach: Goutam Kundu (1993) SC — against compulsory blood test for paternity",
      "DNA Technology (Use and Application) Regulation Bill (lapsed) — regulatory framework",
      "Balance: privacy vs. right to know paternity; woman's bodily autonomy central",
    ],
    idealAnswer: `Right to Privacy Under Article 21:

In the landmark nine-judge constitutional bench decision Justice K.S. Puttaswamy v. Union of India (2017), the Supreme Court unanimously held that the right to privacy is a fundamental right intrinsic to life and personal liberty under Article 21. The court overruled its earlier decisions in M.P. Sharma (1954) and Kharak Singh (1963), which had denied privacy's fundamental rights status.

The court identified multiple dimensions of the right to privacy: (i) bodily integrity — the right to control one's own body and its physical autonomy; (ii) informational privacy — the right to control personal information including medical data; (iii) decisional autonomy — freedom to make intimate choices about one's life, relationships, and family. The court further held that privacy is subject to restriction only through a law that pursues a legitimate aim, is necessary (proportionate), and has procedural guarantees.

DNA Testing of a Child in the Womb — Legal Position:

The question of DNA testing of a foetus to establish paternity intersects privacy rights, bodily integrity, reproductive rights, and the rights of the unborn.

1. Pre-Puttaswamy Position — Goutam Kundu v. State of West Bengal (1993): The Supreme Court held that courts cannot compel a party to undergo blood grouping tests for establishing paternity, as it would violate bodily integrity and dignity. The court applied the principle that adverse inference can be drawn from refusal, but compulsion is impermissible.

2. Post-Puttaswamy Framework: DNA testing of a foetus requires: (a) obtaining the mother's consent (since the test requires invasive procedures — amniocentesis or chorionic villus sampling — which carry risks to the pregnant woman and foetus); (b) a court order based on compelling necessity; and (c) balancing the child's right to know its parentage against the mother's right to privacy and bodily integrity.

3. Courts' Evolving Approach: Indian courts have ordered DNA paternity testing in specific circumstances — particularly in maintenance and succession disputes — but have consistently held that: (a) the mother's consent and bodily autonomy are paramount; (b) prenatal DNA testing of a foetus carries particular risks and requires higher justification; (c) the "best interests of the child" is a guiding principle.

4. Regulatory Framework: The DNA Technology (Use and Application) Regulation Bill, introduced in Parliament (2018, lapsed) and reintroduced (2019), sought to regulate DNA profiling for civil and criminal purposes — including paternity testing. Its provisions required consent for civil DNA tests and established a DNA regulatory board. The bill's lapse leaves a regulatory vacuum.

5. Intersecting Rights: The right to know one's biological parentage (important for medical, inheritance, and identity reasons) must be balanced against the mother's reproductive privacy and bodily autonomy. Courts generally accord the mother's right primacy while acknowledging that voluntary DNA testing, with proper consent and regulatory oversight, is permissible.

Conclusion: The right to privacy, as confirmed in Puttaswamy, protects bodily integrity and decisional autonomy — making non-consensual or court-ordered prenatal DNA testing permissible only in the most compelling circumstances and with strict procedural safeguards. India needs a comprehensive DNA regulation law to provide clear, rights-respecting guidance.`,
    sources: [
      { name: "Puttaswamy v. Union of India (2017)", chapter: "Right to Privacy Judgment" },
      { name: "Goutam Kundu v. State of West Bengal (1993)", chapter: "Paternity Testing" },
    ],
  },

  {
    _id: "mains_gs2_2024_10",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Governance",
    topic: "Education",
    subTopic: "Public Examinations Act 2024",
    marks: 15,
    directive: "Examine",
    wordLimit: 150,
    questionText:
      "What are the aims and objectives of recently passed and enforced, The Public Examination (Prevention of Unfair Means) Act, 2024? Whether University/State Education Board examinations, too, are covered under the Act?",
    keyPoints: [
      "Context: NEET-UG 2024 paper leak, UPSC paper controversies — examination integrity crisis",
      "Act passed June 2024; specific public examinations: UPSC, SSC, IBPS, Railway, NTA-conducted exams",
      "Offences: impersonation, paper leak, tampering, using/possessing unfair means",
      "Penalties: 3-10 years imprisonment, Rs. 1 crore fine; for organised crime — 5-10 years, Rs. 1 crore fine",
      "Coverage: Central government examination bodies only — NOT state boards/universities",
      "States must enact their own legislation for their examinations",
      "Significance: fills legal vacuum; deterrence; organised cheating rings targeted",
    ],
    idealAnswer: `Background:
The Public Examinations (Prevention of Unfair Means) Act, 2024 was enacted in the wake of serious examination integrity crises — including the NEET-UG 2024 paper leak controversy (which affected over 2.4 million candidates), allegations in UPSC lateral entry examinations, and persistent concerns about organised cheating in competitive examinations. Prior to this Act, there was no comprehensive central legislation specifically addressing unfair means in public examinations.

Aims and Objectives of the Act:

1. Deterrence through Stringent Penalties: To create a strong deterrent against examination fraud by providing for serious criminal penalties — significantly higher than those available under the Indian Penal Code for ordinary fraud and mischief.

2. Targeting Organised Crime: The Act specifically addresses "organised" examination fraud — recognising that paper leaks and impersonation are increasingly conducted by criminal networks rather than isolated individuals.

3. Protecting Candidate Interests: To protect the legitimate interests of the millions of honest candidates who invest years in preparation and whose futures are compromised by examination fraud.

4. Institutional Integrity: To restore public confidence in examination-conducting bodies, which administer examinations for lakhs of government posts and professional courses.

Key Provisions:
The Act defines specific offences including: impersonation; leaking question papers; accessing question papers without authorisation; tampering with answer sheets; using or possessing electronic devices during examinations; providing solutions via digital means; and creating fake examination centres.

Penalties: For individuals convicted of offences — 3 to 5 years imprisonment and fine up to ₹10 lakh. For "organised" offences (those conducted by networks with criminal intent) — 5 to 10 years imprisonment and fine up to ₹1 crore.

Coverage — Which Examinations Are Covered?
The Act applies specifically to public examinations conducted by bodies established by or under Central Government Acts. The examinations covered include: UPSC examinations, SSC examinations, IBPS examinations, Railway Recruitment Board examinations, and examinations conducted by the NTA (including NEET, JEE, CUET).

University and State Education Board Examinations:
The Act explicitly does NOT cover examinations conducted by universities (central or state), autonomous institutions, or State Public Service Commissions/State Education Boards. These are state subjects under the constitutional framework, and the central legislation covers only central government examination bodies.

States must enact their own legislation for their board examinations and state-level competitive examinations. Several states already have anti-cheating laws (Rajasthan, UP, Gujarat), but their provisions and penalties vary considerably.

Significance:
The Act fills a significant legal vacuum — for the first time, examination fraud is treated as a serious cognisable offence at the central level, removing the patchwork of IPC sections previously applied. It signals a policy shift from treating examination malpractice as a minor infraction to treating it as a crime against public interest with serious consequences.

Conclusion: The Act is a significant step toward protecting examination integrity for central government processes, but its limited coverage leaves state examinations — which affect even larger numbers of candidates — dependent on state legislation of varying quality and enforcement.`,
    sources: [
      { name: "Public Examinations (Prevention of Unfair Means) Act 2024", chapter: "Full Text" },
      { name: "Ministry of Education", chapter: "Act Objectives" },
    ],
  },

  // ─── INTERNATIONAL RELATIONS ─────────────────────────────────────────────

  {
    _id: "mains_gs2_2024_11",
    year: 2024,
    paper: "GS Paper 2",
    subject: "International Relations",
    topic: "Central Asia",
    subTopic: "India-CAR Relations",
    marks: 10,
    directive: "Critically Analyze",
    wordLimit: 100,
    questionText:
      "Critically analyze India's evolving diplomatic, economic and strategic relations with the Central Asian Republics (CARs) highlighting their increasing significance in regional and global geopolitics.",
    keyPoints: [
      "CARs: Kazakhstan, Uzbekistan, Tajikistan, Kyrgyzstan, Turkmenistan — landlocked, resource-rich",
      "Strategic importance: energy (oil, gas, uranium), connectivity (INSTC), countering China/Pakistan",
      "India-CAR Summit (2022): ₹200 crore Line of Credit, enhanced connectivity",
      "INSTC (International North-South Transport Corridor): connecting India via Iran and Russia to CARs",
      "Challenges: no direct land access, Pakistan blocking connectivity, China's growing footprint",
      "SCO membership: platform for engagement",
      "Way forward: Chabahar port, INSTC operationalisation, cultural diplomacy",
    ],
    idealAnswer: `India's relations with the five Central Asian Republics (CARs) — Kazakhstan, Uzbekistan, Tajikistan, Kyrgyzstan, and Turkmenistan — have gained strategic salience as the region's geopolitical importance in Eurasian connectivity and resource security grows.

Diplomatic Developments: The India-Central Asia Summit (2022) — the first of its kind — elevated bilateral relations to a new plane. India established Joint Working Groups on trade, connectivity, and security. India maintains embassies in all five capitals and has used the Shanghai Cooperation Organisation (SCO) as a multilateral engagement platform since becoming a full member in 2017.

Economic Relations: The CARs possess vast hydrocarbon reserves (Kazakhstan's Tengiz field, Turkmenistan's gas), uranium (Kazakhstan is the world's largest producer), and rare earths — resources critical for India's energy security and strategic industries. Bilateral trade remains modest (~$2 billion total) — far below potential — due to connectivity challenges.

Strategic Importance: Pakistan's refusal to grant transit access and the absence of direct land connectivity have historically been the central impediment to India-CAR engagement. India's investment in the Chabahar port (Iran) and the International North-South Transport Corridor (INSTC — a multi-modal route connecting Mumbai to Central Asia via Iran and Russia) represents India's strategic work-around. INSTC is projected to reduce freight transit time to CARs by 30-40% compared to traditional routes.

Security Dimension: India and the CARs share concerns about Taliban-controlled Afghanistan, terrorism emanating from Pakistan-based groups, and drug trafficking. Intelligence and defence cooperation has deepened.

Challenges: China's Belt and Road Initiative has made deep inroads in CARs — infrastructure loans, trade agreements, and growing political influence pose a competitive challenge. Russia traditionally considers CARs its sphere of influence, creating navigational complexity.

Conclusion: India-CAR relations are strategically important but constrained by connectivity deficits. Chabahar and INSTC operationalisation are critical near-term priorities.`,
    sources: [
      { name: "MEA — India-Central Asia Relations", chapter: "Bilateral" },
      { name: "IDSA Papers", chapter: "India's Central Asia Policy" },
    ],
  },

  {
    _id: "mains_gs2_2024_12",
    year: 2024,
    paper: "GS Paper 2",
    subject: "International Relations",
    topic: "India-West Relations",
    subTopic: "India as China Alternative",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "\"The West is fostering India as an alternative to reduce dependence on China's supply chain and as a strategic ally to counter China's political and economic dominance.\" Explain this statement with examples.",
    keyPoints: [
      "China+1 strategy: US/EU diversification from China supply chains",
      "India in electronics: Apple (Foxconn, Tata) — 7%+ global iPhone production in India",
      "Semiconductors: India Semiconductor Mission; iCET (India-US Critical & Emerging Technology)",
      "Quad: India-US-Japan-Australia — strategic counterbalance to China in Indo-Pacific",
      "I2U2 (India-Israel-UAE-USA): emerging economic grouping",
      "IPEF (Indo-Pacific Economic Framework): India's partial membership",
      "Tensions: India's strategic autonomy, Russia relations, CAATSA concerns",
    ],
    idealAnswer: `The statement reflects an increasingly explicit Western strategic calculation post-COVID-19 and amid US-China geopolitical competition: reducing dependence on Chinese manufacturing and enlisting India as a democratic counterweight to Chinese regional hegemony.

Supply Chain Diversification — Examples:
Apple's decision to shift iPhone manufacturing to India is the most prominent symbol — Foxconn's Sriperumbudur facility and Tata Electronics' Hosur plant now produce over 7% of global iPhone output, with targets to reach 25% by 2027. Semiconductor companies, electronics manufacturers, and pharmaceutical firms are establishing India operations specifically to reduce China concentration risk — explicitly encouraged by the US CHIPS Act's "friend-shoring" incentives.

The US IRA (Inflation Reduction Act) and CHIPS Act provide massive subsidies for supply chain diversification away from China — explicitly favouring "allied and partner countries" including India.

Strategic Counterbalancing — Examples:
The Quad (India-US-Japan-Australia) is the primary strategic grouping explicitly designed to maintain a "free and open Indo-Pacific" — widely understood as containing Chinese naval expansion. The iCET (Initiative on Critical and Emerging Technology) between India and the US facilitates technology transfers in semiconductors, AI, space, and quantum computing — technology domains where reducing China's advantage is a shared interest.

IPEF (Indo-Pacific Economic Framework) — India's participation (though it opted out of the trade pillar) — signals engagement with the US-led economic architecture for the region.

Limits of the Framework:
India maintains strategic autonomy — continuing to buy Russian oil despite Western pressure (post-Ukraine), avoiding formal alliance commitments, and engaging China economically even while competing strategically. India's "multi-alignment" rather than alignment with the West limits how fully this statement holds.

Conclusion: India is being fostered as both a supply chain alternative and a strategic partner by the West, with concrete developments in manufacturing, technology transfer, and security cooperation — but India's strategic autonomy means this partnership is collaborative rather than subordinate.`,
    sources: [
      { name: "MEA — India-US Strategic Partnership", chapter: "iCET" },
      { name: "NITI Aayog — India Semiconductor Mission", chapter: "FDI Trends" },
    ],
  },

  {
    _id: "mains_gs2_2024_13",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Governance",
    topic: "Civil Services",
    subTopic: "Integrity of Civil Servants",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "The Doctrine of Democratic governance makes it necessary that the public perception of the integrity and commitment of civil servants becomes absolutely positive. Discuss.",
    keyPoints: [
      "Democratic governance: accountability to the people, rule of law, transparency",
      "Civil servants: policy implementation link; their integrity = governance integrity",
      "Public perception matters: trust deficit erodes governance effectiveness",
      "Challenges: corruption perception (India Corruption Perceptions Index ~40/100), red tape, political interference",
      "Positive perception building: conduct rules, asset disclosure, Lokpal, whistleblower protection",
      "Professionalism, ethics training: Foundation Course, mid-career training",
      "Technology: DBT, GeM reducing discretion; building trust through transparency",
    ],
    idealAnswer: `Democratic governance rests on the twin pillars of popular sovereignty and the rule of law — and civil servants are the primary instrument through which democratic decisions are translated into citizen welfare. The Doctrine of Democratic Governance therefore places an absolute premium on the public's perception of civil servants' integrity and commitment.

Why Perception Matters in Democratic Governance:
In a democracy, the legitimacy of the state derives from citizens' trust in its institutions. When citizens perceive civil servants as corrupt, self-serving, or indifferent, this trust collapses — reducing voluntary compliance with laws, undermining tax morale, and delegitimising the political system. Even if actual corruption is limited, the perception of corruption is itself governance-destructive. India's Corruption Perceptions Index score (~40/100) indicates a serious perception problem.

Factors Undermining Positive Perception: Political interference in transfers and postings (destroying the independence needed for integrity); inadequate whistleblower protection (punishing rather than rewarding disclosure); red tape and discretionary powers creating corruption opportunities; inadequate salaries at lower levels; and the culture of impunity (rarely prosecuted officers).

Building Positive Perception:

1. Transparency Mechanisms: Asset declaration (public disclosure of property), conflict of interest recusal, and financial disclosure requirements make integrity visible.

2. Institutional Accountability: The Lokpal and Lokayukta institutions provide independent investigation of corruption allegations. The CVC (Central Vigilance Commission) and CBI require strengthening.

3. Technology-Enabled Governance: Direct Benefit Transfer (DBT), Government e-Marketplace (GeM), and PFMS reduce discretionary human contact in delivery — lowering corruption opportunities and improving perceptions.

4. Training and Ethics Culture: Foundation Course ethics training, mid-career development programs, and 360-degree performance assessment build professional integrity culture.

5. Protection of Honest Officers: Political interference in postings must be curbed; Fixed Tenure arrangements (as recommended by multiple Pay Commissions) for key posts protect honest officers from victimisation.

Conclusion: In a democracy, civil service integrity is not just administratively desirable — it is constitutionally essential. Building and maintaining a genuinely positive public perception of civil servants requires systemic reforms: reducing discretion, ensuring accountability, protecting honest officers, and building an institutional culture where integrity is rewarded rather than penalised.`,
    sources: [
      { name: "2nd ARC Report on Ethics in Governance", chapter: "Civil Service Integrity" },
      { name: "NCERT Political Science — Class XI", chapter: "Civil Services" },
    ],
  },

  // ─── SOCIAL JUSTICE ──────────────────────────────────────────────────────

  {
    _id: "mains_gs2_2024_14",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Social Justice",
    topic: "Poverty & Nutrition",
    subTopic: "Poverty-Malnutrition Cycle",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "Poverty and malnutrition create a vicious cycle, adversely affecting human capital formation. What steps can be taken to break the cycle?",
    keyPoints: [
      "Vicious cycle: poverty → poor nutrition → low cognitive development → poor education → low productivity → poverty",
      "India's nutrition status: NFHS-5 — 35.5% stunted children; 19.3% wasted",
      "Human capital impact: stunting reduces adult productivity by 10-17%",
      "POSHAN Abhiyaan (National Nutrition Mission): 2018",
      "Mid-Day Meal (PM-POSHAN), ICDS (anganwadi), PDS fortification",
      "Cash transfers: PM-KISAN, MGNREGS providing income floor",
      "Women's nutrition: PMMVY (maternity benefit), JanSuraksha — addressing intergenerational cycle",
    ],
    idealAnswer: `The poverty-malnutrition nexus operates as a mutually reinforcing vicious cycle: poor families cannot afford nutritious food, leading to malnutrition, which impairs cognitive and physical development, reducing educational attainment and adult productivity, which perpetuates poverty across generations.

India's Scale: NFHS-5 (2019-21) shows 35.5% of children under 5 are stunted (chronic undernutrition), 19.3% are wasted, and 32.1% are underweight. Research estimates that stunting reduces adult productivity by 10-17%, making malnutrition a direct brake on economic growth.

Steps to Break the Cycle:

1. Nutrition-Specific Interventions: POSHAN Abhiyaan (2018) — the National Nutrition Mission — targets stunting, wasting, underweight, and anaemia with converged delivery through anganwadis, health workers, and schools. PM-POSHAN (mid-day meals in government schools) ensures at least one nutritious meal daily for 120 million children. ICDS (Integrated Child Development Scheme) provides supplementary nutrition, health check-ups, and early childhood development.

2. Income Support: MGNREGS (100 days guaranteed employment), PM-KISAN (₹6,000/year to farmers), and PM-UJJWALA (clean cooking fuel reducing indoor air pollution-linked malnutrition) provide income floors that enable families to purchase nutritious food.

3. Food Fortification: PDS rice and wheat fortification with micronutrients (iron, folic acid, B12) addresses hidden hunger — micronutrient deficiency without caloric deficit.

4. Women-Centred Approaches: Pradhan Mantri Matru Vandana Yojana (PMMVY — maternity benefit) and anaemia reduction programmes for adolescent girls (WIFS — Weekly Iron Folic Acid Supplementation) address the intergenerational transmission of malnutrition through mothers.

5. Convergence and Behaviour Change: Community-based behaviour change communication on feeding practices, sanitation (WASH), and dietary diversity addresses demand-side malnutrition determinants alongside supply interventions.

Conclusion: Breaking the poverty-malnutrition cycle requires simultaneous action on incomes, food access, nutritional quality, women's status, and early childhood development — converged through coordinated government programmes.`,
    sources: [
      { name: "NFHS-5 Report 2019-21", chapter: "Child Nutrition" },
      { name: "POSHAN Abhiyaan — Ministry of WCD", chapter: "Programme Overview" },
    ],
  },

  {
    _id: "mains_gs2_2024_15",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Governance",
    topic: "Civil Society",
    subTopic: "Public Charitable Trusts",
    marks: 10,
    directive: "Comment",
    wordLimit: 100,
    questionText:
      "Public charitable trusts have the potential to make India's development more inclusive as they relate to certain vital public issues. Comment.",
    keyPoints: [
      "Public charitable trusts: legal entities under Indian Trusts Act 1882 and state laws for charitable purposes",
      "Governed by: Charity Commissioners (state-level), Income Tax Act (80G exemptions)",
      "Role in development: education (schools, colleges), healthcare, disaster relief, poverty alleviation",
      "Major trusts: Tata Trusts, Azim Premji Foundation, BAIF, Akshaya Patra",
      "Inclusive potential: reach underserved communities, CSR complement, innovation",
      "Challenges: regulatory gaps, FCRA restrictions, accountability deficits, political misuse",
      "Way forward: better regulation, mandatory annual reporting, tax incentives, foreign funding balance",
    ],
    idealAnswer: `Public charitable trusts — legal entities created for public benefit (education, health, poverty relief, environment) — occupy a critical space between government and market in India's development ecosystem.

Inclusive Development Potential:

Public charitable trusts reach communities and causes that government schemes often miss and private markets cannot profitably serve. Akshaya Patra Trust delivers mid-day meals to 2 million schoolchildren; Tata Trusts fund cancer treatment for the poor; Azim Premji Foundation works on teacher training in remote districts; BAIF Development Research Foundation supports tribal livelihoods. These organisations combine specialised expertise, community trust, and flexible funding in ways that government departments typically cannot.

Trusts can absorb CSR funds (Companies Act 2013 mandates 2% profit CSR for eligible companies) and philanthropic capital, deploying them with greater agility and community accountability than government agencies. They can innovate, pilot, and fail — learning from failure — in ways bureaucratic systems cannot.

Challenges:

1. Regulatory Gaps: Unlike companies, large public trusts lack mandatory financial reporting requirements visible to the public — limiting accountability. The regulatory framework (state Charity Commissioner offices) is fragmented and often under-resourced.

2. FCRA Restrictions: The Foreign Contribution (Regulation) Amendment Act (2020) severely restricted foreign funding to civil society organisations, limiting the operational capacity of many large trusts working in human rights, environment, and governance advocacy.

3. Tax Exemption Misuse: The 80G tax exemption framework has been misused by fraudulent "trusts" that are essentially money-laundering vehicles.

4. Political Interference: Temple and religious trusts face government takeover controversies; politically connected trusts may receive preferential treatment.

Way Forward: Mandatory public filing of annual accounts, standardised impact reporting, a national trust regulatory authority, and balanced FCRA rules that allow genuine foreign philanthropy while preventing foreign political interference would enable trusts to realise their inclusive development potential.`,
    sources: [
      { name: "Ministry of Corporate Affairs — CSR Framework", chapter: "Trusts and CSR" },
      { name: "2nd ARC Report", chapter: "Civil Society in Governance" },
    ],
  },

  {
    _id: "mains_gs2_2024_16",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Local Governance",
    subTopic: "Urban-Rural Body Merger",
    marks: 10,
    directive: "Analyze",
    wordLimit: 100,
    questionText:
      "Analyze the role of local bodies in providing good governance at local level and bring out the pros and cons of merging the rural local bodies with the urban local bodies.",
    keyPoints: [
      "73rd and 74th Amendments: Panchayati Raj and Urban Local Bodies — constitutional status",
      "Functions: 29 subjects (11th Schedule) for PRIs; 18 subjects (12th Schedule) for ULBs",
      "Good governance role: local needs identification, participatory planning, last-mile delivery",
      "Merging debate: peri-urban areas — blurring of rural-urban boundaries",
      "Pros of merger: unified planning, no jurisdiction overlap, resource efficiency",
      "Cons: dilution of rural voice, different service needs, fund absorption issues",
      "Examples: unified city-regional governments in some states",
    ],
    idealAnswer: `Role of Local Bodies in Good Governance:

The 73rd (Panchayati Raj) and 74th (Urban Local Bodies) Constitutional Amendments (1992) created a third tier of government, devolving 29 functions to PRIs and 18 to ULBs. Local bodies are closest to citizens and best positioned to identify local needs — in sanitation, drinking water, local roads, school management, and public health — and deliver services with accountability.

Effective local governance reduces the transaction costs of democracy: citizens can directly hold local representatives accountable, and local governments can customise services to local conditions. Gram Sabhas (village assemblies) and Ward Committees create direct participatory democracy channels absent at state and central levels.

Pros of Merging Rural and Urban Local Bodies:

1. Peri-Urban Reality: India's rapid urbanisation creates vast peri-urban zones that are administratively rural but functionally urban — served by PRIs but requiring urban services (sewerage, mass transit, industrial zoning). Merging institutions could resolve this governance gap.

2. Unified Planning: A single body covering a city-region could plan transport, drainage, land use, and environmental management coherently rather than in fragmented jurisdictions.

3. Resource Efficiency: Consolidated bodies eliminate duplication, reduce administrative overhead, and create larger tax bases for infrastructure investment.

Cons of Merging Rural and Urban Local Bodies:

1. Dilution of Rural Voice: Rural populations — often marginalized and less politically organised — risk having their interests subordinated to urban priorities in merged bodies dominated by urban constituencies.

2. Different Service Needs: Rural areas need agricultural extension, water harvesting, and rural roads; urban areas need sewerage, mass transit, and building regulation. A single institutional framework may struggle to address both effectively.

3. Constitutional Complications: The 73rd and 74th Amendments create separate frameworks — merger would require constitutional amendments.

4. Absorption Capacity: Rural governance capacity is often weaker; merging with resource-rich urban bodies may simply absorb rural areas rather than developing their governance capacity.

Conclusion: Rather than full merger, better spatial planning coordination between urban and peri-urban local bodies — through metropolitan planning committees (Article 243ZE) — may be more appropriate than institutional merger.`,
    sources: [
      { name: "2nd ARC Report on Local Governance", chapter: "Urban-Rural Interface" },
      { name: "NCERT Political Science — Class XI", chapter: "Local Governments" },
    ],
  },

  {
    _id: "mains_gs2_2024_17",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Constitutional Bodies",
    subTopic: "CAG's Role — Propriety vs Legality",
    marks: 10,
    directive: "Comment",
    wordLimit: 100,
    questionText:
      "\"The duty of the Comptroller and Auditor General is not merely to ensure the legality of expenditure but also its propriety.\" Comment.",
    keyPoints: [
      "CAG: Article 148-151 of the Constitution; independent constitutional authority",
      "Mandate: audit of all Union/State government accounts and public sector enterprises",
      "Legality audit: whether expenditure is within law, budget sanction, rules",
      "Propriety audit: whether expenditure is wise, prudent, and in public interest",
      "Propriety standards: 3 tests — avoidance of waste, best value, executive prudence",
      "Landmark CAG reports: 2G spectrum (Rs. 1.76 lakh crore notional loss), Coal block allocation",
      "Tensions: propriety audit vs. executive discretion; CAG's role as parliamentary watchdog",
    ],
    idealAnswer: `The Comptroller and Auditor General (CAG) — established under Articles 148-151 of the Constitution — is the supreme audit institution of India, independent of both the executive and legislature, and serves as Parliament's primary instrument for holding the executive financially accountable.

Legality Audit — The Minimum:
The CAG's conventional function is legality audit: verifying that government expenditure conforms to applicable laws, that budget appropriations authorise the spending, and that financial rules and procedures are followed. This is the audit that prevents technical illegality but says nothing about whether money was well spent.

Propriety Audit — The Higher Standard:
The statement reflects a higher ambition: propriety audit examines whether expenditure represents good value, avoids waste, and is consistent with the prudent management expected of a trustee of public resources. The CAG's propriety standards (derived from the Finance Ministry's General Financial Rules) include: (i) that expenditure is not prima facie more than the occasion demands; (ii) that government funds are not spent for the benefit of a particular party or individual unless required; and (iii) that executive discretion is exercised with judgment and care as expected of a prudent manager of his own affairs.

Landmark Examples:
The CAG's reports on 2G spectrum allocation (2010) — which calculated a notional loss of ~₹1.76 lakh crore from below-market allocation — and Coal Block Allocation (2012) exemplified propriety audit: the expenditure (allocation) was legally within executive discretion, but the CAG judged it improper on grounds of procedural irregularity and failure to extract fair value for public resources.

Tensions:
Propriety audit necessarily involves the CAG making value judgments about executive decisions — raising concerns about separation of powers. The executive argues that discretionary policy choices are beyond audit jurisdiction; the CAG argues that Parliament is entitled to know whether executive discretion was responsibly exercised. The Vinod Rai-era CAG reports generated this constitutional debate acutely.

Conclusion: The CAG's role as parliament's financial watchdog requires both legality and propriety audit. Propriety audit — ensuring taxpayer money is wisely spent — is perhaps more important than legality check in a governance context where formal rules are followed but value destruction occurs through discretionary decisions. Its exercise requires institutional courage and methodological rigour.`,
    sources: [
      { name: "Articles 148-151 of the Constitution", chapter: "CAG Provisions" },
      { name: "CAG Act 1971", chapter: "Audit Mandate" },
    ],
  },

  {
    _id: "mains_gs2_2024_18",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Parliament",
    subTopic: "Cabinet vs Parliamentary Supremacy",
    marks: 10,
    directive: "Explain",
    wordLimit: 100,
    questionText:
      "\"The growth of the cabinet system has practically resulted in the marginalization of parliamentary supremacy.\" Elucidate.",
    keyPoints: [
      "Westminster model: Parliament is supreme; Cabinet collectively responsible to Parliament",
      "Shift in practice: Cabinet dominance — pre-formed decisions, whip system, party discipline",
      "Parliament rubber-stamp concern: bills passed without scrutiny, Question Hour diluted",
      "Anti-defection law (10th Schedule): ensures cabinet/party loyalty over independent judgment",
      "Budget passed without adequate scrutiny in some years",
      "Data: declining sitting days, limited committee references, ordinance promulgation",
      "Reform: stronger parliamentary committees, question hour reforms, reducing money bill misuse",
    ],
    idealAnswer: `The Westminster constitutional model, which India's parliamentary system derives from, vests sovereignty in Parliament — the Cabinet is constitutionally a committee of Parliament, collectively responsible to it, and can govern only so long as it commands the confidence of the Lok Sabha. The constitutional reality, however, is that Cabinet dominance has substantially inverted this relationship.

How Cabinet Dominance Marginalises Parliament:

1. Pre-formed Decisions: The Cabinet, with the support of the ruling party's majority, arrives at Parliament with decisions already made — legislation is presented to Parliament for ratification rather than deliberation. The "whipping" system compels party MPs to vote with the Cabinet regardless of their individual judgment.

2. Anti-Defection Law (10th Schedule): Introduced by the 52nd Amendment (1985), the anti-defection law punishes MPs who vote against party direction with disqualification. While preventing horse-trading, it has effectively converted MPs from independent representatives into party lobby fodder — eliminating any meaningful parliamentary check on the Cabinet.

3. Declining Quality of Parliamentary Scrutiny: Data on parliamentary functioning reveals declining sitting days (Lok Sabha sessions shortened), declining percentage of bills referred to Parliamentary Standing Committees, use of "guillotine" to pass multiple bills without debate at session end, and the increasingly perfunctory character of Question Hour.

4. Ordinance Promulgation: The executive's power to promulgate ordinances (Article 123) — when Parliament is not in session — allows the Cabinet to legislate without parliamentary involvement, subsequently presenting Parliament with a fait accompli.

5. Money Bill Classification: The use of Money Bill classification (Article 110) to bypass the Rajya Sabha — as seen in the Aadhaar Act and Finance Acts — denies the upper house its constitutionally intended deliberative role.

6. Budget Approval: The most significant parliamentary function — controlling the purse — is increasingly reduced to a vote (sometimes using guillotine) rather than genuine scrutiny.

Reform Imperatives: Strengthening Parliamentary Standing Committees (mandatory referral of all legislation), reducing ordinance recourse, creating independent budget analysis capacity (like the UK's OBR), and reforming the anti-defection law to permit conscience votes on non-confidence issues would restore meaningful parliamentary oversight.

Conclusion: Cabinet governance is constitutionally necessary for effective executive action. But the current balance has shifted too far — Parliament has been reduced from a check on executive power to an instrument for legitimising it. Restoring parliamentary supremacy requires institutional, procedural, and cultural reforms.`,
    sources: [
      { name: "NCERT Political Science — Class XI", chapter: "Legislature" },
      { name: "PRS Legislative Research — Parliamentary Data", chapter: "Functioning of Parliament" },
    ],
  },

  {
    _id: "mains_gs2_2024_19",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Judiciary",
    subTopic: "Lok Adalat vs Arbitration",
    marks: 10,
    directive: "Explain / Distinguish",
    wordLimit: 100,
    questionText:
      "Explain and distinguish between Lok Adalats and Arbitration Tribunals. Whether they entertain civil as well as criminal cases?",
    keyPoints: [
      "Lok Adalat: statutory ADR mechanism under Legal Services Authorities Act 1987; no fees, award is final decree",
      "Arbitration: private ADR mechanism under Arbitration and Conciliation Act 1996",
      "Lok Adalat: settlement by conciliation/compromise; no decree if no settlement",
      "Arbitration: binding award by arbitrator(s) regardless of party consent to outcome",
      "Lok Adalat: can entertain motor accident, matrimonial, labour, compoundable offences",
      "Arbitration: primarily commercial/civil disputes; not criminal cases",
      "National Lok Adalat: organised by NALSA; Permanent Lok Adalats under Section 22A",
    ],
    idealAnswer: `Lok Adalats and Arbitration Tribunals are both Alternative Dispute Resolution (ADR) mechanisms that reduce the burden on conventional courts, but they differ significantly in character, legal basis, and jurisdiction.

Lok Adalats:
Established under the Legal Services Authorities Act, 1987, Lok Adalats are statutory ADR forums organised by State and District Legal Services Authorities (under NALSA — National Legal Services Authority). They resolve disputes through conciliation and compromise between parties. Key features: (i) no court fee payable; if settled at Lok Adalat, fees already paid are refunded; (ii) the award has the status of a court decree and is final and binding — no appeal lies; (iii) no award if no settlement — parties revert to court; (iv) proceedings are not adversarial; a conciliator facilitates agreement.

Civil and Criminal Cases in Lok Adalats: Lok Adalats can entertain motor accident claims, matrimonial disputes (excluding divorce), labour disputes, electricity disputes, and compoundable criminal offences. Non-compoundable criminal offences (like murder, rape) CANNOT be settled at Lok Adalats. Permanent Lok Adalats (Section 22A) for public utility services can adjudicate even without a settlement agreement.

Arbitration Tribunals:
Governed by the Arbitration and Conciliation Act, 1996, arbitration is a private dispute resolution mechanism where parties agree to refer their dispute to one or more arbitrators. The arbitral award is binding and enforceable as a court decree. Key features: (i) consensual commencement — requires an arbitration agreement; (ii) arbitrator decides on the merits even without party consensus; (iii) limited grounds for appeal (Section 34); (iv) primarily used for commercial and contractual disputes.

Civil and Criminal in Arbitration: Arbitration primarily covers civil and commercial disputes — contracts, property, company matters. Criminal cases CANNOT be referred to arbitration; criminal law involves the state and public interest, not just private parties.

Key Distinctions:
Lok Adalat requires mutual agreement for a binding award; arbitration binds even without agreement. Lok Adalat is free; arbitration involves costs. Lok Adalat can cover some compoundable criminal matters; arbitration is strictly civil/commercial.`,
    sources: [
      { name: "Legal Services Authorities Act 1987", chapter: "Lok Adalat Provisions" },
      { name: "Arbitration and Conciliation Act 1996", chapter: "Arbitral Process" },
    ],
  },

  {
    _id: "mains_gs2_2024_20",
    year: 2024,
    paper: "GS Paper 2",
    subject: "Indian Polity",
    topic: "Electoral Reforms",
    subTopic: "One Nation One Election",
    marks: 10,
    directive: "Examine",
    wordLimit: 100,
    questionText:
      "Examine the need for electoral reforms as suggested by various committees with particular reference to the one nation-one election principle.",
    keyPoints: [
      "Electoral reform committees: Tarkunde (1975), Dinesh Goswami (1990), Law Commission (170th report), Kovind Committee (2024)",
      "Key reforms recommended: state funding, EVM/VVPAT, same-day polling, criminalization of politics",
      "One Nation One Election: simultaneous Lok Sabha and state assembly elections",
      "Kovind Committee Report (2024): two-phase implementation; constitutional amendments needed",
      "Arguments for: cost reduction, governance efficiency, reduced policy paralysis",
      "Arguments against: federalism concern, voter confusion, advantages to national parties, logistical challenges",
      "Broader electoral reforms: proportional representation debate, campaign finance disclosure",
    ],
    idealAnswer: `Electoral Reforms — Committee Recommendations:

India's electoral reform discourse has been shaped by multiple committees: The Tarkunde Committee (1975) recommended proportional representation and state funding of elections. The Dinesh Goswami Committee (1990) recommended partial state funding, limits on candidate expenditure, and reforms to the Election Commission's powers. The Law Commission's 170th Report (1999) addressed electoral disqualifications and criminalisation. The Election Commission itself has repeatedly recommended anti-defection reform and electoral bond transparency.

Key Reform Areas Highlighted: Criminalisation of politics (44% of MPs in 18th Lok Sabha have declared criminal cases — SC ruling requires candidate disclosure and party justification); campaign finance transparency (electoral bonds controversy); EVM/VVPAT integrity; diaspora voting; and simultaneous elections.

One Nation One Election — Analysis:

The Kovind Committee Report (March 2024) recommended simultaneous elections for Lok Sabha and state assemblies in two phases, with constitutional amendments to the Elections-related articles (Articles 83, 85, 172, 174, 356) and the Representation of the People Act.

Arguments For: Reduces election expenditure (ECI estimates ₹1 lakh crore+ in 2024 elections); ends "permanent election mode" that causes policy paralysis (Model Code of Conduct restricts governance multiple times a year); reduces voter fatigue and improves electoral participation; allows officials and security forces to focus on governance rather than perpetual poll management.

Arguments Against: Undermines federalism — if a state government falls, early elections may be forced or an unelected regime installed; voters may confuse national and state issues, advantaging national parties; logistical complexity of simultaneous elections across India is enormous; forces a fixed 5-year term even for failed governments, reducing democratic accountability.

Constitutional Concerns: Implementing simultaneous elections would require amendments to fundamental provisions on terms of Houses and election timelines — requiring ratification by half the states for some amendments, reflecting their federal significance.

Conclusion: Electoral reforms — campaign finance transparency, criminalisation disqualification, enhanced VVPAT use, and proportional representation debate — are urgently needed. One Nation One Election is a significant idea with real governance benefits but faces serious federalism and constitutional concerns that require broader national consensus before implementation.`,
    sources: [
      { name: "Kovind Committee Report on Simultaneous Elections 2024", chapter: "Recommendations" },
      { name: "Election Commission of India — Annual Report", chapter: "Electoral Reforms" },
    ],
  },
];

export default mainsGS2Data;