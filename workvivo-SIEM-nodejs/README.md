# Workvivo SIEM Fetching Tool - Nodejs Version

The SIEM API lets you query security related events associated with your users and Organisation.
Such as login, logout, switch user.

For official description please visit Workvivo Developers:

https://developer.workvivo.com/#0836b42d-0d64-4c5e-a1fb-0d00e06026a4

## Overview

This application connects to the Workvivo API to retrieve SIEM  data for a specified date range and outputs the data in CSV format. 
It automatically converts UTC timestamps to local time and handles proper CSV formatting with field escaping.

## Features

- ✅ Fetches SIEM data from Workvivo API in hourly intervals
- ✅ Outputs data in CSV format with proper field escaping
- ✅ Adds local time column for easier analysis
- ✅ Automatic CSV header management
- ✅ Configurable timezone support
- ✅ Date range validation
- ✅ Error handling and logging

## Requirements

- **Node.js**: v20.17.0 or higher
- **npm**: 11.0.0 or higher
- **Valid Workvivo API credentials (your_workvivo_id & your_bearer_token)**:<br>
  API Authentication - Bearer Token (guide includes requirements to use API<br>
https://support.workvivo.com/hc/en-gb/articles/24560593493661-API-Authentication-Bearer-Token

## Dependencies

The application uses the following npm packages:

- `axios` - HTTP client for API requests
- `luxon` - DateTime library for timezone handling
- `dotenv` - Environment variable management

## Installation

1. **Clone or download the repository**
   ```bash
   git clone <repository-url>
   cd workvivo-SIEM-nodejs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment configuration**
   Create a `.env` file in the root directory:
   ```env
   WORKVIVOID=your_workvivo_id
   WORKVIVOTOKEN=your_bearer_token
   TIMEZONE=your_timezone
   ```

## Configuration

### Environment Variables

Create a `.env` file with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `WORKVIVOID` | Your Workvivo organization ID | `1234567` |
| `WORKVIVOTOKEN` | Your Workvivo API bearer token | `eyJhbGciOiJIUzI1...` |
| `TIMEZONE` | Timezone for local time conversion | `America/New_York`, `Europe/London`, `Asia/Tokyo` |

### API Authentication

You'll need to obtain:
1. **Workvivo ID**: Your organization's Workvivo identifier
2. **Bearer Token**: API authentication token from Workvivo

Contact your Workvivo administrator or check the Workvivo API documentation for these credentials.

## Usage

### Basic Usage

```bash
node app.js <start-date> <end-date>
```

### Date Format

Dates must be in `YYYY-MM-DD` format:

```bash
# Fetch data for December 1-2, 2024
node app.js 2024-12-01 2024-12-02

# Fetch data for a single day
node app.js 2024-12-01 2024-12-01

# Fetch data for a week
node app.js 2024-12-01 2024-12-07
```

### Examples

```bash
# Fetch SIEM data for September 1-2, 2024
node app.js 2024-09-01 2024-09-02

# Fetch data for the entire month of December 2024
node app.js 2024-12-01 2024-12-31

# Fetch data for today (if today is 2024-12-19)
node app.js 2024-12-19 2024-12-19
```

## Output

### File Location

Data is saved to: `./log/siem_data.log`

### CSV Format

The output CSV file contains the following columns:

| Column | Description | Example |
|--------|-------------|---------|
| `id` | Unique event ID | `29792693` |
| `created_at_timestamp` | Unix timestamp (UTC) | `1749336563` |
| `created_at` | UTC datetime string | `2025-06-07T22:49:23Z` |
| `created_at_local` | **Local datetime** | `6/8/2025, 7:49:23 AM` |
| `workvivo_id` | Workvivo user ID | `1637453` |
| `user_email` | User email address | `user02@playground.zapto.org` |
| `event` | Event type | `switch user reverted` |
| `ip_address` | Source IP address | `10.30.12.41` |
| `user_agent` | Browser user agent | `Mozilla/5.0 (Macintosh...)` |
| `note` | Additional event details | `login, logout, switch user...` |

### Sample Output

```csv
id,created_at_timestamp,created_at,created_at_local,workvivo_id,user_email,event,ip_address,user_agent,note
29792693,1749336563,2025-06-07T22:49:23Z,"6/8/2025, 7:49:23 AM",1637453,user02@playground.zapto.org,switch user reverted,10.30.12.41,"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36","switch user reverted from user02@playground.zapto.org to user administrator@playground.zapto.org"
```

## How It Works

1. **Date Processing**: Converts input dates to epoch timestamps
2. **API Calls**: Makes hourly API requests to fetch data in 1-hour intervals
3. **Data Processing**: Converts JSON responses to CSV format
4. **Time Conversion**: Adds local time column using the configured timezone
5. **File Output**: Appends data to CSV log file with proper formatting

## Error Handling

The application includes error handling for:

- Invalid date formats
- API connection failures
- File system errors
- Missing environment variables

## Troubleshooting

### Common Issues

**"Please provide arguments"**
- Ensure you provide both start and end dates
- Use the correct date format: `YYYY-MM-DD`

**"Provided date format is incorrect"**
- Check that dates are in `YYYY-MM-DD` format
- Ensure dates are valid (e.g., not `2024-02-30`)

**"Fetching data error"**
- Verify your `WORKVIVOID` and `WORKVIVOTOKEN` in `.env`
- Check your network connection
- Ensure your API token hasn't expired

**"Write data error"**
- Check that the `log` directory exists
- Verify file permissions
- Ensure sufficient disk space

### Debug Mode

For debugging API responses, uncomment the debug line in the code:
```javascript
//console.log(dataString);  // Remove the // to enable debug output
```

## API Rate Limits

The application makes one API request per hour of the specified date range. For example:
- 1 day = 24 API requests
- 1 week = 168 API requests
- 1 month = ~720 API requests

Be mindful of any API rate limits imposed by Workvivo.

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Add `.env` to your `.gitignore` file
- Regularly rotate your API tokens
- Store sensitive credentials securely

## License

This tool is provided as-is for demonstration purposes. Please ensure you have proper authorization to access Workvivo SIEM data before use.

## Support

For issues related to:
- **API Access**: Contact your Workvivo administrator
- **Application Bugs**: Check the console output for error messages
- **Data Questions**: Refer to Workvivo SIEM documentation

---

**Created by**: yosuke.sawamura@zoom.us  
**Date**: December 19, 2024  
