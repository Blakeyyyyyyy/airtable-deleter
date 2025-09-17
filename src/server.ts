import express from 'express';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3000;

// Environment variables
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

app.use(express.json());

// Health check endpoint
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.status(200).json({ 
    name: 'airtable-deleter',
    version: '1.0.0',
    description: 'Deletes random rows from Airtable'
  });
});

// Delete random row endpoint
app.post('/delete-random', async (req, res) => {
  try {
    // Validate environment variables
    if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_NAME) {
      return res.status(500).json({
        error: 'Missing required environment variables',
        required: ['AIRTABLE_PAT', 'AIRTABLE_BASE_ID', 'AIRTABLE_TABLE_NAME']
      });
    }

    console.log('Fetching records from Airtable...');
    
    // Fetch all records from the table
    const response = await axios.get(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
        },
      }
    );

    const records = response.data.records;

    if (!records || records.length === 0) {
      return res.status(404).json({
        error: 'No records found in the table',
        table: AIRTABLE_TABLE_NAME
      });
    }

    console.log(`Found ${records.length} records`);

    // Select a random record
    const randomIndex = Math.floor(Math.random() * records.length);
    const randomRecord = records[randomIndex];

    console.log(`Deleting record: ${randomRecord.id}`);

    // Delete the selected record
    await axios.delete(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${randomRecord.id}`,
      {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_PAT}`,
        },
      }
    );

    console.log('Record deleted successfully');

    res.status(200).json({
      success: true,
      message: 'Random record deleted successfully',
      deleted_record: {
        id: randomRecord.id,
        fields: randomRecord.fields,
        created_time: randomRecord.createdTime
      },
      total_records_before_deletion: records.length
    });

  } catch (error: any) {
    console.error('Error deleting random record:', error.response?.data || error.message);
    
    if (error.response?.status === 403) {
      return res.status(403).json({
        error: 'Forbidden - check your Airtable Personal Access Token permissions',
        details: 'Ensure your PAT has "data.records:write" scope for this base'
      });
    }

    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Table not found',
        details: 'Check your base ID and table name'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.response?.data?.error || error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Airtable Random Row Deleter',
    version: '1.0.0',
    endpoints: {
      'GET /': 'This information',
      'GET /healthz': 'Health check',
      'GET /version': 'Version info',
      'POST /delete-random': 'Delete a random row from Airtable'
    },
    usage: 'POST to /delete-random to delete a random record from your Airtable table'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});