import axios from "axios";
import { connection } from "./server.js";

export async function getGPT3Response(
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
		const itineraryContent = response.data.choices[0].message.content;

		return itineraryContent;
	} catch (error) {
		console.error(error);
	}
}

export async function saveItinerary(
	itinerary: string,
	location: string,
	numberOfDays: number,
	user_id: number
) {
	try {
		const [rows] = await connection.execute(
			"INSERT INTO itineraries (itinerary, location, numberOfDays, user_id) VALUES (?, ?, ?, ?)",
			[itinerary, location, numberOfDays, user_id]
		);
		console.log("itinerary saved to database");
	} catch (error) {
		console.log(error);
	}
}
