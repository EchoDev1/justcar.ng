const fs = require('fs');
const path = require('path');
const readline = require('readline');

const jsonlPath = process.argv[2] || '17b22092-67b1-4361-8334-fed6cbf80c35.jsonl';
const basePath = "C:\\Users\\hp\\OneDrive\\Pictures\\Echo\\201401__\\OneDrive\\Echo\\leanring folder\\Justcars.ng\\justcars.ng";

const filesExtracted = {};

async function extractFiles() {
    const fileStream = fs.createReadStream(jsonlPath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        try {
            const data = JSON.parse(line);

            // Check if this has a message with content
            if (data.message && data.message.content && Array.isArray(data.message.content)) {
                for (const item of data.message.content) {
                    if (item.type === 'tool_use' && item.name === 'Write' && item.input) {
                        const filePath = item.input.file_path || '';
                        const content = item.input.content || '';

                        if (filePath && content) {
                            // Convert to relative path
                            if (filePath.includes(basePath)) {
                                const relPath = filePath.replace(basePath + "\\", "");
                                filesExtracted[relPath] = content;
                                console.log(`Found: ${relPath}`);
                            }
                        }
                    }
                }
            }
        } catch (e) {
            // Skip invalid JSON lines
        }
    }

    console.log(`\n\nTotal files found: ${Object.keys(filesExtracted).length}`);
    console.log("\nFiles to restore:");
    Object.keys(filesExtracted).sort().forEach(filepath => {
        console.log(`  - ${filepath}`);
    });

    // Write files
    let restoredCount = 0;
    for (const [relPath, content] of Object.entries(filesExtracted)) {
        const fullPath = path.join("justcars.ng", relPath);

        // Create directory if needed
        const dirPath = path.dirname(fullPath);
        if (dirPath) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write file
        fs.writeFileSync(fullPath, content, 'utf8');
        restoredCount++;
        console.log(`Restored: ${relPath}`);
    }

    console.log(`\n✓ Successfully restored ${restoredCount} files!`);
}

extractFiles().catch(console.error);
