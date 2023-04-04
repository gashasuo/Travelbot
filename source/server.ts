import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import express from "express";
import path from "path";
import cors from "cors";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "..", ".env") });

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.use(cors());
app.use(express.json());

app.post("/post-form", async (req, res) => {
	const { location, numberOfAdults, numberOfChildren, numberOfDays } = req.body;
	console.log(req.body);
	const response = await getGPT3Response(
		location,
		numberOfAdults,
		numberOfChildren,
		numberOfDays
	);
	res.send(response);
});

async function getGPT3Response(
	location: string,
	numberOfAdults: number,
	numberOfChildren: number,
	numberOfDays: number
) {
	try {
		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-3.5-turbo",
				messages: [
					{
						role: "user",
						content: `Write me a ${numberOfDays} day itinerary for ${location} with ${numberOfAdults} adult(s) and ${numberOfChildren} children. Recommend specific restaurants when possible. Respond in html format but don't include <html> or <body> or <p>. Only use <h2>, <h3>, <ul>, <li>, <a>. For <a> set target="_blank"`,
					},
				],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		);
		console.log(response.data.choices[0].message.content);
		return response.data.choices[0].message.content;
	} catch (error) {
		console.error(error);
	}
}

app.listen(8000, () => {
	console.log("Listening on port 8000");
});
