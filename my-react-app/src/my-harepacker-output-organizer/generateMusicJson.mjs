// 1. Manually remove unncessary mp3 files, e.g duration < 2min audio, remain: 185 files
// 2. run `node generateMusicJson.js`
// 3. copy data_music.json to ./data/

import fs from 'fs/promises';
import path from 'path';
import { parseFile } from 'music-metadata';

const folderPath = 'C:/Users/User/Desktop/TO DEL/harepacker_dump/output/audio';
const outputFile = 'C:/Users/User/Desktop/TO DEL/harepacker_dump/output/data_music.json';

const getAudioDuration = async (filePath) => {
    try {
        const metadata = await parseFile(filePath);
        return metadata.format.duration;
    } catch (error) {
        console.error(`Failed to read ${filePath}:`, error.message);
        return null;
    }
};

const generateMusicJSON = async () => {
    let count = 0
    try {
        const musicData = {};
        const files = await fs.readdir(folderPath);

        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.mp3') {
                count += 1
                const filePath = path.join(folderPath, file);
                const duration = await getAudioDuration(filePath);
                
                console.log(file)

                console.log(duration)

                if (duration !== null) {
                    const title = file;
                    musicData[title] = { length: duration?.toFixed(0) || 0 };
                }
            }
        }

        await fs.writeFile(outputFile, JSON.stringify(musicData, null, 4));
        console.log({count})
        console.log(`✅ JSON file generated: ${outputFile}`);
    } catch (err) {
        console.error('Error generating music JSON:', err.message);
    }
};

generateMusicJSON();

