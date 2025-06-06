import {
    generateItemLibrary,
    generateItemDropLibrary,
    addImageURL,
    addItemStats,
    addMobThatDrops,
    addGachaLoc,
    filterByType,
    sanitizeItemLibrary,
    applyPagination,
} from "../utility.js"

const itemLibrary = generateItemLibrary()
const itemDropLibrary = generateItemDropLibrary()

// API-support
// 1. /api/v1/item?id=1302000
//      - return 1 item
// 2. /api/v1/item?overallcategory=use&filter=potion&order=id&sort=ascending&search=
//      - return array of items


export default async (request, context) => {
    console.log(context.url.href)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const itemId = Number(searchParams.get('id'))
            if (!(itemId in itemLibrary)) {
                throw new Error('ItemId not Found')
            }

            let returnItem = itemLibrary[itemId]
            returnItem = { id: itemId, ...returnItem }

            returnItem = addImageURL(returnItem, 'items', context)
            returnItem = addItemStats(returnItem, 'items', context)
            returnItem = addMobThatDrops(returnItem, itemDropLibrary)
            returnItem = addGachaLoc(returnItem)

            return new Response(
                JSON.stringify(returnItem),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

        } else {
            // 2. return Array of Object
            const overallCategory = searchParams.get('overallcategory')?.toLowerCase() || 'any'

            if (!(['any', 'use', 'setup', 'etc'].includes(overallCategory))) {
                throw new Error('overallcategory error')
            }

            const sanitizedItemLibrary = sanitizeItemLibrary(itemLibrary, overallCategory)  // remove by range

            let filteredItemList = filterByType({ itemLibrary: sanitizedItemLibrary, searchParams, overallCategory })
                .map(([itemId, itemData]) => { return { id: itemId, ...itemData } })

            filteredItemList = addImageURL(filteredItemList, 'items', context)

            filteredItemList = applyPagination(filteredItemList, searchParams, 'item') 

            return new Response(
                JSON.stringify(filteredItemList),
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

export const config = { path: "/api/v1/item" };