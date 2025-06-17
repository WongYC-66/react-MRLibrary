import fs from "fs";
import path from "path";
import { decode } from "html-entities";

const mapJsonFolder = "C:/Users/User/Desktop/TO DEL/harepacker_dump/MapJson.wz";
const mobJsonFolder = "C:/Users/User/Desktop/TO DEL/harepacker_dump/MobJson.wz";
const npcJsonFolder = "C:/Users/User/Desktop/TO DEL/harepacker_dump/NpcJson.wz";
const reactorJsonFolder = "C:/Users/User/Desktop/TO DEL/harepacker_dump/ReactorJson.wz";
const outputFolder = path.join(import.meta.dirname)

console.log(outputFolder)

const extractTileOrigin = () => {
    console.time()
    const obj = {}
    const tileRoot = path.join(mapJsonFolder, 'Tile')
    const files = fs.readdirSync(tileRoot)

    for (let file of files) {
        const tS = decode(file.split('.')[0])
        obj[tS] = {}
        const filePath = path.join(tileRoot, file)
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"))

        for (let u in content) {
            u = decode(u)
            if (u == "info") continue
            // get the origin
            let subContent = content[u]
            obj[tS][u] = {}
            for (let no in subContent) {
                if (isNaN(Number(no))) continue
                const { _x: x, _y: y } = subContent[no].origin || { _x: 0, _y: 0 }
                obj[tS][u][no] = { x, y }
            }
        }
    }
    // ${tS}.${u}.${no}
    const saveFileName = `data_RenderTileOrigin.json`
    fs.writeFileSync(saveFileName, JSON.stringify(obj, null, '\t'))
    console.log("Finish fn: extractTileOrigin")
    console.timeEnd()
}

const extractObjOrigin = () => {
    console.time()
    const obj = {}
    const objRoot = path.join(mapJsonFolder, 'Obj')
    const files = fs.readdirSync(objRoot)

    for (let file of files) {
        const oS = decode(file.split('.')[0])
        obj[oS] = {}
        const filePath = path.join(objRoot, file)
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"))

        for (let l0 in content) {
            l0 = decode(l0)
            obj[oS][l0] = {}
            let l0Content = content[l0]

            for (let l1 in l0Content) {
                if (l1.startsWith('_')) continue
                l1 = decode(l1)
                obj[oS][l0][l1] = {}
                let l1Content = l0Content[l1]

                for (let l2 in l1Content) {
                    if (isNaN(Number(l2))) continue
                    l2 = decode(l2)
                    let l2Content = l1Content[l2]
                    let origin = l2Content?.['0']?.origin || { _x: 0, _y: 0 }
                    obj[oS][l0][l1][l2] = { x: origin._x, y: origin._y }
                }
            }
        }
    }
    // ${oS}.${l0}.${l1}.${l2}.0
    const saveFileName = `data_RenderObjOrigin.json`
    fs.writeFileSync(saveFileName, JSON.stringify(obj, null, '\t'))
    console.log("Finish fn: extractObjOrigin")
    console.timeEnd()
}

const extractReactorOrigin = () => {
    console.time()
    const obj = {}
    const reactorRoot = path.join(reactorJsonFolder)
    const files = fs.readdirSync(reactorRoot)

    for (let file of files) {
        const id = file.split('.')[0]
        const filePath = path.join(reactorRoot, file)
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"))

        const origin = content?.['0']?.['0']?.origin || { _x: 0, _y: 0 }
        if (content?.info?.link) {
            const linkId = content.info.link._value
            const linkedReactor = obj[linkId]
            obj[id] = { ...linkedReactor, link: linkId }
        } else {
            obj[id] = { x: origin._x, y: origin._y }
        }
    }
    const saveFileName = `data_RenderReactorOrigin.json`
    fs.writeFileSync(saveFileName, JSON.stringify(obj, null, '\t'))
    console.log("Finish fn: extractReactorOrigin")
    console.timeEnd()
}

const extractMobOrigin = () => {
    console.time()
    const obj = {}
    const mobRoot = path.join(mobJsonFolder)
    const files = fs.readdirSync(mobRoot)

    for (let file of files) {
        const id = file.split('.')[0]
        const filePath = path.join(mobRoot, file)
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"))

        const origin = content?.stand?.['0']?.origin || { _x: 0, _y: 0 }

        obj[id] = { x: origin._x, y: origin._y }
    }
    const saveFileName = `data_RenderMobOrigin.json`
    fs.writeFileSync(saveFileName, JSON.stringify(obj, null, '\t'))
    console.log("Finish fn: extractMobOrigin")
    console.timeEnd()
}

const extractNpcOrigin = () => {
    console.time()
    const obj = {}
    const npcRoot = path.join(npcJsonFolder)
    const files = fs.readdirSync(npcRoot)

    // npc with json
    for (let file of files) {
        const id = file.split('.')[0]
        const filePath = path.join(npcRoot, file)
        const content = JSON.parse(fs.readFileSync(filePath, "utf-8"))

        const origin = content?.stand?.['0']?.origin || { _x: 0, _y: 0 }

        if (content?.info?.link) {
            const linkId = content.info.link._value
            const linkedNpc = obj[linkId]
            obj[id] = { ...linkedNpc, link: linkId }
        } else {
            obj[id] = { x: origin._x, y: origin._y }
        }
    }
    const saveFileName = `data_RenderNpcOrigin.json`
    fs.writeFileSync(saveFileName, JSON.stringify(obj, null, '\t'))
    console.log("Finish fn: extractNpcOrigin")
    console.timeEnd()
}

const extractPortalOrigin = () => {
    console.time()
    const obj = {}
    const filePath = path.join(mapJsonFolder, 'MapHelper.img.json')
    let content = JSON.parse(fs.readFileSync(filePath, "utf-8"))

    content = content.portal.editor // assume, editor > game

    for (let type in content) {
        if (type.startsWith('_')) continue
        let subContent = content[type]
        let origin = subContent?.origin || { _x: 0, _y: 0 }
        obj[type] = { x: origin._x, y: origin._y }
    }

    const saveFileName = `data_RenderPortalOrigin.json`
    fs.writeFileSync(saveFileName, JSON.stringify(obj, null, '\t'))
    console.log("Finish fn: extractPortalOrigin")
    console.timeEnd()
}

extractTileOrigin()
extractObjOrigin()
extractReactorOrigin()
extractMobOrigin()
extractNpcOrigin()
extractPortalOrigin()