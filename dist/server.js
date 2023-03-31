var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
app.post("/post-form", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { location, numberOfAdults, numberOfChildren, numberOfDays } = req.body;
    console.log(req.body);
    const response = yield getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays);
    res.send(response);
}));
function getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user",
                        content: `Write me an itinerary for ${location}. There will be ${numberOfAdults} adult and ${numberOfChildren} children. We will be there for ${numberOfDays} days. Respond in html format but don't include <html> or <body> or <p>. `,
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
    });
}
app.listen(8000, () => {
    console.log("Listening on port 8000");
});
