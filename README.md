# Workvivo SIEM Fetching Tool

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

## Tools

Node.js version: https://github.com/Yosuke-workvivo/Workvivo-SIEM/tree/main/workvivo-SIEM-nodejs

Python version: https://github.com/Yosuke-workvivo/Workvivo-SIEM/tree/main/workvivo-SIEM-python 
