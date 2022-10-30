import { Vraag } from "../shared/models/vraag";
import { Antwoord } from "../shared/models/antwoord"

const requiredMessage = "Dit veld is verplicht!"

/**
 * Helper function for POSTing data as JSON with fetch.
 * @param {Object} options
 * @param {string} options.url - URL to POST data to
 * @param {FormData} options.formData - `FormData` instance
 * @return {Object} - Response body from URL that was POSTed to
 * Bron: https://simonplend.com/how-to-use-fetch-to-post-form-data-as-json-to-your-api/
 */
 async function postFormDataAsJson({ url, formData }) {
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
 async function handleFormSubmit(event) {
	console.log('handleFormSubmit')
	event.preventDefault()

	const form = event.currentTarget
	const url = form.action

	try {
		const formData = new FormData(form);
		const responseData = await postFormDataAsJson({ url, formData })
		console.log({ responseData })
		return responseData
	} catch (error) {
		console.error(error)
	}
}

const vraagForm = document.getElementById("vraag-form")
vraagForm.addEventListener("submit", async (event) => {
	
	const result = await handleFormSubmit(event);
	voegVraagToe({id: result.id, vraagTekst: result.vraagTekst})

	// Wissen vraag uit input veld na toevoegen
	let vraag = <HTMLInputElement> document.getElementById('vraagTekst')
	vraag.value = '';
})

let huidigeVraagId = ''
let vragen: Array<Vraag> = []
let antwoorden: Array<Antwoord> = []

// Bronnen: 
// - https://stackoverflow.com/questions/16434773/raw-javascript-equivalent-to-jquery-empty#answer-16435191
// - https://stackoverflow.com/questions/51679889/extend-htmlelement-prototype
class ClearableHTMLElement extends HTMLElement {
	clear(el: ClearableHTMLElement) {
		while (this.lastChild) {
			this.removeChild(this.lastChild);
		}
	}
}

declare global {
	interface HTMLElement {
    	clearChildren(el: ClearableHTMLElement): void
	}
}
ClearableHTMLElement.prototype.clearChildren = (el: ClearableHTMLElement) => {
	const element = el // this as Element
	while (element.lastChild) {
		element.removeChild(element.lastChild);
	}
}

function haalAntwoordenOp(vraagId: string) {
	const antwoordenKop = document.getElementById('antwoordenKop') as ClearableHTMLElement;
	const antwoordenLijst = document.getElementById('antwoorden')
	document.getElementById('antwoordenLoading').innerText = 'Ophalen...'

	fetch(`/api/antwoorden/${vraagId}`)
	.then(response => response.json())
	.then(data => { console.log(`Antwoorden vraag '${vraagId}': `, data); return data} )
	.then(data => {
		antwoorden = data.antwoorden
		antwoordenLijst.clearChildren(antwoordenKop)
		document.getElementById('antwoordenLoading').setAttribute('style', 'display: none')
		if (!antwoorden || antwoorden.length<1) {
			antwoordenKop.insertAdjacentHTML("afterend", "<p>Nog geen vragen.</p>")
		} else {
			antwoorden.forEach(a => {
				voegAntwoordToe(a)			
			})
		}
	})
}

const vragenLijst = document.getElementById('vragen');

function voegVraagToe(v: Vraag) {
	const li = document.createElement('li')
	li.textContent = v.vraagTekst
	li.setAttribute('id', v.id)
	vragenLijst.appendChild(li)
	document.getElementById(v.id).insertAdjacentHTML("afterbegin", '<i class="fa fa-trash fa-small" aria-hidden="true">&nbsp;')
	// Maak elke vraag selecteerbaar door op het list item te klikken te klikken.
	maakVraagSelecteerbaar(li, v.id);
}

function voegAntwoordToe(a: Antwoord) {
	const li = document.createElement('li')
	li.textContent = a.antwoordTekst
	li.setAttribute('id', a.id)
	vragenLijst.appendChild(li)
	document.getElementById(a.id).insertAdjacentHTML("afterbegin",
		'<i class="fa fa-check fa-small" aria-hidden="true"></i>&nbsp;' +
		'<i class="fa-exclamation-triangle fa-small" aria-hidden="true"></i>&nbsp;' +
		'<i class="fa fa-face-thinking fa-small aria-hidden="true"></i>&nbsp;')
}


function maakVraagSelecteerbaar(li: Element, vraagId) {
	li.addEventListener('click', event => {
		const elActive = event.target as Element
		selecteerAlsHuidigeVraag(elActive, vraagId)
	});
}

function selecteerAlsHuidigeVraag(el: Element, vraagId: string) {
	el.setAttribute('class', 'active');
	let oudeVraagLi = document.getElementById(huidigeVraagId);
	oudeVraagLi.classList.remove('active')
	huidigeVraagId = vraagId
	haalAntwoordenOp(vraagId)
}

// TODO: UI Uitbreiden met lessen, en alleen vragen voor huidige les laten zien.
function haalVragenOp() {
	const vragenKop = document.getElementById('vragenKop');
	vragenKop.insertAdjacentHTML("afterend", "<p id='vragenLoading'>Ophalen...</p>")

	fetch('/api/vragen')
	.then(response => response.json())
	.then(data => { console.log(data); return data} )
	.then(data => {
		vragen = data.vragen;
		document.getElementById('vragenLoading').setAttribute('style', 'display: none')
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
