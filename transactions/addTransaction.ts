import { APIGatewayEvent } from 'aws-lambda';
import { Client } from 'pg';
import * as jwt from 'jsonwebtoken';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: 5432,
};

export const handler = async (event: APIGatewayEvent) => {
    try {
        if (!event.headers || !event.headers.Authorization) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Unauthorized access' }),
            };
        }

        const token = event.headers.Authorization.replace('Bearer ', '');
        const decodedToken: any = jwt.verify(token, process.env.JWT_SECRET as string);

        const { amount, category, date } = JSON.parse(event.body || '{}');

        if (!amount || !category || !date) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Amount, category, and date are required' }),
            };
        }

        const client = new Client(dbConfig);
        await client.connect();

        const query = `
            INSERT INTO transactions (user_id, amount, category, date) 
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const values = [decodedToken.userId, amount, category, date];

        const result = await client.query(query, values);
        await client.end();

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: 'Transaction added', transaction: result.rows[0] }),
        };
    } catch (error) {
        console.error('Error adding transaction:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
