import { getGPT3Response, saveItinerary } from "./backendUtils.js";
import { sqlConnection, options } from "./db.js";
import bcrypt from "bcrypt";
import passport from "passport";
import { RowDataPacket } from "mysql2/promise";
import { Router } from "express";

import { SessionsUser } from "./backendTypes.js";

export const router = Router();

router.post("/post-form", async (req, res) => {
	try {
		const { location, numberOfAdults, numberOfChildren, numberOfDays } = req.body;
		console.log(req.body);
		console.log("in post-form isauthenticated", req.isAuthenticated());
		console.log(req.user);

		const response = await getGPT3Response(
			location,
			numberOfAdults,
			numberOfChildren,
			numberOfDays
		);
		if (req.isAuthenticated()) {
			console.log(req.user);
			saveItinerary(response, location, numberOfDays, (req.user as SessionsUser).id);
		}
		res.send(response);
	} catch (error) {
		console.log("error", error);
	}
});

router.post("/register", async (req, res) => {
	const { username, email, password } = req.body;
	console.log(req.body);
	try {
		const hashedPassword = await bcrypt.hash(password, 12);
		const connection = await sqlConnection();
		const [rows] = await connection.execute(
			"INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
			[username, email, hashedPassword]
		);
		res.send(req.body);
	} catch (error) {
		console.log(error);
	}
});

router.post("/login", passport.authenticate("local"), async (req, res) => {
	console.log(req.session);
	console.log("isAuthenticated", req.isAuthenticated());
	req.session.save();
	res.send(req.body.username);
});

router.get("/userItineraries", async (req, res) => {
	try {
		if (req.isAuthenticated()) {
			console.log((req.user as SessionsUser).id);
			const connection = await sqlConnection();
			const [rows] = await connection.execute(
				"SELECT * FROM itineraries WHERE user_id = (?)",
				[(req.user as SessionsUser).id]
			);
			const itineraries = rows as RowDataPacket[];
			res.send(itineraries);
		}
	} catch (error) {
		console.log(error);
	}
});

router.post("/getSavedItinerary", async (req, res) => {
	try {
		if (!req.isAuthenticated()) {
			return res.send("user not logged in");
		}
		const connection = await sqlConnection();
		const [rows] = await connection.execute("SELECT * FROM itineraries WHERE id = (?)", [
			req.body.id,
		]);
		res.send([rows]);
	} catch (error) {
		console.log(error);
	}
});

router.post("/deleteSavedItinerary", async (req, res) => {
	try {
		console.log(req.body.id);
		const connection = await sqlConnection();
		await connection.execute("DELETE FROM itineraries WHERE id = (?)", [req.body.id]);
		res.send("deleted itinerary");
	} catch (error) {
		console.log("error", error);
	}
});

router.post("/logout", (req, res) => {
	try {
		req.logOut((err) => {
			if (err) {
				return err;
			}
			return res.send({ message: "logout", authenticated: req.isAuthenticated() });
		});
	} catch (error) {
		console.log(error);
	}
});
