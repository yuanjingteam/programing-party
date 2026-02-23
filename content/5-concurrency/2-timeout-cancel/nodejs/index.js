function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowTask() {
  await sleep(3000);
  return "finished";
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), timeoutMs),
    ),
  ]);
}

async function main() {
  try {
    const result = await withTimeout(slowTask(), 1000);
    console.log(result);
  } catch (err) {
    console.log("timeout:", err.message);
  }
}

main();
