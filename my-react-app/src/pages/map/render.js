// === import library ===
import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";
import { decode } from "html-entities";

// === import data ===
import data_RenderObjOrigin from './data_RenderObjOrigin.json' with {type: "json"};
import data_RenderTileOrigin from './data_RenderTileOrigin.json' with {type: "json"};
import data_RenderMobOrigin from './data_RenderMobOrigin.json' with {type: "json"};
import data_RenderNpcOrigin from './data_RenderNpcOrigin.json' with {type: "json"};
import data_RenderReactorOrigin from './data_RenderReactorOrigin.json' with {type: "json"};
import data_RenderPortalOrigin from './data_RenderPortalOrigin.json' with {type: "json"};

// === User Config ===
const rootFolder = "C:/Users/User/Desktop/TO DEL/harepacker_dump/";
const outputFolder = path.join(import.meta.dirname, "./output");

if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

const objImageCache = new Map();
const tileImageCache = new Map();
const mobImageCache = new Map();
const npcImageCache = new Map();
const reactorImageCache = new Map();
const portalImageCache = new Map();

// ====== Caching ======
const portalPtValueToType = {
    0: 'sp',            // start point
    1: 'pi',            // invisible
    2: 'pv',            // visible
    3: 'pc',            // collision
    4: 'pg',            // changable
    5: 'tp',            // town portal
    6: 'ps',            // script
    7: 'pgi',           // changable invisible
    8: 'psi',           // script invisible
    9: 'pcs',           // script collision
    10: 'ph',           // hidden
    11: 'psh',          // script hidden
    12: 'pcj',          // vertical sprting
    13: 'pci',          // custom impact spring
    14: 'pcig',         // unknown PCIG
}

const generateCacheKey = (type, data) => {
    switch (type) {
        case 'obj':
            const { oS, l0, l1, l2 } = data
            return `${oS}.${l0}.${l1}.${l2}.0.png`
        case 'tile':
            const { tS, u, no } = data
            return `${tS}.${u}.${no}.png`
        case 'npc':
            return `${data.id}.stand.0.png`
        case 'reactor':
            return `${data.id}.0.0.png`
        case 'mob':
            return `${data.id}.stand.0.png`
        case 'portal':
            if ('pt' in data) {
                return `portal.editor.${portalPtValueToType[data.pt]}.png`
            } else {
                return `portal.editor.${data.type}.png`
            }
    }
}

async function loadImageAndSetCache(allImage, cacheTarget) {
    let loaded = 0
    let unloaded = 0
    const tasks = allImage.map(async ({ imagePath, key }) => {
        try {
            const img = await loadImage(imagePath);
            cacheTarget.set(key, img);
            loaded += 1
        } catch {
            // console.error("❌ Not found path:", imagePath)
            unloaded += 1
        }
    })
    await Promise.all(tasks)
    // console.log({ loaded, unloaded })
}

async function preloadAllObjs() {
    console.time("Preload Obj");
    const allImage = []
    // ${oS}.${l0}.${l1}.${l2}.0
    // Get Path
    for (let oS in data_RenderObjOrigin) {
        let oS_content = data_RenderObjOrigin[oS]
        for (let l0 in oS_content) {
            let l0_content = oS_content[l0]
            for (let l1 in l0_content) {
                let l1_content = l0_content[l1]
                for (let l2 in l1_content) {
                    let imagePath = path.join(rootFolder, 'Map.wz', 'Obj', 'Obj', `${oS}.img`, `${oS}.img`, `${l0}.${l1}.${l2}.0.png`)
                    const hasFile = fs.existsSync(imagePath)
                    if (!hasFile) {
                        imagePath = path.join(rootFolder, 'Map.wz', 'Obj', 'Obj', `${oS}.img`, `${oS}.img`, `${l0}.${l1}.${l2}.png`)
                    }
                    let key = generateCacheKey('obj', { oS, l0, l1, l2 })
                    allImage.push({ imagePath, key })
                }
            }
        }
    }
    await loadImageAndSetCache(allImage, objImageCache)
    console.timeEnd("Preload Obj");
}

async function preloadAllTiles() {
    console.time("Preload Tile");
    const allImage = []
    // ${tS}.${u}.${no}.0
    // Get Path
    for (let tS in data_RenderTileOrigin) {
        let tS_content = data_RenderTileOrigin[tS]
        for (let u in tS_content) {
            let u_content = tS_content[u]
            for (let no in u_content) {
                let imagePath = path.join(rootFolder, 'Map.wz', 'Tile', 'Tile', `${tS}.img`, `${tS}.img`, `${u}.${no}.png`)
                let key = generateCacheKey('tile', { tS, u, no })
                allImage.push({ imagePath, key })
            }
        }
    }
    await loadImageAndSetCache(allImage, tileImageCache)
    console.timeEnd("Preload Tile");
}

async function preloadAllReactors() {
    console.time("Preload Reactor");
    const allImage = []
    // ${id}.0.0
    // Get Path
    for (let id in data_RenderReactorOrigin) {
        id = id.padStart(7, '0')
        let imagePath = path.join(rootFolder, 'Reactor.wz', `${id}.img`, `${id}.img`, `0.0.png`)
        let key = generateCacheKey('reactor', { id })
        let link = data_RenderReactorOrigin[id]?.link
        if (link) imagePath = path.join(rootFolder, 'Reactor.wz', `${link}.img`, `${link}.img`, `0.0.png`)
        allImage.push({ imagePath, key })
    }
    await loadImageAndSetCache(allImage, reactorImageCache)
    console.timeEnd("Preload Reactor");
}

async function preloadAllNpcs() {
    console.time("Preload Npc");
    const allImage = []
    // ${id}.stand.0
    // Get Path
    for (let id in data_RenderNpcOrigin) {
        id = id.padStart(7, '0')
        let imagePath = path.join(rootFolder, 'Npc.wz', `${id}.img`, `${id}.img`, `stand.0.png`)
        let key = generateCacheKey('npc', { id })
        allImage.push({ imagePath, key })
    }
    await loadImageAndSetCache(allImage, npcImageCache)
    console.timeEnd("Preload Npc");
}

async function preloadAllMobs() {
    console.time("Preload Mob");
    const allImage = []
    // ${id}.stand.0
    // Get Path
    for (let id in data_RenderMobOrigin) {
        id = id.padStart(7, '0')
        let imagePath = path.join(rootFolder, 'Mob.wz', `${id}.img`, `${id}.img`, `stand.0.png`)
        let key = generateCacheKey('mob', { id })
        allImage.push({ imagePath, key })
    }
    await loadImageAndSetCache(allImage, mobImageCache)
    console.timeEnd("Preload Mob");
}

async function preloadAllPortals() {
    console.time("Preload Portal");
    const allImage = []
    // ${id}.stand.0
    // Get Path
    for (let type in data_RenderPortalOrigin) {
        let imagePath = path.join(rootFolder, 'Map.wz', 'MapHelper.img', 'MapHelper.img', `portal.editor.${type}.png`)
        let key = generateCacheKey('portal', { type })
        allImage.push({ imagePath, key })
    }
    await loadImageAndSetCache(allImage, portalImageCache)
    console.timeEnd("Preload Portal");
}

// ====== Asset Priority for Draw Order ======
function getAssetPriority(type) {
    switch (type) {
        case "obj": return 0;
        case "tile": return 1;
        case "mob": return 2;
        case "npc": return 3;
        case "reactor": return 4;
        case "portal": return 5;
        default: return 99;
    }
}

const readMapFile = (filename) => {
    let subMap = `Map${filename[0]}`
    let mapPath = path.join(rootFolder, "MapJson.wz", 'Map', subMap, filename);
    let parsed = JSON.parse(fs.readFileSync(mapPath, "utf8"));

    // handle link issue
    const linkedMapId = parsed?.info?.link?._value
    if (linkedMapId) {
        const linkedFilename = `${linkedMapId}.img.json`
        subMap = `Map${linkedFilename[0]}`
        mapPath = path.join(rootFolder, "MapJson.wz", 'Map', subMap, linkedFilename);
        parsed = JSON.parse(fs.readFileSync(mapPath, "utf8"));
        console.log(`🔗 Map ${filename} redirected to: ${linkedFilename}`);
    }
    return parsed
}

const loadCachedImage = (item) => {
    let key = null
    let cache = {}
    switch (item.type) {
        case 'tile':
            key = generateCacheKey('tile', item)
            cache = tileImageCache
            break
        case 'obj':
            key = generateCacheKey('obj', item)
            cache = objImageCache
            break
        case 'npc':
            key = generateCacheKey('npc', item)
            cache = npcImageCache
            break
        case 'reactor':
            key = generateCacheKey('reactor', item)
            cache = reactorImageCache
            break
        case 'mob':
            key = generateCacheKey('mob', item)
            cache = mobImageCache
            break
        case 'portal':
            key = generateCacheKey('portal', item)
            cache = portalImageCache
            break
        default:
            key = null
            cache = new Map()
    }
    return cache.get(key)
}

const getTileOrigin = (tS, u, no) => {
    return data_RenderTileOrigin[tS][u][no]
}

const getObjOrigin = (oS, l0, l1, l2) => {
    return data_RenderObjOrigin[oS][l0][l1][l2]
}

const getReactorOrigin = (id) => {
    return data_RenderReactorOrigin[id]
}

const getNpcOrigin = (id) => {
    return data_RenderNpcOrigin[id]
}

const getMobOrigin = (id) => {
    return data_RenderMobOrigin[id]
}

const getPortalOrigin = (pt) => {
    const type = portalPtValueToType[pt]
    return data_RenderPortalOrigin[type]
}

const getMapGeometry = (map) => {
    //map as JSON
    let mapWidth, mapHeight, offsetX, offsetY;
    if (map.miniMap) {
        mapWidth = Number(map.miniMap.width._value);
        mapHeight = Number(map.miniMap.height._value);
        offsetX = Number(map.miniMap.centerX._value);
        offsetY = Number(map.miniMap.centerY._value);
    } else {
        const left = Number(map.info.VRLeft?._value ?? 0);
        const right = Number(map.info.VRRight?._value ?? 0);
        const top = Number(map.info.VRTop?._value ?? 0);
        const bottom = Number(map.info.VRBottom?._value ?? 0);
        mapWidth = Math.abs(right - left);
        mapHeight = Math.abs(bottom - top);
        offsetX = -left;
        offsetY = -top;
    }
    return [mapWidth, mapHeight, offsetX, offsetY]
}

const generateDrawList = (map) => {
    const drawList = []
    // tiles, obj
    for (let i = 0; i <= 7; i++) {
        const layer = map[String(i)];
        if (!layer) continue;
        const tS = layer.info?.tS?._value || "unknown";

        if (layer.tile) {
            for (const key in layer.tile) {
                if (key.startsWith('_')) continue;
                const tile = layer.tile[key];
                drawList.push({
                    type: "tile",
                    layer: i,
                    x: Number(tile.x._value),
                    y: Number(tile.y._value),
                    z: Number(key),
                    tS: decode(tS || ''),
                    u: decode(tile?.u?._value || ''),
                    no: tile.no._value
                });
            }
        }

        if (layer.obj) {
            for (const key in layer.obj) {
                if (key.startsWith('_')) continue;
                const obj = layer.obj[key];
                drawList.push({
                    type: "obj",
                    layer: i,
                    x: Number(obj.x._value),
                    y: Number(obj.y._value),
                    z: Number(obj.z?._value || 0),
                    flip: Number(obj.f?._value || 0) === 1,
                    oS: decode(obj.oS._value),
                    l0: decode(obj.l0._value),
                    l1: decode(obj.l1._value),
                    l2: decode(obj.l2._value)
                });
            }
        }
    }
    // npc
    if (map.life) {
        for (let no in map.life) {
            if (no.startsWith('_')) continue
            if (map.life[no]?.type?._value == 'n') {
                const obj = map.life[no]
                drawList.push({
                    type: "npc",
                    layer: 99,
                    x: Number(obj.x._value),
                    y: Number(obj.cy._value),
                    z: Number(obj.z?._value || 0),
                    id: obj.id._value
                });
            }
        }
    }

    // npc
    if (map.life) {
        for (let no in map.life) {
            if (no.startsWith('_')) continue
            if (map.life[no]?.type?._value == 'm') {
                const obj = map.life[no]
                drawList.push({
                    type: "mob",
                    layer: 99,
                    x: Number(obj.x._value),
                    // y: Number(obj.y._value) + Number(obj.cy._value),
                    y: Number(obj.cy._value),
                    z: Number(obj.z?._value || 0),
                    id: obj.id._value
                });
            }
        }
    }

    // reactor 
    if (map.reactor) {
        for (let no in map.reactor) {
            if (no.startsWith('_')) continue
            const obj = map.reactor[no]
            drawList.push({
                type: "reactor",
                layer: 99,
                x: Number(obj.x._value),
                y: Number(obj.y._value),
                z: Number(obj.z?._value || 0),
                flip: Number(obj.f?._value || 0) === 1,
                id: obj.id._value
            });
        }
    }

    if (map.portal) {
        for (let no in map.portal) {
            if (no.startsWith('_')) continue
            const obj = map.portal[no]
            drawList.push({
                type: "portal",
                layer: 99,
                x: Number(obj.x._value),
                y: Number(obj.y._value),
                z: Number(obj.z?._value || 0),
                pt: Number(obj.pt._value),
            });
        }
    }

    return drawList
}

const calculateItemDrawPosition = (item, offsetX, offsetY) => {
    let origin = { x: 0, y: 0 }
    switch (item.type) {
        case "tile":
            origin = getTileOrigin(item.tS, item.u, item.no);
            break
        case 'obj':
            origin = getObjOrigin(item.oS, item.l0, item.l1, item.l2);
            break
        case 'reactor':
            origin = getReactorOrigin(item.id);
            break
        case 'npc':
            origin = getNpcOrigin(item.id);
            break
        case 'mob':
            origin = getMobOrigin(item.id);
            break
        case 'portal':
            origin = getPortalOrigin(item.pt);
            break
    }

    let drawX = item.x + offsetX - origin.x;
    let drawY = item.y + offsetY - origin.y;
    return [drawX, drawY]
}

const saveImageToDisk = async (canvas, outName, outPath) => {
    await new Promise((resolve, reject) => {
        const outStream = fs.createWriteStream(outPath);
        canvas.createPNGStream().pipe(outStream);
        outStream.on("finish", () => {
            console.log(`✅ Rendered: ${outName}`);
            resolve();
        });
        outStream.on("error", reject);
    });
}

async function renderMapFromFile(filename) {
    const map = readMapFile(filename)

    const [mapWidth, mapHeight, offsetX, offsetY] = getMapGeometry(map)

    if (!mapWidth || !mapHeight) throw new Error(`❌ Invalid canvas size`);

    const canvas = createCanvas(mapWidth, mapHeight);
    const ctx = canvas.getContext("2d");

    const drawList = generateDrawList(map);

    drawList.sort((a, b) => {
        if (a.layer !== b.layer) return a.layer - b.layer;
        const typeA = getAssetPriority(a.type);
        const typeB = getAssetPriority(b.type);
        if (typeA !== typeB) return typeA - typeB;
        return (a.z ?? 0) - (b.z ?? 0);
    });

    for (const item of drawList) {
        const img = loadCachedImage(item);
        if (!img) continue;

        let [drawX, drawY] = calculateItemDrawPosition(item, offsetX, offsetY);

        // draw
        if (item.flip) {
            ctx.save();
            ctx.scale(-1, 1);
            ctx.drawImage(img, -drawX - img.width, drawY);
            ctx.restore();
        } else {
            ctx.drawImage(img, drawX, drawY);
        }
    }

    const outName = path.basename(filename, ".json").replace('.img', "") + ".png";
    const outPath = path.join(outputFolder, outName);

    if (!drawList.length) {
        console.log(`❌ Not Rendered: ${outName}`);
    } else {
        await saveImageToDisk(canvas, outName, outPath)
    }
}

const renderTask = async (file) => {
    try {
        await renderMapFromFile(file);
    } catch (err) {
        console.warn(`❌ Error rendering ${file}:`, err.message);
    }
}

async function runConcurrent(tasks, limit) {
    let index = 0;

    const startNext = async () => {
        if (index >= tasks.length) return;
        const current = index++;
        await tasks[current]();
        await startNext(); // Start next task when one finishes
    };

    const runners = Array.from({ length: limit }, () => startNext());
    await Promise.all(runners);
}

async function renderAllMapsInAllFolders() {
    const renderTasks = []

    for (let i = 1; i <= 1; i++) {
        const subfolder = path.join(rootFolder, "MapJson.wz", "Map", `Map${i}`);
        if (!fs.existsSync(subfolder)) continue;

        const files = fs.readdirSync(subfolder)
            .filter(f => f.endsWith(".json"));

        files.forEach(file =>
            renderTasks.push(() => renderTask(file))
        )
    }

    await runConcurrent(renderTasks, 20); // Run 20 tasks at a time
}

// ====== Entrypoints ======
async function start() {
    console.time("Preload");
    const preloadAll = [
        preloadAllObjs(),
        preloadAllTiles(),
        preloadAllReactors(),
        preloadAllNpcs(),
        preloadAllMobs(),
        preloadAllPortals(),
    ]
    await Promise.all(preloadAll)
    console.timeEnd("Preload");

    console.time("Render");
    // await renderMapFromFile('001010000.img.json');
    // await renderMapFromFile('100000001.img.json');
    // await renderMapFromFile('103000000.img.json');
    // await renderMapFromFile('540000000.img.json');
    // await renderMapFromFile('541020100.img.json');
    // await renderMapFromFile('990000630.img.json');
    // await renderMapFromFile('990001000.img.json');
    await renderAllMapsInAllFolders();
    console.timeEnd("Render");
}

start();
