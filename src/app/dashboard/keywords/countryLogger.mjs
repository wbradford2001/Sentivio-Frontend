// import { countries } from 'country-flag-icons'
import fs from 'fs';
const filePath = './public/icons/flags/';


const countries = ["AC", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", "AT", "AU", "AW", "AX", "AZ", "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BQ", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", "CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CW", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "EU", "FI", "FJ", "FK", "FM", "FO", "FR", "GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "IC", "ID", "IE", "IL", "IM", "IN", "IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", "NL", "NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", "SC", "SD", "SE", "SG", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV", "SX", "SY", "SZ", "TA", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", "TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "XK", "YE", "YT", "ZA", "ZM", "ZW"]
const API = "https://catamphetamine.gitlab.io/country-flag-icons/3x2/"


async function fetchData(country) {
    try {
        const requestString = API + country + ".svg";
        console.log(requestString)
      const response = await fetch(requestString);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.text();
      //console.log(data); // Process the JSON data
      return data
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      return "error"
    }
  }
  


  function appendDataToFile(filePath, newData) {
    // Append data to the file
    fs.appendFile(filePath, newData, (err) => {
      if (err) {
        console.error('Error appending data to file:', err);
        return;
      }
      console.log('Data appended to file successfully.');
    });
  }

  
  for (const country in countries){
      console.log(countries[country])
      const data = await fetchData(countries[country]);
        const newFilePath = filePath + countries[country] + ".svg"
      
      
        fs.access(newFilePath, fs.constants.F_OK, (err) => {
        if (err) {
          // File does not exist, so create it and append data
          fs.writeFile(newFilePath, '', (err) => {
            if (err) {
              console.error('Error creating file:', err);
              return;
            }
            console.log('File created successfully.');
            
            // Append data to the file
            appendDataToFile(newFilePath, data);
          });
        } else {
          // File exists, so append data
          appendDataToFile(newFilePath, data);
        }
      });   
    
}
  