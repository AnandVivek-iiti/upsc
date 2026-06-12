/**
 * mainsGS4Data.js
 * UPSC Mains GS Paper 4 (Ethics) — 2024
 *
 * Schema (descriptive / Mains variant):
 * {
 *   _id          : string   — unique identifier
 *   year         : number
 *   paper        : string   — "GS Paper 4"
 *   subject      : string   — broad subject tag
 *   topic        : string   — more specific topic for filter chips
 *   subTopic     : string   — shown as small badge on card
 *   marks        : number   — 10, 20
 *   questionText : string   — full question as printed
 *   directive    : string   — "Discuss" | "Examine" | "Case Study" | etc.
 *   wordLimit    : number   — suggested word limit
 *   idealAnswer  : string   — structured model answer (shown only after user reveals)
 *   keyPoints    : string[] — bullet checklist of must-cover points
 *   sources      : { name, chapter }[]
 * }
 */

const mainsGS4Data = [
  // ─── CASE STUDIES (20 MARKS) ─────────────────────────────────────────────

  {
    _id: "mains_gs4_2024_01",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Case Study",
    topic: "Professional Ethics",
    subTopic: "Research Ethics — Data Manipulation",
    marks: 20,
    directive: "Case Study",
    wordLimit: 200,
    questionText:
      "Dr. Srinivasan is a senior scientist working for a reputed biotechnology company known for its cutting-edge research in pharmaceuticals. Dr. Srinivasan is heading a research team working on a new drug aimed at treating a rapidly spreading variant of a new viral infectious disease. The disease has been rapidly spreading across the world and the cases reported in the country are increasing. There is huge pressure on Dr. Srinivasan's team to expedite the trials for the drug as there is significant market for it, and the company wants to get the first-mover advantage in the market. During a team meeting, some senior team members suggest some shortcut for expediting the clinical trials for the drug and for getting the requisite approvals. These include manipulating data to exclude some negative outcomes and selectively reporting positive results, foregoing the process of informed consent and using compounds already patented by a rival company, rather than developing one's own component. Dr. Srinivasan is not comfortable taking such shortcuts, at the same time he realises meeting the targets is impossible without using these means.\n\n(a) What would you do in such a situation?\n(b) Examine your options and consequences in the light of the ethical questions involved.\n(c) How can data ethics and drug ethics save humanity at large in such a scenario?",
    keyPoints: [
      "Ethical dimensions: scientific integrity, informed consent, patient safety, corporate pressure vs professional duty",
      "Options: comply with shortcuts (consequentialist rationalisation), refuse and report to ethics committee/regulator, seek extension/resources",
      "Data ethics: falsification/fabrication are cardinal sins in science; consequences of bad drug approvals (Thalidomide precedent)",
      "Drug ethics: Helsinki Declaration, ICMR guidelines, CDSCO regulatory framework",
      "Whistleblower protection, role of institutional ethics committees",
      "Answer to (a): Refuse shortcuts; escalate to company ethics board and CDSCO if necessary",
    ],
    idealAnswer: `Introduction:
Dr. Srinivasan faces a classic conflict between professional integrity/patient safety and institutional/commercial pressure. The case involves violations of research ethics (data manipulation), medical ethics (informed consent), and IP law (patent infringement) — each with potentially catastrophic consequences.

(a) What Would I Do?

As Dr. Srinivasan, I would:
1. Firmly refuse to endorse the suggested shortcuts — data manipulation, bypassing informed consent, and patent infringement are not merely procedural violations but fundamental ethical and legal breaches.
2. Convene an emergency meeting with the research team to articulate the ethical and legal risks — creating a documented record of my objection.
3. Escalate to the company's internal ethics committee and Board of Directors, explaining that the proposed shortcuts risk both public health catastrophe and legal/reputational ruin for the company.
4. Negotiate for a time extension or additional resources (parallel clinical trial arms, expanded trial sites) that might accelerate timelines without compromising integrity.
5. If the company proceeds despite my objections, report to CDSCO (Central Drugs Standard Control Organisation) and, if necessary, act as a whistleblower — accepting personal risk in service of the larger public good.
6. I would not resign silently — exit without disclosure would leave the problem unsolved and harm future patients.

Guiding value: The Hippocratic principle — "First, do no harm" — applies as much to a pharmaceutical researcher as to a practising physician.

(b) Options and Consequences — Ethical Analysis:

Option 1: Comply with Shortcuts (the path of least resistance):
- Apparent benefit: Meets deadlines, preserves job security, company gains first-mover advantage.
- Ethical violations: Scientific misconduct (fabrication/falsification of data); violation of informed consent (violates autonomy, a core bioethical principle); patent infringement (legal liability).
- Consequences:
  * A drug approved on manipulated data may be ineffective or harmful — potential mass casualties (Thalidomide analogy: a sedative approved without adequate testing caused 10,000+ birth defects).
  * If discovered, company faces criminal prosecution, massive product liability, and reputational ruin.
  * Dr. Srinivasan faces personal criminal liability under Drugs and Cosmetics Act, IPC (for causing harm), and scientific misconduct rules.
  * Erosion of public trust in science — with long-term civilisational cost.

Option 2: Partial Refusal (comply on some shortcuts, refuse others):
- Ethically incoherent — each shortcut is independently dangerous. Selective compliance is not integrity.
- Creates personal complicity in violations you nominally oppose.

Option 3: Full Ethical Refusal with Escalation (recommended):
- Ethical basis: Deontological (integrity as an absolute duty), consequentialist (preventing mass harm), virtue ethics (courage as a professional virtue).
- Consequences:
  * Short-term cost: job risk, missed deadline, professional friction.
  * Long-term benefit: public safety protected; company shielded from catastrophic liability; institutional trust in clinical trials preserved.
  * Whistleblower protections (limited in India but available under Public Interest Disclosure Act for government; company ethics mechanisms for private sector).

Key ethical principles engaged:
- Autonomy: Informed consent is non-negotiable — trial participants have an absolute right to understand what they are consenting to.
- Beneficence/Non-maleficence: Manipulated data produces a dangerous drug — violating both principles.
- Justice: Trial subjects should not be put at risk to benefit commercial interests.
- Scientific Integrity: Fabrication/falsification/plagiarism (including patent infringement) are the three cardinal sins of research ethics.

(c) How Data Ethics and Drug Ethics Save Humanity:

Data Ethics in Pharmaceutical Research:
Data is the foundation of drug development. Manipulated data produces a false foundation — leading to approvals of ineffective or harmful drugs that reach millions. The COVID-19 vaccine development process — despite unprecedented speed — maintained rigorous data integrity under extraordinary scrutiny, and vaccines (Covishield, Covaxin) were both effective and acceptably safe. This demonstrates that speed and integrity are not incompatible.
Data ethics frameworks: ICMR National Ethical Guidelines (2017), Good Clinical Practice (GCP) guidelines, WHO International Standards for Clinical Trial Registries. Institutional Review Boards (IRBs/IECs) provide independent oversight.

Drug Ethics — Helsinki Declaration and Beyond:
The Declaration of Helsinki (1964, regularly revised) establishes the fundamental ethical principles for medical research on human subjects: primacy of patient welfare, informed consent, independent ethics committee oversight, and post-trial access. India's CDSCO mandates compliance with these principles for all clinical trials under Schedule Y of Drugs and Cosmetics Rules.

Systemic Importance:
1. Public Trust: If drugs reach the market via manipulated trials, and adverse effects emerge later, public trust in vaccines, drugs, and pharmaceutical science collapses — as seen in the anti-vaccine movement, partially fuelled by the discredited Wakefield study.
2. Regulatory Integrity: Honest data enables regulators (CDSCO, WHO, FDA) to make evidence-based decisions — protecting global populations.
3. Future Research: Fraudulent data pollutes the scientific literature, causing other researchers to build on false foundations — with cascading errors.

Conclusion: Dr. Srinivasan's choice is not merely personal — it determines whether the drug development system serves or endangers humanity. Data ethics and drug ethics are not obstacles to innovation; they are the infrastructure of trustworthy science. Institutional frameworks must support individual integrity: whistleblower protection, independent IRBs, regulatory enforcement, and a culture where "speaking up" is rewarded, not penalised.`,
    sources: [
      { name: "ICMR National Ethical Guidelines for Biomedical Research 2017", chapter: "Research Integrity" },
      { name: "Declaration of Helsinki", chapter: "Core Principles" },
      { name: "Drugs and Cosmetics Act 1940 / Schedule Y", chapter: "Clinical Trials" },
    ],
  },

  {
    _id: "mains_gs4_2024_02",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Case Study",
    topic: "Administrative Ethics",
    subTopic: "Water Crisis and Stakeholder Conflict",
    marks: 20,
    directive: "Case Study",
    wordLimit: 200,
    questionText:
      "With the summer heat being exceptionally severe this year, the district has been facing severe water shortage. The District Collector has been mobilizing his subordinate officials to conserve the remaining water reserves for preventing the district from plunging into acute drinking water crisis.\nAlong with an awareness campaign for conserving water, strict measures have been taken for stopping the over-exploitation of ground-water. Vigilance teams have been deployed to tour the villages and find the farmers who are drawing water from deep borewells or from the river reservoir for irrigation. The farmers are agitated by such action. A delegation of farmers meets the District Collector with their issues and complains that while they are not being allowed to irrigate their crops, big industries located near the river are drawing huge amounts of water through deep borewells for their industrial processes. The farmers allege that their administration is anti-farmer and corrupt, being bribed by the industry. The district needs to placate the farmers as they are threatening to go on a prolonged protest. At the same time, the District Collector has to deal with the water crisis. The industry cannot be closed as this would result in a large number of workers being unemployed.\n\n(a) Discuss all options available to the District Collector as a District Magistrate.\n(b) What suitable actions can be taken in view of mutually compatible interests of the stakeholders?\n(c) What are the potential administrative and ethical dilemmas for the District Collector?",
    keyPoints: [
      "Stakeholders: farmers, industry, workers, district administration, general public",
      "Administrative options: equitable rationing, impartial enforcement, water audit, emergency measures",
      "Ethical dilemmas: rule of law vs. economic impact, perception of bias, accountability",
      "Suitable action: water audit of all sources; proportional rationing; transparent enforcement; joint monitoring committee",
      "Legal framework: Disaster Management Act 2005, Essential Services; Water Acts",
      "Values: impartiality, transparency, equity, accountability",
    ],
    idealAnswer: `Introduction:
The District Collector (DC) faces a multi-dimensional crisis — water scarcity, farmer agitation, industrial water use, and allegations of corruption. The core ethical tension is between equitable enforcement of water conservation rules and the economic imperatives of both farming and industrial employment.

(a) Options Available to the District Collector as District Magistrate:

Option 1: Immediate Water Audit:
Commission an independent, transparent audit of water extraction by ALL entities in the district — including industries — with meter readings, SCADA data (if available), and drone-based reservoir monitoring. This is the most important first step to establish facts before taking action.

Option 2: Proportional and Uniform Enforcement:
Apply water conservation restrictions equitably: if farmers are restricted from drawing irrigation water, industries must also face proportional restrictions on non-essential water use. No actor should be above the law. Issue formal orders under Section 144 CrPC (as DM) restricting groundwater extraction beyond notified limits for all.

Option 3: Emergency Drinking Water Prioritisation:
Under the Disaster Management Act 2005, declare a water crisis and requisition water tankers, prioritise drinking water for all residents, and create temporary rationing for agriculture and industry alike.

Option 4: Stakeholder Consultation and Transparent Communication:
Convene a multi-stakeholder meeting — farmers, industry representatives, civil society — to present the water audit findings transparently, explain the crisis, and jointly develop a water rationing protocol.

Option 5: Investigate Corruption Allegations:
Order an inquiry into the specific allegation that industry received preferential treatment due to bribery — this is non-negotiable for the DC's credibility. Refer to Vigilance/CBI if prima facie evidence exists.

Option 6: Industry Negotiation for Voluntary Water Conservation:
Engage industries in voluntary water use reduction targets with a public commitment — industries reducing consumption could receive recognition and regulatory goodwill in future.

(b) Actions for Mutually Compatible Interests:

The core insight is that all stakeholders — farmers, industry, workers, and the general public — share a common interest in the district not suffering an acute water crisis. Possible win-win actions:

1. Water Rationing Schedule:
Create a transparent, time-tabled water rationing schedule — different sectors (agriculture, industry, domestic) get scheduled windows — equitable distribution that no sector can claim is discriminatory.

2. Drinking Water Priority Protocol:
Establish a non-negotiable priority for drinking water for all residents — above agriculture and industry. This is legally and morally unchallengeable.

3. Industry-Agriculture Water Exchange:
Negotiate with industries to release treated water (from ETP output) for agriculture, in exchange for reduced restrictions on raw water intake — circular water economy approach.

4. Joint Monitoring Committee:
Create a district-level water crisis committee with farmer representatives, industry representatives, and local administration — ensuring all actions are witnessed and contested by all parties, reducing corruption perception.

5. Government Compensation for Crop Loss:
Invoke PM Fasal Bima Yojana and district calamity fund mechanisms to compensate farmers for crop losses due to water restriction — softening the economic blow.

(c) Administrative and Ethical Dilemmas:

1. Rule of Law vs. Economic Harm:
Strictly enforcing water restrictions on industry may cause worker unemployment — a serious economic harm. But exempting industry perpetuates the farmers' legitimate grievance and undermines equal application of law. Dilemma: how much economic disruption is justifiable in the name of equitable enforcement?

2. Perception of Corruption and Integrity:
The farmers' allegation of corruption, even if unsubstantiated, damages administrative credibility. If the DC does not investigate transparently, the allegation festers — but investigation may also be perceived as politically motivated. Ethical demand: transparency and accountability without prejudgement.

3. Short-term Public Order vs. Long-term Water Security:
The DC faces pressure to "placate" farmers threatening protest — but short-term appeasement (relaxing restrictions on farmers) may worsen the water crisis. Ethical duty: hold the long-term public interest above immediate political pressure.

4. Authority and Accountability:
The DC has significant DM powers (Section 144, requisition) but using them too aggressively risks backlash. Using them too leniently allows the crisis to worsen. Dilemma of calibrating authority with accountability.

5. Conflict of Interest Risk:
If there is any possibility of personal benefit to the DC or subordinates from industrial connections, this must be proactively disclosed and recused — preserving institutional integrity.

Conclusion: The District Collector must prioritise: (i) factual water audit over assumptions; (ii) transparent, equitable enforcement across all sectors; (iii) credible investigation of corruption allegations; and (iv) stakeholder dialogue over unilateral decision-making. The ethical compass must be: serve the public interest, not any specific interest group — and demonstrate that impartiality through visible, documented action.`,
    sources: [
      { name: "Disaster Management Act 2005", chapter: "District Collector Powers" },
      { name: "CrPC Section 144", chapter: "Magistrate's Powers" },
      { name: "2nd ARC Report", chapter: "Crisis Management and Ethics" },
    ],
  },

  {
    _id: "mains_gs4_2024_03",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Case Study",
    topic: "Corporate Ethics",
    subTopic: "Conflict of Interest in Procurement",
    marks: 20,
    directive: "Case Study",
    wordLimit: 200,
    questionText:
      "Sneha is a Senior Manager working for a big reputed hospital chain in a mid-sized city. She has been made in-charge of the new super speciality center that the hospital is building with state-of-the art equipment and world class medical facilities. The building has been reconstructed and she is starting the process of procurement for various equipment and machines. As the head of the committee responsible for procurement, she has invited bids from all the interested reputed vendors dealing in medical equipment. She notices that her brother, who is a well-known supplier in this domain, has also sent his expression of interest. Since the hospital is privately owned, it is not mandatory for her to select only the lower bidder. Also, she is aware that her brother's company has been facing some financial difficulties and a big supply order will help him recover. At the same time, allocating the contract to her brother might bring charges of favouritism against her and tarnish her image. The hospital management trusts her fully and would support any decision of hers.\n\n(a) What should be Sneha's course of action?\n(b) How would she justify what she chooses to do?\n(c) In this case, how is medical ethics compromised with vested personal interest?",
    keyPoints: [
      "Conflict of interest: personal relationship (brother) vs. professional fiduciary duty",
      "Options: recuse herself; allow brother to bid with full disclosure; exclude brother preemptively",
      "Best practice: mandatory disclosure to hospital management; recusal from evaluation of brother's bid",
      "Medical ethics dimension: procurement decision affects quality of patient care equipment",
      "Justification framework: integrity, transparency, impartiality",
      "Even if brother's bid is best, perception of bias undermines institutional trust",
    ],
    idealAnswer: `Introduction:
Sneha faces a textbook conflict of interest — her personal loyalty to her brother and his financial difficulty on one side, and her professional duty of impartial procurement on the other. The hospital management's trust in her makes this more, not less, complex — as it removes an external check on her decision.

(a) Sneha's Recommended Course of Action:

Step 1 — Mandatory Disclosure:
Sneha must immediately disclose to the hospital management (specifically, to the Board or her superior, not just informally) that her brother's company has submitted a bid. This disclosure is non-negotiable — concealing it, even if she ultimately selects a different vendor, violates transparency norms and creates a latent conflict that could resurface later.

Step 2 — Recusal from Evaluation of Brother's Bid:
Even if Sneha is the procurement committee head, she must recuse herself from all stages of evaluation and deliberation involving her brother's bid. Another senior manager or an external expert should handle this bid's assessment independently.

Step 3 — Allow the Process to Run Fairly:
Subject to recusal, the competitive bidding process should proceed normally — Sneha's brother's company should neither be excluded (which could also be perceived as bias against him) nor favoured. The independent evaluator assesses the bid on merit.

Step 4 — Document Everything:
Sneha should ensure that all communications, decisions, and recusals are documented — creating an audit trail that protects her from allegations of either favouritism or unfair exclusion.

What Sneha should NOT do:
- Unilaterally select her brother's company without disclosure.
- Unilaterally exclude her brother's company without disclosure (this is also a form of bias).
- Rely on the hospital management's informal trust to bypass proper disclosure.
- Allow personal sympathy for her brother's financial difficulties to override professional judgment.

(b) Justification for the Chosen Course of Action:

Sneha would justify her course of action on multiple ethical grounds:

1. Deontological Justification (Duty-Based):
As a senior manager entrusted with a fiduciary duty to the hospital, she has an absolute obligation of impartiality in procurement. This duty does not diminish because the hospital is private or because management trusts her. The Kantian categorical imperative asks: what if all senior managers favoured relatives in procurement? The institution would collapse.

2. Virtue Ethics:
A person of integrity does not wait for external rules to compel right behaviour — she does what is right because it is right. Disclosing and recusing is the action of a person with integrity. Concealing or manipulating is the action of someone who prioritises self-interest over character.

3. Consequentialist Justification:
Even if her brother's equipment is genuinely the best — if she selects it without disclosure and recusal, the perception of bias will damage her reputation, the hospital's reputation, and institutional trust in procurement processes. The consequences of appearance are as real as the consequences of action.

4. Medical Ethics Dimension:
In a hospital setting, procurement decisions directly affect patient outcomes — substandard equipment harms patients. This adds a dimension of medical responsibility to what might otherwise seem like an internal management issue.

(c) How Medical Ethics is Compromised by Vested Personal Interest:

Medical Ethics Principles at Stake:
1. Non-Maleficence (Do No Harm): Compromising equipment procurement quality to benefit a relative risks patient safety — patients harmed by faulty equipment are indirect victims of the conflict of interest.
2. Beneficence: A hospital's mission is patient welfare. Procurement decisions should maximise this — not personal relationships.
3. Justice: Fair procurement ensures that the best equipment is purchased at the best value — patients and the institution receive what they deserve.
4. Autonomy (Institutional): Patients who choose a hospital trust it to maintain institutional integrity throughout — including procurement. A conflict of interest, if it leads to inferior equipment, violates that trust.

The Slippery Slope:
When personal interest is allowed to influence medical procurement decisions, it sets a precedent — next time, it's a medical director's spouse's pharmaceutical company getting a supply contract. The systemic effect of unchecked conflicts of interest in healthcare is a degradation of the care quality and public trust that healthcare systems depend on.

Conclusion: Sneha's ethical obligation is clear — disclose and recuse. This protects her brother from accusations of having benefited unfairly (if he wins) or of being excluded unfairly (if he loses), and it protects Sneha's integrity and the hospital's institutional credibility. True professional friendship to her brother is not awarding him the contract; it is ensuring the process is clean enough that any award he receives is beyond challenge.`,
    sources: [
      { name: "Beauchamp and Childress — Principles of Biomedical Ethics", chapter: "Core Principles" },
      { name: "2nd ARC Report on Ethics in Governance", chapter: "Conflict of Interest" },
      { name: "CVC Guidelines on Procurement Integrity", chapter: "Conflict of Interest Provisions" },
    ],
  },

  {
    _id: "mains_gs4_2024_04",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Case Study",
    topic: "Law Enforcement Ethics",
    subTopic: "Left-Wing Extremism — Operational Dilemma",
    marks: 20,
    directive: "Case Study",
    wordLimit: 200,
    questionText:
      "With multipronged strategy of the Central and State Governments specially in the last few years, the naxalite problem has been resolved to a large extent in the affected states of the country. However, there are a few pockets in certain states where naxalite problem still persists, mainly due to involvement of foreign countries. Rohit is posted as SP (Special Operations) for the last one year, in one of the districts which is still affected by the naxalite problem...[A delegation of tribal women surrounds the operation demanding release of captured naxalites, with risk of civilian casualties if situation escalates].\n\n(a) What are the options available with Rohit to cope with the situation?\n(b) What are the ethical dilemmas being faced by Rohit?\n(c) Which of the options, do you think, would be more appropriate for Rohit to adopt and why?\n(d) In the present situation, what are the extra precautionary measures to be taken by the police in dealing with women protesters?",
    keyPoints: [
      "Operational options: maintain cordon, attempt de-escalation, partial negotiation",
      "Ethical dilemmas: rule of law vs. civilian safety, use of force against women protesters, custody of hardened criminals",
      "Best option: de-escalate, maintain non-violent cordon, continue attempting superior contact",
      "Extra precautions for women protesters: women police officers, minimum force, no lathi charge, dialogue",
      "Values: rule of law, restraint, proportionality, accountability",
      "Legal framework: CRPF rules of engagement, human rights law",
    ],
    idealAnswer: `Introduction:
Rohit, as SP (Special Operations), faces an acute operational and ethical crisis — caught between the imperative to secure dangerous naxalites (one of the core duties of law enforcement) and the immediate risk of civilian casualties if the situation with tribal women protesters escalates.

(a) Options Available to Rohit:

Option 1: Maintain Non-Violent Cordon and Attempt De-Escalation:
Hold the security perimeter firmly without advancing aggressively. Deploy women police officers to engage with women protesters. Attempt dialogue through community leaders, gram pradhans, or local trusted individuals. Continue attempting to reach the IG through alternative communication (satellite phone, message via another sub-division).

Option 2: Secure Naxalites and Facilitate Safe Passage for Women:
Secure the captured naxalites in a safe inner area while gently creating a passage for women to approach and inspect (within limits) — demonstrating transparency, reducing the sense that something violent is being hidden, and allowing the protest energy to dissipate.

Option 3: Phased Withdrawal with Retained Custody:
Begin a controlled, orderly retreat with the naxalites in custody toward a safer location (police vehicle, alternative secure point) while de-escalating through dialogue — reducing the confrontational standoff without releasing the naxalites.

Option 4: Release of Lower-Risk Naxalites (Not Recommended):
Release non-hardcore naxalites (if any) as a goodwill gesture while retaining the two most dangerous ones — this is a partial concession that might reduce tension while not fully compromising the mission.

Option 5: Use of Force to Disperse Crowd:
Deploy tear gas, water cannon, or lathi charge to disperse the crowd. This is the LAST resort — disproportionate force on unarmed civilian women would be illegal under CRPF rules of engagement, violate human rights norms, and inflame the situation catastrophically.

Option 6: Complete Release of All Naxalites (Not Acceptable):
Capitulating to crowd pressure and releasing proven terrorists — including those with prices on their heads and involved in ambushes — is legally impermissible, morally unjustifiable, and would set a devastating precedent.

(b) Ethical Dilemmas Faced by Rohit:

Dilemma 1: Rule of Law vs. Immediate Civilian Safety:
Rohit's primary duty is to uphold the law — detaining dangerous naxalites is both legal and necessary for long-term public security. But releasing them to prevent immediate civilian harm appears to serve the immediate greater good. The dilemma: can short-term civilian safety justify releasing people who will kill future security personnel or civilians?

Dilemma 2: Use of Force Against Civilian Women:
Women protesters are civilians exercising (albeit disruptively) a form of community solidarity. Using force against them — even non-lethal force — carries enormous ethical, legal, and political costs. Yet allowing the situation to drift into violence (if they breach the cordon and compromise the naxalite custody) is also unacceptable.

Dilemma 3: Individual Judgment vs. Chain of Command:
Rohit cannot reach his superior. He must act on individual judgment in a situation with enormous consequences — acting without authority vs. the risk of inaction in a fast-moving situation.

Dilemma 4: Short-Term Appeasement vs. Long-Term Consequences:
Any concession (partial or full release) under mob pressure establishes a precedent that security operations can be compromised by organised community pressure — with consequences for future operations across the country.

(c) Most Appropriate Option and Justification:

The most appropriate option is Option 1 (Non-Violent Cordon + Active De-escalation) combined with elements of Option 2 (Transparent engagement with women leaders).

Justification:
1. Proportionality: Women protesters are unarmed and acting on community loyalty, not deliberate terrorism. Force must be proportionate to threat — minimum necessary.
2. Rule of Law: The naxalites must not be released under any circumstances — this is the non-negotiable core. But the manner of maintaining custody can be de-escalatory.
3. Communication: Rohit should deploy every available alternative to reach IG — send a written message via vehicle, use local police wireless if satellite fails, get a trusted local intermediary to relay a message.
4. Time as an Asset: The longer the non-violent standoff lasts without escalation, the more the crowd's energy may dissipate — and the more likely that communication with superior officers is restored.
5. Transparency Reduces Fear: Women's aggressive stance may partly stem from fear that the naxalites are being harmed/killed in custody. A controlled, respectful display of humane treatment (within security constraints) may reduce tensions.

(d) Extra Precautionary Measures for Women Protesters:

1. Deploy Exclusively Women Police Officers at the Interface with Protesters: Female constables and officers should manage the immediate interface with the women's crowd — both for legal compliance (no male officer to touch a woman without female officer present) and to reduce physical confrontation optics.

2. Senior Women Officer as Spokesperson: A senior, trusted woman officer should be designated as the sole spokesperson — creating a human, non-threatening face for the security operation.

3. Absolutely No Lathi Charge or Tear Gas as First Response: These would be disproportionate, illegal under the circumstances, and would inflame regional and national sentiment.

4. Offer Water and Basic Amenities to Protesters: A gesture of human consideration — demonstrating that police are not hostile to the community — can reduce crowd anger.

5. Identify and Engage Community Leaders Among Protesters: Find respected village elders, women's SHG leaders, or panchayat members in the crowd and engage them privately — splitting the decision-making from the crowd dynamic.

6. Document All Actions: Video-record all actions by security personnel — protecting against false accusations and ensuring accountability.

Conclusion: Rohit's conduct in this crisis will be judged not only by whether the naxalites remained in custody, but by how he maintained both legal authority and human dignity under extraordinary pressure. The most ethical path is the hardest — firm on the rule of law, gentle in its application, and transparent in process.`,
    sources: [
      { name: "CRPF Rules of Engagement", chapter: "Use of Force Guidelines" },
      { name: "National Human Rights Commission Guidelines", chapter: "Crowd Control" },
      { name: "Home Ministry — LWE Strategy", chapter: "Civil-Security Interface" },
    ],
  },

  {
    _id: "mains_gs4_2024_05",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Case Study",
    topic: "Administrative Ethics",
    subTopic: "Intelligence and Counter-Terrorism",
    marks: 20,
    directive: "Case Study",
    wordLimit: 200,
    questionText:
      "Raman is a senior IPS officer and has recently been posted as D.G. of a state. Among the various issues and problems/challenges which needed his immediate attention, the issue relating to recruitment of unemployed youth by an unknown terrorist group, was a matter of grave concern. [The case involves a new terrorist group recruiting unemployed graduates via social media, with Raman needing to develop a counter-strategy.]\n\n(a) What are the options available to Raman to tackle the above situation?\n(b) What measures would you suggest for strengthening the existing set-up to ensure that such groups do not succeed in penetrating and vitiating the atmosphere in the state?\n(c) In the above scenario, what action plan would you advise for enhancing the intelligence gathering mechanism of the police force?",
    keyPoints: [
      "Multi-pronged approach: law enforcement + social intervention + digital counter-narrative",
      "Options: Cyber Cell monitoring, community engagement, economic opportunities for youth, deradicalisation",
      "Strengthening set-up: enhanced HUMINT, community policing, collaboration with social media platforms",
      "Intelligence plan: district-level intelligence units, HUMINT networks in colleges, social media monitoring",
      "Constitutional balance: surveillance vs. fundamental rights (Article 19, 21)",
    ],
    idealAnswer: `Introduction:
Raman faces a hybrid security threat — radicalization and recruitment of educated, unemployed youth by a foreign-linked terrorist group through social media. This requires a response that is simultaneously legal/enforcement-oriented and socio-economic — addressing both the symptom (terrorist recruitment) and the root cause (unemployment, alienation, radicalization vulnerability).

(a) Options Available to Raman:

Option 1: Cyber Intelligence and Proactive Monitoring:
Activate State Cyber Cell to monitor identified social media accounts of the terrorist group and its recruits. Use OSINT (Open Source Intelligence) tools to map the network — identifying contact persons, financiers, and the most active recruits. Coordinate with CERT-In and platform companies (Meta, Twitter/X) for account takedowns under IT Act Section 69A.

Option 2: Preventive Arrests Under UAPA/NSA:
For individuals who have progressed from online sympathy to active engagement with the group, invoke UAPA (Unlawful Activities Prevention Act) or NSA (National Security Act, if available in state) for preventive detention — particularly for the alleged "contact persons" of the terrorist group.

Option 3: Community Engagement and Countering Violent Extremism (CVE):
Work with civil society, religious leaders, educational institutions, and families to create counter-narratives and early warning systems. Families and teachers who notice radicalization signs should have a confidential mechanism to alert police without fearing consequences for the young person.

Option 4: Economic Intervention — Partnership with Government:
Coordinate with State Employment Department, MSME Ministry, and Skill India to fast-track employment and skill development for youth in vulnerable demographic — addressing the root cause of susceptibility.

Option 5: Deradicalisation Programme:
For individuals already in the pipeline but not yet criminally committed, initiate a voluntary counselling and deradicalisation programme (modelled on Aarhus Model, Denmark; or India's own state-level deradicalisation initiatives in J&K).

(b) Strengthening Existing Set-up:

1. Enhanced Multi-Agency Coordination:
Create a State Counter-Terrorism Coordination Centre (SCTCC) — integrating IB, RAW (for foreign linkage), NIA, State SIT, and Cyber Cell into a single analytical unit to prevent intelligence siloing.

2. Social Media Monitoring Infrastructure:
Upgrade Cyber Cell with dedicated social media analysts who monitor dark web forums, encrypted Telegram channels, and public social media — using both automated (AI-based) and human analysis.

3. University and College Liaison Programme:
Designate trained police liaison officers at major colleges and universities — building trust relationships with students and faculty who can flag early radicalization signs without heavy surveillance footprint.

4. Community Policing 2.0 — Digital Engagement:
Create trusted community forums (WhatsApp groups, Facebook pages) moderated by police for digital engagement with communities — providing counter-narratives and reporting mechanisms.

5. NGO and Civil Society Partnership:
Fund and partner with credible civil society organisations working on youth employment, identity, and countering extremist ideology — creating a civilian bulwark against radicalization.

6. International Cooperation:
Given the group's foreign linkage, coordinate with IB and MEA for information sharing with partner nations' intelligence services (Interpol channels, bilateral security agreements).

(c) Intelligence Gathering Enhancement Action Plan:

1. HUMINT Network Expansion at District Level:
Each district SP should build a structured HUMINT (Human Intelligence) network: registered informants in universities, madrassas, mosques, community centres, and social media-active youth groups. Train district police in HUMINT tradecraft and source protection.

2. Social Media Intelligence (SOCMINT) Capacity:
Create a 24x7 SOCMINT cell at State Police HQ and replicate at district level for major cities. Deploy AI tools for keyword monitoring, sentiment analysis, and network mapping of radicalization-prone digital spaces.

3. Dark Web Monitoring:
Coordinate with NIA's Cyber Unit for dark web (Tor, I2P) monitoring for references to the state, its recruits, or planned activities.

4. Source Development in Diaspora Communities:
If the group has foreign linkage, coordinate with IB to develop sources within diaspora communities abroad who might have information about the group's operations.

5. Suspicious Activity Reporting (SAR) System:
Create a mobile app and hotline for anonymous, secure reporting of suspicious activities or potential radicalization — building citizen co-production of intelligence.

6. Intelligence Training:
Mandatory quarterly intelligence training for all PSIs and above — focusing on HUMINT development, SOCMINT, and counter-terrorism tradecraft.

Ethical Safeguard: All intelligence activities must be conducted within the legal framework (IPC, CrPC, UAPA, IT Act) — avoiding mass surveillance or profiling based on religion/community alone. Judicial oversight through appropriate warrant mechanisms must be maintained to prevent abuse.

Conclusion: Raman's response must be holistic — law enforcement without social intervention will push radicalization underground; social intervention without law enforcement leaves active recruiters unchecked. The most durable counter-terrorism strategy addresses both the security threat and its socio-economic roots simultaneously.`,
    sources: [
      { name: "UAPA 1967 (amended 2019)", chapter: "Unlawful Activities" },
      { name: "MHA — Counter-Terrorism Strategy", chapter: "Multi-Agency Approach" },
      { name: "UNODC — Preventing Violent Extremism", chapter: "Good Practices" },
    ],
  },

  {
    _id: "mains_gs4_2024_06",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Case Study",
    topic: "Corporate Ethics",
    subTopic: "AI, Environment, and Corporate Responsibility",
    marks: 20,
    directive: "Case Study",
    wordLimit: 200,
    questionText:
      "There is a technological company named ABC Incorporated which is the second largest worldwide, situated in the Third World. You are the Chief Executive Officer and the majority shareholder of this company. The fast technological improvements have raised worries among environmental activists, regulatory authorities, and the general public over the sustainability of this scenario...[The company's GHG emissions increased 48% since 2019 due to AI energy demands, with a 2030 net-zero commitment under threat].\n\n(a) What is your immediate response to the challenges posed in the above case?\n(b) Discuss the ethical issues involved in the above case.\n(c) Your company has been identified to be penalized by technological giants. What logical and ethical arguments will you put forth to convince about its necessity?\n(d) Being a conscience being, what measures would you adopt to maintain balance between AI innovation and environmental footprint?",
    keyPoints: [
      "Ethical issues: environmental responsibility, intergenerational equity, corporate governance, greenwashing risk",
      "Immediate response: transparent acknowledgement, emissions reduction roadmap, renewable energy commitment",
      "Arguments for penalty: accountability, level playing field, deterrence, climate justice",
      "Balancing AI and environment: green AI, renewable-powered data centres, carbon offsets, efficiency optimization",
      "Stakeholder theory vs. shareholder primacy — ESG responsibility",
    ],
    idealAnswer: `Introduction:
As CEO of ABC Incorporated, I face a fundamental conflict between the company's commercial imperative (AI-driven growth) and its environmental obligations (net-zero by 2030). The 48% increase in GHG emissions since 2019 is not merely a regulatory problem — it is an ethical one, demanding honest reckoning and transformative action.

(a) Immediate Response:

Step 1 — Transparent Public Acknowledgement:
Rather than deflecting or minimising, I would immediately issue a comprehensive emissions report — disclosing the actual 48% increase, its causes (AI infrastructure energy demand), and its implication for the 2030 net-zero commitment. Greenwashing (projecting sustainability while concealing the emissions reality) would be both ethically wrong and ultimately catastrophically damaging to corporate reputation.

Step 2 — Emergency Emissions Reduction Task Force:
Constitute an internal task force — including CTO, CFO, and external environmental scientists — with a 90-day mandate to produce an achievable revised net-zero pathway that honestly accounts for AI growth trajectories.

Step 3 — Commitment to Renewable Energy Transition:
Announce a binding commitment to power all data centres with 100% renewable energy (solar/wind PPAs) by 2027 — including a transparent timeline with milestones. Engage with the government for renewable energy grid access and PPAs.

Step 4 — Stakeholder Engagement:
Meet with environmental activists, regulatory authorities, and civil society — not to manage them, but to genuinely engage with their concerns and incorporate their feedback into our emission reduction strategy.

(b) Ethical Issues Involved:

1. Environmental Responsibility and Intergenerational Equity:
The company's emissions contribute to climate change whose worst effects will be borne by future generations. The intergenerational justice principle (Brundtland Commission's sustainable development) demands that current development not compromise future generations' ability to meet their needs.

2. Honesty and Non-Deception (Greenwashing):
If the company publicly committed to net-zero by 2030 while knowing that AI expansion would make this increasingly impossible, it has been misleading stakeholders — investors, customers, regulators. This is an ethical breach compounding the environmental one.

3. Corporate Governance and Fiduciary Duty:
Traditional fiduciary duty (to shareholders) is evolving — ESG (Environmental, Social, Governance) considerations are now mainstream fiduciary obligations. Ignoring climate risk is increasingly a breach of duty to long-term shareholders as well.

4. Justice and Equity (Third World Context):
Located in the Third World, the company bears responsibility toward communities most vulnerable to climate change — often in developing nations. A technology company exacerbating climate change while located in a climate-vulnerable nation carries a particular ethical burden.

5. Technology Responsibility:
AI systems that require massive energy should be developed with efficiency as a design principle — not as an afterthought. The ethical obligation to develop "green AI" (energy-efficient algorithms, model compression) is both environmental and professional.

(c) Arguments for the Penalty Being Justified:

Logical Arguments:
1. Accountability Principle: The company committed to net-zero by 2030 and has moved in the opposite direction (48% increase). Penalty is a proportionate accountability mechanism for this documented failure.
2. Level Playing Field: If leading companies are not held accountable for emissions pledges, smaller companies have no incentive to incur the costs of genuine environmental compliance — undermining the entire system.
3. Regulatory Credibility: Without enforcement, environmental regulations are aspirational documents. Penalties signal regulatory seriousness and market certainty.

Ethical Arguments:
1. Polluter Pays Principle: Those who generate environmental harm should bear the cost — not the general public or future generations who suffer climate consequences.
2. Corporate Citizenship: A company operating in a Third World nation with significant environmental vulnerability has heightened ethical obligations. Failing them is not just a regulatory violation; it is a breach of citizenship.
3. Deterrence for the Sector: The AI sector's energy footprint is a known and growing concern (Microsoft, Google, Amazon all face similar challenges). A clear penalty signal to one major player reframes the industry's environmental calculation globally.

Argument for Self-Accountability (to convince regulators):
Rather than fighting the penalty, I would argue that the company should self-impose a carbon remediation contribution — funding renewable energy infrastructure equal to our excess emissions in the communities most affected — going beyond regulatory minimum. This demonstrates genuine ethical leadership rather than compliance minimalism.

(d) Measures to Balance AI Innovation and Environmental Footprint:

1. Green AI — Efficient Model Design:
Commission an internal AI efficiency programme: every new AI model must demonstrate energy efficiency benchmarks before deployment. Techniques: model pruning, knowledge distillation, hardware-software co-optimization, and sparse attention models.

2. Renewable Energy for Data Centres:
Transition all data centres to 100% renewable energy through: (i) on-site solar/wind generation; (ii) long-term Power Purchase Agreements (PPAs) with renewable energy providers; (iii) Renewable Energy Certificates (RECs).

3. Carbon Capture and Offset:
For unavoidable emissions during transition, invest in verifiable, high-quality carbon offsets (afforestation in the region, blue carbon — mangrove restoration) — ensuring these are additional, permanent, and third-party verified.

4. Water-Efficient Data Centre Cooling:
Transition from water-intensive cooling to air cooling, geothermal, or waste heat recycling systems — reducing the water footprint that accompanies energy consumption in data centres.

5. Circular Economy for Hardware:
Implement a hardware lifecycle programme — refurbishing and redeploying servers, responsible e-waste management, and designing for longevity rather than planned obsolescence.

6. Transparency and Reporting:
Publish quarterly Scope 1, 2, and 3 emissions reports aligned with GRI Standards and Task Force on Climate-Related Financial Disclosures (TCFD) — making the company's environmental performance a matter of public accountability.

7. Advocacy for Renewable Grid:
Engage with government to accelerate renewable energy grid development — recognising that individual company transitions are limited by national grid composition.

Conclusion: The most ethical and strategically sound path for ABC Incorporated is not to choose between AI innovation and environmental responsibility — but to recognise that long-term business viability depends on the former being powered by the latter. Green AI, renewable data centres, and transparent accountability are not constraints on innovation; they are the foundations of sustainable competitive advantage in a carbon-constrained future.`,
    sources: [
      { name: "IPCC AR6 — Mitigation Chapter", chapter: "Technology and Energy" },
      { name: "GRI Standards — Environmental Reporting", chapter: "GRI 305: Emissions" },
      { name: "TCFD Recommendations", chapter: "Climate-Related Financial Disclosures" },
    ],
  },

  // ─── THEORY QUESTIONS (10 MARKS) ─────────────────────────────────────────

  {
    _id: "mains_gs4_2024_07",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Civil Services",
    subTopic: "Mission Karmayogi",
    marks: 10,
    directive: "How",
    wordLimit: 100,
    questionText:
      "Mission Karmayogi is aiming for maintaining a very high standard of conduct and behaviour to ensure efficiency for serving citizens and in turn developing oneself. How will this scheme empower the civil servants in enhancing productive efficiency and delivering the services at the grassroots level?",
    keyPoints: [
      "Mission Karmayogi (2020): National Programme for Civil Services Capacity Building",
      "iGOT (Integrated Government Online Training) Mandhan platform",
      "Role-based competency framework; shift from rule-based to role-based governance",
      "Continuous learning, behavioural competencies, digital literacy",
      "Impact: empowerment, citizen-centric delivery, last-mile service",
    ],
    idealAnswer: `Mission Karmayogi — Overview:
Mission Karmayogi, approved in 2020, is India's National Programme for Civil Services Capacity Building (NPCSCB). It aims to transform the Indian civil service from rule-based, process-oriented functioning to role-based, outcome-oriented, and citizen-centric governance.

Core Components:

1. iGOT (Integrated Government Online Training) Mandhan Platform:
A digital learning ecosystem providing on-demand, role-specific online courses across 2,500+ modules — covering domain knowledge, behavioural competencies, ethics, technology, and communication. Civil servants at all levels can access learning at their own pace, creating a culture of continuous professional development.

2. Role-Based Competency Framework:
The scheme maps specific competencies to each civil service role — both technical (e.g., revenue administration for a tehsildar) and behavioural (communication, empathy, ethical decision-making). Civil servants are assessed against these competencies and directed to relevant capacity-building modules.

3. 360-Degree Assessment:
Annual performance assessment linked to competency development — not just outcomes but how they are achieved (process integrity, citizen orientation).

How it Empowers Civil Servants at Grassroots Level:

1. Digital Literacy and E-Governance Competence:
District-level officers and panchayat secretaries gain digital literacy enabling them to deploy e-governance tools — DBT, PFMS, eSeva — effectively, reducing leakages and improving service delivery speed.

2. Citizen-Centric Mindset:
Behavioural competency modules explicitly train civil servants in empathy, grievance redressal, and service orientation — shifting the culture from "authority" to "service provider" at the grassroots.

3. Ethics and Integrity Training:
Modules on ethics, conflict of interest, and probity — building moral competence alongside technical skill, addressing the values-ethics gap in service delivery.

4. Peer Learning Networks:
iGOT enables horizontal learning — a block development officer in Rajasthan can learn best practices from a colleague in Odisha — democratising knowledge beyond formal training institutions.

5. Continuous Skill Upgradation:
Unlike periodic LBSNAA training, iGOT enables real-time learning whenever new laws, schemes, or technologies are introduced — keeping civil servants current with governance innovations.

Impact at Grassroots:
Civil servants trained in citizen-centric competencies are better equipped to resolve complaints at the district level (reducing appellate burden), implement welfare schemes with fidelity, and engage communities with respect and empathy — directly improving last-mile service delivery.

Conclusion: Mission Karmayogi's strength lies in recognising that good governance is not just about systems and processes — it is about the quality of the human beings operating them. By investing in continuous, role-specific, ethically grounded capacity building, it aims to create civil servants who are not just competent but also motivated and principled.`,
    sources: [
      { name: "DOPT — Mission Karmayogi Guidelines", chapter: "Official Document" },
      { name: "iGOT Mandhan Platform", chapter: "About the Platform" },
    ],
  },

  {
    _id: "mains_gs4_2024_08",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Gender and Public Service",
    subTopic: "Women in Civil Services — Challenges",
    marks: 10,
    directive: "Examine / Suggest",
    wordLimit: 100,
    questionText:
      "\"In Indian culture and value system, an equal opportunity has been provided irrespective of gender identity. The number of women in public service has been steadily increasing over the years.\"\nExamine the gender-specific challenges faced by female public servants and suggest suitable measures to increase their efficiency in discharging their duties and maintaining high standards of probity.",
    keyPoints: [
      "Representation: women ~30% of IAS/IPS intake; but fewer at senior levels (glass ceiling)",
      "Gender-specific challenges: dual burden (home + work), postings in conflict zones, sexual harassment, male-dominated culture, mobility constraints",
      "POSH Act 2013 applicability to government; ICC in each ministry",
      "Measures: flexible posting policies, childcare support, mentoring networks, women-friendly infrastructure, gender-sensitive transfers",
      "High standards of probity: same standards apply; no dilution for gender — but enabling environment needed",
    ],
    idealAnswer: `Critical Assessment of the Opening Statement:
While India's Constitution guarantees equality (Articles 14–16) and the number of women in civil services has increased — from ~4% of IAS in 1970s to over 26% of IAS probationers in recent years — the claim of "equal opportunity irrespective of gender" obscures persistent structural barriers. Equal formal opportunity exists; substantively equal conditions do not.

Gender-Specific Challenges Faced by Female Public Servants:

1. Dual Burden — Professional and Domestic:
Indian society still places primary domestic and caregiving responsibilities on women. A female IAS officer managing a crisis in a remote posting while simultaneously managing childcare has a fundamentally different operating context than a male counterpart. This "second shift" affects performance, promotion decisions, and career progression.

2. Posting Challenges:
Conflict-affected, remote, or difficult postings (J&K, Northeast, Maoist-affected districts) pose specific safety and mobility challenges for women, particularly those with young children. Posting preferences are often overridden on "merit" grounds without accounting for these realities.

3. Glass Ceiling at Senior Levels:
Despite entry-level parity improving, women remain underrepresented at Secretary and senior IPS levels. Informal networks, mentorship gaps, and unconscious bias in promotion decisions create systemic barriers.

4. Sexual Harassment:
Despite the Prevention of Sexual Harassment (POSH) Act 2013 and mandatory Internal Complaints Committees (ICCs) in all government ministries, incidents of harassment continue — often not reported due to fear of career consequences.

5. Infrastructure Deficits:
Many field offices, police stations, and district collectorates lack adequate women's washrooms, rest rooms, and creche facilities — basic infrastructure that affects comfort, dignity, and efficiency.

6. Gendered Perceptions:
In certain administrative and law enforcement cultures, female officers face gendered perceptions from both subordinates and superiors — being directed toward "soft" portfolios (social welfare) and away from "hard" assignments (revenue, police, infrastructure) — limiting career breadth.

Measures to Enhance Efficiency and Probity:

1. Flexible and Family-Sensitive Posting Policies:
Introduce a transparent posting policy that allows women officers to flag posting constraints (childcare, family circumstances) — addressed through co-location postings for couples in civil services, and genuine (not just formal) consideration of constraints.

2. Childcare and Creche Infrastructure:
Mandatory, subsidised creche facilities in all major government offices and district headquarters — enabling women with young children to discharge field duties without childcare anxiety.

3. Structured Mentoring Networks:
Create formal mentoring programmes pairing senior women civil servants with juniors — building career guidance, ethical role modelling, and institutional navigation support.

4. POSH Implementation Audit:
Annual audit of ICC constitutions, complaint statistics, and resolution quality across all ministries and departments — ensuring POSH is not just formally compliant but functionally effective.

5. Gender Budgeting for Civil Service Infrastructure:
Budget allocations specifically for women-friendly infrastructure (sanitary facilities, rest rooms, safety lighting in offices).

6. Unconscious Bias Training:
Mandatory training for DPC (Departmental Promotion Committee) members on unconscious bias in promotion decisions — ensuring women's career records are evaluated without gendered assumptions.

On High Standards of Probity:
The same ethical standards — integrity, impartiality, honesty — apply regardless of gender. What needs addressing is the enabling environment: a system that currently requires women to work significantly harder to achieve the same career outcomes as men cannot claim to hold them to the same probity standard while maintaining a level playing field. Probity and equity must coexist.

Conclusion: India has made genuine progress in increasing women's participation in civil services. The next frontier is creating substantively equal conditions — through infrastructure, policy, culture, and institutional support — so that women civil servants can exercise their competence and integrity to the fullest, delivering quality public service to all citizens.`,
    sources: [
      { name: "POSH Act 2013", chapter: "Prevention of Sexual Harassment" },
      { name: "DOPT — Gender Policy in Services", chapter: "Posting Guidelines" },
      { name: "2nd ARC Report", chapter: "Human Resources Management in Government" },
    ],
  },

  {
    _id: "mains_gs4_2024_09",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Justice System",
    subTopic: "Bharatiya Nyaya Sanhita — Punishment to Justice",
    marks: 10,
    directive: "Discuss",
    wordLimit: 100,
    questionText:
      "The soul of the new law, Bharatiya Nyaya Sanhita (BNS) is Justice, Equality and Impartiality based on Indian culture and ethos. Discuss this in the light of major shift from a doctrine of punishment to justice in the present judicial system.",
    keyPoints: [
      "BNS 2023: replaced IPC 1860; 358 sections; effective July 2024",
      "From punishment to justice: restorative justice, victim-centric approach, community service",
      "Indian ethos: Dharma, justice traditions (Kautilya's Arthashastra), Nyaya (not just Niti)",
      "Key changes: sedition removed, organised crime codified, terrorism, community service as alternative punishment",
      "Equality: gender-neutral provisions; impartiality: reforming colonial era biases",
    ],
    idealAnswer: `Introduction:
The Bharatiya Nyaya Sanhita (BNS) 2023, which replaced the Indian Penal Code 1860, represents a philosophically significant shift in India's criminal justice framework — from the colonial IPC's punitive orientation toward a justice-centred approach rooted in Indian constitutional values and civilisational ethos.

From Punishment to Justice — The Philosophical Shift:

The IPC (1860) was designed by Macaulay's Law Commission primarily as an instrument of imperial social control — emphasising deterrence, retribution, and order. It was explicitly punitive: crime was an offence against the state, and punishment was the state's response.

The BNS attempts a different orientation:

1. Restorative Justice Elements:
BNS introduces community service as an alternative punishment for minor offences (petty theft, defamation, etc.) — borrowed from restorative justice philosophy which emphasises repairing harm to victims and communities, not merely punishing offenders. This is philosophically closer to traditional Indian dispute resolution (village panchayat mediation, social reintegration focus).

2. Victim-Centric Provisions:
BNS expands provisions for victim compensation and restitution — recognising that justice is incomplete if the victim is ignored while the state punishes the offender. This shift from state-offender dyad to victim-offender-community triad is doctrinally significant.

3. Removal of Colonial Era Provisions:
The sedition provision (IPC Section 124A) — widely used against political dissent — has been replaced with a narrower provision focused on actual acts against the sovereignty of India (not mere criticism of government). This reflects a justice orientation: protecting state security without silencing citizens.

Indian Cultural and Ethical Grounding:

The BNS invokes Indian cultural ethos through:

1. Nyaya vs. Niti: Indian philosophical tradition distinguishes between Niti (rules/procedures) and Nyaya (comprehensive justice encompassing outcomes). The BNS's stated commitment to "justice" (Nyaya) over mere rule-following reflects this distinction — echoing Amartya Sen's argument that true justice requires attention to actual lives, not just formal rules.

2. Dharmic Justice: Kautilya's Arthashastra describes a justice system focused on social harmony, proportionality of punishment, and protection of the weak — principles that BNS's community service and victim compensation provisions echo.

3. Constitutional Alignment: The BNS's preamble invoking "Justice, Equality and Impartiality" directly mirrors the Constitution's Preamble — grounding criminal law in constitutional morality rather than colonial administrative logic.

New Codifications:
BNS codifies organised crime and terrorist offences more comprehensively — responding to contemporary threats with clarity rather than leaving them to special laws that may overlap confusingly. Cyber crime provisions are expanded and updated.

Limitations and Concerns:
Critics argue that some provisions (expanded police custody periods, broad organised crime definitions) could be used to replicate IPC's repressive potential. The shift from punishment to justice is aspirational — implementation by police, courts, and prosecutors will determine whether the philosophy is realised.

Conclusion: The BNS's most significant contribution is philosophical — articulating that India's criminal law is in service of justice, not merely punishment. Whether this philosophical aspiration becomes lived reality depends on training of police and prosecutors, judicial interpretation, and persistent civil society oversight.`,
    sources: [
      { name: "Bharatiya Nyaya Sanhita 2023", chapter: "Full Text" },
      { name: "Amartya Sen — The Idea of Justice", chapter: "Nyaya and Niti" },
      { name: "Law Commission of India Reports", chapter: "Criminal Law Reform" },
    ],
  },

  {
    _id: "mains_gs4_2024_10",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Public Administration Ethics",
    subTopic: "Code of Conduct vs. Code of Ethics",
    marks: 10,
    directive: "Suggest",
    wordLimit: 100,
    questionText:
      "The 'Code of Conduct' and 'Code of Ethics' are the sources of guidance in public administration. There is code of conduct already in operation, whereas code of ethics is not yet put in place. Suggest a suitable model for code of ethics to maintain integrity, probity and transparency in governance.",
    keyPoints: [
      "Code of Conduct: specific rules (CCS Conduct Rules 1964); do's and don'ts",
      "Code of Ethics: values and principles guiding judgment in ambiguous situations",
      "Distinction: rules-based vs. values-based; compliance vs. commitment",
      "Existing: Nolan Committee principles (UK) — selflessness, integrity, objectivity, accountability, openness, honesty, leadership",
      "Proposed Indian model: constitutional values + public interest + professional values + implementation mechanism",
    ],
    idealAnswer: `Distinction Between Code of Conduct and Code of Ethics:

Code of Conduct: A set of specific, enforceable rules prescribing what civil servants may and may not do — e.g., Central Civil Services (Conduct) Rules 1964. It addresses: acceptance of gifts, political neutrality, use of official property, outside employment. It is rules-based — answering "what is prohibited?"

Code of Ethics: A set of value statements and ethical principles that guide judgment in ambiguous situations not covered by specific rules. It answers "what should guide my decision when no specific rule applies?" — addressing integrity, public interest, fairness, and professional virtue.

Why India Needs a Code of Ethics:
Existing conduct rules address behaviour in defined situations — they cannot anticipate every conflict of interest, ethical dilemma, or grey area. A Code of Ethics provides the moral compass for navigating novel situations and institutionalises a value culture rather than mere compliance culture.

Proposed Model for India's Code of Ethics:

Foundation — Seven Core Values (adapted from Nolan Principles):
1. Selflessness: Civil servants act solely in the public interest — not for personal gain or sectional advantage.
2. Integrity: No obligation to private individuals or organisations that might compromise the performance of official duties.
3. Objectivity: Decisions based on merit, evidence, and impartial analysis — not political bias or personal preference.
4. Accountability: Civil servants are accountable to law, to Parliament/Legislature, and to the public — documented, auditable, and transparent decision-making.
5. Openness: Maximum transparency in decision-making — with confidentiality only where clearly necessary and legally justified.
6. Honesty: Truthful communication with ministers, Parliament, courts, and citizens — no deliberate misleading.
7. Leadership: Senior civil servants model ethical behaviour and create a culture where junior colleagues can raise ethical concerns without fear.

Constitutional Grounding:
The Code should explicitly root these values in the Constitution — citing:
- Article 14 (Equality before law)
- Article 51A (Fundamental Duties)
- Directive Principles (Article 38, 39, 46) for public welfare orientation

Implementation Mechanism:
1. Ethics Commission: An independent Ethics Commission (analogous to the Lokpal for corruption) to investigate ethics complaints against civil servants — providing a forum for code violations beyond the Conduct Rules.
2. Ethics Officers: Designate Ethics Officers in each ministry/department — providing confidential guidance to civil servants facing ethical dilemmas.
3. Annual Ethics Declaration: Civil servants annually declare that they have read, understood, and complied with the Code — creating a personal accountability moment.
4. Training Integration: Ethics training at LBSNAA and in-service training programmes — using case studies, scenario analysis, and Socratic dialogue rather than passive instruction.
5. Whistleblower Protection: Link the Code explicitly to whistleblower protection — ensuring civil servants who report ethics violations are protected, not penalised.

Conclusion: A Code of Ethics complements the Code of Conduct: conduct rules define the floor of acceptable behaviour; ethics code defines the ceiling of aspirational professional virtue. Together, they create a governance environment where civil servants are not just constrained by rules but inspired by values — which is the foundation of public trust in democratic institutions.`,
    sources: [
      { name: "Committee on Standards in Public Life (Nolan Committee, UK)", chapter: "Seven Principles of Public Life" },
      { name: "2nd ARC Report — Ethics in Governance", chapter: "Recommendations" },
      { name: "CCS Conduct Rules 1964", chapter: "Existing Framework" },
    ],
  },

  {
    _id: "mains_gs4_2024_11",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Ethical Quotations",
    subTopic: "Immanuel Kant — Law vs. Ethics",
    marks: 10,
    directive: "What does this quotation convey",
    wordLimit: 100,
    questionText:
      "What does this quotation convey to you in present context?\n\n\"In law, a man is guilty when he violates the rights of others. In ethics, he is guilty if he only thinks of doing so.\" — Immanuel Kant",
    keyPoints: [
      "Distinction: law = external action; ethics = internal intention and will",
      "Kantian deontology: good will is the foundation of moral worth",
      "Categorical imperative: duty regardless of consequences",
      "Present context: administrative decision-making, corporate ethics, pre-crime prevention, media ethics",
      "Application: a civil servant who takes no bribe but intends to is ethically compromised",
    ],
    idealAnswer: `Core Message of the Quotation:
Kant draws a fundamental distinction between law and ethics — not just in content, but in the domain each governs.

Law governs external action: a person is legally guilty only when they actually violate another's rights through their conduct. Intent may aggravate punishment, but without an overt act, there is no legal offence (cogitationis poenam nemo patitur — thought alone is not punishable).

Ethics, by contrast, governs the inner life: even thinking of harming another — harbouring the intention without acting — is an ethical failure. For Kant, the moral quality of an act derives entirely from the will behind it — the intention — not its outcomes (consequentialism) or social rules (legal positivism). This is the heart of his deontological ethics: the good will, acting from duty, is the only unconditioned moral good.

Contemporary Relevance:

1. For Civil Servants — Integrity of Intent:
A government officer who declines a bribe only because they fear getting caught — not because bribery is wrong — is legally clean but ethically compromised. The Kantian standard demands that civil servants act with integrity of motive, not just appearance of integrity. This is why Mission Karmayogi focuses on values and character, not just conduct rules.

2. For Corporate Executives — Ethical Compliance vs. Ethical Culture:
A company that follows environmental regulations only to avoid penalties, while lobbying to weaken those regulations, is legally compliant but ethically questionable. Genuine corporate ethics requires alignment of intention with declared values.

3. For Media — The Ethics of Thought Leadership:
A journalist who considers but ultimately does not publish a fabricated story — who "thinks of it" — has engaged in an ethical process failure, even if the legal outcome (no publication, no defamation) is clean.

4. For Governance — Pre-empting Corruption:
Kant's insight suggests that corruption prevention should address motivational culture, not just enforcement. A civil servant who is honest only because of surveillance is a systemic vulnerability — any reduction in surveillance risks behaviour change. A civil servant honest because of conviction is systemically robust.

5. For Everyday Ethics — The Mirror Test:
Behavioural ethics research shows that people engage in "moral disengagement" — rationalising harmful intentions as acceptable before acting. Kant's warning applies here: the moment of ethical failure is the intention, not just the act. Checking one's intentions ("would I be comfortable if my intention were known?") is the ethical equivalent of legal compliance.

Conclusion: Kant's quotation is a call for authenticity in ethics — to locate morality not in the legality of outcomes but in the purity of intention. In a world of sophisticated legal workarounds, shell companies, regulatory arbitrage, and "technically legal" corruption, this Kantian standard remains the most demanding — and most essential — moral compass for public servants, corporate leaders, and citizens alike.`,
    sources: [
      { name: "Immanuel Kant — Groundwork for the Metaphysics of Morals", chapter: "Good Will and Duty" },
      { name: "Stanford Encyclopedia of Philosophy — Kant's Ethics", chapter: "Deontological Framework" },
    ],
  },

  {
    _id: "mains_gs4_2024_12",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Ethical Quotations",
    subTopic: "Sardar Patel — Faith and Strength",
    marks: 10,
    directive: "What does this quotation convey",
    wordLimit: 100,
    questionText:
      "What does this quotation convey to you in present context?\n\n\"Faith is of no avail in the absence of strength. Faith and strength, both are essential to accomplish any great work.\" — Sardar Patel",
    keyPoints: [
      "Faith alone (idealism without capacity) is insufficient; strength alone (power without purpose) is dangerous",
      "Sardar Patel's context: integrating 562 princely states required both iron will AND diplomatic skill/faith",
      "Application: civil services — conviction without capability is ineffective; capability without conviction is corrupt",
      "Institutional strength: rule of law, administrative capacity — must be paired with democratic faith (legitimacy)",
      "National context: India's development — needs both vision and implementation capacity",
    ],
    idealAnswer: `Core Message of the Quotation:
Sardar Vallabhbhai Patel, the architect of India's political integration, speaks from the lived experience of nation-building. His wisdom distils a fundamental truth: faith (vision, conviction, idealism, moral purpose) is the indispensable direction-setter, but without strength (capacity, will, organisation, execution), it accomplishes nothing. Conversely, strength without faith — capability without moral purpose — risks becoming tyranny.

The two must coexist: faith without strength is wishful thinking; strength without faith is brute force without direction.

Context of the Quotation:
Patel's own life exemplified this synthesis. The integration of 562 princely states was simultaneously an act of extraordinary conviction (faith in a united India) and iron-willed administrative strength (V.P. Menon's operational capacity, Patel's willingness to use force where necessary). When Hyderabad's Nizam and Junagadh's Nawab refused to accede, faith alone in a united India would have accomplished nothing — it required the political and military strength of Operation Polo and the threat of economic sanctions.

Contemporary Relevance:

1. For Civil Servants — Conviction and Competence:
A civil servant with deep conviction about poverty alleviation but no administrative competence cannot deliver welfare schemes effectively. Equally, a highly skilled administrator with no ethical conviction may efficiently implement schemes that harm rather than help. The ideal is the Patel synthesis: conviction in public service AND mastery of administrative craft.

2. For Governance — Vision and Implementation:
India's development challenges (SDG goals, green transition, digital inclusion) require both: a clear national vision (faith in India's potential) AND the institutional, financial, and human capacity to execute. The National Infrastructure Pipeline, PM-GATI Shakti, and the National Education Policy are faith documents — their impact depends on the strength of implementation machinery.

3. For Reform — Courage and Capacity:
Social reforms (gender justice, caste equity, environmental sustainability) require both moral faith in the goal AND the political and institutional strength to overcome entrenched resistance. Reformers who have faith but lack organisational strength (political backing, legal tools, coalition-building) consistently fail.

4. For Individual Character — Inner Strength:
Faith in one's values — honesty, integrity, compassion — must be paired with the psychological and moral strength to maintain them under pressure. A civil servant who believes in probity but lacks the inner strength to refuse a bribe is failing on Patel's second requirement.

5. For International Relations — Soft Power and Hard Power:
India's foreign policy increasingly combines faith (democratic values, civilisational heritage, peaceful coexistence) with strength (military capability, economic leverage, multilateral influence). Patel's formulation anticipates the contemporary concept of "comprehensive national power."

Conclusion: Sardar Patel's quotation is a timeless call for integrated leadership — combining the inspiration of conviction with the rigour of execution. In an era of grandiose vision statements that fail at last-mile delivery, it is a reminder that faith must be operationalised through strength — and strength must be guided by faith — to accomplish anything great.`,
    sources: [
      { name: "Rajmohan Gandhi — Patel: A Life", chapter: "Integration of India" },
      { name: "Durga Das — India from Curzon to Nehru and After", chapter: "Sardar Patel's Leadership" },
    ],
  },

  {
    _id: "mains_gs4_2024_13",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Ethical Quotations",
    subTopic: "Swami Vivekananda — Cultural Learning",
    marks: 10,
    directive: "What does this quotation convey",
    wordLimit: 100,
    questionText:
      "What does this quotation convey to you in present context?\n\n\"Learn everything that is good from others, but bring it in, and in your own way absorb it, do not become others.\" — Swami Vivekananda",
    keyPoints: [
      "Cultural confidence: learn globally, remain rooted locally",
      "Against blind imitation (colonised mind) and against xenophobia (rejecting all external influence)",
      "Application: India's development model — assimilation, not imitation",
      "Administrative reform: adopt best practices globally but contextualise for Indian realities",
      "Technology adoption: digital transformation with Indian context (UPI, Aadhaar as indigenous solutions)",
      "Personal growth: intellectual openness + identity rootedness",
    ],
    idealAnswer: `Core Message of the Quotation:
Vivekananda articulates a path between two extremes: the colonised mind that seeks to become Western (abandoning its own roots in pursuit of external validation) and the insular traditionalist who rejects all external learning as contamination. His wisdom is the path of creative synthesis — openness to learning from every tradition and experience, combined with the confidence and rootedness to absorb that learning on one's own terms, rather than being absorbed by it.

"Bring it in, and in your own way absorb it" — the key phrase. Not passive reception, but active, conscious assimilation that enriches rather than displaces one's own identity.

Contemporary Relevance:

1. India's Development Model:
India has learned from multiple governance models — Scandinavian welfare state principles, American federalism, British parliamentary traditions, East Asian export-led growth. But India's development pathway is not a copy of any of these. UPI (Unified Payments Interface) — a uniquely Indian digital public infrastructure approach — learned from global fintech but was designed for India's specific constraints (feature phones, unbanked rural population). This is Vivekananda's principle in practice.

2. Administrative Reform:
India's civil services continuously benchmark global best practices — Singapore's meritocracy, New Zealand's results-based management, e-Estonia's digital governance. But the adoption must be contextualised: an e-government system designed for a homogeneous, high-literacy Nordic nation cannot be transplanted verbatim to India's multilingual, multi-literacy reality. The wisdom is to learn the principle, not copy the form.

3. Scientific and Technological Learning:
India's space programme (ISRO), pharmaceutical industry (generics), and IT sector represent Vivekananda's model: absorbing global scientific knowledge but innovating within Indian constraints (frugal engineering, jugaad, cost-efficient space missions like Mangalyaan at a fraction of NASA costs).

4. Education Policy:
NEP 2020 draws on international education research (project-based learning, multi-disciplinary higher education, outcome-based assessment) while explicitly rooting the vision in Indian knowledge systems (Vedic mathematics, Sanskrit, traditional arts). This is conscious synthesis, not imitation.

5. Personal and Professional Development:
For a civil servant: learn from global best practices in governance, technology, and management — but contextualise them within the realities of Indian governance structures, political economy, and social fabric. A District Collector who applies a model developed for a Swiss canton without adapting it to a tribal district of Jharkhand has learned but not absorbed.

6. Cultural Confidence vs. Cultural Insecurity:
Vivekananda's formulation is fundamentally about cultural confidence — one can learn from others only when one is secure in one's own identity. A culturally insecure society either imitates wholesale or rejects wholesale. A culturally confident society learns discriminately.

Conclusion: In a world of accelerating globalisation — where cultural homogenisation and reactionary nationalism are twin dangers — Vivekananda's counsel is more relevant than ever. India's unique civilisational strength has always been its capacity for creative synthesis: absorbing influences from Buddhism, Islam, Christianity, and modernity while maintaining a distinctive identity. The task for each generation — and each individual — is to continue this synthesis with discernment, courage, and rootedness.`,
    sources: [
      { name: "Swami Vivekananda — Complete Works", chapter: "Lectures on Indian Philosophy" },
      { name: "Sunil Khilnani — The Idea of India", chapter: "Cultural Identity and Modernity" },
    ],
  },

  {
    _id: "mains_gs4_2024_14",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Environment Ethics",
    subTopic: "Climate Change and Human Greed",
    marks: 10,
    directive: "How",
    wordLimit: 100,
    questionText:
      "Global warming and climate change are the outcomes of human greed in the name of development, indicating the direction in which extinction of organisms including human beings is heading towards loss of life on Earth. How do you put an end to this to protect life and bring equilibrium between the society and the environment?",
    keyPoints: [
      "Climate change as ethical failure: intergenerational injustice, species rights, climate justice",
      "Root cause: consumerism, fossil fuel dependence, unsustainable growth model",
      "Solutions: individual (lifestyle change), institutional (carbon pricing, renewable transition), global (UNFCCC, Paris Agreement)",
      "Indian philosophy: Vasudhaiva Kutumbakam, ahimsa toward nature, Chipko movement",
      "Net zero, circular economy, nature-based solutions",
    ],
    idealAnswer: `Framing: Climate Change as an Ethical Crisis:
Global warming is fundamentally an ethical failure — it represents the triumph of short-term greed over long-term responsibility; of private gain over collective welfare; of the present generation over future ones. The IPCC AR6 (2023) confirms that human-caused emissions are unequivocally driving warming, with catastrophic consequences already unfolding.

The ethical dimensions are multiple:
- Intergenerational Justice: We are consuming the atmospheric commons that future generations have a right to.
- Species Justice: Our greed is driving the 6th mass extinction — other species have no voice in the political process causing their elimination.
- Climate Justice: The poorest nations (who emit least) suffer most — Bangladesh, Tuvalu, sub-Saharan Africa — while wealthy emitters remain relatively protected.
- Ecological Ethics: Nature has intrinsic value beyond its utility to humans — a dimension captured in India's ancient philosophy (Atharvaveda's Bhumi Sukta — "Earth is our mother; we are her children").

Bringing Equilibrium — At Multiple Levels:

Individual Level:
- Conscious consumption: reduce, reuse, recycle; plant-rich diet (livestock farming accounts for ~14.5% of global GHG — UNEP); minimise air travel.
- Energy choices: renewable energy for homes; EV adoption.
- Civic engagement: vote for climate-conscious leaders; participate in community environmental action.

Community and Corporate Level:
- Corporate ESG commitments with verification: net-zero commitments backed by Science-Based Targets (SBTs) rather than greenwashing.
- Circular economy: industrial symbiosis — waste from one process becomes input for another.
- Sustainable urban design: green buildings, urban forests, permeable paving.

National Level:
- Carbon pricing: Carbon taxes or Emissions Trading Systems (ETS) internalise the true cost of pollution — India's Carbon Credit Trading Scheme (CCTS) is a step in this direction.
- Renewable energy transition: India's 500 GW renewables target by 2030; coal phase-down timeline.
- Nature-based solutions: forest conservation (REDD+), wetland restoration, mangrove planting — India's 33% forest cover target.
- Green public finance: sovereign green bonds (India issued ₹16,000 crore green bonds in FY23); redirecting subsidies from fossil fuels to renewables.

Global Level:
- Paris Agreement implementation: holding warming to 1.5°C requires halving global emissions by 2030 (IPCC) — all nations must strengthen NDCs.
- Climate finance: $100 billion/year commitment to developing nations (still unmet); Loss and Damage Fund (established COP27).
- Technology transfer: wealthy nations sharing clean technology with developing countries.

Indian Philosophical Contribution:
India's civilisational traditions offer a distinctive ethical framework:
- Vasudhaiva Kutumbakam (the world is one family): extends moral community beyond human species.
- Ahimsa: non-harm as a governing principle — extended to ecological harm.
- Panchabhuta philosophy: reverence for the five elements (earth, water, fire, air, ether) as sacred — not resources for unlimited exploitation.
- Chipko Movement (1973): India's grassroots ecological ethics in action — Gaura Devi's "forest is our mother" is Vivekananda's cultural rootedness applied to ecology.

Conclusion: Bringing equilibrium between society and environment requires a civilisational shift — from a growth model that treats nature as an infinite resource and waste sink to one that recognises ecological limits and intergenerational obligations. This is simultaneously a scientific, economic, political, and deeply ethical challenge. Individual choices matter; but systemic change — carbon pricing, renewable transition, international climate justice — is what will determine whether humanity heeds the warning or continues toward the extinction trajectory the question rightly identifies.`,
    sources: [
      { name: "IPCC AR6 Synthesis Report", chapter: "Key Findings" },
      { name: "Paris Agreement 2015", chapter: "NDC Framework" },
      { name: "Vandana Shiva — Staying Alive", chapter: "Ecology and Ethics" },
    ],
  },

  {
    _id: "mains_gs4_2024_15",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "International Ethics",
    subTopic: "War, Peace, and Weapons Industry",
    marks: 10,
    directive: "What are the ethical considerations",
    wordLimit: 100,
    questionText:
      "\"It is not enough to talk about peace, one must believe in it; and it is not enough to believe in it, one must act upon it.\"\nIn the present context, the major weapon industries of the developed nations are adversely influencing continuation of number of wars for their own self-interest, all around the world. What are the ethical considerations of the powerful nations in today's international arena to stop continuation of ongoing conflicts?",
    keyPoints: [
      "Military-industrial complex: Eisenhower's warning; $2.2 trillion global arms expenditure",
      "Ongoing conflicts: Ukraine-Russia, Gaza-Israel, Sudan, Sahel — weapons supplied by major powers",
      "Ethical obligations: Responsibility to Protect (R2P), UN Charter, Just War Theory",
      "Arms trade ethics: conflict of interest when defence exporters are mediators",
      "India's position: non-alignment 2.0, dialogue over arms, peaceful resolution",
      "Quotation analysis: talk → believe → act; passive peace vs. active peace-building",
    ],
    idealAnswer: `Analysis of the Quotation:
The statement — attributed to Eleanor Roosevelt — demands progressive moral commitment: from rhetoric (talking about peace), to conviction (believing in peace), to action (working for peace). It indicts the hypocrisy of nations that rhetorically advocate peace while simultaneously profiting from war through arms exports. The ethical demand is congruence: aligning words, beliefs, and actions.

The Military-Industrial Complex and Conflict Perpetuation:
Eisenhower's 1961 warning about the "military-industrial complex" remains relevant. The global arms trade is now a $2.2 trillion annual industry (SIPRI 2023). The United States, Russia, France, Germany, and China account for approximately 76% of all arms exports. These nations are simultaneously the most influential voices in the UN Security Council on conflict resolution.

This creates a structural conflict of interest: the nations best positioned to end conflicts are the same nations whose defence industries profit from their continuation. Ukraine-Russia: the US and European nations supply Ukraine while also calling for negotiations. Gaza: American JDAM bomb kits are used in the same conflict where the US calls for humanitarian pauses. Sudan: Russian and UAE weapons proliferate in a country's civil war while these nations claim mediator roles.

Ethical Considerations for Powerful Nations:

1. Responsibility to Protect (R2P):
The 2005 World Summit Outcome Document established R2P — the international community's responsibility to protect populations from genocide, war crimes, ethnic cleansing, and crimes against humanity when their state fails. Powerful nations have a positive ethical obligation under R2P to act — not just talk about peace.

2. Just War Theory and Proportionality:
If powerful nations supply weapons, they bear ethical co-responsibility for how those weapons are used. International humanitarian law (IHL) — Geneva Conventions — prohibits attacks on civilians, proportionality violations, and targeting of protected sites. Arms suppliers who know weapons will be used in IHL violations share moral responsibility.

3. Conflict of Interest in Mediation:
A nation cannot simultaneously sell weapons to a conflict party and credibly mediate peace. The ethical requirement is either: (i) suspend arms sales during mediation attempts, or (ii) recuse from mediation in favour of neutral actors (Qatar, Switzerland, India).

4. UN Charter Obligations:
Article 2(4) prohibits threat or use of force against territorial integrity or political independence. Article 33 obliges all members to seek peaceful resolution first. Powerful nations routinely invoke these obligations for adversaries while permitting allies or their own military adventures to violate them — a double standard that undermines international legal ethics.

5. Economic Conversion — Arms to Development:
The Stockholm International Peace Research Institute estimates $2.2 trillion in military expenditure (2023). Even 10% redirection to climate finance, poverty alleviation, and health could transform global development. The ethical case for economic conversion — from military-industrial to peace-industrial economy — is compelling.

India's Ethical Position:
India's traditional emphasis on Panchsheel, non-intervention, and Vasudhaiva Kutumbakam provides a distinctive ethical framework for peace advocacy. India's G20 presidency focussed on "One Earth, One Family, One Future" — a civilisational vision of global solidarity over military competition. India's positioning as a Global South voice and honest broker (not supplying weapons to either Russia or Ukraine) provides moral standing for peace advocacy.

Acting on the Quotation:
Powerful nations must move from rhetoric to action by: imposing genuine conditions on arms transfers (human rights compliance); supporting UN peacekeeping and mediation financially; ending veto abuse in the Security Council that blocks conflict resolution; and accepting international criminal accountability for complicity in war crimes.

Conclusion: The most profound ethical obligation of powerful nations is congruence — making their actions consistent with their peace declarations. As the quotation demands, believing in peace is insufficient; acting for peace requires the sacrifice of arms industry profits in service of human dignity and civilisational survival.`,
    sources: [
      { name: "SIPRI Yearbook 2023", chapter: "Arms Trade and Conflict" },
      { name: "UN Charter — Articles 2, 33, 51", chapter: "Peace and Security Framework" },
      { name: "Responsibility to Protect — 2005 World Summit Outcome", chapter: "R2P Framework" },
    ],
  },

  {
    _id: "mains_gs4_2024_16",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Ethical Frameworks",
    subTopic: "Key Dimensions of Ethics",
    marks: 10,
    directive: "Explain / Discuss",
    wordLimit: 100,
    questionText:
      "\"Ethics encompasses several key dimensions that are crucial in guiding individuals and organizations towards morally responsible behaviour.\"\nExplain the key dimensions of ethics that influence human actions.\nDiscuss how these dimensions shape ethical decision-making in the professional context.",
    keyPoints: [
      "Dimensions: normative (what is right), meta-ethical (what is good), applied, descriptive",
      "Frameworks: deontology (Kant), consequentialism (Mill), virtue ethics (Aristotle), contractarianism (Rawls)",
      "Key dimensions: personal, professional, social, environmental, political",
      "Professional ethics: integrity, accountability, transparency, objectivity",
      "Application: civil servants, doctors, lawyers, corporate executives",
    ],
    idealAnswer: `Introduction: Ethics is not a monolithic discipline but a multi-dimensional framework — encompassing how we reason about right and wrong (normative ethics), what the nature of moral claims is (meta-ethics), how ethical principles apply in specific domains (applied ethics), and how moral beliefs actually operate in cultures and history (descriptive ethics).

Key Dimensions of Ethics:

1. Normative Dimension — What Should We Do?
Three major frameworks:
- Deontological Ethics (Kant): Right action is defined by adherence to universal duties and principles — regardless of outcomes. "Act only according to the maxim by which you can simultaneously will it to become a universal law." Core in professional ethics: a judge must apply law impartially even when a different outcome might seem more beneficial.
- Consequentialist Ethics (Utilitarianism — Mill): Right action maximises overall welfare (greatest happiness of the greatest number). Core in policy-making: utilitarian cost-benefit analysis in public projects (DAMS, nuclear plants) — calculating aggregate benefit vs. harm.
- Virtue Ethics (Aristotle): Right action flows from virtuous character — the person of practical wisdom (phronesis) naturally acts rightly. Core in professional identity: a civil servant of integrity acts ethically not because of rules but because of character.
- Contractarian Ethics (Rawls): Just principles are those rational persons would choose behind a "veil of ignorance" — not knowing their place in society. Core in policy: ensuring welfare schemes benefit the worst-off.

2. Personal Dimension — Character and Conscience:
Individual moral development (Kohlberg's stages), personal values, and conscience. A person's ethical behaviour begins with internalised values — honesty, empathy, fairness. This dimension determines whether an individual acts ethically when no one is watching.

3. Professional Dimension — Role-Based Obligations:
Every profession carries specific ethical obligations (medical ethics — Hippocratic oath; legal ethics — client confidentiality; civil service ethics — public interest above private interest). Professional codes formalise these obligations.

4. Social Dimension — Fairness, Rights, and Justice:
Ethics operates in a social context — rights-based frameworks (human rights), justice frameworks (Rawlsian fairness), and social contract theory. In public policy, social ethics demands attention to equity, inclusion, and non-discrimination.

5. Environmental Dimension — Intergenerational and Ecological Ethics:
Extending moral consideration to future generations and non-human life. Environmental ethics demands that decisions account for ecological consequences — particularly relevant in development decisions.

6. Applied Dimension — Specific Domain Ethics:
Bioethics (medical research, genetic engineering), business ethics (fiduciary duty, corporate social responsibility), AI ethics (algorithmic fairness, accountability), environmental ethics.

How These Dimensions Shape Ethical Decision-Making in Professional Contexts:

In Civil Services:
When a civil servant faces a dilemma (e.g., following orders that seem unjust), multiple dimensions are engaged simultaneously:
- Deontological: "My duty is to the Constitution — not to political masters who violate it."
- Consequentialist: "What decision produces the best outcome for citizens?"
- Virtue: "What would a person of integrity do?"
- Social justice: "Are the most vulnerable being protected?"

A fully ethical decision requires integrating these dimensions — not mechanically applying one framework.

In Medical Practice:
A doctor faced with a patient who refuses life-saving treatment balances:
- Autonomy (patient's right to decide)
- Beneficence (duty to heal)
- Non-maleficence (duty not to harm)
- Justice (equitable allocation of scarce resources)

In Corporate Leadership:
A CEO deciding whether to continue a profitable but polluting process must engage environmental ethics, stakeholder justice, and the long-term consequentialist calculation that regulatory and reputational risks outweigh short-term profit.

Conclusion: Ethical decision-making in professional contexts is not a single-dimension calculation but a multi-dimensional balancing act — integrating deontological duties, consequentialist welfare calculations, virtue-based character, and social justice considerations. The most ethical professionals are those who have internalised multiple frameworks and can apply them with practical wisdom (phronesis) to the specific context they face.`,
    sources: [
      { name: "Immanuel Kant — Groundwork for the Metaphysics of Morals", chapter: "Categorical Imperative" },
      { name: "John Stuart Mill — Utilitarianism", chapter: "Core Principles" },
      { name: "Aristotle — Nicomachean Ethics", chapter: "Virtue and Practical Wisdom" },
    ],
  },

  {
    _id: "mains_gs4_2024_17",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Governance and Technology",
    subTopic: "AI in Administrative Decision-Making",
    marks: 10,
    directive: "Critically Examine",
    wordLimit: 100,
    questionText:
      "The application of Artificial Intelligence as a dependable source of input for administrative rational decision-making is a debatable issue.\nCritically examine the statement from the ethical point of view.",
    keyPoints: [
      "AI advantages: data processing, objectivity (freedom from personal bias), speed, pattern recognition",
      "Ethical concerns: algorithmic bias, lack of accountability, opacity (black box), data privacy, displacement of human judgment",
      "Governance examples: AI in welfare targeting, crime prediction, hiring decisions — cases of bias and error",
      "Human-in-the-loop principle: AI as tool, not decision-maker",
      "Equality: Article 14 demands non-arbitrary state action — AI decisions must be explainable and contestable",
    ],
    idealAnswer: `Introduction: Artificial Intelligence is increasingly being explored as a tool for administrative decision-making — from welfare scheme targeting and tax fraud detection to crime prediction and recruitment screening. Its proponents argue it brings objectivity and efficiency; critics warn of systemic bias, opacity, and democratic accountability deficit.

Case for AI as Dependable Administrative Input:

1. Data Processing at Scale: AI can analyse millions of records, identify patterns, and surface recommendations faster than any human analyst — valuable in large-scale welfare scheme targeting (DBT beneficiary identification) or tax evasion detection.

2. Freedom from Individual Bias: Human administrators carry unconscious biases (gender, caste, religion). An AI system trained on objective data could theoretically make more consistent, bias-free decisions — improving equality before the law.

3. Efficiency and Speed: Automated AI-assisted processing of routine applications (passport verification, tax returns, permit approvals) reduces delays and corruption opportunities in human-mediated systems.

4. Evidence-Based Policy: AI-driven analysis of development programme outcomes (satellite imagery for crop insurance claims, satellite-based MGNREGA work verification) improves evidence quality for policy decisions.

Ethical Concerns — Critical Assessment:

1. Algorithmic Bias — AI Replicates and Amplifies Human Bias:
AI systems trained on historical data inherit historical biases. If past policing data reflects caste-based over-surveillance of certain communities, an AI crime prediction model trained on this data will recommend greater surveillance of those communities — creating a self-fulfilling feedback loop.
Real case: COMPAS (Correctional Offender Management Profiling for Alternative Sanctions) algorithm in US criminal justice was found to incorrectly flag Black defendants as higher recidivism risk at nearly twice the rate of White defendants (ProPublica, 2016).

2. Opacity and Explainability:
Most high-performance AI systems ("black boxes") cannot explain their recommendations in human-understandable terms. Administrative law (Article 14 of Indian Constitution; principles of natural justice) requires that decisions affecting individuals be explained and contestable. An AI decision that cannot be explained cannot be properly challenged.

3. Accountability Deficit:
When an AI system makes an incorrect recommendation that a human administrator acts upon, who is accountable? The developer, the deploying agency, the administrator? Current law has no clear framework — creating an accountability vacuum.

4. Data Privacy and Surveillance Risk:
AI-powered administrative systems require massive personal data inputs — creating surveillance infrastructure that, if misused, could enable authoritarian control. The Puttaswamy judgment (2017) recognised privacy as a fundamental right; AI administrative systems must comply with data minimisation and purpose limitation principles.

5. Democratic Legitimacy:
Administrative decisions have democratic legitimacy when made by accountable human officials subject to oversight. Delegating decision-making to AI systems — even nominally advisory ones — transfers effective power to unelected technologists and algorithms, raising questions of democratic accountability.

6. Context Insensitivity:
AI systems are trained on data — they cannot account for extraordinary circumstances, local cultural context, or compassionate judgment. A welfare eligibility AI might correctly identify a household as above threshold while missing the extraordinary medical expenses that render them functionally poor.

The Ethical Framework — Human-in-the-Loop:
The most defensible approach is AI as decision support, not decision-maker — with a human administrator retaining meaningful accountability and the capacity to override AI recommendations based on contextual judgment. This preserves constitutional safeguards (natural justice, Article 14), democratic accountability, and ethical responsibility.

India's DPDP Act 2023 and the draft Digital India Act framework must address algorithmic accountability — requiring AI systems used in administrative decisions to be explainable, auditable, and contestable.

Conclusion: AI offers genuine value in administrative decision-making — as an analytical tool, pattern recogniser, and efficiency enhancer. But deploying it as an autonomous decision-maker raises profound ethical concerns about bias, accountability, opacity, and democratic legitimacy. The ethical standard is not "can AI make better decisions than biased humans?" but "does AI-assisted decision-making serve justice, protect rights, and remain democratically accountable?" On this standard, the jury is still deliberating.`,
    sources: [
      { name: "NITI Aayog — Responsible AI Principles", chapter: "Ethics and Governance" },
      { name: "Puttaswamy Judgment 2017", chapter: "Right to Privacy" },
      { name: "ProPublica — Machine Bias (COMPAS Study)", chapter: "2016 Investigation" },
    ],
  },

  {
    _id: "mains_gs4_2024_18",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Ethics — Integrity in Governance",
    subTopic: "Form vs. Substance in Administration",
    marks: 10,
    directive: "Examine with illustrations",
    wordLimit: 100,
    questionText:
      "\"Mindless addiction to Form, ignoring the Substance of the matter, results in rendering of injustice. A perceptive civil servant is one who ignores such literalness and carries out true intent.\"\nExamine the above statement with suitable illustrations.",
    keyPoints: [
      "Form vs. Substance: procedural compliance vs. justice as purpose of governance",
      "Illustrations: file noting delays while beneficiary suffers; technical rejection of RTI; stamp paper requirement for poor",
      "Perceptive civil servant: uses judgment to serve spirit of law, not just its letter",
      "Legal grounding: natural justice, Article 14 (non-arbitrary state action)",
      "Danger of excess: 'ignoring form' cannot justify procedural bypass that enables corruption",
    ],
    idealAnswer: `Analysis of the Statement:
The statement captures a fundamental tension in governance: adherence to procedure (form) vs. achieving the purpose of governance (substance/justice). A governance system needs forms — they provide consistency, accountability, and prevent arbitrariness. But forms are means, not ends. When adherence to form prevents the delivery of justice, form has become an obstacle rather than a tool.

The "perceptive civil servant" the statement envisions is one with practical wisdom (Aristotelian phronesis): the ability to discern when strict formal compliance serves justice and when it defeats it — and to act accordingly.

Illustrations:

Illustration 1 — Pension Denial on Technical Grounds:
A 75-year-old retired government employee applies for pension arrears. A minor discrepancy in the date format on a certificate (dd/mm/yy vs. mm/dd/yy) causes the claim to be rejected on formal grounds — despite no substantive dispute about entitlement. A mindless application of form denies a elderly citizen months of rightful income. A perceptive civil servant would verify the substance, correct the format issue administratively, and process the pension rather than returning the file for re-application.

Illustration 2 — RTI Technical Rejection:
An RTI application is submitted with ₹10 postage instead of ₹10 in demand draft (as technically required by some departmental interpretations). The CPIO rejects it on formal grounds. The Supreme Court (Mahendra Singh Dhoni case and RTI jurisprudence) has repeatedly held that technical defects should not defeat the substance of the information right. A perceptive PIO treats the application on merit and seeks a corrected fee payment, rather than dismissing it.

Illustration 3 — Stamp Paper Requirement for the Poor:
A Below-Poverty-Line family seeking affidavit verification for a welfare scheme is told their stamp paper affidavit is on ₹10 paper instead of ₹20 — in a district where ₹20 stamp paper is unavailable. Returning the application defeats the scheme's purpose of reaching the poor. A perceptive officer accepts the affidavit and records the administrative reason — serving substance over form.

Illustration 4 — Medical Emergency and Procurement Rules:
During a disease outbreak, a district medical officer needs to procure medicines urgently. Strict procurement rules require a three-bid competitive process (2–3 weeks). A mindless application of procurement form while patients die ignores the substance — saving lives. A perceptive civil servant invokes emergency procurement provisions (which exist precisely for this situation) — serving the substance of public health while using a different, but legitimate, procedural path.

The Danger of Excess — Form Has Legitimate Purpose:
The statement must not be misread as licence to bypass procedures at will. Forms exist for important reasons: preventing corruption, ensuring equity, creating accountability. "Ignoring form" without judgment becomes an invitation to ad hoc decisions and corruption. The perceptive civil servant does not ignore form — they understand its purpose and apply it accordingly: respecting it when it serves justice; going beyond it (within legal authority) when it defeats justice.

Guiding Principle: The judiciary has consistently held that procedural requirements are directory (not mandatory) when strict compliance would defeat the right being protected — this is the legal grounding for the perceptive civil servant's approach.

Conclusion: The finest civil servants in Indian history — be it Patel's integration of princely states (which required creative legal and procedural innovation) or T.N. Sheshan's electoral reforms (which required reinterpreting the EC's constitutional authority) — combined procedural rigor with substantive vision. They understood that governance forms exist to deliver governance substance — and when form and substance conflict, substance must prevail within the law.`,
    sources: [
      { name: "2nd ARC Report — Ethics in Governance", chapter: "Administrative Values" },
      { name: "Aristotle — Nicomachean Ethics", chapter: "Practical Wisdom (Phronesis)" },
      { name: "RTI Act 2005", chapter: "Provisions on Application" },
    ],
  },

  {
    _id: "mains_gs4_2024_19",
    year: 2024,
    paper: "GS Paper 4",
    subject: "Ethics: Theory",
    topic: "Justice",
    subTopic: "Contextual Justice",
    marks: 10,
    directive: "Examine with examples",
    wordLimit: 100,
    questionText:
      "\"The concept of Just and Unjust is contextual. What was just a year back, may turn out to be unjust in today's context. Changing context should be constantly under scrutiny to prevent miscarriage of justice.\"\nExamine the above statement with suitable examples.",
    keyPoints: [
      "Justice is not absolute and ahistorical — it evolves with social, scientific, and normative context",
      "Examples: Section 377 (sodomy criminalization vs. decriminalization); Sati as 'tradition' vs. social reform; triple talaq",
      "Administrative application: outdated rules applied without contextual interpretation causing injustice",
      "Dynamic justice: constitutional morality vs. popular morality (Navtej Singh Johar case)",
      "Need for judicial and legislative review to align law with evolving justice",
    ],
    idealAnswer: `Analysis of the Statement:
The statement reflects a fundamental insight in philosophy of law and ethics: justice is not an eternal, context-independent absolute but a concept that evolves with moral understanding, scientific knowledge, social consensus, and power relations. What a society accepts as just in one era may be recognised as profoundly unjust in another — as our understanding of rights, dignity, and harm deepens.

This does not mean justice is merely relative (moral relativism). Rather, it means justice is subject to reasoned revision — as Rawls suggested, our "considered judgments" about justice evolve through reflective equilibrium.

The statement's second part is the crucial governance insight: this contextual nature of justice demands continuous scrutiny of laws, practices, and institutional arrangements — to prevent outdated conceptions of justice from perpetrating contemporary injustice.

Illustrations:

Example 1 — Section 377 and LGBTQ+ Rights:
For over 150 years, Section 377 of the IPC (1860) criminalised "carnal intercourse against the order of nature" — applied to consensual same-sex relations. Within the legal and social context of Victorian colonial morality, this was seen as "just" (or at least acceptable). By 2018, the Supreme Court in Navtej Singh Johar v. Union of India unanimously struck it down — recognising that the same provision that "protected social order" in 1860 perpetrated grave injustice against an entire community's dignity, identity, and rights. Same context (the provision), different justice outcome — because our understanding of autonomy, dignity, and equality evolved.

Example 2 — Sati as "Sacred Tradition":
For centuries, the practice of sati (widow immolation) was defended as a religious and social justice framework — a widow fulfilling her dharmic duty. The colonial Sati Regulation (1829), driven by reformers like Raja Ram Mohan Roy, criminalised it — a recognition that "traditional justice" was, in the evolved moral context, severe injustice against women. Today, the same practice that some defended as "just" is universally condemned as murder.

Example 3 — Triple Talaq:
Instant triple talaq (talaq-e-biddat) was practiced for decades as a valid form of divorce under personal law — upheld by courts as religious practice. The Supreme Court in Shayara Bano (2017) declared it unconstitutional — recognising that a provision "just" within an older patriarchal framework was manifestly unjust against women's equality and dignity in a constitutional republic.

Example 4 — Child Labour in Agriculture:
Until recently, employing children in agriculture was widely accepted as economic necessity and family tradition in rural India. The evolving understanding of child rights, the Right to Education Act (2009), and international child rights frameworks (UNCRC) have progressively redefined child agricultural labour from "normal" to "unjust" — reflecting contextual evolution.

Administrative Application — Preventing Miscarriage of Justice:
Governments often apply rules mechanically without contextual review:
- An outdated welfare scheme eligibility criterion (based on 1990 data) that excludes newly poor urban migrants represents an unchanged "just" rule operating unjustly in a changed context.
- Environmental clearance procedures designed before satellite monitoring and digital surveillance existed may no longer adequately protect ecosystems in today's context.

The statement demands: regular legislative review, sunset clauses on regulations, and judicial interpretation aligned with constitutional morality rather than historical social morality.

Conclusion: Contextual justice demands institutional humility — the recognition that today's "just" laws may be tomorrow's injustices, and the willingness to continuously review, reform, and evolve. The constitutional test is not "was this just in the past?" but "is this just today — in light of our fullest understanding of rights, dignity, and human flourishing?" Constant scrutiny of this gap between legal justice and evolving moral justice is the democratic imperative that prevents the law from becoming an instrument of historical injustice preserved into the present.`,
    sources: [
      { name: "Navtej Singh Johar v. Union of India (2018)", chapter: "Supreme Court Judgment" },
      { name: "Shayara Bano v. Union of India (2017)", chapter: "Triple Talaq Judgment" },
      { name: "John Rawls — A Theory of Justice", chapter: "Reflective Equilibrium" },
    ],
  },
];

export default mainsGS4Data;