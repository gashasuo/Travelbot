import axios, { all } from "axios";

const itineraryFormEl = document.querySelector<HTMLFormElement>(".itinerary-form");
const ResponseEl = document.querySelector<HTMLDivElement>(".response");
const ResponseContainerEl = document.querySelector<HTMLDivElement>(".responseContainer");
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

window.onload = async () => {
	try {
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
};

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

		ResponseEl!.innerHTML = response.data;
		loadingDivEl.classList.remove("active");
		ResponseContainerEl!.classList.add("active");

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
navbarProfileButtonEl!.addEventListener("click", async () => {
	try {
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
			response.data.forEach((itinerary: { numberOfDays: number; location: string }) => {
				const li = document.createElement("li");
				li.innerHTML = `${itinerary.numberOfDays} day itinerary for <button>${itinerary.location}</button>`;
				ul.appendChild(li);
			});
			savedItinerariesContainerEl!.innerHTML = "";
			savedItinerariesContainerEl?.appendChild(ul);
		}
	} catch (error) {
		console.log(error);
	}
});

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
logoEl!.addEventListener("click", () => {
	itineraryFormEl!.reset();
	removeActiveClass();
	itineraryFormEl?.classList.add("active");
	stepOneDivEl.classList.add("active");
});

//click "make new itinerary" button aka reset
buttonResetEl!.addEventListener("click", () => {
	itineraryFormEl!.reset();
	removeActiveClass();
	itineraryFormEl?.classList.add("active");
	stepOneDivEl.classList.add("active");
});

//click "login" navbar button
navbarLoginEl!.addEventListener("click", () => {
	itineraryFormEl!.reset();
	removeActiveClass();
	loginContainerEl?.classList.add("active");
	loginFormEl?.classList.add("active");
});

//click "register" navbar button
navbarRegisterEl!.addEventListener("click", () => {
	itineraryFormEl!.reset();
	removeActiveClass();
	registerContainerEl?.classList.add("active");
	registerFormEl?.classList.add("active");
});

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
