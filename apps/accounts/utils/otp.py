import pyotp
import qrcode
from io import BytesIO
import base64

def generate_otp_secret():
    return pyotp.random_base32()

def get_otp_uri(secret, email):
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name="RemoteTeamManager")

def generate_qr_code(secret, email):
    uri = get_otp_uri(secret, email)
    qr = qrcode.make(uri)
    buffered = BytesIO()
    qr.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"

def verify_otp(secret, token):
    totp = pyotp.TOTP(secret)
    return totp.verify(token)
