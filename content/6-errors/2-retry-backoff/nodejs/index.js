function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let attempts = 0;

async function unstableOperation() {
  attempts += 1;
  if (attempts < 3) {
    throw new Error("temporary failure");
  }
  return "ok";
}

async function main() {
  const maxAttempts = 5;
  let backoffMs = 200;

  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      const result = await unstableOperation();
      console.log("success:", result);
      return;
    } catch (err) {
      console.log(`attempt ${i} failed:`, err.message);
      if (i === maxAttempts) {
        console.log("giving up");
        return;
      }
      await sleep(backoffMs);
      backoffMs *= 2;
    }
  }
}

main();
