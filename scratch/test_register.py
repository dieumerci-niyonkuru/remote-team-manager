import requests, json
url = 'http://127.0.0.1:8000/api/auth/register/'
payload = {
    'email': 'test@example.com',
    'password': 'Secret123!',
    'password2': 'Secret123!',
    'first_name': 'Test',
    'last_name': 'User',
    'role': 'member'
}
resp = requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Response:', resp.text)
