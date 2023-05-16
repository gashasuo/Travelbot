import axios, { all } from "axios";

const itineraryFormEl = document.querySelector<HTMLFormElement>(".itinerary-form");
const responseEl = document.querySelector<HTMLDivElement>(".response");
const responseContainerEl = document.querySelector<HTMLDivElement>(".responseContainer");
const loadingDivEl = document.querySelector<HTMLDivElement>(".loading")!;
const nextButtonEls: NodeListOf<HTMLButtonElement> =
	document.querySelectorAll(".button-next");
const previousButtonEls: NodeListOf<HTMLButtonElement> =
	document.querySelectorAll(".button-previous");
const itineraryButtonEl = document.querySelector<HTMLButtonElement>(".button-itinerary")!;
const buttonResetEl = document.querySelector<HTMLButtonElement>("#button-reset")!;
const logoEl = document.querySelector<HTMLHeadingElement>("#title");
const stepOneDivEl = document.querySelector<HTMLDivElement>(".step-1")!;
const locationInputEl = document.querySelector<HTMLInputElement>("#location")!;
const errorDivEl = document.querySelector<HTMLDivElement>(".error")!;
const navbarLoginEl = document.querySelector<HTMLButtonElement>("#navbar-login");
const navbarRegisterEl = document.querySelector<HTMLButtonElement>("#navbar-register");
const navbarLogoutEl = document.querySelector<HTMLButtonElement>("#navbar-logout");
const allDivEls: NodeListOf<HTMLDivElement> = document.querySelectorAll("div");
const loginContainerEl = document.querySelector<HTMLDivElement>(".loginContainer");
const registerContainerEl = document.querySelector<HTMLDivElement>(".registerContainer");
const containerDivEl = document.querySelector<HTMLDivElement>(".container");
const registerFormEl = document.querySelector<HTMLFormElement>(".register-form");
const loginFormEl = document.querySelector<HTMLFormElement>(".login-form");
const allFormEls: NodeListOf<HTMLFormElement> = document.querySelectorAll("form");
const userProfileContainerEl = document.querySelector<HTMLDivElement>(
	".userProfileContainer"
);
const userAuthContainerEl = document.querySelector<HTMLDivElement>(".userAuthContainer");
const navbarProfileButtonEl =
	document.querySelector<HTMLButtonElement>("#navbar-profile");
const savedItinerariesContainerEl = document.querySelector<HTMLDivElement>(
	".savedItinerariesContainer"
);

window.addEventListener("DOMContentLoaded", async () => {
	try {
		const url = new URL(window.location.href);
		const path = url.pathname;
		console.log("path", path);
		if (path == "/") {
			history.replaceState("home", "", "home");
		} else {
			viewHandler(path);
		}

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

itineraryFormEl!.addEventListener("submit", async (e) => {
	e.preventDefault();
	//get all the form values in one variable
	const formData = new FormData(itineraryFormEl as HTMLFormElement);
	//turn the values from formData into a javascript object
	const data = Object.fromEntries(formData);
	console.log(data);

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

		responseEl!.innerHTML = response.data;
		loadingDivEl.classList.remove("active");
		responseContainerEl!.classList.add("active");

		console.log(response.data);
	} catch (error: any) {
		console.log("error", error);
	}
});

registerFormEl!.addEventListener("submit", async (e) => {
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
		itineraryFormEl?.classList.add("active");
		stepOneDivEl.classList.add("active");
		userAuthContainerEl!.classList.remove("active");
		userProfileContainerEl!.classList.add("active");
		navbarProfileButtonEl!.innerText = response.data.username;
	} catch (error) {
		console.log("error", error);
	}
});

loginFormEl!.addEventListener("submit", async (e) => {
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
		itineraryFormEl?.classList.add("active");
		stepOneDivEl.classList.add("active");
		userAuthContainerEl!.classList.remove("active");
		userProfileContainerEl!.classList.add("active");
		navbarProfileButtonEl!.innerText = response.data;
	} catch (error) {
		console.log("error", error);
	}
});

//click "logout" navbar button
navbarLogoutEl!.addEventListener("click", async () => {
	try {
		const response = await axios.post(
			"http://localhost:8000/logout",
			{},
			{
				withCredentials: true,
				headers: {
					"Content-Type": "application/json",
				},
			}
		);
		console.log(response.data);
		removeActiveClass();
		itineraryFormEl?.classList.add("active");
		stepOneDivEl.classList.add("active");
		userAuthContainerEl!.classList.add("active");
		userProfileContainerEl!.classList.remove("active");
	} catch (error) {
		console.log("error", error);
	}
});

//click "profile" button
navbarProfileButtonEl!.addEventListener("click", showProfile);

//
//click "next" button
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

//click "previous" button
previousButtonEls.forEach((button) => {
	button.addEventListener("click", function () {
		const currentDiv = this.parentNode?.parentNode as Element;
		const previousDiv = currentDiv.previousElementSibling;
		currentDiv.classList.remove("active");
		previousDiv?.classList.add("active");
	});
});

//click "get itinerary" button
itineraryButtonEl.addEventListener("click", () => {
	removeActiveClass();
	loadingDivEl.classList.add("active");
});

//click "logo"
logoEl!.addEventListener("click", showHome);

//click "make new itinerary" button aka reset
buttonResetEl!.addEventListener("click", () => {
	itineraryFormEl!.reset();
	removeActiveClass();
	itineraryFormEl?.classList.add("active");
	stepOneDivEl.classList.add("active");
});

//click "login" navbar button
navbarLoginEl!.addEventListener("click", showLogin);

//click "register" navbar button
navbarRegisterEl!.addEventListener("click", showRegister);

function removeActiveClass() {
	allDivEls.forEach((div) => {
		if (div.classList.contains("navbar-div")) {
			return;
		} else {
			div.classList.remove("active");
		}
	});

	allFormEls.forEach((form) => {
		form.classList.remove("active");
	});
	containerDivEl?.classList.add("active");
}

let currentState = history.state;

window.addEventListener("popstate", viewHandler);

function viewHandler(e: PopStateEvent | string) {
	if (e instanceof PopStateEvent) {
		console.log("popstate activated");
		console.log("e.state", e.state);

		switch (e.state) {
			case "login":
				currentState = "login";
				showLogin();
				break;
			case "register":
				currentState = "register";
				showRegister();
				break;
			case "profile":
				currentState = "profile";
				showProfile();
				break;
			default:
				if (e.state && e.state.startsWith("profile-")) {
					const button = document.querySelector(
						`[data-id="${e.state.split("-")[1]}"]`
					) as HTMLButtonElement;
					if (button) {
						currentState = `profile-${button.dataset.id}`;
						showProfileItems(button);
					}
				} else {
					// Default case: "home"
					currentState = "home";
					showHome();
				}
				break;
		}
	} else {
		console.log("path url", e);
		switch (e) {
			case "/login":
				currentState = "login";
				showLogin();
				break;
			case "/register":
				currentState = "register";
				showRegister();
				break;
			case "/profile":
				currentState = "profile";
				showProfile();
				break;
			default:
				if (e && e.startsWith("/profile-")) {
					currentState = "profile";
					history.replaceState("profile", "", "profile");
					showProfile();
				} else {
					// Default case: "home"
					console.log("default");
					history.replaceState("home", "", "home");
					currentState = "home";
					showHome();

					break;
				}
		}
	}
}

function showLogin() {
	if (currentState !== "login") {
		history.pushState("login", "", "login");
		currentState = "login";
	}
	console.log("history.state inside showLogin()", history.state);

	itineraryFormEl!.reset();
	removeActiveClass();
	loginContainerEl?.classList.add("active");
	loginFormEl?.classList.add("active");
}

function showRegister() {
	if (currentState !== "register") {
		history.pushState("register", "", "register");
		currentState = "register";
	}
	console.log("history.state inside showRegister()", history.state);
	itineraryFormEl!.reset();
	removeActiveClass();
	registerContainerEl?.classList.add("active");
	registerFormEl?.classList.add("active");
}

function showHome() {
	if (currentState !== "home") {
		history.pushState("home", "", "home");
		currentState = "home";
	}
	console.log("history.state inside showHome()", history.state);

	itineraryFormEl!.reset();
	removeActiveClass();
	itineraryFormEl?.classList.add("active");
	stepOneDivEl.classList.add("active");
}

async function showProfile() {
	try {
		if (currentState !== "profile") {
			history.pushState("profile", "", "profile");
			currentState = "profile";
		}
		console.log("history.state inside showProfile()", history.state);

		const response = await axios.get("http://localhost:8000/userItineraries", {
			withCredentials: true,
			headers: {
				"Content-Type": "application/json",
			},
		});
		removeActiveClass();
		savedItinerariesContainerEl?.classList.add("active");
		if (response.data.length === 0) {
			savedItinerariesContainerEl!.innerHTML =
				"<h1> You don't have any saved itineraries yet! </h1>";
		} else {
			const ul = document.createElement("ul");
			response.data.forEach(
				(itinerary: { id: number; numberOfDays: number; location: string }) => {
					const li = document.createElement("li");
					li.classList.add("itineraryListItem");
					li.innerHTML = `<button class="itineraryListButton" data-id=${itinerary.id}> ${itinerary.location}</button> - ${itinerary.numberOfDays} day itinerary`;
					ul.appendChild(li);

					// attach click event listener to button
					const button = li.querySelector(".itineraryListButton") as HTMLButtonElement;
					button.addEventListener("click", () => {
						showProfileItems(button);
					});
				}
			);
			savedItinerariesContainerEl!.innerHTML = "";
			savedItinerariesContainerEl?.appendChild(ul);
		}
	} catch (error) {
		console.log(error);
	}
}

async function showProfileItems(button: HTMLButtonElement) {
	try {
		if (currentState !== `profile-${button.dataset.id}`) {
			history.pushState(
				`profile-${button.dataset.id}`,
				"",
				`profile-${button.dataset.id}`
			);
			currentState = `profile-${button.dataset.id}`;
		}
		console.log("history.state inside showProfileItems()", history.state);

		const id: number = parseInt(button.dataset.id!);
		console.log(id);
		const response = await axios.post(
			"http://localhost:8000/getSavedItinerary",
			{ id },
			{
				withCredentials: true,
			}
		);
		savedItinerariesContainerEl!.innerHTML = response.data[0][0].itinerary;
	} catch (error) {
		console.log(error);
	}
}
