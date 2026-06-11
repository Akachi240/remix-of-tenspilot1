const fs = require('fs');
const path = require('path');

const directoryToScan = __dirname;
const videoExtensions = new Set(['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', '.m4v']);

function findVideos(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory()) {
            // Skip common large or irrelevant directories
            if (file !== 'node_modules' && file !== '.vercel' && file !== '.git') {
                results = results.concat(findVideos(filePath));
            }
        } else {
            const ext = path.extname(filePath).toLowerCase();
            if (videoExtensions.has(ext)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

console.log(`Scanning ${directoryToScan} for video files...`);
const videos = findVideos(directoryToScan);

if (videos.length > 0) {
    console.log(`\nFound ${videos.length} video(s):`);
    videos.forEach(v => console.log(`- ${v}`));
} else {
    console.log('\nNo video files found in this directory.');
}
