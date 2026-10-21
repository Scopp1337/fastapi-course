from decimal import Decimal

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Wallet, User


def is_wallet_exist(db: Session, user_id: int, wallet_name: str) -> bool:
    # Проверяем существует ли кошелек в DB
        return db.query(Wallet).filter(Wallet.name == wallet_name, Wallet.user_id == user_id).first() is not None

def add_income(db: Session, user_id: int, wallet_name: str, amount: Decimal) -> Wallet:
    # Добавляем доход к балансу кошелька
        wallet = db.query(Wallet).filter(Wallet.name == wallet_name, Wallet.user_id == user_id).first()
        wallet.balance += amount
        return wallet


def get_wallet_balance_by_name(db: Session, user_id: int, wallet_name: str) -> Wallet:
    # Поиск кошелька по имени
        wallet = db.query(Wallet).filter(Wallet.name == wallet_name, Wallet.user_id == user_id).first()
        return wallet

def add_expense(db: Session, user_id: int, wallet_name: str, amount: Decimal) -> Wallet:
    # Вычитаем расход из баланса кошелька
        wallet = db.query(Wallet).filter(Wallet.name == wallet_name, Wallet.user_id == user_id).first()
        wallet.balance -= amount
        return wallet

def get_all_wallets(db: Session, user_id: int) -> list[Wallet]:
    # Получение всех кошельков
        return db.query(Wallet).filter(Wallet.user_id == user_id).all()


def create_wallet(db: Session, user_id: int, wallet_name: str, amount: Decimal) -> Wallet:
        wallet = Wallet(name=wallet_name, balance=amount, user_id=user_id)
        db.add(wallet)
        db.flush()
        return wallet