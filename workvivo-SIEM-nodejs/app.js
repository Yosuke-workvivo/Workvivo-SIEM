/////////////////////////////////////////////////////////////////////////////////////////////////
// 
// Dec 19, 2024
// yosuke.sawamura@zoom.us
// Workvivo fetching SIEM demo 
//
// node v20.17.0
// npm 11.0.0
//
// Note)
// 1. Make sure app.js (this) and package.json is present in the same directory.
//  $ npm install
// 2. Two arguments will be required to define the starting and ending data.
// 2024-12-01 for year 2024, 09 (September), 01 first day
//
// Now you can run the script in three ways:
//  $ node app.js 2024-12-01 2024-12-02 (uses default 60-minute intervals)
//  $ node app.js 2024-12-01 2024-12-02 10 (uses 10-minute intervals)
//  $ node app.js 2024-12-01 2024-12-02 30 (uses 30-minute intervals)
//
/////////////////////////////////////////////////////////////////////////////////////////////////

const axios = require('axios');
//const fs = require('fs')
const fsPromises = require('fs/promises')
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') })
const { DateTime } = require('luxon');

// Variables
const WORKVIVOID = process.env.WORKVIVOID;
const WORKVIVOTOKEN = process.env.WORKVIVOTOKEN;
const baseUrl = "https://api.workvivo.io/v1/siem/";
const logdir = `${__dirname}/log/siem_data.log`
const TIMEZONE = process.env.TIMEZONE;

// Get args, exit if none provided 
const args = process.argv.slice(2);
const startarg = args[0];
const endarg = args[1];
const intervalMinutes = args[2] ? parseInt(args[2]) : 60; // Default to 60 minutes if not provided

// CSV header
const csvHeader = "id,created_at_timestamp,created_at,created_at_local,workvivo_id,user_email,event,ip_address,user_agent,note\n";

function isValidDate(dateString) {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }
  const dateParts = dateString.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10);
  const day = parseInt(dateParts[2], 10);
  // Check if the date is valid using Date object
  const date = new Date(year, month - 1, day); // Month is 0-indexed
  return date.getFullYear() === year && date.getMonth() + 1 === month && date.getDate() === day;
}

async function getEpocDates(argStartDate, argEndDate){
  // Get the current time in milliseconds
  const now = Date.now();
  const StringArgEndDate = new Date(argEndDate);

  const nowYear = new Date(now).getFullYear();
  const nowMonth = new Date(now).getMonth(); // Month is 0-indexed
  const nowDay = new Date(now).getDate();

  const dateObjectYear = StringArgEndDate.getFullYear();
  const dateObjectMonth = StringArgEndDate.getMonth();
  const dateObjectDay = StringArgEndDate.getDate();

  var endDatetime;

  if (nowYear === dateObjectYear && nowMonth === dateObjectMonth && nowDay === dateObjectDay) {
    console.log("Provided EndDate represents the same date as today.");
    endDatetime = now;
  } else {    
    console.log("Provided EndDate represents a different date.");
    // Create a DateTime object for the start date and time
    endDatetime = DateTime.fromISO(argEndDate + 'T23:59:59', { zone: TIMEZONE });
  }

  // Create a DateTime object for the start date and time
  const startDatetime = DateTime.fromISO(argStartDate + 'T00:00:00', { zone: TIMEZONE });

  // Calculate the difference in milliseconds between the start datetime and now
  const totalDifferenceInMilliseconds = endDatetime - startDatetime.toMillis();
  
  // Calculate the total number of intervals based on the provided interval minutes
  const totalIntervals = Math.floor(totalDifferenceInMilliseconds / (intervalMinutes * 60 * 1000));
  // Iterate over each interval and calculate the start and end epoch times

  console.log(`Number of API requests: ${totalIntervals} (using ${intervalMinutes} minute intervals)`);

  for (let i = 0; i <= totalIntervals; i++) {
    const intervalStart = startDatetime.plus({ minutes: i * intervalMinutes }).toMillis();
    const intervalEnd = startDatetime.plus({ minutes: (i + 1) * intervalMinutes }).toMillis();
    const epocStart = Math.floor(intervalStart / 1000);
    const epocEnd = Math.floor(intervalEnd / 1000);
    console.log(`Interval ${i + 1}:`);
    //console.log(`  Start Epoch Time: ${epocStart}`);
    //console.log(`  End Epoch Time: ${epocEnd}`);
    await fetchData(epocStart,epocEnd);
  }
}

async function fetchData(start, end) {
  var newUrl = baseUrl + start + "/" + end;
  try {
    const response = await axios.get(newUrl, {
      headers: {
        'Workvivo-Id': WORKVIVOID,
        'Authorization': 'Bearer ' + WORKVIVOTOKEN,
        'Accept': 'application/json'
        //'Content-Type': 'application/json'
      }
    });
    const data = response.data;
    console.log("fetching data sucess");
    writedata(data.data);
  } catch (error) {
    console.error("fetching data " + error);
  }
}

// Convert JSON data to CSV format
function jsonToCsv(jsonData) {
  const escapeCsvField = (field) => {
    if (field === null || field === undefined) {
      return "";
    }
    const str = String(field);
    // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Convert UTC timestamp to local time
  const getLocalTime = (utcTimestamp) => {
    const utcDate = new Date(utcTimestamp * 1000);
    return utcDate.toLocaleString();
  };

  const csvRow = [
    escapeCsvField(jsonData.id),
    escapeCsvField(jsonData.created_at_timestamp),
    escapeCsvField(jsonData.created_at),
    escapeCsvField(getLocalTime(jsonData.created_at_timestamp)),
    escapeCsvField(jsonData.workvivo_id),
    escapeCsvField(jsonData.user_email),
    escapeCsvField(jsonData.event),
    escapeCsvField(jsonData.ip_address),
    escapeCsvField(jsonData.user_agent),
    escapeCsvField(jsonData.note)
  ].join(',');

  return csvRow;
}

// Check if CSV header exists, if not, write it
async function ensureCsvHeader() {
  try {
    const stats = await fsPromises.stat(logdir);
    if (stats.size === 0) {
      await fsPromises.writeFile(logdir, csvHeader);
    }
  } catch (error) {
    // File doesn't exist, create it with header
    await fsPromises.writeFile(logdir, csvHeader);
  }
}

function logCurrentDateTime() {
  const currentDate = new Date();
  let d = currentDate.toDateString() + " " + currentDate.toTimeString().split(' ')[0];
  return d;
}

// Write log file in CSV format
async function writedata(newdata){
  // Ensure CSV header exists
  await ensureCsvHeader();
  
  for (let i = 0; i < newdata.length; i++) {
    const csvRow = jsonToCsv(newdata[i]);
    try {
      await fsPromises.appendFile(logdir, csvRow + '\n');
      console.log(logCurrentDateTime(), 'write data success');
    } catch (err) {
      console.error("write data " + err)
    }
  }
};

if (args.length === 0) {
  console.log('Please provide arguments to define the starting and ending data, and optionally the interval in minutes.');
  console.log('argument values: 2024-12-01 for year 2024, 12 (December), 01 first day');
  console.log('example: running "% node app.js 2024-12-01 2024-12-02 10" will seek between Dec 1 to Dec 2 with 10-minute intervals');
  process.exit(1); // Exit with a non-zero exit code to indicate an error
} else {
  // Process the arguments here
  console.log('Arguments:', startarg);
  if (isValidDate(startarg) && isValidDate(endarg)) {
    console.log('provided date format is correct.');
    if (intervalMinutes && intervalMinutes > 0) {
      console.log(`Using ${intervalMinutes} minute intervals`);
    } else {
      console.log('Using default 60 minute intervals');
    }
    getEpocDates(startarg, endarg);
  } else {
    console.log('provided date format is incorrect.');
    console.log('example: 2024-12-01 for year 2024, 12 (December), 01 first day');
    console.log('example: running "% node app.js 2024-12-01 2024-12-02 10" will seek between Dec 1 to Dec 2 with 10-minute intervals');
  }
}
