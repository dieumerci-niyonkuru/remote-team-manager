import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.accounts.models import User

try:
    user = User.objects.create_user(
        username='test_script@test.com', 
        email='test_script@test.com', 
        password='TestPassword123!'
    )
    print(f"User created: {user.username}")
    user.delete()
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
