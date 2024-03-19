const http = require('http');
const fs = require('fs');

// Function to update visit counts
function updateVisitCounts(request) {
    const ip = request.socket.remoteAddress;
    const visitedFilePath = `visited_${ip}.txt`;

    // Check if the visitor has already been recorded
    if (!fs.existsSync(visitedFilePath)) {
        // If not, increment the unique candidates visit count
        let uniqueCandidatesCount = parseInt(fs.readFileSync('uniqueCandidatesCount.txt', 'utf8')) || 0;
        uniqueCandidatesCount++;
        fs.writeFileSync('uniqueCandidatesCount.txt', uniqueCandidatesCount.toString());

        // Mark the visitor as visited
        fs.writeFileSync(visitedFilePath, 'visited');
    }

    // Update this year's visit count
    let thisYearCount = parseInt(fs.readFileSync('thisYearCount.txt', 'utf8')) || 0;
    thisYearCount++;
    fs.writeFileSync('thisYearCount.txt', thisYearCount.toString());

    // Update today's visit count
    let todayCount = parseInt(fs.readFileSync('todayCount.txt', 'utf8')) || 0;
    let lastVisitDate = fs.readFileSync('lastVisitDate.txt', 'utf8').trim();
    const today = new Date().toLocaleDateString();
    if (lastVisitDate !== today) {
        todayCount = 0;
        fs.writeFileSync('lastVisitDate.txt', today);
    }
    todayCount++;
    fs.writeFileSync('todayCount.txt', todayCount.toString());
}

// Function to read visit counts
function readVisitCounts() {
    const thisYearCount = fs.readFileSync('thisYearCount.txt', 'utf8');
    const todayCount = fs.readFileSync('todayCount.txt', 'utf8');
    const uniqueCandidatesCount = fs.readFileSync('uniqueCandidatesCount.txt', 'utf8');
    return { thisYearCount, todayCount, uniqueCandidatesCount };
}

// Create HTTP server
const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE'); // Allow the following HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type'); // Allow additional headers

    if (req.url === '/') {
        // Update visit counts
        updateVisitCounts(req);

        // Read visit counts
        const { thisYearCount, todayCount, uniqueCandidatesCount } = readVisitCounts();

        // Send response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ thisYearCount, todayCount, uniqueCandidatesCount }));
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// Start server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});