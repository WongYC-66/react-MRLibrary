import { useSearchParams, Link } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
export const filterNPCList = (npcLibrary) => {
    const [searchParams] = useSearchParams()
    // No filter at first loading or if URL don't have query param 
    const filteredNPCLibrary =  Object.entries(npcLibrary)

    const filterOption = Object.fromEntries([...searchParams.entries()])
    if(!filterOption.length) return filteredNPCLibrary

    const searchTermArr = filterOption.search.toLowerCase().split(' ')  // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search.toLowerCase()


    let filteredItemList = Object.entries(itemLibrary)
        .filter(([_id, { name }]) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })

    // sort list by  number of search term matches, most matched at first
    filteredItemList = filteredItemList.map(([_id, obj]) => {
        let matchCount = 0
        searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
        return [_id, obj, matchCount]
    })

    filteredItemList.sort((a, b) => {
        // exact term sort to front, then sort by matchCount DESC, then sort by id ASC
        if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
        if (a[1].name.toLowerCase() === exactSearchTerm) return -1
        if (b[1].name.toLowerCase() === exactSearchTerm) return 1

        return b[1] - a[1]
    })

    filteredItemList = filteredItemList.map(([_id, obj, matchCount]) => [_id, obj])
    return filteredItemList
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

// 
export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}