"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = require("openai");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const configuration = new openai_1.Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
function getGPT3Response() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: "Say this is a test!" }],
            }, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            });
            console.log(response.data.choices[0].message.content);
        }
        catch (error) {
            console.error(error);
        }
    });
}
getGPT3Response();
