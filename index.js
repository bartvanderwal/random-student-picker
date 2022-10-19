/**
 * Log alleen op localhost, of als URL parameter ?debug=true aanwezig
*/
const currentUrl = window.location.href
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let isDebugging = urlParams.get('debug')==='true'
isDebugging = isDebugging || currentUrl.startsWith('http://localhost') || currentUrl.startsWith('http://127.0.0.1')

function log(bericht) {
    if (isDebugging) {
        console.log(bericht)
    }
}

// Bron: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

/**
 * Bron: https://stackoverflow.com/questions/17722497/scroll-smoothly-to-specific-element-on-page#answer-39494245
 */
function doScrolling(query, duration) {
    let elementYOrg = window.pageYOffset + document.querySelector(query).getBoundingClientRect().top
    let elementY = elementYOrg-200;
    var startingY = window.pageYOffset
    var diff = elementY - startingY
    var start

    log(`Element y coordinaat van ${query} is: ${elementY}, elementYOrg: ${elementYOrg}, startingY is: ${startingY}, diff: ${diff}`)

    // Bootstrap our animation - it will get called right before next frame shall be rendered.
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp
      // Elapsed milliseconds since start of scrolling.
      var time = timestamp - start
      // Get percent of completion in range [0, 1].
      var percent = Math.min(time / duration, 1)
  
      let scrollToY = startingY + diff * percent
      window.scrollTo(0, scrollToY)

      // Proceed with animation as long as we wanted it to.
      if (time < duration) {
        window.requestAnimationFrame(step);
      } else {
        log(`Scrollde naar ${scrollToY}`)
      }
    })
  }

let controlGroup = document.querySelector('.ui-controlgroup-controls');

let checkboxHideAfwezig = document.createElement('input')
checkboxHideAfwezig.setAttribute('type', 'checkbox')
checkboxHideAfwezig.setAttribute('id', 'hideAfwezig')

let labelHideAfwezig = document.createElement('label')
labelHideAfwezig.setAttribute('for', 'hideAfwezig')
/** Terugzetten van styling van label io.v.m. heftige styling in jQuery mobile op: .ui-controlgroup-controls>label **/

labelHideAfwezig.setAttribute('style', 'color: white; height: inherit; width: inherit; position: relative !important; top: 10px; display: inline-block;')
labelHideAfwezig.innerText = "Verberg afwezigen"

checkboxHideAfwezig.addEventListener('click', function(event) {
    const doeHideAfwezig = event.target.checked
    document.querySelectorAll('ul.ui-listview li:has(input[type=radio][value=Afwezig][checked=checked])').forEach(span => {
        const displayMode = doeHideAfwezig ? 'none' : 'block'
        span.setAttribute('style', `display: ${displayMode};`)
    })
})

let vorigeRandomStudentIndex = -1
let randomStudentIndex = -1

pickButton = document.createElement('button')
pickButton.innerText = "Kies random"
// pickButton.setAttribute('src', chrome.extension.getURL('plaatjes/pointing-hand.png')
pickButton.addEventListener('click', function(event) {
    const aanwezigeStudenten = document.querySelectorAll('ul.ui-listview li:has(input[type=radio][value=Aanwezig][checked=checked])')
    if (randomStudentIndex!=-1) {
        vorigeRandomStudentIndex = randomStudentIndex
    }
    randomStudentIndex = getRandomInt(aanwezigeStudenten.length)
    const randomStudent = aanwezigeStudenten[randomStudentIndex]
    let vorigeRandomStudent
    if (vorigeRandomStudentIndex!=-1) {
        vorigeRandomStudent = aanwezigeStudenten[vorigeRandomStudentIndex]
    }
    randomStudent.setAttribute('style.background', 'green')
    const studentNaam = randomStudent.querySelector('p span').innerText
    const studentNr = randomStudent.querySelector('.ui-input-text').id
    document.querySelector(`ul.ui-listview li:has(#${studentNr})`).setAttribute('style', 'background: #50ff50')
    if(vorigeRandomStudent) {
        const vorigStudentKleur = vorigeRandomStudent.getAttribute('style.background')
        vorigeRandomStudent.setAttribute('style', 'background: rgb(235, 254, 244)')
    }
    doScrolling(`#${studentNr}`, 400)
    const bericht = `Student '${studentNaam}' met studentNr '${studentNr}' en volgnr ${randomStudentIndex} aangewezen!`
    log(bericht)
})

controlGroup.appendChild(pickButton)
controlGroup.appendChild(checkboxHideAfwezig)
controlGroup.appendChild(labelHideAfwezig)
