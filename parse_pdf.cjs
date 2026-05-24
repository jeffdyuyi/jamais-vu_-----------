const fs = require('fs');
const pdf = require('pdf-parse');

console.log(typeof pdf, Object.keys(pdf));

const dataBuffer = fs.readFileSync('e:/YJF/jamais-vu_-旧事如新-调查员档案/旧事如新jamaisvu_v1_0_0315.pdf');

pdf(dataBuffer).then(function(data) {
    fs.writeFileSync('e:/YJF/jamais-vu_-旧事如新-调查员档案/pdf_text.txt', data.text);
    console.log("PDF extraction complete.");
}).catch(function(error) {
    console.error("Error:", error);
});
