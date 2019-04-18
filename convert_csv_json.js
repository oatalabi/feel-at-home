var csvToJson = require('convert-csv-to-json')
let fileInputName = 'vancouver-rental.csv';
let fileOutputName = 'vancouver-rental.json';

csvToJson.fieldDelimiter(',').generateJsonFileFromCsv(fileInputName, fileOutputName);

