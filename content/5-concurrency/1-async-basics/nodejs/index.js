function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowTask(name, delayMs) {
  await sleep(delayMs);
  return `${name} done`;
}

async function main() {
  const start = Date.now();

  const [a, b] = await Promise.all([slowTask("A", 600), slowTask("B", 900)]);

  console.log(a);
  console.log(b);
  console.log(`elapsed=${Date.now() - start}ms`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
