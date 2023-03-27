import axios, { AxiosError } from "axios";

console.log("index.js");

const form = document.querySelector<HTMLFormElement>("form");

form!.addEventListener("submit", async (e) => {
	e.preventDefault();
	const formData = new FormData(form!);
	try {
		const response = await axios.post("http://localhost:8000/post-form", formData, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});
		console.log(response);
	} catch (error: any) {
		console.log("error", error);
	}
});
