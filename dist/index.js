var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
console.log("index.js");
const form = document.querySelector("form");
form.addEventListener("submit", (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const formData = new FormData(form);
    try {
        const response = yield axios.post("http://localhost:8000/post-form", formData, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        });
        console.log(response);
    }
    catch (error) {
        console.log("error", error);
    }
}));
