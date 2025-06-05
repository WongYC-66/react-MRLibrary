export default (request, context) => {
    // console.log(req)
    console.log(context)
    console.log(new URL(context.url).searchParams)
    console.log(context.url.searchParams.has('id'))
    // console.log(new URL(context.url).searchParams.has('map'))
    return new Response("Equip")
};

export const config = { path: "/api/v1/npc" };