import data_Eqp from "../data/data_Eqp.json" assert { type: 'json' };
import data_GearStats from "../data/data_GearStats.json" assert { type: 'json' };

export const generateEquipLibrary = () => {

    let equipLib = Object.entries(data_GearStats)

    // give name & category if name found
    for (let [eqpId, eqpData] of equipLib) {
        if (eqpId in data_Eqp) {
            eqpData.name = data_Eqp[eqpId]
            eqpData.category = equipIdToCategory(eqpId)
        }
    }

    // remove one without name
    let filtered_data_GearStats = equipLib.filter(([_, { name }]) => name)

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
    const lib = {
        "-1": [-1],   //'BEGINNER',
        "0": [-1, 1, 2, 4, 8, 16],    // 'ALL',
        "1": [1],       // 'WARRIOR'
        "2": [2],       // 'MAGICIAN'
        "3": [1, 2],                   // ['WARRIOR','MAGICIAN'],
        "4": [4],       // 'BOWMAN'
        "8": [8],       // 'THIEF',
        "9": [1, 8],                 // ['WARRIOR','THIEF'],
        "13": [1, 4, 8],             // ['WARRIOR','BOWMAN', 'THIEF'],
        "16": [16]      // 'PIRATE',
    }
    return filteredEquipList.filter(([_id, { reqJob }]) => {
        if (job === "0") return true
        if (reqJob === "0") return true
        const jobArr = lib[reqJob]
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

export const decodeReqJobToList = (reqJob) => {
    const lib = {
        "-1": [-1],   //'BEGINNER',
        "0": [-1, 1, 2, 4, 8, 16],    // 'ALL',
        "1": [1],       // 'WARRIOR'
        "2": [2],       // 'MAGICIAN'
        "3": [1, 2],                   // ['WARRIOR','MAGICIAN'],
        "4": [4],       // 'BOWMAN'
        "8": [8],       // 'THIEF',
        "9": [1, 8],                 // ['WARRIOR','THIEF'],
        "13": [1, 4, 8],             // ['WARRIOR','BOWMAN', 'THIEF'],
        "16": [16]      // 'PIRATE',
    }
    return lib[reqJob]
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

const normalizedID = (type, id) => {
    // console.log({ type, id })
    switch (type) {
        case 'characters':
            return String(id).padStart(8, '0')
        default:
            return id
    }
}