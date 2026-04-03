/**
 * Regenerates src/lib/mock-data/training/*.ts from tools/training-seed.json.
 * Edit the JSON (or the emitted TS directly), then run: node tools/emit-training.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const dir = path.join(root, "src", "lib", "mock-data", "training");
const seed = JSON.parse(fs.readFileSync(path.join(root, "tools", "training-seed.json"), "utf8"));
fs.mkdirSync(dir, { recursive: true });

function emit(file, exportName, bundle) {
  const header = `import type { BoardTrainingBundle } from "../types";\n\n/**\n * TRAINING DATA — Board Member Training module.\n * Stored in mock data for demo; swap for API + per-user progress later.\n */\n`;
  const body = `export const ${exportName}: BoardTrainingBundle = ${JSON.stringify(bundle, null, 2)};\n`;
  fs.writeFileSync(path.join(dir, file), header + body, "utf8");
}

emit("community.ts", "communityBoardTraining", seed.community);
emit("growing.ts", "growingBoardTraining", seed.growing);
emit("privateSchool.ts", "privateSchoolBoardTraining", seed.privateSchool);
console.log("emitted training ts");
