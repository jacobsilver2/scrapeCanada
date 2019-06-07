const fetch = require("isomorphic-fetch");
const otcsv = require("objects-to-csv");
const codes = require('./codes');

const removeSpace = code => {
  const newCode = code.split(" ")[0].split("\t");
  return newCode;
};

const createReverseCode = code => {
  const firstThree = code.slice(0, 3);
  const lastThree = code.slice(-3);
  let newCode = "CA%7CCP%7CENG%7C" + lastThree + "-" + firstThree;
  return newCode;
};

const getAddresses = async codes => {
  let addresses = [];
  await Promise.all(
    codes.map(async code => {
      const reverseCode = createReverseCode(code);
      console.log(`running postal code ${code} with previous id ${reverseCode}`);
      const response = await fetch(
        `https://ws1.postescanada-canadapost.ca/AddressComplete/Interactive/Find/v2.10/json3ex.ws?Key=ea98-jc42-tf94-jk98&Country=CAN&SearchTerm=${code}&LanguagePreference=en&LastId=${reverseCode}&SearchFor=Everything&OrderBy=UserLocation&$block=true&$cache=false&MaxSuggestions=7&MaxResults=100`
      );
      const data = await response.json();
      await data.Items.forEach(item => addresses.push(item));
    })
  );
  return addresses;
};

//! here is what will be run
getAddresses(removeSpace(codes.eglingtonEast))
  .then(result => {
    const transformed = new otcsv(result);
    return transformed.toDisk("./output.csv");
  })
  .then(() =>
    console.log("SUCCESSFULLY COMPLETED THE WEB SCRAPING. ENJOY YOUR DATA")
  );
