import { Configuration, OpenAIApi } from "openai";
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
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/post-form", (req, res) => {
    const formData = req.body;
    console.log(req.body);
    res.send(req.body);
});
// async function getGPT3Response() {
// 	try {
// 		const response = await axios.post(
// 			"https://api.openai.com/v1/chat/completions",
// 			{
// 				model: "gpt-3.5-turbo",
// 				messages: [{ role: "user", content: "Say this is a test!" }],
// 			},
// 			{
// 				headers: {
// 					"Content-Type": "application/json",
// 					Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// 				},
// 			}
// 		);
// 		console.log(response.data.choices[0].message.content);
// 	} catch (error) {
// 		console.error(error);
// 	}
// }
// getGPT3Response();
app.listen(8000, () => {
    console.log("Listening on port 8000");
});
