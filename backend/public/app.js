var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const requiredMessage = "Dit veld is verplicht!";
function postFormDataAsJson({ url, formData }) {
    return __awaiter(this, void 0, void 0, function* () {
        const plainFormData = Object.fromEntries(formData.entries());
        const formDataJsonString = JSON.stringify(plainFormData);
        const fetchOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: formDataJsonString,
        };
        const response = yield fetch(url, fetchOptions);
        if (!response.ok) {
            const errorMessage = yield response.text();
            throw new Error(errorMessage);
        }
        return response.json();
    });
}
function handleFormSubmit(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const form = event.currentTarget;
        const url = form.action;
        try {
            const formData = new FormData(form);
            const responseData = yield postFormDataAsJson({ url, formData });
            console.log({ responseData });
        }
        catch (error) {
            console.error(error);
        }
    });
}
const vraagForm = document.getElementById("vraag-form");
vraagForm.addEventListener("submit", handleFormSubmit);
let vragen = [];
let huidigeVraagId = '';
const vragenLijst = document.getElementById('vragen');
const vragenKop = document.getElementById('vragenKop');
fetch('/api/vragen')
    .then(response => response.json())
    .then(data => { console.log(data); return data; })
    .then(data => {
    vragen = data.vragen;
    if (vragen && vragen.length > 1) {
        huidigeVraagId = vragen[0].id;
    }
    else {
        vragenKop.insertAdjacentHTML("afterend", "Nog geen vragen");
    }
    vragen.forEach(v => {
        const li = document.createElement('li');
        li.textContent = v.vraagTekst;
        li.setAttribute('id', v.id);
        vragenLijst.appendChild(li);
        li.addEventListener('click', event => {
            const target = event.target;
            target.setAttribute('class', 'active');
            let huidigeVraag = v.id;
        });
    });
});
function haalAntwoordenOp(vraag) {
}
export {};
//# sourceMappingURL=app.js.map