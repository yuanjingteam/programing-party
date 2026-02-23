import asyncio


async def slow_task() -> str:
    await asyncio.sleep(3)
    return "finished"


async def main() -> None:
    try:
        result = await asyncio.wait_for(slow_task(), timeout=1.0)
        print(result)
    except asyncio.TimeoutError:
        print("timeout: TimeoutError")


asyncio.run(main())

