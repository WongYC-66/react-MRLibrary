import data_Eqp from "../data/data_Eqp.json" assert { type: 'json' };
import data_GearStats from "../data/data_GearStats.json" assert { type: 'json' };
import data_Consume from "../data/data_Consume.json" assert { type: 'json' };
import data_ItemStats from "../data/data_ItemStats.json" assert { type: 'json' };

import data_Ins from "../data/data_Ins.json" assert { type: 'json' };
import data_Etc from "../data/data_Etc.json" assert { type: 'json' };
// 
import data_Mob from "../data/data_Mob.json" assert { type: 'json' };
import data_MB_Drops from "../data/data_MB_Drops.json" assert { type: 'json' };
// 
import data_Gacha from "../data/data_Gacha.json" assert { type: 'json' };
// 
import data_MobStats from "../data/data_MobStats.json" assert { type: 'json' };
import data_MapMobCount from "../data/data_MapMobCount.json" assert { type: 'json' };
import data_MB_Maps from "../data/data_MB_Maps.json" assert { type: 'json' };
// 
import data_Skill from "../data/data_Skill.json" assert { type: 'json' };
import data_SkillStats from "../data/data_SkillStats.json" assert { type: 'json' };
//
import data_NPC from "../data/data_NPC.json" assert { type: 'json' };
import data_NPCStats from "../data/data_NPCStats.json" assert { type: 'json' };
// 
import data_Map from "../data/data_Map.json" assert { type: 'json' };
import data_MapStats from "../data/data_MapStats.json" assert { type: 'json' };
import data_MapRange from "../data/data_MapRange.json" assert { type: 'json' };
// 
import data_Quest from "../data/data_Quest.json" assert { type: 'json' };
// 
import data_Music from "../data/data_Music.json" assert {type: 'json'}

//  ------------- EQUIP API -----------
export const generateEquipLibrary = () => {

    let equipLib = Object.entries(data_GearStats)

    // give name & category if name found
    for (let [eqpId, eqpData] of equipLib) {
        if (eqpId in data_Eqp) {
            eqpData.name = data_Eqp[eqpId]
            eqpData.category = equipIdToCategory(eqpId)
        }
    }

    let [minEquipId, maxEquipId] = findEquipRange()

    let filtered_data_GearStats = equipLib
        .filter(([_, { name }]) => name)                // remove one without name
        .filter(([id,]) => Number(id) >= minEquipId && Number(id) <= maxEquipId)       // removed Eye Rendering image..etc

    return Object.fromEntries(filtered_data_GearStats)
}



export const filterEquipList = ({ equipLibrary, searchParams, urlPathname }) => {
    // console.log({urlPathname})
    const isWeaponPage = urlPathname === "/weapon"

    let equipLibraryArr = Object.entries(equipLibrary)

    // first filter, filter library into Weapon/ Cape/ Top ...etc
    let filteredEquipList = filterByCategory({ equipLibraryArr, urlPathname, isWeaponPage })
    // console.log(filteredEquipList.length)

    // No further filter at first loading or if URL don't have query param 
    if (searchParams.size <= 0) return filteredEquipList

    // If URL has query param, further filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption?.search?.toLowerCase().split(" ") || ['']
    const exactSearchTerm = filterOption?.search?.toLowerCase() || ''

    const job = filterOption.job || '0'
    const category = filterOption.category || 'any'
    const order = filterOption.order || 'id' // id, reqLevel
    const sort = filterOption.sort || 'ascending'  // ascending, descending
    const onCosmetic = filterOption.cosmetic || 'on'  // ascending, descending
    // console.log(filterOption)

    // 1. query filter - by search name
    filteredEquipList = filteredEquipList
        .filter(([_id, { name }]) => {
            if (!name) return false
            if (_id === exactSearchTerm) return true
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })

    // 2. query filter - by weapon category // ONLY FOR WEAPON PAGE
    filteredEquipList = isWeaponPage
        ? filterWeaponByCategory({ category, filteredEquipList })
        : filteredEquipList

    // 3. query filter - by job class
    filteredEquipList = queryFilterByJob({ job, filteredEquipList })

    // 4. cosmetic filter 
    filteredEquipList = onCosmetic === 'on'
        ? filteredEquipList             // turn on, means all 
        : filteredEquipList.filter(([_, equipStats]) => isNotCosmetic(equipStats))   // null = no need cosmetics

    // add number of search term matches
    filteredEquipList = filteredEquipList.map(([_id, obj]) => {
        let matchCount = 0
        searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
        return [_id, obj, matchCount]
    })

    // 5. sort by matchCount, then by sort order
    filteredEquipList = querySorting({ order, filteredEquipList, exactSearchTerm })

    filteredEquipList = filteredEquipList.map(([_id, obj, matchCount]) => [_id, obj])

    // 6. ascending / descending
    filteredEquipList = sort === "ascending" ? filteredEquipList : filteredEquipList.reverse()

    // 7. split into 2 sections. 1st section has Order_By-property user selected.. 2nd section dont have
    filteredEquipList = [
        ...filteredEquipList.filter(([_id, obj]) => obj.hasOwnProperty(order)),  // with
        ...filteredEquipList.filter(([_id, obj]) => !obj.hasOwnProperty(order))  // without
    ]

    return filteredEquipList
}

const querySorting = ({ order, filteredEquipList, exactSearchTerm }) => {
    //  sort by matchCount, then by sort order
    const listCopy = filteredEquipList.slice()
    const key = order

    // [_id, obj, matchCount]
    listCopy.sort((a, b) => {
        // exact term sort to front, then sort by matchCount DESC, then sort by user selection...
        if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
        if (a[1].name.toLowerCase() === exactSearchTerm) return -1
        if (b[1].name.toLowerCase() === exactSearchTerm) return 1

        if (a[2] != b[2]) return b[2] - a[2] // sortby matchCount DESC
        if (order === 'id') return a[0] - b[0]

        const valueA = a[1][key]
        const valueB = b[1][key]

        // sort into 0,1,2,3,10,15,... 100, NaN/no-info
        // if (!isNaN(valueA) && isNaN(valueB)) return -1
        // if (isNaN(valueA) && !isNaN(valueB)) return 1
        // if (isNaN(valueA) && valueA === valueB) return nameB.localeCompare(nameA) //if same value, sort alphabetically
        if (valueA === undefined && valueB === undefined) return 0
        if (valueA === undefined) return 1
        if (valueB === undefined) return -1

        // if w.Att/m.Att/attackSpeed same, sub-sort by name Ascending
        if (valueA === valueB) return a[1]['name'].localeCompare(b[1]['name'])

        // sort by order-property
        return Number(valueA) - Number(valueB)
    })
    // console.log(listCopy)

    return listCopy
}



const queryFilterByJob = ({ job, filteredEquipList }) => {
    return filteredEquipList.filter(([_id, { reqJob }]) => {
        if (job === "0") return true
        if (reqJob === "0") return true
        const jobArr = reqJobToList[reqJob]
        return jobArr?.includes(parseInt(job))
    })
}

export const categoryQueryToCategory = {
    "any": "any",
    "OHSword": "One-Handed Sword",
    "OHAxe": "One-Handed Axe",
    "OHMace": "One-Handed Blunt Weapon",
    "dagger": "Dagger",
    "wand": "Wand",
    "staff": "Staff",
    "THSword": "Two-Handed Sword",
    "THAxe": "Two-Handed Axe",
    "THMace": "Two-Handed Blunt Weapon",
    "spear": "Spear",
    "polearm": "Pole Arm",
    "bow": "Bow",
    "crossbow": "CrossBow",
    "claw": "Claw",
    "knuckle": "Knuckle",
    "gun": "Gun",
    "cash": "Cash",
}

const filterWeaponByCategory = ({ category, filteredEquipList }) => {
    const weaponCategory = categoryQueryToCategory[category]
    if (weaponCategory === "any") return filteredEquipList     // no filter

    return filteredEquipList.filter(([_id, { category }]) => weaponCategory === category[2]) // Gun/Knucle/Bow, ... 
}

export const urlPathToCategoryName = {
    "/weapon": "weapon",
    "/hat": "Hat",
    "/top": "Top",
    "/bottom": "Bottom",
    "/overall": "Overall",
    "/shoes": "Shoes",
    "/gloves": "Glove",
    "/cape": "Cape",
    "/shield": "Shield",
    "/faceacc": "Face Accessory",
    "/eyeacc": "Eye Decoration",
    "/earring": "Earrings",
    "/ring": "Ring",
    "/pendant": "Pendant",
    "/belt": "Belt",
    "/medal": "Medal",
    "/shoulder": "Shoulder Accessory",
    "/any": "any",
}

const filterByCategory = ({ equipLibraryArr, urlPathname, isWeaponPage }) => {
    // first filter, filter library into Weapon/ Cape/ Top ...etc

    const keyword = urlPathToCategoryName[urlPathname].toLowerCase()

    if (keyword === 'any') return equipLibraryArr

    return equipLibraryArr
        .filter(([id, { category }]) => {
            // category : ['Equip', 'Armor', 'Hat']
            //  category[0] = 'Equip' always
            //  category[1] = 'Armor' / 'Accessory' / 'One-Handed Weapon' / 'Two-Handed Weapon'
            //  category[2] =  "Hat" /  "Face Accessory" /"Eye Decoration"  / "Earrings" / "Top"  / "Overall" /"Bottom" / "Shoes" / "Glove" / "Shield"/ "Cape" / "Ring"/ "Pendant" / "Belt" / "Medal"/ "One-Handed / Sword" / "One-Handed Axe"/ "One-Handed Blunt Weapon" / "Dagger"/ "Wand"/ "Staff"/ "Two-Handed Sword"/"Two-Handed Axe" / "Two-Handed Blunt Weapon" / "Spear" / "Pole Arm"/"Bow" / "CrossBow" / "Claw" / "Knuckle"/"Gun"/          

            let categoryDescription = isWeaponPage ? category[1] : category[2]
            categoryDescription = categoryDescription.toLowerCase()
            return isWeaponPage ? categoryDescription.includes('weapon') : categoryDescription === keyword
        })
}

export const rangeCalculator = (x, type = "", hardCap = 5) => {
    // data from https://mapleroyals.com/forum/threads/staff-blog-september-2022.209642/
    if (!x) return "no info"
    let base = parseInt(x)
    let M = Math.ceil(0.10 * base) || 1
    M = Math.min(M, hardCap)

    const godlyBonus = 5
    const min = Math.max(base - M, 0)
    const max = base + M

    const maxWithGodlyBonus = max + godlyBonus

    let returnString = ""
    type === "showGodly" ?
        // returnString = (`${min} ~ ${max} or ${maxWithGodlyBonus} (godly)`) :
        // returnString = (`${min} ~ ${max} or ${maxWithGodlyBonus}`)
        returnString = (`${min} ~ ${max} or ${maxWithGodlyBonus}`) :
        returnString = (`${min} ~ ${max} or ${maxWithGodlyBonus}`)
    return returnString
}

const findEquipRange = () => {
    let minId = Infinity
    let maxId = -Infinity
    for (let { min, max } of Object.values(catogeryRangeList)) {
        minId = Math.min(minId, min)
        maxId = Math.max(maxId, max)
    }
    return [minId, maxId]
}

export const catogeryRangeList = {
    // info used from https://maplestory.io/api/GMS/64/item/category
    // also, https://maplestory.io/api/GMS/196/item/category
    "Gun": { min: 1490000, max: 1500000, category: "Two-Handed Weapon" },
    "Knuckle": { min: 1480000, max: 1490000, category: "Two-Handed Weapon" },
    "Claw": { min: 1470000, max: 1480000, category: "Two-Handed Weapon" },
    "Dagger": { min: 1330000, max: 1340000, category: "One-Handed Weapon" },
    "Bow": { min: 1450000, max: 1460000, category: "Two-Handed Weapon" },
    "CrossBow": { min: 1460000, max: 1470000, category: "Two-Handed Weapon" },
    "Staff": { min: 1380000, max: 1390000, category: "One-Handed Weapon" },
    "Wand": { min: 1370000, max: 1380000, category: "One-Handed Weapon" },
    "One-Handed Sword": { min: 1300000, max: 1310000, category: "One-Handed Weapon" },
    "Two-Handed Sword": { min: 1400000, max: 1410000, category: "Two-Handed Weapon" },
    "One-Handed Blunt Weapon": { min: 1320000, max: 1330000, category: "One-Handed Weapon" },
    "Two-Handed Blunt Weapon": { min: 1420000, max: 1430000, category: "Two-Handed Weapon" },
    "One-Handed Axe": { min: 1310000, max: 1320000, category: "One-Handed Weapon" },
    "Two-Handed Axe": { min: 1410000, max: 1420000, category: "Two-Handed Weapon" },
    "Spear": { min: 1430000, max: 1440000, category: "Two-Handed Weapon" },
    "Pole Arm": { min: 1440000, max: 1450000, category: "Two-Handed Weapon" },

    "Cash": { min: 1701000, max: 1704000, category: "One-Handed Weapon" },

    "Hat": { min: 1000000, max: 1009999, category: "Armor" },
    "Face Accessory": { min: 1010000, max: 1019999, category: "Accessory" },
    "Eye Decoration": { min: 1020000, max: 1029999, category: "Accessory" },
    "Glove": { min: 1080000, max: 1089999, category: "Armor" },
    "Pendant": { min: 1120000, max: 1129999, category: "Accessory" },
    "Belt": { min: 1130000, max: 1139999, category: "Accessory" },
    "Medal": { min: 1140000, max: 1149999, category: "Accessory" },
    "Cape": { min: 1100000, max: 1109999, category: "Armor" },
    "Earrings": { min: 1030000, max: 1039999, category: "Accessory" },
    "Ring": { min: 1110000, max: 1119999, category: "Accessory" },
    "Shield": { min: 1090000, max: 1099999, category: "Armor" },
    "Overall": { min: 1050000, max: 1059999, category: "Armor" },
    "Top": { min: 1040000, max: 1049999, category: "Armor" },
    "Bottom": { min: 1060000, max: 1069999, category: "Armor" },
    "Shoes": { min: 1070000, max: 1079999, category: "Armor" },
    "Test Armor": { min: 1690100, max: 1690200, category: "Armor" },

    "Badge": { min: 1180000, max: 1189999, category: "Accessory" },
    "Emblem": { min: 1190000, max: 1190500, category: "Accessory" },
    "Pocket Item": { min: 1160000, max: 1169999, category: "Accessory" },
    "Power Source": { min: 1190200, max: 1190300, category: "Accessory" },
    "Shoulder Accessory": { min: 1150000, max: 1159999, category: "Accessory" },
    "Totem": { min: 1202000, max: 1202200, category: "Accessory" },
}

export function equipIdToCategory(id) {
    id = Number(id)
    let overallCategory = "Equip"
    let itemCategory = 'undefined'
    let itemSubCategory = 'undefined'

    const isIDInRange = (min, max) => id >= min && id <= max

    for (let gearClass in catogeryRangeList) {
        let { min, max, category } = catogeryRangeList[gearClass]
        if (isIDInRange(min, max)) {
            itemCategory = category
            itemSubCategory = gearClass
            break
        }
    }

    return [overallCategory, itemCategory, itemSubCategory]
    // ['Equip', 'Two-Handed Weapon', 'Gun']
    // ['Equip', 'Armor', 'Bottom']
}

export function attkSpeedToText(x) {
    let text = "not found"
    const lib = {
        2: "FASTER",
        3: "FASTER",
        4: "FAST",
        5: "FAST",
        6: "NORMAL",
        7: "SLOW",
        8: "SLOW",
        9: "SLOWER",
    }
    text = lib[x] || text
    return text;
}

const reqJobToList = {
    "-1": [-1],   //'BEGINNER',
    "0": [-1, 1, 2, 4, 8, 16],    // 'ALL',
    "1": [1],       // 'WARRIOR'
    "2": [2],       // 'MAGICIAN'
    "3": [1, 2],                   // ['WARRIOR','MAGICIAN'],
    "4": [4],       // 'BOWMAN'
    "8": [8],       // 'THIEF',
    "9": [1, 8],                 // ['WARRIOR','THIEF'],
    "10": [2, 8],                // ['MAGICIAN','THIEF'],
    "13": [1, 4, 8],             // ['WARRIOR','BOWMAN', 'THIEF'],
    "16": [16],      // 'PIRATE',
    "21": [1, 4],                 // ['WARRIOR', "BOWMAN"],
}

const decodeReqJobToList = (reqJob) => {
    return reqJobToList[reqJob]
}

export const isNotRedundantProp = (itemProp, isWeaponPage) => {
    const weaponPageRedundantProp = ['id', 'reqLevel', 'attackSpeed', 'incPAD', 'incMAD', 'tuc']
    const nonWeaponPageRedundantProp = ['id', 'reqLevel', 'tuc']

    let redundantProp = isWeaponPage ? weaponPageRedundantProp : nonWeaponPageRedundantProp

    return !redundantProp.includes(itemProp)
}

const statFields = [
    'incPAD', 'incMAD', 'attackSpeed',
    'incSTR', 'incDEX', 'incINT', 'incLUK',
    'incPDD', 'incMDD', 'incACC', 'incEVA',
    'incJump', 'incSpeed', 'incMHP', 'incMMP',
    'tuc', 'reqLevel',
];

const isNotCosmetic = (itemData) => {
    return statFields.some(stat => itemData[stat] && Number(itemData[stat]) > 0);
}

const normalizedID = (type, id) => {
    // console.log({ type, id })
    switch (type) {
        case 'maps':
            return String(id).padStart(9, '0')
        case 'characters':
        case 'items':
            return String(id).padStart(8, '0')
        case 'monsters':
        case 'skills':
        case 'npcs':
            return String(id).padStart(7, '0')
        default:
            return id
    }
}

export const addImageURL = (target, type, context) => {
    if (!Array.isArray(target)) {
        let id = normalizedID(type, target.id)
        target.imgURL = `${context.url.origin}/images/${type}/${id}.png`
        return target
    } else {
        return target.map(t => {
            let id = normalizedID(type, t.id)
            t.imgURL = `${context.url.origin}/images/${type}/${id}.png`
            return t
        })
    }
}


export const addMobThatDrops = (returnEquip, itemDropLibrary) => {
    const mobIdList = itemDropLibrary[returnEquip.id]
    returnEquip.droppedBy = mobIdList?.map(mobId => {
        return { id: mobId, name: convertMobIdToName(mobId) }
    })
    return returnEquip
}

export const addGachaLoc = (returnEquip) => {
    let gacha = []
    for (let { location, itemId } of data_Gacha) {
        if (Number(returnEquip.id) == Number(itemId)) {
            gacha.push(location)
        }
    }
    if (gacha.length) returnEquip.gacha = gacha
    return returnEquip
}

export const generateItemDropLibrary = () => {
    // [[mobId, Set()], ...]
    let itemIdToMobId = {}
    for (let mobId in data_MB_Drops) {
        for (let itemId of data_MB_Drops[mobId]) {
            if (!(itemId in itemIdToMobId)) {
                itemIdToMobId[itemId] = []
            }
            itemIdToMobId[itemId].push(mobId)
        }
    }
    return itemIdToMobId
}

export const convertMobIdToName = (id) => {
    try {
        let mobName = data_Mob[Number(id)]
        if (!mobName) throw Error()
        return mobName
    } catch {
        return `mob name error : ${id}`
    }
}

export const translateEquipStats = (returnEquip) => {
    if ('reqJob' in returnEquip) {
        let jobList = decodeReqJobToList(returnEquip.reqJob)
        returnEquip.reqJob = [returnEquip.reqJob, jobList.map(jobIdToName)]
    }
    if ('attackSpeed' in returnEquip) {
        returnEquip.attackSpeed = [returnEquip.attackSpeed, attkSpeedToText(returnEquip.attackSpeed)]
    }
    if ('tuc' in returnEquip) {
        returnEquip.upgradeAvail = returnEquip.tuc
        delete returnEquip.tuc
    }
    if ('tradeBlock' in returnEquip) {
        returnEquip.untradeable = 1
        delete returnEquip.tradeBlock
    }
    if ('only' in returnEquip) {
        returnEquip['one-of-a-kind-item'] = 1
        delete returnEquip.only
    }

    const godlyAdd5Stats = ['incSTR', 'incDEX', 'incINT', 'incLUK', 'incPAD', 'incMAD', 'incACC', 'incEVA', 'incSpeed', 'incJump']
    const godlyAdd10Stats = ['incMHP', 'incMMP', 'incPDD', 'incMDD']

    for (let stat of godlyAdd5Stats) {
        if (stat in returnEquip) {
            returnEquip[stat] = [returnEquip[stat], rangeCalculator(returnEquip[stat])]
        }
    }
    for (let stat of godlyAdd10Stats) {
        if (stat in returnEquip) {
            returnEquip[stat] = [returnEquip[stat], rangeCalculator(returnEquip[stat], "", 10)]
        }
    }

    return returnEquip
}


const jobIdToName = (jobId) => {
    const reqJobToList = {
        "-1": 'BEGINNER',
        1: 'WARRIOR',
        2: 'MAGICIAN',
        4: 'BOWMAN',
        8: 'THIEF',
        16: 'PIRATE',
    }
    return reqJobToList[jobId]
}

//  ------------- MONSTER API -----------
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

// HEAVY CALC MAPPING
const addMapCategoryToMob = (mobLibrary) => {
    const mapIdToCategory = {}  //  '100000000' => 'Henesys'

    const addMapTagToMob = (mobId, mapId) => {
        if (!mobLibrary[mobId].mapCategory) mobLibrary[mobId].mapCategory = new Set()
        mobLibrary[mobId].mapCategory.add(mapIdToCategory[mapId].toLowerCase())
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

export const generateMobInfo = (mobId) => {
    return {
        ...data_MobStats[mobId],
        id: mobId,
        name: data_Mob[mobId],
        drops: data_MB_Drops[mobId],
        spawnMap: getSpawnMap(mobId)
    }
}

export const addHasMobDrop = (mobInfo) => {
    return {
        ...mobInfo,
        drops: (mobInfo.id in data_MB_Drops)
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

export const filterMobList = ({ mobLibrary, searchParams }) => {

    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTerm = filterOption.search?.toLowerCase() || ''
    const exactSearchTerm = filterOption.search?.toLowerCase() || ''

    const filter = filterOption.filter || 'any'
    const mapCategory = filterOption?.category?.toLowerCase() || 'any'
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

export const addMapCategory = (returnMob, mobLibrary) => {
    const mobId = returnMob.id
    if (!mobLibrary[mobId].mapCategory) return returnMob

    returnMob.mapCategory = [...mobLibrary[mobId].mapCategory]
    return returnMob
}

export const organizeSpawnMap = (returnMob) => {
    returnMob.spawnMap = returnMob.spawnMap
        .map(([mapId, mapObj, count]) => {
            return { mapId, ...mapObj, count }
        })
        .toSorted((a, b) => b.count - a.count)

    return returnMob
}

export const translateMobStats = (returnMob) => {
    if (returnMob.elemAttr) {
        returnMob.elemAttr = [returnMob.elemAttr, decodeElemAttr(returnMob.elemAttr)]
    }
    if ('exp' in returnMob) {
        returnMob.exp = Math.floor(returnMob.exp * 3.2)
    }
    return returnMob
}

const elemList = { F: 'Fire', I: 'Ice', L: "Lightining", S: "Poison", H: "Holy" }

export const decodeElemAttr = (elemAttr) => {
    let elemRelation = {}
    elemAttr.match(/.{2}/g).map(x => {
        let el = elemList[x[0]]
        switch (x[1]) {
            case '1':
                elemRelation[el] = 'immune'
                break;
            case '2':
                elemRelation[el] = 'strong'
                break;
            case '3':
                elemRelation[el] = 'weak'
                break
            default:
                elemRelation[el] = 'none'
                break
        }
    })
    return elemRelation
}

export const categorizeItemDrops = (returnMob) => {
    if (!returnMob.drops) return returnMob

    const { EquipDrops, UseDrops, SetupDrops, EtcDrops } = sortDropsToFourArr(returnMob.drops)
    returnMob.drops = {
        EquipDrops,
        UseDrops,
        SetupDrops,
        EtcDrops
    }
    return returnMob
}

const sortDropsToFourArr = (dropsArr) => {
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
            // desc: data_Consume[itemId].desc
        })

        if (data_Ins.hasOwnProperty(itemId)) return SetupDrops.push({
            id: itemId,
            name: data_Ins[itemId].name,
            // desc: data_Ins[itemId].desc
        })

        if (data_Etc.hasOwnProperty(itemId)) return EtcDrops.push({
            id: itemId,
            name: data_Etc[itemId].name,
            // desc: data_Etc[itemId].desc
        })
    })

    return { EquipDrops, UseDrops, SetupDrops, EtcDrops }
}

// --------- ITEM API ------------

export const generateItemLibrary = () => {
    const itemLibrary = {
        ...data_Consume,
        ...data_Ins,
        ...data_Etc,
    }

    return itemLibrary
}

export const addItemStats = (returnItem) => {
    let itemId = returnItem.id
    if (!(itemId in data_ItemStats)) return returnItem
    returnItem = {
        ...returnItem,
        ...data_ItemStats[itemId],
    }
    return returnItem
}

export const sanitizeItemLibrary = (itemLibrary, overallCategory) => {
    if (overallCategory == 'any') return itemLibrary // not sanitized

    const categoryToItemRanges = {
        'use': { min: 2000000, max: 2999999 },
        'setup': { min: 3000000, max: 3999999 },
        'etc': { min: 4000000, max: 4999999 },
    }
    const { min, max } = categoryToItemRanges[overallCategory]

    let sanitized = { ...itemLibrary }
    for (let itemId in sanitized) {       // remove the key of hashtable if not in range
        if (min <= Number(itemId) && Number(itemId) <= max) continue
        delete sanitized[itemId]
    }
    return sanitized
}

export const filterByType = ({ itemLibrary, searchParams, overallCategory }) => {
    switch (overallCategory) {
        case 'use':
        case 'any':
            itemLibrary = preprocessUseLibrary(itemLibrary)
            return filterUseItemList({ itemLibrary, searchParams })
        case 'setup':
        case 'etc':
            return filterItemList({ itemLibrary, searchParams })
    }
}

const filterItemList = ({ itemLibrary, searchParams }) => {
    if (searchParams.size) { // If URL has query param, filter ...

        const filterOption = Object.fromEntries([...searchParams.entries()])
        const searchTermArr = filterOption?.search?.toLowerCase()?.split(' ') || [''] // split 'dark int' to ['dark', 'int']
        const exactSearchTerm = filterOption?.search?.toLowerCase() || ''

        let filteredItemList = Object.entries(itemLibrary)
            .filter(([_id, { name }]) => {
                if (!name) return false
                if (_id === exactSearchTerm) return true
                return searchTermArr.some(term => name.toLowerCase().includes(term))
            })

        // sort list by  number of search term matches, most matched at first
        filteredItemList = filteredItemList.map(([_id, obj]) => {
            let matchCount = 0
            searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
            return [_id, obj, matchCount]
        })

        filteredItemList.sort((a, b) => {
            // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
            if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
            if (a[1].name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].name.toLowerCase() === exactSearchTerm) return 1

            return b[1] - a[1]
        })

        filteredItemList = filteredItemList.map(([_id, obj, matchCount]) => [_id, obj])
        return filteredItemList
    }
    // No filter at first loading or if URL don't have query param 
    return Object.entries(itemLibrary)
}

const preprocessUseLibrary = (itemLibrary) => {
    const processed = { ...itemLibrary }
    for (let itemId in processed) {
        processed[itemId] = {
            ...itemLibrary[itemId],
            ...data_ItemStats[itemId],
            id: itemId
        }
    }
    return processed
}

const filterUseItemList = ({ itemLibrary, searchParams }) => {
    // const [searchParams] = useSearchParams()
    if (searchParams.size <= 0) return Object.entries(itemLibrary)  // No filter at first loading or if URL don't have query param 

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption?.search?.toLowerCase()?.split(' ') || ['']  // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption?.search?.toLowerCase() || ''

    const filter = filterOption.filter || 'any'
    const order = filterOption.order || 'id'
    const sort = filterOption.sort || 'ascending'
    let filteredUseItemList = Object.entries(itemLibrary)

    // console.log("before filter = ", filteredUseItemList)
    const potionKeys = ['hp', 'hpR', 'mp', 'mpR', 'eva', 'acc', 'speed', 'jump', 'mad', 'pad', 'mdd', 'pdd', 'poison', 'seal', 'weakness', 'curse']

    filteredUseItemList = filteredUseItemList
        // fuzzy seach for any name matched with space separated text, with OR condition
        .filter(([_id, { name }]) => {
            if (!name) return false
            if (_id === exactSearchTerm) return true
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        // 
        .filter(([_, obj]) => {
            if (filter === "any") return true

            if (filter === "scroll") return obj.hasOwnProperty("success")
                && !obj.hasOwnProperty("masterLevel")

            if (filter === "potion") return potionKeys.some(k => obj[k] !== undefined)
                && !obj.hasOwnProperty("monsterBook")
                && !obj.hasOwnProperty("morph")

            if (filter === "tp") return obj.hasOwnProperty('moveTo')
            if (filter === "morph") return obj.hasOwnProperty('morph')
            if (filter === "mastery") return obj.hasOwnProperty('masterLevel')
            if (filter === "sack") return obj.hasOwnProperty('type')
            if (filter === "mbook") return obj.hasOwnProperty('monsterBook')
            if (filter === "other") return !obj.hasOwnProperty("success")   // not scroll
                && !obj.hasOwnProperty('moveTo')                            // not tp
                && !obj.hasOwnProperty('morph')                            // not morphing
                && !obj.hasOwnProperty('type')                            // not sack bag
                && !obj.hasOwnProperty('masterLevel')                      // not mastery book
                && potionKeys.every(k => obj[k] == undefined)           // not potion
        })
        // reformat data to be [_id, {obj}, matchCount]
        .map(([_id, obj]) => {
            // matchCount for fuzzy search
            let matchCount = 0
            searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))

            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            // a = [_id, obj, matchCount]
            // exact term sort to front, then sort by matchCount DESC, then sort by property user select
            if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
            if (a[1].name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].name.toLowerCase() === exactSearchTerm) return 1

            // 1. sort by fuzzy search matchCount, desc, most-matched come first
            if (a[2] !== b[2]) return b[2] - a[2]

            // if undefined, sort the undefined to the end
            if (a[1][order] == undefined && b[1][order] == undefined) return 0
            if (a[1][order] == undefined) return 1
            if (b[1][order] == undefined) return -1

            // if same value, sort by mobId then
            if (a[1][order] === b[1][order]) return a[0] - b[0]


            // else, sort ascendingly, for Property of "level/...."
            return a[1][order] - b[1][order]
        })
        // remove the mathCount
        .map(([_id, obj, matchCount]) => [_id, obj])

    // console.log("after filter = ", filteredMobList)
    // console.log(`found : ${filteredMobList.length} records`)

    filteredUseItemList = sort === "ascending" ? filteredUseItemList : filteredUseItemList.reverse()

    // split into 2 sections. 1st section has Order_By-property user selected.. 2nd section dont have
    filteredUseItemList = [
        ...filteredUseItemList.filter(([_id, obj]) => obj.hasOwnProperty(order)),  // with
        ...filteredUseItemList.filter(([_id, obj]) => !obj.hasOwnProperty(order))  // without
    ]

    return filteredUseItemList
}

// --------- SKILL API -------------

export const generateSkillLibrary = () => {
    const library = { ...data_Skill }
    return library
}

export const filterSkillList = ({ skillLibrary, searchParams }) => {

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search?.toLowerCase().split(" ") || ['']
    const filter = filterOption.filter || 'any'
    const order = filterOption.order || 'id'
    const sort = filterOption.sort || 'ascending'

    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || null

    let filteredSkillList = Object.entries(skillLibrary)
    // return filteredSkillList
    // console.log(filter)

    filteredSkillList = filteredSkillList
        // fuzzy seach for any name matched with space separated text, with OR condition
        .filter(([_id, { name }]) => {
            if (!name) return false
            if (_id === exactSearchTerm) return true
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        // filter by job/any/special/magician/pirate/rogue ....
        .filter(([_id, _]) => {
            let [lowerbound, upperbound] = findRangeByFilterType(filter)
            return lowerbound <= Number(_id) && Number(_id) < upperbound
        })
        // reformat data to be [_id, {obj}, matchCount]
        .map(([_id, obj]) => {
            // 1. matchCount for fuzzy search
            let matchCount = 0
            searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            // a = [_id, obj, matchCount]
            // 1. sort by fuzzy search matchCount, desc, most-matched come first
            if (a[2] !== b[2]) return b[2] - a[2]

            // else, sort ascendingly by skill_id
            return a[0] - b[0]
        })
        // remove the mathCount
        .map(([_id, obj, matchCount]) => [_id, obj])

    // console.log("after filter = ", filteredMobList)
    // console.log(`found : ${filteredMobList.length} records`)

    return sort === "descending" ? filteredSkillList.reverse() : filteredSkillList
}

const findRangeByFilterType = (typeString) => {
    switch (typeString) {
        case 'any':
            return [0, Infinity]
        case 'beginner':
            return [0, 1000000]
        case 'special':
            return [6000000, Infinity]
        case 'swordman':
            return [1000000, 1100000]
        case 'hero':
            return [1100000, 1200000]
        case 'pal':
            return [1200000, 1300000]
        case 'dk':
            return [1300000, 2000000]
        case 'magician':
            return [2000000, 2100000]
        case 'fp':
            return [2100000, 2200000]
        case 'il':
            return [2200000, 2300000]
        case 'bishop':
            return [2300000, 3000000]
        case 'archer':
            return [3000000, 3100000]
        case 'bm':
            return [3100000, 3200000]
        case 'mm':
            return [3200000, 3300000]
        case 'rogue':
            return [4000000, 4100000]
        case 'nl':
            return [4100000, 4200000]
        case 'shad':
            return [4200000, 4300000]
        case 'pirate':
            return [5000000, 5100000]
        case 'bucc':
            return [5100000, 5200000]
        case 'sair':
            return [5200000, 5300000]
        default:
            return [0, Infinity]

    }
}

export const addJobCategory = (returnSkill) => {
    returnSkill.job = skillIdToJobString(returnSkill.id)
    return returnSkill
}

const skillIdToJobString = (id) => {
    id = Number(id)
    if (id < 1000000) return 'Beginner'

    if (id < 1100000) return 'Swordman'
    if (id < 1110000) return 'Fighter'
    if (id < 1120000) return 'Crusader'
    if (id < 1130000) return 'Hero'

    if (id < 1210000) return 'Page'
    if (id < 1220000) return 'White Knight'
    if (id < 1230000) return 'Paladin'

    if (id < 1310000) return 'Spearman'
    if (id < 1320000) return 'Dragon Knight'
    if (id < 1330000) return 'Dark Knight'

    if (id < 2100000) return 'Magician'
    if (id < 2110000) return 'Wizard (Fire/Poison)'
    if (id < 2120000) return 'Mage (Fire/Poison)'
    if (id < 2130000) return 'Arch Mage (Fire/Poison)'

    if (id < 2210000) return 'Wizard (Ice/Lightning)'
    if (id < 2220000) return 'Mage (Ice/Lightning)'
    if (id < 2230000) return 'Arch Mage (Ice/Lightning)'

    if (id < 2310000) return 'Cleric'
    if (id < 2320000) return 'Priest'
    if (id < 2330000) return 'Bishop'

    if (id < 3100000) return 'Archer'
    if (id < 3110000) return 'Hunter'
    if (id < 3120000) return 'Ranger'
    if (id < 3130000) return 'Bow Master'

    if (id < 3210000) return 'Crossbowman'
    if (id < 3220000) return 'Sniper'
    if (id < 3230000) return 'Marksman'

    if (id < 4100000) return 'Rogue'
    if (id < 4110000) return 'Assassin'
    if (id < 4120000) return 'Hermit'
    if (id < 4130000) return 'Night Lord'

    if (id < 4210000) return 'Bandit'
    if (id < 4220000) return 'Chief Bandit'
    if (id < 4330000) return 'Shadower'

    if (id < 5100000) return 'Pirate'
    if (id < 5110000) return 'Brawler'
    if (id < 5120000) return 'Marauder'
    if (id < 5130000) return 'Buccaneer'

    if (id < 5210000) return 'Gunslinger'
    if (id < 5220000) return 'Outlaw'
    if (id < 5230000) return 'Corsair'

    return 'not identified'
}

export const addSkillStats = (returnSkill) => {
    let skill_id = returnSkill.id
    if (!(skill_id) in data_SkillStats) return returnSkill
    returnSkill = {
        ...returnSkill,
        ...data_SkillStats[skill_id]
    }
    return returnSkill
}

// ----------------- NPC API -------------------------
export const generateNPCLibrary = () => {
    const library = { ...data_NPC }

    // combined data_NPC & data_NPCStats, if npcId same
    for (let npcId in data_NPCStats) {
        if (!(npcId in library)) continue
        library[npcId] = {
            ...library[npcId],
            ...data_NPCStats[npcId]
        }
    }

    // map location_id to mapObj
    for (let npcId in library) {
        if (!library[npcId].location) continue
        let locationArr = Object.values(library[npcId].location)

        locationArr = [...new Set(locationArr)] // clean duplicate npcLocation

        library[npcId].npcLocation = locationArr.map(mapId => [mapId, data_Map[mapId]])
        delete library[npcId].location
    }
    return library
}

export const organizeNpcLocation = (returnNPC) => {
    if (!returnNPC.npcLocation) return returnNPC
    returnNPC.npcLocation = returnNPC.npcLocation
        .map(([mapId, mapObj]) => {
            return { mapId, ...mapObj }
        })
    return returnNPC
}

export const filterNPCList = ({ npcLibrary, searchParams }) => {

    let filteredNPCLibrary = Object.entries(npcLibrary)

    const filterOption = Object.fromEntries([...searchParams.entries()])
    // No filter at first loading or if URL don't have query param 
    if (!Object.keys(filterOption).length) return filteredNPCLibrary

    const location = filterOption.location || 'all'
    const type = filterOption.type || 'all'

    let searchTermArr = filterOption.search?.toLowerCase().split(' ') || [''] // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || null
    const exactSearchTermID = exactSearchTerm ? exactSearchTerm.replace(/^0+/, '') : null

    searchTermArr = searchTermArr.filter(Boolean)  // filter out space
    // console.log(searchTermArr)

    const typeToHashSetMap = {
        beauty: BEAUTY_KEYWORDS,
        crafter: CRAFTER_KEYWORDS,
        job: JOB_KEYWORDS,
        merchant: MERCHANT_KEYWORDS,
        pet: PET_KEYWORDS,
        storage: STORAGE_KEYWORDS,
        transport: TRANSPORT_KEYWORDS,
        wedding: WEDDING_KEYWORDS,
        other: new Set([...BEAUTY_KEYWORDS, ...CRAFTER_KEYWORDS, ...JOB_KEYWORDS, ...MERCHANT_KEYWORDS, ...PET_KEYWORDS, ...STORAGE_KEYWORDS, ...TRANSPORT_KEYWORDS, ...WEDDING_KEYWORDS]),
    }

    filteredNPCLibrary = filteredNPCLibrary
        .filter(([_id, { name, func }]) => {
            if (!name) return false
            if (!searchTermArr.length) return true

            if (func && searchTermArr.some(term => func.toLowerCase().includes(term))) return true
            if (exactSearchTermID === _id) return true

            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })

    // filter by type user selected ['amoria', 'victoria-island', 'masteria', ...]
    filteredNPCLibrary = filterFnByLocation(filteredNPCLibrary, location)

        // filter by type user selected ['beauty', 'merchant', 'wedding', ...]
        .filter(([id, { func, name }]) => {
            if (type === 'all') return true
            if (type === 'other') return !typeToHashSetMap['other'].has(func) && !typeToHashSetMap['other'].has(name)

            let hashSet = typeToHashSetMap[type]
            return hashSet.has(func) || hashSet.has(name)
        })
        // sort list by  number of search term matches, most matched at first
        .map(([_id, obj]) => {
            let matchCount = 0
            searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
            if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
            if (a[1].name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].name.toLowerCase() === exactSearchTerm) return 1

            return b[1] - a[1]
        })
        .map(([_id, obj, matchCount]) => [_id, obj])

    return filteredNPCLibrary
}
// 
const filterFnByLocation = (filteredNPCLibrary, location) => {
    if (location === 'all') return filteredNPCLibrary

    let idBoundaryArr = locationToIdRange[location]
    // console.log({idBoundaryArr})
    if (location === 'other') { // all cannot have every single map
        idBoundaryArr = []
        Object.values(locationToIdRange).forEach(arr => idBoundaryArr.push(...arr))
        filteredNPCLibrary = filteredNPCLibrary.filter(([_, { npcLocation }]) => {
            if (!npcLocation) return false
            return npcLocation.every(([mapId, _]) => {
                mapId = Number(mapId)
                return idBoundaryArr.every(([lowerBound, upperBound]) => mapId < lowerBound || mapId > upperBound)
            })
        })
    } else {
        filteredNPCLibrary = filteredNPCLibrary.filter(([_, { npcLocation }]) => {
            if (!npcLocation) return false

            return npcLocation.some(([mapId, _]) => {
                mapId = Number(mapId)
                return idBoundaryArr.some(([lowerBound, upperBound]) => lowerBound <= mapId && mapId <= upperBound)
            })
        })
    }

    return filteredNPCLibrary
}

const locationToIdRange = {
    //  lowerbound, upperbound
    'amoria': [[670000100, 681000000]],
    'ellin': [[300000000, 300030500]],
    'maple-island': [[0, 1030000]],
    'masteria': [[600000000, 610030800]],
    'ossyria': [[200000000, 280090001]],
    'victoria-island': [[100000000, 180000004]],
    'world-tour': [[500000000, 551030200], [701000000, 702100000], [800000000, 809030000]],         // malaysia/singapore/zipangu/ china
}

export const convertNpcIdToName = (npcId) => {
    return data_NPC[npcId].name || 'npc name not found'
}

const BEAUTY_KEYWORDS = new Set([
    "Beauty Assistant",
    "Hair Salon Owner",
    "Hair Salon Assistant",
    "Dermatologist",
    "Royal Salon Assistant",
    "Plastic Surgeon",
    "Assistant Plastic Surgeon",
    "Lens Specialist",
    "Lens Wizard",
    "Lens Master",
    "Lens Broker",
    "Lens Magician",
    "Lens Expert",
    "Makeover Magician",
    "Visage Nurse",
    "Heavenly Hair-Bringer",
    "Streaky Stylist",
    "Plastic Surgery Director",
    "Plastic Surgery Doctor",
    "Skin Care Expert",
    "Hair Salon Director",
    "Artist",
    "Plastic Surgery Assistant",
    "Hair Stylist",
    "Lead Hair Stylist",
    "Assistant Hair Stylist",
    "Doctor Assistant",
    "Heavenly Hair-Bringer",
    "Lens Expert",
    "Makeover Magician",
    "Visage Nurse",
    "Wedding Wear Vendor",
    "Cathedral Wedding Coordinator",
    "Chapel Wedding Coordinator",
    "Plastic Surgery Assistant",
    "Hair Style Assistant",
    "Optician",
    "Hair salon assistant",
    "Salon owner",
    "Plastic Surgery Assistant",
    "Plastic Surgery"
]);

const JOB_KEYWORDS = new Set([
    "Bowman Job Instructor",
    "Magician Job Instructor",
    "Warrior Job Instructor",
    "Thief Job Instructor",
    "Pirate Job Instructor",
    "Bowman Instructor",
    "Bowman Training Instructor",
    "Entrance to Bowman Training Center",
    "Warrior Instructor",
    "Warrior Training Instructor",
    "Entrance to Warrior Training Center",
    "Magician Instructor",
    "Magician Training Instructor",
    "Entrance to Magician Training Center",
    "Thief Instructor",
    "Thief Training Instructor",
    "Entrance to Thief Training Center",
    "Pirate Instructor",
    "Pirate Training Instructor",
    "Entrance to Pirate Training Center",
    "The Chief Knight of Light",
    "The Chief Knight of Fire",
    "The Chief Knight of the Wind",
    "Chief Knight of Darkness",
    "Chief Knight of Lightning",
    "Tutorial Guide",
    "Training Instructor",
    "Mount Trainer",
    "Knight Trainer",
    "Knight Sergeant",
    "Instructor Penguin",
    "3rd Job - Warrior Instructor",
    "3rd Job - Magician Instructor",
    "3rd Job - Bowman Instructor",
    "3rd Job - Thief Instructor",
    "3rd Job - Pirate Instructor",
    "4th Job - Warrior Instructor",
    "4th Job - Magician Instructor",
    "4th Job - Bowman Instructor",
    "4th Job - Thief Instructor",
    "4th Job Pirate Instructor",
]);

const MERCHANT_KEYWORDS = new Set([
    "Weapon Seller",
    "Grocer",
    "Armor Seller",
    "24 Hr Mobile Store",
    "Info Merchant",
    "Scroll Seller",
    "General Merchant",
    "Sauna Manager",
    "Weapon & Armor Seller",
    "Merchant",
    "Tree Ornament Merchant",
    "Weapon Merchant",
    "Pet Merchant",
    "Item market",
    "General Dealer",
    "General Store",
    "Chocolate Ingredient Seller",
    "Coin Shop",
    "Item Seller",
    "Local Product Merchant",
    "Denpura Chef",
    "Dango Chef",
    "Takoyaki Chef",
    "Yakisoba Chef",
    "Ramen Cook",
    "Potion Seller",
    "Local Specialities",
    "Lunar New Year Special Supply",
    "Special Shop",
    "Merchant Intermediary",
    "Maple 7th Day Market Tout",
    "Special Item Merchant",
    "Weapon Store",
    "Potion Store",
    "Armor Store",
    "Local Specialities",
    "Lunar New Year Special Supply",
    "Vendor",
    "Weapon dealer",
    "Potion Store",
    "General Store",
    "Former Traveling Merchant"
]);

const OTHER = new Set([
    "Buddy List Admin",
    "Family Guide",
    "Doctor w/o License",
    "Master of MiniGame",
    "Cabin Crew",
    "Crewmember",
    "Internet Cafe Worker",
    "Internet Cafe Owner",
    "Public Service Worker",
    "Genius Composer",
    "CEO of Big Hit Records",
    "Seven Star Chef",
    "Station Guide",
    "Crewman",
    "Empress",
    "Tactician",
    "Drill Hall Gatekeeper",
    "Knight Sergeant",
    "Not a Suspicious Person",
    "Puppeteer",
    "Master of Disguise",
    "Black Witch",
    "Owner",
    "Assistant",
    "Patissier",
    "Monster Carnival",
    "Zoo Trainer",
    "Gatekeeper",
    "Dragon Squad Leader",
    "Retired Dragon Trainer",
    "Royal Guard Captain",
    "Expedition Leader",
    "Magicians' Representative",
    "Magician's Representative",
    "Warrior Representative",
    "Thief Representative",
    "Lion King",
    "Queen",
    "Chief Knight",
    "Locksmith",
    "Gardener",
    "Event Assistant",
    "Master of Lock-Picking",
    "Weapon Rental for Internet Cafe",
    "Monk of Honor",
    "Baby Bird Manager",
    "Emissary of Honor",
    "11th Anniversary Guide",
    "Package Deliverer",
    "Counselor",
    "Daily Ledger",
    "Pet Scientist",
    "Christmas Party Quest NPC",
    "Wizet Wizard",
    "Easter Event",
    "Love Fairy",
    "Lovable Parents",
    "Chapel Staff",
    "Chapel Photo Specialist",
    "Chapel Marriage Maestro",
    "Amoria Ambassador",
    "Witch at Large - Halloween",
    "Pie Advocate - Thanksgiving",
    "Furrious Santa - Maplemas",
    "Temple Priestess - Hanukkah",
    "Soda Jerk",
    "Temple Guide - Hanukkah",
    "NLC Mayor",
    "NLC Subway staff",
    "The Snail",
    "MBI Agent",
    "Stepmom",
    "Toy Maker",
    "Butler",
    "The CVS Guy",
    "The Target Guy",
    "The Duane Reade Girl",
    "The 7-Eleven Guy",
    "The Rite-Aid Guy",
    "The Best Buy Girl",
    "Taru Spirit",
    "Antique Collector",
    "Plumber",
    "Dream Interpreter",
    "Farmer's Daughter",
    "Daughter of the Poultry Farm Owner",
    "Santa's Lost Stars",
    "Snow Fairy",
    "Reindeer",
    "Treasure Hunter",
    "Fortune Teller",
    "Ghostship Keeper",
    "Souvenir Attendant",
    "Lens Broker",
    "Lens Magician",
    "NLC Mayor",
    "Feast Helper",
    "Halloween Gauntlet Coordinator",
    "Monster Slayer",
    "Alchemist of Life",
    "Goddess of the Moon",
]);

const STORAGE_KEYWORDS = new Set([
    "Storage Keeper",
    "Storage Owner",
    "Warehouse Keeper",
    "Store Banker",
    "Warehouse keeper",
    "Storage"
]);

const CRAFTER_KEYWORDS = new Set([
    "Item Maker",
    "Item Creator",
    "Ore Refiner",
    "Old Blacksmith",
    "Glove Maker",
    "Guild Emblem Creator",
    "Refining Expert",
    "Shoemaker",
    "Weapon Creator",
    "Potion Creator",
    "Zenumist president",
    "Alcadno President",
    "Weapon Technician"
]);

const PET_KEYWORDS = new Set([
    "Pet Food Merchant",
    "Pet Master",
    "Pet Trainer",
    "Zoo Trainer",
    "Kenta",
    "Pet Scientist",
]);

const TRANSPORT_KEYWORDS = new Set([
    "Station Cleark",
    "Subway Worker",
    "Subway Personnel",
    "To Victoria Island",
    "To Rien",
    "Selling Ticket to Ludibrium",
    "Dungeon Guide",
    "Selling Ticket to Orbis",
    "Ticket box desk",
    "Ticket Usher",
    "Public Transportation",
    "Multi-Functional Portal",
    "Warp Helper",
    "Pilot",
    "Malaysia Tour Guide",
    "Entrance - Holiday PQ Map",
    "Ticketing Usher",
    "World Tour Guide",
    "NLC Subway staff",
    "Pilot",
    "Tour Guide",
    "Cabin Crew",
    "Crewmember",
    "Dolphin",
    "Retired Dragon Trainer",
    "Crew",
]);

const WEDDING_KEYWORDS = new Set([
    "Wedding Jeweler",
    "Love Fairy",
    "Cathedral Wedding Officiator",
    "Amoria's Guiding Light",
    "Cathedral Assistant",
    "Cathedral Photo Specialist",
    "Chapel Staff",
    "Chapel Photo Specialist",
    "Chapel Marriage Maestro",
    "Chapel Wedding Coordinator",
    "Cathedral Wedding Coordinator",
    "Wedding Planner",
    "Wedding Wear Vendor",
    "Elegant Arrow-gance",
    "Amoria Ambassador",
]);

//  ------- MAP API -----
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
    // if (!Object.keys(filterOption).length) return filteredMapLibrary

    const location = filterOption.location || 'any'

    let searchTermArr = filterOption.search?.toLowerCase().split(' ') || [''] // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || ''
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

export const addHDMapImageURL = (returnMap) => {
    let id = normalizedID('maps', returnMap.id)
    returnMap.HDImgURL = `https://maplestory.io/api/GMS/83/map/${id}/render`
    return returnMap
}

export const addMapStats = (returnMap) => {
    let mapId = returnMap.id
    if (!(mapId in data_MapStats)) return returnMap
    returnMap = {
        ...returnMap,
        ...data_MapStats[mapId],
    }
    return returnMap
}

export const addMapBgmURL = (returnMap) => {
    let bgm = returnMap.bgm.split('/')[1]
    returnMap.bgmURL = `https://github.com/scotty66f/royals-ost/raw/refs/heads/main/audio/${bgm}.mp3`
    return returnMap
}

export const translateNPCId = (returnMap) => {
    if (!returnMap.npc) return returnMap
    returnMap.npc = returnMap.npc.map(npcId => {
        return { id: npcId, name: convertNpcIdToName(npcId) }
    })
    return returnMap
}

export const addMobSpawn = (returnMap) => {
    // from map.wz
    let mapId = Number(returnMap.id)
    if (!(mapId in data_MapMobCount)) return returnMap

    returnMap.mob = data_MapMobCount[mapId]
    return returnMap
}

export const addMonsterBookSpawn = (returnMap) => {
    // check /map/id=280030000, zak mobs
    // there is a problem, boss-type mob not inside data_MapMobCount
    // combine data from monsterbook together then (string.wz)
    // might have bugs for LKC mobs
    let currMapId = Number(returnMap.id)
    const seenMobId = new Set(Object.keys(returnMap?.mob || {}))

    for (let mobId in data_MB_Maps) {
        if (seenMobId.has(mobId)) continue
        let mapIdList = data_MB_Maps[mobId].map(Number)
        if (mapIdList.includes(currMapId)) {
            // add boss into spawn
            returnMap.mob = {
                ...returnMap.mob,
                [mobId]: 1
            }
        }
    }
    return returnMap
}

export const organizeMobSpawn = (returnMap) => {
    if (!returnMap.mob) return returnMap
    returnMap.mob = Object.entries(returnMap.mob)
        .map(([mobId, count]) => {
            return { mobId, name: convertMobIdToName(mobId), count }
        })
    return returnMap
}
// --------- QUEST API ----------
export const generateQuestLibrary = () => {
    const lib = { ...data_Quest }
    // add npc_id + npc_name searchable
    for (let questId of Object.keys(lib)) {
        const npc_id = lib[questId].Check && lib[questId].Check['0']
            ? lib[questId].Check['0'].npc
            : null
        const npcName = data_NPC[npc_id] ? data_NPC[npc_id].name : null
        lib[questId].npcId = npc_id
        lib[questId].npcName = npcName
    }
    return lib
}

export const filterQuestList = ({ questLibrary, searchParams }) => {
    let filteredQuestLibrary = Object.entries(questLibrary)

    const filterOption = Object.fromEntries([...searchParams.entries()])
    // No filter at first loading or if URL don't have query param 
    if (!Object.keys(filterOption).length) return filteredQuestLibrary

    const location = filterOption.location || 'all'
    const type = filterOption.type || 'all'

    let searchTermArr = filterOption.search?.toLowerCase().split(' ') || [''] // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || null

    searchTermArr = searchTermArr.filter(Boolean)  // filter out space
    // console.log(searchTermArr)

    // console.log(filteredQuestLibrary)

    filteredQuestLibrary = filteredQuestLibrary
        .filter(([_id, obj]) => {
            const { QuestInfo } = obj
            if (!searchTermArr.length) return true
            if (exactSearchTerm === _id) return true
            if (!QuestInfo) return false
            if (!QuestInfo.name) return false

            return searchTermArr.some(term => QuestInfo.name.toLowerCase().includes(term))
                || searchTermArr.some(term => obj.npcName?.toLowerCase().includes(term))
                || searchTermArr.some(term => obj.npcId === term)
        })
        // filter by type user selected ['victoria-island', 'leafre', 'neo-tokyo', ...]
        .filter(([_id, { QuestInfo }]) => {
            if (location === 'all') return true
            if (!QuestInfo) return false
            if (!QuestInfo.area) return false

            const locationToAreaCode = {
                'job': '10',
                'maple-island': '20',
                'victoria': '30',
                'elnath': '33',
                'ludus': '37',
                'ellin': '39',
                'leafre': '41',
                'neo-tokyo': '43',
                'mulung': '44',
                'masteria': '45',
                'temple': '46',
                'party': '47',
                'world': '48',
                'malaysia': '49',
                'event': '50',
                'title': '51',
                'zakum': '11',
                'hero': '6',
            }

            return QuestInfo.area == locationToAreaCode[location]
        })
        // sort list by  number of search term matches, most matched at first
        .map(([_id, obj]) => {
            let matchCount = 0
            if (obj.QuestInfo && obj.QuestInfo.name) {
                searchTermArr.forEach(term => matchCount += obj.QuestInfo.name.toLowerCase().includes(term))
            }
            if (obj.npcName) {
                searchTermArr.forEach(term => matchCount += obj.npcName.toLowerCase().includes(term))
            }
            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            if (!a[1].QuestInfo || !a[1].QuestInfo.name) return 1
            if (!b[1].QuestInfo || !b[1].QuestInfo.name) return -1

            // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
            if (a[1].QuestInfo.name.toLowerCase() === b[1].QuestInfo.name.toLowerCase()) return 0
            if (a[1].QuestInfo.name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].QuestInfo.name.toLowerCase() === exactSearchTerm) return 1

            if (a[2] != b[2]) return b[2] - a[2]

            return a[0] - b[0]
        })
        .map(([_id, obj, matchCount]) => [_id, obj])

    return filteredQuestLibrary
}

const convertAreaCodeToName = (val) => {
    const map = {
        6: 'Hero With The Lost Memory',
        10: 'Job',
        15: 'Cygnus Knights',
        11: 'Zakum',
        20: 'Maple Island',
        30: 'Victoria Island',
        33: 'Elnath Mt + Aquaroad',
        37: 'Ludus Lake',
        39: 'Ellin Forest',
        41: 'Leafre',
        43: 'Neo Tokyo',
        44: 'Mu Lung + Nihal Desert',
        45: 'Masteria',
        46: 'Temple of Time',
        47: 'Party Quest',
        48: 'World Tour',
        49: 'Malaysia',
        50: 'Event',
        51: 'Title',
    }
    return map[val]
}

export const addQuestLocation = (returnQuest) => {
    if (!returnQuest.QuestInfo) return returnQuest
    if (!returnQuest.QuestInfo.area) return returnQuest

    returnQuest.location = convertAreaCodeToName(returnQuest.QuestInfo.area)
    return returnQuest
}

export const sanitizeQuestInfo = (returnQuest) => {
    // remove too much info, refer to Quest Search Page for clean data
    let deepClone = JSON.parse(JSON.stringify(returnQuest))
    delete deepClone.Act
    delete deepClone.Check
    delete deepClone.Say
    if (deepClone.QuestInfo) {
        let i = 0
        do {
            delete deepClone.QuestInfo[i]
            i++
        } while (i in deepClone.QuestInfo)

        delete deepClone.QuestInfo.parent
    }
    return deepClone
}

// ---------- MUSIC API ------------
export const generateMusicLibrary = () => {
    let musicLib = {}
    for (let name in data_Music) {
        let trimmednName = name
            .replaceAll('.mp3', '')
            .toLowerCase()

        musicLib[trimmednName] = {
            ...data_Music[name],
            bgm: name,
            bgmURL: `https://github.com/scotty66f/royals-ost/raw/refs/heads/main/audio/${name}`
        }
    }
    return musicLib
}

export const filterMusicLibrary = ({ musicLibrary, searchParams }) => {

    const filterOption = Object.fromEntries([...searchParams.entries()])

    const searchTerm = filterOption.search?.toLowerCase() || ''

    let filteredMusicList = Object.entries(musicLibrary)

    filteredMusicList = filteredMusicList
        .filter(([name], property) => name.includes(searchTerm))

    return filteredMusicList
}

// ----------- PAGINATION -------------
export const applyPagination = (resArr, searchParams, type) => {
    // BEST BANDWITH SAVING METHOD!
    const itemsPerPage = 50 // max gain = 99% size reduction
    const NoNeedPaginationType = new Set([
        // 
    ])
    const NeedPaginationType = new Set([
        'music',     //  28 KB -> 8 KB
        'equip',     //    3 MB -> 16 KB
        'item',      // 1.54 MB -> 11 KB
        'map',       // 1.52 MB -> 10 KB
        'monster',   //  456 KB -> 17 KB
        'npc',       // 1.18 MB -> 32 KB
        'quest',     //  464 KB ->  7 KB
        'skill',     //  520 KB -> 49 KB
    ])

    if (NoNeedPaginationType.has(type)) return resArr    // not paginated

    let pageNum = Number(searchParams.get('page') || 1)
    if (pageNum <= 0) pageNum = 1
    const startIdx = (pageNum - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage

    const data = resArr.slice(startIdx, endIdx)
    const totalItems = resArr.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const lastIdx = resArr.length - 1

    const hasMore = endIdx < lastIdx

    return {
        data,
        pagination: {
            page: pageNum,
            itemsPerPage,
            totalPages,
            totalItems,
            hasMore,
        }
    }
    /*
    {
        "data": [
            { "id": 1, "name": "Item A" },
            { "id": 2, "name": "Item B" }
        ],
        "pagination": {
            "page": 1,
            "pageSize": 2,
            "totalPages": 5,
            "totalItems": 10,
            "hasMore": true
        }
    }  
    */
}