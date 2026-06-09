/**
 * UserData — PostgreSQL / Sequelize
 *
 * The original single Mongoose document is split into relational tables:
 *
 *   UserData          — one row per user (root record)
 *   SyllabusModule    — one row per module (maps to moduleSchema)
 *   Answer            — one row per written answer
 *   DailyLog          — one row per daily study log
 *   SpacedRepItem     — one row per spaced-repetition item
 *
 * Relationships:
 *   User      1 ── 1   UserData
 *   UserData  1 ── N   SyllabusModule
 *   UserData  1 ── N   Answer
 *   UserData  1 ── N   DailyLog
 *   UserData  1 ── N   SpacedRepItem
 */

const { DataTypes, Op } = require("sequelize");
const { sequelize } = require("../config/db");

// ─── UserData (root) ──────────────────────────────────────────────────────────

const UserData = sequelize.define(
  "UserData",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
  },
  { timestamps: true, underscored: true }
);

// ─── SyllabusModule ───────────────────────────────────────────────────────────
// Replaces the nested prelims/mains/paper/module structure.
// "exam_stage"  : "prelims" | "mains"
// "paper"       : "GS1" | "CSAT" | "GS2" … | "Essay"
// "module_key"  : e.g. "Current Events", "Indian Culture" …

const SyllabusModule = sequelize.define(
  "SyllabusModule",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    exam_stage: {
      type: DataTypes.ENUM("prelims", "mains"),
      allowNull: false,
    },
    paper: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    paper_label: { type: DataTypes.STRING },
    paper_subtitle: { type: DataTypes.STRING },
    paper_color: { type: DataTypes.STRING(20) },
    module_key: { type: DataTypes.STRING, allowNull: false },
    title: { type: DataTypes.STRING, allowNull: false },
    topics: {
      type: DataTypes.JSONB, // string[]
      defaultValue: [],
    },
    progress: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0, max: 100 },
    },
    state: {
      type: DataTypes.ENUM("pending", "progress", "revision", "done"),
      defaultValue: "pending",
    },
  },
  { timestamps: false, underscored: true }
);

// ─── Answer ───────────────────────────────────────────────────────────────────

const Answer = sequelize.define(
  "Answer",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    answer_ref_id: { type: DataTypes.STRING }, // original "id" field from Mongo
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    paper: { type: DataTypes.STRING, defaultValue: "GS" },
    question: { type: DataTypes.TEXT },
    answer: { type: DataTypes.TEXT },
    evaluation: { type: DataTypes.TEXT },
    word_count: { type: DataTypes.INTEGER },
  },
  { timestamps: false, underscored: true }
);

// ─── DailyLog ─────────────────────────────────────────────────────────────────

const DailyLog = sequelize.define(
  "DailyLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    date: { type: DataTypes.DATEONLY, allowNull: false }, // "YYYY-MM-DD"
    hours: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0, max: 24 },
    },
    notes: { type: DataTypes.TEXT, defaultValue: "" },
    logged_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false, underscored: true }
);

// ─── SpacedRepItem ────────────────────────────────────────────────────────────

const SpacedRepItem = sequelize.define(
  "SpacedRepItem",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    item_ref_id: { type: DataTypes.STRING }, // original "id" from Mongo
    topic: { type: DataTypes.STRING, allowNull: false },
    paper: { type: DataTypes.STRING, defaultValue: "General" },
    difficulty: {
      type: DataTypes.ENUM("easy", "medium", "hard"),
      defaultValue: "medium",
    },
    added: { type: DataTypes.DATEONLY },
    next_review: { type: DataTypes.DATEONLY },
    review_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    interval_days: { type: DataTypes.INTEGER, defaultValue: 3 },
  },
  { timestamps: false, underscored: true }
);

// ─── Associations ─────────────────────────────────────────────────────────────

const User = require("./User");

User.hasOne(UserData, { foreignKey: "user_id", as: "userData", onDelete: "CASCADE" });
UserData.belongsTo(User, { foreignKey: "user_id" });


UserData.hasMany(SyllabusModule, { foreignKey: "user_data_id", as: "syllabusModules", onDelete: "CASCADE" });
SyllabusModule.belongsTo(UserData, { foreignKey: "user_data_id" });

UserData.hasMany(Answer, { foreignKey: "user_data_id", as: "answers", onDelete: "CASCADE" });
Answer.belongsTo(UserData, { foreignKey: "user_data_id" });

UserData.hasMany(DailyLog, { foreignKey: "user_data_id", as: "dailyLogs", onDelete: "CASCADE" });
DailyLog.belongsTo(UserData, { foreignKey: "user_data_id" });

UserData.hasMany(SpacedRepItem, { foreignKey: "user_data_id", as: "spacedRepItems", onDelete: "CASCADE" });
SpacedRepItem.belongsTo(UserData, { foreignKey: "user_data_id" });

// ─── Default Syllabus Seed ────────────────────────────────────────────────────

const DEFAULT_SYLLABUS_MODULES = [
  // ── PRELIMS ── GS1
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "Current Events", title: "Current Events", topics: ["Current events of national and international importance"] },
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "History of India & Indian National Movement", title: "History of India & Indian National Movement", topics: ["History of India", "Indian National Movement"] },
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "Indian & World Geography", title: "Indian & World Geography", topics: ["Physical, Social, Economic Geography of India and the World"] },
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "Indian Polity & Governance", title: "Indian Polity & Governance", topics: ["Constitution", "Political System", "Panchayati Raj", "Public Policy", "Rights Issues"] },
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "Economic & Social Development", title: "Economic & Social Development", topics: ["Sustainable Development", "Poverty", "Inclusion", "Demographics", "Social Sector Initiatives"] },
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "Environment, Ecology & Climate Change", title: "Environment, Ecology & Climate Change", topics: ["General issues on Environmental Ecology, Bio-diversity and Climate Change"] },
  { exam_stage: "prelims", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "200 Marks · 2 Hours · Counted for merit", paper_color: "#F59E0B", module_key: "General Science", title: "General Science", topics: ["General Science"] },

  // ── PRELIMS ── CSAT
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "Comprehension", title: "Comprehension", topics: ["Reading Comprehension passages"] },
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "Interpersonal & Communication Skills", title: "Interpersonal & Communication Skills", topics: ["Interpersonal skills including communication skills"] },
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "Logical Reasoning & Analytical Ability", title: "Logical Reasoning & Analytical Ability", topics: ["Logical Reasoning", "Analytical Ability"] },
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "Decision Making & Problem Solving", title: "Decision Making & Problem Solving", topics: ["Decision Making", "Problem Solving"] },
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "General Mental Ability", title: "General Mental Ability", topics: ["General Mental Ability"] },
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "Basic Numeracy", title: "Basic Numeracy", topics: ["Numbers and their relations", "Orders of magnitude", "Data interpretation (Charts, Graphs, Tables)"] },
  { exam_stage: "prelims", paper: "CSAT", paper_label: "General Studies Paper II (CSAT)", paper_subtitle: "200 Marks · 2 Hours · Qualifying — 33% minimum · Not counted for merit", paper_color: "#6366F1", module_key: "English Language Comprehension", title: "English Language Comprehension", topics: ["English Language Comprehension skills (Class X level)"] },

  // ── MAINS ── GS1
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "Indian Culture", title: "Indian Culture", topics: ["Salient aspects of Art Forms, Literature, Architecture from ancient to modern times"] },
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "Modern Indian History", title: "Modern Indian History", topics: ["18th century onwards", "British consolidation", "Freedom struggle", "Significant personalities"] },
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "Post-Independence Consolidation", title: "Post-Independence Consolidation", topics: ["Reorganization of states", "Five Year Plans", "Cold War era foreign policy"] },
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "World History", title: "World History", topics: ["Events from 18th century", "World Wars", "Colonisation", "Redrawal of world map", "Political philosophies"] },
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "Indian Society", title: "Indian Society", topics: ["Salient features of Indian society", "Diversity of India", "Role of women", "Poverty and developmental issues", "Urbanisation", "Communalism, Regionalism, Secularism"] },
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "World Geography", title: "World Geography", topics: ["Physical, Social, Economic Geography"] },
  { exam_stage: "mains", paper: "GS1", paper_label: "General Studies Paper I", paper_subtitle: "250 Marks · Indian Heritage, Culture, History, Geography", paper_color: "#EF4444", module_key: "Indian Geography", title: "Indian Geography", topics: ["Resources distribution", "Factors of Industries location", "Critical Geographical features and changes in flora/fauna"] },

  // ── MAINS ── GS2
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "Indian Constitution", title: "Indian Constitution", topics: ["Historical underpinnings", "Evolution", "Features", "Amendments", "Significant provisions"] },
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "Functions and Responsibilities of Government", title: "Functions and Responsibilities of Government", topics: ["Federal structure", "Devolution of powers", "Separation of powers between Centre and States"] },
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "Comparison of Constitutions", title: "Comparison of Constitutions", topics: ["Parliament and State Legislatures", "Comparison with other countries"] },
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "Executive and Judiciary", title: "Executive and Judiciary", topics: ["Ministries and departments", "Pressure groups", "Formal/informal associations"] },
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "Government Schemes & Bodies", title: "Government Schemes & Bodies", topics: ["Important aspects of governance", "Transparency and accountability", "E-governance"] },
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "Social Sector Issues", title: "Social Sector Issues", topics: ["Health", "Education", "Human resources", "Poverty and hunger"] },
  { exam_stage: "mains", paper: "GS2", paper_label: "General Studies Paper II", paper_subtitle: "250 Marks · Governance, Constitution, Social Justice, IR", paper_color: "#10B981", module_key: "International Relations", title: "International Relations", topics: ["India and its neighbourhood", "Bilateral & groupings", "International bodies", "Effect of foreign policies on India's interests"] },

  // ── MAINS ── GS3
  { exam_stage: "mains", paper: "GS3", paper_label: "General Studies Paper III", paper_subtitle: "250 Marks · Technology, Economy, Environment, Security", paper_color: "#8B5CF6", module_key: "Indian Economy", title: "Indian Economy", topics: ["Planning", "Mobilisation of resources", "Growth", "Development", "Employment"] },
  { exam_stage: "mains", paper: "GS3", paper_label: "General Studies Paper III", paper_subtitle: "250 Marks · Technology, Economy, Environment, Security", paper_color: "#8B5CF6", module_key: "Agriculture", title: "Agriculture", topics: ["Issues related to direct & indirect farm subsidies", "MSP", "PDS", "Buffer stock", "Food security"] },
  { exam_stage: "mains", paper: "GS3", paper_label: "General Studies Paper III", paper_subtitle: "250 Marks · Technology, Economy, Environment, Security", paper_color: "#8B5CF6", module_key: "Science & Technology", title: "Science & Technology", topics: ["Developments and their applications", "Awareness in IT, Space, Computers, Robotics, Nano-technology, Bio-technology"] },
  { exam_stage: "mains", paper: "GS3", paper_label: "General Studies Paper III", paper_subtitle: "250 Marks · Technology, Economy, Environment, Security", paper_color: "#8B5CF6", module_key: "Environment & Ecology", title: "Environment & Ecology", topics: ["Conservation", "Environmental pollution", "Disaster management", "Climate change"] },
  { exam_stage: "mains", paper: "GS3", paper_label: "General Studies Paper III", paper_subtitle: "250 Marks · Technology, Economy, Environment, Security", paper_color: "#8B5CF6", module_key: "Internal Security", title: "Internal Security", topics: ["Role of external state/non-state actors in creating challenges", "Linkages between organized crime and terrorism", "Cyber security"] },
  { exam_stage: "mains", paper: "GS3", paper_label: "General Studies Paper III", paper_subtitle: "250 Marks · Technology, Economy, Environment, Security", paper_color: "#8B5CF6", module_key: "Infrastructure", title: "Infrastructure", topics: ["Energy", "Ports", "Roads", "Airports", "Railways", "Investment models"] },

  // ── MAINS ── GS4
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Ethics & Human Interface", title: "Ethics & Human Interface", topics: ["Essence, determinants, and consequences of Ethics", "Dimensions of ethics", "Ethics in public/private life"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Attitude", title: "Attitude", topics: ["Content, structure, function", "Influence on thought and behaviour", "Moral and political attitudes", "Social influence and persuasion"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Aptitude & Foundational Values", title: "Aptitude & Foundational Values", topics: ["Integrity", "Impartiality", "Non-partisanship", "Objectivity", "Dedication to public service", "Empathy", "Tolerance", "Compassion"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Emotional Intelligence", title: "Emotional Intelligence", topics: ["Concepts and their utilities and application in administration and governance"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Thinkers & Philosophers", title: "Thinkers & Philosophers", topics: ["Contributions of moral thinkers and philosophers from India and world"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Public/Civil Service Values", title: "Public/Civil Service Values", topics: ["Status and problems", "Ethical concerns in government and private institutions", "Laws, rules, regulations, conscience"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Probity in Governance", title: "Probity in Governance", topics: ["Concept of public service", "Philosophical basis of governance", "Information sharing and transparency", "Codes of Ethics", "Citizen's charters", "RTI"] },
  { exam_stage: "mains", paper: "GS4", paper_label: "General Studies Paper IV", paper_subtitle: "250 Marks · Ethics, Integrity, Aptitude", paper_color: "#F97316", module_key: "Case Studies on Ethics", title: "Case Studies on Ethics", topics: ["Case studies on above issues"] },

  // ── MAINS ── Essay
  { exam_stage: "mains", paper: "Essay", paper_label: "Essay Paper", paper_subtitle: "250 Marks · Two Essays · Sections A & B", paper_color: "#EC4899", module_key: "Essay Writing Technique", title: "Essay Writing Technique", topics: ["Structure and flow", "Thesis development", "Coherence and argument building"] },
  { exam_stage: "mains", paper: "Essay", paper_label: "Essay Paper", paper_subtitle: "250 Marks · Two Essays · Sections A & B", paper_color: "#EC4899", module_key: "Philosophical & Abstract Essays", title: "Philosophical & Abstract Essays", topics: ["Abstract topics requiring philosophical depth", "Values and ethics-based essays"] },
  { exam_stage: "mains", paper: "Essay", paper_label: "Essay Paper", paper_subtitle: "250 Marks · Two Essays · Sections A & B", paper_color: "#EC4899", module_key: "Social Issues Essays", title: "Social Issues Essays", topics: ["Contemporary social issues", "Gender", "Education", "Poverty", "Urbanisation"] },
  { exam_stage: "mains", paper: "Essay", paper_label: "Essay Paper", paper_subtitle: "250 Marks · Two Essays · Sections A & B", paper_color: "#EC4899", module_key: "Polity & Governance Essays", title: "Polity & Governance Essays", topics: ["Democracy", "Constitutional values", "Federalism", "Judiciary", "Bureaucracy"] },
  { exam_stage: "mains", paper: "Essay", paper_label: "Essay Paper", paper_subtitle: "250 Marks · Two Essays · Sections A & B", paper_color: "#EC4899", module_key: "Economy & Development Essays", title: "Economy & Development Essays", topics: ["Economic liberalisation", "Inclusive growth", "Sustainable development"] },
  { exam_stage: "mains", paper: "Essay", paper_label: "Essay Paper", paper_subtitle: "250 Marks · Two Essays · Sections A & B", paper_color: "#EC4899", module_key: "Science, Tech & Environment Essays", title: "Science, Tech & Environment Essays", topics: ["Science and society", "Climate change", "Biotechnology ethics"] },
];

UserData.seedForUser = async function (userId) {
  const userData = await UserData.create({ user_id: userId });

  const modulesToInsert = DEFAULT_SYLLABUS_MODULES.map((m) => ({
    ...m,
    user_data_id: userData.id,
    progress: 0,
    state: "pending",
  }));

  await SyllabusModule.bulkCreate(modulesToInsert);
  return userData;
};

module.exports = { UserData, SyllabusModule, Answer, DailyLog, SpacedRepItem };