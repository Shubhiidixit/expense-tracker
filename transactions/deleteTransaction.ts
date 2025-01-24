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

        const { transactionId } = JSON.parse(event.body || '{}');

        if (!transactionId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Transaction ID is required' }),
            };
        }

        const client = new Client(dbConfig);
        await client.connect();

        // Ensure transaction belongs to the authenticated user
        const checkQuery = `SELECT * FROM transactions WHERE id = $1 AND user_id = $2`;
        const checkResult = await client.query(checkQuery, [transactionId, decodedToken.userId]);

        if (checkResult.rowCount === 0) {
            await client.end();
            return {
                statusCode: 404,
                body: JSON.stringify({ error: 'Transaction not found or unauthorized' }),
            };
        }

        const deleteQuery = `DELETE FROM transactions WHERE id = $1`;
        await client.query(deleteQuery, [transactionId]);
        await client.end();

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: 'Transaction deleted successfully' }),
        };
    } catch (error) {
        console.error('Error deleting transaction:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
