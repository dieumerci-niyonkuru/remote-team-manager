import requests, json
url = 'http://127.0.0.1:8000/api/auth/login/'
payload = {'username': 'login@test.com', 'password': 'Test1234x'}
resp = requests.post(url, json=payload)
print('Status:', resp.status_code)
print('Response:', resp.text)
