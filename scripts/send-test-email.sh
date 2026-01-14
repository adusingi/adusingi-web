#!/bin/bash

# Test email using cURL and ZeptoMail API
# Usage: ./send-test-email.sh

# Configuration
ZEPTOMAIL_TOKEN="Zoho-enczapikey wSsVR60nqUKkC6l8m2Glde1tn1xQVl/0HUR13VOi7yD9Fq3K9Mc+kkDNB1D2H/ZJGDE9FGMS8ul/zRxV2jYH244qyF4FACiF9mqRe1U4J3x17qnvhDzOV2pUlRKOL4wOzwlsnGNnG8xu"

echo "Sending test email to adusingi@protonmail.com..."

curl "https://api.zeptomail.com/v1.1/email" \
  -X POST \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: $ZEPTOMAIL_TOKEN" \
  -d '{
    "from": {
      "address": "noreply@adusingi.com",
      "name": "Aimable Dusingizimana"
    },
    "to": [{
      "email_address": {
        "address": "adusingi@protonmail.com",
        "name": "Aimable Dusingizimana (Test)"
      }
    }],
    "subject": "🧪 Test: ZeptoMail Integration",
    "htmlbody": "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><title>Test Email</title></head><body style=\"font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;\"><h1>🧪 Test Email from ZeptoMail</h1><p>This is a test email to verify the ZeptoMail integration works.</p><p><strong>Post being tested:</strong> Code, Craft & Culture: Building from Rural Japan</p><p>If you receive this, the ZeptoMail setup is working correctly!</p><hr><p style=\"font-size: 14px; color: #666;\">Sent from Aimable Dusingizimana'\''s newsletter system.<br>Building from rural Okayama, Japan.</p></body></html>"
  }'

echo -e "\n\nIf the command completed without error, check your inbox at adusingi@protonmail.com"

echo -e "\n\nIf the command completed without error, check your inbox at adusingi@protonmail.com"