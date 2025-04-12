import { useSearchParams, useLocation, Link } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
export const filterEquipList = (equipLibrary) => {
    const [searchParams] = useSearchParams()
    const urlPathname = useLocation().pathname
    const isWeaponPage = urlPathname === "/weapon"

    let equipLibraryArr = Object.entries(equipLibrary)

    let filteredEquipList = filterByCategory({ equipLibraryArr, urlPathname, isWeaponPage })

    // No further filter at first loading or if URL don't have query param 
    if (searchParams.size <= 0) return filteredEquipList

    // If URL has query param, further filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search.toLowerCase().split(" ")
    const exactSearchTerm = filterOption.search.toLowerCase()

    const job = filterOption.job
    const category = filterOption.category
    const order = filterOption.order  // id, reqLevel
    const sort = filterOption.sort   // ascending, descending
    // console.log(filterOption)

    // 1. query filter - by search name
    filteredEquipList = filteredEquipList
        .filter(([_id, { name }]) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })

    // 2. query filter - by weapon category // ONLY FOR WEAPON PAGE
    filteredEquipList = isWeaponPage
        ? queryFilterByCategory({ category, filteredEquipList })
        : filteredEquipList

    // 3. query filter - by job class
    filteredEquipList = queryFilterByJob({ job, filteredEquipList })

    // add number of search term matches
    filteredEquipList = filteredEquipList.map(([_id, obj]) => {
        let matchCount = 0
        searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
        return [_id, obj, matchCount]
    })

    // 4. sort by matchCount, then by sort order
    filteredEquipList = querySorting({ order, filteredEquipList, exactSearchTerm })

    filteredEquipList = filteredEquipList.map(([_id, obj, matchCount]) => [_id, obj])

    // 5. ascending / descending
    filteredEquipList = sort === "ascending" ? filteredEquipList : filteredEquipList.reverse()

    // 6. split into 2 sections. 1st section has Order_By-property user selected.. 2nd section dont have
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

const queryFilterByCategory = ({ category, filteredEquipList }) => {
    const categoryKeywords = {
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
        "gun": "Gun"
    }
    const cat_keyword = categoryKeywords[category]
    return filteredEquipList.filter(([_id, { category }]) => {
        if (cat_keyword === "any") return true
        const words = category[2] // Gun/Knucle/Bow, ... 
        return words === cat_keyword
    })
}

const filterByCategory = ({ equipLibraryArr, urlPathname, isWeaponPage }) => {
    // first filter, filter library into Weapon/ Cape/ Top ...etc
    const filterKeywords = {
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
    }
    const keyword = filterKeywords[urlPathname].toLowerCase()

    // console.log(equipLibraryArr.slice())
    return equipLibraryArr
        .filter(([id, { category }]) => {
            // category : ['Equip', 'Armor', 'Hat']
            //  category[0] = 'Equip' always

            //  category[1] = 'Armor' / 'Accessory' / 'One-Handed Weapon' / 'Two-Handed Weapon'

            //  category[2] =  "Hat" /  "Face Accessory" /"Eye Decoration"  / "Earrings" / "Top"  / "Overall" /"Bottom" / "Shoes" / "Glove" / "Shield"/ "Cape" / "Ring"/ "Pendant" / "Belt" / "Medal"/ "One-Handed / Sword" / "One-Handed Axe"/ "One-Handed Blunt Weapon" / "Dagger"/ "Wand"/ "Staff"/ "Two-Handed Sword"/"Two-Handed Axe" / "Two-Handed Blunt Weapon" / "Spear" / "Pole Arm"/"Bow" / "CrossBow" / "Claw" / "Knuckle"/"Gun"/          

            let words = isWeaponPage ? category[1] : category[2]
            words = words.toLowerCase()
            // return words.toLowerCase().includes(keyword)
            return isWeaponPage ? words.toLowerCase().includes(keyword) : words === keyword
        })
}
// 

export const renderEquipList = (filteredEquipList, type = "use") => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredEquipList.length)

    const isWeaponPage = useLocation().pathname === "/weapon"
    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10

    // console.log(filteredEquipList?.length)
    filteredEquipList = filteredEquipList?.slice(sliceStartIndex, sliceEndIndex)
    // console.log(filteredEquipList)
    // [ [EquipId, {name : xxxx , reqInt : xxx}] , [] , [] , ... ]

    // return <tr><td>a</td></tr>
    return filteredEquipList.map(([EquipId, info]) => {
        return (
            <tr key={EquipId}>
                <td>
                    <Link to={`/${type}/id=${EquipId}`}>
                        {renderImageWithItemId(EquipId, info.name)}
                    </Link>
                </td>
                <td>
                    <Link to={`/${type}/id=${EquipId}`}>
                        {info.name}
                    </Link>
                </td>
                {isWeaponPage && <td>{info.category[2] || "no info"}</td>}

                <td>{info.reqLevel || "no info"}</td>

                {isWeaponPage && <td>{!info.attackSpeed ? "no info" : `${attkSpeedToText(info.attackSpeed)} (${info.attackSpeed})`}</td>}

                {isWeaponPage && <td>
                    <p className="p-0 m-0">{info.incPAD && `${rangeCalculator(info.incPAD)} W.att`}</p>
                    <p className="p-0 m-0">{info.incMAD && `${rangeCalculator(info.incMAD)} Magic`}</p>
                </td>}

                <td>{info.tuc || "-"}</td>

            </tr>
        )
    })
}

// 
export const renderImageWithItemId = (itemId, itemName) => {
    if (!itemId || !itemName) return

    const handleError = e => {
        // console.log("trigger handleError")
        const fileName = `${itemId.padStart(8, 0)}.png`
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
            img.src = `\\images\\characters\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplestory.io source (option - 2)
            // console.log("switch to option-2")
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/character/${fileName}`
            // console.log(img.src)
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


    // findGoodItemImgUrl({ id: itemId, name: itemName }).then(x => {
    //     let el = document.getElementById(`image-${itemId}`)
    //     if (el) el.src = x
    // })

    return ImageComponent
}
// 

// export const findGoodEquipImgUrl = ({ id }) => {

//     // 1. fetch from MapleLegends
//     let p1 = new Promise((resolve, reject) => {
//         let x = fetch(`https://maplelegends.com/static/images/lib/character/${id.padStart(8, 0)}.png`, {
//             mode: "no-cors"
//         })
//             .then(res => resolve(`https://maplelegends.com/static/images/lib/character/${id.padStart(8, 0)}.png`))
//             .catch(err => reject(err))
//     })

//     // 2. fetch from MapleStory.io
//     let p2 = new Promise((resolve, reject) => {
//         let x = fetch(`https://maplestory.io/api/SEA/198/item/${id}/icon?resize=1.0`, {
//             mode: "no-cors"
//         })
//             .then(res => resolve(`https://maplestory.io/api/SEA/198/item/${id}/icon?resize=1.0`))
//             .catch(err => reject(err))
//     })

//     return Promise.any([p1, p2])
// }

//
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
// 
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

export function equipIdToCategory(id) {
    // info used from https://maplestory.io/api/GMS/64/item/category
    id = parseInt(id)
    let overallCategory = "Equip"
    let category = undefined
    let subCategory = undefined
    const isIDInRange = (min, max) => id >= min && id <= max

    const catogeryRangeList = {
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

        "Hat": { min: 1000000, max: 1010000, category: "Armor" },
        "Face Accessory": { min: 1010000, max: 1020000, category: "Accessory" },
        "Eye Decoration": { min: 1020000, max: 1030000, category: "Accessory" },
        "Glove": { min: 1080000, max: 1090000, category: "Armor" },
        "Pendant": { min: 1120000, max: 1130000, category: "Accessory" },
        "Belt": { min: 1130000, max: 1140000, category: "Accessory" },
        "Medal": { min: 1140000, max: 1150000, category: "Accessory" },
        "Shoulder": { min: 1150000, max: 1160000, category: "Accessory", url: "/shoulder" },
        "Cape": { min: 1100000, max: 1110000, category: "Armor" },
        "Earrings": { min: 1030000, max: 1040000, category: "Accessory" },
        "Ring": { min: 1110000, max: 1120000, category: "Accessory" },
        "Shield": { min: 1090000, max: 1100000, category: "Armor" },
        "Overall": { min: 1050000, max: 1060000, category: "Armor" },
        "Top": { min: 1040000, max: 1050000, category: "Armor" },
        "Bottom": { min: 1060000, max: 1070000, category: "Armor" },
        "Shoes": { min: 1070000, max: 1080000, category: "Armor" },
        "Test Armor": { min: 1690100, max: 1690200, category: "Armor" },

        "Badge": { min: 1180000, max: 1190000, category: "Accessory" },
        "Emblem": { min: 1190000, max: 1190500, category: "Accessory" },
        "Pocket Item": { min: 1160000, max: 1170000, category: "Accessory" },
        "Power Source": { min: 1190200, max: 1190300, category: "Accessory" },
        "Shoulder Accessory": { min: 1150000, max: 1160000, category: "Accessory" },
        "Totem": { min: 1202000, max: 1202200, category: "Accessory" },
    }

    Object.entries(catogeryRangeList).forEach(x => {
        // console.log(x)
        if (isIDInRange(x[1].min, x[1].max)) {
            category = x[1].category
            subCategory = x[0]
            // console.log("found")
        }
    })

    // console.log(Object.entries(catogeryRangeList).length)
    return [overallCategory, category, subCategory]
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



export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}