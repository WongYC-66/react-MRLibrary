import { useSearchParams } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_fixMobImg from "./data_fixMobImg.json"
// 
const data_MobIdImg = Object.fromEntries(data_fixMobImg.map(x => [Object.keys(x), Object.values(x)]))

export const filterMobList = (mobLibrary) => {
    const [searchParams] = useSearchParams()
    if (searchParams.size <= 0) return Object.entries(mobLibrary)  // No filter at first loading or if URL don't have query param 

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTerm = filterOption.search.toLowerCase() 
    const filter = filterOption.filter 
    const order = filterOption.order 
    const sort = filterOption.sort 
    let filteredMobList = Object.entries(mobLibrary)

    // console.log("before filter = ",filteredMobList)
    filteredMobList = filteredMobList
        .filter(x => {
            if (!x[1].hasOwnProperty('name')) return false
            if (x[1].name.toLowerCase().includes(searchTerm)) return true
        })
        .filter(x => {
            if (filter === "any") return true
            if (filter === "boss" && x[1]?.boss === "1") return true
            if (filter === "monster" && !x[1].hasOwnProperty("boss")) return true
        })
        .sort((a, b) => {
            // default is ascending, if descend, then reverse upon return
            if (filter === "id") return Number(a[0] - b[0])
            return Number(a[1][order]) - Number(b[1][order])
        })

    // console.log("after filter = ", filteredMobList)
    console.log(`found : ${filteredMobList.length} records`)

    return sort === "descending" ? filteredMobList.reverse() : filteredMobList
}

export const renderImageWithMobId = (mobId) => {
    const ImageComponent = <Image src="abc" id={`image-${mobId}`} fluid alt="Image not found" />

    findGoodImgUrl({ id: mobId }).then(x => {
        let el = document.getElementById(`image-${mobId}`)
        if (el) el.src = x
    })

    return ImageComponent
}

export const findGoodImgUrl = ({ id }) => {
    // 1. fetch from MapleLegends
    let p1 = new Promise((resolve, reject) => {
        let x = fetch(`https://maplelegends.com/static/images/lib/monster/${id.padStart(7, 0)}.png`, {
            mode: "no-cors"
        })
            .then(res => resolve(`https://maplelegends.com/static/images/lib/monster/${id.padStart(7, 0)}.png`))
            .catch(err => reject(err))
    })
    // 2. fetch from MapleStory.io
    let p2 = new Promise((resolve, reject) => {
        let x = fetch(`https://maplestory.io/api/SEA/198/mob/${id}/render/stand`, {
            mode: "no-cors"
        })
            .then(res => {
                resolve(`https://maplestory.io/api/SEA/198/mob/${id}/render/stand`)
            })
            .catch(err => reject(err))
    })
    // 3. fetch from Maplestory.io , but populated from List of manual record
    let p3 = new Promise((resolve, reject) => {
        let x = data_MobIdImg[id] // {region : xxx , version : xxx , animation : ...}
        if (!x) return
        x = x[0]
        fetch(`https://maplestory.io/api/${x.region}/${x.version}/mob/${id}/render/${x.animation}`, {
            mode: "no-cors"
        })
            .then(res => resolve(`https://maplestory.io/api/${x.region}/${x.version}/mob/${id}/render/${x.animation}`))
            .catch(err => reject(err))
    })
    return Promise.any([p1, p2, p3])
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



export const mapIdToUrl = (id) => {
    return `https://maplelegends.com/lib/map?id=${id}`
}

export const itemIdToImgUrl = (type, { id, name }) => {
    if (type === "equip") return `https://maplelegends.com/static/images/lib/character/${id.padStart(8, '0')}.png`
    if (type === "item") {
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
        return `https://maplelegends.com/static/images/lib/item/${id.padStart(8, '0')}.png`
    }
}

export const itemIdToNavUrl = (itemId) => {
    if (!itemId) return

    const catogeryRangeList = {
        "Weapon": { min: 1300000, max: 1500000, category: "Equip", url: "/weapon" },

        "Hat": { min: 1000000, max: 1010000, category: "Armor", url: "/hat" },
        "Face Accessory": { min: 1010000, max: 1020000, category: "Accessory", url: "/faceacc" },
        "Eye Decoration": { min: 1020000, max: 1030000, category: "Accessory", url: "/eyeacc" },
        "Glove": { min: 1080000, max: 1090000, category: "Armor", url: "/gloves" },
        "Pendant": { min: 1120000, max: 1130000, category: "Accessory", url: "/pendant" },
        "Belt": { min: 1130000, max: 1140000, category: "Accessory", url: "/belt" },
        "Medal": { min: 1140000, max: 1150000, category: "Accessory", url: "/medal" },
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