import axios from "axios";
import google from "@googlemaps/js-api-loader";

console.log("hello ");

const formEl = document.querySelector<HTMLFormElement>(".form");
const GPTResponseEl = document.querySelector<HTMLDivElement>(".response");
const loadingDivEl: HTMLDivElement = document.querySelector(".loading")!;
const nextButtonEls = document.getElementsByClassName("button-next");
const previousButtonEls = document.getElementsByClassName("button-previous");
const itineraryButtonEl: HTMLButtonElement = document.querySelector(".button-itinerary")!;

formEl!.addEventListener("submit", async (e) => {
	e.preventDefault();
	//get all the form values in one variable
	const formData = new FormData(formEl as HTMLFormElement);
	//turn the values from formData into a javascript object
	const data = Object.fromEntries(formData);
	console.log(data);

	try {
		const response = await axios.post(
			"http://localhost:8000/post-form",
			//convert the javascript object to JSON
			JSON.stringify(data),
			{
				headers: { "Content-Type": "application/json" },
			}
		);
		GPTResponseEl!.innerHTML = response.data;
		loadingDivEl.classList.remove("active");
		GPTResponseEl!.classList.add("active");

		console.log(response.data);
	} catch (error: any) {
		console.log("error", error);
	}
});

//click "next" button
Array.prototype.forEach.call(nextButtonEls, function (button: HTMLButtonElement) {
	button.addEventListener("click", function () {
		const currentDiv = this.parentNode?.parentNode as Element;
		const nextDiv = currentDiv.nextElementSibling;
		currentDiv.classList.remove("active");
		nextDiv?.classList.add("active");
	});
});

//click "previous" button
Array.prototype.forEach.call(previousButtonEls, function (button: HTMLButtonElement) {
	button.addEventListener("click", function () {
		const currentDiv = this.parentNode?.parentNode as Element;
		const previousDiv = currentDiv.previousElementSibling;
		currentDiv.classList.remove("active");
		previousDiv?.classList.add("active");
	});
});

//click "get itinerary" button
itineraryButtonEl.addEventListener("click", (event) => {
	const currentDiv: HTMLElement | null = (event.currentTarget as Element).parentNode
		?.parentNode as HTMLElement | null;
	currentDiv?.classList.remove("active");
	formEl!.classList.remove("active");
	loadingDivEl.classList.add("active");
});
