# AIM iSAS Student picker extension

Een Chrome browser extensie om in het aanwezigheidsregistratie scherm van de iSAS webapplicatie die we bij HAN AIM gebruiken optie te hebben voor 'random student picker' analoog aan de bestaande [Processing applicatie random-student-picker' van Sander Leer](https://github.com/HANICA/select-random-student) (Leer, 2019).

Hieronder kort de algoritmiek en wat plaatjes en een video van design en implementatie.

Bron: [Chrome docs on extensions](https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/)

## Pseudo code/algoritmiek

- Zet studenten in een JS array met naam en volgnr [ {"volgnr": 1, "naam": "Jan Jansen", "aanwezig": true}, { ... } ]
- Haal afwezig studenten uit array (kopie)
- Check dat aanwezigheid is ingevuld voor alle studenten (niet undefined veld)

- Tel aantal studenten (content van spans binnen <li> met html 'class' 'ui-li-heading', zie figuur 1)
- Kies random getal 'randomVolgNr' tussen 1 en aantal studenten
- Zet een css klasse 'selected' op de pagina in gevonden random getal
- Zorg dat deze gemarkeerd is, bv. groen; zie figuur 2
- Eventueel focus zetten op dit item (met `window.scrollTo()` functie; zie voorbeeldcode in [deze SO vraag/antwoord](https://stackoverflow.com/questions/17722497/scroll-smoothly-to-specific-element-on-page#answer-39494245))

## Screenshots & Video

<img src="plaatjes/html-structuur-classes.png" alt="Structuur van HTML in iSAS" align="right">

*Figuur 1*: (Design) De aanwezigheidslijst in iSAS en HTML structuur en class

<img src="plaatjes/selected.png" alt="Structuur van HTML in iSAS" align="right">

*Figuur 2*: (Design) Markeren van 'gepickte' student

<img src="plaatjes/screenshot-random-student-picker.png" alt="Structuur van HTML in iSAS" align="right">

*Figuur 3*: (Actual) Chrome Extensie en toegevoegde UI met pick knop en filter vinkje

<video src="plaatjes/demo-video-random-student-isas.mp4" controls="controls" style="max-width: 730px;">
</video>

*Figuur 4*: (Actual) Video met voorbeeld van gebruik (geanonimiseerde gegevens ivm AVG)

## User stories & acceptatiecriteria (BDD stijl)

Onderstaand user stories en acceptatie criteria in [BDD](https://cucumber.io/docs/gherkin/reference/) stijl.

Feature: Browser based interface in iSAS als Chrome extensie
Als docent wil ik de al in iSAS ingevulde aanwezigheidslijst kunnen gebruiken in de browser in plaats van aparte applicatie te gebruiken zodat ik niet apart iets hoef op te starten (maar wel een Chrome extensie moet installeren, want 'voor niets gaat de zon op' ;)).

Feature: Als docent wil ik in een klas random een aanwezige student kunnen laten kiezen uit de groep om een vraag te beantwoorden, zodat niet telkens dezelfde studenten aan de beurt zijn en de objectiviteit gewaarborgd blijft

Scenario: Student kiezen
Gegeven een lijst van aanwezige studenten van een klas
Wanneer ik het systeem om een student vraag
Dan geeft deze random een student uit de lijst die nog niet eerder aan de beurt is geweest

Scenario: Nog ongemarkeerde student alsnog als afwezig markeren
Gegeven dat het systeem een studentnaam geeft die per ongeluk toch afwezig is
Wanneer ik aan geef dat deze toch afwezig is
Dan markeert het systeem deze student alsnog als afwezig

Scenario: Random lijst resetten
Gegeven dat ik alle aanwezige studenten al een keer heb aangewezen
Wanneer ik weer om een nieuwe student vraag
Dan gaat het systeem opnieuw door alle aanwezigen met een nieuwe random volgorde