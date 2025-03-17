const vehicleTextBox = document.getElementById('vehicleTextBox');
const vehicleOutputBox = document.getElementById('vehicleOutputBox');
const submitButton = document.querySelector('button');
const copyButton = document.getElementById('copyButton');

function cleanPDFText(text) {
    console.log("Raw Input Before Cleaning:", JSON.stringify(text));

    return text
        .normalize("NFKD")  
        .replace(/[\u200B-\u200D\uFEFF]/g, "")  
        .replace(/\r\n|\r|\n/g, '\n') 
        .replace(/\s{2,}/g, ' ')  
        .trim();  
}

// ✅ **Updated Function to Properly Format Owner Names**
function formatOwnerName(rawName) {
    if (!rawName) return ""; 

    rawName = rawName.trim();

    // **Remove extra labels like (Individual & Owner)**
    rawName = rawName.replace(/\(.*?\)/g, "").trim();

    if (rawName.includes(",")) {
        let parts = rawName.split(",");
        let lastName = parts[0].trim();
        let firstMiddle = parts[1].trim();

        // **Remove any titles like "MR., MS., DR., etc."**
        firstMiddle = firstMiddle.replace(/^(MR\.?|MRS\.?|MISS\.?|MS\.?|DR\.?|PROF\.?)\/?(MR\.?|MRS\.?|MISS\.?|MS\.?|DR\.?|PROF\.?)?\s+/i, '');

        // **Remove "UNKNOWN"**
        firstMiddle = firstMiddle.replace(/\bUNKNOWN\b/i, "").trim();

        return `${firstMiddle} ${lastName}`.trim();
    }

    return rawName;
}

function formatVehicleData(entry) {
    entry = cleanPDFText(entry);

    // **Regex Patterns**
    const addressRegex = /(\d+\s[\w\s#&.-]+,\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5})/g;
    const vinRegex = /VIN: ([A-HJ-NPR-Z0-9]{17})/g;
    const ownerRegex = /Registered Owner:\s*([\s\S]*?)(?:\(|\n|$)/g;  
    const secondaryOwnerRegex = /Secondary Owner:\s*([\s\S]*?)(?:\(|\n|$)/g;  
    const licensePlateRegex = /License Plate: (\w+)/g;
    const plateStateRegex = /Plate Registration State: (\w+)/g;
    const plateExpRegex = /Plate Expiration: (\d{1,2}\/\d{1,2}\/(\d{4}))/g;
    const makeModelYearRegex = /Make\/Model\/Series:\s*(.+?)\s+Model Year:\s*(\d{4})/g;

    let formatted = '';
    let expiredFormatted = '';

    // **Extract All Matches**
    let addresses = [...entry.matchAll(addressRegex)];
    let vins = [...entry.matchAll(vinRegex)];
    let owners = [...entry.matchAll(ownerRegex)];
    let secondaryOwners = [...entry.matchAll(secondaryOwnerRegex)];
    let licenses = [...entry.matchAll(licensePlateRegex)];
    let states = [...entry.matchAll(plateStateRegex)];
    let expirations = [...entry.matchAll(plateExpRegex)];
    let makeModelYears = [...entry.matchAll(makeModelYearRegex)];

    for (let i = 0; i < addresses.length; i++) {
        let plateExpirationYear = expirations[i] ? parseInt(expirations[i][2]) : null;
        let entryFormatted = `${makeModelYears[i][2]} ${makeModelYears[i][1].trim()} \n${addresses[i][1]}\n`;

        // ✅ **Owner now appears correctly**
        if (owners[i] && owners[i][1].trim()) {
            let ownerName = formatOwnerName(owners[i][1]);
            entryFormatted += `RO: ${ownerName}\n`;
        }

        // ✅ **Fix Secondary Owner - Only If Exists**
        if (secondaryOwners[i] && secondaryOwners[i][1].trim()) {
            let secondaryName = formatOwnerName(secondaryOwners[i][1]);
            entryFormatted += `Secondary Owner: ${secondaryName}\n`;
        }

        if (vins[i]) {
            entryFormatted += `VIN: ${vins[i][1]}\n`;
        }
        if (licenses[i]) {
            entryFormatted += `LP: ${licenses[i][1]}`;
        }
        if (states[i]) {
            entryFormatted += `- ${states[i][1]}`;
        }
        if (expirations[i]) {
            entryFormatted += ` EXP: ${expirations[i][1]}\n`;
        }

        entryFormatted += '\n';

        // **Expiration Logic**: **Before 2023 = Expired, otherwise Current**
        if (plateExpirationYear && plateExpirationYear < 2023) {
            expiredFormatted += entryFormatted;
        } else {
            formatted += entryFormatted;
        }
    }

    // ✅ **Append Expired Plates Under "Expired Tags"**
    if (expiredFormatted) {
        formatted += `\n**Expired Tags**\n${expiredFormatted}`;
    }

    if (formatted) {
        console.log("Formatted output:", formatted);
        return formatted;
    } else {
        console.log("No matches found.");
        return "Failed to match any data. Check input format.";
    }
}

// **Event Listener for Submit Button**
submitButton.addEventListener('click', function () {
    const userInput = vehicleTextBox.value;
    console.log("Submitting this input:", userInput);
    const changedInput = formatVehicleData(userInput);
    vehicleOutputBox.textContent = changedInput;
});

// **Copy Button Functionality**
copyButton.addEventListener('click', function () {
    const output = vehicleOutputBox.textContent.trim();

    navigator.clipboard.writeText(output)
        .then(() => {
            vehicleOutputBox.style.outline = '3px solid blue';
            vehicleOutputBox.style.fontWeight = 'bold';

            setTimeout(() => {
                vehicleOutputBox.style.outline = '';
                vehicleOutputBox.style.fontWeight = '';
            }, 1000);
        })
        .catch(err => {
            console.error('Error copying text: ', err);
        });
});
