import { useSearchParams } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
import data_fixMobImg from "../monster/data_fixMobImg.json"
// 
const data_MobIdImg = Object.fromEntries(data_fixMobImg.map(x => [Object.keys(x), Object.values(x)]))

export const filterGlobalList = (globalLibrary) => {
    const [searchParams] = useSearchParams()
    if (searchParams.size <= 0) return globalLibrary // No filter at first loading or if URL don't have query param 

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search.toLowerCase().split(' ')  // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search.toLowerCase()

    let filteredGlobalList = globalLibrary
        .filter(({ id, name }) => {
            const exactSearchTerm = filterOption.search.toLowerCase()
            if (id == exactSearchTerm) return true  // can search by entering item_id/mob_id/...id
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })

    // sort list by  number of search term matches, most matched at first
    filteredGlobalList = filteredGlobalList.map(obj => {
        let matchCount = 0
        searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
        return [obj, matchCount]
    })

    filteredGlobalList.sort((a, b) => {
        // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
        if (a[0].name.toLowerCase() === b[0].name.toLowerCase()) return 0
        if (a[0].name.toLowerCase() === exactSearchTerm) return -1
        if (b[0].name.toLowerCase() === exactSearchTerm) return 1

        return b[1] - a[1]
    })

    // filteredGlobalList = filteredGlobalList.map(arr => arr[0])
    filteredGlobalList = filteredGlobalList.map(arr => arr[0])
    return filteredGlobalList
}

export const renderImageWithMobId = (mobId) => {
    if (!mobId) return

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
        id={`image-${mobId}`}
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        className="mw-50"
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
        id={`image-${itemId}`}
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
}

export const renderImageWithSkillId = (skill_id) => {
    if (!skill_id) return

    const handleError = e => {
        const fileName = `${skill_id.padStart(7, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: server file under /images/
        // 2: maplelegends

        if (img.getAttribute("myimgindex") === '0') {
            // switch to server file under /images/ (option - 1)
            // console.log("switch to option-1")
            img.setAttribute("myimgindex", "1")
            img.src = `\\images\\skills\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplelegends (option - 2)
            // console.log("switch to option-2")
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/skill/${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '2') {
            img.setAttribute("myimgindex", "3")
            img.src = "/error"
            return
        }
        if (img.getAttribute("myimgindex") === '3') {
            // return console.log('end')
            return
        }
    }

    const ImageComponent = <Image
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        id={`image-${skill_id}`}
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
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

export const itemIdToNavUrl = (itemId) => {
    if (!itemId) return

    // https://maplestory.io/api/SEA/220/item/category

    const catogeryRangeList = {
        "Weapon": { min: 1300000, max: 1500000, category: "Equip", url: "/weapon" },
        
        "Hat": { min: 1000000, max: 1010000, category: "Armor", url: "/hat" },
        "Face Accessory": { min: 1010000, max: 1020000, category: "Accessory", url: "/faceacc" },
        "Eye Decoration": { min: 1020000, max: 1030000, category: "Accessory", url: "/eyeacc" },
        "Glove": { min: 1080000, max: 1090000, category: "Armor", url: "/gloves" },
        "Pendant": { min: 1120000, max: 1130000, category: "Accessory", url: "/pendant" },
        "Belt": { min: 1130000, max: 1140000, category: "Accessory", url: "/belt" },
        "Medal": { min: 1140000, max: 1150000, category: "Accessory", url: "/medal" },
        "Shoulder": { min: 1150000, max: 1160000, category: "Accessory", url: "/shoulder" },
        "Cape": { min: 1100000, max: 1110000, category: "Armor", url: "/cape" },
        "Earrings": { min: 1030000, max: 1040000, category: "Accessory", url: "/earring" },
        "Ring": { min: 1110000, max: 1120000, category: "Accessory", url: "/ring" },
        "Shield": { min: 1090000, max: 1100000, category: "Armor", url: "/shield" },
        "Overall": { min: 1050000, max: 1060000, category: "Armor", url: "/overall" },
        "Top": { min: 1040000, max: 1050000, category: "Armor", url: "/top" },
        "Bottom": { min: 1060000, max: 1070000, category: "Armor", url: "/bottom" },
        "Shoes": { min: 1070000, max: 1080000, category: "Armor", url: "/shoes" },
        
        "Use": { min: 2000000, max: 2999999, category: "Item", url: "/use" },
        "Setup": { min: 3000000, max: 3999999, category: "Item", url: "/setup" },
        "Etc": { min: 4000000, max: 4999999, category: "Item", url: "/etc" },

        "Cash": { min: 1701000, max: 1704000, category: "Equip", url: "/weapon" },
    }

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