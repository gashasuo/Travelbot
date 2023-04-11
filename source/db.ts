import mysql from "mysql2/promise";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "..", ".env") });

function createPool() {
	const pool = mysql.createPool({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DATABASE_NAME,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});

	return pool;
}

export default createPool;
