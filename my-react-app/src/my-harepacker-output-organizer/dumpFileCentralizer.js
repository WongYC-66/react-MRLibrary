// usage :
// 1. after file extraction from harepacker
// 2. crawl and copy important images/mp3 to a centralized folder
// 3. then copy to ./public/images/  or upload to audio repo : https://github.com/scotty66f/royals-ost/tree/refs/heads/main/audio

import fs from 'fs';
import path from 'path';

const mainFolder = 'E:/TO DEL/harepacker_dump/img';       // enter your folder of harerepacker extraction as png/mp3
const outputFolder = 'E:/TO DEL/harepacker_dump/output';     //  enter your output destination to centralize images/mp3

const createFolderIfNotExist = (outputFolder) => {
    // Ensure output folder exists
    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
    }
}

const copyMob = () => {
    const subDestinationFolder = `${outputFolder}/monsters`
    const subMainFolder = `${mainFolder}/Mob.wz`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name === 'stand.0.png') {
                // Get the parent folder name, remove ".img" if it exists, and use it as the new file name
                let folderName = path.basename(path.dirname(fullPath));
                folderName = folderName.replace('.img', ''); // Remove ".img" from folder name

                const targetPath = path.join(subDestinationFolder, `${folderName}.png`);  // Save as folder name + ".png"

                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${folderName}.png`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('Mob Image transfer complete.');
}

const copyItem = () => {
    const subDestinationFolder = `${outputFolder}/items`
    const subMainFolder = `${mainFolder}/Item.wz`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                // Ignore "Pet" subfolders
                if (file.name.toLowerCase() === 'pet') {
                    console.log(`Skipping folder: ${fullPath}`);
                    return;
                }
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name.endsWith('.info.icon.png')) {
                // Extract the base name without extension
                const baseName = path.basename(file.name, '.info.icon.png');
                const targetPath = path.join(subDestinationFolder, `${baseName}.png`);

                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${baseName}.png`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('Item Image transfer complete.');
}

const copyCharacter = () => {
    const subDestinationFolder = `${outputFolder}/characters`
    const subMainFolder = `${mainFolder}/Character.wz`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });

        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);

            if (file.isDirectory()) {
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name === 'info.icon.png') {
                let folderName = path.basename(path.dirname(fullPath));

                // Remove ".img" if it exists in the folder name
                folderName = folderName.replace('.img', '');

                const targetPath = path.join(subDestinationFolder, `${folderName}.png`);
                fs.copyFileSync(fullPath, targetPath);
                console.log(`Copied: ${folderName}.png`);
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('Character Image transfer complete.');
}

const copyMap = () => {
    const subDestinationFolder = `${outputFolder}/maps`
    const subMainFolder = `${mainFolder}/Map.wz`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
    
        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
    
            if (file.isDirectory()) {
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name === 'miniMap.canvas.png') {
                // Get the parent folder name, remove ".img" if it exists, and use it as the new file name
                let folderName = path.basename(path.dirname(fullPath));
                folderName = folderName.replace('.img', ''); // Remove ".img" if exists
    
                const targetPath = path.join(subDestinationFolder, `${folderName}.png`);  // Save as folder name + ".png"
    
                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${folderName}.png`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('Map Image transfer complete.');
}

const copyWorldMap = () => {
    const subDestinationFolder = `${outputFolder}/worldmaps`
    const subMainFolder = `${mainFolder}/Map.wz/WorldMap`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
    
        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
    
            if (file.isDirectory()) {
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name === 'BaseImg.0.png') {
                // Get the parent folder name, remove ".img" if it exists, and use it as the new file name
                let folderName = path.basename(path.dirname(fullPath));
                folderName = folderName.replace('.img', ''); // Remove ".img" if exists
    
                const targetPath = path.join(subDestinationFolder, `${folderName}.png`);  // Save as folder name + ".png"
    
                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${folderName}.png`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('WorldMap Image transfer complete.');
}

const copyNpc = () => {
    const subDestinationFolder = `${outputFolder}/npcs`
    const subMainFolder = `${mainFolder}/Npc.wz`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
    
        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
    
            if (file.isDirectory()) {
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name === 'stand.0.png') {
                // Get the parent folder name, which will be used as the new file name
                let folderName = path.basename(path.dirname(fullPath));
                folderName = folderName.replace('.img', ''); // Remove ".img" if exists
    
                const targetPath = path.join(subDestinationFolder, `${folderName}.png`);  // Save as folder name + ".png"
    
                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${folderName}.png`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('Npc Image transfer complete.');
}

const copySkill = () => {
    const subDestinationFolder = `${outputFolder}/skills`
    const subMainFolder = `${mainFolder}/Skill.wz`

    const findAndCopyImages = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
    
        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
    
            if (file.isDirectory()) {
                findAndCopyImages(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name.startsWith('skill.') && file.name.endsWith('.icon.png')) {
                // Extract the skill ID (e.g., "1300000") from the file name
                const skillId = file.name.replace('skill.', '').replace('.icon.png', '');
    
                const targetPath = path.join(subDestinationFolder, `${skillId}.png`);  // Save as skill ID + ".png"
    
                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${skillId}.png`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopyImages(subMainFolder)
    console.log('Skill Image transfer complete.');
}

const copyMusic = () => {
    const subDestinationFolder = `${outputFolder}/audio`
    const subMainFolder = `${mainFolder}/Sound.wz`

    const findAndCopySounds = (dir) => {
        const files = fs.readdirSync(dir, { withFileTypes: true });
    
        files.forEach((file) => {
            const fullPath = path.join(dir, file.name);
    
            if (file.isDirectory()) {
                findAndCopySounds(fullPath); // Recursively search subdirectories
            } else if (file.isFile() && file.name.endsWith('.mp3')) {
                const targetPath = path.join(subDestinationFolder, file.name); // Keep the original filename
    
                try {
                    fs.copyFileSync(fullPath, targetPath);
                    console.log(`Copied: ${file.name}`);
                } catch (error) {
                    console.error(`Failed to copy ${fullPath}:`, error.message);
                }
            }
        });
    };

    createFolderIfNotExist(subDestinationFolder)
    findAndCopySounds(subMainFolder)
    console.log('MP3 files transfer complete.');
}

const main = () => {
    copyMob()
    copyItem()
    copyCharacter()
    copyMap()
    copyWorldMap()
    copyNpc()
    copySkill()
    copyMusic()
}

main()
