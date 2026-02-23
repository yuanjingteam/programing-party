from pathlib import Path


def main() -> None:
    try:
        content = Path("missing.txt").read_text(encoding="utf-8")
        print(content)
    except FileNotFoundError as e:
        print("read failed:", type(e).__name__)


main()

