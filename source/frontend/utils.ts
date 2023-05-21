import { allDivEls, allFormEls, containerDivEl } from ".";

export default function removeActiveClass() {
	allDivEls.forEach((div: HTMLDivElement) => {
		if (div.classList.contains("navbar-div")) {
			return;
		} else {
			div.classList.remove("active");
		}
	});

	allFormEls.forEach((form: HTMLFormElement) => {
		form.classList.remove("active");
	});
	containerDivEl.classList.add("active");
}
