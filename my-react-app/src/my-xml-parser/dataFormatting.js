import util from 'util'
import { parseItemJSON, itemIdToCategory } from './utility.js';
var inspect = util.inspect;


export function legacyTextCheck(str) {
    // check for '
    str = str.replaceAll("&apos;", "'")

    // check for #c
    str = str.replaceAll(/#c(.+)#/g, "<b>$1</b>")

    return str
}

export function MBdataFormatting(obj) {
    // for MonsterBook.img.xml ONLY
    // Create better data-structure
    const simpleData = {}
    const arrayData = obj.root.children

    arrayData.forEach(x => {
        // if(x.attributes.name === "9420518") console.log(inspect(x, { colors: true, depth: Infinity }));
        let mobId = x.attributes.name
        let dropData = x.children.filter(y => y.attributes.name === "reward")[0].children
        let dropArray = dropData.map(obj => obj.attributes.value)

        //write to main
        simpleData[mobId] = dropArray
    })

    return simpleData
}

export function MBdataFormatting_MapOnly(obj) {
    // for MonsterBook.img.xml ONLY
    // Create better data-structure
    const simpleData = {}
    const arrayData = obj.root.children

    // const lookingObj = arrayData[0]
    // console.log(inspect(lookingObj, { colors: true, depth: Infinity }));
    arrayData.forEach(x => {
        let mobId = x.attributes.name
        let mapData = x.children.filter(obj => obj.attributes.name === 'map')[0].children.map(y => y.attributes.value)
        //write to main
        simpleData[mobId] = mapData
    })
    return simpleData
}


export function MobIdDataFormatting(obj) {
    // for Mob.img.xml ONLY
    // Create better data-structure
    const simpleData = {}
    const arrayData = obj.root.children

    arrayData.forEach(x => {
        let mobId = x.attributes.name
        let mobName = x.children[0].attributes.value
        mobName = legacyTextCheck(mobName)
        //write to main
        simpleData[mobId] = mobName
    })

    return simpleData
}

export function ConsumeItemIdDataFormatting(obj) {
    // for Consume.img.xml ONLY
    // Create better data-structure
    const simpleData = {}

    const arrayData = obj.root.children

    arrayData.forEach(x => {
        let itemId = x.attributes.name

        //write to main
        let resultObj = parseItemJSON(x)
        simpleData[itemId] = resultObj
    })
    return simpleData
}

export function EtcItemIdDataFormatting(obj) {
    // for Etc.img.xml ONLY
    // Create better data-structure
    const simpleData = {}

    const arrayData = obj.root.children[0].children
    arrayData.forEach(x => {
        let itemId = x.attributes.name

        //write to main
        let resultObj = parseItemJSON(x)
        simpleData[itemId] = resultObj
    })
    return simpleData
}

export function EqpItemIdDataFormatting(obj) {
    // for Eqp.img.xml ONLY
    // Create better data-structure
    const simpleData = {}
    const arrayData = obj.root.children[0].children
    arrayData.forEach(categoryArr => {
        categoryArr.children.forEach(x => {
            let itemId = x.attributes.name
            let itemName = x.children[0].attributes.value
            itemName = legacyTextCheck(itemName)
            //write to main
            simpleData[itemId] = itemName
        })
    })

    // console.log(simpleData)
    return simpleData
}

export function InsItemIdDataFormatting(obj) {
    // for Ins.img.xml ONLY
    // Create better data-structure
    const simpleData = {}

    const arrayData = obj.root.children
    // console.log(arrayData)
    arrayData.forEach(x => {
        let itemId = x.attributes.name

        //write to main
        let resultObj = parseItemJSON(x)
        simpleData[itemId] = resultObj
    })
    return simpleData
}

export function MapIdDataFormatting(obj) {
    // for Map.img.xml ONLY
    // Create better data-structure
    const simpleData = {}
    const arrayData = obj.root.children // array of 15 types map "victoria, ossyria, elin, weddingGL, MasteriaGL, HalloweenGL, jp, etc, singapore, event, Episode1GL, maple, CN, china, thai"

    // const lookingObj = arrayData //
    // console.log(lookingObj)
    // console.log(inspect(lookingObj, { colors: true, depth: Infinity }));

    arrayData.forEach(x => {                    // category
        // console.log(x.attributes.name)
        let mapCategory = x.attributes.name
        x.children.forEach(y => {                // map id
            let mapId = y.attributes.name
            let newObj = { mapCategory }

            y.children.forEach(z => {            // streetName, mapName, mapDesc
                let property = z.attributes.name
                if (property !== "streetName" && property !== "mapName") return // stops if not
                let propertyValue = legacyTextCheck(z.attributes.value)
                newObj[property] = propertyValue
            })
            simpleData[mapId] = newObj
        })
    })
    // console.log(simpleData)
    return simpleData
}

export function GearStatsDataFormatting(objArr) {
    // for img.xml from Characters.Wz ONLY
    // Create better data-structure
    console.log("running GearStatsDataFormatting")
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}
    // console.log(objArr)

    objArr.forEach(x => {
        x = x.root
        const itemId = parseInt(x.attributes.name.split('.')[0])
        // 
        // if(itemId != "1452017") return
        console.log(`formatting : ${itemId}`)
        // console.log(x)
        // console.log(inspect(x, { colors: true, depth: Infinity }));
        const stats = {}
        // 
        const unwantedStats = ["icon", "iconRaw", "cash", "medalTag", "notSale", "price", "tradeBlock"]
        x = x.children.find(y => y.attributes.name === "info")
        x.children.forEach(y => {
            // console.log(y)
            let key = y.attributes.name
            let value = y.attributes.value
            if (unwantedStats.some(z => key === z)) return // if property is one of unwantedStats, skip
            stats[key] = value  // {key1 : value1, key2: value2}
        })
        //  Category are based on item Id range
        // disabled. enable this will exceed quota to store in localStorage
        // const [overallCategory, category, subCategory] = itemIdToCategory(itemId)
        // stats["overallCategory"] = overallCategory 
        // stats["category"] = category 
        // stats["subCategory"] = subCategory 
        // 
        simpleData[itemId] = stats // {id : {key1 : value1, key2: value2}}
    })
    return simpleData
}

export function MobStatsDataFormatting(objArr) {
    // for img.xml from Mob.Wz ONLY
    // Create better data-structure
    console.log("running MobStatsDataFormatting")
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}
    let x = objArr[0]

    objArr.forEach(x => {
        x = x.root
        const mobId = parseInt(x.attributes.name.split('.')[0])
        // if(mobId != 8800002) return
        console.log(`formatting : ${mobId}`)
        const stats = {}
        // console.log(inspect(x, { colors: true, depth: Infinity }));
        // 
        const unwantedStats = ["skill", "default", "publicReward", "explosiveReward", "summonType", "fs", "hpTagColor", "hpTagBgcolor", "buff", "defaultHP", "defaultMP", "rareItemDropLevel", "category", "noFlip", "noFlip", "firstAttack", "noregen", "bodyAttack"]
        x = x.children.find(y => y.attributes.name === "info")
        x.children.forEach(y => {
            // console.log(y)
            let key = y.attributes.name
            let value = y.attributes.value
            if (unwantedStats.some(z => key === z)) return // if property is one of unwantedStats, skip
            stats[key] = value  // {key1 : value1, key2: value2}
        })
        simpleData[mobId] = stats // {id : {key1 : value1, key2: value2}}
    })
    return simpleData
}

export function MapMobCountDataFormatting(objArr) {
    // for img.xml from Map.Wz ONLY
    // Create better data-structure
    console.log("running MapMobCountDataFormatting")
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}

    // let x = objArr[0].root.children
    // console.log(x)

    // return

    objArr.forEach(x => {
        x = x.root
        const mapId = parseInt(x.attributes.name.split('.')[0])
        // if (mapId != 240040511) return
        console.log(`formatting : ${mapId}`)
        const stats = {}
        // console.log(inspect(x, { colors: true, depth: Infinity }));
        // 
        x = x.children.find(y => y.attributes.name === "life")
        if (!x) return
        x = x.children.map(y => y.children.find(z => z.attributes.value.match(/.{7}/))).map(y => y.attributes.value)
        if (x.length <= 0) return
        x.forEach(y => stats[y] = (stats[y] || 0) + 1)
        // console.log(stats)
        simpleData[mapId] = stats // {id : {key1 : value1, key2: value2}}
        return
    })
    console.log(simpleData)
    return simpleData
}

export function ItemStatsDataFormatting(objArr) {
    // for img.xml from Item.Wz ONLY
    // Create better data-structure
    console.log("running ItemStatsDataFormatting")
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}

    // return

    objArr.forEach(x => {
        x = x.root.children
        x.forEach(y => {
            // item
            const stats = {}
            const itemId = parseInt(y.attributes.name)
            console.log(`formatting : ${itemId}`)
            // if (itemId !== 2002010) return
            y = y.children
            const unwantedStats = ["icon", "iconRaw"]
            const info = y.find(z => z.attributes.name === 'info').children
            info.forEach(z => {
                if (unwantedStats.includes(z.attributes.name)) return
                let key = z.attributes.name
                let value = z.attributes.value
                stats[key] = value
            })
            // 
            const spec = y.find(z => z.attributes.name === 'spec')?.children
            spec && spec.forEach(z => {
                if (unwantedStats.includes(z.attributes.name)) return
                let key = z.attributes.name
                let value = z.attributes.value
                stats[key] = value
                
            })
            // console.log(stats)
            simpleData[itemId] = stats // {id : {key1 : value1, key2: value2}}
        })
        // 
    })
    console.log(simpleData)
    return simpleData
}
// module.exports = {
//     MBdataFormatting,
//     MobIdDataFormatting,
//     ConsumeItemIdDataFormatting,
//     EtcItemIdDataFormatting,
//     EqpItemIdDataFormatting,
// };