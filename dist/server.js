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
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: "lax",
        secure: false,
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
//after login, store the user's id to sessions
passport.serializeUser(async (user, done) => {
    console.log("called serializeUser");
    done(null, user.id);
});
//when you need to grab something from sessions, use the id from sessions to grab the full user object from the database which is saved in req.user
passport.deserializeUser(async (id, done) => {
    try {
        console.log("called deserializeuser");
        // console.log(id);
        const connection = await sqlConnection();
        const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);
        const user = rows[0];
        // console.log("deserialize user", user);
        if (user) {
            return done(null, user);
        }
        connection.end();
    }
    catch (error) {
        console.log(error);
        return done(error, false);
    }
});
app.use(passport.initialize());
app.use(passport.session());
app.use("/checkSession", (req, res) => {
    try {
        console.log("isauthenticated in CheckSession", req.isAuthenticated());
        if (req.isAuthenticated()) {
            console.log("req.user", req.user);
            return res.send(req.user.username.toString());
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
        console.log("in post-form isauthenticated", req.isAuthenticated());
        console.log(req.user);
        const response = await getGPT3Response(location, numberOfAdults, numberOfChildren, numberOfDays);
        if (req.isAuthenticated()) {
            console.log(req.user);
            saveItinerary(response, location, numberOfDays, req.user.id);
        }
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
app.get("/userItineraries", async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            console.log(req.user.id);
            const connection = await sqlConnection();
            const [rows] = await connection.execute("SELECT * FROM itineraries WHERE user_id = (?)", [req.user.id]);
            const itineraries = rows;
            res.send(itineraries);
        }
    }
    catch (error) {
        console.log(error);
    }
});
app.post("/getSavedItinerary", async (req, res) => {
    try {
        if (!req.isAuthenticated()) {
            return res.send("user not logged in");
        }
        const connection = await sqlConnection();
        const [rows] = await connection.execute("SELECT * FROM itineraries WHERE id = (?)", [
            req.body.id,
        ]);
        res.send([rows]);
    }
    catch (error) {
        console.log(error);
    }
});
app.post("/deleteSavedItinerary", async (req, res) => {
    try {
        console.log(req.body.id);
        const connection = await sqlConnection();
        await connection.execute("DELETE FROM itineraries WHERE id = (?)", [req.body.id]);
        res.send("deleted itinerary");
    }
    catch (error) {
        console.log("error", error);
    }
});
app.post("/logout", (req, res) => {
    try {
        req.logOut((err) => {
            if (err) {
                return err;
            }
            return res.send({ message: "logout", authenticated: req.isAuthenticated() });
        });
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
async function saveItinerary(itinerary, location, numberOfDays, user_id) {
    try {
        const [rows] = await connection.execute("INSERT INTO itineraries (itinerary, location, numberOfDays, user_id) VALUES (?, ?, ?, ?)", [itinerary, location, numberOfDays, user_id]);
        console.log("itinerary saved to database");
    }
    catch (error) {
        console.log(error);
    }
}
app.listen(8000, () => {
    console.log("Listening on port 8000");
});
