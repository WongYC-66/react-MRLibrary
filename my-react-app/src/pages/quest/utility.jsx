import { useSearchParams, Link } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
import { renderImageWithItemIdType } from "../all/utility.jsx"
// 
import data_Quest from "../../../data/data_Quest.json"
import data_NPC from "../../../data/data_NPC.json"
import data_Questline from "../../../data/data_Questline.json"

import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_Map from "../../../data/data_Map.json"

import data_Mob from '../../../data/data_Mob.json'
// 
export const filterQuestList = (questLibrary) => {
    const [searchParams] = useSearchParams()

    let filteredQuestLibrary = Object.entries(questLibrary)

    const filterOption = Object.fromEntries([...searchParams.entries()])
    // No filter at first loading or if URL don't have query param 
    if (!Object.keys(filterOption).length) return filteredQuestLibrary

    const location = filterOption.location || 'all'
    const type = filterOption.type || 'all'

    let searchTermArr = filterOption.search?.toLowerCase().split(' ') || [''] // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || null

    searchTermArr = searchTermArr.filter(Boolean)  // filter out space
    // console.log(searchTermArr)

    // console.log(filteredQuestLibrary)

    filteredQuestLibrary = filteredQuestLibrary
        .filter(([_id, obj]) => {
            const { QuestInfo } = obj
            if (!searchTermArr.length) return true
            if (exactSearchTerm === _id) return true
            if (!QuestInfo) return false
            if (!QuestInfo.name) return false

            return searchTermArr.some(term => QuestInfo.name.toLowerCase().includes(term))
                || searchTermArr.some(term => obj.npcName?.toLowerCase().includes(term))
                || searchTermArr.some(term => obj.npcId?.includes(term))
        })
        // filter by type user selected ['victoria-island', 'leafre', 'neo-tokyo', ...]
        .filter(([_id, { QuestInfo }]) => {
            if (location === 'all') return true
            if (!QuestInfo) return false
            if (!QuestInfo.area) return false

            const locationToAreaCode = {
                'job': '10',
                'maple-island': '20',
                'victoria': '30',
                'elnath': '33',
                'ludus': '37',
                'ellin': '39',
                'leafre': '41',
                'neo-tokyo': '43',
                'mulung': '44',
                'masteria': '45',
                'temple': '46',
                'party': '47',
                'world': '48',
                'malaysia': '49',
                'event': '50',
                'title': '51',
                'zakum': '11',
                'hero': '6',
            }

            return QuestInfo.area === locationToAreaCode[location]
        })
        // sort list by  number of search term matches, most matched at first
        .map(([_id, obj]) => {
            let matchCount = 0
            if (obj.QuestInfo && obj.QuestInfo.name) {
                searchTermArr.forEach(term => matchCount += obj.QuestInfo.name.toLowerCase().includes(term))
            }
            if (obj.npcName) {
                searchTermArr.forEach(term => matchCount += obj.npcName.toLowerCase().includes(term))
            }
            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            if (!a[1].QuestInfo || !a[1].QuestInfo.name) return 1
            if (!b[1].QuestInfo || !b[1].QuestInfo.name) return -1

            // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
            if (a[1].QuestInfo.name.toLowerCase() === b[1].QuestInfo.name.toLowerCase()) return 0
            if (a[1].QuestInfo.name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].QuestInfo.name.toLowerCase() === exactSearchTerm) return 1

            if (a[2] != b[2]) return b[2] - a[2]

            return a[0] - b[0]
        })
        .map(([_id, obj, matchCount]) => [_id, obj])

    return filteredQuestLibrary
}

export const convertAreaCodeToName = (val) => {
    const map = {
        6: 'Hero With The Lost Memory',
        10: 'Job',
        15: 'Cygnus Knights',
        11: 'Zakum',
        20: 'Maple Island',
        30: 'Victoria Island',
        33: 'Elnath Mt + Aquaroad',
        37: 'Ludus Lake',
        39: 'Ellin Forest',
        41: 'Leafre',
        43: 'Neo Tokyo',
        44: 'Mu Lung + Nihal Desert',
        45: 'Masteria',
        46: 'Temple of Time',
        47: 'Party Quest',
        48: 'World Tour',
        49: 'Malaysia',
        50: 'Event',
        51: 'Title',
    }
    return map[val]
}



// 
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
            img.src = `https://maplestory.io/api/SEA/198/npc/${npcId}/icon/`
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

export const questIdToName = (quest_id) => {
    try {
        let questName = data_Quest[quest_id].QuestInfo.name
        return questName
    } catch {
        return `error name : ${quest_id}`
    }
}

export const itemIdToNameDict = {
    ...data_Eqp,
    ...data_Consume,
    ...data_Ins,
    ...data_Etc,
}

export const convertItemIdToName = (id) => {   // helper fn
    if (id == 'null') return null
    if (!(id in itemIdToNameDict)) return null
    // 'null' = mesos
    if (typeof itemIdToNameDict[id] === 'string') {
        return itemIdToNameDict[id]
    }

    return itemIdToNameDict[id]['name']
}

export const convertMobIdToName = (id) => {
    try {
        let mobName = data_Mob[id]
        if (!mobName) throw Error()
        return mobName
    } catch {
        return `mob name error : ${id}`
    }
}

export const convertMobIdToUrl = (id) => {
    if (!id) return '/error'
    return `/monster/id=${id}`
}

export const generateNPCLink = (npc_id) => {
    if (!npc_id) return `/error`
    return `/npc?page=1&location=all&type=all&search=${npc_id}`
}



export const renderItemImageWrapper = (itemId) => {

    const itemName = convertItemIdToName(itemId)

    const type = itemId < '2000000'
        ? 'equip' : itemId < '3000000'
            ? 'use' : itemId < '4000000'
                ? 'setup' : 'etc'

    return renderImageWithItemIdType(itemId, itemName, type)
}

export const translateText = (p) => {
    // #b abc #k  => <b> abc </b>
    //  #m103000000#  => Kerning City
    //  #p2081007# => npc name
    //  #t4000236# => etc item
    //  #o9420530# => mob name
    //  #y4557# => quest name
    // #\n\r => new line
    if (!p) return p

    // mapId to MapName
    p = p.replaceAll(/\#m([0-9]+)\#/g, (match) => {
        // match = #m101000000#
        let mapId = match.slice(2, -1)
        try {
            let mapName = data_Map[mapId].mapName
            if (!mapName) throw Error()
            return mapName
        } catch {
            return `error map name, map id : ${match}`
        }
    })

    // npcId to npcName
    p = p.replaceAll(/\#p([0-9]+)\#/g, (match) => {
        // match = #p2081007#
        let npcId = match.slice(2, -1)
        try {
            let npcName = data_NPC[npcId].name
            if (!npcName) throw Error()
            return npcName
        } catch {
            return `error npc name, npc id : ${match}`
        }
    })

    // itemId to itemName
    p = p.replaceAll(/\#[ct]([0-9]+)\#/g, (match) => {
        // match = #t4000236#
        // match = #c4000236#   // check inventory?
        if (match[1] == 'c') return '0'
        let itemId = match.slice(2, -1)
        try {
            let itemName = convertItemIdToName(itemId)
            if (!itemName) throw Error()
            return itemName
        } catch {
            return `error npc name, item id : ${match}`
        }
    })
    // mobId to mobName
    p = p.replaceAll(/\#o([0-9]+)\#/g, (match) => {
        // match = #o9420530#
        let mobId = match.slice(2, -1)
        try {
            let mobName = convertMobIdToName(mobId)
            if (!mobName) throw Error()
            return mobName
        } catch {
            return `error mob name, mob id : ${match}`
        }
    })
    // questId to questName
    p = p.replaceAll(/\#y([0-9]+)\#/g, (match) => {
        // match = #y4557#
        let questId = match.slice(2, -1)
        try {
            let questName = questIdToName(questId)
            if (!questName) throw Error()
            return questName
        } catch {
            return `quest name error, quest id : ${match}`
        }
    })
    // bold text
    p = p.replaceAll(/\#[br](.+?)\#k/g, (match) => {
        // match = #b abc #k    // blue
        // match = #r abc #k   // red
        let contents = match.slice(2, -2)
        return `<b>${contents}</b>`
    })

    // new line
    p = p.replaceAll(/\\[rn]/g, "<br/>")

    return p
}

// 
export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}

export const convertQuestIdToUrl = (questId) => {
    if (!questId) return '/error'
    return `/quest/id=${questId}`
}

export const convertQuestParentNameToUrl = (questName) => {
    if (!questName) return '/error'
    // e.g. In Search of the Book of Ancient => /questline/id=3004

    for (let questId in data_Questline) {
        if (!data_Questline[questId].isHead) continue
        if (data_Quest[questId]?.QuestInfo.parent === questName) {
            // found questid
            return `/questline/id=${questId}`
        }
    }

    return '/error'
}

const BEAUTY_KEYWORDS = new Set([
    "Beauty Assistant",
    "Hair Salon Owner",
    "Hair Salon Assistant",
    "Dermatologist",
    "Royal Salon Assistant",
    "Plastic Surgeon",
    "Assistant Plastic Surgeon",
    "Lens Specialist",
    "Lens Wizard",
    "Lens Master",
    "Lens Broker",
    "Lens Magician",
    "Lens Expert",
    "Makeover Magician",
    "Visage Nurse",
    "Heavenly Hair-Bringer",
    "Streaky Stylist",
    "Plastic Surgery Director",
    "Plastic Surgery Doctor",
    "Skin Care Expert",
    "Hair Salon Director",
    "Artist",
    "Plastic Surgery Assistant",
    "Hair Stylist",
    "Lead Hair Stylist",
    "Assistant Hair Stylist",
    "Doctor Assistant",
    "Heavenly Hair-Bringer",
    "Lens Expert",
    "Makeover Magician",
    "Visage Nurse",
    "Wedding Wear Vendor",
    "Cathedral Wedding Coordinator",
    "Chapel Wedding Coordinator",
    "Plastic Surgery Assistant",
    "Hair Style Assistant",
    "Optician",
    "Hair salon assistant",
    "Salon owner",
    "Plastic Surgery Assistant",
    "Plastic Surgery"
]);

const JOB_KEYWORDS = new Set([
    "Bowman Job Instructor",
    "Magician Job Instructor",
    "Warrior Job Instructor",
    "Thief Job Instructor",
    "Pirate Job Instructor",
    "Bowman Instructor",
    "Bowman Training Instructor",
    "Entrance to Bowman Training Center",
    "Warrior Instructor",
    "Warrior Training Instructor",
    "Entrance to Warrior Training Center",
    "Magician Instructor",
    "Magician Training Instructor",
    "Entrance to Magician Training Center",
    "Thief Instructor",
    "Thief Training Instructor",
    "Entrance to Thief Training Center",
    "Pirate Instructor",
    "Pirate Training Instructor",
    "Entrance to Pirate Training Center",
    "The Chief Knight of Light",
    "The Chief Knight of Fire",
    "The Chief Knight of the Wind",
    "Chief Knight of Darkness",
    "Chief Knight of Lightning",
    "Tutorial Guide",
    "Training Instructor",
    "Mount Trainer",
    "Knight Trainer",
    "Knight Sergeant",
    "Instructor Penguin",
    "3rd Job - Warrior Instructor",
    "3rd Job - Magician Instructor",
    "3rd Job - Bowman Instructor",
    "3rd Job - Thief Instructor",
    "3rd Job - Pirate Instructor",
    "4th Job - Warrior Instructor",
    "4th Job - Magician Instructor",
    "4th Job - Bowman Instructor",
    "4th Job - Thief Instructor",
    "4th Job Pirate Instructor",
]);

const MERCHANT_KEYWORDS = new Set([
    "Weapon Seller",
    "Grocer",
    "Armor Seller",
    "24 Hr Mobile Store",
    "Info Merchant",
    "Scroll Seller",
    "General Merchant",
    "Sauna Manager",
    "Weapon & Armor Seller",
    "Merchant",
    "Tree Ornament Merchant",
    "Weapon Merchant",
    "Pet Merchant",
    "Item market",
    "General Dealer",
    "General Store",
    "Chocolate Ingredient Seller",
    "Coin Shop",
    "Item Seller",
    "Local Product Merchant",
    "Denpura Chef",
    "Dango Chef",
    "Takoyaki Chef",
    "Yakisoba Chef",
    "Ramen Cook",
    "Potion Seller",
    "Local Specialities",
    "Lunar New Year Special Supply",
    "Special Shop",
    "Merchant Intermediary",
    "Maple 7th Day Market Tout",
    "Special Item Merchant",
    "Weapon Store",
    "Potion Store",
    "Armor Store",
    "Local Specialities",
    "Lunar New Year Special Supply",
    "Vendor",
    "Weapon dealer",
    "Potion Store",
    "General Store",
    "Former Traveling Merchant"
]);

const OTHER = new Set([
    "Buddy List Admin",
    "Family Guide",
    "Doctor w/o License",
    "Master of MiniGame",
    "Cabin Crew",
    "Crewmember",
    "Internet Cafe Worker",
    "Internet Cafe Owner",
    "Public Service Worker",
    "Genius Composer",
    "CEO of Big Hit Records",
    "Seven Star Chef",
    "Station Guide",
    "Crewman",
    "Empress",
    "Tactician",
    "Drill Hall Gatekeeper",
    "Knight Sergeant",
    "Not a Suspicious Person",
    "Puppeteer",
    "Master of Disguise",
    "Black Witch",
    "Owner",
    "Assistant",
    "Patissier",
    "Monster Carnival",
    "Zoo Trainer",
    "Gatekeeper",
    "Dragon Squad Leader",
    "Retired Dragon Trainer",
    "Royal Guard Captain",
    "Expedition Leader",
    "Magicians' Representative",
    "Magician's Representative",
    "Warrior Representative",
    "Thief Representative",
    "Lion King",
    "Queen",
    "Chief Knight",
    "Locksmith",
    "Gardener",
    "Event Assistant",
    "Master of Lock-Picking",
    "Weapon Rental for Internet Cafe",
    "Monk of Honor",
    "Baby Bird Manager",
    "Emissary of Honor",
    "11th Anniversary Guide",
    "Package Deliverer",
    "Counselor",
    "Daily Ledger",
    "Pet Scientist",
    "Christmas Party Quest NPC",
    "Wizet Wizard",
    "Easter Event",
    "Love Fairy",
    "Lovable Parents",
    "Chapel Staff",
    "Chapel Photo Specialist",
    "Chapel Marriage Maestro",
    "Amoria Ambassador",
    "Witch at Large - Halloween",
    "Pie Advocate - Thanksgiving",
    "Furrious Santa - Maplemas",
    "Temple Priestess - Hanukkah",
    "Soda Jerk",
    "Temple Guide - Hanukkah",
    "NLC Mayor",
    "NLC Subway staff",
    "The Snail",
    "MBI Agent",
    "Stepmom",
    "Toy Maker",
    "Butler",
    "The CVS Guy",
    "The Target Guy",
    "The Duane Reade Girl",
    "The 7-Eleven Guy",
    "The Rite-Aid Guy",
    "The Best Buy Girl",
    "Taru Spirit",
    "Antique Collector",
    "Plumber",
    "Dream Interpreter",
    "Farmer's Daughter",
    "Daughter of the Poultry Farm Owner",
    "Santa's Lost Stars",
    "Snow Fairy",
    "Reindeer",
    "Treasure Hunter",
    "Fortune Teller",
    "Ghostship Keeper",
    "Souvenir Attendant",
    "Lens Broker",
    "Lens Magician",
    "NLC Mayor",
    "Feast Helper",
    "Halloween Gauntlet Coordinator",
    "Monster Slayer",
    "Alchemist of Life",
    "Goddess of the Moon",
]);

const STORAGE_KEYWORDS = new Set([
    "Storage Keeper",
    "Storage Owner",
    "Warehouse Keeper",
    "Store Banker",
    "Warehouse keeper",
    "Storage"
]);

const CRAFTER_KEYWORDS = new Set([
    "Item Maker",
    "Item Creator",
    "Ore Refiner",
    "Old Blacksmith",
    "Glove Maker",
    "Guild Emblem Creator",
    "Refining Expert",
    "Shoemaker",
    "Weapon Creator",
    "Potion Creator",
    "Zenumist president",
    "Alcadno President",
    "Weapon Technician"
]);

const PET_KEYWORDS = new Set([
    "Pet Food Merchant",
    "Pet Master",
    "Pet Trainer",
    "Zoo Trainer",
    "Kenta",
    "Pet Scientist",
]);

const TRANSPORT_KEYWORDS = new Set([
    "Station Cleark",
    "Subway Worker",
    "Subway Personnel",
    "To Victoria Island",
    "To Rien",
    "Selling Ticket to Ludibrium",
    "Dungeon Guide",
    "Selling Ticket to Orbis",
    "Ticket box desk",
    "Ticket Usher",
    "Public Transportation",
    "Multi-Functional Portal",
    "Warp Helper",
    "Pilot",
    "Malaysia Tour Guide",
    "Entrance - Holiday PQ Map",
    "Ticketing Usher",
    "World Tour Guide",
    "NLC Subway staff",
    "Pilot",
    "Tour Guide",
    "Cabin Crew",
    "Crewmember",
    "Dolphin",
    "Retired Dragon Trainer",
    "Crew",
]);

const WEDDING_KEYWORDS = new Set([
    "Wedding Jeweler",
    "Love Fairy",
    "Cathedral Wedding Officiator",
    "Amoria's Guiding Light",
    "Cathedral Assistant",
    "Cathedral Photo Specialist",
    "Chapel Staff",
    "Chapel Photo Specialist",
    "Chapel Marriage Maestro",
    "Chapel Wedding Coordinator",
    "Cathedral Wedding Coordinator",
    "Wedding Planner",
    "Wedding Wear Vendor",
    "Elegant Arrow-gance",
    "Amoria Ambassador",
]);


