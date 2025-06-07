import {
    generateMusicLibrary,
    filterMusicLibrary,
    applyPagination,
} from "../utility.js"

const musicLibrary = generateMusicLibrary()
// console.log('run')

// API-support
// 1. /api/v1/music?name=amoria
//      - return 1 item
// 2. /api/v1/music?search=amoria
//      - return array of items


export default async (request, context) => {
    console.log(context.url.href)
    try {
        const searchParams = context.url.searchParams

        if (searchParams.has('name')) {
            // 1. return single Object if has ID
            const musicName = searchParams.get('name')
            if (!(musicName in musicLibrary)) {
                throw new Error('MusicName not Found')
            }

            let returnMusic = musicLibrary[musicName]

            return new Response(
                JSON.stringify(returnMusic),
                {
                    status: 200,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

        } else {
            // 2. return Array of Object
            let filteredMusicList = filterMusicLibrary({ musicLibrary, searchParams })
                .map(([name, property]) => { return { name, ...property } })

            const paginatedResponse = applyPagination(filteredMusicList, searchParams, 'music')

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

export const config = { path: "/api/v1/music" };