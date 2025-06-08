# Workvivo SIEM Fetching Tool - Python Version

The SIEM API lets you query security related events associated with your users and Organisation.
Such as login, logout, switch user.

For official description please visit Workvivo Developers:

https://developer.workvivo.com/#0836b42d-0d64-4c5e-a1fb-0d00e06026a4

## Overview

This application connects to the Workvivo API to retrieve SIEM  data for a specified date range and outputs the data in CSV format. 
It automatically converts UTC timestamps to local time and handles proper CSV formatting with field escaping.

## Requirements

- Python 3.8+
- pip (Python package installer)

## Installation

1. Install the required Python packages:
```bash
pip install -r requirements.txt
```

2. Create your environment file:
```bash
cp env.template .env
```

3. Edit the `.env` file and fill in your actual Workvivo credentials and your timezone:
```
WORKVIVOID=your_actual_workvivo_id
WORKVIVOTOKEN=your_actual_workvivo_token
TIMEZONE='Asia/Tokyo'
```

## Usage

The script requires two date arguments to define the starting and ending dates for data fetching.

### Basic Usage
```bash
python app.py 2024-09-01 2024-09-02
```

This will fetch SIEM data from September 1, 2024 to September 2, 2024.

### Date Format
- Use YYYY-MM-DD format
- Example: `2024-09-01` for year 2024, September (09), 1st day

### How it Works

1. The script validates the provided date arguments
2. It calculates hourly intervals between the start and end dates
3. For each hour interval, it makes an API call to the Workvivo SIEM endpoint
4. Fetched data is written to `log/siem_data.csv` file with automatic CSV headers
5. Each record includes a `local_timestamp` column showing when the data was fetched in your configured timezone
6. The script creates the log directory automatically if it doesn't exist

### Output

- Console output shows the progress of API requests
- Data is saved to `log/siem_data.csv` in CSV format
- Each row in the CSV file contains one record from the API response
- An additional `local_timestamp` column shows when the data was fetched in your configured timezone
- CSV headers are automatically generated based on the fields in the API response

### Error Handling

- Invalid date formats will be rejected with helpful error messages
- Missing environment variables will cause the script to exit with an error
- API request failures are logged but don't stop the script from continuing with other intervals
- File write errors are logged but don't stop the overall process

## Differences from Node.js Version

This Python version maintains the same functionality as the original Node.js script with these changes:

- Uses `requests` library instead of `axios` for HTTP requests
- Uses `datetime` and `pytz` libraries instead of `luxon` for date/time handling
- Uses `argparse` for command-line argument parsing
- Uses `pathlib` for file path operations
- Synchronous execution (removed async/await as it wasn't necessary for this use case)

## File Structure

```
.
├── app.py              # Main Python script
├── requirements.txt    # Python dependencies
├── env.template       # Environment variables template
├── README.md          # This file
└── log/               # Directory for log files (created automatically)
    └── siem_data.csv  # SIEM data output file in CSV format
```

**Created by**: yosuke.sawamura@zoom.us  
**Date**: December 19, 2024  
**Python Version**: Python 3.8+
