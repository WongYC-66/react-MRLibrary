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
import { equipIdToImgUrl, equipIdToCategory } from "./utility.jsx"
import data_mob from "../../../data/data_Mob.json"
import data_MB from "../../../data/data_MB.json"
import data_Eqp from "../../../data/data_Eqp.json"
import data_GearStats from "../../../data/data_GearStats.json"

export default function EquipDetail() {

    const [equipInfo, setEquipInfo] = useState({})
    let { equipId } = useParams();

    console.log(equipInfo)

    useEffect(() => {
        const equip_Id = equipId.split("=")[1]
        const name = data_Eqp[equip_Id]
        const obj = {
            ...data_GearStats[equip_Id],
            id: equip_Id,
            name,
            imgUrl: equipIdToImgUrl({ id: equip_Id, name }),
            category: equipIdToCategory(equip_Id)
        }
        const droppedBy = []

        Object.entries(data_MB).forEach(([mobId, drops]) => {
            if (drops.includes(equip_Id)) {
                droppedBy.push({
                    id: mobId,
                    name: data_mob[mobId]
                })
            }
        })
        obj.droppedBy = droppedBy
        setEquipInfo(obj)
    }, [])

    const numFormatter = num => Number(num).toLocaleString("en-US")

    return (<p>im a equipdetail</p>)

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
                                            <Image src={itemInfo.imgUrl} fluid className="mw-50" />
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

const dropsOverlayWrapper = ({ id, name, desc }) => {
    const isEquip = !desc // equip dont have description
    const para = isEquip ? "equip" : "item"
    const renderTooltip = (props) => (
        <Tooltip id={`tooltip-${id}`} {...props}>
            {name}
        </Tooltip>
    );
    return (
        <OverlayTrigger
            key={id}
            placement="top"
            overlay={renderTooltip}
        >
            <Image src={equipIdToImgUrl(para, { id, name })} alt="img not found" className="me-1" />
        </OverlayTrigger>
    )
}
