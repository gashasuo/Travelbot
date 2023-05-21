import axios, { all } from "axios";
import {
	handleItineraryFormSubmit,
	handleRegisterFormSubmit,
	handleloginFormSubmit,
} from "./formHandlers";

import {
	showHome,
	historyHandler,
	showRegister,
	showLogin,
	showProfile,
	userLogout,
} from "./viewHandlers";

export const itineraryFormEl =
	document.querySelector<HTMLFormElement>(".itinerary-form")!;
export const responseEl = document.querySelector<HTMLDivElement>(".response");
export const responseContainerEl =
	document.querySelector<HTMLDivElement>(".responseContainer")!;
export const loadingDivEl = document.querySelector<HTMLDivElement>(".loading")!;
const nextButtonEls: NodeListOf<HTMLButtonElement> =
	document.querySelectorAll(".button-next");
const previousButtonEls: NodeListOf<HTMLButtonElement> =
	document.querySelectorAll(".button-previous");
const itineraryButtonEl = document.querySelector<HTMLButtonElement>(".button-itinerary")!;
const buttonResetEl = document.querySelector<HTMLButtonElement>("#button-reset")!;
const logoEl = document.querySelector<HTMLHeadingElement>("#title");
export const stepOneDivEl = document.querySelector<HTMLDivElement>(".step-1")!;
const locationInputEl = document.querySelector<HTMLInputElement>("#location")!;
const errorDivEl = document.querySelector<HTMLDivElement>(".error")!;
const navbarLoginEl = document.querySelector<HTMLButtonElement>("#navbar-login");
const navbarRegisterEl = document.querySelector<HTMLButtonElement>("#navbar-register");
const navbarLogoutEl = document.querySelector<HTMLButtonElement>("#navbar-logout");
export const allDivEls: NodeListOf<HTMLDivElement> = document.querySelectorAll("div");
export const loginContainerEl = document.querySelector<HTMLDivElement>(".loginContainer");
export const registerContainerEl =
	document.querySelector<HTMLDivElement>(".registerContainer");
export const containerDivEl = document.querySelector<HTMLDivElement>(".container")!;
export const registerFormEl = document.querySelector<HTMLFormElement>(".register-form")!;
export const loginFormEl = document.querySelector<HTMLFormElement>(".login-form")!;
export const allFormEls: NodeListOf<HTMLFormElement> = document.querySelectorAll("form");
export const userProfileContainerEl = document.querySelector<HTMLDivElement>(
	".userProfileContainer"
)!;
export const userAuthContainerEl =
	document.querySelector<HTMLDivElement>(".userAuthContainer")!;
export const navbarProfileButtonEl =
	document.querySelector<HTMLButtonElement>("#navbar-profile")!;
export const savedItinerariesContainerEl = document.querySelector<HTMLDivElement>(
	".savedItinerariesContainer"
);

window.addEventListener("DOMContentLoaded", async () => {
	try {
		//checks url on load to direct to correct view
		const url = new URL(window.location.href);
		const path = url.pathname;
		console.log("path", path);
		if (path == "/") {
			history.replaceState("home", "", "home");
		} else {
			historyHandler(path);
		}

		//checks on load for a user session
		const response = await axios.get("http://localhost:8000/checkSession", {
			withCredentials: true,
		});
		if (response.data) {
			userAuthContainerEl!.classList.remove("active");
			userProfileContainerEl!.classList.add("active");
			navbarProfileButtonEl!.innerText = response.data;
		} else {
			console.log("no response from get request");
		}
	} catch (error) {
		console.log("error", error);
	}
});

window.addEventListener("popstate", historyHandler);

//submit itinerary form
itineraryFormEl!.addEventListener("submit", (e) => handleItineraryFormSubmit(e));

//submit user register form
registerFormEl!.addEventListener("submit", (e) => handleRegisterFormSubmit(e));

//submit user login form
loginFormEl!.addEventListener("submit", (e) => handleloginFormSubmit(e));

//click "logo"
logoEl!.addEventListener("click", showHome);

//click "make new itinerary" button aka reset
buttonResetEl!.addEventListener("click", showHome);

//click "login" navbar button
navbarLoginEl!.addEventListener("click", showLogin);

//click "register" navbar button
navbarRegisterEl!.addEventListener("click", showRegister);

//click "profile" button
navbarProfileButtonEl!.addEventListener("click", showProfile);

//click "logout" navbar button
navbarLogoutEl!.addEventListener("click", userLogout);

//click "next" button in itinerary form
nextButtonEls.forEach((button) => {
	button.addEventListener("click", function (event) {
		errorDivEl.innerHTML = "";
		if (locationInputEl.value == "") {
			event.preventDefault();
			const h2El = document.createElement("h2");
			h2El.textContent = "Please enter a location";
			errorDivEl.append(h2El);
			return;
		}
		const currentDiv = this.parentNode?.parentNode as Element;
		const nextDiv = currentDiv.nextElementSibling;
		currentDiv.classList.remove("active");
		nextDiv?.classList.add("active");
	});
});

//click "previous" button in itinerary form
previousButtonEls.forEach((button) => {
	button.addEventListener("click", function () {
		const currentDiv = this.parentNode?.parentNode as Element;
		const previousDiv = currentDiv.previousElementSibling;
		currentDiv.classList.remove("active");
		previousDiv?.classList.add("active");
	});
});
