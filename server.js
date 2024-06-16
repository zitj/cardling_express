// app.js

const express = require('express');
const pool = require('./db/connection.js'); // Import the PostgreSQL connection pool
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Use CORS middleware
app.use(express.json());
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

const generateInsertQuery = (table, data) => {
	const columns = Object.keys(data).join(', ');
	const placeholders = Object.keys(data)
		.map((key, index) => `$${index + 1}`)
		.join(', ');
	const values = Object.values(data);

	return {
		text: `INSERT INTO "WORDS"(${columns}) VALUES(${placeholders}) RETURNING *`,
		values: values,
	};
};

// Usage example

app.post('/words', async (req, res) => {
	console.log('This is request body: ', req.body);
	const { text, values } = generateInsertQuery("'WORDS'", req.body);
	console.log('Generated SQL:', text);
	// console.log('Values:', values);
	try {
		const client = await pool.connect();
		const result = await client.query(text, values);
		client.release();
		res.status(201).json(result.rows[0]); // Return the inserted word data
	} catch (err) {
		console.error('Error executing query', err);
		res.status(500).json({ error: 'Internal Server Error' });
	}
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});
