var unirest = require("unirest");

var req = unirest("GET", "https://systran-systran-platform-for-language-processing-v1.p.rapidapi.com/translation/text/translate");


const translate = (input, fromLangCode, toLangCode) => {
    req.query({
        "source": `${fromLangCode}`,
        "target": `${toLangCode}`,
        "input": `${input}`
    });

    req.headers({
        "x-rapidapi-host": "systran-systran-platform-for-language-processing-v1.p.rapidapi.com",
        "x-rapidapi-key": "bc940cd37cmsh37cadb2cc896af4p1221e3jsn677fc8adab9e",
        "useQueryString": true
    });

    req.end(function(res) {
        if (res.error) throw new Error(res.error);

        console.log(res.body.outputs[0].output);
        return (res.body.outputs[0].output);
    });
}

const test = () => {
    console.log('hello');
}

module.exports = {
    translate
}