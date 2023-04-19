import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import express from "express";
import path from "path";
import cors from "cors";
import sqlConnection from "./db.js";
// import session from "express-session";
// declare module "express-session" {
// 	interface SessionData {
// 		apiResponse: string;
// 	}
// }
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "..", ".env") });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const connection = sqlConnection();
async function addUsers(username, email, password) {
    try {
        const connection = await sqlConnection();
        const [rows, fields] = await connection.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password]);
        console.log(rows);
        connection.end();
    }
    catch (error) {
        console.log(error);
    }
}
// app.use(
// 	session({
// 		secret: process.env.EXPRESS_SESSIONS_SECRET!,
// 		resave: false,
// 		saveUninitialized: true,
// 		cookie: { secure: true },
// 	})
// );
app.use(cors());
app.use(express.json());
app.post("/post-form", async (req, res) => {
    const { location, numberOfAdults, numberOfChildren, numberOfDays } = req.body;
    console.log(req.body);
    const response = await getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays);
    res.send(response);
});
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    addUsers(username, email, password);
    console.log(req.body);
    res.send(req.body);
});
async function getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays) {
    try {
        const response = await axios.post("https://api.openai.com/v1/chat/completions", {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `Write me a ${numberOfDays} day itinerary for ${location} with ${numberOfAdults} adult(s) and ${numberOfChildren} children. Recommend specific restaurants when possible. Respond in html format but don't include <html> or <body> or <p>. Only use <h2>, <h3>, <ul>, <li>, <a>. For <a> set target="_blank"`,
                },
            ],
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
        });
        console.log(response.data.choices[0].message.content);
        return response.data.choices[0].message.content;
    }
    catch (error) {
        console.error(error);
    }
}
app.listen(8000, () => {
    console.log("Listening on port 8000");
});
