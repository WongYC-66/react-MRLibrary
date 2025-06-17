import { decode } from 'html-entities'
// 
import Image from "react-bootstrap/Image"
// 
import data_Map from "../../../data/data_Map.json"
import data_MapRange from "../../../data/data_MapRange.json"
import data_MapStats from "../../../data/data_MapStats.json"
import data_MobMap from "../../../data/data_Mob_MapOnly.json"
// 
import RenderedMap from "./RenderedMap.jsx";
import { useState } from 'react'
// 
export const generateMapLibrary = () => {
    const library = { ...data_Map }

    // MAP.WZ has some maps but not given name in STRING.WZ
    Object.keys(data_MapStats).forEach(key => {     // give dummy name to unnamed map that existed in map.wz, but not in string.wz
        if (key in library) return
        library[key] = {
            "mapCategory": "",
            "streetName": "",
            "mapName": "",
        }
    })

    // giveMyCustomMapCategoryName
    for (let mapId in library) {
        library[mapId].myMapCateogry = findMapCategoryByMapId(mapId)
    }
    return library
}


export const filterMapList = ({ mapLibrary, searchParams }) => {

    let filteredMapLibrary = Object.entries(mapLibrary)

    const filterOption = Object.fromEntries([...searchParams.entries()])
    // No filter at first loading or if URL don't have query param 
    if (!Object.keys(filterOption).length) return filteredMapLibrary

    const location = filterOption.location || 'any'

    let searchTermArr = filterOption.search?.toLowerCase().split(' ') || [''] // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || null
    const exactSearchTermID = exactSearchTerm ? exactSearchTerm.replace(/^0+/, '') : null

    searchTermArr = searchTermArr.filter(Boolean)  // filter out space
    // console.log(searchTermArr)
    // console.log(exactSearchTermID)
    // console.log(location)

    // console.log(filteredMapLibrary)

    filteredMapLibrary = filteredMapLibrary
        .filter(([_id, obj]) => {
            if (!searchTermArr.length) return true
            const streetName = obj.streetName || ''
            const mapName = obj.mapName || ''

            if (_id === exactSearchTermID) return true

            return searchTermArr.some(term => streetName.toLowerCase().includes(term))
                || searchTermArr.some(term => mapName.toLowerCase().includes(term))
        })
        // filter by type user selected ['maple', 'victoria-island', 'elin', 'thai', ...]
        .filter(([_id, { myMapCateogry }]) => {
            if (location === 'any') return true
            return myMapCateogry === location
        })
        // sort list by  number of search term matches, most matched at first
        .map(([_id, obj]) => {
            let matchCount = 0
            if (obj.streetName) {
                searchTermArr.forEach(term => matchCount += obj.streetName.toLowerCase().includes(term))
            }
            if (obj.mapName) {
                searchTermArr.forEach(term => matchCount += obj.mapName.toLowerCase().includes(term))
            }
            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
            if (a[1]?.streetName?.toLowerCase() === exactSearchTerm) return -1
            if (b[1]?.streetName?.toLowerCase() === exactSearchTerm) return 1

            if (a[2] != b[2]) return b[2] - a[2]    // matchcount

            return a[0] - b[0]          // last, id
        })
        .map(([_id, obj, matchCount]) => [_id, obj])

    return filteredMapLibrary
}

// 
export const RenderImageWithMapId = ({ mapId }) => {
    if (!mapId) return null;

    const [hasError, setHasError] = useState(false);
    const fileName = `${String(mapId).padStart(9, '0')}.png`;
    const imagePath = `/images/maps/${fileName}`; // Use forward slashes

    const canvasOption = {
        showMob: false,
        showNpc: false,
        showReactor: false,
        showPortal: false,
    }

    return (
        <>
            {hasError
                ? <RenderedMap mapId={mapId} canvasOption={canvasOption} />
                : <Image
                    id={`image-${mapId}`}
                    myimgindex="0"
                    src={imagePath}
                    className="mw-50"
                    fluid
                    alt="Image not found"
                    onError={() => {
                        console.error(`Failed to load image: ${imagePath}`);
                        setHasError(true);
                    }}
                />
            }
        </>
    );
};

// obsolete
export const renderHDImageWithMapId = (mapId) => {
    if (!mapId) return

    const handleError = e => {
        const fileName = `${String(mapId).padStart(9, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: rendered HD map by me
        // 2: maplestory.io
        // 3: maplestory.io
        // 4: server file under /images/
        // 5: maplelegends

        if (img.getAttribute("myimgindex") === '0') {
            img.setAttribute("myimgindex", "1")
            img.src = `https://raw.githubusercontent.com/scotty66f/royals-rendered-map/refs/heads/main/Map/${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplestory.io/api/GMS/83/map/${Number(mapId)}/render`
            return
        }
        if (img.getAttribute("myimgindex") === '2') {
            img.setAttribute("myimgindex", "3")
            img.src = `https://maplestory.io/api/SEA/198/map/${Number(mapId)}/render`
            return
        }

        if (img.getAttribute("myimgindex") === '3') {
            img.setAttribute("myimgindex", "4")
            img.src = `\\images\\maps\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '4') {
            img.setAttribute("myimgindex", "5")
            img.src = `https://maplelegends.com/static/images/lib/map/${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '5') {
            img.setAttribute("myimgindex", "6")
            img.src = "/error"
            return
        }
    }

    const ImageComponent = <Image
        id={`image-${mapId}`}
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        className="mw-50"
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
}

export const convertMapIdToUrl = (id) => {
    if (!id) return '/error'
    id = Number(id)
    id = String(id).padStart(9, '0')
    return `/map/id=${id}`
}

export const convertMapIdToName = (id) => {
    if (!id) return `map name error : ${id}`
    id = Number(id)
    if (!data_Map[id]) return `map name error : ${id}`
    const name = `${data_Map[id].streetName} - ${data_Map[id].mapName}`
    return decode(name)
}

export const parseBgmToName = (rawName) => {
    return decode(rawName.split('/')[1])
}

export const mapCategory = [
    "Amoria",
    "Aquarium",
    "Ariant",
    "AriantPQ",
    "Boat",
    "CPQ",
    "CPQ2",
    "China",
    "Dojo",
    "EPQ",
    "EasternChina",
    "ElNath",
    "EllinForest",
    "Events",
    "FlorinaBeach",
    "GM",
    "GPQ",
    "HauntedHouse",
    "HerbTown",
    "KoreanFolkTown",
    "LHC",
    "LMPQ",
    "LPQ",
    "Leafre",
    "Ludibrium",
    "Magatia",
    "Malaysia",
    "MapleIsland",
    "MuLung",
    "NewLeafCity",
    "OPQ",
    "OmegaSector",
    "Orbis",
    "Others",
    "PPQ",
    "PhantomForest/CWK",
    "RJPQ",
    "Singapore",
    "Sleepywood",
    "TempleOfTime",
    "Thailand",
    "VictoriaIsland",
    "Zakum",
    "Zipangu"
]

export const findMapCategoryByMapId = (mapId) => {
    mapId = Number(mapId)
    for (let { region, minMapId, maxMapId } of data_MapRange) {
        minMapId = Number(minMapId)
        maxMapId = Number(maxMapId)
        if (minMapId <= mapId && mapId <= maxMapId) {
            return region
        }
    }
    return "NULL" // not found
}

export const addMonsterBookSpawn = (mapInfo) => {
    // check /map/id=280030000, zak mobs
    // there is a problem, boss-type mob not inside data_MapMobCount
    // combine data from monsterbook together then (string.wz)
    // might have bugs for LKC mobs
    let currMapId = Number(mapInfo.mapId)
    const seenMobId = new Set(Object.keys(mapInfo?.mob || {}))

    for (let mobId in data_MobMap) {
        if (seenMobId.has(mobId)) continue
        let mapIdList = data_MobMap[mobId].map(Number)
        if (mapIdList.includes(currMapId)) {
            // add boss into spawn
            mapInfo.mob = {
                ...mapInfo.mob,
                [mobId]: 1
            }
        }
    }
    // console.log(mapInfo)
    return mapInfo
}

export const portalPtValueToType = {
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

export const portalPtValueToTypeName = {
    0: 'start point',
    1: 'invisible',
    2: 'visible',
    3: 'collision',
    4: 'changable',
    5: 'town portal',
    6: 'script',
    7: 'changable invisible',
    8: 'script invisible',
    9: 'script collision',
    10: 'hidden',
    11: 'script hidden',
    12: 'vertical sprting',
    13: 'custom impact spring',
    14: 'unknown PCIG',
}

// 
export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}
