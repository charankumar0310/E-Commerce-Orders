from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    amazon_tracking_id = Column(String, unique=True, index=True)
    customer_name = Column(String)
    product_name = Column(String)
    category = Column(String)
    amount = Column(Float)
    current_status = Column(String)
    bottleneck_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    logs = relationship("LogisticsLog", back_populates="order")


class LogisticsLog(Base):
    __tablename__ = "logistics_logs"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    milestone_status = Column(String)
    location_node = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    process_time_seconds = Column(Integer)

    order = relationship("Order", back_populates="logs")
