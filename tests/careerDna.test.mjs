import assert from "node:assert/strict";
import {
  archetypes,
  getArchetypeForDimensions,
  getTopDimensions,
} from "../src/app/careerDna.js";

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

console.log("careerDna tests passed");
