import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import express from "express";
import path from "path";
import cors from "cors";
import sqlConnection from "./db.js";
import passport from "passport";
import session from "express-session";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "..", ".env") });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
app.use(session({
    secret: process.env.EXPRESS_SESSIONS_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
}));
app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
const connection = sqlConnection();
passport.use(new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
}, async (username, password, done) => {
    try {
        const connection = await sqlConnection();
        const [rows] = await connection.execute("SELECT * FROM users WHERE username = ?", [username]);
        console.log(rows);
        if (Array.isArray(rows) && rows.length === 0) {
            return done(null, false, console.log("Incorrect username or password"));
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return done(null, false, console.log("Incorrect username or password"));
        }
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
passport.serializeUser(async (user, done) => {
    done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
    try {
        const connection = await sqlConnection();
        const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);
        const user = rows[0];
        done(null, user);
    }
    catch (error) {
        console.log(error);
    }
});
app.post("/post-form", async (req, res) => {
    const { location, numberOfAdults, numberOfChildren, numberOfDays } = req.body;
    console.log(req.body);
    const response = await getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays);
    res.send(response);
});
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const connection = await sqlConnection();
        const [rows] = await connection.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);
    }
    catch (error) {
        console.log(error);
    }
    res.send(req.body);
});
app.post("/login", passport.authenticate("local"), (req, res) => {
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
