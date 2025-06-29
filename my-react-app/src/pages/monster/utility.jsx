import Image from "react-bootstrap/Image"
// 
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_fixMobImg from "./data_fixMobImg.json"
// 
import data_Mob from "../../../data/data_Mob.json"
import data_MB_Drops from "../../../data/data_MB_Drops.json"
import data_MobStats from "../../../data/data_MobStats.json"
import data_MapMobCount from "../../../data/data_MapMobCount.json"
import data_MB_Maps from "../../../data/data_MB_Maps.json"
// 
import data_Map from "../../../data/data_Map.json"
// 
import { findMapCategoryByMapId } from "../map/utility.jsx"

// 
const data_MobIdImg = Object.fromEntries(data_fixMobImg.map(x => [Object.keys(x), Object.values(x)]))

export const generateMobLibrary = () => {
    const mobLibrary = {}

    Object.entries(data_Mob).forEach(([mobId, mobName]) => {
        if (mobId in data_MobStats) {
            mobLibrary[mobId] = { ...data_MobStats[mobId], name: mobName }
        }
    })
    addMapCategoryToMob(mobLibrary)
    return mobLibrary
}

export const generateMobInfo = (mobId) => {
    return {
        ...data_MobStats[mobId],
        id: mobId,
        name: data_Mob[mobId],
        drops: data_MB_Drops[mobId],
        spawnMap: getSpawnMap(mobId)
    }
}

// HEAVY CALC MAPPING
const addMapCategoryToMob = (mobLibrary) => {
    const mapIdToCategory = {}  //  '100000000' => 'Henesys'

    const addMapTagToMob = (mobId, mapId) => {
        if (!mobLibrary[mobId].mapCategory) mobLibrary[mobId].mapCategory = new Set()
        mobLibrary[mobId].mapCategory.add(mapIdToCategory[mapId])
    }

    // data from inside data_MapMobCount (map.wz)
    for (let mapId in data_MapMobCount) {
        if (!(mapId in mapIdToCategory)) mapIdToCategory[mapId] = findMapCategoryByMapId(mapId)

        Object.keys(data_MapMobCount[mapId]).forEach(mobId => {
            if (!mobLibrary[mobId]) return  // skip, mobId not exist
            addMapTagToMob(mobId, mapId)
        })
    }

    // there is a problem, boss-type mob not inside data_MapMobCount
    // combine data from monsterbook together then (string.wz)
    // might have bugs for LKC mobs
    for (let mobId in data_MB_Maps) {
        if (!mobLibrary[mobId]) continue        // skip, mobId not exist
        data_MB_Maps[mobId].forEach(mapId => {
            if (!(mapId in mapIdToCategory)) mapIdToCategory[mapId] = findMapCategoryByMapId(mapId)
            addMapTagToMob(mobId, mapId)
        })
    }
}

const getSpawnMap = (targetMobId) => {
    const spawnMaps = []
    // data from inside data_MapMobCount (map.wz)
    let seen_mapId = new Set()
    Object.entries(data_MapMobCount).forEach(([mapId, mobId_to_count_obj]) => {
        Object.entries(mobId_to_count_obj).forEach(([mobId, count]) => {
            if (Number(mobId) === Number(targetMobId)) {
                const mapNameObj = data_Map[mapId]
                spawnMaps.push([mapId, mapNameObj, count])
                seen_mapId.add(mapId)
            }
        })
    })
    // there is a problem, boss-type mob not inside data_MapMobCount
    // combine data from monsterbook together then (string.wz)
    // might have bugs for LKC mobs
    let monsterBookLocationArr = data_MB_Maps[targetMobId]
    if (monsterBookLocationArr) {
        monsterBookLocationArr.forEach(mapId => {
            if (seen_mapId.has(mapId)) return
            const mapNameObj = data_Map[mapId]
            spawnMaps.push([mapId, mapNameObj, 1])
            seen_mapId.add(mapId)
        })
    }
    return spawnMaps
}


export const filterMobList = ({mobLibrary, searchParams}) => {
    // const [searchParams] = useSearchParams()
    // if (searchParams.size <= 0) return Object.entries(mobLibrary)  // No filter at first loading or if URL don't have query param 

    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTerm = filterOption.search?.toLowerCase() || ''
    const exactSearchTerm = filterOption.search?.toLowerCase() || ''

    const filter = filterOption.filter || 'any'
    const mapCategory = filterOption.category || 'any'
    const order = filterOption.order || 'id'
    const sort = filterOption.sort || 'ascending'

    let filteredMobList = Object.entries(mobLibrary)

    // console.log(filteredMobList)

    filteredMobList = filteredMobList
        .filter(x => {
            if (x[0] === exactSearchTerm) return true // id matched
            if (!x[1].name) return false
            if (x[1]?.name?.toLowerCase()?.includes(searchTerm)) return true
        })
        .filter(x => {
            if (filter === "any") return true
            if (filter === "boss" && x[1]?.boss == 1) return true
            if (filter === "monster" && !x[1].hasOwnProperty("boss")) return true
        })
        .filter(([_, { mapCategory: appearedMap }]) => {
            if (mapCategory === "any") return true
            if (!appearedMap) return false
            return appearedMap.has(mapCategory)
        })
        .sort((a, b) => {
            // exact term sort to front, then sort by property
            // if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0    // seems buggy
            if (a[1].name.toLowerCase() === b[1].name.toLowerCase() && a[1].name.toLowerCase() === exactSearchTerm) {
                // fix, if exact search matched. then sort these same mobs with "level" or default by Id
                return Number(a[1][order]) - Number(b[1][order]) || Number(a[0]) - Number(b[0])
            }
            if (a[1].name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].name.toLowerCase() === exactSearchTerm) return 1

            // default is ascending, if descend, then reverse upon return

            // order by  - [level/exp/maxHP]
            // if no data, sort to end, 0,1,2,...1000, NaN
            if (a[1][order] === undefined && b[1][order] === undefined) return 0
            if (a[1][order] === undefined) return 1
            if (b[1][order] === undefined) return -1

            // if level/exp/maxHP same, sub-sort by id Ascending
            if (a[1][order] === b[1][order]) return Number(a[0]) - Number(b[0])

            // sort by order-property ascendingly
            return Number(a[1][order]) - Number(b[1][order])
        })

    // console.log("after filter = ", filteredMobList)
    // console.log(`found : ${filteredMobList.length} records`)
    filteredMobList = sort === "descending" ? filteredMobList.reverse() : filteredMobList

    // split into 2 sections. 1st section has Order_By-property user selected.. 2nd section dont have
    filteredMobList = [
        ...filteredMobList.filter(([_id, obj]) => obj.hasOwnProperty(order)),  // with
        ...filteredMobList.filter(([_id, obj]) => !obj.hasOwnProperty(order))  // without
    ]

    return filteredMobList
}

export const renderImageWithMobId = (mobId) => {
    if (!mobId) return

    mobId = String(mobId)

    const handleError = e => {
        const fileName = `${mobId.toString().padStart(7, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: server file under /images/
        // 2: maplelegends
        // 3: maplestory.io exception list
        // 4: maplestory.io

        if (img.getAttribute("myimgindex") === '0') {
            // switch to server file under /images/ (option - 1)
            // console.log("switch to option-1")
            img.setAttribute("myimgindex", "1")
            img.src = `\\images\\monsters\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplelegends (option - 2)
            // console.log("switch to option-2")
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/monster/${fileName}`
            return
        }
        // error again? 
        if (img.getAttribute("myimgindex") === '2') {
            // switch to maplestory.io exception list (option - 3)
            // console.log("switch to option-3")
            let x = data_MobIdImg[mobId] // {region : xxx , version : xxx , animation : ...}
            if (x) x = x[0]
            img.setAttribute("myimgindex", "3")
            img.src = `https://maplestory.io/api/${x?.region}/${x?.version}/mob/${mobId}/render/${x?.animation}`
            return
        }
        if (img.getAttribute("myimgindex") === '3') {
            // switch to maplestory.io (option - 4)
            // console.log("switch to option-4")
            img.setAttribute("myimgindex", "4")
            img.src = `https://maplestory.io/api/SEA/198/mob/${mobId}/render/stand`
            return
        }
        if (img.getAttribute("myimgindex") === '4') {
            // switch to maplestory.io (option - 5 - spare)
            // console.log("switch to option-5")
            img.setAttribute("myimgindex", "5")
            img.src = "/error"
            return
        }
        if (img.getAttribute("myimgindex") === '5') {
            // return console.log('end')
            return
        }
    }

    const ImageComponent = <Image
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        id={`image-${mobId}`}
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
}

export const renderImageWithItemIdType = (itemId, itemName, type) => {
    if (!itemId || !itemName) return

    const handleError = e => {
        // console.log("trigger handleError")
        const fileName = `${itemId.toString().padStart(8, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: server file under /images/
        // 2: maplelegends
        // 3: maplestory.io exception list
        // 4: maplestory.io

        if (img.getAttribute("myimgindex") === '0') {
            // switch to server file under /images/ (option - 1)
            // console.log("switch to option-1")
            const typeString = type === "equip" ? "characters" : "items"
            img.setAttribute("myimgindex", "1")
            img.src = `\\images\\${typeString}\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplestory.io source (option - 2)
            // console.log("switch to option-2")
            const typeString = type === "equip" ? "character" : "item"
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/${typeString}/${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '2') {
            // switch to maplestory.io exception list (option - 3)
            // console.log("switch to option-3")
            img.setAttribute("myimgindex", "3")
            img.src = itemIdToExceptionUrl({ id: itemId, name: itemName })
            return
        }
        if (img.getAttribute("myimgindex") === '3') {
            // switch to maplestory.io  (option - 4)
            // console.log("switch to option-4")
            img.setAttribute("myimgindex", "4")
            img.src = `https://maplestory.io/api/SEA/198/item/${itemId}/icon?resize=1.0`
            return
        }
        if (img.getAttribute("myimgindex") === '4') {
            // switch to maplestory.io source (option - 5 - spare)
            // console.log("switch to option-5")
            img.setAttribute("myimgindex", "5")
            img.src = "/error"
            return
        }
        if (img.getAttribute("myimgindex") === '5') {
            // return console.log('end')
            return
        }
    }

    const ImageComponent = <Image
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        id={`image-${itemId}`}
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
}

export const decodeElemAttr = (elemAttr) => {
    if (!elemAttr || elemAttr === "") return ["weak : none", "strong : none", "immune : none"]
    const elemList = { F: 'Fire', I: 'Ice', L: "Lightining", S: "Poison", H: "Holy" }
    let returnStrArr = elemAttr.match(/.{2}/g).map(x => {
        let element = elemList[x[0]]
        let word = x[1] === "2" ? "Take less damage:"
            : x[1] === "3" ? "Take more damage:"
                : x[1] === "1" ? "Immune to:"
                    : "Error elem"
        return `${word} ${element}`
    })
    // console.log(returnStrArr, returnStrArr.length)
    return returnStrArr
}

export const sortDropsToFourArr = (dropsArr) => {
    if (!dropsArr) return { result: "fail" }
    const EquipDrops = []
    const UseDrops = []
    const SetupDrops = []
    const EtcDrops = []

    dropsArr.forEach(itemId => {
        if (data_Eqp.hasOwnProperty(itemId)) return EquipDrops.push({
            id: itemId,
            name: data_Eqp[itemId]
        })

        if (data_Consume.hasOwnProperty(itemId)) return UseDrops.push({
            id: itemId,
            name: data_Consume[itemId].name,
            desc: data_Consume[itemId].desc
        })

        if (data_Ins.hasOwnProperty(itemId)) return SetupDrops.push({
            id: itemId,
            name: data_Ins[itemId].name,
            desc: data_Ins[itemId].desc
        })

        if (data_Etc.hasOwnProperty(itemId)) return EtcDrops.push({
            id: itemId,
            name: data_Etc[itemId].name,
            desc: data_Etc[itemId].desc
        })
    })

    return { EquipDrops, UseDrops, SetupDrops, EtcDrops, result: "success" }
}

export const itemIdToExceptionUrl = ({ id, name }) => {
    name = name.toLowerCase()
    if (["scroll", "10%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040200/icon?resize=1.0`
    if (["scroll", "30%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040108/icon?resize=1.0`
    if (["scroll", "60%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2044501/icon?resize=1.0`
    if (["scroll", "70%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040814/icon?resize=1.0`
    if (["scroll", "100%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2041300/icon?resize=1.0`
    if (["scroll", "clean slate", "1%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2049000/icon?resize=1.0`
    if (["scroll", "chaos"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2049100/icon?resize=1.0`
    if (["nx cash", "1000"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/5680151/icon?resize=1.0`
    if (["nx cash", "5000"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/5680578/icon?resize=1.0`
    if (["white scroll fragment"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/4001533/icon?resize=1.0`
    return null
}

export const catogeryRangeList = {
    "Weapon": { min: 1300000, max: 1500000, category: "Equip", url: "/weapon" },

    "Hat": { min: 1000000, max: 1009999, category: "Armor", url: "/hat" },
    "Face Accessory": { min: 1010000, max: 1019999, category: "Accessory", url: "/faceacc" },
    "Eye Decoration": { min: 1020000, max: 1029999, category: "Accessory", url: "/eyeacc" },
    "Glove": { min: 1080000, max: 1089999, category: "Armor", url: "/gloves" },
    "Pendant": { min: 1120000, max: 1129999, category: "Accessory", url: "/pendant" },
    "Belt": { min: 1130000, max: 1139999, category: "Accessory", url: "/belt" },
    "Medal": { min: 1140000, max: 1149999, category: "Accessory", url: "/medal" },
    "Cape": { min: 1100000, max: 1109999, category: "Armor", url: "/cape" },
    "Earrings": { min: 1030000, max: 1039999, category: "Accessory", url: "/earring" },
    "Ring": { min: 1110000, max: 1119999, category: "Accessory", url: "/ring" },
    "Shield": { min: 1090000, max: 1099999, category: "Armor", url: "/shield" },
    "Overall": { min: 1050000, max: 1059999, category: "Armor", url: "/overall" },
    "Top": { min: 1040000, max: 1049999, category: "Armor", url: "/top" },
    "Bottom": { min: 1060000, max: 1069999, category: "Armor", url: "/bottom" },
    "Shoes": { min: 1070000, max: 1079999, category: "Armor", url: "/shoes" },
    "Shoulder Accessory": { min: 1150000, max: 1159999, category: "Accessory", url: "/shoulder" },


    "Use": { min: 2000000, max: 2999999, category: "Item", url: "/use" },
    "Setup": { min: 3000000, max: 3999999, category: "Item", url: "/setup" },
    "Etc": { min: 4000000, max: 4999999, category: "Item", url: "/etc" },

}

export const itemIdToNavUrl = (itemId) => {
    if (!itemId) return

    itemId = parseInt(itemId)
    if (isNaN(itemId)) return "/error"

    for (const [_, { min, max, url }] of Object.entries(catogeryRangeList)) {
        // console.log(min, max, url, itemId)
        if (itemId >= min && itemId <= max) return `${url}/id=${itemId}`
    }
    return "/error"
}

export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}

/// don touch me