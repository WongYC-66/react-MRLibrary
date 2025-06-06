import {
    generateNPCLibrary,
    filterNPCList,
    addImageURL,
    organizeNpcLocation,
    applyPagination,
} from "../utility.js"

const npcLibrary = generateNPCLibrary()

// API-support
// 1. /api/v1/npc?id=1302000
//      - return 1 mob
// 2. /api/v1/npc?location=amoria&type=beauty&search=
//      - return array of mobs

export default (request, context) => {
    console.log(context.url.href)
    // console.log(Object.keys(equipLibrary).length)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const npcId = Number(searchParams.get('id'))
            if (!(npcId in npcLibrary)) {
                throw new Error('NpcId not Found')
            }

            let returnNPC = npcLibrary[npcId]
            returnNPC = { id: npcId, ...returnNPC }
            returnNPC = addImageURL(returnNPC, 'npcs', context)
            returnNPC = organizeNpcLocation(returnNPC)

            return new Response(
                JSON.stringify(returnNPC),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
        } else {
            // 2. return Array of Object

            let filteredNPCList = filterNPCList({ npcLibrary, searchParams })
                .map(([npcId, npcData]) => { return { id: npcId, ...npcData } })

            filteredNPCList = addImageURL(filteredNPCList, 'npcs', context)
                .map(organizeNpcLocation)
            
            filteredNPCList = applyPagination(filteredNPCList, searchParams, 'npc')

            return new Response(
                JSON.stringify(filteredNPCList),
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

export const config = { path: "/api/v1/npc" };