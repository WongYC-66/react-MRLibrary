import * as fs from 'fs';
import util from 'util'
import * as path from 'path';

// import * as parse from 'xml-parser';
import parse from 'xml-parser'
import { legacyTextCheck } from './dataFormatting.js'


export function diskWriter(path, simpleData) {
    try {
        fs.writeFileSync(path, JSON.stringify(simpleData));
        console.log("Writing" + path)

        // file written successfully
    } catch (err) {
        console.error(err);
    }
}

export async function parseXML(FilePath) {
    // console.log("Reading" + FilePath)
    // read and parsing xml file from e.g. MonsterBook.img.xml 
    var xml = fs.readFileSync(FilePath, 'utf8');
    var inspect = util.inspect;
    var obj = parse(xml);
    // console.log(inspect(obj, { colors: true, depth: Infinity }));
    return obj
}

export async function parseXMLinBulk(dirPath, option = "") {
    console.log("running parseXMLinBulk")
    console.log(dirPath)
    let filePathArr = []
    let subPaths = []
    if(option === "Gear"){
        subPaths = ["Accessory", "Cap", "Cape", "Coat", "Dragon", "Face", "Glove", "Hair", "Longcoat", "Pants", "PetEquip", "Ring", "Shield", "Shoes", "TamingMob", "Weapon"]
    }
    if(option === "Mob"){
        subPaths = []
    }
    // const subPaths = ["Weapon"] // debugging purpose only

    // get list of xml path from 
    console.log("loading files from /data")
    filePathArr.push(readFiles(dirPath)) // root directory of /data
    subPaths.forEach(subPath => {
        console.log(`loading files from /data/${subPath}`)
        filePathArr.push(readFiles(path.join(dirPath, subPath)))
    }) // from sub root e.g. /data/Accessory/, /data/weapon/, ...
    filePathArr = filePathArr.flat()
    //
    console.log("parsing all files from xml, taking long time, please wait...")
    const returnObjArr = Promise.all(filePathArr.flat().map(async filepath => parseXML(filepath)))
    return returnObjArr
}

export function parseItemJSON(x){
        let property1
        let property1Value 
        let property2
        let property2Value 

        // console.log(x)
        try{
            property1 = x.children[0].attributes.name
            property1Value = x.children[0].attributes.value
            property1Value = legacyTextCheck(property1Value)
        } catch {
            property1Value = ''
        }

        try{
            property2 = x.children[1].attributes.name
            property2Value = x.children[1].attributes.value
            property2Value = legacyTextCheck(property2Value)
        } catch {
            property2Value = ''
        }
        // console.log({property1, property1Value, property2, property2Value})
        let newObj = {}
        newObj[property1] = property1Value
        newObj[property2] = property2Value

        return newObj // {"name":"Red Potion","desc":"A potion made out of red herbs.\\nRecovers 50 HP."}
}

export function itemIdToCategory(id) {
    // info used from https://maplestory.io/api/GMS/64/item/category
    id = parseInt(id)
    let overallCategory = "Equip"
    let category = undefined
    let subCategory = undefined
    const isIDInRange = (min, max) => id >= min && id <= max

    const catogeryRangeList = {
        "Gun": { min: 1490000, max: 1500000, category: "Two-Handed Weapon" },
        "Knuckle": { min: 1480000, max: 1490000, category: "Two-Handed Weapon" },
        "Claw": { min: 1470000, max: 1480000, category: "Two-Handed Weapon" },
        "Dagger": { min: 1330000, max: 1340000, category: "One-Handed Weapon" },
        "Bow": { min: 1450000, max: 1460000, category: "Two-Handed Weapon" },
        "CrossBow": { min: 1460000, max: 1470000, category: "Two-Handed Weapon" },
        "Staff": { min: 1380000, max: 1390000, category: "One-Handed Weapon" },
        "Wand": { min: 1370000, max: 1380000, category: "One-Handed Weapon" },
        "One-Handed Sword": { min: 1300000, max: 1310000, category: "One-Handed Weapon" },
        "Two-Handed Sword": { min: 1400000, max: 1410000, category: "Two-Handed Weapon" },
        "One-Handed Blunt Weapon": { min: 1320000, max: 1330000, category: "One-Handed Weapon" },
        "Two-Handed Blunt Weapon": { min: 1420000, max: 1430000, category: "Two-Handed Weapon" },
        "One-Handed Axe": { min: 1310000, max: 1320000, category: "One-Handed Weapon" },
        "Two-Handed Axe": { min: 1410000, max: 1420000, category: "Two-Handed Weapon" },
        "Spear": { min: 1430000, max: 1440000, category: "Two-Handed Weapon" },
        "Pole Arm": { min: 1440000, max: 1450000, category: "Two-Handed Weapon" },

        "Hat": { min: 1000000, max: 1010000, category: "Armor" },
        "Face Accessory": { min: 1010000, max: 1020000, category: "Accessory" },
        "Eye Decoration": { min: 1020000, max: 1030000, category: "Accessory" },
        "Glove": { min: 1080000, max: 1090000, category: "Armor" },
        "Pendant": { min: 1120000, max: 1130000, category: "Accessory" },
        "Belt": { min: 1130000, max: 1140000, category: "Accessory" },
        "Medal": { min: 1140000, max: 1150000, category: "Accessory" },
        "Cape": { min: 1100000, max: 1110000, category: "Armor" },
        "Earrings": { min: 1030000, max: 1040000, category: "Accessory" },
        "Ring": { min: 1110000, max: 1120000, category: "Accessory" },
        "Shield": { min: 1090000, max: 1100000, category: "Armor" },
        "Overall": { min: 1050000, max: 1060000, category: "Armor" },
        "Top": { min: 1040000, max: 1050000, category: "Armor" },
        "Bottom": { min: 1060000, max: 1070000, category: "Armor" },
        "Shoes": { min: 1070000, max: 1080000, category: "Armor" },
        "Test Armor": { min: 1690100, max: 1690200, category: "Armor" },

        "Badge": { min: 1180000, max: 1190000, category: "Accessory" },
        "Emblem": { min: 1190000, max: 1190500, category: "Accessory" },
        "Pocket Item": { min: 1160000, max: 1170000, category: "Accessory" },
        "Power Source": { min: 1190200, max: 1190300, category: "Accessory" },
        "Shoulder Accessory": { min: 1150000, max: 1160000, category: "Accessory" },
        "Totem": { min: 1202000, max: 1202200, category: "Accessory" },
    }

    Object.entries(catogeryRangeList).forEach(x => {
        // console.log(x)
        if (isIDInRange(x[1].min, x[1].max)) {
            category = x[1].category
            subCategory = x[0]
            // console.log("found")
        }
    })


    // console.log(Object.entries(catogeryRangeList).length)
    return [overallCategory, category, subCategory]
}

function readFiles(dir) {
    // https://stackoverflow.com/questions/10049557/reading-all-files-in-a-directory-store-them-in-objects-and-send-the-object
    // read directory
    let returnArr = fs.readdirSync(dir)
    returnArr = returnArr.filter(x => {  // exclude folder directory 
        // console.log(x)
        const filepath = path.resolve(dir, x);
        const fileStat = fs.statSync(filepath)
        return fileStat.isFile()
    }).map(x => path.join(dir, x))
    // console.log(returnArr)
    return returnArr
}
// module.exports = {
//     diskWriter,
//     parseXML,
// };