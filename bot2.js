const TelegramBot = require('node-telegram-bot-api');
const xlsx = require('xlsx');
const token = '6470010453:AAG4tRMuHwBiOzhOlAPEwU44hsh4TmPlTZk'';
const bot = new TelegramBot(token, { polling: true });

// Read Excel file
const workbook = xlsx.readFile('results.xlsx');
const sheet_name_list = workbook.SheetNames;
const resultsSheet = workbook.Sheets[sheet_name_list[0]];
const results = xlsx.utils.sheet_to_json(resultsSheet, { header: 1 });

// Convert results to numbers
const parsedResults = results.map(row => row.map(cell => parseInt(cell, 10)));

// Function to analyze results
function analyzeResults(data) {
    const summary = {};
    data.forEach(row => {
        row.forEach(number => {
            summary[number] = (summary[number] || 0) + 1;
        });
    });
    return summary;
}

// Function to generate new predictions using a random number generator
function generatePredictions(data) {
    const predictions = [];
    const generateUniquePrediction = () => {
        const uniquePrediction = [];
        while (uniquePrediction.length < data[0].length) {
            const randomNum = Math.floor(Math.random() * 10); // Generating numbers between 0 and 9
            if (!uniquePrediction.includes(randomNum)) {
                uniquePrediction.push(randomNum);
            }
        }
        return uniquePrediction;
    };

    for (let i = 0; i < 15; i++) {
        predictions.push(generateUniquePrediction());
    }
    return predictions;
}

// Function to update Excel file with new predictions
function updateExcel(predictions) {
    const newWorkbook = xlsx.utils.book_new();
    const newSheet = xlsx.utils.aoa_to_sheet(predictions.map(prediction => prediction.map(num => num.toString())));
    xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Predictions');
    xlsx.writeFile(newWorkbook, 'new_predictions.xlsx');
}

// Function to format results as a table
function formatAsTable(data) {
    let table = "------------------------------\n";
    data.forEach(row => {
        table += '| ' + row.join(' | ') + ' |\n';
        table += "------------------------------\n";
    });
    return table;
}

function formatAnalysisAsTable(analysis) {
    const formTable = Array(3).fill('| [ ] [ ] [ ] |\n').join('');
    return formTable;
}

// Bot commands
bot.onText(/\/analyze/, (msg) => {
    const chatId = msg.chat.id;
    const analysis = analyzeResults(parsedResults);
    const analysisTable = formatAnalysisAsTable(analysis);
    bot.sendMessage(chatId, `Analysis:\n${analysisTable}`);
});

bot.onText(/\/predict/, (msg) => {
    const chatId = msg.chat.id;
    const predictions = generatePredictions(parsedResults);
    updateExcel(predictions);
    const predictionsTable = formatAsTable(predictions);
    bot.sendMessage(chatId, `Next predictions:\n${predictionsTable}`);
});

bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "Welcome! Use /analyze to analyze results and /predict to predict future results.");
});

bot.onText(/\/generate/, (msg) => {
    const chatId = msg.chat.id;
    const predictions = generatePredictions(parsedResults);
    updateExcel(predictions);
    const predictionsTable = formatAsTable(predictions);
    bot.sendMessage(chatId, `New predictions generated:\n${predictionsTable}`);
});
