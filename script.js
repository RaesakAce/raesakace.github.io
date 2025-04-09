// Funzione per ottenere il carattere ASCII in base alla luminosità
// Utilizza la mappatura fornita (che può essere invertita)
function getAsciiChar(brightness, mapping) {
    const index = Math.floor((brightness / 255) * (mapping.length - 1));
    return mapping[index];
}

// Funzione asincrona di caricamento immagine
async function loadImage(imageURL) {
    let img;
    const imageLoadPromise = new Promise(resolve => {
        img = new Image();
        img.onload = resolve;
        img.src = imageURL;
    });
    await imageLoadPromise;
    return img;
}

// Funzione asincrona di caricamento file
async function readFile(fileURL) {
    let reader;
    const fileReadPromise = new Promise(resolve => {
        reader = new FileReader();
        reader.onload = resolve;
        reader.readAsDataURL(fileURL);
    });
    await fileReadPromise
    return reader.result
}

// Funzione di conversione immagine
function convert(img) {
    const columns = parseInt(document.getElementById('columns').value, 10) || 100;
    // Il fattore 0.55 compensa l'aspetto dei caratteri monospace
    const newWidth = columns;
    const newHeight = Math.floor(img.height * (newWidth / img.width) * 0.55);

    const canvas = document.getElementById('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');

    // Disegna l'immagine ridimensionata sul canvas
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const imageData = ctx.getImageData(0, 0, newWidth, newHeight);
    const data = imageData.data;

    let asciiStr = "";
    // Legge lo stato delle checkbox
    const includeBackground = document.getElementById('toggleBackground').checked;
    const manageTransparency = document.getElementById('toggleTransparency').checked;
    const invertIntensity = document.getElementById('toggleInversion').checked;
    // Soglia per pixel troppo chiari (se non si include lo sfondo)
    const backgroundThreshold = 230;

    // Definisce la mappatura dei caratteri (dal più denso al più leggero)
    const baseMapping = "@%N#*+=~-:. ";
    // Se inversione attivata, usa la mappatura inversa
    const asciiMapping = invertIntensity ? baseMapping.split('').reverse().join('') : baseMapping;

    // Ciclo sui pixel
    for (let y = 0; y < newHeight; y++) {
        for (let x = 0; x < newWidth; x++) {
            const offset = (y * newWidth + x) * 4;
            const alpha = data[offset + 3]; // canale alfa

            let asciiChar = "";
            // Gestisce la trasparenza: se attivata e il pixel è trasparente, usa spazio
            if (manageTransparency && alpha < 128) {
                asciiChar = " ";
            } else {
                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];
                const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
                asciiChar = getAsciiChar(brightness, asciiMapping);
                // Se non includiamo il background, i pixel troppo chiari diventano spazio
                if (!includeBackground && brightness > backgroundThreshold) {
                    asciiChar = " ";
                }
            }
            asciiStr += asciiChar;
        }
        asciiStr += "\n";
    }

    // Visualizza l'ASCII art nella pagina
    document.getElementById('result').textContent = asciiStr;

    // Prepara il download del file di testo
    const blob = new Blob([asciiStr], { type: "text/plain" });
    const downloadLink = document.getElementById('download');
    downloadLink.href = URL.createObjectURL(blob);
    downloadLink.download = "ascii_art.txt";
    downloadLink.style.display = "inline-block";
    downloadLink.textContent = "Scarica ASCII Art";
}



document.getElementById('convert').addEventListener('click', async function () {
    const fileInput = document.getElementById('upload');
    if (fileInput.files.length === 0) {
        alert("Seleziona un'immagine prima di procedere.");
        return;
    }

    const file = fileInput.files[0];

    const imgFile = await readFile(file)
    const img = await loadImage(imgFile)
    convert(img)
});