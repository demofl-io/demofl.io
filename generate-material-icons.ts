// generate-material-icons.ts
import * as fs from 'fs';
import * as path from 'path';

interface IconData {
    name: string;
    [key: string]: any;
}

interface InputData {
    icons: IconData[];
    [key: string]: any;
}

// Paths to your input and output files
const inputFilePath = path.join(__dirname, './assets/data.json');
const outputFilePath = path.join(__dirname, './assets/material-icons.json');

// Read the data.json file
fs.readFile(inputFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error(`Error reading ${inputFilePath}:`, err);
        return;
    }

    try {
        // Parse the JSON data
        const jsonData: InputData = JSON.parse(data);

        // Ensure 'icons' array exists
        if (!jsonData.icons || !Array.isArray(jsonData.icons)) {
            throw new Error("'icons' array is missing or not an array in data.json");
        }

        // Extract the 'name' from each icon object
        const iconNames = jsonData.icons.map(icon => icon.name).filter(Boolean);

        // Optionally, remove duplicates
        const uniqueIconNames = [...new Set(iconNames)];

        // Write the icon names to material-icons.json
        fs.writeFile(outputFilePath, JSON.stringify(uniqueIconNames, null, 4), 'utf8', (writeErr) => {
            if (writeErr) {
                console.error(`Error writing to ${outputFilePath}:`, writeErr);
                return;
            }
            console.log(`Successfully converted data.json to material-icons.json with ${uniqueIconNames.length} icons.`);
        });
    } catch (parseErr) {
        console.error(`Error parsing ${inputFilePath}:`, parseErr);
    }
});