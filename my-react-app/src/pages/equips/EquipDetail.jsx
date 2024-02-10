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
import { equipIdToImgUrl, equipIdToCategory, decodeReqJobToList, attkSpeedToText, rangeCalculator } from "./utility.jsx"
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
            category: equipIdToCategory(equip_Id),
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
    const jobList = decodeReqJobToList(equipInfo.reqJob) || []

    return (
        <div className="equip-detail">
            <Container>
                <Row>
                    {/* Item Image, name, desc, etc ... */}
                    <Col lg={4}>
                        <div className="item-stats-card text-center">
                            <Table size="lg">
                                <tbody>
                                    <tr>
                                        <th className="rounded-5" colSpan={6}>
                                            {equipInfo.name}
                                            {equipInfo.tradeBlock === '1' && <p className="p-0 m-0 text-warning">(Untradeable)</p>}
                                            {equipInfo.only === '1' && <span className="p-0 m-0 text-warning">(One-of-a-kind-item)</span>}
                                        </th>
                                    </tr>
                                    <tr>
                                        <td className="bg-transparent align-middle" colSpan={3}>
                                            <Image src={equipInfo.imgUrl} fluid className="w-50" />
                                        </td>
                                        <td className="rounded-4" colSpan={3}>
                                            <p className="p-0 m-0">Req LVL : {equipInfo.reqLevel || "no-info"}</p>
                                            <p className="p-0 m-0">Req STR : {equipInfo.reqSTR || "no-info"}</p>
                                            <p className="p-0 m-0">Req DEX : {equipInfo.reqDEX || "no-info"}</p>
                                            <p className="p-0 m-0">Req INT : {equipInfo.reqINT || "no-info"}</p>
                                            <p className="p-0 m-0">Req LUK : {equipInfo.reqLUK || "no-info"}</p>
                                            <p className="p-0 m-0">Req FAME : {equipInfo.reqPOP || "0"}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className={`rounded-4 ${jobList.includes(-1) && "text-warning"}`}>Beginner</td>
                                        <td className={`rounded-4 ${jobList.includes(1) && "text-warning"}`}>Warrior</td>
                                        <td className={`rounded-4 ${jobList.includes(2) && "text-warning"}`}>Magician</td>
                                        <td className={`rounded-4 ${jobList.includes(4) && "text-warning"}`}>Bowman</td>
                                        <td className={`rounded-4 ${jobList.includes(8) && "text-warning"}`}>Thief</td>
                                        <td className={`rounded-4 ${jobList.includes(16) && "text-warning"}`}>Pirate</td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6} className="text-start">
                                            <p className="my-1">Category: {equipInfo.category && equipInfo.category[2]}</p>
                                            {equipInfo.attackSpeed &&  <p>Attack Speed : {`${attkSpeedToText(equipInfo.attackSpeed)} (${equipInfo.attackSpeed})`}</p>}
                                            {equipInfo.incSTR && <p className="my-1">STR: {equipInfo.incSTR} ({rangeCalculator(equipInfo.incSTR)})</p>}
                                            {equipInfo.incDEX && <p className="my-1">DEX: {equipInfo.incDEX} ({rangeCalculator(equipInfo.incDEX)})</p>}
                                            {equipInfo.incINT && <p className="my-1">INT: {equipInfo.incINT} ({rangeCalculator(equipInfo.incINT)})</p>}
                                            {equipInfo.incLUK && <p className="my-1">LUK: {equipInfo.incLUK} ({rangeCalculator(equipInfo.incLUK)})</p>}
                                            
                                            {equipInfo.incMHP && <p className="my-1">HP: {equipInfo.incMHP} ({rangeCalculator(equipInfo.incMHP, 10)})</p>}
                                            {equipInfo.incMMP && <p className="my-1">MP: {equipInfo.incMMP} ({rangeCalculator(equipInfo.incMMP, 10)})</p>}
                                            {equipInfo.incPDD && <p className="my-1">Weapon Def: {equipInfo.incPDD} ({rangeCalculator(equipInfo.incPDD, 10)})</p>}
                                            {equipInfo.incMDD && <p className="my-1">Magic Def: {equipInfo.incMDD} ({rangeCalculator(equipInfo.incMDD, 10)})</p>}
                                            {equipInfo.incACC && <p className="my-1">Accuracy: {equipInfo.incACC} ({rangeCalculator(equipInfo.incACC)})</p>}
                                            {equipInfo.incEVA && <p className="my-1">Avoidability: {equipInfo.incEVA} ({rangeCalculator(equipInfo.incEVA)})</p>}
                                            
                                            {equipInfo.incSpeed && <p className="my-1">Speed: {equipInfo.incSpeed} ({rangeCalculator(equipInfo.incSpeed)})</p>}
                                            {equipInfo.incJump && <p className="my-1">Jump: {equipInfo.incJump} ({rangeCalculator(equipInfo.incJump)})</p>}


                                            {equipInfo.incPAD && <p>Weapon Attack : {equipInfo.incPAD} ({rangeCalculator(equipInfo.incPAD)})</p>}
                                            {equipInfo.incMAD && <p>Magic Attack : {equipInfo.incMAD} ({rangeCalculator(equipInfo.incMAD)})</p>}
                                            <p>Number of Upgrades Available: {equipInfo.tuc || 0}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={6}>Sell Price : {numFormatter(equipInfo.price)}</td>
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
                                    {equipInfo?.droppedBy?.length >= 1 ? <span>Dropped by </span> : <span>Dropped by nothing.</span>}
                                    <p></p>
                                    {equipInfo?.droppedBy?.map(({ id, name }, i) => {
                                        return (
                                            <span key={id}>
                                                <Link to={`/monster/id=${id}`}>{name}</Link>
                                                {(i !== equipInfo.droppedBy.length - 1) && " , "}
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
