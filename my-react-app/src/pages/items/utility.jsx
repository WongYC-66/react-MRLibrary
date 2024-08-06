import { useSearchParams, Link } from "react-router-dom"
// 
import Image from "react-bootstrap/Image"
// 
export const filterItemList = (itemLibrary) => {
    const [searchParams] = useSearchParams()
    if (searchParams.size) { // If URL has query param, filter ...

        const filterOption = Object.fromEntries([...searchParams.entries()])
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
    // No filter at first loading or if URL don't have query param 
    return Object.entries(itemLibrary)
}
// 
export const filterUseItemList = (itemLibrary) => {
    const [searchParams] = useSearchParams()
    if (searchParams.size <= 0) return Object.entries(itemLibrary)  // No filter at first loading or if URL don't have query param 

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search.toLowerCase().split(' ')  // split 'dark int' to ['dark', 'int']
    const exactSearchTerm = filterOption.search.toLowerCase()

    const filter = filterOption.filter
    const order = filterOption.order
    const sort = filterOption.sort
    let filteredUseItemList = Object.entries(itemLibrary)

    // console.log("before filter = ", filteredUseItemList)
    const potionKeys = ['hp', 'hpR', 'mp', 'mpR', 'eva', 'acc', 'speed', 'jump', 'mad', 'pad', 'mdd', 'pdd', 'poison', 'seal', 'weakness', 'curse']

    filteredUseItemList = filteredUseItemList
        // fuzzy seach for any name matched with space separated text, with OR condition
        .filter(([_id, { name }]) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        // 
        .filter(([_, obj]) => {
            if (filter === "any") return true

            if (filter === "scroll") return obj.hasOwnProperty("success")
                && !obj.hasOwnProperty("masterLevel")

            if (filter === "potion") return potionKeys.some(k => obj[k] !== undefined)
                && !obj.hasOwnProperty("monsterBook")
                && !obj.hasOwnProperty("morph")

            if (filter === "tp") return obj.hasOwnProperty('moveTo')
            if (filter === "morph") return obj.hasOwnProperty('morph')
            if (filter === "mastery") return obj.hasOwnProperty('masterLevel')
            if (filter === "sack") return obj.hasOwnProperty('type')
            if (filter === "mbook") return obj.hasOwnProperty('monsterBook')
            if (filter === "other") return !obj.hasOwnProperty("success")   // not scroll
                && !obj.hasOwnProperty('moveTo')                            // not tp
                && !obj.hasOwnProperty('morph')                            // not morphing
                && !obj.hasOwnProperty('type')                            // not sack bag
                && !obj.hasOwnProperty('masterLevel')                      // not mastery book
                && potionKeys.every(k => obj[k] == undefined)           // not potion
        })
        // reformat data to be [_id, {obj}, matchCount]
        .map(([_id, obj]) => {
            // matchCount for fuzzy search
            let matchCount = 0
            searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))

            return [_id, obj, matchCount]
        })
        .sort((a, b) => {
            // a = [_id, obj, matchCount]
            // exact term sort to front, then sort by matchCount DESC, then sort by property user select
            if (a[1].name.toLowerCase() === b[1].name.toLowerCase()) return 0
            if (a[1].name.toLowerCase() === exactSearchTerm) return -1
            if (b[1].name.toLowerCase() === exactSearchTerm) return 1
    
            // 1. sort by fuzzy search matchCount, desc, most-matched come first
            if (a[2] !== b[2]) return b[2] - a[2]

            // if undefined, sort the undefined to the end
            if (a[1][order] == undefined && b[1][order] == undefined) return 0
            if (a[1][order] == undefined) return 1
            if (b[1][order] == undefined) return -1

            // if same value, sort by mobId then
            if (a[1][order] === b[1][order]) return a[0] - b[0]


            // else, sort ascendingly, for Property of "level/...."
            return a[1][order] - b[1][order]
        })
        // remove the mathCount
        .map(([_id, obj, matchCount]) => [_id, obj])

    // console.log("after filter = ", filteredMobList)
    // console.log(`found : ${filteredMobList.length} records`)

    return sort === "descending"
        ? filteredUseItemList.toReversed().filter(([_, obj]) => obj[order] != undefined)
            .concat(filteredUseItemList.toReversed().filter(([_, obj]) => obj[order] == undefined))
        : filteredUseItemList
}

// 

export const renderItemList = (filteredItemList, type = "use") => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredItemList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredItemList = filteredItemList.slice(sliceStartIndex, sliceEndIndex)
    // [ [itemId, {name : xxxx , desc : xxx}] , [] , [] , ... ]

    return filteredItemList.map(x => {
        const itemId = x[0]
        const name = x[1].name
        const desc = x[1].desc
        return (
            <tr key={itemId}>
                <td>
                    <Link to={`/${type}/id=${itemId}`}>
                        {renderImageWithItemId(itemId, name)}
                    </Link>
                </td>
                <td>
                    <Link to={`/${type}/id=${itemId}`}>
                        {name}
                    </Link>
                </td>
                <td>
                    {desc && desc.split("\\n").map(x =>
                        <p key={x} className="p-0 m-0" dangerouslySetInnerHTML={{ __html: x }}></p>
                    )}
                </td>
            </tr>
        )
    })
}
//



// 
export const renderImageWithItemId = (itemId, itemName) => {
    if (!itemId || !itemName) return

    const handleError = e => {
        // console.log("trigger handleError")
        const fileName = `${itemId.padStart(8, 0)}.png`
        const img = e.target
        // find suitable image src from:
        // 1: server file under /images/
        // 2: maplelegends
        // 3: maplestory.io exception list
        // 4: maplestory.io

        if (img.getAttribute("myimgindex") === '0') {
            // switch to server file under /images/ (option - 1)
            // console.log("switch to option-1")
            img.setAttribute("myimgindex", "1")
            img.src = `\\images\\items\\${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '1') {
            // switch to maplestory.io source (option - 2)
            // console.log("switch to option-2")
            img.setAttribute("myimgindex", "2")
            img.src = `https://maplelegends.com/static/images/lib/item/${fileName}`
            return
        }
        if (img.getAttribute("myimgindex") === '2') {
            // switch to maplestory.io exception list (option - 3)
            // console.log("switch to option-3")
            img.setAttribute("myimgindex", "3")
            img.src = itemIdToExceptionUrl({ id: itemId, name: itemName })
            return
        }
        if (img.getAttribute("myimgindex") === '3') {
            // switch to maplestory.io  (option - 4)
            // console.log("switch to option-4")
            img.setAttribute("myimgindex", "4")
            img.src = `https://maplestory.io/api/SEA/198/item/${itemId}/icon?resize=1.0`
            return
        }
        if (img.getAttribute("myimgindex") === '4') {
            // switch to maplestory.io source (option - 5 - spare)
            // console.log("switch to option-5")
            img.setAttribute("myimgindex", "5")
            img.src = "/error"
            return
        }
        if (img.getAttribute("myimgindex") === '5') {
            // return console.log('end')
            return
        }
    }

    const ImageComponent = <Image
        myimgindex="0"
        src={`...`} // by default, make it trigger error
        id={`image-${itemId}`}
        fluid
        alt="Image not found"
        onError={handleError} />

    return ImageComponent
}
// 
export const itemIdToExceptionUrl = ({ id, name }) => {
    name = name.toLowerCase()
    if (["scroll", "10%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040200/icon?resize=1.0`
    if (["scroll", "30%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040108/icon?resize=1.0`
    if (["scroll", "60%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2044501/icon?resize=1.0`
    if (["scroll", "70%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040814/icon?resize=1.0`
    if (["scroll", "100%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2041300/icon?resize=1.0`
    if (["scroll", "clean slate", "1%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2049000/icon?resize=1.0`
    if (["scroll", "chaos"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2049100/icon?resize=1.0`
    if (["nx cash", "1000"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/5680151/icon?resize=1.0`
    if (["nx cash", "5000"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/5680578/icon?resize=1.0`
    if (["white scroll fragment"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/4001533/icon?resize=1.0`
    return null
}

// GACHA LIST --

export const filterGachaList = (itemLibrary) => {
    const [searchParams] = useSearchParams()
    if (searchParams.size <= 0) return itemLibrary  // No filter at first loading or if URL don't have query param 

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search.toLowerCase().split(' ')
    const location = filterOption.location
    const type = filterOption.type

    let filteredItemList = itemLibrary
        .filter(({ name }) => {
            if (!name) return false
            return searchTermArr.some(term => name.toLowerCase().includes(term))
        })
        .filter(obj => {
            if (location === "all") return true
            return location === obj.location
        })
        .filter(obj => {
            if (type === "all") return true
            return type === obj.type
        })

    // sort list by  number of search term matches, most matched at first
    filteredItemList = filteredItemList.map(obj => {
        let matchCount = 0
        searchTermArr.forEach(term => matchCount += obj.name.toLowerCase().includes(term))
        return [obj, matchCount]
    })

    filteredItemList.sort((a, b) => b[1] - a[1])  // sort by matchCount

    filteredItemList = filteredItemList.map(([obj, matchCount]) => obj)

    return filteredItemList
}
// 
export const updateSearchResultCount = (number) => {
    const countEl = document.getElementById("record-count")
    if (countEl) countEl.textContent = `found ${number || 0} record${number >= 2 ? "s" : ""}`
}