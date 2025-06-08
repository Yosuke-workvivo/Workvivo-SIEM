#!/usr/bin/env python3
"""
Dec 19, 2024
yosuke.sawamura@zoom.us
Workvivo fetching SIEM demo - Python version

Python 3.8+
pip install requests python-dotenv pytz

Note:
1. Make sure app.py (this) and .env file is present in the same directory.
   pip install -r requirements.txt
2. Two arguments will be required to define the starting and ending data.
   2024-09-01 for year 2024, 09 (September), 01 first day

Example:
  python app.py 2009-09-01 2024-09-02
"""

import os
import sys
import json
import argparse
import requests
import csv
from datetime import datetime, timedelta
import pytz
from pathlib import Path
from dotenv import load_dotenv
import re

# Load environment variables from .env file
load_dotenv()

# Variables
WORKVIVOID = os.getenv('WORKVIVOID')
WORKVIVOTOKEN = os.getenv('WORKVIVOTOKEN')
BASE_URL = "https://api.workvivo.io/v1/siem/"
TIMEZONE = os.getenv('TIMEZONE', 'UTC')

# Create log directory if it doesn't exist
log_dir = Path(__file__).parent / 'log'
log_dir.mkdir(exist_ok=True)
LOG_FILE = log_dir / 'siem_data.csv'


def is_valid_date(date_string):
    """Validate date format YYYY-MM-DD"""
    date_regex = r'^\d{4}-\d{2}-\d{2}$'
    if not re.match(date_regex, date_string):
        return False
    
    try:
        year, month, day = map(int, date_string.split('-'))
        # Check if the date is valid
        datetime(year, month, day)
        return True
    except ValueError:
        return False


def get_epoch_dates(arg_start_date, arg_end_date):
    """Calculate epoch times for hourly intervals and fetch data"""
    # Get current time
    now = datetime.now()
    end_date_obj = datetime.strptime(arg_end_date, '%Y-%m-%d')
    
    # Check if end date is today
    if (now.year == end_date_obj.year and 
        now.month == end_date_obj.month and 
        now.day == end_date_obj.day):
        print("Provided EndDate represents the same date as today.")
        end_datetime = now
    else:
        print("Provided EndDate represents a different date.")
        # Create timezone-aware datetime for end of day
        tz = pytz.timezone(TIMEZONE)
        end_datetime = tz.localize(datetime.strptime(arg_end_date + ' 23:59:59', '%Y-%m-%d %H:%M:%S'))
    
    # Create timezone-aware datetime for start of day
    tz = pytz.timezone(TIMEZONE)
    start_datetime = tz.localize(datetime.strptime(arg_start_date + ' 00:00:00', '%Y-%m-%d %H:%M:%S'))
    
    # Calculate total difference in milliseconds
    if isinstance(end_datetime, datetime) and end_datetime.tzinfo is None:
        # If end_datetime is naive (current time), make it timezone-aware
        end_datetime = tz.localize(end_datetime)
    
    total_difference = end_datetime - start_datetime
    total_difference_ms = int(total_difference.total_seconds() * 1000)
    
    # Calculate total number of 60-minute intervals
    total_intervals = total_difference_ms // (60 * 60 * 1000)
    
    print(f"Number of API requests: {total_intervals}")
    
    # Iterate over each 60-minute interval
    for i in range(total_intervals + 1):
        interval_start = start_datetime + timedelta(hours=i)
        interval_end = start_datetime + timedelta(hours=i + 1)
        
        epoch_start = int(interval_start.timestamp())
        epoch_end = int(interval_end.timestamp())
        
        print(f"Interval {i + 1}:")
        fetch_data(epoch_start, epoch_end)


def fetch_data(start, end):
    """Fetch data from Workvivo API"""
    url = f"{BASE_URL}{start}/{end}"
    
    headers = {
        'Workvivo-Id': WORKVIVOID,
        'Authorization': f'Bearer {WORKVIVOTOKEN}',
        'Accept': 'application/json'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        
        data = response.json()
        print("fetching data success")
        write_data(data.get('data', []))
        
    except requests.exceptions.RequestException as error:
        print(f"fetching data error: {error}")


def log_current_datetime():
    """Get current date and time as string"""
    current_date = datetime.now()
    return current_date.strftime('%a %b %d %Y %H:%M:%S')


def write_data(new_data):
    """Write data to CSV file with local timestamp"""
    if not new_data:
        return
    
    # Get timezone for local timestamp
    tz = pytz.timezone(TIMEZONE)
    current_local_time = datetime.now(tz).strftime('%Y-%m-%d %H:%M:%S %Z')
    
    # Check if file exists to determine if we need to write headers
    file_exists = LOG_FILE.exists()
    
    try:
        with open(LOG_FILE, 'a', newline='', encoding='utf-8') as csvfile:
            # Get all possible field names from the data
            fieldnames = set()
            for item in new_data:
                if isinstance(item, dict):
                    fieldnames.update(item.keys())
            
            # Add our custom local timestamp field
            fieldnames = ['local_timestamp'] + sorted(fieldnames)
            
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames, extrasaction='ignore')
            
            # Write header if file is new
            if not file_exists:
                writer.writeheader()
            
            # Write each data item with local timestamp
            for item in new_data:
                if isinstance(item, dict):
                    # Create a copy of the item and add local timestamp
                    row_data = item.copy()
                    row_data['local_timestamp'] = current_local_time
                    writer.writerow(row_data)
                else:
                    # Handle non-dict data by converting to string
                    row_data = {
                        'local_timestamp': current_local_time,
                        'raw_data': str(item)
                    }
                    writer.writerow(row_data)
        
        print(f"{log_current_datetime()} write data success - {len(new_data)} records written to CSV")
        
    except IOError as err:
        print(f"write data error: {err}")


def main():
    """Main function to handle command line arguments and orchestrate the process"""
    parser = argparse.ArgumentParser(
        description='Workvivo SIEM data fetching tool',
        epilog='Example: python app.py 2024-09-01 2024-09-02'
    )
    parser.add_argument('start_date', help='Start date in YYYY-MM-DD format')
    parser.add_argument('end_date', help='End date in YYYY-MM-DD format')
    
    if len(sys.argv) == 1:
        print('Please provide arguments to define the starting and ending data.')
        print('argument values: 2024-09-01 for year 2024, 09 (September), 01 first day')
        print('example: running "python app.py 2024-09-01 2024-09-02" will seek between Sep 1 to Sep 2')
        sys.exit(1)
    
    args = parser.parse_args()
    start_date = args.start_date
    end_date = args.end_date
    
    print(f'Arguments: {start_date}')
    
    if is_valid_date(start_date) and is_valid_date(end_date):
        print('provided date format is correct.')
        
        # Check if environment variables are set
        if not WORKVIVOID or not WORKVIVOTOKEN:
            print('Error: WORKVIVOID and WORKVIVOTOKEN environment variables must be set in .env file')
            sys.exit(1)
        
        get_epoch_dates(start_date, end_date)
        
    else:
        print('provided date format is incorrect.')
        print('example: 2024-09-01 for year 2024, 12 (September), 01 first day')
        print('example: running "python app.py 2024-09-01 2024-09-02" will seek between September 1 to September 2')
        sys.exit(1)


if __name__ == "__main__":
    main() 