# q2_version.py
import sys

def check_version() -> str:
    return sys.version

if __name__ == "__main__":
    print(f"Python Version: {check_version()}")