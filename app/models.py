from decimal import Decimal
from datetime import datetime

from sqlalchemy import ForeignKey, Enum as SQLEnum, func, Numeric
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base
from app.enums import CurrencyEnum, OperationType


class User(Base):
    __tablename__ = "user"

    id: Mapped[int] = mapped_column(primary_key=True)
    login: Mapped[str] = mapped_column(unique=True)


class Wallet(Base):
    __tablename__ = "wallet"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=Decimal("0"))
    user_id: Mapped[int] = mapped_column(ForeignKey("user.id"), nullable=False)
    currency: Mapped[CurrencyEnum] = mapped_column(SQLEnum(CurrencyEnum))


class Operation(Base):
    __tablename__ = "operation"

    id: Mapped[int] = mapped_column(primary_key=True)
    wallet_id: Mapped[int] = mapped_column(ForeignKey("wallet.id"))
    type: Mapped[OperationType] = mapped_column(SQLEnum(OperationType))
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    currency: Mapped[CurrencyEnum] = mapped_column(SQLEnum(CurrencyEnum))
    category: Mapped[str | None] = mapped_column(default=None)
    subcategory: Mapped[str | None] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())