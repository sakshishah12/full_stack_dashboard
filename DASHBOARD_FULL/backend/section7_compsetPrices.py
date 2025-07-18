
from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import json 
import re
import statistics
import datetime as dt
import os

from generic import (
    search_top_links,
    scrape_websites,
    refine_with_expert_reviewer_loop,
    expert_llm,
    reviewer_llm
)

app = FastAPI(title="Hotel Pricing Extractor API", description="Extracts competitor hotel pricing and KPI values.")

class FutureRateComparison(BaseModel):
    labels: List[str]
    yourHotelRates: List[float]
    compSetMedianRates: List[float]

class CompetitiveRateSnapshot(BaseModel):
    leadRateTonight: float
    compSetMedianTonight: float
    compSetRateRange: str
    rateRankTonight: str
    futureRateIndex: int
    futureRateChange: str
    futureRateComparison: FutureRateComparison
    rateParityStatus: str = "Unknown"
    parityDetails: str = "N/A"
    competitorRateChanges: dict = {
        "increased": 0,
        "decreased": 0,
        "avgIncrease": "$0",
        "avgDecrease": "$0"
    }

class CompetitiveRateResponse(BaseModel):
    hotel_name: str
    location: str
    date_range: str
    competitiveRateSnapshot: CompetitiveRateSnapshot
    localEvents: List[dict] = []
    eventLogLoadError: str = ""

# The core function to extract hotel pricing and compute KPIs
def extract_kpi_values(hotel_name: str, hotel_location: str, start_date: str, end_date: str, my_hotel_prices: List[float]):
    # Parse and format the dates
    try:
        start = datetime.strptime(start_date, "%Y-%m-%d").strftime("%B %d, %Y")
        end = datetime.strptime(end_date, "%Y-%m-%d").strftime("%B %d, %Y")
        date_range = f"{start} - {end}"
    except ValueError:
        return {"error": "Invalid date format. Use YYYY-MM-DD."}

    # Search query and raw data extraction
    search_query = f"""Find top websites or sources that provide up-to-date hotel information in area "{hotel_location}"."""
    urls = search_top_links(search_query)
    raw_texts = scrape_websites(urls)
    combined_text = "\n\n".join(raw_texts)
    print(urls)
    print(raw_texts)
    output_text, _ = refine_with_expert_reviewer_loop(
        raw_text=combined_text,
        expert_llm=expert_llm,
        reviewer_llm=reviewer_llm,
        expert_prompt_template=f"""
        You are a hotel pricing expert with access to raw scraped data.

        Your task:
        - Identify up to 5 legitimate competitor hotels within **10 miles** of "{hotel_name}" in "{hotel_location}".
        - For each competitor, return a **different nightly rate** (if available) for **each date** from {start_date} to {end_date}.
        - Focus on real competitors in the same category (e.g., luxury, mid-scale, boutique).
        - Exclude hostels, dorms, or motels unless they are directly comparable.
        - For each competitor, provide pricing details for **each night** within this date range: {date_range}.
        - For each competitor, provide estimate average occupancy % for the previous seven days before {start_date}.

        Return this JSON structure:
        - "hotel_name": string
        - "hotel_location": string
        - "occupancy_percent": 45%
        - "pricing_info": list of objects with:
        - "date_": string (YYYY-MM-DD)
        - "price": float

        Only return valid JSON. Do not include any explanation.
        Text to analyze:
        {{raw_text}}
        """,
        reviewer_prompt_template=f"""
        You are a hotel pricing reviewer.

        Instructions:
        - Review the following JSON hotel list:
        {{extracted_output}}

        Validation checklist:
        - Each hotel must be within **10 miles** of "{hotel_name}" in "{hotel_location}"
        - Each object must include "hotel_name", "hotel_location","occupamcy_percent" and "pricing_info"
        - "pricing_info" must be a list of "date_": ..., "price": ... objects, one for each night in the range: {date_range}
        - Ensure prices are realistic and appropriate for hotel category
        - Limit to 5 hotels max  
        - Each hotel must consist of an estimate of average occupancy % for previous seven days before {start_date}.
        - Sort each hotel's pricing_info list by date_

        Output format:
        Return only the corrected JSON array. No commentary or explanation.
        """,
        max_iterations=3
    )

    try:
        if output_text.startswith("```json"):
            output_text = output_text.replace("```json", "").rstrip("```").strip()

        match = re.search(r"\[.*\]", output_text, re.DOTALL)
        competitors = json.loads(match.group(0) if match else output_text)
    except Exception as e:
        competitors = [{"error": "Invalid JSON", "details": str(e)}]


    print(competitors)

    # ->>> KPI CALCULATIONS
    # Extract prices for today and calculate KPI values
    today_prices = []
    competitors_tracked = 0
    today = dt.date.today()
    
    # Loop through the competitors to extract prices for today's date
    for hotel in competitors:
        competitors_tracked += 1

        # Ensure that 'pricing_info' exists before accessing it
        if 'pricing_info' not in hotel:
            print(f"Warning: 'pricing_info' not found for hotel: {hotel.get('hotel_name', 'Unknown')}")
            continue  # Skip this hotel if it does not have pricing_info

        for pricing in hotel['pricing_info']:
            if pricing['date_'] == today.strftime('%Y-%m-%d'):
                today_prices.append(pricing['price'])
    print(today_prices)
    print(competitors)
    # Handle the case where no prices were found
    if not today_prices:
        return {"error": "No prices found for today."}

    # Min, Max, and Rank Calculations
    minimum_price_today = min(today_prices)
    maximum_price_today = max(today_prices)
    num_comp = len(today_prices) + 1

    today_prices.append(min(my_hotel_prices))  # Append the minimum price from my hotel prices
    ranked_prices = sorted(today_prices)
    rank = ranked_prices.index(min(my_hotel_prices)) + 1  # Rank of the lowest price from the array

    above_count = len([price for price in ranked_prices if price < min(my_hotel_prices)])
    below_count = len([price for price in ranked_prices if price > min(my_hotel_prices)])


    prices_by_date = {}
    for hotel in competitors:
        if 'pricing_info' not in hotel:
            continue
        for pricing in hotel['pricing_info']:
            if pricing['date_'] not in prices_by_date:
                prices_by_date[pricing['date_']] = []
            prices_by_date[pricing['date_']].append(pricing['price'])

    medians = [statistics.median(prices) for prices in prices_by_date.values()]
    average_median_price = sum(medians) / len(medians) if medians else 0
    my_average_lead_rate = sum(my_hotel_prices) / len(my_hotel_prices)
    FRI = (my_average_lead_rate / average_median_price) * 100 if average_median_price > 0 else 0

    labels = list(prices_by_date.keys())
    futureRateComparison = FutureRateComparison(
        labels=labels,
        yourHotelRates=my_hotel_prices,
        compSetMedianRates=medians
    )

    result = CompetitiveRateResponse(
        hotel_name=hotel_name,
        location=hotel_location,
        date_range=date_range,
        competitiveRateSnapshot=CompetitiveRateSnapshot(
            leadRateTonight=my_hotel_prices[0],
            compSetMedianTonight=medians[0] if medians else 0,
            compSetRateRange=f"{minimum_price_today} - {maximum_price_today}",
            rateRankTonight=f"{rank} of {len(ranked_prices)}",
            futureRateIndex=round(FRI),
            futureRateChange=f"{round(FRI - 100)}% vs CompSet Median",
            futureRateComparison=futureRateComparison
        )
    )
    
    # Step 1: Save KPI result to kpi_logs
    
    sanitized_name = hotel_name.replace(" ", "_").replace("/", "_")
    # Step 2: Save competitor occupancy info to comp_logs
    os.makedirs("comp_logs", exist_ok=True)
    comp_filename = f'comp_logs/{sanitized_name}.txt'

    with open(comp_filename, "w") as f:
        for hotel in competitors:
            name = hotel.get("hotel_name", "Unknown")
            location = hotel.get("hotel_location", "Unknown")
            occupancy_percent = hotel.get("occupancy_percent", "Unknown")
            f.write(f"{name} - {location} - {occupancy_percent}\n")
    
    # Step 3: Load event data from matching event_logs file
    # Convert start_date and end_date to date objects (if they are still strings)
    start_dt = datetime.strptime(start_date, "%Y-%m-%d").date()
    end_dt = datetime.strptime(end_date, "%Y-%m-%d").date()

    # Add 1 day to start date
    shifted_start = start_dt + timedelta(days=1)

    # Format the filename properly
    full_hotel_location="Stony Brook, NY"
    event_logs_path = os.path.join(
        "event_logs",
        f"extracted_events_{full_hotel_location.replace(' ', '_')}_{shifted_start}_{end_dt}.json"
    )


    result_dict = result.dict()
    result_dict["competitiveRateSnapshot"].setdefault("rateParityStatus", "Unknown")
    result_dict["competitiveRateSnapshot"].setdefault("parityDetails", "N/A")
    result_dict["competitiveRateSnapshot"].setdefault("competitorRateChanges", {
        "increased": 0,
        "decreased": 0,
        "avgIncrease": "$0",
        "avgDecrease": "$0"
    })
    
    try:
        with open(event_logs_path, "r") as f:
            event_data = json.load(f)
            result_dict["localEvents"] = event_data
    except Exception as e:
        result_dict["localEvents"] = []
        result_dict["eventLogLoadError"] = f"Failed to load events file: {str(e)}"

    
    os.makedirs("kpi_logs", exist_ok=True)
    filename = f'kpi_logs/{sanitized_name}_{start_date}.json'

    with open(filename, "w") as f:
        json.dump(result_dict.dict() if hasattr(result_dict, 'dict') else result_dict, f, indent=2)
    return result_dict


# @app.get("/competitiveRateSnapshot", response_model=CompetitiveRateResponse)
def section7_compsetPrices(
    hotel_name: str = Query(...),
    hotel_location: str = Query(...),
    start_date: str = Query(...),
    end_date: str = Query(...),
    my_hotel_prices: str = Query(...)
):
    cleaned_prices = my_hotel_prices.strip("[]")
    my_hotel_prices_list = [float(price) for price in cleaned_prices.split(",")]
    return extract_kpi_values(hotel_name, hotel_location, start_date, end_date, my_hotel_prices_list)

