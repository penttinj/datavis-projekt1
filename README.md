# datavis-projekt1

###### PROJECT 1 - Visualisering av information, Arcada 2020 

## DEL 1 - VISUALISERING AV BILDDATA (Max poäng 40p || Vitsord +2)
Gör en webbsida som tillåter en användare att 1.ladda upp eller 2.ange en länk till en bild.
Bildens ljus-/färgfördelning ska visualiseras i form av ett histogram.
Bekanta dej med histogram här: https://moderskeppet.se/resurs/histogram/ för att få en
överblick över vad man har för nytta av att representera en bild i ett histogram.
För projektet räcker det att fokusera enbart på "grayscale"-bilder.
Svartvita bilder har enbart en färgskala (jämfört med RGB), dvs. varje pixel har ett färgvärde
mellan 0 (svart) och 255 (vitt).
Histogrammet ska alltså visa färgskalan på X-axeln och frekvensen på Y-axeln. Kategorisera
X-axeln enligt eget omdöme.
Jag visar en nästan fungerande demo över hur man läser in pixelvärdet från en fil där jag
använder mig av HTML5 canvas och funktionen getImageData() för att läsa datan från filen,
men ifall ni kommer på nåt bättre är det nog fritt fram

## Getting started
Requires Node version 11.
1. Clone project
2. Install dependencies `npm install`
3. Run dev server `npm run gulp`

## Preview
![Preview Image](/preview.gif)

## Instructions
You can change between Bars and Paths with the button at the bottom.
The colors can be put on focus while in Path mode with a click (mouse).

## Contribution
School project, probably won't be updated but constructive criticism is welcome.

## Contributors

[![Image of Johan](https://github.com/penttinj.png?size=50)](https://github.com/penttinj)
[![Image of Kristoffer](https://github.com/Azraul.png?size=50)](https://github.com/Azraul)
