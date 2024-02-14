import { useParams, Link } from "react-router-dom"
import { LinkContainer } from 'react-router-bootstrap'
import { useState, useEffect } from "react"
// 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from "react-bootstrap/Table"
import Image from "react-bootstrap/Image"
import Tabs from "react-bootstrap/Tabs"
import Tab from "react-bootstrap/Tab"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
// 
import { itemIdToExceptionUrl, renderImageWithItemId } from "./utility.jsx"
import data_mob from "../../../data/data_Mob.json"
import data_MB from "../../../data/data_MB.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_ItemStats from "../../../data/data_ItemStats.json"

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
            // imgUrl: itemIdToExceptionUrl({ id: item_Id, name: data.name }),
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
        setItemInfo(obj)
    }, [])

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
                                            {itemInfo?.desc?.split("\\n").map(x =>
                                                <p key={x} className="p-0 m-0" dangerouslySetInnerHTML={{ __html: x }}></p>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Sell Price : {numFormatter(itemInfo.price)}</td>
                                    </tr>
                                </tbody>
                            </Table>

                        </div>

                    </Col>
                    {/* Item Dropped by */}
                    <Col lg={8}>
                        <div className="item-dropped-by-card">
                            <Tabs
                                id="controlled-tab-example"
                                className="mb-3"
                            >
                                <Tab eventKey="Drops" title="Drops">
                                    {itemInfo?.droppedBy?.length >= 1 ? <span>Dropped by </span> : <span>Dropped by nothing.</span>}
                                    <p></p>
                                    {itemInfo?.droppedBy?.map(({ id, name }, i) => {
                                        return (
                                            <span key={id}>
                                                <Link to={`/monster/id=${id}`}>{name}</Link>
                                                {(i !== itemInfo.droppedBy.length - 1) && " , "}
                                            </span>
                                        )
                                    })}

                                </Tab>
                            </Tabs>

                        </div>
                    </Col>
                </Row>
            </Container>
        </div >

    )
}

