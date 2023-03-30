import axios from "axios";

console.log("hello ");

const formEl = document.querySelector<HTMLFormElement>(".form");
const GPTResponseEl = document.querySelector<HTMLDivElement>(".response");

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
		const ItineraryEl = document.createElement("div");
		ItineraryEl.innerHTML = response.data;
		GPTResponseEl!.appendChild(ItineraryEl);

		console.log(response.data);
	} catch (error: any) {
		console.log("error", error);
	}
});

const nextButtonEls = document.getElementsByClassName("button-next");

Array.prototype.forEach.call(nextButtonEls, function (button: HTMLButtonElement) {
	button.addEventListener("click", function () {
		const currentDiv = this.parentNode?.parentNode as Element;
		const nextDiv = currentDiv.nextElementSibling;
		currentDiv.classList.remove("active");
		nextDiv?.classList.add("active");
	});
});

const previousButtonEls = document.getElementsByClassName("button-previous");

Array.prototype.forEach.call(previousButtonEls, function (button: HTMLButtonElement) {
	button.addEventListener("click", function () {
		const currentDiv = this.parentNode?.parentNode as Element;
		const previousDiv = currentDiv.previousElementSibling;
		currentDiv.classList.remove("active");
		previousDiv?.classList.add("active");
	});
});
