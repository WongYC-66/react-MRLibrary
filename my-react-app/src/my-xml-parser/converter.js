import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// console.log(__dirname)

const OUTPUT_LOCATION = "./data/"
// var fs = require('node:fs');
import { diskWriter, parseXML, parseXMLinBulk } from './utility.js';
import { MBdataFormatting,
    MBdataFormatting_MapOnly,
    MobIdDataFormatting,
    ConsumeItemIdDataFormatting,
    EtcItemIdDataFormatting,
    EqpItemIdDataFormatting,
    InsItemIdDataFormatting,
    MapIdDataFormatting,
    GearStatsDataFormatting,
    MapMobCountDataFormatting,
    ItemStatsDataFormatting,
    MobStatsDataFormatting
} from './dataFormatting.js';

async function MB() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'MonsterBook.img.xml'))
    const simpleData = MBdataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_MB.json'), simpleData)
}

async function MB_MapOnly() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'MonsterBook.img.xml'))
    const simpleData = MBdataFormatting_MapOnly(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Mob_MapOnly.json'), simpleData)
}

async function Mob() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Mob.img.xml'))
    const simpleData = MobIdDataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Mob.json'), simpleData)
}

async function Consume() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Consume.img.xml'))
    const simpleData = ConsumeItemIdDataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Consume.json'), simpleData)
}

async function Etc() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Etc.img.xml'))
    const simpleData = EtcItemIdDataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Etc.json'), simpleData)
}

async function Eqp() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Eqp.img.xml'))
    const simpleData = EqpItemIdDataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Eqp.json'), simpleData)
}

async function Ins() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Ins.img.xml'))
    const simpleData = InsItemIdDataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Ins.json'), simpleData)
}

async function Maps() {
    const obj = await parseXML(path.join(__dirname, "../../data/", 'Map.img.xml'))
    const simpleData = MapIdDataFormatting(obj)
    diskWriter(path.join(__dirname, "../../data/", 'data_Map.json'), simpleData)
}

async function GearStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Character"), "Gear")
    const simpleData = GearStatsDataFormatting(objArr)
    diskWriter(path.join(__dirname, "../../data/", 'data_GearStats.json'), simpleData)
}

async function MobStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Mob"), "Mob")
    const simpleData = MobStatsDataFormatting(objArr)
    diskWriter(path.join(__dirname, "../../data/", 'data_MobStats.json'), simpleData)
}

async function Map_MobCount() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Map"), "Map")
    const simpleData = MapMobCountDataFormatting(objArr)
    diskWriter(path.join(__dirname, "../../data/", 'data_MapMobCount.json'), simpleData)
}

async function ItemStats() {
    const objArr = await parseXMLinBulk(path.join(__dirname, "../../data/Items"), "Items")
    const simpleData = ItemStatsDataFormatting(objArr)
    diskWriter(path.join(__dirname, "../../data/", 'data_ItemStats.json'), simpleData)
}

function main() {
    // MB()
    // MB_MapOnly()
    // Mob()
    // Consume()
    // Etc()
    // Eqp()
    // Ins()
    // Maps()
    GearStats() // Read multiple IMG files in multiple folders
    // MobStats()
    // Map_MobCount()
    // ItemStats()
}

main()