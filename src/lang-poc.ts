import express from 'express';
import { movies, redisClient } from './dbConfig';
import { Translate, TranslateRequest } from '@google-cloud/translate/build/src/v2';
const router = express.Router();
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import admz from 'adm-zip';

// const upload = multer({ dest: "uploads/" })

const storage = multer.diskStorage({
  destination: (req: any, file: any, cb: (arg0: null, arg1: any) => void) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req: any, file: { originalname: any; }, cb: (arg0: null, arg1: any) => void) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });
// Example asynchronous function to manipulate value
const asyncManipulateValue = async (value: string) => {
  // Simulate asynchronous operation with a timeout
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value.toUpperCase());
    }, 1000);
  });
};
// Instantiates a client
const translate = new Translate({
  projectId: "flex-dev-test",
  keyFilename: "flex-dev-test.json"
});
export const LOCALES = [
  "en",
  "hi",
  "zh",
  "ar",
  "ur",
  "fr",
  "ru",
  "es",
] as const;

router.post("/convert-json", async (req, res) => {
  const jsonData = req.body.jsonData;
  const target = req.body.target;
  if (!LOCALES.includes(target)) {
    return res.send(`Unsupported language. Supported target langauges are ${LOCALES.toString()}`)
  }
  // Manipulate JSON data asynchronously
  const keys = Object.keys(jsonData);
  await Promise.all(keys.map(async (key) => {
    if (jsonData.hasOwnProperty(key)) {
      jsonData[key] = await translateText(jsonData[key], target);
    }
  }));
  res.send(jsonData);
})

// Route to handle multiple file uploads along with form data
router.post('/upload-files', upload.array('files', 50), async (req, res) => {
  const zp = new admz();
  const files = req.files;
  const target = req.body.target;
  if (!LOCALES.includes(target)) {
    return res.send(`Unsupported language. Supported target langauges are ${LOCALES.toString()}`)
  }
  if (!files || files.length === 0) return;
  // @ts-ignore
  for (const file of files) {
    const filePath = path.join(__dirname, '../../uploads', file.filename);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    let jsonData: any;

    try {
      jsonData = JSON.parse(fileContent);
      // Perform your manipulation on jsonData
      // Manipulate JSON data asynchronously
      const keys = Object.keys(jsonData);
      await Promise.all(keys.map(async (key) => {
        if (jsonData.hasOwnProperty(key)) {
          jsonData[key] = await translateText(jsonData[key], target);
        }
      }));
      // Write manipulated JSON data to a new file
      // Save the manipulated JSON to another directory
      const outputDir = path.join(__dirname, '../../output-uploads');
      fs.mkdirSync(outputDir, { recursive: true });
      // @ts-ignore
      const outputFilePath = path.join(outputDir, file.filename);

      fs.writeFileSync(outputFilePath, JSON.stringify(jsonData, null, 2));
      zp.addLocalFile(outputFilePath)
    } catch (error) {
      console.error('Error parsing JSON:', error);
      res.status(400).send('Invalid JSON file');
      return;
    }
  }
  const file_after_download = target + '.zip';
  const data = zp.toBuffer();
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', `attachment; filename=${file_after_download}`);
  res.set('Content-Length', data.length.toString());
  res.send(data);
});


router.post("/upload-json", upload.single('jsonFile'), (req, res) => {
  // @ts-ignore
  if (!req.file) {
    return res.status(400).send('No file uploaded');
  }
  if (!req.body.target) {
    return res.status(400).send('No target provided.');
  }
  const target = req.body.target;
  if (!LOCALES.includes(target)) {
    return res.send(`Unsupported language. Supported target langauges are ${LOCALES.toString()}`)
  }
  // @ts-ignore
  const filePath = path.join(__dirname, '../../uploads', req.file.filename);
  fs.readFile(filePath, 'utf8', async (err: any, data: string) => {
    if (err) {
      console.error(`Error reading file ${filePath}: ${err}`);
      return res.status(500).send('Error reading file');
    }

    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch (err) {
      console.error(`Error parsing JSON from file ${filePath}: ${err}`);
      return res.status(400).send('Invalid JSON file');
    }

    // Manipulate JSON data asynchronously
    const keys = Object.keys(jsonData);
    await Promise.all(keys.map(async (key) => {
      if (jsonData.hasOwnProperty(key)) {
        jsonData[key] = await translateText(jsonData[key], target);
      }
    }));

    // Save the manipulated JSON to another directory
    const outputDir = path.join(__dirname, '../../output-uploads');
    fs.mkdirSync(outputDir, { recursive: true });
    // @ts-ignore
    const outputFilePath = path.join(outputDir, req.file.filename);

    fs.writeFile(outputFilePath, JSON.stringify(jsonData, null, 2), 'utf8', (err: any) => {
      if (err) {
        console.error(`Error writing to file ${outputFilePath}: ${err}`);
        return res.status(500).send('Error writing file');
      }
      // Send the manipulated JSON file as a response
      res.setHeader('Content-Disposition', 'attachment; filename=manipulated.json');
      res.setHeader('Content-Type', 'application/json');
      res.send(jsonData);
    });
  });
})


router.get("/movies", async (req, res) => {
  const result = await movies.find().limit(10).toArray();
  const x = {
    name: "John Doe",
    age: 12,
    address: {
      street1: "Dalal Street",
      country: "India"
    }
  }
  const manipulatedObject = await manipulateStringsInArrayOfObjects(result);
  res.json(manipulatedObject).status(200);
})

// Sample asynchronous function for string manipulation
async function translateText(text: string, target: string) {
  return new Promise(async (resolve) => {
    translate.translate(text, target).then(async ([translated_text]) => {
      console.log("translated");
      resolve(translated_text)
    });
  });
}

// Sample asynchronous function for string manipulation
async function manipulateString(text: string) {
  // Simulating an asynchronous operation, e.g., making an API call, etc.
  redisClient.on('error', err => console.log('Redis Client Error', err));

  if (!redisClient.isReady) {
    console.log("Sorry Redis not ready!")
    return;
  }
  return new Promise(async (resolve) => {
    const target = 'ru';
    const value = await redisClient.hGet(text, target);
    if (value) {
      resolve(value);
    } else {
      console.log('translating...', text)
      translate.translate(text, target).then(async ([translated_text]) => {
        let values = await redisClient.hGetAll(text);
        await redisClient.hSet(
          text,
          { ...values, [target]: translated_text }
        )
        resolve(translated_text)
      });
    }
  });
}

// Function to manipulate all string values in an object
async function manipulateStringsInObject(obj: any) {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  // Create a copy of the object to avoid modifying the original object
  const manipulatedObject = Array.isArray(obj) ? [] : {};
  // Traverse the object and manipulate string values recursively
  await Promise.all(
    Object.entries(obj).map(async ([key, value]) => {
      if (typeof value === "string") {
        //  @ts-ignore
        manipulatedObject[key] = await manipulateString(value);
      } else if (typeof value === "object" && value !== null) {
        //  @ts-ignore
        manipulatedObject[key] = await manipulateStringsInObject(value);
      } else {
        //  @ts-ignore
        manipulatedObject[key] = value;
      }
    })
  )
  // for (const [key, value] of Object.entries(obj)) {
  //   if (typeof value === "string") {
  //     manipulatedObject[key] = await manipulateString(value);
  //   } else if (typeof value === "object" && value !== null) {
  //     manipulatedObject[key] = await manipulateStringsInObject(value);
  //   } else {
  //     manipulatedObject[key] = value;
  //   }
  // }

  return manipulatedObject;
}

// Function to manipulate all string values in an array of objects
async function manipulateStringsInArrayOfObjects(arr: any) {
  if (!Array.isArray(arr)) {
    throw new Error("Input must be an array.");
  }

  // Create a copy of the array to avoid modifying the original array
  const manipulatedArray = [];

  // Manipulate each object in the array asynchronously
  for (const obj of arr) {
    const manipulatedObject = await manipulateStringsInObject(obj);
    manipulatedArray.push(manipulatedObject);
  }

  return manipulatedArray;
}


export default router;