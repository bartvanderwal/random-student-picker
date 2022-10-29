import { Vraag } from "./models/vraag.ts";

// const stuurvraag = (event) => {
//     event.preventDefault()
//     document.getElementById('vraagTekst').value
//     fetch(form.action, {method:'post', body: new FormData(form)});
// }

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
	event.preventDefault();

	const form = event.currentTarget;
	const url = form.action;

	try {
		const formData = new FormData(form);
		const responseData = await postFormDataAsJson({ url, formData });

		console.log({ responseData });
	} catch (error) {
		console.error(error);
	}
}
const vraagForm = document.getElementById("vraag-form");
vraagForm.addEventListener("submit", handleFormSubmit);

// let vragen: Vraag[] = [];
let vragen: Array<Vraag> = [];
let huidigeVraagId = '';
const vragenLijst = document.getElementById('vragen');
const vragenKop = document.getElementById('vragenKop');
fetch('/api/vragen')
.then(response => response.json())
.then(data => { console.log(data); return data} )
.then(data => {
    vragen = data.vragen;
    if (vragen && vragen.length>1) {
        huidigeVraagId = vragen[0].id;
    } else {
        // const liGeen = document.createElement('li')
        // liGeen.setAttribute('class', 'inactive')
        // liGeen.innerText = 'Nog geen vragen'
        // vragenKop.appendChild(liGeen);
        vragenKop.insertAdjacentHTML("afterend", "Nog geen vragen")
    }
    vragen.forEach(v => {
        const li = document.createElement('li');
        li.textContent = v.vraagTekst;
        li.setAttribute('id', v.id)
        vragenLijst.appendChild(li)
        li.addEventListener('click', event => {
            const target = event.target;
            target.setAttribute('class', 'active')
            let huidigeVraag = v.id
        })
    })
    // Haal antwoorden huidige vraag op.
    // haalAntwoordenOp();
})

function haalAntwoordenOp(vraag: string) {
    // fetch('/api/antwoorden', vraag));
}
