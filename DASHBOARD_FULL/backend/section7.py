import os
import json

def section7(hotel_name: str, start_date: str, base_path: str = "kpi_logs") -> dict:
    """
    Fetch KPI log data from a JSON file.

    Args:
        hotel_name (str): The name of the hotel (e.g., "Hilton Garden Inn").
        start_date (str): The start date in 'YYYY-MM-DD' format.
        base_path (str): The folder where JSON files are stored (default: "kpi_logs").

    Returns:
        dict: Parsed JSON data if file exists and is valid, else an empty dictionary.
    """
    # Sanitize hotel name to be filename-friendly
    safe_hotel_name = hotel_name.replace(" ", "_")

    filename = f"{safe_hotel_name}_{start_date}.json"
    filepath = os.path.join(base_path, filename)

    try:
        with open(filepath, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data
    except FileNotFoundError:
        print(f"File not found: {filepath}")
    except json.JSONDecodeError:
        print(f"Invalid JSON in file: {filepath}")
    except Exception as e:
        print(f"Unexpected error reading file: {e}")

    return {}
