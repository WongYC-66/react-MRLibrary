import { useSearchParams } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
import data_fixMobImg from "../monster/data_fixMobImg.json"
// 

export const filterMobElementalList = (mobLibrary) => {
    const [searchParams] = useSearchParams()

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search?.toLowerCase().split(" ") || ['']
    const filter = filterOption.filter?.split('-') || ['any', '']
    const order = filterOption.order || 'level'
    const sort = filterOption.sort || 'ascending'

    let filteredMobList = Object.entries(mobLibrary)

    // console.log(filter)
    // console.log("before filter = ", filteredMobList)
    filteredMobList = filteredMobList
        // fuzzy seach for any name matched with space separated text, with OR condition
        .filter(([_id, { name }]) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        // reformat data to be [_id, {obj with elemMap}, matchCount]
        .map(([_id, obj]) => {

            // 1. decode elemAttr into elemMap
            obj.elemMap = {
                'undead' : '',
                'holy': '',
                'fire': '',
                'ice': '',
                'lightning': '',
                'poison': '',
            }
            updateWithElemAttr(obj.undead, obj.elemMap, obj.elemAttr)

            // 2. matchCount for fuzzy search
            let matchCount = 0
            searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))

            return [_id, obj, matchCount]
        })
        // filter any/weak-to-holy/weak-to-fire/ ....
        .filter(([_, obj, __]) => {
            let [type, el] = filter
            if (type === "any") return true
            if (type === "undead") return obj.elemMap['undead'] === 'undead'
            if (type == 'weak') return obj.elemMap[el] === 'Weak'
            if (type == 'strong') return obj.elemMap[el] === 'Strong'
            if (type == 'immune') return obj.elemMap[el] === 'Immune'
            return false
        })
        .sort((a, b) => {
            // a = [_id, obj, matchCount]
            // 1. sort by fuzzy search matchCount, desc, most-matched come first
            if (a[2] !== b[2]) return b[2] - a[2]

            // if same value, sort by mobId then
            if (a[1][order] === b[1][order]) return a[0] - b[0]

            // else, sort ascendingly, for Property of "level/...."
            return a[1][order] - b[1][order]
        })
        // remove the mathCount
        .map(([_id, obj, matchCount]) => [_id, obj])

    // console.log("after filter = ", filteredMobList)
    // console.log(`found : ${filteredMobList.length} records`)

    return sort === "descending" ? filteredMobList.reverse() : filteredMobList
}

const elementCharToKey = {
    'F': 'fire',
    'I': 'ice',
    'L': 'lightning',
    'S': 'poison',
    'H': 'holy',
}
const elementValToValue = {
    '0': 'error',
    '1': 'Immune',
    '2': 'Strong',
    '3': 'Weak',
}

export const updateWithElemAttr = (undead, elemMap, elemAttr) => {
    if(undead === '1') elemMap['undead'] = 'undead'

    if (!elemAttr) return
    elemAttr.match(/.{2}/g).forEach(str => {
        let c1 = str[0]
        let c2 = str[1]
        elemMap[elementCharToKey[c1]] = elementValToValue[c2]
    })

    return
    if (!elemAttr || elemAttr === "") return ["weak : none", "strong : none", "immune : none"]
    const elemList = { F: 'Fire', I: 'Ice', L: "Lightning", S: "Poison", H: "Holy" }
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

export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}