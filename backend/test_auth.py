import requests
import json

def test_signup():
    url = "http://127.0.0.1:8000/auth/signup"
    payload = {
        "username": "testuser123_new",
        "password": "password123",
        "role": "student"
    }
    try:
        response = requests.post(url, json=payload)
        print("Signup Response Status:", response.status_code)
        print("Signup Response Text:", response.text)
    except Exception as e:
        print("Error during signup:", e)

def test_login():
    url = "http://127.0.0.1:8000/auth/login"
    payload = {
        "username": "testuser123_new",
        "password": "password123"
    }
    try:
        response = requests.post(url, json=payload)
        print("Login Response Status:", response.status_code)
        print("Login Response Text:", response.text)
    except Exception as e:
        print("Error during login:", e)

if __name__ == "__main__":
    test_signup()
    test_login()
