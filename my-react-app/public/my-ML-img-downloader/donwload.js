import axios from 'axios';
import fs from "fs"
import cheerio from 'cheerio'
import { promises } from 'stream';

async function downloadImage(url, filename, index) {
    let downloadPass = true
    const response = await axios
        .get(url, { responseType: 'arraybuffer' })
        .catch((err) => {
            console.log(`fail to download ${url}`)
            throw Error("fail")
            downloadPass = false
        })

    if (!downloadPass) return

    fs.writeFile(filename, response.data, (err) => {
        if (err) console.log("fail to write", filename);
        console.log('Image downloaded successfully!', index);
    });
}

const startDownloadItems = async () => {
    // download Images from MR
    for (let i = startId; i <= endId; i) {
        try {
            await downloadImage(`https://maplelegends.com/static/images/lib/item/0${i}.png`, `./items/0${i}.png`, i)

            i++

        } catch (err) {
            i = Math.ceil((i + 1) / 1000) * 1000
        }
    }
}

const startDownloadMobs = async () => {
    // web scraping MapleRoyals
    let imgUrl = []
    for (let i = 1; i <= 131; i++) {
        console.log(`scraping page https://maplelegends.com/lib/monster?page=${i}&search=&filter=1&order=1&sort=1`)
        const { data } = await axios.get(`https://maplelegends.com/lib/monster?page=${i}&search=&filter=1&order=1&sort=1`)
        const $ = cheerio.load(data);
        const tenUrls = $('.img-responsive')
            .toArray()
            .map(x => x.attribs.data)
        imgUrl.push(tenUrls)
    }

    // done scraped link. now scrap images
    imgUrl = imgUrl.flat()
    for (let x of imgUrl) {
        const link = `https://maplelegends.com${x}`
        const filename = link.split("/").slice(-1)[0]
        const index = filename.split(".")[0]
        console.log(filename)
        try {
            await downloadImage(link, `./monsters/${filename}`, index)
        } catch (err) {
            //  do nothing
        }
    }

}

const startDownloadGears = async () => {
    // web scraping MapleRoyals
    let imgUrl = []

    const dict = [
        { name: 'weapon', endIndex: 99 },
        { name: 'hat', endIndex: 44 },
        { name: 'top', endIndex: 22 },
        { name: 'bottom', endIndex: 23 },
        { name: 'overall', endIndex: 24 },
        { name: 'shoes', endIndex: 28 },
        { name: 'gloves', endIndex: 20 },
        { name: 'cape', endIndex: 9 },
        { name: 'shield', endIndex: 5 },
        { name: 'faceacc', endIndex: 1 },
        { name: 'eyeacc', endIndex: 22 },
        { name: 'earring', endIndex: 6 },
        { name: 'ring', endIndex: 6 },
        { name: 'pendant', endIndex: 5 },
    ]
   
    for(let x of dict){
        console.log(x)
        for (let i = 1; i <= x.endIndex; i++) {
            let link = ""
            if(x.name === 'weapon'){
                link = `https://maplelegends.com/lib/weapon?page=${i}&search=&filter=1&sort=1&order=1`
            } else {
                link = `https://maplelegends.com/lib/${x.name}?page=${i}&search=&filter=1&order=1&sort=1`
            }
            console.log("scraping page ", link)
            const { data } = await axios.get(link)
            const $ = cheerio.load(data);
            const tenUrls = $('.img-responsive')
                .toArray()
                .map(x => x.attribs.data)
            imgUrl.push(tenUrls)
        }
    }

    // done scraped link. now scrap images
    imgUrl = imgUrl.flat()
    console.log(imgUrl)
    for (let x of imgUrl) {
        const link = `https://maplelegends.com${x}`
        const filename = link.split("/").slice(-1)[0]
        const index = filename.split(".")[0]
        console.log(filename)
        try {
            await downloadImage(link, `./characters/${filename}`, index)
        } catch (err) {
            //  do nothing
        }
    }

}

// User-below:
let startId = 100000
let endId = 9999999



// startDownloadItems()
// startDownloadMobs()
startDownloadGears()

