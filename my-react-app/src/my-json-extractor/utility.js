import * as fs from 'fs/promises';
import path from 'path';

export const diskWriterInJSON = async (path, simpleData) => {
    console.log("Writing" + path)
    let jsonData = JSON.stringify(simpleData, null, 2);
    try {
        await fs.writeFile(path, jsonData);
        console.log("✅ Write successfully into " + path);
    } catch (err) {
        console.error(`❌ Error writing to file: ${path}`, err);
    }
}

export const readOneFile = async (path) => {
    try {
        let data = await fs.readFile(path, { encoding: 'utf-8' });
        data = JSON.parse(data)
        return data
    } catch (err) {
        console.error(`❌ Error Reading file: ${path}`, err);
    }
}

const readFileAndGiveNameAsId = async (filepath) => {
    const data = await readOneFile(filepath)
    const filename = path.basename(filepath).split('.')[0]
    data.id = filename
    return data
}

export const readFolderRecursively = async (dir, option) => {
    let skipFolder = new Set([])
    switch (option.target) {
        case 'Character.wz':
            skipFolder = new Set(['Afterimage', 'Dragon', 'Face', 'Hair', 'PetEquip', 'TamingMob',])
            break
        case 'Map.wz':
            skipFolder = new Set(['Obj', 'Tile'])
            break
        case 'Item.wz':
            skipFolder = new Set(['Cash', 'Pet', 'Special'])
            break
        case 'Mob.wz':
            skipFolder = new Set(['QuestCountGroup'])
            break
    }

    console.log({ skipFolder })

    const recursiveGetFile = async (dir) => {
        const files = []
        const list = await fs.readdir(dir)
        const jsons = list.filter(name => name.endsWith('.json'))
        const folders = list.filter(name => !name.endsWith('.json'))
        // const folders = []
        jsons.forEach(json => {
            files.push(path.join(dir, json))
        })
        for (let folder of folders) {
            if (skipFolder.has(folder)) continue
            files.push(... await recursiveGetFile(path.join(dir, folder)))
        }
        return files
    }

    const readBatchByBatch = async (filesToRead) => {
        const batch = 100   // read 100 files batch by batch
        const results = []
        for (let i = 0; i < Math.ceil(filesToRead.length / batch); i++) {
            let batchRes = []
            for (let j = 0; j < batch; j++) {
                if (i * batch + j >= filesToRead.length) break
                // console.log(i * batch + j)
                let index = i * batch + j
                batchRes.push(readFileAndGiveNameAsId(filesToRead[index]))
            }
            batchRes = await Promise.all(batchRes)
            results.push(...batchRes)
        }
        return results
    }

    try {
        const filesToRead = await recursiveGetFile(dir)
        console.log(filesToRead.length)
        const inputDataArr = await readBatchByBatch(filesToRead)
        return inputDataArr
    } catch (err) {
        console.error(`❌ Error Reading Path: ${dir}`, err);
    }
}