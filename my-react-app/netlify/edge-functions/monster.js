import {
    generateMobLibrary,
    filterMobList,
    addImageURL,
    addMapCategory,
    translateMobStats,
    categorizeItemDrops,
    generateMobInfo,
    organizeSpawnMap,
} from "../utility.js"

const mobLibrary = generateMobLibrary()

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

            return new Response(JSON.stringify(returnMob))
        } else {
            // 2. return Array of Object

            // continue here

            // const overallCategory = searchParams.get('overallcategory')

            // const urlPathname = "/" + overallCategory

            // if (!(urlPathname in urlPathToCategoryName)) {
            //     throw new Error('overallcategory error')
            // }

            // let filteredEquipList = filterEquipList({ equipLibrary, searchParams, urlPathname })
            //     .map(([equipId, equipData]) => { return { id: equipId, ...equipData } })

            // let returnEquipList = addImageURL(filteredEquipList, 'characters', context)
            // returnEquipList = returnEquipList.map(el => translateStats(el))

            // return new Response(
            //     JSON.stringify(returnEquipList),
            //     {
            //         status: 200,
            //         headers: {
            //             "Content-Type": "application/json",
            //         },
            //     }
            // );
            return new Response("Monster")
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