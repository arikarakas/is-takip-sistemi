from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    """Düz metin şifreyi alır ve hash'lenmiş güvenli halini döner."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str):
    """
    Kullanıcının girdiği şifre ile veri tabanındaki 
    hash'lenmiş şifrenin eşleşip eşleşmediğini kontrol eder.
    """
    return pwd_context.verify(plain_password, hashed_password)