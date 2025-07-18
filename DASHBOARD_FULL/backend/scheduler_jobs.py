import requests
from apscheduler.schedulers.background import BackgroundScheduler

BASE_URL = "http://localhost:8000"

def fetch_events():
    location = "Stony Brook, NY"
    try:
        response = requests.get(f"{BASE_URL}/extract_events", params={"location": location})
        response.raise_for_status()
        print("Events fetched successfully.")
    except Exception as e:
        print("Failed to fetch events:", e)

def fetch_review_volume():
    params = {
        "hotel_name": "Hilton Garden Inn",
        "location": "Stony Brook, NY",
        "days": 30  
    }
    try:
        response = requests.get(f"{BASE_URL}/extract_review_volume", params=params)
        response.raise_for_status()
        print("Review volume fetched successfully.")
    except Exception as e:
        print("Failed to fetch review volume:", e)


def fetch_forecast():
    payload = {
        "hotel_name": "Hilton Garden Inn",
        "hotel_location": "Stony Brook, NY",
        "start_date": "2025-07-18",
        "end_date": "2025-07-24",
        "confirmed_bookings": [
            {"date": "2025-07-18", "booked_rooms": 20},
            {"date": "2025-07-19", "booked_rooms": 25},
            {"date": "2025-07-20", "booked_rooms": 18},
            {"date": "2025-07-21", "booked_rooms": 24},
            {"date": "2025-07-22", "booked_rooms": 22},
            {"date": "2025-07-23", "booked_rooms": 20},
            {"date": "2025-07-24", "booked_rooms": 18}

        ],
        "room_count": 40,
        "my_hotel_prices": [
            {"date": "2025-07-18", "price": 180},
            {"date": "2025-07-19", "price": 200},
            {"date": "2025-07-20", "price": 190},
            {"date": "2025-07-21", "price": 200},
            {"date": "2025-07-22", "price": 190},
            {"date": "2025-07-23", "price": 200},
            {"date": "2025-07-24", "price": 210}
        ]
    }

    try:
        response = requests.post(f"{BASE_URL}/forecast_total_bookings", json=payload)
        response.raise_for_status()
        print("Forecast fetched successfully.")
    except Exception as e:
        print("Failed to fetch forecast:", e)

def fetch_compset_snapshot():
    params = {
        "hotel_name": "Hilton Garden Inn",
        "hotel_location": "Stony Brook",
        "start_date": "2025-07-17",
        "end_date": "2025-07-24",
        "my_hotel_prices": "[160, 180, 200, 190, 200, 190, 200, 210]"
    }
    try:
        response = requests.get("http://localhost:8000/competitiveRateSnapshot", params=params)
        response.raise_for_status()
        data = response.json()
        print("Competitive Rate Snapshot:", data)
    except Exception as e:
        print("Error fetching compset snapshot:", e)


scheduler = BackgroundScheduler()

# scheduler.add_job(fetch_events, 'interval', days=7)
# scheduler.add_job(fetch_review_volume, 'interval',days=7)  
# scheduler.add_job(fetch_forecast, 'interval', days=7)
scheduler.add_job(fetch_compset_snapshot, 'interval', minutes=100)

def start_scheduler():
    scheduler.start()
    print("[*] Scheduler started: fetch_events, fetch_review_volume, fetch_forecast all scheduled daily.")
