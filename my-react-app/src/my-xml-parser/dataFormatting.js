import util from 'util'
import { decode } from 'html-entities';
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
        const unwantedStats = ["icon", "iconRaw", "cash", "medalTag", "notSale"]
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

export function SkillDataFormatting(obj) {
    // for Skill.img.xml from String.Wz ONLY
    // Create better data-structure
    console.log("running SkillDataFormatting")
    const simpleData = {}
    const arrayData = obj.root.children
    // console.log(arrayData)
    // total = 433 skills
    arrayData.forEach(x => {
        let skill_Id = x.attributes.name
        let skill_obj = {}

        x.children.forEach(({ attributes }) => {
            let key = attributes.name
            let val = attributes.value
            skill_obj[key] = val
        })
        // write to main
        simpleData[skill_Id] = skill_obj
        // {2321008: {name: Genesis, desc : ... , h1 : ...,h2 : ... , ...}}

    })
    return simpleData
}

export function SkillStatsDataFormatting(objArr) {
    // for Skill.img.xml from Skill.Wz ONLY
    // Create better data-structure
    console.log("running SkillStatsDataFormatting")
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}

    objArr.forEach(x => {
        // console.log(x)
        x = x.root.children // skip img file name
        x = x.filter(obj => obj.attributes.name == 'skill') // throw away 'Info'
        x = x.map(obj => obj.children).flat()   // flat multiple img data into 1 array
        // console.log(x)
        x.forEach(y => {
            const skill_Id = y.attributes.name
            const stats = {}
            /*  
            e.g. for genesis
                {
                    '2321008' : {
                        action : 0  // active skill
                        elemenAttr : 'H'
                        levels : {
                            1 : {
                                mpCon : ... 
                                mobCount : ...
                                pad : ...
                                pdd : ...
                                lt : ...
                                rb : ...
                                cooltime: ...

                            },
                            2 : {...},
                            3 : {...}, 
                            20: {...}
                            30: {...}
                        }
                        
                    }
                }
             

             */

            let wantedStats = new Set(['elemAttr', 'level', 'action'])
            // level has nested
            // remove pixel/animation related : 'icon' , 'iconMouseOver', 'iconDisabled', 'effect' , 'effect0', 'hit', 'tile', 'action', 'invisible', etc

            let info = y.children.filter(obj => wantedStats.has(obj.attributes.name))
            // console.log(`formatting : ${skillId}`)   


            info.forEach(y => {
                let key = y.attributes.name
                let value = y.attributes.value
                if (key === 'elemAttr' || key === 'action')
                    return stats[key] = value

                // iterates over level
                if (key === 'level') {
                    let levelObj = {}
                    y.children.forEach(z => {
                        let lvl = z.attributes.name
                        let subLevelObj = {}
                        // 
                        z.children.forEach(a => {
                            // if(skill_Id == '1121006')
                            // console.log(a)
                            let key2 = a.attributes.name        // hs/mpCon/damage/mobCount/...
                            let val2 = a.attributes.value
                            subLevelObj[key2] = val2
                            if (key2 == 'lt' || key2 == 'rb') {
                                let rangeObj = { x: a.attributes.x, y: a.attributes.y }
                                subLevelObj[key2] = rangeObj
                            }
                        })
                        // 
                        levelObj[lvl] = subLevelObj

                    })

                    return stats['level'] = levelObj
                }
            })
            // console.log(stats)
            simpleData[skill_Id] = stats
        })
        // 
    })
    // console.log(simpleData)
    return simpleData
}

export function QuestDataFormatting(objArr) {
    // for Say.img, Act.img, Check.img, Questinfo.img from Quest.Wz ONLY
    // Create better data-structure
    console.log("running QuestDataFormatting")
    // console.log(objArr)
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}

    const decodeString = (str) => {
        return decode(str, { level: 'xml' });
    }

    const recursiveParse = (arr) => {
        if (!arr.length) return null
        let returnObj = {}

        arr.forEach(obj => {
            let key = decodeString(obj.attributes.name)
            let value = obj.attributes.value
                ? decodeString(obj.attributes.value)
                : recursiveParse(obj.children)
            returnObj[key] = value
        })

        return returnObj
    }

    let dataArr = objArr.map(obj => {
        let fileSource = obj.root.attributes.name.split('.')[0]

        let arr = obj.root.children
        let data = recursiveParse(arr)  // {id : {}}

        return [fileSource, data]
    })

    // let x = dataArr[0]['2055']
    // console.log(inspect(x, { colors: true, depth: Infinity }));
    // console.log(dataArr, dataArr.length)

    // Write into simpleData
    // { id : {Act : {}, Say: {}, Check:{}, QuestInfo : {} }
    dataArr.forEach(([fileSource, data]) => {
        Object.entries(data).forEach(([id, info]) => {
            if (!simpleData[id])
                simpleData[id] = {}

            simpleData[id][fileSource] = info
        })
    })

    // console.log(simpleData)
    return simpleData
}

export function NPCDataFormatting(obj) {
    // for NPC.img.xml from String.Wz ONLY
    // Create better data-structure
    console.log("running NPCDataFormatting")
    const simpleData = {}   // {id : {...}}
    
    const decodeString = (str) => {
        return decode(str, { level: 'xml' });
    }

    const recursiveParse = (arr) => {
        if (!arr.length) return null
        let returnObj = {}
        
        arr.forEach(obj => {
            let key = decodeString(obj.attributes.name)
            let value = obj.attributes.value
            ? decodeString(obj.attributes.value)
            : recursiveParse(obj.children)
            returnObj[key] = value
        })
        
        return returnObj
    }
    
    const arrayData = obj.root.children
    arrayData.forEach(obj => {
        let npc_id = obj.attributes.name
        let childrenArr = obj.children
        let data = recursiveParse(childrenArr)
        simpleData[npc_id] = data
    })
    
    return simpleData
}

export function NPCStatsDataFormatting(objArr) {
    // for Say.img, Act.img, Check.img, Questinfo.img from Quest.Wz ONLY
    // Create better data-structure
    console.log("running NPC_StatsDataFormatting")
    // console.log(objArr)
    const simpleData = {}   // {id1 : {key1 : value1, key2: value2}, id2 : ..., id3 : ..., ...}

    const decodeString = (str) => {
        return decode(str, { level: 'xml' });
    }

    const unwantedStats = new Set(['stand', 'say', 'hand'])
    // const unwantedStats = new Set([])

    const recursiveParse = (arr) => {
        if (!arr.length) return null
        let returnObj = {}

        arr.forEach(obj => {
            let key = decodeString(obj.attributes.name)
            if(unwantedStats.has(key)) return       // filter out unwanted
            let value = obj.attributes.value
                ? decodeString(obj.attributes.value)
                : recursiveParse(obj.children)
            returnObj[key] = value
        })

        return returnObj
    }

    objArr.forEach(obj => {
        let npc_id = obj.root.attributes.name.split('.')[0]
        
        let arr = obj.root.children
        let data = recursiveParse(arr)  
        
        // Write into simpleData
        simpleData[npc_id] = data // {id : {}}
    })

    // console.log(simpleData)
    return simpleData
}

// module.exports = {
//     MBdataFormatting,
//     MobIdDataFormatting,
//     ConsumeItemIdDataFormatting,
//     EtcItemIdDataFormatting,
//     EqpItemIdDataFormatting,
// };