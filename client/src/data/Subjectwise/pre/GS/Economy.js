const economyPYQData = [
  {
    _id: "pyq_economy_2026_01",
    year: 2026,
    subject: "Economy",
    topic: "Banking & Financial Inclusion",
    subTopic: "RBI Financial Inclusion Index (FI-Index)",
    styleTag: "institutions_schemes",
    difficulty: "Medium",
    questionText:
      "Which one of the following correctly represents the three key sub-indices of the Financial Inclusion Index (FI-Index) of the Reserve Bank of India (RBI)?",
    options: [
      { id: "A", text: "Access, Usage, Quality" },
      { id: "B", text: "Availability, Affordability, Awareness" },
      { id: "C", text: "Reach, Depth, Sustainability" },
      { id: "D", text: "Coverage, Penetration, Impact" },
    ],
    correctOption: "A",
    explanation:
      "The RBI's Financial Inclusion Index (FI-Index) was launched in August 2021 and is published annually every July. It is a composite index comprising three broad parameters: (1) Access — measuring the availability of financial services such as bank branches, ATMs, BCs per lakh population; (2) Usage — measuring the extent of actual utilisation of banking products like deposits, credit, insurance, pension; and (3) Quality — measuring the consumer protection framework, financial literacy, and grievance redressal. The index has no base year and captures the extent of financial inclusion across 97 indicators across these three dimensions. A score of 100 would indicate complete financial inclusion.",
    sources: [
      {
        name: "RBI Annual Report / FI-Index Press Release",
        chapter: "Financial Inclusion Initiatives",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Banking Sector Reforms & Financial Inclusion",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_02",
    year: 2026,
    subject: "Economy",
    topic: "Financial Markets",
    subTopic: "Sustainable Finance — Sustainability Bonds",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "A bond whose proceeds are used only to finance or refinance a combination of both environmental and social projects is called:",
    options: [
      { id: "A", text: "Green Bond" },
      { id: "B", text: "Social Bond" },
      { id: "C", text: "Sustainability Bond" },
      { id: "D", text: "Sovereign Gold Bond" },
    ],
    correctOption: "C",
    explanation:
      "Under the ICMA (International Capital Market Association) framework for sustainable finance: (1) Green Bonds — proceeds exclusively for environmental projects; (2) Social Bonds — proceeds exclusively for social projects; (3) Sustainability Bonds — proceeds used for a combination of BOTH green (environmental) and social projects; (4) Sustainability-Linked Bonds — proceeds for general purposes but issuer commits to sustainability KPIs. The key distinguishing feature here is the combination of environmental AND social projects, which defines a Sustainability Bond. India's Sovereign Green Bond framework (2023) covers only green projects and thus does not qualify under this category.",
    sources: [
      {
        name: "ICMA Green Bond Principles / SEBI Circular on Green Bonds",
        chapter: "Sustainable Finance Instruments",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Capital Markets & Debt Instruments",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_03",
    year: 2026,
    subject: "Economy",
    topic: "Digital Economy & E-Commerce",
    subTopic: "Dropshipping Business Model",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText:
      "An e-commerce revenue model where the seller has control over pricing but doesn't keep products in stock and instead transfers customer orders and shipment details to a third-party supplier, who then ships the goods directly to the customer, is called:",
    options: [
      { id: "A", text: "Affiliate Marketing" },
      { id: "B", text: "Dropshipping" },
      { id: "C", text: "White Labelling" },
      { id: "D", text: "Marketplace Model" },
    ],
    correctOption: "B",
    explanation:
      "Dropshipping is an e-commerce fulfillment model where the retailer/seller: (a) lists products and controls pricing without holding physical inventory; (b) upon receiving an order, forwards it to a third-party supplier or manufacturer; (c) the supplier ships directly to the end customer. This is distinct from: Affiliate Marketing (seller earns commission but has no pricing control), White Labelling (seller rebrands a manufacturer's product), and the Marketplace Model (platform connects buyers and sellers without involvement in transactions). Dropshipping reduces capital requirements and inventory risk but typically carries lower margins. It is relevant in the context of India's e-commerce policy and ONDC discussions.",
    sources: [
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Digital Economy, E-Commerce & FinTech",
      },
      {
        name: "DPIIT E-Commerce Policy Discussion Paper",
        chapter: "Business Models in Digital Commerce",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_04",
    year: 2026,
    subject: "Economy",
    topic: "MSME & Financial Markets",
    subTopic: "M1xchange — TReDS Platform",
    styleTag: "institutions_schemes",
    difficulty: "Hard",
    questionText:
      "Which of the following statements about M1xchange's role in Micro, Small & Medium Enterprises (MSMEs) financing is/are correct?\n\n1. M1xchange provides collateral based loans to MSMEs.\n2. M1xchange facilitates discounting of invoices and Bills of Exchange for MSMEs.\n3. M1xchange functions as a credit rating agency for MSMEs.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "2 only" },
      { id: "C", text: "1 and 3 only" },
      { id: "D", text: "2 and 3 only" },
    ],
    correctOption: "B",
    explanation:
      "M1xchange is one of the three RBI-licensed TReDS (Trade Receivables Discounting System) platforms in India (others: RXIL and Invoicemart). TReDS is an electronic platform for discounting/factoring of trade receivables (invoices and bills of exchange) of MSMEs. Statement 1 is INCORRECT — M1xchange does NOT provide collateral-based loans; it facilitates invoice discounting without collateral, which is precisely its value proposition for asset-light MSMEs. Statement 2 is CORRECT — M1xchange enables MSMEs to sell their trade receivables (invoices and bills of exchange) to financiers at a discount to get immediate liquidity. Statement 3 is INCORRECT — M1xchange is not a credit rating agency; CRISIL, ICRA, SMERA etc. are credit rating agencies. M1xchange is regulated by RBI under the Payment and Settlement Systems Act.",
    sources: [
      {
        name: "RBI Guidelines on TReDS",
        chapter: "MSME Credit & Payment Infrastructure",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "MSME Sector & Financial Innovation",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_05",
    year: 2026,
    subject: "Economy",
    topic: "Financial Markets",
    subTopic: "Crowdfunding — Alternate Finance",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText:
      "Which of the following statements about Crowdfunding is/are correct?\n\n1. Crowdfunding is solicitation of funds (small amount) from multiple investors through a web-based platform or social networking site for a specific project.\n2. Small and Medium Enterprises (SMEs) are able to raise funds at lower cost of capital without undergoing rigorous procedures.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "2 only" },
      { id: "C", text: "Both 1 and 2" },
      { id: "D", text: "Neither 1 nor 2" },
    ],
    correctOption: "C",
    explanation:
      "Both statements are correct. Crowdfunding is an alternative financing mechanism where small amounts of money are raised from a large number of people, typically via internet/social media platforms, for a specific project, business, or cause. It bypasses traditional intermediaries like banks. Statement 1 correctly defines the mechanism. Statement 2 is also correct — crowdfunding allows SMEs to access capital without the collateral requirements, lengthy due diligence, and regulatory compliance burdens associated with bank credit or capital market issuances, effectively lowering the cost and procedural burden. SEBI had released a Consultation Paper on Crowdfunding in India (2014) recognizing its role in SME financing. Types include reward-based, equity-based, debt-based (P2P lending), and donation-based crowdfunding.",
    sources: [
      {
        name: "SEBI Consultation Paper on Crowdfunding",
        chapter: "Alternative Investment & Fintech Regulation",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Capital Markets & Alternate Finance",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_06",
    year: 2026,
    subject: "Economy",
    topic: "Banking & Financial Sector Reforms",
    subTopic: "Key Financial Sector Committees in India",
    styleTag: "institutions_schemes",
    difficulty: "Hard",
    questionText:
      "With reference to different Committees in India, consider the following details:\n\n| Sl. No. | Committee | Objective | Organization under which it was formed |\n|---|---|---|---|\n| 1. | R.N. Malhotra Committee | Comprehensive reforms of Insurance sector in India | Insurance Regulatory and Development Authority of India |\n| 2. | L.C. Gupta Committee | Preparing a roadmap for the introduction of derivatives trading in India | Securities and Exchange Board of India |\n| 3. | Urjit R. Patel Committee | Preparing a roadmap for reforming bank lending to the Housing sector | Reserve Bank of India |\n| 4. | Y.H. Malegam Committee | Preparing a roadmap for reforms in Microfinance sector in India | Reserve Bank of India |\n\nIn which of the above rows are all the details correctly matched?",
    options: [
      { id: "A", text: "1 and 2 only" },
      { id: "B", text: "2 and 4 only" },
      { id: "C", text: "3 and 4 only" },
      { id: "D", text: "1, 2 and 4 only" },
    ],
    correctOption: "B",
    explanation:
      "Row-by-row analysis: Row 1 — R.N. Malhotra Committee (1993) was set up by the Government of India (Ministry of Finance), NOT IRDAI, to recommend reforms in the insurance sector. IRDAI was itself established as a result of the Malhotra Committee recommendations. Hence Row 1 is INCORRECT regarding the parent organisation. Row 2 — L.C. Gupta Committee (1998) was indeed set up by SEBI to recommend a framework for introduction of derivatives (futures & options) trading in India. CORRECT. Row 3 — Urjit R. Patel Committee (2013-14) was constituted by RBI to revise and strengthen the monetary policy framework (inflation targeting/CPI anchor), NOT for bank lending to the housing sector. Hence Row 3 is INCORRECT on objective. Row 4 — Y.H. Malegam Committee (2010-11) was set up by RBI to study issues and concerns in the MFI (microfinance) sector, following the Andhra Pradesh MFI crisis. CORRECT. Therefore, only Rows 2 and 4 are fully correctly matched.",
    sources: [
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Financial Sector Regulators & Key Committees",
      },
      {
        name: "RBI & SEBI Historical Committee Reports",
        chapter: "Institutional Reforms in Indian Finance",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_07",
    year: 2026,
    subject: "Economy",
    topic: "Banking & Financial Sector",
    subTopic: "Non-Banking Financial Companies (NBFCs)",
    styleTag: "applied_sectors",
    difficulty: "Medium",
    questionText:
      "Consider the following statements about the Non-Banking Financial Companies (NBFCs) in India:\n\n1. NBFCs cannot accept demand deposits.\n2. All the NBFCs operating in India have to be registered with the RBI.\n3. NBFCs form part of the payment and settlement system and can issue cheque drawn on itself.\n4. Deposit insurance facility of Deposit Insurance and Credit Guarantee Corporation (DICGC) is not available to the depositors of deposit taking NBFCs.\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "1 and 4 only" },
      { id: "B", text: "1, 2 and 3 only" },
      { id: "C", text: "2 and 4 only" },
      { id: "D", text: "1, 3 and 4 only" },
    ],
    correctOption: "A",
    explanation:
      "Statement 1 is CORRECT — NBFCs are prohibited from accepting demand deposits (repayable on demand like savings/current accounts). Certain NBFCs can accept term deposits (fixed period), but not demand deposits — this is a key distinction from commercial banks. Statement 2 is INCORRECT — Not all NBFCs need to be registered with RBI. Certain categories such as Nidhi Companies (regulated by MCA), Chit Fund companies (regulated by respective state governments), Housing Finance Companies (earlier NHB, now RBI), and some cooperative societies are not required to register with RBI. Statement 3 is INCORRECT — NBFCs do NOT form part of the payment and settlement system and CANNOT issue cheques drawn on themselves. Only scheduled commercial banks and certain payment banks can issue such instruments. This is another key difference from banks. Statement 4 is CORRECT — DICGC insurance (up to ₹5 lakh per depositor per institution) is available only to depositors of commercial banks, small finance banks, payments banks, and cooperative banks — NOT to depositors of NBFCs. Hence Statements 1 and 4 are correct.",
    sources: [
      {
        name: "RBI Master Directions on NBFCs",
        chapter: "NBFC Regulatory Framework",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Banking & Non-Banking Financial Institutions",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_08",
    year: 2026,
    subject: "Economy",
    topic: "Poverty & Human Development",
    subTopic: "Multidimensional Poverty Index (MPI)",
    styleTag: "institutions_schemes",
    difficulty: "Hard",
    questionText:
      "Consider the following statements about Multidimensional Poverty Index (MPI):\n\n1. MPI is calculated using Alkire-Foster methodology.\n2. MPI calculated by NITI Aayog has a total of twelve indicators.\n3. Maternal Health and Bank Account are common indicators in the MPI of NITI Aayog and MPI of United Nations Development Programme (UNDP).\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "1 and 2 only" },
      { id: "C", text: "2 and 3 only" },
      { id: "D", text: "1, 2 and 3 only" },
    ],
    correctOption: "B",
    explanation:
      "Statement 1 is CORRECT — Both the global MPI (UNDP/OPHI) and India's National MPI (NITI Aayog) use the Alkire-Foster (AF) methodology developed by Sabina Alkire and James Foster. It identifies poverty across multiple dimensions simultaneously rather than just income. Statement 2 is CORRECT — NITI Aayog's National MPI (as per the 2021 and 2023 reports) uses 12 indicators across 3 dimensions: (a) Health — Nutrition, Child & Adolescent Mortality, Maternal Health; (b) Education — Years of Schooling, School Attendance; (c) Living Standards — Cooking Fuel, Sanitation, Drinking Water, Electricity, Housing, Assets, Bank Account. Statement 3 is INCORRECT — The UNDP/OPHI Global MPI uses 10 indicators across 3 dimensions (Health: nutrition, child mortality; Education: years of schooling, school attendance; Living standards: cooking fuel, sanitation, drinking water, electricity, housing, assets). The UNDP MPI does NOT include Maternal Health or Bank Account as indicators. 'Maternal Health' and 'Bank Account' are additions specific to India's NITI Aayog MPI. Hence only Statements 1 and 2 are correct.",
    sources: [
      {
        name: "NITI Aayog National MPI Report 2023",
        chapter: "Multidimensional Poverty Measurement",
      },
      {
        name: "UNDP Human Development Report / OPHI MPI Methodology",
        chapter: "Global MPI Framework",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_09",
    year: 2026,
    subject: "Economy",
    topic: "Digital Economy & FinTech",
    subTopic: "Real-World Asset (RWA) Tokenization",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Which of the following statements about Real-World Assets (RWA) Tokenization are correct?\n\n1. Tokenization is the process of turning real world assets into digital tokens using blockchain technology.\n2. Tokenization of real world assets offers 24x7 access, promoting financial inclusion.\n3. Tokenization of real world assets will allow the access to high growth investment opportunities for individuals in India.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 and 2 only" },
      { id: "B", text: "2 and 3 only" },
      { id: "C", text: "1 and 3 only" },
      { id: "D", text: "1, 2 and 3" },
    ],
    correctOption: "D",
    explanation:
      "All three statements are correct. RWA Tokenization refers to the process of converting ownership rights of physical or financial assets (real estate, gold, bonds, infrastructure) into digital tokens on a blockchain. Statement 1 is CORRECT — Tokenization fundamentally uses distributed ledger/blockchain technology to represent asset ownership as programmable digital tokens, enabling fractional ownership and transparent transfer. Statement 2 is CORRECT — Because blockchain operates 24x7 without market hours or geographic barriers, tokenized assets can be traded round the clock, democratizing access to financial markets and thus promoting financial inclusion for underserved populations. Statement 3 is CORRECT — Tokenization lowers the entry ticket size for high-value assets (e.g., commercial real estate, pre-IPO equity, private credit), allowing retail/small investors in India to access previously inaccessible high-growth investment classes. SEBI and RBI are exploring regulatory frameworks for asset tokenization in India.",
    sources: [
      {
        name: "RBI Report on Currency & Finance / SEBI Discussion Papers",
        chapter: "FinTech, DLT & Digital Assets",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Digital Economy & Emerging Financial Technologies",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_10",
    year: 2026,
    subject: "Economy",
    topic: "Insurance Sector",
    subTopic: "Aviation Insurance & Montreal Convention",
    styleTag: "applied_sectors",
    difficulty: "Hard",
    questionText:
      "Which of the following statements about insurance in aviation sector is/are correct?\n\n1. 'Aviation Hull Insurance' covers the physical aircraft, including the body, engine, and on-board equipment.\n2. Under the Montreal Convention, adopted in 1999 by over 130 countries, including India, airlines are strictly liable to pay compensation to the family/nominee of every deceased passenger without requiring the family to prove fault.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "2 only" },
      { id: "C", text: "Both 1 and 2" },
      { id: "D", text: "Neither 1 nor 2" },
    ],
    correctOption: "C",
    explanation:
      "Both statements are correct. Statement 1 is CORRECT — Aviation Hull Insurance is a property insurance that covers physical damage or total loss of the aircraft itself, including airframe, engines, avionics, and all equipment on board. It is analogous to motor insurance for vehicles. It is distinct from Aviation Liability Insurance (which covers third-party bodily injury/property damage) and Passenger Liability Insurance. Statement 2 is CORRECT — The Montreal Convention 1999 (formally: Convention for the Unification of Certain Rules for International Carriage by Air) established a two-tier strict liability regime: (Tier 1) For claims up to 128,821 SDRs (Special Drawing Rights), airlines cannot contest liability — they pay without the claimant proving fault; (Tier 2) For claims beyond this, airlines can contest by proving absence of negligence. India ratified the Montreal Convention. This replaced the older Warsaw Convention (1929). This question gained heightened relevance in context of aviation accidents and passenger rights discussions in India.",
    sources: [
      {
        name: "IRDAI Insurance Regulatory Framework",
        chapter: "Aviation & Specialty Insurance",
      },
      {
        name: "Montreal Convention 1999 / DGCA India",
        chapter: "International Aviation Law & Passenger Rights",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_11",
    year: 2026,
    subject: "Economy",
    topic: "Fiscal Policy",
    subTopic: "Crowding Out Effect",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText:
      "Which one of the following best describes the 'Crowding Out Effect' in the context of fiscal policy?",
    options: [
      {
        id: "A",
        text: "When government increases taxes, it leads to reduced consumption spending by households, thereby contracting aggregate demand.",
      },
      {
        id: "B",
        text: "When government borrows heavily from the market to finance its deficit, it leads to a rise in interest rates, which reduces private sector investment.",
      },
      {
        id: "C",
        text: "When government spending on public goods displaces private provision of the same goods due to competition in the same market.",
      },
      {
        id: "D",
        text: "When expansionary monetary policy reduces the effectiveness of fiscal expansion by keeping interest rates artificially low.",
      },
    ],
    correctOption: "B",
    explanation:
      "The Crowding Out Effect is a Keynesian/neo-classical concept in macroeconomics. When the government finances a fiscal deficit by borrowing from the domestic market (issuing government securities/T-bills), it increases the demand for loanable funds. This pushes up the market interest rate (cost of borrowing). As interest rates rise, private sector firms and households reduce their borrowing and therefore their investment and consumption expenditure. Thus, government borrowing literally 'crowds out' private investment. This is particularly relevant in India's context where the government's heavy market borrowing programme can raise yields on G-secs, affecting corporate bond spreads and bank lending rates. Partial crowding out occurs when the private sector only reduces (not eliminates) investment, while complete crowding out implies full offset of fiscal stimulus.",
    sources: [
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Fiscal Policy, Deficits & Public Debt",
      },
      {
        name: "Economic Survey of India",
        year: "2022-23 (Chapter on Fiscal Consolidation)",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_12",
    year: 2026,
    subject: "Economy",
    topic: "Digital Economy & E-Commerce",
    subTopic: "Open Network for Digital Commerce (ONDC)",
    styleTag: "institutions_schemes",
    difficulty: "Easy",
    questionText:
      "Which one of the following best describes the key objective of India's 'Open Network for Digital Commerce' (ONDC) initiative?",
    options: [
      {
        id: "A",
        text: "To create a government-owned e-commerce marketplace to compete with private players like Amazon and Flipkart.",
      },
      {
        id: "B",
        text: "To provide a unified digital payment interface for all e-commerce transactions processed in India.",
      },
      {
        id: "C",
        text: "To democratize digital commerce by enabling any buyer or seller application to interact through an open, interoperable network, reducing platform monopolies.",
      },
      {
        id: "D",
        text: "To regulate foreign-owned e-commerce platforms operating in India and ensure compliance with FDI guidelines.",
      },
    ],
    correctOption: "C",
    explanation:
      "ONDC (Open Network for Digital Commerce) is a government-backed initiative under the Department for Promotion of Industry and Internal Trade (DPIIT), conceptualized on the lines of UPI for payments. Its core objective is to move e-commerce from a platform-centric model (where buyers and sellers are locked into specific platforms like Amazon/Flipkart) to a protocol-based, open network model. This means any buyer app and any seller app, if compliant with ONDC protocols, can communicate with each other — creating interoperability. Key goals: (a) Democratize e-commerce access for small businesses and kirana stores; (b) Break platform lock-in and reduce dominance of large marketplace aggregators; (c) Increase digital commerce penetration in Tier 2/3 cities. It is not a payment system (that is UPI), not a government marketplace, and not an FDI regulatory body.",
    sources: [
      {
        name: "DPIIT ONDC Framework Document",
        chapter: "Digital Commerce Policy",
      },
      {
        name: "Economic Survey of India",
        year: "2022-23 (Digital Public Infrastructure)",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_13",
    year: 2026,
    subject: "Economy",
    topic: "Digital Economy & FinTech",
    subTopic: "UPI vs Central Bank Digital Currency (Digital Rupee)",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Which one of the following statements about Unified Payments Interface (UPI) and Central Bank Digital Currency (Digital Rupee) is NOT correct?",
    options: [
      {
        id: "A",
        text: "UPI is a payment interface that facilitates real-time fund transfers between bank accounts using VPA (Virtual Payment Address).",
      },
      {
        id: "B",
        text: "The Digital Rupee (e₹) is a direct liability of the Reserve Bank of India, unlike UPI transactions which are bank liabilities.",
      },
      {
        id: "C",
        text: "Both UPI and the Digital Rupee require the user to have a bank account for completing transactions.",
      },
      {
        id: "D",
        text: "The Digital Rupee can be held in a digital wallet issued by banks, whereas UPI operates via existing bank accounts.",
      },
    ],
    correctOption: "C",
    explanation:
      "The NOT correct statement is Option C. UPI transactions do require a linked bank account — this part is correct. However, the Digital Rupee (e₹-R: Retail CBDC) does NOT necessarily require a bank account. The e₹ is designed to be held in a digital wallet (similar to physical cash in a physical wallet), and one of its key design objectives is to provide an account-free digital payment option to the unbanked population, thereby enhancing financial inclusion. This is a fundamental structural difference. Other statements are factually correct: UPI (managed by NPCI) moves money between bank accounts in real-time using VPA; the Digital Rupee is a direct sovereign liability of RBI (like a digital banknote), unlike UPI payments which remain claims on commercial banks; e₹ wallets are issued/managed by banks but the underlying instrument is an RBI liability.",
    sources: [
      {
        name: "RBI Concept Note on Central Bank Digital Currency (CBDC)",
        chapter: "Digital Rupee — Design & Objectives",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "Payment Systems, UPI & Digital Currency",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_14",
    year: 2026,
    subject: "Economy",
    topic: "External Sector & International Trade",
    subTopic: "Oeko-Tex Certification & Textile Exports",
    styleTag: "applied_sectors",
    difficulty: "Medium",
    questionText:
      "Which of the following is/are the most significant implication(s) of obtaining Oeko-Tex certification for Eri Silk in the global textile industry?\n\n1. It allows Indian exporters to compete in high-end markets that prioritise chemical-free products.\n2. It confirms that Eri Silk meets international safety, environmental, and quality standards, enabling its entry into premium eco-conscious markets.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "2 only" },
      { id: "C", text: "Both 1 and 2" },
      { id: "D", text: "Neither 1 nor 2" },
    ],
    correctOption: "C",
    explanation:
      "Both statements are correct and complementary. Oeko-Tex is an independent international certification system (headquartered in Zurich) for textiles tested for harmful substances. The STANDARD 100 by OEKO-TEX certification guarantees that every component of a textile product has been tested for harmful substances and is harmless in terms of human ecology. Eri Silk (also known as Peace Silk or Ahimsa Silk, primarily from Northeast India — Assam, Meghalaya) recently received Oeko-Tex certification. Implication 1 is CORRECT — certification directly enables access to high-end European and North American markets that have stringent import standards for chemical-free, sustainably produced textiles, and eco-conscious B2B/B2C buyers. Implication 2 is CORRECT — Oeko-Tex certification is a holistic quality signal covering safety (no harmful chemicals like azo dyes, heavy metals, formaldehyde), environmental standards, and quality, which is essential for premium market entry. Both implications together represent why this certification is strategically significant for India's textile export diversification and the MSME weavers of the Northeast.",
    sources: [
      {
        name: "Ministry of Textiles / APEDA Reports",
        chapter: "Silk Sector & Textile Exports",
      },
      {
        name: "Mrunal Patel Notes / Ramesh Singh",
        chapter: "External Sector — Non-Traditional Exports & Standards",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_15",
    year: 2026,
    subject: "Economy",
    topic: "Infrastructure & Transport",
    subTopic: "Vizhinjam International Seaport & Maritime Trade",
    styleTag: "applied_sectors",
    difficulty: "Medium",
    questionText:
      "In what way(s) does the Vizhinjam International Seaport represent a structural shift in India's maritime trade and logistics policy?\n\n1. By functioning exclusively as a domestic cargo hub to reduce reliance on coastal shipping and eliminate the need for foreign collaborations.\n2. By focusing primarily on passenger cruise tourism and heritage shipping to increase Kerala's profile as a maritime heritage destination.\n3. By leveraging its natural deep draft and strategic location to reduce dependence on foreign trans-shipment ports, enhance revenue retention, and reposition India in regional maritime trade.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "3 only" },
      { id: "C", text: "1 and 3 only" },
      { id: "D", text: "2 and 3 only" },
    ],
    correctOption: "B",
    explanation:
      "Only Statement 3 is correct. Vizhinjam International Seaport (near Thiruvananthapuram, Kerala), developed by Adani Ports under a PPP model with the Kerala government, is India's first deep-water trans-shipment port. Statement 1 is INCORRECT — Vizhinjam is NOT designed as an exclusively domestic cargo hub. It is designed as an international trans-shipment hub, handling international container traffic. It has foreign collaboration (Adani is the concessionaire). Statement 2 is INCORRECT — Vizhinjam's primary purpose is international container trans-shipment, not cruise tourism or heritage shipping. Statement 3 is CORRECT and captures the strategic significance: (a) Natural deep draft (~20m) can accommodate ultra-large container vessels (ULCVs) without dredging; (b) Located close to the international east-west shipping lane (just ~10 nautical miles from the main shipping route); (c) Reduces India's dependence on Colombo (Sri Lanka), Singapore, and Dubai ports where ~75% of India's trans-shipment cargo was handled, leading to revenue leakage; (d) Repositions India as a trans-shipment hub in the Indian Ocean Region.",
    sources: [
      {
        name: "Ministry of Ports, Shipping & Waterways — Sagarmala / Vizhinjam Project DPR",
        chapter: "Port Infrastructure & Maritime Logistics",
      },
      {
        name: "Economic Survey of India",
        year: "2023-24 (Infrastructure Investment Chapter)",
      },
    ],
  },
  {
    _id: "pyq_economy_2026_16",
    year: 2026,
    subject: "Economy",
    topic: "Infrastructure & Transport",
    subTopic: "Sagarmala Programme & Sagarmala 2.0",
    styleTag: "institutions_schemes",
    difficulty: "Hard",
    questionText:
      "Consider the following statements with reference to the Sagarmala Programme of the Government of India:\n\nI. The Sagarmala Programme seeks to achieve port-led economic growth through cost-effective and sustainable coastal infrastructure.\nII. The success of the Sagarmala Programme is reflected in significant growth in coastal and inland waterway shipping, along with improved global port rankings.\nIII. Sagarmala 2.0 aims to position India as a global maritime innovation hub aligned with Atmanirbhar Bharat and Viksit Bharat 2047 visions.\n\nWhich of the following relationships among the above statements is/are correct?\n\n1. Statement II validates the effectiveness of the strategies envisioned in statement I.\n2. Statement III extends the objectives of statement I by embedding them into a future-oriented innovation framework.\n3. Statement I contradicts statement III by focusing only on traditional infrastructure instead of modern innovation.\n\nSelect the answer using the code given below:",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "1 and 2 only" },
      { id: "C", text: "2 and 3 only" },
      { id: "D", text: "1, 2 and 3" },
    ],
    correctOption: "B",
    explanation:
      "This is a logical-relationship question requiring analysis of how the statements relate to each other. Factual grounding: Sagarmala Programme (launched 2015, Ministry of Ports, Shipping & Waterways) focuses on four pillars — port modernisation, port-led industrialisation, port connectivity enhancement, and coastal community development. India's port performance has improved (Jawaharlal Nehru Port Trust ranked among top 30 global ports in World Bank Container Port Performance Index). Sagarmala 2.0 envisions maritime innovation, green shipping, digital ports, aligned with Atmanirbhar Bharat and Viksit Bharat 2047. Relationship 1 is CORRECT — Statement II (outcomes: growth in coastal shipping, improved rankings) logically validates the strategies described in Statement I (port-led growth through coastal infrastructure). Effect validates strategy. Relationship 2 is CORRECT — Statement III (Sagarmala 2.0 — innovation, Viksit Bharat 2047) extends and evolves the foundational objectives of Statement I (port-led growth) into a next-generation, future-oriented framework. It is an evolution, not a contradiction. Relationship 3 is INCORRECT — Statement I does NOT contradict Statement III. Statement I's focus on 'cost-effective and sustainable coastal infrastructure' is entirely compatible with and foundational to the innovation goals of Statement III. There is no logical contradiction.",
    sources: [
      {
        name: "Ministry of Ports, Shipping & Waterways — Sagarmala Programme Annual Report",
        chapter: "Maritime Infrastructure & Port-Led Development",
      },
      {
        name: "Economic Survey of India",
        year: "2023-24 (Logistics & Maritime Sector)",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_01",
    year: 2025,
    subject: "Economy",
    topic: "Regulatory Bodies",
    subTopic:
      "Petroleum and Natural Gas Regulatory Board (PNGRB) — Jurisdiction",
    styleTag: "applied_law",
    difficulty: "Hard",
    questionText:
      "Consider the following activities:\n\nI. Production of crude oil\nII. Refining, storage and distribution of petroleum products\nIII. Marketing and sale of petroleum products\nIV. Production of natural gas\n\nHow many of the above activities are regulated by the Petroleum and Natural Gas Regulatory Board in our country?",
    options: [
      { id: "A", text: "Only one" },
      { id: "B", text: "Only two" },
      { id: "C", text: "Only three" },
      { id: "D", text: "All four" },
    ],
    correctOption: "B",
    explanation:
      "Only two activities — Items II and III — fall under PNGRB's jurisdiction. The Petroleum and Natural Gas Regulatory Board was established under the PNGRB Act, 2006 to regulate the refining, processing, storage, transport, distribution, marketing and sale of petroleum, petroleum products and natural gas (excluding production). Item I (Production of crude oil) is NOT regulated by PNGRB; upstream activities like exploration and production are regulated by the Directorate General of Hydrocarbons (DGH) under the Ministry of Petroleum and Natural Gas. Item IV (Production of natural gas) is similarly an upstream activity and is NOT regulated by PNGRB — it falls under DGH and the framework of NELP/OALP. Items II (Refining, storage and distribution) and III (Marketing and sale of petroleum products) are clearly within PNGRB's mandate as midstream/downstream activities. Hence only two activities are regulated by PNGRB.",
    sources: [
      {
        name: "PNGRB Act, 2006",
        chapter: "Section 11 — Functions of the Board",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Regulatory Bodies in Energy Sector",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_02",
    year: 2025,
    subject: "Economy",
    topic: "Fiscal Federalism",
    subTopic: "15th Finance Commission Recommendations",
    styleTag: "applied_law",
    difficulty: "Hard",
    questionText:
      "Which of the following statements with regard to recommendations of the 15th Finance Commission of India are correct?\n\nI. It has recommended grants of ₹4,800 crores from the year 2022–23 to the year 2025–26 for incentivizing States to enhance educational outcomes.\nII. 45% of the net proceeds of Union taxes are to be shared with States.\nIII. ₹45,000 crores are to be kept as performance-based incentive for all States for carrying out agricultural reforms.\nIV. It reintroduced tax effort criteria to reward fiscal performance.\n\nSelect the correct answer using the code given below.",
    options: [
      { id: "A", text: "I and IV only" },
      { id: "B", text: "II and III only" },
      { id: "C", text: "I, II and IV only" },
      { id: "D", text: "I, III and IV only" },
    ],
    correctOption: "A",
    explanation:
      "Statements I and IV are correct. Statement I is correct: The 15th Finance Commission (FC-XV) for the period 2021-26 recommended sector-specific grants including grants for education to incentivize better educational outcomes by States in the 2022-26 period, with ₹4,800 crores earmarked for education sector grants. Statement II is incorrect: The 15th Finance Commission recommended that 41% (not 45%) of the net proceeds of Union taxes be devolved to States, maintaining it at the same level as the 14th Finance Commission's recommendation (which had increased it from 32% to 42%, with 1% deducted for newly formed J&K and Ladakh UTs, resulting in an effective 41%). Statement III is incorrect: The ₹45,000 crore performance incentive linked to agricultural reforms was NOT a recommendation of the 15th Finance Commission. Agricultural reform incentives in the FC-XV context are linked to specific governance reforms and are not structured this way. Statement IV is correct: The 15th Finance Commission reintroduced 'tax effort' as a criterion to reward States that demonstrate better fiscal performance and revenue mobilisation — this was a criterion that had been dropped by the 14th Finance Commission.",
    sources: [
      {
        name: "15th Finance Commission Report",
        chapter: "Volume I — Main Report: Devolution & Grants",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Finance Commission of India",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_03",
    year: 2025,
    subject: "Economy",
    topic: "Agriculture & Energy",
    subTopic: "Global Ethanol Production — Brazil vs USA",
    styleTag: "statement_pairing",
    difficulty: "Medium",
    questionText:
      "Consider the following statements:\n\nStatement I:\nOf the two major ethanol producers in the world, i.e., Brazil and the United States of America, the former produces more ethanol than the latter.\n\nStatement II:\nUnlike in the United States of America where corn is the principal feedstock for ethanol production, sugarcane is the principal feedstock for ethanol production in Brazil.\n\nWhich of the statements given above are correct?",
    options: [
      {
        id: "A",
        text: "Both Statement I and Statement II are correct and Statement II is the correct explanation for Statement I",
      },
      {
        id: "B",
        text: "Both Statement I and Statement II are correct but Statement II is not the correct explanation for Statement I",
      },
      { id: "C", text: "Statement I is incorrect but Statement II is correct" },
      { id: "D", text: "Both Statement I and Statement II are incorrect" },
    ],
    correctOption: "C",
    explanation:
      "Statement I is incorrect; Statement II is correct. Statement I is incorrect: The United States of America is actually the LARGEST ethanol producer in the world, followed by Brazil. The US produces roughly 54-55% of global ethanol output, while Brazil produces approximately 27-30%. The US consistently outproduces Brazil. So the statement that Brazil ('the former') produces more than the US ('the latter') is factually wrong — it is the reverse. Statement II is correct: This is a well-established fact. In the USA, corn (maize) is overwhelmingly the principal feedstock for ethanol, accounting for over 90% of US ethanol. In Brazil, sugarcane is the dominant feedstock for ethanol production, with Brazil's flex-fuel vehicle system and Proálcool programme built around sugarcane-based ethanol. Since Statement I is incorrect and Statement II is correct, the answer is (c).",
    sources: [
      { name: "Ramesh Singh — Indian Economy", chapter: "Energy & Biofuels" },
      {
        name: "Current Affairs",
        chapter: "Global Ethanol & Biofuel Landscape",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_04",
    year: 2025,
    subject: "Economy",
    topic: "Public Finance",
    subTopic: "Primary Deficit — Numerical Calculation",
    styleTag: "conceptual",
    difficulty: "Hard",
    questionText:
      "A country's fiscal deficit stands at ₹50,000 crores. It is receiving ₹10,000 crores through non-debt creating capital receipts. The country's interest liabilities are ₹1,500 crores. What is the gross primary deficit?",
    options: [
      { id: "A", text: "₹38,500 crores" },
      { id: "B", text: "₹48,500 crores" },
      { id: "C", text: "₹40,000 crores" },
      { id: "D", text: "₹41,500 crores" },
    ],
    correctOption: "B",
    explanation:
      "The correct answer is ₹48,500 crores. Key definitions: Fiscal Deficit = Total Expenditure − Total Receipts (excluding borrowings) = Net borrowing requirement. Primary Deficit = Fiscal Deficit − Interest Payments. The formula is straightforward: Primary Deficit = Fiscal Deficit − Interest Liabilities = ₹50,000 crores − ₹1,500 crores = ₹48,500 crores. The non-debt creating capital receipts of ₹10,000 crores is a distractor in this question — it is relevant to the context of the deficit calculation but does NOT affect the primary deficit formula. The primary deficit simply removes interest payments from the fiscal deficit to show the deficit excluding the debt-servicing burden. Note: The question asks for the 'gross primary deficit' which uses the same formula. Hence ₹50,000 − ₹1,500 = ₹48,500 crores.",
    sources: [
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Union Budget — Deficits & Fiscal Policy",
      },
      {
        name: "NCERT Class XII — Macroeconomics",
        chapter: "Government Budget and the Economy",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_05",
    year: 2025,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "UPI International Merchant Payments — Countries",
    styleTag: "applied_law",
    difficulty: "Hard",
    questionText:
      "Consider the following countries:\n\nI. United Arab Emirates\nII. France\nIII. Germany\nIV. Singapore\nV. Bangladesh\n\nHow many countries amongst the above are there other than India where international merchant payments are accepted under UPI?",
    options: [
      { id: "A", text: "Only two" },
      { id: "B", text: "Only three" },
      { id: "C", text: "Only four" },
      { id: "D", text: "All five" },
    ],
    correctOption: "C",
    explanation:
      "Four of the five listed countries accept UPI for international merchant payments. UPI has been expanding internationally through NPCI International. As of 2024-25: UAE (Item I): YES — UPI merchant payments are accepted in the UAE. France (Item II): YES — UPI was launched for merchant payments in France (at tourist locations, Eiffel Tower etc.), making it the first European country to accept UPI. Germany (Item III): YES — UPI merchant payments are accepted in Germany as part of the European expansion. Singapore (Item IV): YES — Singapore was one of the earliest countries to accept UPI for cross-border payments, through a linkage with PayNow. Bangladesh (Item V): NO — As of 2024-25, Bangladesh does not accept UPI for international merchant payments. Bangladesh has its own mobile payment infrastructure (bKash, Nagad) but UPI merchant payment acceptance has not been extended to Bangladesh. Hence four countries (UAE, France, Germany, Singapore) qualify.",
    sources: [
      {
        name: "NPCI International — UPI Global Expansion",
        chapter: "International UPI Rollout 2023-25",
      },
      { name: "Current Affairs", chapter: "India's Digital Payment Diplomacy" },
    ],
  },
  {
    _id: "pyq_economy_2025_06",
    year: 2025,
    subject: "Economy",
    topic: "International Organisations",
    subTopic: "IBRD — World Bank Group",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Consider the following statements in respect of the International Bank for Reconstruction and Development (IBRD):\n\nI. It provides loans and guarantees to middle income countries.\nII. It works single-handedly to help developing countries to reduce poverty.\nIII. It was established to help Europe rebuild after the World War II.\n\nWhich of the statements given above are correct?",
    options: [
      { id: "A", text: "I and II only" },
      { id: "B", text: "I and III only" },
      { id: "C", text: "II and III only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "B",
    explanation:
      "Statements I and III are correct; Statement II is incorrect. Statement I is correct: The IBRD's primary mandate is to provide loans, guarantees, risk management products, and advisory services to middle-income and creditworthy low-income countries. It is one of the five institutions of the World Bank Group. Statement II is incorrect: The IBRD does NOT work 'single-handedly'. The World Bank Group itself comprises five institutions (IBRD, IDA, IFC, MIGA, ICSID), and the IBRD works in collaboration with these other bodies and partner organisations. The word 'single-handedly' makes this statement incorrect — poverty reduction is a collaborative, multi-institution effort. Statement III is correct: The IBRD was established at the Bretton Woods Conference in 1944 and its original primary purpose was to finance the reconstruction of war-torn European economies after World War II. This is a well-documented historical fact about the IBRD's founding mandate, before it evolved into a development bank for developing countries broadly.",
    sources: [
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "International Financial Institutions",
      },
      { name: "World Bank — IBRD Overview", chapter: "History & Mandate" },
    ],
  },
  {
    _id: "pyq_economy_2025_07",
    year: 2025,
    subject: "Economy",
    topic: "Public Finance",
    subTopic: "Revenue Deficit, Fiscal Deficit, Primary Deficit — Numerical",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Suppose the revenue expenditure is ₹80,000 crores and the revenue receipts of the Government are ₹60,000 crores. The Government budget also shows borrowings of ₹10,000 crores and interest payments of ₹6,000 crores. Which of the following statements are correct?\n\nI. Revenue deficit is ₹20,000 crores.\nII. Fiscal deficit is ₹10,000 crores.\nIII. Primary deficit is ₹4,000 crores.\n\nSelect the correct answer using the code given below.",
    options: [
      { id: "A", text: "I and II only" },
      { id: "B", text: "I and III only" },
      { id: "C", text: "II and III only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "D",
    explanation:
      "All three statements are correct. Let us verify each: Statement I — Revenue Deficit = Revenue Expenditure − Revenue Receipts = ₹80,000 − ₹60,000 = ₹20,000 crores. Correct. Statement II — In this simplified model, Fiscal Deficit = Total Borrowings (since borrowings represent the government's borrowing requirement = fiscal deficit). Given borrowings = ₹10,000 crores, Fiscal Deficit = ₹10,000 crores. Correct. (Note: In the standard formula, Fiscal Deficit = Total Expenditure − Total Receipts excluding borrowings. Here the question provides borrowings directly as the fiscal gap figure.) Statement III — Primary Deficit = Fiscal Deficit − Interest Payments = ₹10,000 − ₹6,000 = ₹4,000 crores. Correct. All three statements are mathematically verified and correct.",
    sources: [
      {
        name: "NCERT Class XII — Macroeconomics",
        chapter: "Government Budget and the Economy",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Union Budget — Types of Deficits",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_08",
    year: 2025,
    subject: "Economy",
    topic: "Government Bodies & Schemes",
    subTopic: "Organisation–Ministry Matching — NAB, Coir Board, NCTI",
    styleTag: "applied_law",
    difficulty: "Hard",
    questionText:
      "With reference to India, consider the following pairs:\n\n| Organization | Union Ministry |\n|---|---|\n| I. The National Automotive Board | Ministry of Commerce and Industry |\n| II. The Coir Board | Ministry of Heavy Industries |\n| III. The National Centre for Trade Information | Ministry of Micro, Small and Medium Enterprises |\n\nHow many of the above pairs are correctly matched?",
    options: [
      { id: "A", text: "None" },
      { id: "B", text: "Only one" },
      { id: "C", text: "Only two" },
      { id: "D", text: "All three" },
    ],
    correctOption: "A",
    explanation:
      "None of the three pairs are correctly matched. Pair I (National Automotive Board — Ministry of Commerce and Industry) is INCORRECT. The National Automotive Board (NAB) functions under the Ministry of Heavy Industries (MHI), not the Ministry of Commerce and Industry. It was established to facilitate and coordinate the development of the Indian automotive industry. Pair II (Coir Board — Ministry of Heavy Industries) is INCORRECT. The Coir Board is a statutory body established under the Coir Industry Act, 1953. It functions under the Ministry of Micro, Small and Medium Enterprises (MoMSME), not the Ministry of Heavy Industries. Coir is a cottage/small-scale industry. Pair III (National Centre for Trade Information — Ministry of Micro, Small and Medium Enterprises) is INCORRECT. The National Centre for Trade Information (NCTI) is a joint venture of the Ministry of Commerce and Industry and FICCI (Federation of Indian Chambers of Commerce and Industry). It does NOT fall under MoMSME. Hence all three pairs are incorrectly matched.",
    sources: [
      {
        name: "India Year Book",
        chapter: "Ministries and Departments — Industry",
      },
      {
        name: "Current Affairs",
        chapter: "Government Bodies & Their Ministries",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_09",
    year: 2025,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "RTGS vs NEFT — Features & Differences",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Consider the following statements in respect of RTGS and NEFT:\n\nI. In RTGS, the settlement time is instantaneous while in case of NEFT, it takes some time to settle payments.\nII. In RTGS, the customer is charged for inward transactions while that is not the case for NEFT.\nIII. Operating hours for RTGS are restricted on certain days while this is not true for NEFT.\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "I only" },
      { id: "B", text: "I and II only" },
      { id: "C", text: "II and III only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "A",
    explanation:
      "Only Statement I is correct. Statement I is correct: RTGS (Real Time Gross Settlement) settles transactions instantaneously on a transaction-by-transaction basis in real time. NEFT (National Electronic Funds Transfer) operates on a deferred net settlement basis — transactions are batched and settled in hourly batches, meaning it takes some time to settle. Statement II is incorrect: For both RTGS and NEFT, charges on inward (receiving) transactions are NIL — banks are prohibited by RBI from levying charges on beneficiary (inward) customers. Only outward (sending) transactions may attract charges for RTGS. Statement III is incorrect: Since December 2019, both RTGS and NEFT have been made available 24x7, all days including weekends and holidays. Before that, both had restricted operating hours. As both now operate 24x7, there is no difference in operating hours — the statement that RTGS hours 'are restricted on certain days' is incorrect for the current scenario.",
    sources: [
      { name: "RBI — Payment Systems", chapter: "RTGS & NEFT Guidelines" },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Banking & Payment Systems",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_10",
    year: 2025,
    subject: "Economy",
    topic: "Natural Resources & Mining",
    subTopic:
      "Minerals Security Partnership, Critical Minerals — MMDR Amendment 2023",
    styleTag: "applied_law",
    difficulty: "Hard",
    questionText:
      "Consider the following statements:\n\nI. India has joined the Minerals Security Partnership as a member.\nII. India is a resource-rich country in all the 30 critical minerals that it has identified.\nIII. The Parliament in 2023 has amended the Mines and Minerals (Development and Regulation) Act, 1957 empowering the Central Government to exclusively auction mining lease and composite license for certain critical minerals.\n\nWhich of the statements given above are correct?",
    options: [
      { id: "A", text: "I and III only" },
      { id: "B", text: "II and III only" },
      { id: "C", text: "I and II only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "A",
    explanation:
      "Statements I and III are correct; Statement II is incorrect. Statement I is correct: India joined the Minerals Security Partnership (MSP) — a US-led initiative involving major economies to ensure resilient critical mineral supply chains — as a partner/member. India's inclusion was announced in mid-2023, reflecting the strategic importance of critical minerals for clean energy transition. Statement II is incorrect: India is NOT resource-rich in all 30 critical minerals it has identified. The government's Critical Minerals report identifies that India is deficient or import-dependent in several critical minerals such as Cobalt, Lithium, Nickel, and several Rare Earth Elements. India has domestic reserves for some minerals (like graphite, titanium, vanadium) but is heavily import-dependent for others. This makes the blanket claim of being 'resource-rich in all 30' incorrect. Statement III is correct: The Mines and Minerals (Development and Regulation) Amendment Act, 2023 was enacted specifically to empower the Central Government to conduct auctions for mining leases and composite licences for certain notified critical and strategic minerals, overriding the normal State-level auction authority.",
    sources: [
      {
        name: "MMDR Amendment Act, 2023",
        chapter: "Critical Minerals Provisions",
      },
      {
        name: "Current Affairs",
        chapter:
          "Minerals Security Partnership & India's Critical Minerals Policy",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_11",
    year: 2025,
    subject: "Economy",
    topic: "Capital Markets",
    subTopic:
      "India's Equity Options Market, Stock Market Growth, SEBI Regulation",
    styleTag: "statement_pairing",
    difficulty: "Hard",
    questionText:
      "Consider the following statements:\n\nI. India accounts for a very large portion of all equity option contracts traded globally thus exhibiting a great boom.\nII. India's stock market has grown rapidly in the recent past even overtaking Hong Kong's at some point of time.\nIII. There is no regulatory body either to warn the small investors about the risks of options trading or to act on unregistered financial advisors in this regard.\n\nWhich of the statements given above are correct?",
    options: [
      { id: "A", text: "I and II only" },
      { id: "B", text: "II and III only" },
      { id: "C", text: "I and III only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "A",
    explanation:
      "Statements I and II are correct; Statement III is incorrect. Statement I is correct: India has become a global powerhouse in equity derivatives trading. As of 2023-24, India accounted for an extraordinarily large share — over 60-70% — of all equity option contracts traded globally, primarily driven by index options (Nifty and BankNifty) on NSE. This is a well-documented phenomenon reflecting a massive retail participation boom. Statement II is correct: India's stock market capitalisation surged dramatically in 2023-24. At its peak, India's market cap briefly surpassed Hong Kong's, making India the 4th largest stock market in the world at that point, surpassing Hong Kong. Statement III is incorrect: SEBI (Securities and Exchange Board of India) is a fully functional and active regulatory body that has specifically issued guidelines warning retail investors about risks in F&O (Futures & Options) trading, conducted awareness campaigns, and also acts against unregistered financial advisors/influencers ('finfluencers'). SEBI has published studies showing retail investor losses in F&O. The claim that 'there is no regulatory body' is factually wrong.",
    sources: [
      {
        name: "SEBI Annual Report 2023-24",
        chapter: "Derivatives Market & Investor Protection",
      },
      {
        name: "Current Affairs",
        chapter: "India's F&O Boom & Market Capitalisation",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_12",
    year: 2025,
    subject: "Economy",
    topic: "Capital Markets",
    subTopic: "Bonds vs Stocks — Risk, Ownership, Repayment Priority",
    styleTag: "statement_pairing",
    difficulty: "Easy",
    questionText:
      "Consider the following statements:\n\nStatement I:\nAs regards returns from an investment in a company, generally, bondholders are considered to be relatively at lower risk than stockholders.\n\nStatement II:\nBondholders are lenders to a company whereas stockholders are its owners.\n\nStatement III:\nFor repayment purpose, bondholders are prioritized over stockholders by a company.\n\nWhich one of the following is correct in respect of the above statements?",
    options: [
      {
        id: "A",
        text: "All three statements are correct and Statement II and III together explain Statement I",
      },
      { id: "B", text: "Only Statement I and II are correct" },
      { id: "C", text: "Only Statement II and III are correct" },
      {
        id: "D",
        text: "All three statements are correct but Statement III alone explains Statement I",
      },
    ],
    correctOption: "A",
    explanation:
      "All three statements are correct, and the relationship between them is that Statements II and III together explain why Statement I is true. Statement I is correct: Bondholders face lower risk than stockholders because they receive fixed, contractual interest payments and are repaid before equity holders in case of liquidation. Their returns are more predictable and certain. Statement II is correct: Bondholders are creditors/lenders — they hold debt instruments (bonds/debentures) and the company owes them principal + interest. Stockholders (equity shareholders) are the actual owners of the company and bear residual risk. Statement III is correct: In the capital structure hierarchy (liquidation preference), the order of repayment is: secured creditors → unsecured creditors (bondholders/debenture holders) → preference shareholders → equity shareholders. Bondholders are clearly prioritized over stockholders. The explanatory link: Bondholders are at lower risk (I) BECAUSE they are lenders not owners (II) AND because they have repayment priority (III). Both II and III together explain I.",
    sources: [
      {
        name: "NCERT Class XII — Business Studies",
        chapter: "Financial Markets — Bonds & Stocks",
      },
      { name: "Ramesh Singh — Indian Economy", chapter: "Capital Markets" },
    ],
  },
  {
    _id: "pyq_economy_2025_13",
    year: 2025,
    subject: "Economy",
    topic: "Agriculture",
    subTopic: "Turmeric — India's Production, Varieties, States (2022-23)",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Consider the following statements about turmeric during the year 2022–23:\n\nI. India is the largest producer and exporter of turmeric in the world.\nII. More than 30 varieties of turmeric are grown in India.\nIII. Maharashtra, Telangana, Karnataka and Tamil Nadu are major turmeric producing States in India.\n\nWhich of the statements given above are correct?",
    options: [
      { id: "A", text: "I and II only" },
      { id: "B", text: "I and III only" },
      { id: "C", text: "II and III only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "D",
    explanation:
      "All three statements are correct. Statement I is correct: India is the world's largest producer, consumer, and exporter of turmeric, accounting for about 75-80% of global turmeric production. India also dominates global turmeric export markets. This was true during 2022-23. Statement II is correct: India grows a large number of turmeric varieties, and more than 30 varieties are indeed cultivated across different agroclimatic zones in India. Well-known varieties include Rajapuri, Selam, Suguna, Suroma, Roma, Krishna, Suvarna, and many more regional cultivars. Statement III is correct: The major turmeric-producing States in India are Telangana (largest producer), Maharashtra, Karnataka, Tamil Nadu, Andhra Pradesh, and Orissa. The four states mentioned — Maharashtra, Telangana, Karnataka, and Tamil Nadu — are indeed among the major producers, making this statement correct. All three statements about India's turmeric sector are accurate.",
    sources: [
      {
        name: "Spices Board of India — Turmeric Statistics",
        chapter: "Annual Spice Production Data 2022-23",
      },
      { name: "India Year Book", chapter: "Agriculture — Spices" },
    ],
  },
  {
    _id: "pyq_economy_2025_14",
    year: 2025,
    subject: "Economy",
    topic: "Taxation",
    subTopic:
      "Agricultural Income Tax Exemption; Rural Agricultural Land as Capital Asset — Income Tax Act",
    styleTag: "statement_pairing",
    difficulty: "Hard",
    questionText:
      "Consider the following statements:\n\nStatement I: In India, income from allied agricultural activities like poultry farming and wool rearing in rural areas is exempted from any tax.\n\nStatement II: In India, rural agricultural land is not considered a capital asset under the provisions of the Income-tax Act, 1961.\n\nWhich one of the following is correct in respect of the above statements?",
    options: [
      {
        id: "A",
        text: "Both Statement I and Statement II are correct and Statement II is the correct explanation for Statement I",
      },
      {
        id: "B",
        text: "Both Statement I and Statement II are correct but Statement II is not the correct explanation for Statement I",
      },
      { id: "C", text: "Statement I is incorrect but Statement II is correct" },
      { id: "D", text: "Both Statement I and Statement II are incorrect" },
    ],
    correctOption: "C",
    explanation:
      "Statement I is incorrect; Statement II is correct. Statement I is incorrect: Income from poultry farming and wool rearing are NOT considered agricultural income under the Income Tax Act, 1961 and are therefore NOT exempt from income tax. Agricultural income (exempt under Section 10(1)) refers specifically to income derived from land situated in India and used for agricultural purposes — cultivation of soil, forestry operations, etc. Poultry farming, animal husbandry (including wool rearing), and dairy farming are 'allied agricultural activities' but do NOT qualify as 'agricultural income' under Section 2(1A) of the Income Tax Act. They are taxable as business income. Statement II is correct: Under Section 2(14) of the Income Tax Act, 1961, the definition of 'capital asset' specifically excludes 'agricultural land in India' that meets the rurality criteria (not within specified urban limits based on population thresholds and distance from municipal boundaries). Rural agricultural land is explicitly excluded from the definition of capital asset, which means gains from its transfer are not subject to capital gains tax.",
    sources: [
      {
        name: "Income Tax Act, 1961",
        chapter:
          "Section 2(1A) — Agricultural Income; Section 2(14) — Capital Asset",
      },
      { name: "Ramesh Singh — Indian Economy", chapter: "Taxation in India" },
    ],
  },
  {
    _id: "pyq_economy_2025_15",
    year: 2025,
    subject: "Economy",
    topic: "Public Finance",
    subTopic:
      "Capital Receipts — Classification (Borrowings, Disinvestment, Interest on Loans)",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "Consider the following statements:\n\nI. Capital receipts create a liability or cause a reduction in the assets of the Government.\nII. Borrowings and disinvestment are capital receipts.\nIII. Interest received on loans creates a liability of the Government.\n\nWhich of the statements given above are correct?",
    options: [
      { id: "A", text: "I and II only" },
      { id: "B", text: "I and III only" },
      { id: "C", text: "II and III only" },
      { id: "D", text: "I, II and III" },
    ],
    correctOption: "A",
    explanation:
      "Statements I and II are correct; Statement III is incorrect. Statement I is correct: Capital receipts are defined precisely as those receipts that either create a liability for the government (e.g., borrowings — the government must repay the principal) OR cause a reduction in the government's assets (e.g., disinvestment — the government sells its ownership stakes, reducing assets; recovery of loans — the government recovers loan principal previously lent out, reducing its financial asset of 'loans outstanding'). Statement II is correct: Both borrowings (market borrowings, external borrowings) and disinvestment (sale of government's equity in public sector enterprises) are classified as capital receipts in the Government Budget. Borrowings create a liability; disinvestment reduces assets. Statement III is incorrect: Interest received on loans given by the government is classified as a REVENUE receipt (under 'interest receipts'), NOT a capital receipt. Interest income is a regular, recurring income that does NOT create a liability — it is income earned. It therefore belongs to the revenue account, not capital account. Hence only I and II are correct.",
    sources: [
      {
        name: "NCERT Class XII — Macroeconomics",
        chapter: "Government Budget and the Economy",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Union Budget — Receipts Classification",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_16",
    year: 2025,
    subject: "Economy",
    topic: "Capital Markets",
    subTopic: "Alternative Investment Funds (AIFs) — SEBI Definition",
    styleTag: "applied_law",
    difficulty: "Hard",
    questionText:
      "With reference to investments, consider the following:\n\nI. Bonds\nII. Hedge Funds\nIII. Stocks\nIV. Venture Capital\n\nHow many of the above are treated as Alternative Investment Funds?",
    options: [
      { id: "A", text: "Only one" },
      { id: "B", text: "Only two" },
      { id: "C", text: "Only three" },
      { id: "D", text: "All four" },
    ],
    correctOption: "B",
    explanation:
      "Only two — Hedge Funds (II) and Venture Capital (IV) — are treated as Alternative Investment Funds (AIFs). Under SEBI's AIF Regulations, 2012, Alternative Investment Funds are privately pooled investment vehicles that collect funds from sophisticated/institutional investors for investing per a defined investment policy. AIFs are categorised as: Category I (Venture Capital Funds, Social Venture Funds, Infrastructure Funds, Angel Funds), Category II (Private Equity Funds, Debt Funds, Fund of Funds), and Category III (Hedge Funds, PIPE Funds). Bonds (Item I): Bonds are conventional debt instruments — NOT an AIF category. They are standard capital market instruments, not privately pooled alternative vehicles. Hedge Funds (Item II): YES — Hedge Funds are explicitly Category III AIFs under SEBI's AIF Regulations. Stocks (Item III): Stocks/Equities are conventional capital market instruments listed on exchanges — NOT AIFs. Venture Capital (Item IV): YES — Venture Capital Funds are Category I AIFs under SEBI's AIF Regulations. Hence only two (Hedge Funds and Venture Capital) qualify as AIFs.",
    sources: [
      {
        name: "SEBI AIF Regulations, 2012",
        chapter: "Alternative Investment Fund Categories I, II & III",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Capital Markets — Institutional Investors",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_17",
    year: 2025,
    subject: "Economy",
    topic: "Corporate Governance & Sustainability",
    subTopic: "BRSR — Business Responsibility and Sustainability Report",
    styleTag: "applied_law",
    difficulty: "Medium",
    questionText:
      "Consider the following statements:\n\nI. The Reserve Bank of India mandates all the listed companies in India to submit a Business Responsibility and Sustainability Report (BRSR).\nII. In India, a company submitting a BRSR makes disclosures in the report that are largely non-financial in nature.\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "I only" },
      { id: "B", text: "II only" },
      { id: "C", text: "Both I and II" },
      { id: "D", text: "Neither I nor II" },
    ],
    correctOption: "B",
    explanation:
      "Only Statement II is correct; Statement I is incorrect. Statement I is incorrect: The BRSR mandate comes from SEBI (Securities and Exchange Board of India), NOT from the Reserve Bank of India (RBI). SEBI introduced the BRSR framework through its circular in 2021, making it mandatory for the top 1,000 listed companies by market capitalisation from FY 2022-23 onwards, replacing the earlier Business Responsibility Report (BRR). The RBI has no jurisdiction over listed company disclosure requirements — that falls under SEBI's domain. Statement II is correct: The BRSR requires companies to disclose information that is largely non-financial in nature — covering Environmental, Social, and Governance (ESG) parameters such as energy consumption, water usage, GHG emissions, employee welfare, supply chain due diligence, community engagement, ethics and transparency. These are sustainability and responsibility disclosures beyond conventional financial statements, making them largely non-financial in character.",
    sources: [
      {
        name: "SEBI BRSR Circular 2021",
        chapter: "Business Responsibility & Sustainability Reporting Framework",
      },
      {
        name: "Current Affairs",
        chapter: "ESG & Corporate Sustainability Reporting in India",
      },
    ],
  },
  {
    _id: "pyq_economy_2025_18",
    year: 2025,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "Reserve Bank of India — Sources of Income",
    styleTag: "conceptual",
    difficulty: "Hard",
    questionText:
      "Which of the following are the sources of income for the Reserve Bank of India?\n\nI. Buying and selling Government bonds\nII. Buying and selling foreign currency\nIII. Pension fund management\nIV. Lending to private companies\nV. Printing and distributing currency notes\n\nSelect the correct answer using the code given below.",
    options: [
      { id: "A", text: "I and II only" },
      { id: "B", text: "I, II and III only" },
      { id: "C", text: "I, II and V only" },
      { id: "D", text: "I, II, III and V only" },
    ],
    correctOption: "A",
    explanation:
      "Only Items I and II are genuine sources of income for the RBI. The RBI earns income primarily through its core central banking operations. Item I (Buying and selling Government bonds): YES — This is the RBI's primary income source. The RBI holds a large portfolio of Government of India securities. Interest income on these securities (from its open market operations and LSAS) is the largest component of RBI's income. Item II (Buying and selling foreign currency): YES — The RBI manages India's foreign exchange reserves and earns income through interest on foreign currency assets (bonds held in foreign central banks, US Treasuries, etc.) and through forex interventions. This is the second major source of RBI income. Item III (Pension fund management): NO — The RBI does not manage pension funds as a business activity generating income. The NPS (National Pension System) is managed by PFRDA. Item IV (Lending to private companies): NO — The RBI does NOT lend directly to private companies. The RBI lends to scheduled banks (via repo, MSF, etc.) and the Government, but not to private sector companies. Lending to the private sector is the domain of commercial banks. Item V (Printing and distributing currency notes): NO — Currency printing is done by the government-owned Security Printing and Minting Corporation of India (SPMCIL) and Bharatiya Reserve Bank Note Mudran (BRBNMPL). While the RBI issues currency, the 'seigniorage' (currency issue profit) mechanics are complex; but printing/distributing notes is not classified as a source of 'income' for the RBI in its financial accounts the way interest income is.",
    sources: [
      {
        name: "RBI Annual Report",
        chapter: "RBI's Income & Expenditure — Statement of Accounts",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Reserve Bank of India — Functions & Operations",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_01",
    year: 2024,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "Collateral Borrowing and Lending Obligations (CBLO)",
    styleTag: "conceptual",
    difficulty: "Hard",
    questionText:
      'With reference to the Indian economy, "Collateral Borrowing and Lending Obligations" are the instruments of :',
    options: [
      { id: "A", text: "Debt market" },
      { id: "B", text: "Forex market" },
      { id: "C", text: "Money market" },
      { id: "D", text: "Capital market" },
    ],
    correctOption: "C",
    explanation:
      "Collateral Borrowing and Lending Obligations (CBLO) are money market instruments. They were introduced by the Clearing Corporation of India Ltd (CCIL) to provide a mechanism for entities to borrow and lend funds against government securities as collateral for short durations (typically overnight to 90 days). CBLO operates in the money market segment because it deals with short-term borrowing and lending — the defining characteristic of money market instruments. Participants include banks, primary dealers, mutual funds, insurance companies, and NBFCs. CBLO was later replaced by the Tri-party Repo (TREPS) system. The instrument is distinct from capital market instruments (long-term) or forex market instruments.",
    sources: [
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Money Market Instruments",
      },
      {
        name: "RBI — Money Market Operations",
        chapter: "CBLO & Tri-party Repo",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_02",
    year: 2024,
    subject: "Economy",
    topic: "Capital Markets",
    subTopic: "Financial Instruments — ETFs, Motor Vehicles, Currency Swaps",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText:
      "Consider the following:\n\n1. Exchange-Traded Funds (ETF)\n2. Motor vehicles\n3. Currency swap\n\nWhich of the above is/are considered financial instruments?",
    options: [
      { id: "A", text: "1 and 2 only" },
      { id: "B", text: "2 and 3 only" },
      { id: "C", text: "1 and 3 only" },
      { id: "D", text: "1, 2 and 3" },
    ],
    correctOption: "C",
    explanation:
      "Items 1 and 3 are financial instruments; Item 2 is not. A financial instrument is any contract that gives rise to a financial asset of one entity and a financial liability or equity instrument of another. ETFs (Item 1): YES — An Exchange-Traded Fund is a financial instrument that tracks an index, commodity, bonds, or basket of assets. It is traded on stock exchanges like stocks and represents a financial claim. ETFs are clearly financial instruments. Motor vehicles (Item 2): NO — Motor vehicles are physical/tangible assets (real assets), not financial instruments. They do not represent a contractual financial claim or obligation between parties. Currency swap (Item 3): YES — A currency swap is a derivative financial instrument where two parties exchange principal and interest payments in different currencies. It is explicitly a financial instrument (a derivative) used for hedging foreign currency risk. Hence only Items 1 and 3 are financial instruments.",
    sources: [
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Financial Markets & Instruments",
      },
      {
        name: "NCERT Class XII — Macroeconomics",
        chapter: "Financial Instruments",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_03",
    year: 2024,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic:
      "NBFCs, FIIs, Stock Exchanges — Liquidity Adjustment Facility, G-Secs, Debt Platforms",
    styleTag: "statement_pairing",
    difficulty: "Hard",
    questionText:
      "Consider the following statements:\n\n1. In India, Non-Banking Financial Companies can access the Liquidity Adjustment Facility window of the Reserve Bank of India.\n2. In India, Foreign Institutional Investors can hold the Government Securities (G-Secs).\n3. In India, Stock Exchanges can offer separate trading platforms for debts.\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "1 and 2 only" },
      { id: "B", text: "3 only" },
      { id: "C", text: "2 and 3 only" },
      { id: "D", text: "1, 2 and 3" },
    ],
    correctOption: "C",
    explanation:
      "Statements 2 and 3 are correct; Statement 1 is incorrect. Statement 1 is incorrect: The Liquidity Adjustment Facility (LAF) — comprising Repo and Reverse Repo operations — is available ONLY to scheduled commercial banks, NOT to Non-Banking Financial Companies (NBFCs). NBFCs do not have access to the LAF window of the RBI. The LAF is a monetary policy tool that allows banks to borrow overnight from or park funds with the RBI. Statement 2 is correct: Foreign Institutional Investors (FIIs), now called Foreign Portfolio Investors (FPIs), are permitted to hold Government Securities (G-Secs) up to specified limits as set by the RBI. This has been a longstanding feature of India's capital market liberalisation. Statement 3 is correct: SEBI has permitted stock exchanges to offer separate trading platforms for debt instruments (corporate bonds and G-Secs). NSE's Debt Market segment and BSE's debt trading platform are examples of dedicated platforms for debt trading on exchanges.",
    sources: [
      {
        name: "RBI — Monetary Policy Operations",
        chapter: "Liquidity Adjustment Facility",
      },
      {
        name: "SEBI — Debt Market Regulations",
        chapter: "Debt Trading Platforms",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_04",
    year: 2024,
    subject: "Economy",
    topic: "Capital Markets",
    subTopic: "Corporate Bonds & G-Secs Trading — Eligible Participants",
    styleTag: "conceptual",
    difficulty: "Medium",
    questionText:
      "In India, which of the following can trade in Corporate Bonds and Government Securities?\n\n1. Insurance Companies\n2. Pension Funds\n3. Retail Investors\n\nSelect the correct answer using the code given below:",
    options: [
      { id: "A", text: "1 and 2 only" },
      { id: "B", text: "2 and 3 only" },
      { id: "C", text: "1 and 3 only" },
      { id: "D", text: "1, 2 and 3" },
    ],
    correctOption: "D",
    explanation:
      "All three — Insurance Companies, Pension Funds, and Retail Investors — can trade in Corporate Bonds and Government Securities in India. Insurance Companies (Item 1): YES — IRDAI mandates insurance companies to invest a significant portion of their funds in government securities and approved corporate bonds. They are major institutional participants in the debt market. Pension Funds (Item 2): YES — PFRDA-regulated pension funds under the NPS framework invest in government securities and corporate bonds as part of their approved asset allocation. Pension funds are significant participants in the G-Sec market. Retail Investors (Item 3): YES — RBI launched the 'Retail Direct' scheme in 2021 allowing individual retail investors to directly open gilt accounts with RBI and purchase government securities (including T-bills and SDLs). SEBI has also enabled retail participation in corporate bond markets through exchanges. All three categories can legally trade in both corporate bonds and G-Secs.",
    sources: [
      {
        name: "RBI — Retail Direct Scheme",
        chapter: "Government Securities Market — Retail Participation",
      },
      {
        name: "SEBI — Corporate Bond Market",
        chapter: "Participants in Debt Markets",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_05",
    year: 2024,
    subject: "Economy",
    topic: "Basic Economics",
    subTopic: "Physical Capital — Fixed Capital vs Working Capital",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText:
      "With reference to physical capital in Indian economy, consider the following pairs:\n\n| Items | Category |\n|---|---|\n| 1. Farmer's plough | Working capital |\n| 2. Computer | Fixed capital |\n| 3. Yarn used by the weaver | Fixed capital |\n| 4. Petrol | Working capital |\n\nHow many of the above pairs are correctly matched?",
    options: [
      { id: "A", text: "Only one" },
      { id: "B", text: "Only two" },
      { id: "C", text: "Only three" },
      { id: "D", text: "All four" },
    ],
    correctOption: "B",
    explanation:
      "Only two pairs (2 and 4) are correctly matched. Fixed capital refers to tools, machines, buildings used in production over multiple production cycles — they do not get transformed in the production process. Working capital refers to raw materials and money in hand that are used up in a single production cycle. Pair 1 (Farmer's plough — Working capital): INCORRECT. A farmer's plough is a durable tool used over many seasons and does not get consumed in a single production cycle. It is FIXED capital, not working capital. Pair 2 (Computer — Fixed capital): CORRECT. A computer is a durable asset used over many production cycles without being transformed. It is Fixed capital. Pair 3 (Yarn used by the weaver — Fixed capital): INCORRECT. Yarn is a raw material that gets completely used up (transformed into cloth) in a single production cycle. It is WORKING capital, not fixed capital. Pair 4 (Petrol — Working capital): CORRECT. Petrol is consumed/used up in the production/operation process and must be replenished. It is working capital. Hence only pairs 2 and 4 are correctly matched.",
    sources: [
      {
        name: "NCERT Class IX — Economics",
        chapter: "The Story of Village Palampur — Physical Capital",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Factors of Production",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_06",
    year: 2024,
    subject: "Economy",
    topic: "Basic Economics",
    subTopic: "Total Fertility Rate — Definition",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText: "The total fertility rate in an economy is defined as:",
    options: [
      {
        id: "A",
        text: "The number of children born per 1000 people in the population in a year",
      },
      {
        id: "B",
        text: "The number of children born to a woman during her lifetime if she were to live to the end of her childbearing years and bear children at each age according to the prevailing age-specific fertility rates",
      },
      {
        id: "C",
        text: "The ratio of the number of births in a year to the number of women of childbearing age",
      },
      {
        id: "D",
        text: "The total number of children born per 1000 women in the 15–49 age group",
      },
    ],
    correctOption: "B",
    explanation:
      "The Total Fertility Rate (TFR) is defined as the average number of children that would be born to a woman during her entire reproductive lifetime (typically ages 15–49), if she were to experience the current age-specific fertility rates throughout her childbearing years and survive through them all. It is a summary measure of current fertility patterns. Option A describes the Crude Birth Rate. Option C is close to the General Fertility Rate. Option D is similar to the Child-Woman Ratio. The TFR is important for population policy — a TFR of 2.1 represents the 'replacement level' (the rate at which a population exactly replaces itself). India's TFR has fallen below 2.0 in recent years according to NFHS-5 data.",
    sources: [
      {
        name: "NCERT Class XII — Sociology / Demography",
        chapter: "Population & Demographic Concepts",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Population & Human Development",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_07",
    year: 2024,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "Foreign Banks in India — RBI Rules for WOS",
    styleTag: "statement_pairing",
    difficulty: "Hard",
    questionText:
      "With reference to the rule/rules imposed by the Reserve Bank of India while treating foreign banks, consider the following statements:\n\n1. There is no minimum capital requirement for wholly owned banking subsidiaries in India.\n2. For wholly owned banking subsidiaries in India, at least 50% of the board members should be Indian nationals.\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "2 only" },
      { id: "C", text: "Both 1 and 2" },
      { id: "D", text: "Neither 1 nor 2" },
    ],
    correctOption: "B",
    explanation:
      "Only Statement 2 is correct; Statement 1 is incorrect. Statement 1 is incorrect: There IS a minimum capital requirement for Wholly Owned Subsidiaries (WOS) of foreign banks in India. As per RBI's framework for wholly owned banking subsidiaries, the minimum paid-up voting equity capital requirement is ₹500 crore (at the time of setting up). Saying there is 'no minimum capital requirement' is factually wrong — this would be contrary to basic prudential banking regulation. Statement 2 is correct: Under RBI's guidelines for WOS of foreign banks in India, at least 50% of the board of directors should be Indian nationals. This is a governance requirement to ensure adequate local knowledge and accountability. This is consistent with RBI's licensing conditions for foreign bank subsidiaries operating in India.",
    sources: [
      {
        name: "RBI — Framework for Wholly Owned Subsidiaries of Foreign Banks",
        chapter: "Licensing Conditions & Governance Norms",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Banking Sector — Foreign Banks in India",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_08",
    year: 2024,
    subject: "Economy",
    topic: "Basic Economics",
    subTopic:
      "Sectors of Economy — Primary, Secondary, Tertiary Classification",
    styleTag: "conceptual",
    difficulty: "Easy",
    questionText:
      "With reference to the sectors of the Indian economy, consider the following pairs:\n\n| Economic activity | Sector |\n|---|---|\n| 1. Storage of agricultural produce | Secondary |\n| 2. Dairy farm | Primary |\n| 3. Mineral exploration | Tertiary |\n| 4. Weaving cloth | Secondary |\n\nHow many of the pairs given above are correctly matched?",
    options: [
      { id: "A", text: "Only one" },
      { id: "B", text: "Only two" },
      { id: "C", text: "Only three" },
      { id: "D", text: "All four" },
    ],
    correctOption: "B",
    explanation:
      "Only two pairs (2 and 4) are correctly matched. The three sectors: Primary = extraction/production from nature (agriculture, mining, fishing, dairy, forestry). Secondary = manufacturing/processing/construction (transforms raw materials). Tertiary = services (trade, transport, banking, storage, communication). Pair 1 (Storage of agricultural produce — Secondary): INCORRECT. Storage of agricultural produce is a SERVICE activity — it belongs to the TERTIARY sector. It does not involve transformation of goods, just preservation/warehousing. Pair 2 (Dairy farm — Primary): CORRECT. Dairy farming involves the extraction of milk directly from nature (animals). It is a primary sector activity. Pair 3 (Mineral exploration — Tertiary): INCORRECT. Mineral exploration is the process of searching for and discovering mineral deposits — it is an extractive/primary sector activity. It belongs to the PRIMARY sector (along with mining). Pair 4 (Weaving cloth — Secondary): CORRECT. Weaving involves transforming yarn (a raw material) into cloth (a manufactured product). This is clearly a secondary sector (manufacturing) activity. Hence only pairs 2 and 4 are correctly matched.",
    sources: [
      {
        name: "NCERT Class X — Economics",
        chapter: "Sectors of the Indian Economy",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Structure of Indian Economy",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_09",
    year: 2024,
    subject: "Economy",
    topic: "International Trade & Organisations",
    subTopic: "International Grains Council — India's Membership",
    styleTag: "statement_pairing",
    difficulty: "Hard",
    questionText:
      "Consider the following statements:\n\n1. India is a member of the International Grains Council.\n2. A country needs to be a member of the International Grains Council for exporting or importing rice and wheat.\n\nWhich of the statements given above is/are correct?",
    options: [
      { id: "A", text: "1 only" },
      { id: "B", text: "2 only" },
      { id: "C", text: "Both 1 and 2" },
      { id: "D", text: "Neither 1 nor 2" },
    ],
    correctOption: "A",
    explanation:
      "Only Statement 1 is correct; Statement 2 is incorrect. Statement 1 is correct: India IS a member of the International Grains Council (IGC), headquartered in London. The IGC was established under the Grains Trade Convention and works to promote international cooperation in grain trade, improve market transparency, and ensure food security. India, as one of the world's largest producers of wheat and rice, participates in the IGC. Statement 2 is incorrect: Membership of the International Grains Council is NOT required for a country to export or import rice and wheat. The IGC is an intergovernmental forum/information-sharing body, NOT a trade regulatory body that controls or licenses grain trade. Countries can freely export and import grains regardless of IGC membership. The IGC facilitates cooperation and information sharing, not trade permissions.",
    sources: [
      {
        name: "International Grains Council — Overview",
        chapter: "IGC Membership & Functions",
      },
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "International Trade Organisations",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_10",
    year: 2024,
    subject: "Economy",
    topic: "International Finance",
    subTopic: "US Treasury Bonds — Default Risk & Hard Asset Backing",
    styleTag: "statement_pairing",
    difficulty: "Medium",
    questionText:
      "Consider the following statements:\n\nStatement-I: If the United States of America (USA) were to default on its debt, holders of US Treasury Bonds will not be able to exercise their claims to receive payment.\nStatement-II: The USA Government debt is not backed by any hard assets, but only by the faith of the Government.\n\nWhich one of the following is correct in respect of the above statements?",
    options: [
      {
        id: "A",
        text: "Both Statement-I and Statement-II are correct and Statement-II is the correct explanation for Statement-I",
      },
      {
        id: "B",
        text: "Both Statement-I and Statement-II are correct but Statement-II is not the correct explanation for Statement-I",
      },
      { id: "C", text: "Statement-I is correct but Statement-II is incorrect" },
      { id: "D", text: "Statement-I is incorrect but Statement-II is correct" },
    ],
    correctOption: "A",
    explanation:
      "Both statements are correct AND Statement II is the correct explanation for Statement I. Statement I is correct: US Treasury Bonds are sovereign debt instruments — they represent the US government's promise to repay. In the event of a sovereign default, the US government would cease to make contractual payments on these bonds. Bondholders would NOT be able to enforce payment through conventional legal mechanisms against a sovereign — sovereign immunity limits legal recourse. So in a default scenario, holders truly cannot exercise payment claims effectively. Statement II is correct: US Treasury securities are backed purely by 'the full faith and credit of the United States government' — a legal and political commitment. Unlike corporate bonds (which may be backed by assets) or mortgage-backed securities (backed by property), US Government debt has NO specific hard asset collateral. It is backed solely by the government's taxing power, monetary authority, and political credibility. The causal link: Because US debt is backed ONLY by governmental faith (II) and NOT by hard assets, if the government defaults (i.e., that faith is broken), bondholders have NO underlying asset to claim against (I).",
    sources: [
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "International Financial System & Sovereign Debt",
      },
      {
        name: "Current Affairs",
        chapter: "US Debt Ceiling Debates & Sovereign Debt",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_11",
    year: 2024,
    subject: "Economy",
    topic: "International Trade & Agriculture",
    subTopic: "Apple Imports from USA; GM Food Import Regulations in India",
    styleTag: "statement_pairing",
    difficulty: "Hard",
    questionText:
      "Consider the following statements:\n\nStatement-I: India does not import apples from the United States of America.\nStatement-II: In India, the law prohibits the import of Genetically Modified food without the approval of the competent authority.\n\nWhich one of the following is correct in respect of the above statements?",
    options: [
      {
        id: "A",
        text: "Both Statement-I and Statement-II are correct and Statement-II is the correct explanation for Statement-I",
      },
      {
        id: "B",
        text: "Both Statement-I and Statement-II are correct but Statement-II is not the correct explanation for Statement-I",
      },
      { id: "C", text: "Statement-I is correct but Statement-II is incorrect" },
      { id: "D", text: "Statement-I is incorrect but Statement-II is correct" },
    ],
    correctOption: "A",
    explanation:
      "Both statements are correct AND Statement II is the correct explanation for Statement I. Statement I is correct: India does NOT import apples from the USA. This is because US apples are often grown using Genetically Modified (GM) technology and/or treated with certain chemicals (like diphenylamine/DPA) that are not approved in India. India has strict regulations under the Food Safety and Standards Act (FSSAI) and Environment Protection Act (Rule 7B under the Environment Protection Act, 1989 — the GM Rules, 1989) that prohibit import of GM food without approval. Since US apples may be GM or grown with unapproved chemicals, they are effectively barred. India primarily imports apples from China, Iran, and Afghanistan. Statement II is correct: Under India's regulatory framework — specifically the Rules for the Manufacture, Use, Import, Export and Storage of Hazardous Microorganisms, Genetically Engineered Organisms or Cells, 1989 (framed under the EPA, 1986) and FSSAI regulations — import of GM food is prohibited without prior approval of the competent authority (GEAC — Genetic Engineering Appraisal Committee). Statement II explains Statement I: India doesn't import US apples (I) BECAUSE Indian law prohibits GM food imports without approval (II) and US apples may be GM-origin or treated with unapproved substances.",
    sources: [
      {
        name: "FSSAI — GM Food Regulations",
        chapter: "Import of Genetically Modified Foods",
      },
      {
        name: "Current Affairs",
        chapter: "India-USA Trade — Agricultural Imports",
      },
    ],
  },
  {
    _id: "pyq_economy_2024_12",
    year: 2024,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "Syndicated Lending — Features",
    styleTag: "statement_pairing",
    difficulty: "Medium",
    questionText:
      "Consider the following statements:\n\nStatement-I: Syndicated lending spreads the risk of borrower default across multiple lenders.\nStatement-II: The syndicated loan can be a fixed amount/lump sum of funds, but cannot be a credit line.\n\nWhich one of the following is correct in respect of the above statements?",
    options: [
      {
        id: "A",
        text: "Both Statement-I and Statement-II are correct and Statement-II is the correct explanation for Statement-I",
      },
      {
        id: "B",
        text: "Both Statement-I and Statement-II are correct but Statement-II is not the correct explanation for Statement-I",
      },
      { id: "C", text: "Statement-I is correct but Statement-II is incorrect" },
      { id: "D", text: "Statement-I is incorrect but Statement-II is correct" },
    ],
    correctOption: "C",
    explanation:
      "Statement I is correct; Statement II is incorrect. Statement I is correct: Syndicated lending is a loan extended by a group (syndicate) of lenders — typically banks and financial institutions — to a single borrower. The key feature and primary advantage of syndication is that it distributes the credit/default risk of a large loan across multiple lenders. No single bank bears the entire risk exposure. This allows financing of large projects that would be too risky or too large for any single lender. Statement II is incorrect: A syndicated loan can take MULTIPLE forms — it is NOT restricted to a fixed amount/lump sum. Syndicated loans can be structured as: (a) Term loans (fixed lump sum), (b) Revolving credit facilities (credit line), or (c) Letters of credit. A revolving credit facility (credit line) is a very common form of syndicated loan, where the borrower can draw down, repay, and redraw funds up to a specified limit. The statement that it 'cannot be a credit line' is factually wrong.",
    sources: [
      {
        name: "Ramesh Singh — Indian Economy",
        chapter: "Banking — Loan Structures & Syndication",
      },
      { name: "Current Affairs", chapter: "Syndicated Loans in India" },
    ],
  },
  {
    _id: "pyq_economy_2024_13",
    year: 2024,
    subject: "Economy",
    topic: "Banking & Financial Systems",
    subTopic: "Digital Rupee (e-Rupee / CBDC) — Features",
    styleTag: "statement_pairing",
    difficulty: "Medium",
    questionText:
      "Consider the following statements in respect of the digital rupee:\n\n1. It is a sovereign currency issued by the Reserve Bank of India (RBI) in alignment with its monetary policy.\n2. It appears as a liability on the RBI's balance sheet.\n3. It is insured against inflation by its very design.\n4. It is freely convertible against commercial bank money and cash.\n\nWhich of the statements given above are correct?",
    options: [
      { id: "A", text: "1 and 2 only" },
      { id: "B", text: "1 and 3 only" },
      { id: "C", text: "1, 2 and 4 only" },
      { id: "D", text: "2, 3 and 4 only" },
    ],
    correctOption: "C",
    explanation:
      "Statements 1, 2, and 4 are correct; Statement 3 is incorrect. Statement 1 is correct: The Digital Rupee (e₹ or CBDC — Central Bank Digital Currency) is India's sovereign digital currency issued by the RBI. It is legal tender, just like physical currency notes, and is issued in alignment with the RBI's monetary policy objectives. Statement 2 is correct: Like physical currency notes, the Digital Rupee appears as a LIABILITY on the RBI's balance sheet — because the RBI owes the bearer the value represented. Currency in circulation is always a central bank liability. Statement 3 is incorrect: The Digital Rupee has NO built-in inflation protection by design. It is a digital form of fiat currency, which means it is subject to the same inflation dynamics as physical currency. Its value depreciates with inflation just like paper money — there is no algorithmic or structural inflation hedge in the e-Rupee, unlike some cryptocurrencies that claim deflationary design. Statement 4 is correct: The Digital Rupee is designed to be fully convertible — at par — with commercial bank money (bank deposits) and physical cash at a 1:1 ratio. This is a fundamental design feature ensuring that one unit of e-Rupee always equals one rupee in any other form.",
    sources: [
      {
        name: "RBI — CBDC Concept Note",
        chapter: "Central Bank Digital Currency — Design & Features",
      },
      {
        name: "Current Affairs",
        chapter: "Digital Rupee Pilot — e-Rupee Features",
      },
    ],
  },
];

export default economyPYQData;
