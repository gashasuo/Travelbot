import axios from "axios";

console.log("hello ");

const formEl = document.querySelector<HTMLFormElement>(".form");

formEl!.addEventListener("submit", async (e) => {
	e.preventDefault();
	const formData = new FormData(formEl as HTMLFormElement);
	const data = new URLSearchParams(formData as unknown as Record<string, string>);

	try {
		const response = await axios.post("http://localhost:8000/post-form", data, {
			headers: { Accept: "application/x-www-form-urlencoded" },
		});

		console.log(data);
	} catch (error: any) {
		console.log("error", error);
	}
});
