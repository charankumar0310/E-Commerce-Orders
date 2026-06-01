import random
import time
import asyncio
from typing import List
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from apscheduler.schedulers.asyncio import AsyncIOScheduler

import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="E Commerce and Logistics API")

# Bypass CORS restrictions globally
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Lifecycle states
STATES = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "DELIVERED"]
LOCATIONS = [
    "Amazon Fulfillment Center, BLR",
    "Regional Sortation Hub, HYD",
    "Last-Mile Delivery Station, MAA",
    "Local Carrier Facility",
    "Customer Address"
]

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

def background_logistics_job():
    # Because this is run in a separate thread by APScheduler (unless it's an async job), 
    # we need to create an event loop if we want to run async code inside a synchronous function.
    # The cleaner approach for FastAPI + AsyncIOScheduler is to make the job async.
    pass

async def background_logistics_job():
    db = database.SessionLocal()
    try:
        # 1. Randomly decide to add a new order (20% chance)
        if random.random() < 0.2:
            new_id = random.randint(100000, 999999)
            new_order = models.Order(
                amazon_tracking_id=f"AMZN-{new_id}",
                customer_name=f"Customer {new_id}",
                product_name=random.choice(["Wireless Mouse", "Mechanical Keyboard", "Monitor 27-inch", "USB-C Cable", "Bluetooth Speaker"]),
                category="Electronics",
                amount=round(random.uniform(10.0, 500.0), 2),
                current_status="PENDING",
            )
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            
            log = models.LogisticsLog(
                order_id=new_order.id,
                milestone_status="PENDING",
                location_node=LOCATIONS[0],
                process_time_seconds=random.randint(10, 60)
            )
            db.add(log)
            db.commit()
            
            await manager.broadcast("UPDATE_AVAILABLE")
        
        # 2. Advance 1 to 3 random non-DELIVERED orders
        active_orders = db.query(models.Order).filter(models.Order.current_status != "DELIVERED").all()
        if active_orders:
            num_to_update = min(len(active_orders), random.randint(1, 3))
            orders_to_update = random.sample(active_orders, num_to_update)
            
            updated_any = False
            for order in orders_to_update:
                current_idx = STATES.index(order.current_status)
                next_status = STATES[current_idx + 1]
                
                order.current_status = next_status
                
                if next_status in ["SHIPPED", "IN_TRANSIT"] and random.random() < 0.25:
                    order.bottleneck_flag = True
                    location = "Carrier Hub Delay"
                else:
                    order.bottleneck_flag = False
                    location = LOCATIONS[min(current_idx + 1, len(LOCATIONS) - 1)]

                log = models.LogisticsLog(
                    order_id=order.id,
                    milestone_status=next_status if not order.bottleneck_flag else f"{next_status} (DELAYED)",
                    location_node=location,
                    process_time_seconds=random.randint(600, 7200)
                )
                db.add(log)
                updated_any = True
                
            if updated_any:
                db.commit()
                await manager.broadcast("UPDATE_AVAILABLE")
                
    finally:
        db.close()


@app.on_event("startup")
def startup_event():
    db = database.SessionLocal()
    # Seed the database if empty
    if db.query(models.Order).count() == 0:
        orders = [
            models.Order(
                amazon_tracking_id="AMZN-100001",
                customer_name="Alice Smith",
                product_name="MacBook Pro 16",
                category="Electronics",
                amount=2499.99,
                current_status="PENDING",
            ),
            models.Order(
                amazon_tracking_id="AMZN-100002",
                customer_name="Bob Johnson",
                product_name="Sony WH-1000XM5",
                category="Electronics",
                amount=398.00,
                current_status="PACKED",
            ),
            models.Order(
                amazon_tracking_id="AMZN-100003",
                customer_name="Charlie Brown",
                product_name="Samsung Galaxy S23",
                category="Electronics",
                amount=899.99,
                current_status="SHIPPED",
                bottleneck_flag=True
            ),
        ]
        db.add_all(orders)
        db.commit()
        
        # Initial logs
        for order in orders:
            log = models.LogisticsLog(
                order_id=order.id,
                milestone_status=order.current_status,
                location_node=LOCATIONS[0],
                process_time_seconds=random.randint(60, 3600)
            )
            db.add(log)
        db.commit()
    db.close()

    # Start the scheduler
    scheduler = AsyncIOScheduler()
    scheduler.add_job(background_logistics_job, 'interval', seconds=60)
    scheduler.start()

@app.websocket("/ws/logistics")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/orders", response_model=list[schemas.Order])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models.Order).order_by(models.Order.id.desc()).offset(skip).limit(limit).all()
    return orders

# Keeping this endpoint just in case it's manually triggered or used for forced resets, but it's optional now
@app.post("/api/admin/optimize-routes")
async def optimize_routes(db: Session = Depends(get_db)):
    bottlenecked_orders = db.query(models.Order).filter(models.Order.bottleneck_flag == True).all()
    count = 0
    for order in bottlenecked_orders:
        order.bottleneck_flag = False
        log = models.LogisticsLog(
            order_id=order.id,
            milestone_status=order.current_status,
            location_node="Route Optimized: Diverted to Secondary Logistics Node",
            process_time_seconds=random.randint(10, 60)
        )
        db.add(log)
        count += 1
    
    db.commit()
    await manager.broadcast("UPDATE_AVAILABLE")
    return {"message": f"Successfully optimized {count} routes."}
