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
function postFormDataAsJson({ url, formData }, method = 'POST') {
    return __awaiter(this, void 0, void 0, function* () {
        const plainFormData = Object.fromEntries(formData.entries());
        const formDataJsonString = JSON.stringify(plainFormData);
        const fetchOptions = {
            method: method,
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
        console.log('handleFormSubmit');
        event.preventDefault();
        const form = event.currentTarget;
        const url = form.action;
        const formData = new FormData(form);
        const responseData = yield postFormDataAsJson({ url, formData });
        console.log({ responseData });
        const response = responseData;
        if (response == null) {
            throw new Error(`Response is niet van verwachte type.`);
        }
        return responseData;
    });
}
const vraagForm = document.getElementById("vraag-form");
vraagForm.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield handleFormSubmit(event);
    voegVraagToe(result);
    let vraag = document.getElementById('vraagTekst');
    vraag.value = '';
}));
const antwoordForm = document.getElementById("antwoord-form");
antwoordForm.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield handleFormSubmit(event);
    voegAntwoordToe(result);
}));
let huidigeVraagId = '';
let vragen = [];
let antwoorden = [];
function clearChildren(element) {
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
}
function haalAntwoordenOp(vraagId) {
    const antwoordenKop = document.getElementById('antwoordenKop');
    const antwoordenStatus = document.getElementById('antwoordenStatus');
    antwoordenStatus.innerText = 'Ophalen...';
    fetch(`/api/antwoorden/${vraagId}`)
        .then(response => response.json())
        .then(data => { console.log(`Antwoorden vraag '${vraagId}': `, data); return data; })
        .then(data => {
        antwoorden = data.antwoorden;
        clearChildren(antwoordenLijst);
        antwoordenStatus.innerText = '';
        if (!antwoorden || antwoorden.length < 1) {
            antwoordenStatus.innerText = "Er zijn nog geen antwoorden voor deze vraag";
        }
        else {
            antwoorden.forEach(a => {
                voegAntwoordToe(a);
            });
        }
    });
}
const vragenLijst = document.getElementById('vragen'), x;
const antwoordenLijst = document.getElementById('antwoorden');
function voegVraagToe(v) {
    const li = document.createElement('li');
    li.textContent = v.vraagTekst;
    li.setAttribute('id', v.id);
    vragenLijst.appendChild(li);
    document.getElementById(v.id).insertAdjacentHTML("afterbegin", '<i class="fa fa-trash fa-small" aria-hidden="true">&nbsp;');
    maakVraagSelecteerbaar(li, v);
}
function voegAntwoordToe(a) {
    const li = document.createElement('li');
    li.textContent = a.antwoordTekst;
    li.setAttribute('id', a.id);
    antwoordenLijst.appendChild(li);
    document.getElementById(a.id).insertAdjacentHTML("afterbegin", '<i class="fa fa-check fa-small" aria-hidden="true"></i>&nbsp;' +
        '<i class="fa-exclamation-triangle fa-small" aria-hidden="true"></i>&nbsp;' +
        '<i class="fa fa-face-thinking fa-small aria-hidden="true"></i>&nbsp;');
}
function maakVraagSelecteerbaar(li, vraag) {
    li.addEventListener('click', event => {
        selecteerAlsHuidigeVraag(vraag);
    });
}
function selecteerAlsHuidigeVraag(vraag) {
    const vraagId = vraag.id;
    document.getElementById(vraagId).setAttribute('class', 'active');
    if (vraag.id !== huidigeVraagId) {
        let oudeVraagLi = document.getElementById(huidigeVraagId);
        oudeVraagLi.classList.remove('active');
    }
    huidigeVraagId = vraagId;
    document.getElementById('huidigeVraagId').value = vraagId;
    document.getElementById('huidigeVraagTekst').value = vraag.vraagTekst;
    haalAntwoordenOp(vraagId);
}
function haalVragenOp() {
    const vragenKop = document.getElementById('vragenKop');
    const vragenStatus = document.getElementById('vragenStatus');
    vragenStatus.innerText = 'Ophalen...';
    fetch('/api/vragen')
        .then(response => response.json())
        .then(data => { console.log(data); return data; })
        .then(data => {
        vragen = data.vragen;
        vragenStatus.innerText = '';
        if (vragen && vragen.length >= 1) {
            huidigeVraagId = vragen[0].id;
        }
        else {
            vragenKop.insertAdjacentHTML("afterend", "<p>Nog geen vragen.</p>");
        }
        vragen.forEach(v => {
            voegVraagToe(v);
        });
    });
}
haalVragenOp();
export {};
//# sourceMappingURL=app.js.map