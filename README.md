# Airtable Random Row Deleter

An automation service that deletes a random row from an Airtable table via HTTP API.

## Features

- Connects to Airtable using Personal Access Token (PAT)
- Fetches all records from a specified table
- Randomly selects and deletes one record
- Provides detailed response with deleted record information
- Error handling for common issues (permissions, empty tables, etc.)

## Setup

### Environment Variables

Set the following environment variables:

- `AIRTABLE_PAT` - Your Airtable Personal Access Token (must have `data.records:write` scope)
- `AIRTABLE_BASE_ID` - Your Airtable Base ID (starts with "app")
- `AIRTABLE_TABLE_NAME` - Name of the table to delete records from
- `PORT` - Server port (optional, defaults to 3000)

### Creating an Airtable Personal Access Token

1. Go to https://airtable.com/create/tokens
2. Create a new token with the following settings:
   - Scopes: `data.records:write` (this includes read and delete permissions)
   - Access: Select your specific base
3. Copy the token (starts with "pat")

### Finding Your Base ID

1. Go to https://airtable.com/developers/web/api/introduction
2. Select your base
3. Your Base ID will be displayed (starts with "app")

## API Endpoints

### `GET /`
Returns service information and available endpoints.

### `GET /healthz`
Health check endpoint - returns service status.

### `GET /version`
Returns service version information.

### `POST /delete-random`
Deletes a random record from the configured Airtable table.

**Response (Success):**
```json
{
  "success": true,
  "message": "Random record deleted successfully",
  "deleted_record": {
    "id": "recXXXXXXXXXXXXXXX",
    "fields": { ... },
    "created_time": "2023-01-01T00:00:00.000Z"
  },
  "total_records_before_deletion": 42
}
```

**Response (Error):**
```json
{
  "error": "Error description",
  "details": "Additional error details"
}
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set environment variables in a `.env` file
4. Run in development mode: `npm run dev`
5. Build for production: `npm run build`
6. Start production server: `npm start`

## Deployment

This service is designed to be deployed as a web service on platforms like Render, Heroku, or similar.

### Required Build Commands
- Build: `npm install && npm run build`
- Start: `npm start`

## Security Notes

- Never commit your Airtable Personal Access Token to version control
- Use environment variables for all sensitive configuration
- Ensure your PAT has minimal required permissions
- Consider rate limiting in production environments

## Error Handling

The service handles common error scenarios:
- Missing environment variables
- Invalid or insufficient token permissions
- Empty tables (no records to delete)
- Network connectivity issues
- Airtable API rate limits