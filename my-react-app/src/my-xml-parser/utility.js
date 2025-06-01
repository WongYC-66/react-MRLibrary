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

export function diskWriterInJSON(path, simpleData) {
    console.log("Writing" + path)
    let jsonData = JSON.stringify(simpleData, null, 2);
    fs.writeFile(path, jsonData, (err) => {
        if (err) {
            console.error(`Error writing to file : ${path}`, err);
        } else {
            console.log("Write succesfully into" + path)
        }
    });
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
    if(option === "Map"){
        subPaths = ["Map0", "Map1", "Map2", "Map3", "Map5", "Map6", "Map7", "Map8", "Map9"]
        // subPaths = ["Map0"]
    }
    if(option === "Items"){
        subPaths = ["Consume", "Install", "Etc"]
    }
    if(option === "Skill"){
        // Skill folder doesnt have subfolder
        subPaths = []
    }
    if(option === "Quest"){
        // Quest folder doesnt have subfolder
        subPaths = []
    }
    if(option === "NPC"){
        // NPC folder doesnt have subfolder
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
    // console.log(filePathArr)
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