from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List
from datetime import datetime, timedelta
import json
import re
from datetime import datetime, timedelta

from generic import (
    search_top_links,
    scrape_websites,
    refine_with_expert_reviewer_loop,
    expert_llm,
    reviewer_llm
)

app = FastAPI(title="KPI Review Volume Extractor", description="Extracts total number of reviews in a given date range.")


class ReviewVolumeResponse(BaseModel):
    hotel_name: str
    location: str
    date_range: str
    review_volume_data: List[dict]

def extract_review_volume(hotel_name: str, location: str, days: int = 30):
    days = int(days)
    from datetime import datetime, timedelta

    end_date = datetime.today().date() 
    start_date = (end_date - timedelta(days=days))


    date_range_str = f"{start_date.strftime('%B %d, %Y')} to {end_date.strftime('%B %d, %Y')}"

    search_query = (
    f"{hotel_name} in {location} Booking.com REVIEWS"
)

    print(start_date)
    print(end_date)
    expert_prompt_template = """
You are a hotel review analyst.

Task: From the raw text below, extract the total number of reviews AND the average star rating  for the hotel "{hotel_name}" in "{location}" during the period {start_date} to {end_date}.

The data may come from Yelp, TripAdvisor, or other platforms.

Text:
{raw_text}

Output Format (JSON array with 1 entry only):
[
  {{
    "hotel_name": "{hotel_name}",
    "location": "{location}",
    "start_date": "{start_date}",
    "end_date": "{end_date}",
    "review_count": ...,
    "average_rating": ...,
    "source_summary": "Data found from Yelp or TripAdvisor or similar"
  }}
]
"""



    reviewer_prompt_template = """
    You are reviewing extracted hotel review volume data.

    Instructions:
    1. Ensure JSON contains 1 object with fields: hotel_name, location, start_date, end_date, review_count, source_summary.
    2. Review count must be a reasonable integer.
    3. Make sure dates match the requested window: {start_date} to {end_date}.
    4. Summary should match the website info found.

    If correct, return APPROVED. Otherwise, give specific feedback.
    
    Data:
    {extracted_output}
    """

    # === Search and Scrape ===
    urls = search_top_links(search_query)
    # print(urls)
    raw_texts = scrape_websites(urls)
    # print(raw_texts)
    combined_text = "\n\n".join(raw_texts)

    # === Run Expert-Reviewer Loop ===
    output_text, logs = refine_with_expert_reviewer_loop(
        raw_text=combined_text,
        expert_llm=expert_llm,
        reviewer_llm=reviewer_llm,
        expert_prompt_template=expert_prompt_template,
        reviewer_prompt_template=reviewer_prompt_template,
        max_iterations=3,
        additional_format_kwargs={
            "hotel_name": hotel_name,
            "location": location,
            "start_date": start_date.strftime("%B %d, %Y"),
            "end_date": end_date.strftime("%B %d, %Y")
        }
    )


    # === Parse JSON ===
    try:
        if output_text.startswith("```json"):
            output_text = output_text.replace("```json", "").rstrip("```").strip()
        match = re.search(r"\[.*\]", output_text, re.DOTALL)
        json_data = json.loads(match.group(0) if match else output_text)
    except Exception as e:
        json_data = [{"error": "Invalid JSON", "details": str(e)}]
    
    review_result=ReviewVolumeResponse(
        hotel_name=hotel_name,
        location=location,
        date_range=date_range_str,
        review_volume_data=json_data
    )

    import os
    os.makedirs("review_logs", exist_ok=True)
    file_path = os.path.join("review_logs", f"extracted_review_{hotel_name.replace(' ', '_')}_.json")

    with open(file_path, "w") as json_file:
        json.dump(json_data, json_file, indent=4)
    return review_result
