import asyncio
import time


async def slow_task(name: str, delay_s: float) -> str:
    await asyncio.sleep(delay_s)
    return f"{name} done"


async def main() -> None:
    start = time.time()

    a, b = await asyncio.gather(
        slow_task("A", 0.6),
        slow_task("B", 0.9),
    )

    print(a)
    print(b)
    print(f"elapsed={int((time.time() - start) * 1000)}ms")


asyncio.run(main())

