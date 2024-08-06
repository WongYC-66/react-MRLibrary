import { useSearchParams } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 

export const filterMobElementalList = (mobLibrary) => {
    const [searchParams] = useSearchParams()

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search?.toLowerCase().split(" ") || ['']
    const exactSearchTerm = filterOption.search?.toLowerCase() || ''

    const filter = filterOption.filter?.split('-') || ['any', '']
    const order = filterOption.order || 'level'
    const sort = filterOption.sort || 'ascending'

    let filteredMobList = Object.entries(mobLibrary)
    // if(!filteredMobList.length) return filteredMobList

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
            // exact term sort to front, then sort by matchCount DESC, then property user select...
            if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
            if (a[1].name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].name.toLowerCase() === exactSearchTerm) return 1
            
            if (a[2] !== b[2]) return b[2] - a[2]   // matchCount

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

export const renderImageWithNPCId = (npcId) => {
    if (!npcId) return

    const handleError = e => {
        const fileName = `${npcId.padStart(7, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: server file under /images/
        // 2: maplelegends
        // 3: maplestory.io

        if (img.getAttribute("myimgindex") === '0') {
            // switch to server file under /images/ (option - 1)
            // console.log("switch to option-1")
            img.setAttribute("myimgindex", "1")
            img.src = `\\images\\npcs\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplelegends (option - 2)
            // console.log("switch to option-2")
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/npc/${fileName}`
            return
        }
        // error again? 
        if (img.getAttribute("myimgindex") === '2') {
            // switch to maplestory.io exception list (option - 3)
            // console.log("switch to option-3")
            img.setAttribute("myimgindex", "3")
            img.src = `https://maplestory.io/api/GMS/64/npc/${npcId}/icon/`
            return
        }
        if (img.getAttribute("myimgindex") === '3') {
            img.setAttribute("myimgindex", "4")
            img.src = "/error"
            // return console.log('end')
            return
        }
    }

    const ImageComponent = <Image
        id={`image-${npcId}`}
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        className="mw-50"
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
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