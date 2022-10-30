# Digitaal Wisbordje Backend+Front-end

Dit is de applicatie met backend en front-end voor 'quiz achtige' functionaliteit in de Random student picker van HAN AIM ICT.

Deze uitbreiding van 'digitaal wisbordje' sluit beter aan bij concept 'formatief handelen' dan enkel (random) student aanwijzen. Dit is een variant van een padlet gebruiken.

Het basis idee van formatief handelen is dat je probeert dat ALLE studenten in de klas meedoen. Met de random student picker bereik je dit op een andere manier, door eerst de vraag stellen, waar iedereen over kan nadenken, en dit denken te stimuleren doordat je random een student aanwijzen om een antwoord/reactie te geven. Toch is dit nog beetje 'cold calling', als je een student aanwijst die toch niet mee deed.

Door alle studenten te vragen ook daadwerkelijk te antwoorden. In plaats van op wisbordjes gebeurt dit nu digitaal.

## Inleiding

De backend slaat vragen en antwoorden op van quizzes. Vragen van een docent en antwoorden van student. Deze zijn beschikbaar via een RESTful API over HTTP. Kortom de standaard 'web way'. Dit gebeurt anoniem, en via de Kahoot way: 'Look up while playing..., rather
than looking down into their textbooks or devices (Kahoot, 2019).

Dus met focus op het centrale scherm in de klas en onderlinge interactie. De student picker Chrome plugin stuurt de vragen en of antwoorden.

De gegevens zijn geheel anoniem.

- Dat wil zeggen dat specifieke antwoorden niet terug te leiden zijn tot een student (gebruiker).
- Dit moet de docent in de klas maar vragen. Om het geheel wel te stroomlijnen.

Eventuele functionaliteit om antwoorden als goed of fout te markeren komt later, maar ook dit zal de student dan zelf handmatig moeten overnemen.

## Achtergrond

Deze backend werkt met Oak, de applicatieserver van Deno; de nieuwere variant van NodeJS: sneller en veiliger. De initiele code was gebaseerd op een voorbeeld [REST API using JWT for authentication on loginradius.com]. De bron beschrijft hoe Deno te installeren op Windows, ik heb dit zelf initieel op macOS gedaan met brew volgens de [Deno homepage](https://deno.land/manual@v1.26.2/getting_started/installation). Maar in dit project gebruiken we ook een opzet met Docker.

Voor de REST API applicatie gebruiken we simpelweg met de standaard [Deno image op Docker Hub](https://hub.docker.com/r/denoland/deno), die ook handleiding heeft. Andere handleiding met ook `Dockerfile`'s staat op in de [GitHub repo van 'Deno_docker'](https://hub.docker.com/r/denoland/deno).

De MongoDB database runnen we ook in een [container](https://www.mongodb.com/compatibility/docker) gebruiken we later evt. voor opslaan van vakken en lessen hierin. De vragen en antwoorden slaan we echter niet persistent op vanwege het privacy aspect; en omdat dit functioneel ook helemaal niet nodig is.

## Front-end als static content in `public` folder

Er is een SPA front end om vragen te beheren m.b.v. Oak's static content ([bron](https://www.youtube.com/watch?v=sFqihYDpoLc)).

## How to run

Start de mongodb database server en dan de deno backend.

```bash
docker run --name mongodb -d -p 27017:27017 mongo
deno run --allow-net --allow-read='antwoordenDB' --allow-write='antwoordenDB' --allow-env=ADMINPASSWORD server.ts
```

De `--allow-net` is nodig voor toegang tot netwerk om als HTTP server te kunnen dienen.
De `--allow-read` en `--allow-write` permissie zijn nodig voor het lezen respectievelijk schrijven van de 'in memory' SQLite database op de hard disk.
De `--allow-env` is nodig voor het uitlezen van de omgevingsvariabelen uit ww voor 'secure' instellen 'geheim' wachtwoord voor endpoint wissen antwoorden e.d..

Voor enablen van debuggen kun je de `--inspect` optie voor de `deno run` toevoegen. Bijvoorbeeld in [VS Code kun je dan breakpoints zetten](https://medium.com/deno-the-complete-reference/run-and-debug-deno-applications-in-vscode-b6e3bff217f). En voor automatisch herstarten bij wijzigingen kun je de` --watch` flag toevoegen voor [watcher mode](https://medium.com/deno-the-complete-reference/denos-built-in-watcher-1d91cb976349).

De front-end staat om de `public` folder. Bij ontwikkelen kun je typescript compiler runnen, in watch mode

```bash
cd public
tsc -w
```

Voor verwijderen van de in memory antwoorden via DELETE endpoint op `/api/antwoorden/` moet je de omgevingsvariabele `ADMINPASSWORD` op de server op een gewenste geheime waarde, die je dan in body van DELETE request moet zetten als extra beveiliging tegen hacken.

```bash
export $ADMINPASSWORD=admin
```

## Contribute

We raden Visual Studio code aan als editor, met de [Deno extensie](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) (zie docs](https://deno.land/manual@v1.25.4/vscode_deno)).
Dit project bevat ook een vs code `settings.json` en `lauch.json` voor het linten respectievelijk runnen/debuggen van dit project. Deze bestanden staan in folder `.vscode/`) en deze is dus bewust NIET in de `.gitignore` gezet ;).

## TODO

De volgende zaken moeten of kunnen nog opgepakt worden:

- Opleveren back end op een server voor echt gebruik (Docker aanpak, bv. op aimsites.nl via Argo ICT of zelf hosten VPS digital ocean)
- Inputs van controllers wat beter typeren, zo mogelijk (schijnt nogal veel boilerplate te geven als ik [dit](https://stackoverflow.com/questions/73021318/how-to-strongly-type-the-oak-context-state-object-in-deno) lees.
- Inputs evt. ook valideren met bv. [Joi](https://joi.dev/api/?v=17.6.1) library om [noSql injection](https://blog.sqreen.com/prevent-nosql-injections-mongodb-node-js/) te voorkomen.
- Alle Deno imports, zoals bv. de Oak applicatie server hebben concreet versienummer gekregen, maar wellicht heeft het nog  een [import map](https://deno.land/manual@v1.27.0/linking_to_external_code/import_maps) maken en overal deze refereren.

## Bronnen

- Clinton, E.O. Juli 2022. *How to Implement JWT Authentication for CRUD APIs in Den*. Geraadpleegd 26-10-2022 op <https://www.loginradius.com/blog/engineering/guest-post/how-to-implement-jwt-authentication-in-deno/>
- Hayden, A et al. *Deno_docker* 2020. Geraadpleegd 26-10-2022 op <https://github.com/denoland/deno_docker>
- Kahoot, 2019 *Brand guidelines*. Geraadpleegd 26-10-2022 op <https://kahoot.com/files/2019/08/Kahoot-BrandGuide-August2019.pdf>
