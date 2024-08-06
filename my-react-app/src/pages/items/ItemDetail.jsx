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
import data_MB from "../../../data/data_MB.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_ItemStats from "../../../data/data_ItemStats.json"
import data_Gacha from "../../../data/data_Gacha.json"

export default function ItemDetail() {

    const [itemInfo, setItemInfo] = useState({})
    let { itemId } = useParams();

    // console.log(itemInfo)

    useEffect(() => {
        const item_Id = itemId.split("=")[1]
        const data = data_Consume[item_Id] || data_Ins[item_Id] || data_Etc[item_Id]
        const obj = {
            ...data_ItemStats[item_Id],
            id: item_Id,
            name: data.name,
            desc: data?.desc,
        }
        const droppedBy = []
        Object.entries(data_MB).forEach(([mobId, drops]) => {
            if (drops.includes(item_Id)) {
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

        setItemInfo(obj)
    }, [])

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
    let unwanted = new Set(["id", "name", "desc", "droppedBy"])
    let keys = Object.keys(itemInfo)
        .filter(k => !unwanted.has(k))
        .filter(k => k != 'gacha')
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
