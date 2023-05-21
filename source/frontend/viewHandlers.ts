import {
	itineraryFormEl,
	registerFormEl,
	stepOneDivEl,
	userAuthContainerEl,
	userProfileContainerEl,
	registerContainerEl,
	loginContainerEl,
	loginFormEl,
	savedItinerariesContainerEl,
} from "./index";
import axios from "axios";
import removeActiveClass from "./utils";

export let currentState = history.state;

export function historyHandler(e: PopStateEvent | string) {
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

export function showRegister() {
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

export function showHome() {
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

export function showLogin() {
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

export async function showProfile() {
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
					li.innerHTML = `<button class="itineraryListButton" data-id=${itinerary.id}> ${itinerary.location}</button> - ${itinerary.numberOfDays} day itinerary <i class=" fa-solid fa-trash-can trash-can"  data-id=${itinerary.id} ></i>`;

					li.childNodes[2].addEventListener("click", (e) => {
						const id = (e.target as HTMLElement).getAttribute("data-id")!;
						console.log(id);
						console.log("clicked trashcan");
						deleteSavedItinerary(parseInt(id));
						const liElement = (e.target as HTMLElement).closest("li");
						if (liElement) {
							liElement.remove();
						}
					});

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

async function deleteSavedItinerary(id: number) {
	const response = await axios.post(
		"http://localhost:8000/deleteSavedItinerary",
		{ id },
		{
			withCredentials: true,
		}
	);
	console.log(response);
}

export async function showProfileItems(button: HTMLButtonElement) {
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

export async function userLogout() {
	try {
		console.log("clicked logout");
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
}
