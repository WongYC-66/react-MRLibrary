import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(__dirname)

const OUTPUT_LOCATION = "./data/"
// var fs = require('node:fs');
import { diskWriter, diskWriterInJSON, parseXML, parseXMLinBulk } from './utility.js';
import {
    MBdataFormatting,
    MBdataFormatting_MapOnly,
    MobIdDataFormatting,
    ConsumeItemIdDataFormatting,
    EtcItemIdDataFormatting,
    EqpItemIdDataFormatting,
    InsItemIdDataFormatting,
    MapIdDataFormatting,
    GearStatsDataFormatting,
    MapMobCountDataFormatting,
    MapStatsDataFormatting,
    ItemStatsDataFormatting,
    MobStatsDataFormatting,
    SkillDataFormatting,
    SkillStatsDataFormatting,
    QuestDataFormatting,
    QuestLineDataFormatting,
    NPCDataFormatting,
    NPCStatsDataFormatting,
    NPCLocationFormatting,
    NPCLocation2Formatting,
    WorldMapDataFormatting,
} from './dataFormatting.js';

async function MB() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'MonsterBook.img.xml'))
    const simpleData = MBdataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_MB.json'), simpleData)
}

async function MB_MapOnly() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'MonsterBook.img.xml'))
    const simpleData = MBdataFormatting_MapOnly(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Mob_MapOnly.json'), simpleData)
}

async function Mob() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Mob.img.xml'))
    const simpleData = MobIdDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Mob.json'), simpleData)
}

async function Consume() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Consume.img.xml'))
    const simpleData = ConsumeItemIdDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Consume.json'), simpleData)
}

async function Etc() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Etc.img.xml'))
    const simpleData = EtcItemIdDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Etc.json'), simpleData)
}

async function Eqp() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Eqp.img.xml'))
    const simpleData = EqpItemIdDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Eqp.json'), simpleData)
}

async function Ins() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Ins.img.xml'))
    const simpleData = InsItemIdDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Ins.json'), simpleData)
}

async function Maps() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Map.img.xml'))
    const simpleData = MapIdDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Map.json'), simpleData)
}

async function GearStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Character"), "Gear")
    const simpleData = GearStatsDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_GearStats.json'), simpleData)
}

async function MobStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Mob"), "Mob")
    const simpleData = MobStatsDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_MobStats.json'), simpleData)
}

async function Map_MobCount() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Map"), "Map")
    const simpleData = MapMobCountDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_MapMobCount.json'), simpleData)
}

async function Map_stats() {
    console.time()
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Map"), "Map")
    const simpleData = MapStatsDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_MapStats.json'), simpleData)
    console.timeEnd()
}

async function ItemStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Items"), "Items")
    const simpleData = ItemStatsDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_ItemStats.json'), simpleData)
}

async function Skill() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Skill.img.xml'))
    const simpleData = SkillDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Skill.json'), simpleData)
}

async function SkillStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Skill"), "Skill")
    const simpleData = SkillStatsDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_SkillStats.json'), simpleData)
}

async function Quest() {
    console.time()
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Quest"), "Quest")
    const simpleData = QuestDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Quest.json'), simpleData)
    console.timeEnd()
}

import data_Quest from '../../data/data_Quest.json' with {type: 'json'}
async function QuestLine() {
    console.time()
    const simpleData = QuestLineDataFormatting(data_Quest)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_Questline.json'), simpleData)
    console.timeEnd()
}

async function NPC() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'NPC.img.xml'))
    const simpleData = NPCDataFormatting(obj)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_NPC.json'), simpleData)
}

async function NPCStats() {
    console.time()
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/NPC"), "NPC")
    const simpleData = NPCStatsDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_NPCStats.json'), simpleData)
    console.timeEnd()
}

import data_NPC from '../../data/data_NPC.json' with {type: 'json'}
async function NPCLocation() {
    // update npc location to data_NPC.json
    console.time()
    const obj = await parseXML(path.join(__dirname, "../../data/", 'NpcLocation.img.xml'))
    const simpleData = NPCLocationFormatting(obj, data_NPC)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_NPC.json'), simpleData)
    console.timeEnd()
}

import data_MapStats from '../../data/data_MapStats.json' with {type: 'json'}
async function NPCLocation2() {
    // update npc location to data_MapStats.json
    console.time()
    const simpleData = NPCLocation2Formatting(data_NPC, data_MapStats)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_MapStats.json'), simpleData)
    console.timeEnd()
}

async function WorldMap() {
    console.time()
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Map/WorldMap"), "")
    const simpleData = WorldMapDataFormatting(objArr)
    diskWriterInJSON(path.join(__dirname, "../../data/", 'data_WorldMap.json'), simpleData)
    console.timeEnd()
}


async function main() {
    await MB()
    await MB_MapOnly()
    await Mob()
    await Consume()
    await Etc()
    await Eqp()
    await Ins()
    await Maps()
    await GearStats() // Read multiple IMG files in multiple folders
    await MobStats()
    await Map_MobCount()
    await Map_stats()
    await ItemStats()
    await Skill()
    await SkillStats()
    await Quest()
    await QuestLine()     // run Quest() first bcoz it use data_Quest.json
    await NPC()
    await NPCStats()
    await NPCLocation()  // run NPC() first bcoz it use data_NPC.json
    await NPCLocation2()  // run NPC() & Map_stats() first
    await WorldMap()  // run NPC() & Map_stats() first
}

main()