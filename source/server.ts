import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

async function getGPT3Response() {
	try {
		const response = await axios.post(
			"https://api.openai.com/v1/chat/completions",
			{
				model: "gpt-3.5-turbo",
				messages: [{ role: "user", content: "Say this is a test!" }],
			},
			{
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
				},
			}
		);
		console.log(response.data.choices[0].message.content);
	} catch (error) {
		console.error(error);
	}
}

getGPT3Response();
