import { useEffect, useState } from 'react';
import { decode } from 'html-entities';

import data_RenderMobOrigin from '../../../data/data_RenderMobOrigin.json';
import data_RenderNpcOrigin from '../../../data/data_RenderNpcOrigin.json';
import data_RenderObjOrigin from '../../../data/data_RenderObjOrigin.json';
import data_RenderPortalOrigin from '../../../data/data_RenderPortalOrigin.json';
import data_RenderReactorOrigin from '../../../data/data_RenderReactorOrigin.json';
import data_RenderTileOrigin from '../../../data/data_RenderTileOrigin.json';

const CDN_URL = `https://raw.githubusercontent.com/scotty66f/royals-map/refs/heads/main`
const DOMAIN_URL = window.location.origin

export default function LabelledMap({ mapId, canvasOption }) {

  const [mapData, setMapData] = useState(null);       // json
  const [loadedImage, setLoadedImage] = useState({})  // fetch cache
  const [isReadyToRender, setIsReadyToRender] = useState(false)
  const [imageData, setImageData] = useState(null);   // to store drawn canvas image

  // console.log(mapId, mapData)

  // get json
  useEffect(() => {
    const fetchAndUpdate = async () => {
      const id = mapId.toString().padStart(9, '0')
      const data = await fetchMapJSON(id)
      setMapData(data)
    }
    setIsReadyToRender(false)
    fetchAndUpdate()
  }, [mapId])

  // get render material
  useEffect(() => {
    const updateCache = async () => {
      if (!mapData) return
      const drawList = generateDrawList(mapData)

      const fetchItems = drawList.map(item => {
        return { url: generateFetchURL(item), key: generateCacheKey(item) }
      })

      const fetchTasks = fetchItems.map(async ({ url, key }) => {
        if (key in loadImage) return  // slight optimisation
        const img = await loadImage(url)
        loadedImage[key] = img
      })
      await Promise.all(fetchTasks)
      setIsReadyToRender(true)
    }
    updateCache()
  }, [mapData])

  // render canvas
  useEffect(() => {
    if (!isReadyToRender) return
    const map = mapData
    const [mapWidth, mapHeight, offsetX, offsetY] = getMapGeometry(map)
    if (!mapWidth || !mapHeight) throw new Error(`❌ Invalid canvas size`);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = mapWidth;
    canvas.height = mapHeight;

    let drawList = generateDrawList(mapData)
    drawList = filterByCanvasOption(drawList, canvasOption)

    // sort by layer, then sort by type , then sort by Z value, smaller render first
    drawList.sort((a, b) => {
      if (a.layer !== b.layer) return a.layer - b.layer;
      const typeA = getAssetPriority(a.type);
      const typeB = getAssetPriority(b.type);
      if (typeA !== typeB) return typeA - typeB;
      return (a.z ?? 0) - (b.z ?? 0);
    });

    for (const item of drawList) {
      const img = loadCachedImage(item, loadedImage);
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

    // 
    if (!drawList.length) {
      console.log(`❌ Not Rendered: ${mapId}`);
    } else {
      console.log('finish rendered')
      setImageData(canvas.toDataURL('image/png'));
    }
  }, [isReadyToRender, canvasOption])

  return (
    <div>
      {imageData ? (
        <img
          src={imageData}
          alt={`Map ${mapId}`}
          style={{ width: '100%', height: 'auto', imageRendering: 'auto' }}
        />
      ) : (
        <p>Loading map...</p>
      )}
    </div>
  );
}

//  LOAD AND CACHE
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

const loadImage = async (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // Needed for cross-origin drawing if needed
    img.onload = () => resolve(img);
    img.onerror = console.error(`Failed to fetch image : ${url}`);
    img.src = url;
  });

const generateFetchURL = (item) => {
  // 6 types of PNG locations
  let oS, tS, no, u, l0, l1, l2, id, pt, type
  switch (item.type) {
    case 'obj':
    case 'objRetry':
      oS = item.oS
      l0 = item.l0
      l1 = item.l1
      l2 = item.l2
      if (item.type == 'objRetry')
        return `${CDN_URL}/Obj/Obj/${oS}.img/${oS}.img/${l0}.${l1}.${l2}.png`
      return `${CDN_URL}/Obj/Obj/${oS}.img/${oS}.img/${l0}.${l1}.${l2}.0.png`
    case 'tile':
      tS = item.tS
      u = item.u
      no = item.no
      return `${CDN_URL}/Tile/Tile/${tS}.img/${tS}.img/${u}.${no}.png`
    case 'mob':
      id = item.id
      return `${DOMAIN_URL}/images/monsters/${id}.png`
    case 'npc':
      id = item.id
      return `${DOMAIN_URL}/images/npcs/${id}.png`
    case 'reactor':
      // probably has link to other id
      id = item.id
      if (data_RenderReactorOrigin?.[id]?.link) {
        id = data_RenderReactorOrigin[id].link
      }
      return `${CDN_URL}/Reactor.wz/${id}.img/${id}.img/0.0.png`
    case 'portal':
      pt = item.pt
      type = portalPtValueToType[pt]
      return `${CDN_URL}/MapHelper.img/MapHelper.img/portal.editor.${type}.png`
    default:
      return 'undefined'
  }
}

const generateCacheKey = (data) => {
  switch (data.type) {
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
      return `portal.editor.${portalPtValueToType[data.pt]}.png`
  }
}

const loadCachedImage = (item, loadedImage) => {
  const key = generateCacheKey(item)
  return loadedImage[key]
}

//  GET IMAGE ORIGIN OFFSET
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

// RENDERING
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

const fetchMapJSON = async (mapId) => {
  try {
    let subMap = `Map${mapId[0]}`
    let mapPath = `${CDN_URL}/MapJson/${subMap}/${mapId}.img.json` // get json from CDN
    let parsed = await fetch(mapPath);
    parsed = await parsed.json()

    // handle link issue
    const linkedMapId = parsed?.info?.link?._value
    if (linkedMapId) {
      subMap = `Map${linkedMapId[0]}`
      mapPath = `${CDN_URL}/MapJson/${subMap}/${linkedMapId}.img.json` // get json from CDN
      parsed = await fetch(mapPath);
      parsed = await parsed.json()
    }
    return parsed
  } catch (e) {
    console.error(`Failed to fetch map JSON : ${e}`)
  }
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

const filterByCanvasOption = (drawList, canvasOption) => {
  let copied = [...drawList]
  if (!canvasOption.showMob) {
    copied = copied.filter(item => item.type !== 'mob')
  }
  if (!canvasOption.showNpc) {
    copied = copied.filter(item => item.type !== 'npc')
  }
  if (!canvasOption.showReactor) {
    copied = copied.filter(item => item.type !== 'reactor')
  }
  if (!canvasOption.showPortal) {
    copied = copied.filter(item => item.type !== 'portal')
  }
  return copied
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