require('dotenv').config();
const fetch = require("node-fetch");

const url = "https://systran-systran-platform-for-language-processing-v1.p.rapidapi.com/translation/text/translate?source='en'&target='zh'&input=hello"

const translate = (async(input, fromLangCode, toLangCode) => {
    const results = await fetch(`https://systran-systran-platform-for-language-processing-v1.p.rapidapi.com/translation/text/translate?source=${fromLangCode}&target=${toLangCode}&input=${input}`, {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "systran-systran-platform-for-language-processing-v1.p.rapidapi.com",
            "x-rapidapi-key": process.env.RAPID_API_KEY,
            "useQueryString": true
        }
    })
    return results;
});

module.exports = {
    translate
}