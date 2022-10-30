import { Vraag } from "../shared/models/vraag";
import { Antwoord } from "../shared/models/antwoord"
import { HtmlElement } from "../../../../node_modules/html-validate/build/shim";

const requiredMessage = "Dit veld is verplicht!"

/**
 * Helper function for POSTing data as JSON with fetch.
 * @param {Object} options
 * @param {string} options.url - URL to POST data to
 * @param {FormData} options.formData - `FormData` instance
 * @param method Http/REST method to use to send data: GET, POST, DELETE etc. (default: POST)
 * @return {Object} - Response body from URL that was POSTed to
 * Bron: https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
 */
 async function postFormDataAsJson({ url, formData }, method = 'POST') {
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

	const response = await fetch(url, fetchOptions);

	if (!response.ok) {
		const errorMessage = await response.text();
		throw new Error(errorMessage);
	}

	return response.json();
}

/**
 * Event handler for a form submit event.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 * @param {SubmitEvent} event
 * Bron: https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
 */
 async function handleFormSubmit<T>(event) {
	console.log('handleFormSubmit')
	event.preventDefault()

	const form = event.currentTarget
	const url = form.action

	const formData = new FormData(form);
	const responseData = await postFormDataAsJson({ url, formData })
	console.log({ responseData })
	const response = responseData as T
	if (response==null) {
		throw new Error(`Response is niet van verwachte type.`)
	}
	return responseData as T
}

const vraagForm = document.getElementById("vraag-form")
vraagForm.addEventListener("submit", async (event) => {
	
	const result = await handleFormSubmit<Vraag>(event)
	voegVraagToe(result)

	// Wissen vraag uit input veld na toevoegen
	let vraag = <HTMLInputElement> document.getElementById('vraagTekst')
	vraag.value = ''
})

const antwoordForm = document.getElementById("antwoord-form")
antwoordForm.addEventListener("submit", async (event) => {
	const result = await handleFormSubmit<Antwoord>(event)
	voegAntwoordToe(result)
})

let huidigeVraagId = ''
let vragen: Array<Vraag> = []
let antwoorden: Array<Antwoord> = []

/**
 * Maak element leeg
 * Bron: https://stackoverflow.com/questions/16434773/raw-javascript-equivalent-to-jquery-empty#answer-16435191
 */
function clearChildren(element: HtmlElement) {
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

function haalAntwoordenOp(vraagId: string) {
	const antwoordenKop = document.getElementById('antwoordenKop')
	const antwoordenStatus = document.getElementById('antwoordenStatus')
	antwoordenStatus.innerText = 'Ophalen...'

	fetch(`/api/antwoorden/${vraagId}`)
	.then(response => response.json())
	.then(data => { console.log(`Antwoorden vraag '${vraagId}': `, data); return data} )
	.then(data => {
		antwoorden = data.antwoorden
		clearChildren(antwoordenLijst)
		antwoordenStatus.innerText = ''
		if (!antwoorden || antwoorden.length<1) {
			antwoordenStatus.innerText = "Er zijn nog geen antwoorden voor deze vraag"
		} else {
			antwoorden.forEach(a => {
				voegAntwoordToe(a)			
			})
		}
	})
}

const vragenLijst = document.getElementById('vragen')x
const antwoordenLijst = document.getElementById('antwoorden')

function voegVraagToe(v: Vraag) {
	const li = document.createElement('li')
	li.textContent = v.vraagTekst
	li.setAttribute('id', v.id)
	vragenLijst.appendChild(li)
	document.getElementById(v.id).insertAdjacentHTML("afterbegin", '<i class="fa fa-trash fa-small" aria-hidden="true">&nbsp;')

	// Maak elke vraag selecteerbaar door op het list item te klikken te klikken.
	maakVraagSelecteerbaar(li, v);
}

function voegAntwoordToe(a: Antwoord) {
	const li = document.createElement('li')
	li.textContent = a.antwoordTekst
	li.setAttribute('id', a.id)
	antwoordenLijst.appendChild(li)
	document.getElementById(a.id).insertAdjacentHTML("afterbegin",
		'<i class="fa fa-check fa-small" aria-hidden="true"></i>&nbsp;' +
		'<i class="fa-exclamation-triangle fa-small" aria-hidden="true"></i>&nbsp;' +
		'<i class="fa fa-face-thinking fa-small aria-hidden="true"></i>&nbsp;')
}


function maakVraagSelecteerbaar(li: Element, vraag: Vraag) {
	li.addEventListener('click', event => {
		selecteerAlsHuidigeVraag(vraag)
	});
}

function selecteerAlsHuidigeVraag(vraag: Vraag) {
	// Markeer nieuwe vraag.
	const vraagId = vraag.id
	document.getElementById(vraagId).setAttribute('class', 'active');

	// Haal markering van vorige vraag af (mits anders)
	if (vraag.id!==huidigeVraagId) {
		let oudeVraagLi = document.getElementById(huidigeVraagId);
		oudeVraagLi.classList.remove('active')
	}
	huidigeVraagId = vraagId;
	(<HTMLInputElement> document.getElementById('huidigeVraagId')).value = vraagId;
	(<HTMLInputElement> document.getElementById('huidigeVraagTekst')).value = vraag.vraagTekst;
	haalAntwoordenOp(vraagId)
}

// TODO: UI Uitbreiden met lessen, en alleen vragen voor huidige les laten zien.
function haalVragenOp() {
	const vragenKop = document.getElementById('vragenKop');
	const vragenStatus = document.getElementById('vragenStatus')
	vragenStatus.innerText = 'Ophalen...'

	fetch('/api/vragen')
	.then(response => response.json())
	.then(data => { console.log(data); return data} )
	.then(data => {
		vragen = data.vragen;
		vragenStatus.innerText = ''
		if (vragen && vragen.length>=1) {
			huidigeVraagId = vragen[0].id
		} else {
			vragenKop.insertAdjacentHTML("afterend", "<p>Nog geen vragen.</p>")
		}
		vragen.forEach(v => {
			voegVraagToe(v)			
		})
	})
}

haalVragenOp()
