// app.js

const express = require('express');
const pool = require('./db/connection.js'); // Import the PostgreSQL connection pool
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(
	cors({
		origin: 'http://localhost:3001', // Allow requests from this origin
		methods: ['GET', 'POST'], // Allow only GET and POST requests
		allowedHeaders: ['Content-Type'], // Allow the Content-Type header
	})
);

// Route to fetch all words
app.get('/words', async (req, res) => {
	try {
		const client = await pool.connect();
		const result = await client.query('SELECT * FROM "WORDS"');
		client.release(); // release the client back to the pool

		let words = res.json(result.rows);
		console.log(words);
	} catch (err) {
		console.error('Error executing query', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
