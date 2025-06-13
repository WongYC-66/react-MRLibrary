import {
    generateMobLibrary,
    filterMobList,
    addImageURL,
    addMapCategory,
    translateMobStats,
    categorizeItemDrops,
    generateMobInfo,
    organizeSpawnMap,
    applyPagination,
    addHasMobDrop,
} from "../utility.js"

const mobLibrary = generateMobLibrary()

// API-support
// 1. /api/v1/monster?id=100100
//      - return 1 item
// 2. /api/v1/monster?page=1&filter=any&category=victoriaisland&order=level&sort=ascending&search=mushroom
//      - return array of items

export default (request, context) => {
    console.log(context.url.href)
    // console.log(Object.keys(equipLibrary).length)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const mobId = Number(searchParams.get('id'))
            if (!(mobId in mobLibrary)) {
                throw new Error('mobId not Found')
            }

            let returnMob = generateMobInfo(mobId)
            returnMob = addImageURL(returnMob, 'monsters', context)
            returnMob = addMapCategory(returnMob, mobLibrary)
            returnMob = organizeSpawnMap(returnMob)

            returnMob = translateMobStats(returnMob)
            returnMob = categorizeItemDrops(returnMob)

            return new Response(
                JSON.stringify(returnMob),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } else {
            // 2. return Array of Object

            let filteredMobList = filterMobList({ mobLibrary, searchParams })
                .map(([mobId, mobData]) => { return { id: mobId, ...mobData } })

            let returnMobList = addImageURL(filteredMobList, 'monsters', context)
                .map(returnMob => addMapCategory(returnMob, mobLibrary))
                .map(translateMobStats)
                .map(addHasMobDrop)

            const paginatedResponse = applyPagination(returnMobList, searchParams, 'monster')

            return new Response(
                JSON.stringify(paginatedResponse),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        }
    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
    }
};

export const config = { path: "/api/v1/monster" };