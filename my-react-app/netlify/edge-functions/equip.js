import { generateEquipLibrary, filterEquipList, urlPathToCategoryName } from "../utility.js"

const equipLibrary = generateEquipLibrary()

// /weapon?page=1&job=0&category=dagger&order=reqLevel&sort=ascending&cosmetic=null&search=maple

// /api/v1/equip?id=1302000
// /api/v1/equip?overallcategory=weapon&job=0&category=dagger&order=reqLevel&sort=ascending&cosmetic=null&search=maple


export default async (request, context) => {
    console.log(context.url.href)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const equipId = Number(searchParams.get('id'))
            if (!(equipId in equipLibrary)) {
                throw new Error('EquipId not Found')
            }

            return new Response(JSON.stringify(equipLibrary[equipId]))
        } else {
            // 2. return Array of Object
            const overallCategory = searchParams.get('overallcategory')

            const urlPathname = "/" + overallCategory

            // console.log({ overallCategory, urlPathname })
            if (!(urlPathname in urlPathToCategoryName)) {
                throw new Error('overallcategory error')
            }

            const filteredEquipList = filterEquipList({ equipLibrary, searchParams, urlPathname })
                .map(([equipId, equipData]) => { return { id: equipId, ...equipData } })


            return new Response(
                JSON.stringify(filteredEquipList),
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