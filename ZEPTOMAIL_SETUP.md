# ZeptoMail Configuration

## Required Token
You need a `SEND_MAIL_TOKEN` from ZeptoMail, not a Zoho API key.

## How to get your ZeptoMail token:

1. Log in to your ZeptoMail dashboard (https://www.zeptomail.com/)
2. Go to Settings → API Keys
3. Generate a new API key or copy an existing one
4. The token will look something like: `Zoho-enczapikey 12345...`

## Environment Setup
Set the token as an environment variable:

```bash
# For testing
export ZEPTOMAIL_TOKEN="Zoho-enczapikey your_actual_token_here"

# Or create a .env file
echo "ZEPTOMAIL_TOKEN=Zoho-enczapikey your_actual_token_here" > .env
```

## Test Script
Once you have the correct token, run:

```bash
node scripts/test-zeptomail.js
```

## Note
The token you provided appears to be a Zoho API key format, which is correct for ZeptoMail (since ZeptoMail is part of Zoho). Just make sure it's the complete token including the "Zoho-enczapikey" prefix.