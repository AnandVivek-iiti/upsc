// usage-example.js
// Shows how to use the multi-provider AI client

const { evaluateAnswer } = require("./ai-client");

// Example: UPSC question + student answer
const prompt = `
QUESTION: Discuss the role of the National Commission for Women (NCW) in addressing gender-based violence in India. (15 Marks)

STUDENT ANSWER:
The National Commission for Women was established in 1992 to protect the rights of women. It investigates complaints of violence against women and recommends legal changes. The commission has played a role in highlighting issues like dowry deaths and domestic violence. It also works with state governments to implement welfare schemes for women.

However, the NCW has faced criticism for being ineffective in many cases. The commission lacks enforcement powers and can only make recommendations. Despite laws like the Protection of Women from Domestic Violence Act 2005, implementation remains poor. Many rural women are unaware of their rights.

The way forward includes strengthening NCW's powers, increasing awareness, and better coordination between police and NCW.
`;

(async () => {
  try {
    const { result, provider } = await evaluateAnswer(prompt);

    console.log(`\n✅ Evaluation completed by: ${provider}\n`);
    console.log("Score:", result.score, "/10");
    console.log("Rationale:", result.score_rationale);
    console.log("\nPriority Actions:");
    result.priority_actions.forEach((action, i) => {
      console.log(`  ${i + 1}. ${action}`);
    });

    // Full result available as a clean JS object
    // console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Evaluation failed:", err.message);
  }
})();