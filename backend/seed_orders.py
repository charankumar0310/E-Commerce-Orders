import random
from database import SessionLocal, engine
import models

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)

STATES = ["PENDING", "PACKED", "SHIPPED", "IN_TRANSIT", "DELIVERED"]
LOCATIONS = [
    "Amazon Fulfillment Center, BLR",
    "Regional Sortation Hub, HYD",
    "Last-Mile Delivery Station, MAA",
    "Local Carrier Facility",
    "Customer Address"
]

PRODUCTS = [
    "MacBook Pro 16", "Sony WH-1000XM5", "Samsung Galaxy S23",
    "Kindle Paperwhite", "AirPods Pro", "Logitech MX Master 3",
    "Dell UltraSharp 27", "iPad Air", "Nintendo Switch",
    "PlayStation 5", "Xbox Series X", "GoPro HERO 11",
    "Dyson V15", "Apple Watch Series 8", "Bose QuietComfort 45"
]

def seed_data():
    db = SessionLocal()
    
    # We want to add 25 random orders
    new_orders = []
    for i in range(25):
        random_id = random.randint(100000, 999999)
        status_idx = random.randint(0, len(STATES) - 1)
        current_status = STATES[status_idx]
        is_bottleneck = current_status in ["SHIPPED", "IN_TRANSIT"] and random.random() < 0.25
        
        order = models.Order(
            amazon_tracking_id=f"AMZN-{random_id}",
            customer_name=f"Customer {random_id}",
            product_name=random.choice(PRODUCTS),
            category="Electronics",
            amount=round(random.uniform(50.0, 2000.0), 2),
            current_status=current_status,
            bottleneck_flag=is_bottleneck
        )
        new_orders.append(order)
    
    db.add_all(new_orders)
    db.commit()
    
    # Add logs for each new order based on its status
    for order in new_orders:
        status_idx = STATES.index(order.current_status)
        # Create a log for every state up to the current one
        for i in range(status_idx + 1):
            state = STATES[i]
            loc = "Carrier Hub Delay" if (state == order.current_status and order.bottleneck_flag) else LOCATIONS[min(i, len(LOCATIONS) - 1)]
            
            log = models.LogisticsLog(
                order_id=order.id,
                milestone_status=state if not (state == order.current_status and order.bottleneck_flag) else f"{state} (DELAYED)",
                location_node=loc,
                process_time_seconds=random.randint(60, 3600)
            )
            db.add(log)
            
    db.commit()
    print(f"Successfully seeded {len(new_orders)} new orders with varying statuses.")
    db.close()

if __name__ == "__main__":
    seed_data()
