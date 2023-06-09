import mysql from "mysql2/promise";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "..", ".env") });

export const options = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE_NAME,
};

export async function sqlConnection() {
	const connection = await mysql.createConnection(options);
	console.log("Connected to SQl database");

	return connection;
}
