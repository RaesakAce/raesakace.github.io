console.log("ciao")
async function datiArpatGramsci() {
    const response = await fetch("https://www.arpat.toscana.it/temi-ambientali/aria/qualita-aria/dati_orari_real_time/json_orari_nrt/FI-GRAMSCI");
    const dati = await response.json();
    console.log(dati);
  }
  
datiArpatGramsci();