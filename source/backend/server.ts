const inProd = process.env.NODE_ENV === "production";

import { Configuration, OpenAIApi } from "openai";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import { sqlConnection, options } from "./db.js";
import passport from "passport";
import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2/promise";
import { Strategy as LocalStrategy } from "passport-local";
import cookieParser from "cookie-parser";
import express from "express";
import session from "express-session";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const MySQLStore = require("express-mysql-session")(session);

import { SessionsUser } from "./backendTypes.js";
import { router } from "./routes.js";

export const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, "..", ".env") });

const configuration = new Configuration({
	apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const connection = await sqlConnection();

const sessionStore = new MySQLStore({}, connection);

app.use(
	session({
		secret: process.env.EXPRESS_SESSIONS_SECRET!,
		resave: false,
		saveUninitialized: false,
		cookie: {
			sameSite: "lax",
			secure: false,
			maxAge: 8 * 60 * 60 * 1000,
		},
		store: sessionStore,
	})
);

const corsConfig = {
	credentials: true,
	origin: true,
};

app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json());

passport.use(
	new LocalStrategy(
		{
			usernameField: "username",
			passwordField: "password",
		},
		async (username: string, password: string, done: any) => {
			try {
				const connection = await sqlConnection();
				const [rows] = await connection.execute(
					"SELECT * FROM users WHERE username = ?",
					[username]
				);
				console.log(rows);

				if (Array.isArray(rows) && rows.length === 0) {
					return done(null, false, console.log("Incorrect username or password"));
				}

				const user = (rows as RowDataPacket[])[0];

				const passwordMatch = await bcrypt.compare(password, user.password);

				if (!passwordMatch) {
					return done(null, false, console.log("Incorrect username or password"));
				}

				return done(null, user);
			} catch (error) {
				return done(error);
			}
		}
	)
);

//after login, store the user's id to sessions
passport.serializeUser(async (user: any, done) => {
	console.log("called serializeUser");
	done(null, user.id);
});

//when you need to grab something from sessions, use the id from sessions to grab the full user object from the database which is saved in req.user
passport.deserializeUser(async (id: any, done) => {
	try {
		console.log("called deserializeuser");
		// console.log(id);
		const connection = await sqlConnection();
		const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);

		const user = (rows as RowDataPacket[])[0];
		// console.log("deserialize user", user);

		if (user) {
			return done(null, user);
		}
		connection.end();
	} catch (error) {
		console.log(error);
		return done(error, false);
	}
});

app.use(passport.initialize());
app.use(passport.session());
app.use("/", router);

app.use("/checkSession", (req, res) => {
	try {
		console.log("isauthenticated in CheckSession", req.isAuthenticated());
		if (req.isAuthenticated()) {
			console.log("req.user", req.user);

			return res.send((req.user as SessionsUser).username.toString());
		}
	} catch (error) {
		console.log("error", error);
	}
});

app.listen(8000, () => {
	console.log("Listening on port 8000");
});
