import {
    generateEquipLibrary,
    generateItemDropLibrary,
    filterEquipList,
    urlPathToCategoryName,
    addImageURL,
    addMobThatDrops,
    addGachaLoc,
    translateEquipStats,
} from "../utility.js"

const equipLibrary = generateEquipLibrary()
const itemDropLibrary = generateItemDropLibrary()
// console.log('run')

// API-support
// 1. /api/v1/equip?id=1302000
//      - return 1 item
// 2. /api/v1/equip?overallcategory=weapon&job=0&category=dagger&order=reqLevel&sort=ascending&cosmetic=null&search=maple
//      - return array of items


export default async (request, context) => {
    console.log(context.url.href)
    // console.log(Object.keys(equipLibrary).length)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const equipId = Number(searchParams.get('id'))
            if (!(equipId in equipLibrary)) {
                throw new Error('EquipId not Found')
            }

            let returnEquip = equipLibrary[equipId]
            returnEquip = { id: equipId, ...returnEquip }

            returnEquip = addImageURL(returnEquip, 'characters', context)
            returnEquip = addMobThatDrops(returnEquip, itemDropLibrary)
            returnEquip = addGachaLoc(returnEquip)
            returnEquip = translateStats(returnEquip)

            return new Response(JSON.stringify(returnEquip))

        } else {
            // 2. return Array of Object
            const overallCategory = searchParams.get('overallcategory')

            const urlPathname = "/" + overallCategory

            if (!(urlPathname in urlPathToCategoryName)) {
                throw new Error('overallcategory error')
            }

            let filteredEquipList = filterEquipList({ equipLibrary, searchParams, urlPathname })
                .map(([equipId, equipData]) => { return { id: equipId, ...equipData } })

            let returnEquipList = addImageURL(filteredEquipList, 'characters', context)
            returnEquipList = returnEquipList.map(el => translateStats(el))

            return new Response(
                JSON.stringify(returnEquipList),
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

export const config = { path: "/api/v1/equip" };