from decimal import Decimal

from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import Wallet


def is_wallet_exist(db: Session, wallet_name: str) -> bool:
    # Проверяем существует ли кошелек в DB
        return db.query(Wallet).filter(Wallet.name == wallet_name).first() is not None

def add_income(db: Session, wallet_name: str, amount: Decimal) -> Wallet:
    # Добавляем доход к балансу кошелька
        wallet = db.query(Wallet).filter(Wallet.name == wallet_name).first()
        wallet.balance += amount
        return wallet


def get_wallet_balance_by_name(db: Session, wallet_name: str) -> Wallet:
    # Поиск кошелька по имени
        wallet = db.query(Wallet).filter(Wallet.name == wallet_name).first()
        return wallet

def add_expense(db: Session, wallet_name: str, amount: Decimal) -> Wallet:
    # Вычитаем расход из баланса кошелька
        wallet = db.query(Wallet).filter(Wallet.name == wallet_name).first()
        wallet.balance -= amount
        return wallet

def get_all_wallets(db: Session, ) -> list[Wallet]:
    # Получение всех кошельков
        return db.query(Wallet).all()


def create_wallet(db: Session, wallet_name: str, amount: Decimal) -> Wallet:
        wallet = Wallet(name=wallet_name, balance=amount)
        db.add(wallet)
        db.flush()
        return wallet