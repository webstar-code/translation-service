const fs = require('fs');
const path = require('path');
// import { Translate } from '@google-cloud/translate/build/src/v2';
const { Translate } = require('@google-cloud/translate/build/src/v2');

// Instantiates a client
const translate = new Translate({
  projectId: "flex-dev-test",
  keyFilename: "flex-dev-test.json"
});

// Function to read and manipulate JSON files in a directory
const manipulateJsonFiles = (dir) => {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file);
      fs.readFile(filePath, 'utf8', async (err, data) => {
        if (err) {
          console.error(`Error reading file ${filePath}: ${err}`);
          return;
        }

        let jsonData;
        try {
          jsonData = JSON.parse(data);
        } catch (err) {
          console.error(`Error parsing JSON from file ${filePath}: ${err}`);
          return;
        }

        // Manipulate JSON values
        for (let key of jsonData) {
          if (jsonData.hasOwnProperty(key)) {
            jsonData[key] = await manipulateString(jsonData[key], "hi");
          }
        }

        // Write back the manipulated JSON data
        fs.writeFile(filePath, JSON.stringify(jsonData, null, 2), 'utf8', (err) => {
          if (err) {
            console.error(`Error writing to file ${filePath}: ${err}`);
          } else {
            console.log(`File ${filePath} has been updated.`);
          }
        });
      });
    });
  });
};

// Sample asynchronous function for string manipulation
async function manipulateString(text, target) {
  return new Promise(async (resolve) => {
    translate.translate(text, target).then(async ([translated_text]) => {
      resolve(translated_text)
    });
  });
}

const manipulateValue = (value) => {
  return value.toUpperCase();
};

// Specify the directory containing the JSON files
const jsonDir = path.join(__dirname, 'en');
manipulateJsonFiles(jsonDir);