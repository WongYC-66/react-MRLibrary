import {
    generateQuestLibrary,
    addQuestLocation,
    filterQuestList,
    sanitizeQuestInfo,
    applyPagination,
} from "../utility.js"

const questLibrary = generateQuestLibrary()

// API-support
// 1. /api/v1/quest?id=2017
//      - return 1 item
// 2. /api/v1/quest?location=victoria&type=all&search=arwen
//      - return array of items


export default async (request, context) => {
    console.log(context.url.href)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const questId = Number(searchParams.get('id'))
            if (!(questId in questLibrary)) {
                throw new Error('QuestId not Found')
            }

            let returnQuest = questLibrary[questId]
            returnQuest = { id: questId, ...returnQuest }

            returnQuest = addQuestLocation(returnQuest)

            return new Response(
                JSON.stringify(returnQuest),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

        } else {
            // 2. return Array of Object
            let filteredQuestList = filterQuestList({ questLibrary, searchParams })
                .map(([questId, questData]) => { return { id: questId, ...questData } })
                .map(sanitizeQuestInfo) // save bandwidth!
                .map(addQuestLocation)

            const paginatedResponse = applyPagination(filteredQuestList, searchParams, 'quest')

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

export const config = { path: "/api/v1/quest" };