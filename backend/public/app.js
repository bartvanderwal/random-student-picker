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
        console.log('handleFormSubmit');
        event.preventDefault();
        const form = event.currentTarget;
        const url = form.action;
        try {
            const formData = new FormData(form);
            const responseData = yield postFormDataAsJson({ url, formData });
            console.log({ responseData });
            return responseData;
        }
        catch (error) {
            console.error(error);
        }
    });
}
const vraagForm = document.getElementById("vraag-form");
vraagForm.addEventListener("submit", (event) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield handleFormSubmit(event);
    voegVraagToe({ id: result.id, vraagTekst: result.vraagTekst });
    let vraag = document.getElementById('vraagTekst');
    vraag.value = '';
}));
let huidigeVraagId = '';
let vragen = [];
let antwoorden = [];
class ClearableHTMLElement extends HTMLElement {
    clear(el) {
        while (this.lastChild) {
            this.removeChild(this.lastChild);
        }
    }
}
ClearableHTMLElement.prototype.clearChildren = (el) => {
    const element = el;
    while (element.lastChild) {
        element.removeChild(element.lastChild);
    }
};
function haalAntwoordenOp(vraagId) {
    const antwoordenKop = document.getElementById('antwoordenKop');
    const antwoordenLijst = document.getElementById('antwoorden');
    document.getElementById('antwoordenLoading').innerText = 'Ophalen...';
    fetch(`/api/antwoorden/${vraagId}`)
        .then(response => response.json())
        .then(data => { console.log(`Antwoorden vraag '${vraagId}': `, data); return data; })
        .then(data => {
        antwoorden = data.antwoorden;
        antwoordenLijst.clearChildren(antwoordenKop);
        document.getElementById('antwoordenLoading').setAttribute('style', 'display: none');
        if (!antwoorden || antwoorden.length < 1) {
            antwoordenKop.insertAdjacentHTML("afterend", "<p>Nog geen vragen.</p>");
        }
        else {
            antwoorden.forEach(a => {
                voegAntwoordToe(a);
            });
        }
    });
}
const vragenLijst = document.getElementById('vragen');
function voegVraagToe(v) {
    const li = document.createElement('li');
    li.textContent = v.vraagTekst;
    li.setAttribute('id', v.id);
    vragenLijst.appendChild(li);
    document.getElementById(v.id).insertAdjacentHTML("afterbegin", '<i class="fa fa-trash fa-small" aria-hidden="true">&nbsp;');
    maakVraagSelecteerbaar(li, v.id);
}
function voegAntwoordToe(a) {
    const li = document.createElement('li');
    li.textContent = a.antwoordTekst;
    li.setAttribute('id', a.id);
    vragenLijst.appendChild(li);
    document.getElementById(a.id).insertAdjacentHTML("afterbegin", '<i class="fa fa-check fa-small" aria-hidden="true"></i>&nbsp;' +
        '<i class="fa-exclamation-triangle fa-small" aria-hidden="true"></i>&nbsp;' +
        '<i class="fa fa-face-thinking fa-small aria-hidden="true"></i>&nbsp;');
}
function maakVraagSelecteerbaar(li, vraagId) {
    li.addEventListener('click', event => {
        const elActive = event.target;
        selecteerAlsHuidigeVraag(elActive, vraagId);
    });
}
function selecteerAlsHuidigeVraag(el, vraagId) {
    el.setAttribute('class', 'active');
    let oudeVraagLi = document.getElementById(huidigeVraagId);
    oudeVraagLi.classList.remove('active');
    huidigeVraagId = vraagId;
    haalAntwoordenOp(vraagId);
}
function haalVragenOp() {
    const vragenKop = document.getElementById('vragenKop');
    vragenKop.insertAdjacentHTML("afterend", "<p id='vragenLoading'>Ophalen...</p>");
    fetch('/api/vragen')
        .then(response => response.json())
        .then(data => { console.log(data); return data; })
        .then(data => {
        vragen = data.vragen;
        document.getElementById('vragenLoading').setAttribute('style', 'display: none');
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