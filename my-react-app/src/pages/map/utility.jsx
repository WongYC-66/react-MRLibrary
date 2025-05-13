import { useSearchParams, Link } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
import data_NPC from "../../../data/data_NPC.json"

import data_Map from "../../../data/data_Map.json"
import data_MapStats from "../../../data/data_MapStats.json"

import data_Mob from '../../../data/data_Mob.json'
// 
export const filterMapList = (questLibrary) => {
    const [searchParams] = useSearchParams()

    let filteredQuestLibrary = Object.entries(questLibrary)

    const filterOption = Object.fromEntries([...searchParams.entries()])
    // No filter at first loading or if URL don't have query param 
    if (!Object.keys(filterOption).length) return filteredQuestLibrary

    const location = filterOption.location || 'all'

    let searchTermArr = filterOption.search?.toLowerCase().split(' ') || [''] // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search?.toLowerCase().trim() || null

    searchTermArr = searchTermArr.filter(Boolean)  // filter out space
    console.log(searchTermArr)
    console.log(location)

    // console.log(filteredQuestLibrary)

    filteredQuestLibrary = filteredQuestLibrary
        .filter(([_id, obj]) => {
            if (!searchTermArr.length) return true
            const streetName = obj.streetName || ''
            const mapName = obj.mapName || ''

            return searchTermArr.some(term => streetName.toLowerCase().includes(term))
                || searchTermArr.some(term => mapName.toLowerCase().includes(term))
                || _id === exactSearchTerm
        })
        // filter by type user selected ['maple', 'victoria-island', 'elin', 'thai', ...]
        .filter(([_id, { mapCategory }]) => {
            if (location === 'all') return true
            return mapCategory === location
        })
        // sort list by  number of search term matches, most matched at first
        .map(([_id, obj]) => {
            let matchCount = 0
            if (obj.streetName) {
                searchTermArr.forEach(term => matchCount += obj.streetName.toLowerCase().includes(term))
            }
            if (obj.mapName) {
                searchTermArr.forEach(term => matchCount += obj.mapName.toLowerCase().includes(term))
            }
            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
            if (a[1]?.streetName?.toLowerCase() === exactSearchTerm) return -1
            if (b[1]?.streetName?.toLowerCase() === exactSearchTerm) return 1

            if (a[2] != b[2]) return b[2] - a[2]    // matchcount

            return a[0] - b[0]          // last, id
        })
        .map(([_id, obj, matchCount]) => [_id, obj])

    return filteredQuestLibrary
}

// 
export const renderImageWithMapId = (mapId) => {
    if (!mapId) return

    const handleError = e => {
        const fileName = `${mapId.padStart(9, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: server file under /images/
        // 2: maplelegends
        // 3: maplestory.io

        if (img.getAttribute("myimgindex") === '0') {
            // switch to server file under /images/ (option - 1)
            // console.log("switch to option-1")
            img.setAttribute("myimgindex", "1")
            img.src = `\\images\\maps\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplelegends (option - 2)
            // console.log("switch to option-2")
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/map/${fileName}`
            return
        }
        // error again? 
        if (img.getAttribute("myimgindex") === '2') {
            // switch to maplestory.io exception list (option - 3)
            // console.log("switch to option-3")
            img.setAttribute("myimgindex", "3")
            img.src = `https://maplestory.io/api/SEA/198/map/${Number(mapId)}/render`
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
        id={`image-${mapId}`}
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        className="mw-50"
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
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

export const convertMapIdToUrl = (id) => {
    if (!id) return '/error'
    return `/map/id=${id}`
}

export const generateNPCLink = (npc_id) => {
    if (!npc_id) return `/error`
    return `/npc?page=1&location=all&type=all&search=${npc_id}`
}

// 
export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}
