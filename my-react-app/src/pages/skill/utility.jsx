import { useSearchParams } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
// 

export const filterSkillList = (skillLibrary) => {
    const [searchParams] = useSearchParams()

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search?.toLowerCase().split(" ") || ['']
    const filter = filterOption.filter || 'any'
    const order = filterOption.order || 'id'
    const sort = filterOption.sort || 'ascending'

    let filteredSkillList = Object.entries(skillLibrary)
    // return filteredSkillList
    console.log(filter)

    filteredSkillList = filteredSkillList
        // fuzzy seach for any name matched with space separated text, with OR condition
        .filter(([_id, { name }]) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        // filter by job/any/special/wizard/pirate/rogue ....
        .filter(([_id, _]) => {
            console.log(findRangeByFilterType(filter))
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

export const skillIdToJobString = (id) => {
    
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
        case 'wizard':
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

export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}