import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from "react-bootstrap/Table"
import Tabs from "react-bootstrap/Tabs"
import Tab from "react-bootstrap/Tab"
// 
import { renderImageWithItemId } from "./utility.jsx"
import { gachaLocationMapping } from './Gacha.jsx'
import data_mob from "../../../data/data_Mob.json"
import data_MB_Drops from "../../../data/data_MB_Drops.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_ItemStats from "../../../data/data_ItemStats.json"
import data_Gacha from "../../../data/data_Gacha.json"
import data_Crafting from "../../../data/data_Crafting.json"
import data_Quest from "../../../data/data_Quest.json"
// 
import { renderNPC } from "../tools/Questline.jsx";

export default function ItemDetail() {

    const [itemInfo, setItemInfo] = useState({})
    let { itemId } = useParams();

    const item_Id = itemId.split("=")[1]

    useEffect(() => {
        const data = data_Consume[item_Id] || data_Ins[item_Id] || data_Etc[item_Id]
        const obj = {
            ...data_ItemStats[item_Id],
            id: item_Id,
            name: data.name,
            desc: data?.desc,
        }
        const droppedBy = []
        Object.entries(data_MB_Drops).forEach(([mobId, drops]) => {
            if (drops.includes(Number(item_Id))) {
                droppedBy.push({
                    id: mobId,
                    name: data_mob[mobId]
                })
            }
        })
        obj.droppedBy = droppedBy

        // gachable info    add gacha:['ellinia', 'nlc']
        data_Gacha.forEach(({ itemId, location }) => {
            if (item_Id && itemId === item_Id) {
                if (!('gacha' in obj)) obj.gacha = []
                obj.gacha.push(gachaLocationMapping(location))
            }
        })
        // craftable info    add craft: { isCraftable : true, parentItemNames : ['chaos scroll', ...]}
        data_Crafting.forEach(({ itemId, itemName, materialId, }) => {
            if (item_Id && itemId === item_Id) {
                if (!('craft' in obj)) obj.craft = { isCraftable: false, isMaterial: [] }
                obj.craft.isCraftable = true
            }
            if (item_Id && materialId === item_Id) {
                if (!('craft' in obj)) obj.craft = { isCraftable: false, isMaterial: [] }
                obj.craft.isMaterial.push(itemName)
            }
        })
        // Quests info, add questId to count: [['1003',[['0', 5],['1',10]]], ]         // [questId, [[seq, count]]]
        obj.quests = []
        Object.entries(data_Quest).forEach(([questId, questObj]) => {
            const { Check } = questObj;
            const noToCountArr = []     // within 1 Quest, has multiple sequence of needing same item ?
            for (let no in Check) {
                const items = Check?.[no]?.item
                if (!items) continue
                // console.log({ questId, no, items })
                for (let seq in items) {
                    const { id, count } = items[seq]
                    if (id != item_Id) continue
                    noToCountArr.push([seq, count])
                }
            }
            if (noToCountArr.length) obj.quests.push([questId, noToCountArr])
        })

        setItemInfo(obj)
    }, [])

    const combinedCheck = { ...data_Consume, ...data_Ins, ...data_Etc, }
    if (!combinedCheck[item_Id]) throw new Error("No such item id")
    // console.log(itemInfo)

    const numFormatter = num => Number(num).toLocaleString("en-US")

    return (
        <div className="item-detail">
            <Container>
                <Row>
                    {/* Item Image, name, desc, etc ... */}
                    <Col lg={4}>
                        <div className="item-stats-card text-center">
                            <Table size="lg">
                                <tbody>
                                    <tr>
                                        <th className="rounded-5">
                                            {itemInfo.name}
                                            {itemInfo.tradeBlock === '1' && <p className="p-0 m-0 text-warning">(Untradeable)</p>}
                                        </th>
                                    </tr>
                                    <tr>
                                        <td className="bg-transparent">
                                            {renderImageWithItemId(itemInfo.id, itemInfo.name)}
                                            {/* <Image src={itemInfo.imgUrl} fluid className="mw-50" /> */}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            {itemInfo.desc?.split("\\n").map((str, i) => {
                                                str = str.replace(/\#c(.*)#/, `<span class='text-warning fw-bolder'>$1</span>`)
                                                return < p key={i} className="p-0 m-0" dangerouslySetInnerHTML={{ __html: str }
                                                }></p>
                                            })}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Sell Price : {numFormatter(itemInfo.price)}</td>
                                    </tr>
                                </tbody>
                            </Table>

                        </div>

                    </Col>
                    {/* Item Dropped Tab/ Stats Tab/ Gacha Tab */}
                    <Col lg={8}>
                        <div className="item-dropped-by-card">
                            <Tabs id="controlled-tab-example" className="mb-3">
                                {/* Drops Tab */}
                                <Tab eventKey="Drops" title="Drops">
                                    {renderDroppedByMob(itemInfo)}
                                </Tab>

                                {/* Stats Tab */}
                                <Tab eventKey="Stats" title="Stats">
                                    {renderItemStats(itemInfo)}
                                </Tab>

                                {/* Gacha Tab only shows if have info from data_Gacha.json*/}
                                {itemInfo.gacha &&
                                    <Tab eventKey="Gacha" title="Gacha">
                                        <h5>Gacha Location :</h5>
                                        <ul>
                                            {itemInfo.gacha.map(mapName => <li key={mapName}>{mapName}</li>)}
                                        </ul>
                                    </Tab>
                                }

                                {/* Craft Tab only shows if have info from data_Crafting.json*/}
                                {itemInfo.craft &&
                                    <Tab eventKey="Craft" title="Craft">
                                        <ul>
                                            {itemInfo.craft.isCraftable && <li><p>Can be crafted</p></li>}
                                            {Boolean(itemInfo.craft.isMaterial.length) &&
                                                <li>
                                                    <p>As material for : </p>
                                                    <ol>
                                                        {itemInfo.craft.isMaterial.map(parentItemName => <li key={parentItemName} className="my-1">
                                                            {parentItemName}
                                                        </li>)}
                                                    </ol>
                                                </li>}
                                        </ul>
                                        <Link to={itemNameToCraftLink(itemInfo.name)} className="m-3">Click to see more</Link>
                                    </Tab>
                                }

                                {/* Quest Tab, showing which quest using this item*/}
                                <Tab eventKey="Quests" title="Quests">
                                    {renderRelatedQuests(itemInfo)}
                                </Tab>
                            </Tabs>

                        </div>
                    </Col>
                </Row>
            </Container>
        </div >

    )
}

const renderDroppedByMob = (itemInfo) => {
    return (
        <>
            {itemInfo?.droppedBy?.length >= 1 ? <span>Dropped by </span> : <span>Dropped by nothing.</span>}
            <p></p>
            {
                itemInfo?.droppedBy?.map(({ id, name }, i) => {
                    return (
                        <span key={id}>
                            <Link to={`/monster/id=${id}`}>{name}</Link>
                            {(i !== itemInfo.droppedBy.length - 1) && " , "}
                        </span>
                    )
                })
            }
        </>
    )
}

const renderItemStats = (itemInfo) => {
    let unwanted = new Set(["id", "name", "desc", "droppedBy", "gacha", "craft"])
    let keys = Object.keys(itemInfo)
        .filter(k => !unwanted.has(k))
        .sort()
    return (
        <Table bordered hover className="text-center">
            <tbody>
                <tr>
                    <td>Name </td>
                    <td dangerouslySetInnerHTML={{ __html: itemInfo.name }}></td>
                </tr>
                <tr>
                    <td>item id </td>
                    <td>{itemInfo.id} </td>
                </tr>
                {keys.map(k =>
                    <tr key={k}>
                        <td>{k}</td>
                        <td>{itemInfo[k]}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}

const itemNameToCraftLink = (name) => {
    return `../../craft-table?page=1&search=${name.replaceAll(" ", "%20")}`
}


const renderRelatedQuests = (itemInfo) => {
    const quests = itemInfo.quests;
    return (
        <Table bordered hover className="text-center">
            <tbody>
                <tr>
                    <td>NPC</td>
                    <td>Quest</td>
                    <td>Quantity</td>
                </tr>
                {quests && quests.map(renderQuestTableRow)}
            </tbody>
        </Table>
    )
}

const renderQuestTableRow = ([questId, seqNCountArr]) => {
    const quest = data_Quest[questId];
    return (
        <tr key={questId}>
            <td>{renderNPC(quest.Check[0]?.npc || '')}</td>
            <td>
                <Link to={`../../quest/id=${questId}`}>
                    {quest?.QuestInfo?.name ?? "quest-name-n/a"}
                </Link>
            </td>
            <td>{seqNCountArr[0][1]}</td>
        </tr>
    )
}