# Workvivo SIEM Fetching Tool - Python Version

A Python tool for fetching Security Information and Event Management (SIEM) data from the Workvivo API and exporting it to CSV format with local timestamp tracking.

For official description please visit Workvivo Developers:

https://developer.workvivo.com/#0836b42d-0d64-4c5e-a1fb-0d00e06026a4

## Features

- 🔍 Fetches SIEM data from Workvivo API in hourly intervals
- 📊 Exports data to CSV format with automatic header detection
- 🕐 Adds local timestamp column showing when data was fetched
- 🌍 Timezone-aware date/time handling
- 📝 Comprehensive error handling and logging
- ⚙️ Environment-based configuration

## Prerequisites

- Python 3.8 or higher
- pip (Python package installer)
- Valid Workvivo API credentials (your_workvivo_id & your_workvivo_token)<br>
  API Authentication - Bearer Token (guide includes requirements to use API<br>
https://support.workvivo.com/hc/en-gb/articles/24560593493661-API-Authentication-Bearer-Token

## Quick Start

### 1. Installation

```bash
# Clone or download the project files
# Navigate to the project directory

# Install required packages
pip install -r requirements.txt
```

### 2. Configuration

Create your environment configuration:

```bash
# Copy the template
cp env.template .env

# Edit .env with your credentials
nano .env
```

Required environment variables:
```env
WORKVIVOID=your_workvivo_id
WORKVIVOTOKEN=your_workvivo_token
TIMEZONE=Asia/Tokyo
```

### 3. Usage

```bash
python app.py <start_date> <end_date>
```

**Example:**
```bash
python app.py 2024-09-01 2024-09-02
```

This fetches SIEM data from September 1, 2024 to September 2, 2024.

## Date Format

- **Format:** YYYY-MM-DD
- **Example:** `2024-09-01` represents September 1st, 2024
- **Range:** Both start and end dates are inclusive

## How It Works

1. **Date Validation:** Validates input dates for correct format and validity
2. **Interval Calculation:** Divides the date range into hourly intervals
3. **API Requests:** Makes sequential API calls for each hour interval
4. **Data Processing:** Processes JSON responses and converts to CSV format
5. **Local Timestamp:** Adds timestamp showing when data was fetched in your timezone
6. **File Output:** Appends data to `log/siem_data.csv` with proper headers

## Output Format

### CSV File Structure
- **Location:** `log/siem_data.csv`
- **Format:** CSV with dynamic headers based on API response
- **Special Column:** `local_timestamp` - shows when data was fetched


### CSV Format

The output CSV file contains the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `local_timestamp` | **Local datetime** | `2025-06-08 09:07:21 JST` |
| `created_at` | UTC datetime string | `2025-06-07T22:49:23Z` |
| `created_at_timestamp` | Unix timestamp (UTC) | `1749336563` |
| `event` | Event type | `login, logout, switch user...` |
| `id` | Unique event ID | `29792693` |
| `ip_address` | Source IP address | `10.30.12.41` |
| `note` | Additional event details | `switch user from...` |
| `user_agent` | Browser user agent | `Mozilla/5.0 (Macintosh...)` |
| `user_email` | User email address | `user02@playground.zapto.org` |
| `workvivo_id` | Workvivo user ID | `1637453` |

### Example CSV Output
```csv
local_timestamp,created_at,created_at_timestamp,event,id,ip_address,note,user_agent,user_email,workvivo_id
2025-06-08 09:07:21 JST,2025-06-07T22:46:04Z,1749336364,switch user,29792647,10.30.12.41,switch user from user02@playground.zapto.org to user administrator@playground.zapto.org,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",user02@playground.zapto.org,1637453
```

### Console Output
```
Arguments: 2024-09-01
provided date format is correct.
Number of API requests: 24
Interval 1:
fetching data success
Fri Sep 01 2024 09:00:00 write data success - 15 records written to CSV
```

## Error Handling

| Error Type | Behavior |
|------------|----------|
| Invalid date format | Script exits with helpful message |
| Missing credentials | Script exits with error message |
| API request failure | Logs error, continues with next interval |
| File write error | Logs error, continues processing |

## Configuration Options

### Environment Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `WORKVIVOID` | Your Workvivo organization ID | `org_123456` | Yes |
| `WORKVIVOTOKEN` | Your Workvivo API token | `token_abcdef...` | Yes |
| `TIMEZONE` | Timezone for local timestamps | `Asia/Tokyo` | No (default: UTC) |

### Common Timezones
- `UTC` - Coordinated Universal Time
- `Asia/Tokyo` - Japan Standard Time (JST)
- `America/New_York` - Eastern Time
- `Europe/London` - Greenwich Mean Time

## File Structure

```
workvivo-fetchSIEM-python/
├── app.py              # Main application script
├── requirements.txt    # Python dependencies
├── env.template       # Environment variables template
├── README.md          # This documentation
└── log/               # Output directory (auto-created)
    └── siem_data.csv  # SIEM data in CSV format
```

## Dependencies

The tool uses these Python packages:

- `requests` - HTTP client for API calls
- `python-dotenv` - Environment variable management
- `pytz` - Timezone handling and conversion

## Troubleshooting

### Common Issues

**"Missing environment variables"**
- Ensure `.env` file exists and contains valid credentials
- Check that variable names match exactly: `WORKVIVOID`, `WORKVIVOTOKEN`

**"Invalid date format"**
- Use YYYY-MM-DD format only
- Ensure dates are valid (e.g., not February 30th)

**"API request failed"**
- Verify your Workvivo credentials are correct
- Check your network connection
- Ensure your API token has SIEM access permissions

### Debug Mode

For detailed debugging, you can modify the script to show more information:
```python
# In app.py, uncomment these lines for debugging:
# print(f"  Start Epoch Time: {epoch_start}")
# print(f"  End Epoch Time: {epoch_end}")
```

## License

This tool is provided as-is for demonstration purposes. Please ensure you have proper authorization to access Workvivo SIEM data before use.

## Support

For issues related to:
- **Workvivo API:** Contact your Workvivo administrator
- **Script functionality:** Check the troubleshooting section above
- **Python environment:** Ensure Python 3.8+ and pip are properly installed

**Author:** yosuke.sawamura@zoom.us  
**Date:** December 19, 2024  
