import { readFile } from "node:fs/promises";

async function main() {
  try {
    const content = await readFile("missing.txt", "utf8");
    console.log(content);
  } catch (err) {
    console.log("read failed:", err.code ?? err.name);
    console.log("message:", err.message);
  }
}

main();
