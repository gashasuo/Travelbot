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
						content: `Write me an itinerary for ${location}. There will be ${numberOfAdults} adult and ${numberOfChildren} children. We will be there for ${numberOfDays} days.`,
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
