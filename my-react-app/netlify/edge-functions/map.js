import {
    generateMapLibrary,
    addImageURL,
    addHDMapImageURL,
    addMapStats,
    addMapBgmURL,
    translateNPCId,
    addMobSpawn,
    addMonsterBookSpawn,
    organizeMobSpawn,
    filterMapList,
    applyPagination,
} from "../utility.js"

const mapLibrary = generateMapLibrary()

// API-support
// 1. /api/v1/map?id=104040000
//      - return 1 item
// 2. /api/v1/map?page=1&location=VictoriaIsland&search=hunting
//      - return array of items


export default async (request, context) => {
    console.log(context.url.href)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const mapId = Number(searchParams.get('id'))
            if (!(mapId in mapLibrary)) {
                throw new Error('MapId not Found')
            }

            let returnMap = mapLibrary[mapId]
            returnMap = { id: mapId, ...returnMap }

            returnMap = addImageURL(returnMap, 'maps', context)
            returnMap = addHDMapImageURL(returnMap)
            returnMap = addMapStats(returnMap)
            returnMap = addMapBgmURL(returnMap)
            returnMap = translateNPCId(returnMap)
            returnMap = addMobSpawn(returnMap)
            returnMap = addMonsterBookSpawn(returnMap)
            returnMap = organizeMobSpawn(returnMap)

            return new Response(
                JSON.stringify(returnMap),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

        } else {
            // 2. return Array of Object
            let filteredMapList = filterMapList({ mapLibrary, searchParams })
                .map(([mapId, mapData]) => { return { id: mapId, ...mapData } })

            filteredMapList = addImageURL(filteredMapList, 'maps', context)

            const paginatedResponse = applyPagination(filteredMapList, searchParams, 'map')

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

export const config = { path: "/api/v1/map" };