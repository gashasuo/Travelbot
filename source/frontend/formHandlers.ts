import axios from "axios";
import removeActiveClass from "./utils";

import {
	itineraryFormEl,
	responseEl,
	loadingDivEl,
	responseContainerEl,
	registerFormEl,
	stepOneDivEl,
	userAuthContainerEl,
	userProfileContainerEl,
	navbarProfileButtonEl,
	loginFormEl,
} from "./index";

export async function handleItineraryFormSubmit(e: Event) {
	e.preventDefault();
	//get all the form values in one variable
	const formData = new FormData(itineraryFormEl as HTMLFormElement);
	//turn the values from formData into a javascript object
	const data = Object.fromEntries(formData);
	console.log(data);

	removeActiveClass();
	loadingDivEl.classList.add("active");

	try {
		const response = await axios.post(
			"http://localhost:8000/post-form",
			//convert the javascript object to JSON
			JSON.stringify(data),
			{
				withCredentials: true,
				headers: { "Content-Type": "application/json" },
			}
		);
		removeActiveClass();
		if (responseEl) {
			responseEl.innerHTML = response.data;
		}
		loadingDivEl.classList.remove("active");
		responseContainerEl!.classList.add("active");
		console.log(response.data);
	} catch (error: any) {
		console.log("Error:", error.message);
	}
}

export async function handleRegisterFormSubmit(e: Event) {
	e.preventDefault();
	const formData = new FormData(registerFormEl as HTMLFormElement);
	const data = Object.fromEntries(formData);
	console.log(data);

	try {
		const response = await axios.post(
			"http://localhost:8000/register",
			JSON.stringify(data),
			{
				withCredentials: true,
				headers: { "Content-Type": "application/json" },
			}
		);
		console.log(response.data);
		removeActiveClass();
		itineraryFormEl.classList.add("active");
		stepOneDivEl.classList.add("active");
		userAuthContainerEl!.classList.remove("active");
		userProfileContainerEl!.classList.add("active");
		navbarProfileButtonEl!.innerText = response.data.username;
	} catch (error) {
		console.log("error", error);
	}
}

export async function handleloginFormSubmit(e: Event) {
	e.preventDefault();
	const formData = new FormData(loginFormEl as HTMLFormElement);
	const data = Object.fromEntries(formData);
	console.log(data);

	try {
		const response = await axios.post(
			"http://localhost:8000/login",
			JSON.stringify(data),
			{
				withCredentials: true,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Content-Type": "application/json",
				},
			}
		);
		removeActiveClass();
		itineraryFormEl.classList.add("active");
		stepOneDivEl.classList.add("active");
		userAuthContainerEl!.classList.remove("active");
		userProfileContainerEl!.classList.add("active");
		navbarProfileButtonEl!.innerText = response.data;
	} catch (error) {
		console.log("error", error);
	}
}
