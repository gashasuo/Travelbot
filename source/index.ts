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
		const ItineraryEl = document.createElement("p");
		ItineraryEl.textContent = response.data;
		GPTResponseEl!.appendChild(ItineraryEl);

		console.log(response.data);
	} catch (error: any) {
		console.log("error", error);
	}
});
