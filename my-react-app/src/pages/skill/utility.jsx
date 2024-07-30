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
    // console.log(filter)

    filteredSkillList = filteredSkillList
        // fuzzy seach for any name matched with space separated text, with OR condition
        .filter(([_id, { name }]) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        // filter by job/any/special/magician/pirate/rogue ....
        .filter(([_id, _]) => {
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
    id = Number(id)
    if (id < 1000000) return 'Beginner'

    if (id < 1100000) return 'Swordman'
    if (id < 1110000) return 'Fighter'
    if (id < 1120000) return 'Crusader'
    if (id < 1130000) return 'Hero'

    if (id < 1210000) return 'Page'
    if (id < 1220000) return 'White Knight'
    if (id < 1230000) return 'Paladin'

    if (id < 1310000) return 'Spearman'
    if (id < 1320000) return 'Dragon Knight'
    if (id < 1330000) return 'Dark Knight'

    if (id < 2100000) return 'Magician'
    if (id < 2110000) return 'Wizard (Fire/Poison)'
    if (id < 2120000) return 'Mage (Fire/Poison)'
    if (id < 2130000) return 'Arch Mage (Fire/Poison)'

    if (id < 2210000) return 'Wizard (Ice/Lightning)'
    if (id < 2220000) return 'Mage (Ice/Lightning)'
    if (id < 2230000) return 'Arch Mage (Ice/Lightning)'

    if (id < 2310000) return 'Cleric'
    if (id < 2320000) return 'Priest'
    if (id < 2330000) return 'Bishop'

    if (id < 3100000) return 'Archer'
    if (id < 3110000) return 'Hunter'
    if (id < 3120000) return 'Ranger'
    if (id < 3130000) return 'Bow Master'

    if (id < 3210000) return 'Crossbowman'
    if (id < 3220000) return 'Sniper'
    if (id < 3230000) return 'Marksman'

    if (id < 4100000) return 'Rogue'
    if (id < 4110000) return 'Assassin'
    if (id < 4120000) return 'Hermit'
    if (id < 4130000) return 'Night Lord'

    if (id < 4210000) return 'Bandit'
    if (id < 4220000) return 'Chief Bandit'
    if (id < 4330000) return 'Shadower'

    if (id < 5100000) return 'Pirate'
    if (id < 5110000) return 'Brawler'
    if (id < 5120000) return 'Marauder'
    if (id < 5130000) return 'Buccaneer'

    if (id < 5210000) return 'Gunslinger'
    if (id < 5220000) return 'Outlaw'
    if (id < 5230000) return 'Corsair'

    return 'not identified'
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
        case 'magician':
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

export const elementCharToKey = {
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