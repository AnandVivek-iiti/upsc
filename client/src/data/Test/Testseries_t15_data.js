
export const TEST_T15 = [
  {
    id: "sfg2026-t15",
    title: "SFG 2026 - Level 1 · Test 15",
    testCode: "322102",
    subject: "CSAT",
    topic: "Aptitude and Data Interpretation",
    totalQuestions: 40,
    maxMarks: 80,
    timeMinutes: 60,
    markPerQuestion: 2,
    negativeFraction: 1 / 3,
    color: "#F97316", // Orange shade for test 15
    year: 2026,
    level: 1,
    questions: [
      {
        id: "t15_q01",
        qNo: 1,
        text: "The number 3798125P369 is divisible by 7. What is the value of the digit P?",
        suffix: "",
        options: [
          { id: "A", text: "1" },
          { id: "B", text: "6" },
          { id: "C", text: "7" },
          { id: "D", text: "9" }
        ],
        correct: "B",
        explanation:
          "Divide the number in triplets from right: 369, 25P, 981, 37. Subtract first and second triplet, and third and fourth: (369 - 25P) + (981 - 37) = 1313 - 25P. For divisibility by 7, 1313 leaves remainder 4 on division by 7, so 25P must leave remainder 4. 25P is between 250 and 259; 252 and 259 divisible by 7, so 252+4=256 => P=6.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q02",
        qNo: 2,
        text: "What is the rightmost non-zero digit in the value of 70^2026?",
        suffix: "",
        options: [
          { id: "A", text: "1" },
          { id: "B", text: "3" },
          { id: "C", text: "7" },
          { id: "D", text: "9" }
        ],
        correct: "D",
        explanation:
          "70^2026 = (7×10)^2026 = 7^2026 × 10^2026. The 10^2026 only adds zeros, so we need unit digit of 7^2026. Powers of 7 cycle: 7,9,3,1 (cycle length 4). 2026 mod 4 = 2, so second in cycle is 9. Rightmost non-zero digit is 9.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q03",
        qNo: 3,
        text: "When the numbers 749, 1041, and 1479 are each divided by a certain positive integer n, they all leave the same remainder r, where r is greater than 5. How many possible values of n satisfy this condition?",
        suffix: "",
        options: [
          { id: "A", text: "3" },
          { id: "B", text: "2" },
          { id: "C", text: "1" },
          { id: "D", text: "4" }
        ],
        correct: "B",
        explanation:
          "If numbers leave same remainder, their differences are divisible by n. Differences: 1041-749=292, 1479-1041=438, 1479-749=730. GCD(292,438,730)=146. So n must divide 146 = 2×73. Divisors: 1,2,73,146. r>5: for n=73, remainder 749 mod 73 = 19; for n=146, remainder 749 mod 146 = 19. Both satisfy. So 2 values.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q04",
        qNo: 4,
        text: "A warehouse contains three vats with 462 litres of Apple juice, 546 litres of orange juice, and 756 litres of Grape juice. The owner wants to bottle the juices into identical containers such that each container is filled completely (no partial filling). No container contains a mixture of different juices. The capacity of each container is an even integer greater than 5. How many different container capacities (in litres) are possible?",
        suffix: "",
        options: [
          { id: "A", text: "3" },
          { id: "B", text: "2" },
          { id: "C", text: "4" },
          { id: "D", text: "5" }
        ],
        correct: "A",
        explanation:
          "Capacity must divide each quantity: common divisor of 462,546,756. Prime factorization: 462=2×3×7×11, 546=2×3×7×13, 756=2^2×3^3×7. GCD = 2×3×7=42. Divisors of 42: 1,2,3,6,7,14,21,42. Even and >5: 6,14,42 => 3 possibilities.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q05",
        qNo: 5,
        text: "Two friends, A and B, start a cafe business. A invests 10,000 less than B. A remains in the business for 12 months, while B remains for 6 months. The total profit earned is 5,000. A's share of profit is 1,000 more than B's share. What was the capital invested by B?",
        suffix: "",
        options: [
          { id: "A", text: "20,000" },
          { id: "B", text: "25,000" },
          { id: "C", text: "30,000" },
          { id: "D", text: "40,000" }
        ],
        correct: "D",
        explanation:
          "Let B's capital = x, A's = x-10000. Profit ratio = capital×time: A:B = 12(x-10000) : 6x = 2(x-10000) : x. Given total profit 5000, A's share 3000, B's 2000 => ratio 3:2. So 2(x-10000)/x = 3/2 => 4x - 40000 = 3x => x=40000.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q06",
        qNo: 6,
        text: "A's salary is 25% higher than B's salary. B's salary is 20% lower than C's salary. C's salary is 10% higher than D's salary. By what percentage is D's salary lower than A's salary?",
        suffix: "",
        options: [
          { id: "A", text: "8.25%" },
          { id: "B", text: "9.09%" },
          { id: "C", text: "10%" },
          { id: "D", text: "11.1%" }
        ],
        correct: "B",
        explanation:
          "Let D=100. Then C=110. B=80% of 110=88. A=125% of 88=110. So D=100, A=110. Difference = 10, percentage lower = (10/110)×100 = 9.09%.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q07",
        qNo: 7,
        text: "A student was instructed to perform the following operation on a number. First, multiply the number by 3/4. Then, decrease the result by 20 percent. However, the student made a mistake and instead divided the number by 3/4 and then increased the result by 20 percent. What is the percentage error in the final result (rounded to two decimal places)?",
        suffix: "",
        options: [
          { id: "A", text: "66.67%" },
          { id: "B", text: "133.33%" },
          { id: "C", text: "166.67%" },
          { id: "D", text: "33.33%" }
        ],
        correct: "C",
        explanation:
          "Let original = x. Correct result = (3/4)x × 0.8 = 0.6x. Wrong result = (4/3)x × 1.2 = 1.6x. Error = 1.6x - 0.6x = 1.0x. Percentage error = (1.0x / 0.6x)×100 = 166.67%.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q08",
        qNo: 8,
        text: "Let n be a positive integer such that n = x×y×z, where x, y, and z are three distinct prime numbers satisfying the condition 3 ≤ x < y < z < 25.\n\nConsider the following statements:\n1. The sum of the digits of n can be a prime number.\n2. The unit digit of n can never be 5.\n\nWhich of the statements given above are correct?",
        suffix: "",
        options: [
          { id: "A", text: "1 only" },
          { id: "B", text: "2 only" },
          { id: "C", text: "Both 1 and 2" },
          { id: "D", text: "Neither 1 nor 2" }
        ],
        correct: "A",
        explanation:
          "Primes between 3 and 25: 3,5,7,11,13,17,19,23. Statement 1: example 7×11×13=1001, sum digits=2 prime → correct. Statement 2: if 5 is one of the primes, unit digit can be 5 (e.g., 3×5×7=105) → incorrect. So only statement 1 correct.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q09",
        qNo: 9,
        text: "A master carpenter has a large wooden cube and wants to cut it into 72 identical rectangular blocks. The cutting must be such that all blocks are identical in shape and size. Each cut must be a single straight plane through the entire structure. After making a cut, the carpenter is not allowed to move or rearrange the pieces. What is the minimum number of cuts required to obtain 72 identical rectangular blocks?",
        suffix: "",
        options: [
          { id: "A", text: "10" },
          { id: "B", text: "13" },
          { id: "C", text: "14" },
          { id: "D", text: "15" }
        ],
        correct: "A",
        explanation:
          "If cube is cut into a×b×c blocks, total cuts = (a-1)+(b-1)+(c-1) = a+b+c-3. Factor 72: 3×4×6 gives cuts = 2+3+5=10. Other factorizations: 2×6×6 → 11, 3×3×8 → 11. Minimum is 10.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q10",
        qNo: 10,
        text: "Three workers A, B, and C can complete a project together in 12 days. The work proceeds as follows. All three work together for the first 3 days, after which C leaves. A and B then work together for the next 3 days, after which B also leaves. To complete the remaining work within the original 12-day period, A works alone for the last 6 days after increasing his efficiency by 60%. It is given that B is twice as efficient as C. How many days would B alone take to complete the entire project?",
        suffix: "",
        options: [
          { id: "A", text: "48" },
          { id: "B", text: "51" },
          { id: "C", text: "53" },
          { id: "D", text: "55" }
        ],
        correct: "C",
        explanation:
          "Let C's efficiency = c, B=2c, A=a. Total work = 12(a+3c). Work in first 6 days = 3(a+3c)+3(a+2c)=6a+15c. Remaining = 6a+21c. A's new efficiency = 1.6a, work in 6 days = 9.6a = 6a+21c => a=35c/6. Total work = 12(35c/6+3c)=106c. B alone time = 106c/(2c)=53 days.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q11",
        qNo: 11,
        text: "What is the number of fives used in numbering a 260-page book?",
        suffix: "",
        options: [
          { id: "A", text: "55" },
          { id: "B", text: "56" },
          { id: "C", text: "57" },
          { id: "D", text: "60" }
        ],
        correct: "B",
        explanation:
          "Count occurrences of digit 5 in page numbers 1 to 260.\n- Single digit: 5 → 1\n- Two-digit: units: 15,25,...,95 (9); tens: 50-59 (10) → 19\n- Three-digit: 100-199: units (105,115,...,195=10), tens (150-159=10) → 20\n200-260: units (205,215,...,255 => 6), tens (250-259 => 10) → 16\nTotal = 1+19+20+16 = 56.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q12",
        qNo: 12,
        text: "A question is followed by two statements A and B. Consider the following Question and statements:\n\nIn a class of 50 students, Isha and her twin brother Ishan are competing for the top spots. Isha is ranked 4th among the girls. Ishan is ranked 11th in the entire class.\n\nQuestion: Between Isha and Ishan, who has the better overall rank in the class?\n\nStatement A: Among the students ranked lower (worse than) than Ishan, the ratio of boys to girls is 4:9.\nStatement B: Among the top 10 students in the class, the ratio of boys to girls is 3:2.\n\nWhich of the following is correct in reference to the question and statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "Statement A alone is sufficient to answer the question, but Statement B alone is not sufficient." },
          { id: "B", text: "Statement B alone is sufficient to answer the question, but Statement A alone is not sufficient." },
          { id: "C", text: "Both Statement A and Statement B together are sufficient to answer the question, but neither Statement alone is sufficient." },
          { id: "D", text: "Even using both Statement A and Statement B together, the question cannot be answered." }
        ],
        correct: "B",
        explanation:
          "Ishan's rank = 11. Statement A: gives ratio of boys to girls among those below Ishan, but no info about boys above Isha, so not sufficient. Statement B: top 10 has boys:girls=3:2 => 6 boys, 4 girls. Since Isha is 4th among girls, she must be in top 10 (rank ≤10). Thus Isha has better rank than Ishan (11). So Statement B alone sufficient.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q13",
        qNo: 13,
        text: "A question is followed by two statements I and II. Consider the following Question and statements:\n\nIn a city, two companies, Company X and Company Y, are competing for market share. At the beginning of the year, Company X had a larger market share than Company Y.\n\nQuestion: Is Company X's market share still larger than Company Y's at the end of the year?\n\nStatement I: During the year, Company Y's market share increased by 25% of its value at the start of the year, while Company X's market share decreased by 15% of its initial value at the start of the year.\nStatement II: The total gain by Company Y over the course of the year is exactly equal to the total loss by Company X.\n\nWhich one of the following is correct in reference to the question and statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "The Question can be answered by using one of the Statements alone, but cannot be answered using the other statement alone." },
          { id: "B", text: "The Question can be answered by using either Statement alone." },
          { id: "C", text: "The Question can be answered by using both the Statements together, but cannot be answered using either Statement alone." },
          { id: "D", text: "The Question cannot be answered even using both the Statements together." }
        ],
        correct: "C",
        explanation:
          "Let initial X = X, Y = Y with X>Y. Statement I alone: end values: X'=0.85X, Y'=1.25Y. This depends on initial ratio, not sufficient. Statement II alone: loss of X = gain of Y in percentage points, but without magnitudes, not sufficient. Together: 0.15X = 0.25Y => X/Y = 5/3. Then X'=0.85X, Y'=1.25Y. Using X=5k, Y=3k: X'=4.25k, Y'=3.75k => X'>Y'. So both together sufficient but neither alone.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q14",
        qNo: 14,
        text: "A question is followed by two statements I and II. Consider the following Question and statements:\n\nSix friends - U, V, W, X, Y, and Z - are sitting in a row facing North. Each person occupies a unique place.\n\nQuestion: Who is sitting at the extreme right end?\n\nStatement I: Only two people sit between U and X. V sits to the immediate left of X.\nStatement II: W sits third to the left of Y. Y is not an immediate neighbor of U.\n\nWhich of the following is correct in reference to the question and statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "Statement I alone is sufficient to answer the question, but Statement II alone is not sufficient." },
          { id: "B", text: "Statement II alone is sufficient to answer the question, but Statement I alone is not sufficient." },
          { id: "C", text: "Both Statement I and Statement II together are sufficient to answer the question, but neither Statement alone is sufficient." },
          { id: "D", text: "Even using both Statement I and Statement II together, the question cannot be answered." }
        ],
        correct: "D",
        explanation:
          "Statement I gives possible positions for U,V,X but not fixed extreme right. Statement II also leaves many possibilities. Combining yields multiple valid arrangements with different extreme right persons (e.g., Z, Y, U). Thus not uniquely determined.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q15",
        qNo: 15,
        text: "A question is followed by two statements I and II. Consider the following Question and statements:\n\nQuestion: Is the integer n divisible by 125?\n\nStatement I: n = k! / m! for some positive integers k and m, where k - m = 5.\nStatement II: n is the product of five consecutive integers, and the middle (median) integer is a prime number p greater than 7.\n\nWhich of the following is correct in reference to the question and the statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "Statement I alone is sufficient to answer the question, but Statement II alone is not sufficient." },
          { id: "B", text: "Statement II alone is sufficient to answer the question, but Statement I alone is not sufficient." },
          { id: "C", text: "Both Statement I and Statement II together are sufficient to answer the question, but neither Statement alone is sufficient." },
          { id: "D", text: "Even using both Statement I and Statement II together, the question cannot be answered." }
        ],
        correct: "D",
        explanation:
          "Statement I: n = product of 5 consecutive integers. Whether divisible by 125 depends on values; e.g., m=5 gives only one factor of 5, m=120 gives 125. Not sufficient. Statement II: similar, e.g., p=11 gives product 9×10×11×12×13 has one 5; p=127 gives 125×... has 5^3. Not sufficient. Together still leaves both possibilities, so not sufficient.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q16",
        qNo: 16,
        text: "A question is followed by two statements I and II. Consider the following Question and statements:\n\nA workshop consists of 50 participants. Each participant is either an undergraduate or a graduate student. Let P be the probability that a randomly selected participant is a female graduate student.\n\nQuestion: Is P less than one-half?\n\nStatement I: Out of the 50 participants, 24 are female.\nStatement II: Out of the 50 participants, 18 are graduate students.\n\nWhich one of the following is correct in reference to the question and statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "The Question can be answered by using one of the Statements alone, but cannot be answered using the other statement alone." },
          { id: "B", text: "The Question can be answered by using either Statement alone." },
          { id: "C", text: "The Question can be answered by using both the Statements together, but cannot be answered using either Statement alone." },
          { id: "D", text: "The Question cannot be answered even using both the Statements together." }
        ],
        correct: "B",
        explanation:
          "P = (female graduate)/50. Statement I: total females = 24, so female graduates ≤ 24 < 25, hence P < 1/2. Sufficient. Statement II: total graduates = 18, so female graduates ≤ 18 < 25, hence P < 1/2. Sufficient. Each alone sufficient.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q17",
        qNo: 17,
        text: "A question is followed by two statements I and II. Consider the following Question and statements:\n\nA specialty coffee roaster sells two types of coffee beans: Highland Arabica and Lowland Robusta. A customer purchases 6 pounds of Highland Arabica and 4 pounds of Lowland Robusta for a total cost of $132. The price per pound of each type of bean is fixed.\n\nQuestion: What is the differential price per unit of Highland Arabica and Lowland Robusta? (Note: The question likely asks for price of Arabica or difference? The solution says they determine price of Arabica.)\n\nStatement I: Another customer buys 9 pounds of Highland Arabica and 6 pounds of Lowland Robusta for $198.\nStatement II: A third customer buys 3 pounds of Highland Arabica and 3 pounds of Lowland Robusta for $81.\n\nWhich of the following is correct in reference to the question and statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "The Question can be answered by using one of the Statements alone, but cannot be answered using the other statement alone." },
          { id: "B", text: "The Question can be answered by using either Statement alone." },
          { id: "C", text: "The Question can be answered by using both the Statements together, but cannot be answered using either Statement alone." },
          { id: "D", text: "The Question cannot be answered even using both the Statements together." }
        ],
        correct: "A",
        explanation:
          "Let A = price of Arabica, R = price of Robusta. Given: 6A+4R=132. Statement I: 9A+6R=198 (1.5 times the given equation) => no new info, not sufficient. Statement II: 3A+3R=81 => A+R=27. Solving with 6A+4R=132 gives A=12, R=15. So Statement II alone sufficient. Thus one statement (II) sufficient, other (I) not.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q18",
        qNo: 18,
        text: "A question is followed by two statements I and II. Consider the following Question and statements:\n\nQuestion: What is the unique value of the integer 'x'?\n\nStatement I: x is a prime number such that x is greater than 10 and less than 40, and the sum of its digits is also a prime number.\nStatement II: (x - 1) is a multiple of 6, and (x + 2) is a multiple of 5.\n\nWhich of the following is correct in reference to the question and statements given above?",
        suffix: "",
        options: [
          { id: "A", text: "The question can be answered using Statement I alone, but not using Statement II alone." },
          { id: "B", text: "The question can be answered using either Statement alone." },
          { id: "C", text: "The question can be answered using both Statements together, but not using either Statement alone." },
          { id: "D", text: "The question cannot be answered even by using both Statements together." }
        ],
        correct: "D",
        explanation:
          "Statement I: primes between 10 and 40 with digit sum prime: 11 (sum2), 23 (sum5), 29 (sum11) – multiple values. Statement II: x ≡ 1 mod 6 and x ≡ 3 mod 5 (since x+2 divisible by5 => x ≡ 3 mod5). Solutions: 13,43,73,... infinite. Together: no common value from the sets (11,23,29 vs 13,43,...). Thus no solution, cannot answer.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q19",
        qNo: 19,
        text: "How many 5-digit numbers can be formed from the set of digits {0, 1, 2, 3, 4, 5, 6, 7} such that no digit is repeated, and the digits of the number are in strictly decreasing order?",
        suffix: "",
        options: [
          { id: "A", text: "56" },
          { id: "B", text: "66" },
          { id: "C", text: "24" },
          { id: "D", text: "84" }
        ],
        correct: "A",
        explanation:
          "For strictly decreasing digits, each selection of 5 distinct digits determines exactly one number (arranged in decreasing order). Choose any 5 digits from 8: 8C5 = 56. Since the largest digit is first, leading digit cannot be 0, but if 0 is selected it will be last, so all selections give valid 5-digit numbers.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Easy",
        pyqYear: null
      },
      {
        id: "t15_q20",
        qNo: 20,
        text: "If p, q, r and s are distinct single digit positive numbers, then what is the greatest value of (p + q)(r + s)?",
        suffix: "",
        options: [
          { id: "A", text: "230" },
          { id: "B", text: "225" },
          { id: "C", text: "224" },
          { id: "D", text: "221" }
        ],
        correct: "B",
        explanation:
          "To maximize the product, maximize both sums. The four largest distinct single-digit positive numbers are 6,7,8,9. Group them to get sums as equal as possible: (9+6)=15 and (8+7)=15, product 225. Other groupings give smaller product.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Easy",
        pyqYear: null
      },
      {
        id: "t15_q21",
        qNo: 21,
        text: "If x is a real number such that 0 < x < 1; then which of the following statements is/are correct?\n\nI: x - x^2 > x^2 - x^3\nII: x / (1 + x) < x^2 / (1 + x^2)\n\nSelect the correct answer using the code given below:",
        suffix: "",
        options: [
          { id: "A", text: "I only" },
          { id: "B", text: "II only" },
          { id: "C", text: "Both I and II" },
          { id: "D", text: "Neither I nor II" }
        ],
        correct: "A",
        explanation:
          "Statement I: x - x^2 > x^2 - x^3 => x(1-x)^2 > 0, true for 0<x<1. Statement II: cross multiply: x(1+x^2) < x^2(1+x) => x + x^3 < x^2 + x^3 => x < x^2, false for 0<x<1 (since x > x^2). So only I correct.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q22",
        qNo: 22,
        text: "Consider a set S of 15 distinct integers.\nValue-I: The minimum possible value of the average of the set S, given that the set consists of consecutive even integers whose sum is greater than -30.\nValue-II: The minimum possible value of the product of the set S, given that the set consists of consecutive integers and contains exactly seven negative integers.\n\nIn context of the above values, which one of the following is correct?",
        suffix: "",
        options: [
          { id: "A", text: "Value-I < Value-II" },
          { id: "B", text: "Value-II < Value-I" },
          { id: "C", text: "Value-I = Value-II" },
          { id: "D", text: "Relation between Value-I and Value-II is indeterminable due to insufficient data." }
        ],
        correct: "C",
        explanation:
          "Value-I: 15 consecutive even integers. Sum = 15×(middle). Given sum > -30 => middle > -2. Smallest even integer > -2 is 0, so average = 0. Value-II: 15 consecutive integers with exactly 7 negatives. Then sequence must be -7,-6,...,-1,0,1,...,7. Product includes 0, so product = 0. Thus both are 0.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q23",
        qNo: 23,
        text: "Consider a set S of 15 distinct integers.\nValue-I: The minimum possible value of the average of the set S, given that the set consists of consecutive even integers whose sum is greater than -30.\nValue-II: The minimum possible value of the product of the set S, given that the set consists of consecutive integers and contains exactly seven negative integers.\n\nIn context of the above values, which one of the following is correct?",
        suffix: "",
        options: [
          { id: "A", text: "Value-I < Value-II" },
          { id: "B", text: "Value-II < Value-I" },
          { id: "C", text: "Value-I = Value-II" },
          { id: "D", text: "Relation between Value-I and Value-II is indeterminable due to insufficient data." }
        ],
        correct: "C",
        explanation:
          "Value-I: 15 consecutive even integers. Sum = 15×(middle). Given sum > -30 => middle > -2. Smallest even integer > -2 is 0, so average = 0. Value-II: 15 consecutive integers with exactly 7 negatives. Then sequence must be -7,-6,...,-1,0,1,...,7. Product includes 0, so product = 0. Thus both are 0.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q24",
        qNo: 24,
        text: "Two ships start from the same port, one sailing due South-East and the other sailing due South-West, both travelling at constant speeds, the speed of the latter being 7 kmph greater than that of the former. If, after five hours, they are 65 km apart, then what is the sum of their speeds, in kmph?",
        suffix: "",
        options: [
          { id: "A", text: "13" },
          { id: "B", text: "15" },
          { id: "C", text: "17" },
          { id: "D", text: "19" }
        ],
        correct: "C",
        explanation:
          "South-East and South-West are perpendicular. Let speed of first = x, second = x+7. After 5 hours distances: 5x and 5(x+7). By Pythagoras: (5x)^2 + [5(x+7)]^2 = 65^2 => x^2 + (x+7)^2 = 169 => 2x^2+14x+49=169 => x^2+7x-60=0 => x=5 (positive). Sum = 5+12=17.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q25",
        qNo: 25,
        text: "The number of soldiers in a regiment is fewer than 1000. When they are arranged in rows of five, seven and nine soldiers each, there is exactly one left over soldier in each of these arrangements. However, when they are arranged in rows of 11 soldiers each, then there is no left over soldier. How many soldiers will be left over if they are arranged in rows of 13 each?",
        suffix: "",
        options: [
          { id: "A", text: "7" },
          { id: "B", text: "8" },
          { id: "C", text: "9" },
          { id: "D", text: "10" }
        ],
        correct: "D",
        explanation:
          "Number N ≡ 1 mod 5,7,9 => N-1 is multiple of LCM(5,7,9)=315. So N = 315k+1. Also N divisible by 11. Try k: k=1 ->316 (not div 11), k=2->631 (not), k=3->946 (div 11). So N=946. 946 mod 13 = 10 (since 13×72=936, remainder 10).",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q26",
        qNo: 26,
        text: "A three-digit number 'n' has at least one digit as 4 and at least one digit 5. In addition, every digit 5 in the number must appear in a place of higher positional value than every digit 4. How many such three-digit numbers are possible?",
        suffix: "",
        options: [
          { id: "A", text: "19" },
          { id: "B", text: "23" },
          { id: "C", text: "25" },
          { id: "D", text: "28" }
        ],
        correct: "C",
        explanation:
          "All 5s must be to the left of all 4s. Cases:\n- Pattern 5 4 _ : 8 choices for units (0-9 except 4,5) -> 8\n- Pattern 5 _ 4 : tens can be 8 choices (0-9 except 4,5) -> 8\n- Pattern _ 5 4 : hundreds can be 7 choices (1-9 except 4,5) -> 7\n- 5 5 4 : 1\n- 5 4 4 : 1\nTotal = 8+8+7+1+1 = 25.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q27",
        qNo: 27,
        text: "A dishonest trader mixes water with milk. He announces that he is selling milk at a discount of 10 percent on its cost price. However, by adding water to the milk, he still manages to earn an overall profit of 20 percent. What is the percentage of water in the final mixture? (Assume cost of water added = 0)",
        suffix: "",
        options: [
          { id: "A", text: "25%" },
          { id: "B", text: "30%" },
          { id: "C", text: "33.33%" },
          { id: "D", text: "15%" }
        ],
        correct: "A",
        explanation:
          "Let CP of 1L milk = 100. SP after 10% discount = 90. To earn 20% profit, CP of mixture = 90/1.2 = 75. So in 1L mixture, milk cost = 75, meaning milk quantity = 0.75L, water = 0.25L. % water = 25%.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q28",
        qNo: 28,
        text: "If the variable x lies between 5 and 12 (both inclusive) and the variable y lies between 3 and 9 (both inclusive), what is the ratio of the maximum possible value of (x + y) to that of minimum possible value of (x − y)?",
        suffix: "",
        options: [
          { id: "A", text: "-4.25" },
          { id: "B", text: "-5.5" },
          { id: "C", text: "-4.5" },
          { id: "D", text: "-5.25" }
        ],
        correct: "D",
        explanation:
          "Max (x+y): x=12, y=9 => 21. Min (x-y): x=5, y=9 => -4. Ratio = 21 / (-4) = -5.25.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Easy",
        pyqYear: null
      },
      {
        id: "t15_q29",
        qNo: 29,
        text: "A person invested a certain amount in the stock market. After one year, he sold all his holdings and, after accounting for brokerage, taxes, and other charges, realized an effective profit of 125 percent. He then reinvested the entire amount obtained into another investment, which yielded an effective annual return of 44 percent after all deductions. What was the average annual compounded rate of return (in percent) earned by him over the two-year period?",
        suffix: "",
        options: [
          { id: "A", text: "80%" },
          { id: "B", text: "90%" },
          { id: "C", text: "85%" },
          { id: "D", text: "75%" }
        ],
        correct: "A",
        explanation:
          "Let initial = 100. After year1: 100 × (1+1.25) = 225. After year2: 225 × 1.44 = 324. Overall growth factor = 3.24. Let CAGR = r: (1+r)^2 = 3.24 => 1+r = 1.8 => r=0.8 = 80%.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q30",
        qNo: 30,
        text: "In an examination, the maximum marks for each of the four papers namely P, Q, R and S are 100. Marks scored by the students are in integers. A student can score 99% in n different ways. What is the value of n?",
        suffix: "",
        options: [
          { id: "A", text: "16" },
          { id: "B", text: "17" },
          { id: "C", text: "23" },
          { id: "D", text: "35" }
        ],
        correct: "D",
        explanation:
          "99% of 400 = 396. Number of ways to get sum 396 with four integers ≤100.\nCase 1: 99,99,99,99 → 1 way\nCase 2: three 100s and one 96 → 4C3 = 4 ways\nCase 3: two 100s and two 98s → 4C2 = 6 ways\nCase 4: two 100s, one 97, one 99 → 4C2 × 2C1 = 12 ways\nCase 5: one 100, one 98, two 99s → 4C2 × 2C1 = 12 ways\nTotal = 1+4+6+12+12 = 35.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q31",
        qNo: 31,
        text: "Five distinct prime numbers p, q, r, s and t are all less than 25. They are arranged in increasing order such that p, q and r and r, s and t are in arithmetic progression. The common difference of the arithmetic progression in the second case is thrice that of the common difference of the first. What is the sum of (p+r+t)?",
        suffix: "",
        options: [
          { id: "A", text: "19" },
          { id: "B", text: "23" },
          { id: "C", text: "29" },
          { id: "D", text: "31" }
        ],
        correct: "C",
        explanation:
          "Primes less than 25: 3,5,7,11,13,17,19,23. Let p=3, q=5, r=7 (diff 2). Then r,s,t with diff 6: 7,13,19. Sum p+r+t = 3+7+19 = 29.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q32",
        qNo: 32,
        text: "Consider the first 500 natural numbers, that is, the set {1, 2, 3, … , 500}. How many numbers in this set are not divisible by any of the numbers 3, 4, 10, and 14?",
        suffix: "",
        options: [
          { id: "A", text: "224" },
          { id: "B", text: "258" },
          { id: "C", text: "318" },
          { id: "D", text: "272" }
        ],
        correct: "A",
        explanation:
          "Use inclusion-exclusion. Count divisible by 3,4,10,14. LCMs: 3,4,10,14. Let A=div by 3, B=4, C=10, D=14. Counts: floor(500/3)=166, /4=125, /10=50, /14=35. Pairs: lcm(3,4)=12 ->41; (3,10)=30->16; (3,14)=42->11; (4,10)=20->25; (4,14)=28->17; (10,14)=70->7. Triples: lcm(3,4,10)=60->8; (3,4,14)=84->5; (3,10,14)=210->2; (4,10,14)=140->3. Quad: lcm(3,4,10,14)=420->1. Total divisible = (166+125+50+35) - (41+16+11+25+17+7) + (8+5+2+3) - 1 = 376 - 117 + 18 -1 = 276. Not divisible = 500-276=224.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q33",
        qNo: 33,
        text: "A sum of money P is invested at a fixed annual rate of interest r% for n years. Consider the following statements about the interest earned:\nI. When interest is calculated using the Simple Interest method, the principal amount becomes double of the original amount in n years if and only if the product r × n equals 100.\nII. When interest is Compounded Annually, the interest earned during the second year is always greater than the interest earned during the first year by exactly r% of the first year's interest.\n\nWhich of the above statements is/are correct?",
        suffix: "",
        options: [
          { id: "A", text: "I only" },
          { id: "B", text: "II only" },
          { id: "C", text: "Both I and II" },
          { id: "D", text: "Neither I nor II" }
        ],
        correct: "C",
        explanation:
          "Statement I: SI amount = P(1+rn/100) = 2P => rn=100, correct. Statement II: CI: interest year1 = Pr/100; year2 = (P + Pr/100)*r/100 = Pr/100 + Pr^2/10000. Increase = Pr^2/10000 = r% of first year interest, correct. Both statements correct.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q34",
        qNo: 34,
        text: "On one side of a 1.01 km long road, 101 plants are planted at equal distance from each other. What is the total distance between 5 consecutive plants?",
        suffix: "",
        options: [
          { id: "A", text: "40 m" },
          { id: "B", text: "40.4 m" },
          { id: "C", text: "50 m" },
          { id: "D", text: "50.5 m" }
        ],
        correct: "B",
        explanation:
          "1.01 km = 1010 m. 101 plants create 100 gaps, each gap = 1010/100 = 10.1 m. Distance between 5 consecutive plants = 4 gaps = 4×10.1 = 40.4 m.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Easy",
        pyqYear: null
      },
      {
        id: "t15_q35",
        qNo: 35,
        text: "A bag contains 3 red balls, 4 blue balls, and 2 green balls. Three balls are drawn one after the other, without replacement. What is the probability that at least one of the drawn balls is Red?",
        suffix: "",
        options: [
          { id: "A", text: "16/21" },
          { id: "B", text: "13/21" },
          { id: "C", text: "17/21" },
          { id: "D", text: "19/21" }
        ],
        correct: "A",
        explanation:
          "Total balls = 9, non-red = 6. Probability of no red = (6/9)×(5/8)×(4/7) = 5/21. Thus at least one red = 1 - 5/21 = 16/21.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q36",
        qNo: 36,
        text: "A sum of money P is invested at a fixed annual rate of interest r% for n years. Consider the following statements about the interest earned:\nI. When interest is calculated using the Simple Interest method, the principal amount becomes double of the original amount in n years if and only if the product r × n equals 100.\nII. When interest is Compounded Annually, the interest earned during the second year is always greater than the interest earned during the first year by exactly r% of the first year's interest.\n\nWhich of the above statements is/are correct?",
        suffix: "",
        options: [
          { id: "A", text: "I only" },
          { id: "B", text: "II only" },
          { id: "C", text: "Both I and II" },
          { id: "D", text: "Neither I nor II" }
        ],
        correct: "C",
        explanation:
          "Statement I: SI amount = P(1+rn/100) = 2P => rn=100, correct. Statement II: CI: interest year1 = Pr/100; year2 = (P + Pr/100)*r/100 = Pr/100 + Pr^2/10000. Increase = Pr^2/10000 = r% of first year interest, correct. Both statements correct.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q37",
        qNo: 37,
        text: "Five positive integers m, n, o, p, and q are given such that exactly two of them are even and the remaining three are odd (not necessarily in any particular order).\n\nConsider the following statements:\nI. The sum of the squares, m^2 + n^2 + o^2 + p^2 + q^2, is always odd.\nII. The product (m+n)×(o+p)×q is always even.\nIII. The expression m + 2n + 3o + 4p + 5q is always even.\n\nWhich of the above statements is/are correct?",
        suffix: "",
        options: [
          { id: "A", text: "I only" },
          { id: "B", text: "I and II only" },
          { id: "C", text: "II and III only" },
          { id: "D", text: "I, II, and III" }
        ],
        correct: "A",
        explanation:
          "Exactly two even, three odd. Statement I: squares of evens are even (2 evens → even sum), squares of odds are odd (3 odds → odd sum). even+odd = odd → always odd. Correct.\nStatement II: depends on parity of q and sums; can be odd if q odd and both sums odd (possible). Not always even.\nStatement III: 2n and 4p are even, expression parity = m+3o+5q. This can be even or odd depending on arrangement. Not always even.\nSo only I correct.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q38",
        qNo: 38,
        text: "Find the unit digit of the expression: 3847^(22! + 3115)",
        suffix: "",
        options: [
          { id: "A", text: "1" },
          { id: "B", text: "3" },
          { id: "C", text: "7" },
          { id: "D", text: "9" }
        ],
        correct: "B",
        explanation:
          "Unit digit of base 3847 is 7. Need unit digit of 7^(22!+3115). Cycle of 7: 7,9,3,1 (length 4). 22! is divisible by 4. 3115 mod 4 = 3. So exponent mod 4 = 3. Third in cycle is 3.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Medium",
        pyqYear: null
      },
      {
        id: "t15_q39",
        qNo: 39,
        text: "Three individuals A, B, and C enter into a partnership business. A invests an amount x for 12 months, B invests an amount y for 8 months, and C invests an amount z for 6 months. The values x, y, z are distinct positive integers such that x < y < z. At the end of the year, the total profit is divided among A, B, and C in the ratio 2:2:3, respectively. Consider the following statements:\n\nI. The highest investment z is exactly twice the lowest investment x.\nII. The sum of the value of (x + y + z) is a multiple of 10.\n\nWhich of the above statements is/are incorrect?",
        suffix: "",
        options: [
          { id: "A", text: "I only" },
          { id: "B", text: "II only" },
          { id: "C", text: "Both I and II" },
          { id: "D", text: "Neither I nor II" }
        ],
        correct: "C",
        explanation:
          "Profit ratio = (12x):(8y):(6z) = 2:2:3 => 12x=2k, 8y=2k, 6z=3k => x=k/6, y=k/4, z=k/2. To be integers, k must be multiple of 12. Let k=12 => x=2, y=3, z=6. Then z=3x, not 2x → I incorrect. Sum x+y+z=11, not multiple of 10 → II incorrect. So both incorrect.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      },
      {
        id: "t15_q40",
        qNo: 40,
        text: "Three individuals A, B, and C enter into a partnership business. A invests an amount x for 12 months, B invests an amount y for 8 months, and C invests an amount z for 6 months. The values x, y, z are distinct positive integers such that x < y < z. At the end of the year, the total profit is divided among A, B, and C in the ratio 2:2:3, respectively. Consider the following statements:\n\nI. The highest investment z is exactly twice the lowest investment x.\nII. The sum of the value of (x + y + z) is a multiple of 10.\n\nWhich of the above statements is/are incorrect?",
        suffix: "",
        options: [
          { id: "A", text: "I only" },
          { id: "B", text: "II only" },
          { id: "C", text: "Both I and II" },
          { id: "D", text: "Neither I nor II" }
        ],
        correct: "C",
        explanation:
          "Profit ratio = (12x):(8y):(6z) = 2:2:3 => 12x=2k, 8y=2k, 6z=3k => x=k/6, y=k/4, z=k/2. To be integers, k must be multiple of 12. Let k=12 => x=2, y=3, z=6. Then z=3x, not 2x → I incorrect. Sum x+y+z=11, not multiple of 10 → II incorrect. So both incorrect.",
        topic: "Aptitude and Data Interpretation",
        difficulty: "Hard",
        pyqYear: null
      }
    ]
  }
];

export default TEST_T15;