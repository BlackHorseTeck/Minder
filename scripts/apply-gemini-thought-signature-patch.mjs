import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const targetFiles = [
  "node_modules/@inngest/agent-kit/dist/chunk-BSWKEFTT.js",
  "node_modules/@inngest/agent-kit/dist/index.cjs",
];

const parserStart = `      } else if (candidate.content.role === "model" && "functionCall" in content) {
        messages.push({`;
const parserStartPatched = `      } else if (candidate.content.role === "model" && "functionCall" in content) {
        const thoughtSignature = content.thoughtSignature ?? content.thought_signature;
        messages.push({`;

const toolId = `              id: content.functionCall.name
            }`;
const toolIdPatched = `              id: content.functionCall.name,
              ...(thoughtSignature != null && { thought_signature: thoughtSignature })
            }`;

const functionCallPart = `              {
                functionCall: {
                  name: m.tools[0].name,
                  args: m.tools[0].input
                }
              }`;
const functionCallPartPatched = `              {
                functionCall: {
                  name: m.tools[0].name,
                  args: m.tools[0].input
                },
                ...(m.tools[0].thought_signature != null
                  ? { thoughtSignature: m.tools[0].thought_signature }
                  : { thoughtSignature: "skip_thought_signature_validator" })
              }`;

const replaceRequired = (source, before, after, expectedCount, label) => {
  const count = source.split(before).length - 1;
  if (count !== expectedCount) {
    throw new Error(`Expected ${expectedCount} ${label} occurrence(s), found ${count}.`);
  }
  return source.replaceAll(before, after);
};

for (const relativePath of targetFiles) {
  const filePath = resolve(process.cwd(), relativePath);
  if (!existsSync(filePath)) {
    console.log(`Skipping AgentKit patch; ${relativePath} is not installed.`);
    continue;
  }

  let source = readFileSync(filePath, "utf8");
  const alreadyPatched = source.includes("skip_thought_signature_validator") &&
    source.includes("const thoughtSignature = content.thoughtSignature ?? content.thought_signature;");

  if (alreadyPatched) {
    console.log(`Gemini thought-signature patch already applied: ${relativePath}`);
    continue;
  }

  source = replaceRequired(source, parserStart, parserStartPatched, 1, "response-parser start");
  source = replaceRequired(source, toolId, toolIdPatched, 1, "tool-call identifier");
  source = replaceRequired(source, functionCallPart, functionCallPartPatched, 2, "function-call request part");
  writeFileSync(filePath, source);
  console.log(`Applied Gemini thought-signature patch: ${relativePath}`);
}
