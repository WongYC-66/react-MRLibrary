import {
    generateSkillLibrary,
    addImageURL,
    addJobCategory,
    addSkillStats,
    filterSkillList,
    applyPagination,
} from "../utility.js"

const skillLibrary = generateSkillLibrary()

// API-support
// 1. /api/v1/skill?id=1001004
//      - return 1 item
// 2. /api/v1/skill?page=1&filter=mm&order=id&sort=ascending&search=crossbow
//      - return array of items


export default async (request, context) => {
    console.log(context.url.href)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('id')) {
            // 1. return single Object if has ID
            const skillId = searchParams.get('id')
            if (!(skillId in skillLibrary)) {
                throw new Error('SkillId not Found')
            }

            let returnSkill = skillLibrary[skillId]
            returnSkill = { id: skillId, ...returnSkill }

            returnSkill = addImageURL(returnSkill, 'skills', context)
            returnSkill = addJobCategory(returnSkill)
            returnSkill = addSkillStats(returnSkill)

            return new Response(
                JSON.stringify(returnSkill),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

        } else {
            // 2. return Array of Object
            let filteredSkillList = filterSkillList({ skillLibrary, searchParams })
                .map(([skillId, skillData]) => { return { id: skillId, ...skillData } })

            filteredSkillList = addImageURL(filteredSkillList, 'skills', context)
                .map(addJobCategory)

            const paginatedResponse = applyPagination(filteredSkillList, searchParams, 'skill')

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

export const config = { path: "/api/v1/skill" };