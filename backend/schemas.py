from pydantic import BaseModel
from typing import List, Optional
import datetime

class LogisticsLogBase(BaseModel):
    milestone_status: str
    location_node: str
    process_time_seconds: int

class LogisticsLogCreate(LogisticsLogBase):
    pass

class LogisticsLog(LogisticsLogBase):
    id: int
    order_id: int
    timestamp: datetime.datetime

    class Config:
        orm_mode = True

class OrderBase(BaseModel):
    amazon_tracking_id: str
    customer_name: str
    product_name: str
    category: str
    amount: float
    current_status: str
    bottleneck_flag: bool

class OrderCreate(OrderBase):
    pass

class Order(OrderBase):
    id: int
    created_at: datetime.datetime
    logs: List[LogisticsLog] = []

    class Config:
        orm_mode = True
