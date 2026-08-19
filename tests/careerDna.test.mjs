import assert from "node:assert/strict";
import {
  archetypes,
  calculateCareerDna,
  calibrationQuestions,
  getArchetypeForDimensions,
  getTopDimensions,
} from "../src/app/lib/careerDna.js";

assert.equal(archetypes.length, 12, "Career DNA should expose 12 archetypes");

assert.equal(
  getArchetypeForDimensions("Technical", "Execution").name,
  "Forge Beaver",
);

assert.equal(
  getArchetypeForDimensions("Execution", "Technical").name,
  "Forge Beaver",
  "dimension order should not matter",
);

assert.equal(
  getArchetypeForDimensions("Leadership", "Innovation").name,
  "Prism Peacock",
);

assert.deepEqual(
  getTopDimensions({
    Technical: 88,
    Execution: 92,
    Communication: 76,
    Strategic: 60,
    Innovation: 52,
    Leadership: 64,
  }),
  ["Execution", "Technical"],
);

const builderAnswers = Object.fromEntries(
  calibrationQuestions.map((q) => [q.id, q.options[0]]),
);
const builderResult = calculateCareerDna(builderAnswers);

assert.equal(builderResult.archetype.name, "Forge Beaver");
assert.ok(
  builderResult.scores.Execution > builderResult.scores.Innovation,
  "builder answers should lean toward execution over exploration",
);
assert.ok(
  builderResult.scores.Technical > builderResult.scores.Communication,
  "builder answers should lean toward technical work over communication",
);
assert.ok(
  builderResult.axisRows.every((axis) => axis.leftPercent + axis.rightPercent === 100),
  "each preference axis should total 100%",
);
assert.ok(builderResult.confidence > 90, "clear complete answers should produce high confidence");

const optionColumnAnimals = new Set(
  [0, 1, 2, 3].map((index) => {
    const answers = Object.fromEntries(
      calibrationQuestions.map((q) => [q.id, q.options[index]]),
    );
    return calculateCareerDna(answers).archetype.name;
  }),
);

assert.ok(
  optionColumnAnimals.size >= 3,
  "straight-line answer patterns should not collapse into one repeated animal",
);

const allPossibleAnimals = new Set();
function visitAnswerCombinations(index, answers) {
  if (index === calibrationQuestions.length) {
    allPossibleAnimals.add(calculateCareerDna(answers).archetype.name);
    return;
  }
  const question = calibrationQuestions[index];
  question.options.forEach((option) => {
    visitAnswerCombinations(index + 1, { ...answers, [question.id]: option });
  });
}
visitAnswerCombinations(0, {});

assert.equal(
  allPossibleAnimals.size,
  archetypes.length,
  "the calibration model should make every Career DNA animal reachable",
);

console.log("careerDna tests passed");
