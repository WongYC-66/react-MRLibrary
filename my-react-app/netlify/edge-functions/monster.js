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
} from "../utility.js"

const mobLibrary = generateMobLibrary()

// API-support
// 1. /api/v1/monster?id=1302000
//      - return 1 mob
// 2. /api/v1/monster?filter=any&category=Amoria&order=level&sort=ascending&search=
//      - return array of mobs

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

            returnMobList = applyPagination(returnMobList, searchParams, 'monster')

            return new Response(
                JSON.stringify(returnMobList),
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