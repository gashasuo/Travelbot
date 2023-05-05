const inProd = process.env.NODE_ENV === "production";
import { Configuration, OpenAIApi } from "openai";
import axios from "axios";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import { sqlConnection } from "./db.js";
import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const MySQLStore = require("express-mysql-session")(session);
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, "..", ".env") });
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const connection = await sqlConnection();
const sessionStore = new MySQLStore({}, connection);
app.use(session({
    secret: process.env.EXPRESS_SESSIONS_SECRET,
    resave: true,
    saveUninitialized: true,
    proxy: true,
    cookie: {
        sameSite: `${inProd ? "none" : "lax"}`,
        secure: true,
        maxAge: 8 * 60 * 60 * 1000,
    },
    store: sessionStore,
}));
const corsConfig = {
    credentials: true,
    origin: true,
};
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());
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
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (error) {
        console.log(error);
        return done(error, false);
    }
});
app.use(passport.initialize());
app.use(passport.session());
app.use("/checkSession", (req, res, next) => {
    try {
        console.log("isauthenticaed", req.isAuthenticated());
        if (req.isAuthenticated()) {
            console.log(req.user);
            return res.send(req.user);
        }
        else {
            return res.send("no session");
        }
    }
    catch (error) {
        console.log("error", error);
    }
});
app.post("/post-form", async (req, res) => {
    try {
        const { location, numberOfAdults, numberOfChildren, numberOfDays } = req.body;
        console.log(req.body);
        console.log(req.session);
        console.log("in post-form isauthenticated", req.isAuthenticated());
        const response = await getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays);
        res.send(response);
    }
    catch (error) {
        console.log("error", error);
    }
});
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;
    console.log(req.body);
    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const connection = await sqlConnection();
        const [rows] = await connection.execute("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, hashedPassword]);
        res.send(req.body);
    }
    catch (error) {
        console.log(error);
    }
});
app.post("/login", passport.authenticate("local"), async (req, res) => {
    console.log(req.session);
    console.log("isAuthenticated", req.isAuthenticated());
    req.session.save();
    res.send(req.body.username);
});
app.post("/logout", (req, res) => {
    try {
        setTimeout(() => {
            req.logout((error) => {
                if (error) {
                    return console.log(error);
                }
                req.session.destroy(function (err) {
                    if (err) {
                        return err;
                    }
                    // The response should indicate that the user is no longer authenticated.
                    return res.send({ authenticated: req.isAuthenticated() });
                });
            });
            console.log(req.session);
        }, 1000);
    }
    catch (error) {
        console.log(error);
    }
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
        const itineraryContent = response.data.choices[0].message.content;
        return itineraryContent;
    }
    catch (error) {
        console.error(error);
    }
}
// async function saveItinerary(){
// 	if()
// 	const [rows] = await connection.execute(
// 		"INSERT INTO itineraries (itineraries, numberOfDays, user_id) VALUES (?, ?, ?)",
// 		[itineraryContent, numberOfDays, , ]
// 	);
// }
app.listen(8000, () => {
    console.log("Listening on port 8000");
});
