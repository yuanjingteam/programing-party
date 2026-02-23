import time


attempts = 0


def unstable_operation() -> str:
    global attempts
    attempts += 1
    if attempts < 3:
        raise RuntimeError("temporary failure")
    return "ok"


def main() -> None:
    max_attempts = 5
    backoff_s = 0.2

    for i in range(1, max_attempts + 1):
        try:
            result = unstable_operation()
            print("success:", result)
            return
        except RuntimeError as e:
            print(f"attempt {i} failed: {e}")
            if i == max_attempts:
                print("giving up")
                return
            time.sleep(backoff_s)
            backoff_s *= 2


main()

