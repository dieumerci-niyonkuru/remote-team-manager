import json, sys
import requests

url = 'http://127.0.0.1:8000/api/auth/login/'
payload = {'username': 'login@test.com', 'password': 'Test1234x'}
headers = {'Content-Type': 'application/json'}
try:
    resp = requests.post(url, data=json.dumps(payload), headers=headers)
    print('Status code:', resp.status_code)
    try:
        print('Response JSON:', resp.json())
    except Exception:
        print('Response text:', resp.text)
except Exception as e:
    print('Error:', e)
    sys.exit(1)
