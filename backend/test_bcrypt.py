import sys
import traceback

def test_hash():
    try:
        from utils.security import get_password_hash
        print(get_password_hash("password123"))
    except Exception as e:
        traceback.print_exc()

if __name__ == "__main__":
    test_hash()
