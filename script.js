const vehicleTextBox = document.getElementById('vehicleTextBox');
const vehicleOutputBox = document.getElementById('vehicleOutputBox');
const submitButton = document.querySelector('button');

function formatVehicleData(entry) {


    
    // Regex Patterns
    const addressRegex = /(\d+ [A-Z]+ \s*[A-Z0-9\s]*,\s*[A-Z]+,\s*[A-Z]{2}\s*\d{5})/g;
    const vinRegex = /VIN: ([A-HJ-NPR-Z0-9]{17})/g;
    const ownerRegex = /Registered Owner: ([^\(]+)\s*(\(.*\))?/g;
    const secondaryOwnerRegex = /Secondary Owner: ([^\(]+)\s*(\(.*\))?/g;
    const licensePlateRegex = /License Plate: (\w+)/g;
    const plateStateRegex = /Plate Registration State: (\w+)/g;
    const plateExpRegex = /Plate Expiration: (\d{1,2}\/\d{1,2}\/\d{4})/g;
    const makeModelYearRegex = /Make\/Model\/Series:\s*(.+?)\s+Model Year:\s*(\d{4})/g;

    // Initialize a string to hold data
    let formatted = '';

    // Use Regex to find all occurrences and map them into arrays. 
    let addresses = [...entry.matchAll(addressRegex)];
    let vins = [...entry.matchAll(vinRegex)];
    let owners = [...entry.matchAll(ownerRegex)];
    let secondaryOwners = [...entry.matchAll(secondaryOwnerRegex)];
    let licenses = [...entry.matchAll(licensePlateRegex)];
    let states = [...entry.matchAll(plateStateRegex)];
    let expirations = [...entry.matchAll(plateExpRegex)];
    let makeModelYears = [...entry.matchAll(makeModelYearRegex)];


    // loop through each set of matched data to construct necessary output. 

    for (let i = 0; i < addresses.length; i++) {
        formatted += `${makeModelYears[i][2]} ${makeModelYears[i][1].trim()} \n` +
                     `${addresses[i][1]}\n`;

        if (owners[i]) {
            formatted += `Registered Owner: ${owners[i][1].trim()}\n`;
        }
        if (secondaryOwners[i]) {
            formatted += `Secondary Owner: ${secondaryOwners[i][1].trim()}\n`;
        } 
        
        if (vins[i]) {
            formatted += `VIN: ${vins[i][1]}\n`;
        }

        if (licenses[i]) {
            formatted += `License Plate: ${licenses[i][1]}\n`;
        }

        if (states[i]) {
            formatted += `Plate Registration State: ${states[i][1]}\n`;
        }

        if (expirations[i]) {
            formatted += `Plate Expiration: ${expirations[i][1]}\n`;
        }

        formatted += '\n';   //add a new line for spacing between entries
    }

    if (formatted) {
        console.log("Formatted output:", formatted);
        return formatted;
    } else {
        console.log("No matches found.");
        return "Failed to match any data. Check input format.";
    }
}

// Event listener for the submit button
submitButton.addEventListener('click', function() {
    const userInput = vehicleTextBox.value;
    console.log("Submitting this input:", userInput);
    const changedInput = formatVehicleData(userInput);
    vehicleOutputBox.textContent = changedInput;
});
