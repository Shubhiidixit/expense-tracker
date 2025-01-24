import { APIGatewayEvent } from "aws-lambda";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { query } from "../utils/db";

export const handler = async (event: APIGatewayEvent) => {
    const { email, password } = JSON.parse(event.body || "{}");

    const hashedPassword = await bcrypt.hash(password, 10);
    await query("INSERT INTO users (email, password) VALUES ($1, $2)", [email, hashedPassword]);

    return {
        statusCode: 201,
        body: JSON.stringify({ message: "User registered successfully!" }),
    };
};
