#!/usr/bin/env node

/**
 * Cron job script to check for expired trials and create automatic billing
 * This script should be run every hour via cron job
 * 
 * Usage: node scripts/check-expired-trials.js
 * 
 * Environment variables required:
 * - CRON_SECRET: Secret key for API authentication
 * - NEXT_PUBLIC_APP_URL: Your app URL
 */

const https = require('https');
const http = require('http');

const CRON_SECRET = process.env.CRON_SECRET;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!CRON_SECRET) {
  console.error('Error: CRON_SECRET environment variable is required');
  process.exit(1);
}

async function checkExpiredTrials() {
  const url = `${APP_URL}/api/trial/auto-billing`;
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CRON_SECRET}`,
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const client = APP_URL.startsWith('https') ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function main() {
  try {
    console.log(`[${new Date().toISOString()}] Checking for expired trials...`);
    
    const result = await checkExpiredTrials();
    
    if (result.status === 200) {
      console.log('✅ Success:', result.data.message);
      if (result.data.results && result.data.results.length > 0) {
        result.data.results.forEach((user, index) => {
          if (user.status === 'success') {
            console.log(`  ${index + 1}. User ${user.email}: Subscription created (${user.subscriptionId})`);
          } else {
            console.log(`  ${index + 1}. User ${user.email}: Error - ${user.error}`);
          }
        });
      }
    } else {
      console.error('❌ Error:', result.data.error || 'Unknown error');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
