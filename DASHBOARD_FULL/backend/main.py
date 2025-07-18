from fastapi import FastAPI, Query
from scheduler_jobs import start_scheduler
from section7_events import extract_events as extract_events_core, EventExtractionResponse
from section4 import extract_review_volume as extract_review_core, ReviewVolumeResponse
from occupancy_forecast_api import forecast_total_bookings as forecast_core, BookingInput  
from section6 import section6, ActualInput
from section7_compsetPrices import section7_compsetPrices,CompetitiveRateResponse
from section7 import section7
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

@app.get("/extract_events", response_model=EventExtractionResponse)
def extract_events(location: str = Query(...)):
    return extract_events_core(location)

@app.get("/extract_review_volume", response_model=ReviewVolumeResponse)
def extract_review_volume(hotel_name: str = Query(...), location: str = Query(...)):
    return extract_review_core(hotel_name=hotel_name, location=location)

@app.post("/forecast_total_bookings")
def forecast_total_bookings(input_data: BookingInput):  
    return forecast_core(input_data)


@app.get("/competitiveRateSnapshot", response_model=CompetitiveRateResponse)
def compset_prices_api(
    hotel_name: str = Query(...),
    hotel_location: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
    my_hotel_prices: str = Query(...)
):
    return section7_compsetPrices(
        hotel_name=hotel_name,
        hotel_location=hotel_location,
        start_date=start_date,
        end_date=end_date,
        my_hotel_prices=my_hotel_prices
    )

@app.on_event("startup")
def startup_event():
    start_scheduler()

app.add_api_route("/section6", section6, methods=["POST"], response_model=dict)    # full response for section 6
app.add_api_route("/section7", section7, methods=["GET"], response_model=dict)      # full response for section 7
