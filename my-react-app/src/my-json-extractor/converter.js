import path from 'path';

// USER CONFIG
const __dirname = import.meta.dirname;
const data_root_dir = path.join(__dirname, "../../data/json")   // JSON ROOT FOLDER of Harepacker Dump
const out_dir = path.join(__dirname, "../../data/")
// const out_dir = __dirname

console.log({ __dirname, data_root_dir, out_dir })

import { diskWriterInJSON, readOneFile, readFolderRecursively, } from './utility.js';

import {
    ConsumeInsItemIdDataFormatting,
    EqpItemIdDataFormatting,
    EtcItemIdDataFormatting,
    GearStatsDataFormatting,
    ItemStatsDataFormatting,
    MapIdDataFormatting,
    MapMobCountDataFormatting,
    MapStatsDataFormatting,
    MB_DropsDataFormatting,
    MB_MapsDataFormatting,
    MobIdDataFormatting,
    MobStatsDataFormatting,
    NPCDataFormatting,
    NPCLocationFormatting,
    NPCLocationFormatting2,
    NPCStatsDataFormatting,
    QuestDataFormatting,
    QuestLineDataFormatting,
    RenderMobOriginDataFormatting,
    RenderNpcOriginDataFormatting,
    RenderObjOriginDataFormatting,
    RenderPortalOriginDataFormatting,
    RenderReactorOriginDataFormatting,
    RenderTileOriginDataFormatting,
    SkillDataFormatting,
    SkillStatsDataFormatting,
    WorldMapDataFormatting,
} from './dataFormatting.js';

async function MB_Drops() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'MonsterBook.img.json'))
    const outputData = MB_DropsDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_MB_Drops.json'), outputData)
}

async function MB_Maps() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'MonsterBook.img.json'))
    const outputData = MB_MapsDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_MB_Maps.json'), outputData)
}

async function Mob() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Mob.img.json'))
    const outputData = MobIdDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Mob.json'), outputData)
}

async function Consume() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Consume.img.json'))
    const outputData = ConsumeInsItemIdDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Consume.json'), outputData)
}

async function Ins() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Ins.img.json'))
    const outputData = ConsumeInsItemIdDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Ins.json'), outputData)
}

async function Etc() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Etc.img.json'))
    const outputData = EtcItemIdDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Etc.json'), outputData)
}

async function Eqp() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Eqp.img.json'))
    const outputData = EqpItemIdDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Eqp.json'), outputData)
}

async function Map() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Map.img.json'))
    const outputData = MapIdDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Map.json'), outputData)
}

async function Skill() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'Skill.img.json'))
    const outputData = SkillDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Skill.json'), outputData)
}

async function NPC() {
    const inputData = await readOneFile(path.join(data_root_dir, 'String.wz', 'NPC.img.json'))
    const outputData = NPCDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_NPC.json'), outputData)
}

async function GearStats() {
    console.time('Running GearStats')
    let option = { target: 'Character.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Character.wz',), option)
    const outputData = GearStatsDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_GearStats.json'), outputData)
    console.timeEnd('Running GearStats')
}

async function MobStats() {
    console.time('Running MobStats')
    let option = { target: 'Mob.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Mob.wz',), option)
    const outputData = MobStatsDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_MobStats.json'), outputData)
    console.timeEnd('Running MobStats')
}

async function MapStats() {
    console.time('Running MapStats')
    let option = { target: 'Map.wz/Map' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Map.wz', 'Map'), option)
    const outputData = MapStatsDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_MapStats.json'), outputData)
    console.timeEnd('Running MapStats')
}

async function Map_MobCount() {
    console.time('Running Map_MobCount')
    let option = { target: 'Map.wz/Map' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Map.wz', 'Map'), option)
    const outputData = MapMobCountDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_MapMobCount.json'), outputData)
    console.timeEnd('Running Map_MobCount')
}

async function ItemStats() {
    console.time('Running ItemStats')
    let option = { target: 'Item.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Item.wz',), option)
    const outputData = ItemStatsDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_ItemStats.json'), outputData)
    console.timeEnd('Running ItemStats')
}

async function SkillStats() {
    console.time('Running SkillStats')
    let option = { target: 'Skill.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Skill.wz',), option)
    const outputData = SkillStatsDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_SkillStats.json'), outputData)
    console.timeEnd('Running SkillStats')
}

async function NPCStats() {
    console.time('Running NPCStats')
    let option = { target: 'Npc.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Npc.wz',), option)
    const outputData = NPCStatsDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_NPCStats.json'), outputData)
    console.timeEnd('Running NPCStats')
}

async function Quest() {
    console.time('Running Quest')
    let option = { target: 'Quest.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Quest.wz',), option)
    const outputData = QuestDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_Quest.json'), outputData)
    console.timeEnd('Running Quest')
}

async function WorldMap() {
    console.time('Running WorldMap') // add Location to data_NPC.json and data_MapStats.json
    let option = { target: 'Map.wz/WorldMap' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Map.wz', 'WorldMap'), option)
    const outputData = WorldMapDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_WorldMap.json'), outputData)
    console.timeEnd('Running WorldMap')
}

async function RenderMobOrigin() {
    console.time('Running RenderMobOrigin')
    let option = { target: 'Mob.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Mob.wz'), option)
    const outputData = RenderMobOriginDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_RenderMobOrigin.json'), outputData)
    console.timeEnd('Running RenderMobOrigin')
}

async function RenderNpcOrigin() {
    console.time('Running RenderNpcOrigin')
    let option = { target: 'Npc.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Npc.wz'), option)
    const outputData = RenderNpcOriginDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_RenderNpcOrigin.json'), outputData)
    console.timeEnd('Running RenderNpcOrigin')
}

async function RenderObjOrigin() {
    console.time('Running RenderObjOrigin')
    let option = { target: 'Map.wz/Obj' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Map.wz', 'Obj'), option)
    const outputData = RenderObjOriginDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_RenderObjOrigin.json'), outputData)
    console.timeEnd('Running RenderObjOrigin')
}

async function RenderTileOrigin() {
    console.time('Running RenderTileOrigin')
    let option = { target: 'Map.wz/Tile' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Map.wz', 'Tile'), option)
    const outputData = RenderTileOriginDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_RenderTileOrigin.json'), outputData)
    console.timeEnd('Running RenderTileOrigin')
}

async function RenderPortalOrigin() {
    console.time('Running RenderPortalOrigin')
    const inputDataArr = await readOneFile(path.join(data_root_dir, 'Map.wz', 'MapHelper.img.json'))
    const outputData = RenderPortalOriginDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_RenderPortalOrigin.json'), outputData)
    console.timeEnd('Running RenderPortalOrigin')
}

async function RenderReactorOrigin() {
    console.time('Running RenderReactorOrigin')
    let option = { target: 'Reactor.wz' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Reactor.wz'), option)
    const outputData = RenderReactorOriginDataFormatting(inputDataArr)
    await diskWriterInJSON(path.join(out_dir, 'data_RenderReactorOrigin.json'), outputData)
    console.timeEnd('Running RenderReactorOrigin')
}

async function QuestLine() {
    console.time('Running QuestLines')
    const inputData = await readOneFile(path.join(out_dir, 'data_Quest.json'))
    const outputData = QuestLineDataFormatting(inputData)
    await diskWriterInJSON(path.join(out_dir, 'data_Questline.json'), outputData)
    console.timeEnd('Running QuestLines')
}

async function NPCLocation() {
    console.time('Running NPCLocation') // add Location to data_NPC.json and data_MapStats.json
    let option = { target: 'Map.wz/Map' }
    const inputDataArr = await readFolderRecursively(path.join(data_root_dir, 'Map.wz', 'Map'), option)
    const inputData1 = await readOneFile(path.join(out_dir, 'data_NPC.json'))
    const inputData2 = await readOneFile(path.join(out_dir, 'data_MapStats.json'))

    const outputData1 = NPCLocationFormatting(inputDataArr, inputData1)
    const outputData2 = NPCLocationFormatting2(inputDataArr, inputData2)

    await diskWriterInJSON(path.join(out_dir, 'data_NPC.json'), outputData1)
    await diskWriterInJSON(path.join(out_dir, 'data_MapStats.json'), outputData2)
    console.timeEnd('Running NPCLocation')
}


async function main() {
    console.time('Total Time')

    // --- Read JSON from String.wz
    await MB_Drops()
    await MB_Maps()
    await Mob()
    await Consume()
    await Ins()
    await Etc()
    await Eqp()
    await Map()
    await Skill()
    await NPC()

    // --- Read multiple JSON files in multiple folders 
    await GearStats()            // from Character.wz
    await MobStats()             // from Mob.wz
    await ItemStats()            // from Item.wz
    await MapStats()             // from Map.wz
    await Map_MobCount()         // from Map.wz
    await SkillStats()           // from Skill.wz
    await NPCStats()             // from Npc.wz
    await Quest()                // from Quest.wz
    await WorldMap()             // from Map.wz
    await RenderMobOrigin()      // from Mob.wz
    await RenderNpcOrigin()      // from Npc.wz
    await RenderObjOrigin()      // from Map.wz
    await RenderTileOrigin()     // from Map.wz
    await RenderPortalOrigin()   // from Map.wz
    await RenderReactorOrigin()  // from Reactor.wz

    // --- Use existing JSON
    await QuestLine()            // use data_Quest.json
    await NPCLocation()          // update data_NPC.json & data_MapStats.json

    console.timeEnd('Total Time')   // benchmark 25.1 sec to finish all
}

main()