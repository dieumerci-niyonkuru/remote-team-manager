import urllib.request
import json

data = json.dumps({
    "email": "test5@test.com",
    "password": "TestPassword123!",
    "password2": "TestPassword123!",
    "first_name": "T",
    "last_name": "T"
}).encode('utf-8')

req = urllib.request.Request("https://remote-team-manager-production.up.railway.app/api/auth/register/", data=data, headers={'Content-Type': 'application/json'})

try:
    response = urllib.request.urlopen(req)
    print(response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.code)
    print(e.read().decode('utf-8'))
