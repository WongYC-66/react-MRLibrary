import { decode } from 'html-entities';

export function MB_DropsDataFormatting(inputData) {
    // for MonsterBook.img.json ONLY
    const outputData = {}
    for (let mobId in inputData) {
        outputData[mobId] = []
        const drops = inputData[mobId]?.reward
        if (drops) {
            for (let no in drops) {
                if (no.startsWith('_')) continue
                outputData[mobId].push(drops[no]._value)
            }
        }
    }
    return outputData
}

export function MB_MapsDataFormatting(inputData) {
    // for MonsterBook.img.json ONLY
    const outputData = {}
    for (let mobId in inputData) {
        outputData[mobId] = []
        const maps = inputData[mobId]?.map
        if (maps) {
            for (let no in maps) {
                if (no.startsWith('_')) continue
                outputData[mobId].push(maps[no]._value)
            }
        }
    }
    return outputData
}

export function MobIdDataFormatting(inputData) {
    // for Mob.img.json ONLY
    const outputData = {}
    for (let mobId in inputData) {
        if (inputData[mobId]?.name?._value)
            outputData[mobId] = decode(inputData[mobId].name._value)
    }
    return outputData
}

export function ConsumeInsItemIdDataFormatting(inputData) {
    // for Consume.img.json ONLY
    // for Ins.img.json ONLY
    const outputData = {}
    for (let itemId in inputData) {
        outputData[itemId] = {
            name: decode(inputData[itemId]?.name?._value || ''),
            desc: decode(inputData[itemId]?.desc?._value || ''),
        }
    }
    return outputData
}

export function EtcItemIdDataFormatting(inputData) {
    // for Etc.img.json ONLY
    inputData = inputData.Etc
    const outputData = {}
    for (let itemId in inputData) {
        outputData[itemId] = {
            name: decode(inputData[itemId]?.name?._value || ''),
            desc: decode(inputData[itemId]?.desc?._value || ''),
        }
    }
    return outputData
}

export function EqpItemIdDataFormatting(inputData) {
    // for Eqp.img.json ONLY
    inputData = inputData.Eqp
    const outputData = {}
    for (let category in inputData) {
        let subData = inputData[category]
        for (let itemId in subData) {
            if (itemId.startsWith('_')) continue
            outputData[itemId] = decode(subData[itemId]?.name?._value || '')
        }
    }
    return outputData
}

export function MapIdDataFormatting(inputData) {
    // for Map.img.json ONLY
    const outputData = {}
    for (let mapCategory in inputData) {
        let subData = inputData[mapCategory]
        for (let mapId in subData) {
            if (mapId.startsWith("_")) continue
            let map = subData[mapId]
            outputData[mapId] = {
                mapCategory: decode(mapCategory),
                streetName: decode(map?.streetName?._value || ''),
                mapName: decode(map?.mapName?._value || ''),
            }
        }

    }
    return outputData
}

export function SkillDataFormatting(inputData) {
    // for Skill.img.json ONLY
    const outputData = {}
    for (let skillId in inputData) {
        let subData = inputData[skillId]
        let skillObj = {}
        for (let key in subData) {
            if (key.startsWith('_')) continue
            skillObj[key] = decode(subData[key]?._value || '')
        }
        outputData[skillId] = skillObj
    }
    return outputData
}

export function NPCDataFormatting(inputData) {
    // for NPC.img.json ONLY
    const outputData = {}   // {id : {...}}
    for (let NPCId in inputData) {
        let subData = inputData[NPCId]
        let npcObj = {}
        for (let key in subData) {
            if (key.startsWith('_')) continue
            npcObj[key] = decode(subData[key]?._value || '')
        }
        outputData[NPCId] = npcObj
    }
    return outputData
}

export function GearStatsDataFormatting(inputDataArr) {
    // for Character.Wz ONLY
    const outputData = {}
    const skipStats = new Set(["icon", "iconRaw", 'afterImage', "medalTag", 'walk', 'stand', 'attack', 'sfx'])

    inputDataArr.forEach(data => {
        const id = Number(data.id)
        data = data.info
        const gearObj = {}
        for (let key in data) {
            if (key.startsWith('_')) continue
            if (skipStats.has(key)) continue
            gearObj[key] = data[key]._value
        }
        outputData[id] = gearObj
    })
    return outputData
}

export function MobStatsDataFormatting(inputDataArr) {
    // for Mob.Wz ONLY
    const outputData = {}
    const skipStats = new Set(["default", "fs", "firstAttack", "noregen", "bodyAttack"])

    inputDataArr.forEach(data => {
        const id = Number(data.id)
        data = data.info
        const mobObj = {}
        for (let key in data) {
            if (key.startsWith('_')) continue
            if (skipStats.has(key)) continue
            mobObj[key] = data[key]._value
        }
        outputData[id] = mobObj
    })
    return outputData
}

export function ItemStatsDataFormatting(inputDataArr) {
    // for Item.Wz ONLY
    const outputData = {}
    const skipStats = new Set(["icon", "iconRaw"])

    inputDataArr.forEach(data => {
        for (let id in data) {
            const info = data[id].info || {}
            const spec = data[id].spec || {}
            let combinedInfo = { ...info, ...spec }
            id = Number(id)
            const itemObj = {}
            for (let key in combinedInfo) {
                if (key.startsWith('_')) continue
                if (skipStats.has(key)) continue
                itemObj[key] = combinedInfo[key]._value
            }
            outputData[id] = itemObj
        }
    })
    return outputData
}

export function MapStatsDataFormatting(inputDataArr) {
    // for Map.Wz ONLY
    const outputData = {}

    inputDataArr.forEach(data => {
        const id = Number(data.id)
        if(isNaN(id)) return // 'AreaCode'
        const mapObj = {}

        // map info
        const info = data.info || {}
        for (let key in info) {
            if (key.startsWith('_')) continue
            mapObj[key] = info[key]._value
        }

        // minimap 
        const miniMap = data.miniMap || {}
        const miniMapObj = {}
        for (let key in miniMap) {
            if (key.startsWith('_')) continue
            if (key == 'canvas') {
                miniMapObj.canvasWidth = miniMap.canvas._width
                miniMapObj.canvasHeight = miniMap.canvas._height
            } else {
                miniMapObj[key] = miniMap[key]._value
            }
        }
        mapObj.miniMap = miniMapObj

        // portal info as Array
        const portal = data.portal || {}
        const portallArr = []
        for (let no in portal) {
            if (no.startsWith('_')) continue
            let subPortal = portal[no]
            let subPortalObj = {}
            for (let key in subPortal) {
                if (key.startsWith("_")) continue
                subPortalObj[key] = subPortal[key]._value
            }
            portallArr.push(subPortalObj)
        }
        mapObj.portal = portallArr

        outputData[id] = mapObj
    })
    return outputData
}

export function MapMobCountDataFormatting(inputDataArr) {
    // for Map.Wz ONLY
    const outputData = {}

    inputDataArr.forEach(data => {
        const id = Number(data.id)
        const count = {}

        // life info as Array
        const life = data.life || {}
        for (let no in life) {
            if (no.startsWith('_')) continue
            let subLife = life[no]
            if (subLife?.type?._value === 'm') {      // monster
                let mobId = subLife.id._value
                count[mobId] ??= 0
                count[mobId] += 1
            }
        }
        outputData[id] = count
    })
    return outputData
}

export function SkillStatsDataFormatting(inputDataArr) {
    // for Skill.Wz ONLY
    const outputData = {}
    const skipStats = new Set(["icon", "iconMouseOver", "iconDisabled", "effect"])

    inputDataArr.forEach(data => {
        const skill = data.skill
        for (let id in skill) {
            if (id.startsWith('_')) continue
            let skillObj = {}

            // Elem Attr Data
            if (skill[id]?.elemAttr?._value) {
                skillObj.elemAttr = skill[id].elemAttr._value
            }

            // Level Data
            const levelData = skill[id].level || {}
            const levelObj = {}

            for (let level in levelData) {
                if (level.startsWith("_")) continue
                levelObj[level] = {}
                let subLevelData = levelData[level]

                for (let key in subLevelData) {
                    if (key.startsWith('_')) continue
                    if (skipStats.has(key)) continue
                    if (['lt', 'rb'].includes(key)) {           // lt rb
                        levelObj[level][key] = {
                            x: subLevelData[key]._x,
                            y: subLevelData[key]._y,
                        }
                    } else {
                        levelObj[level][key] = subLevelData[key]._value     // normal stats
                    }
                }
            }

            skillObj.level = levelObj
            outputData[id] = skillObj
        }
    })
    return outputData
}

export function NPCStatsDataFormatting(inputDataArr) {
    // for Npc.Wz ONLY
    const outputData = {}
    const skipStats = new Set(['id', 'stand', 'origin'])
    // const skipStats = new Set(['id'])

    const recursiveParse = (obj) => {
        if (typeof obj === 'string') return decode(obj)
        if (Number.isInteger(obj)) return obj

        let newObj = {}
        for (let key in obj) {
            if (key == '_value') return recursiveParse(obj[key])    // exception
            // if (key == 'origin') {    // exception
            //     newObj.origin = { x: obj.origin._x, y: obj.origin._y }
            //     continue
            // }
            if (skipStats.has(key)) continue
            if (key.startsWith('_')) continue
            newObj[key] = recursiveParse(obj[key])
        }
        return newObj
    }

    inputDataArr.forEach(data => {
        const id = Number(data.id)
        const questObj = recursiveParse(data)
        outputData[id] = questObj
    })

    return outputData
}

export function QuestDataFormatting(inputDataArr) {
    const outputData = {}
    // {
    //     id : {
    //         Act:{}
    //         Check: {}
    //         QuestInfo: {}
    //         Say: {}
    //     },
    // }

    const recursiveParse = (obj) => {
        if (typeof obj === 'string') return decode(obj)
        if (Number.isInteger(obj)) return obj

        let newObj = {}
        for (let key in obj) {
            if (key == '_value') return recursiveParse(obj[key])    // exception
            if (key.startsWith('_')) continue
            newObj[key] = recursiveParse(obj[key])
        }
        if (Object.keys(newObj).length === 0) return null
        return newObj
    }

    const Act = inputDataArr.find(inputData => inputData.id == 'Act')
    const Check = inputDataArr.find(inputData => inputData.id == 'Check')
    const QuestInfo = inputDataArr.find(inputData => inputData.id == 'QuestInfo')
    const Say = inputDataArr.find(inputData => inputData.id == 'Say')

    const tasks = [[Act, 'Act'], [Check, 'Check'], [QuestInfo, 'QuestInfo'], [Say, 'Say']]

    tasks.forEach(([inputData, type]) => {
        for (let id in inputData) {
            if (id == 'id') continue
            if (!(id in outputData)) outputData[id] = {}
            outputData[id][type] = recursiveParse(inputData[id])
        }
    })

    return outputData
}

export function WorldMapDataFormatting(inputDataArr) {
    // for Map.Wz ONLY
    const outputData = {}
    const skipStats = new Set(['id'])

    const recursiveParse = (obj) => {
        if (typeof obj === 'string') return decode(obj)
        if (Number.isInteger(obj)) return obj

        let newObj = {}
        for (let key in obj) {
            // exception
            if (key == '_value') return recursiveParse(obj[key])

            if (key == '_width' || key == '_height') {
                let name = key.slice(1,)
                newObj[name] = recursiveParse(obj[key])
                continue
            }

            if (key == 'origin') {
                newObj.origin = { x: obj.origin._x, y: obj.origin._y }
                continue
            }

            if (key == 'spot') {
                newObj.spot = { x: obj.spot._x, y: obj.spot._y }
                continue
            }

            if (skipStats.has(key)) continue
            if (key.startsWith('_')) continue

            newObj[key] = recursiveParse(obj[key])
        }
        return newObj
    }

    inputDataArr.forEach(data => {
        const id = data.id
        const worldMapObj = recursiveParse(data)
        outputData[id] = worldMapObj
    })

    return outputData
}

export function RenderMobOriginDataFormatting(inputDataArr) {
    // for Mob.Wz ONLY
    const outputData = {}
    inputDataArr.forEach(data => {
        const id = data.id
        let originObj = { x: 0, y: 0 }
        const origin = data?.stand?.['0']?.origin
        if (origin) {
            originObj = { x: origin._x, y: origin._y }
        }
        outputData[id] = originObj
    })
    return outputData
}

export function RenderNpcOriginDataFormatting(inputDataArr) {
    // for Npc.Wz ONLY
    const outputData = {}
    inputDataArr.forEach(data => {
        const id = data.id
        let originObj = { x: 0, y: 0 }

        const origin = data?.stand?.['0']?.origin

        if (origin) {
            originObj = { x: origin._x, y: origin._y }
        } else if (data?.info?.link) {
            const linkId = data.info.link._value
            const linkedNpc = outputData[linkId]
            originObj = { ...linkedNpc, link: linkId }
        }

        outputData[id] = originObj
    })
    return outputData
}

export function RenderObjOriginDataFormatting(inputDataArr) {
    // for Map.Wz ONLY
    const outputData = {}
    const skipStats = new Set(['id'])
    // ${oS}.${l0}.${l1}.${l2}.0
    inputDataArr.forEach(data => {
        const oS = decode(data.id)
        outputData[oS] = {}

        for (let l0 in data) {
            l0 = decode(l0)
            if (skipStats.has(l0)) continue
            outputData[oS][l0] = {}
            let l0data = data[l0]

            for (let l1 in l0data) {
                if (l1.startsWith('_')) continue
                l1 = decode(l1)
                outputData[oS][l0][l1] = {}
                let l1data = l0data[l1]

                for (let l2 in l1data) {
                    if (isNaN(Number(l2))) continue
                    l2 = decode(l2)
                    let l2data = l1data[l2]

                    let originObj = { x: 0, y: 0 }
                    const origin = l2data?.['0']?.origin
                    if (origin) {
                        originObj = { x: origin._x, y: origin._y }
                    }
                    outputData[oS][l0][l1][l2] = originObj
                }
            }
        }
    })
    return outputData
}

export function RenderTileOriginDataFormatting(inputDataArr) {
    // for Map.Wz ONLY
    const outputData = {}
    const skipStats = new Set(['id', 'info'])
    // ${tS}.${u}.${no}
    inputDataArr.forEach(data => {
        const tS = decode(data.id)
        outputData[tS] = {}
        for (let u in data) {
            if (skipStats.has(u)) continue
            u = decode(u)
            // get the origin
            let uData = data[u]
            outputData[tS][u] = {}
            for (let no in uData) {
                if (isNaN(Number(no))) continue
                let originObj = { x: 0, y: 0 }
                const origin = uData?.[no]?.origin
                if (origin) {
                    originObj = { x: origin._x, y: origin._y }
                }
                outputData[tS][u][no] = originObj
            }
        }
    })
    return outputData
}

export function RenderPortalOriginDataFormatting(inputData) {
    // for Map.Wz ONLY
    const outputData = {}
    inputData = inputData.portal.editor // assume, editor > game
    for (let type in inputData) {
        if (type.startsWith('_')) continue
        let originObj = { x: 0, y: 0 }
        const origin = inputData[type]?.origin
        if (origin) {
            originObj = { x: origin._x, y: origin._y }
        }
        outputData[type] = originObj
    }
    return outputData
}

export function RenderReactorOriginDataFormatting(inputDataArr) {
    // for Reactor.Wz ONLY
    const outputData = {}
    const skipStats = new Set(['id'])
    // ${tS}.${u}.${no}
    inputDataArr.forEach(data => {
        const id = data.id
        let originObj = { x: 0, y: 0 }

        const origin = data?.['0']?.['0']?.origin       // 0 = static 
        if (origin) {
            originObj = { x: origin._x, y: origin._y }
        } else if (data?.info?.link) {
            const linkId = data.info.link._value
            const linkedReactor = outputData[linkId]
            originObj = { ...linkedReactor, link: linkId }
        }
        outputData[id] = originObj
    })
    return outputData
}

export function QuestLineDataFormatting(inputData) {
    const outputData = {}
    /**
     *      questId : {
     *          isHead : true,
     *          children : [child_questId1, child_questId2]
     *      },
     */

    for (let [questId, questData] of Object.entries(inputData)) {
        // for every quest, grab it prequest only from 'Check'
        // See any prequest at QuestId.Check.0.quest
        // See any prequest at QuestId.Check.1.quest ...
        let isHead = true

        if (!questData['Check']) continue   // some quests are malformed, skip those

        for (let [_, stateProperty] of Object.entries(questData['Check'])) {
            if (!stateProperty) continue

            let preqQuests = stateProperty['quest']

            if (!preqQuests) continue

            isHead = false // if has prequest, not a head of questline

            for (let [__, { id: preqQuestId }] of Object.entries(preqQuests)) {
                // if havent seen preqQuest, create a temp
                if (!(preqQuestId in outputData)) {
                    outputData[preqQuestId] = { isHead: true, children: [] }
                }

                // insert curr questId into preqQuest['children']
                outputData[preqQuestId].children.push(questId)
            }
        }

        let thisQuestChildren = []
        // if already existed somehow .. why Nexon dont organize questline by questId. Z_Z
        if (outputData[questId]) {
            thisQuestChildren = outputData[questId].children
        }
        outputData[questId] = { isHead, children: thisQuestChildren }
    }
    return outputData
}

export function NPCLocationFormatting(inputDataArr, inputData) {
    // for Map.Wz ONLY
    const outputData = {
        ...inputData        // data_NPC
    }

    inputDataArr.forEach(data => {
        const mapId = Number(data.id)
        // life info as Array from map
        const life = data.life || {}
        for (let no in life) {
            if (no.startsWith('_')) continue
            let subLife = life[no]
            if (subLife?.type?._value === 'n') {      // npc
                let npcId = Number(subLife.id._value)
                if (!outputData[npcId].location) outputData[npcId].location = []
                outputData[npcId].location.push(mapId)
            }
        }
    })

    // post-process, remove duplicates
    for (let npcId in outputData) {
        let location = outputData[npcId].location
        if (location) {
            outputData[npcId].location = [...new Set(location)]
        }
    }
    return outputData
}

export function NPCLocationFormatting2(inputDataArr, inputData) {
    // for Map.Wz ONLY
    const outputData = {
        ...inputData        // data_MapStats
    }

    inputDataArr.forEach(data => {
        const mapId = Number(data.id)
        // life info as Array from map
        const life = data.life || {}
        for (let no in life) {
            if (no.startsWith('_')) continue
            let subLife = life[no]
            if (subLife?.type?._value === 'n') {      // npc
                let npcId = Number(subLife.id._value)
                if (!outputData[mapId].npc) outputData[mapId].npc = []
                outputData[mapId].npc.push(npcId)
            }
        }
    })

    // post-process, remove duplicates
    for (let mapId in outputData) {
        let npc = outputData[mapId].npc
        if (npc) {
            outputData[mapId].npc = [...new Set(npc)]
        }
    }
    return outputData
}