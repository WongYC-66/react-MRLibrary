import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from "react-bootstrap/Table"
import Tabs from "react-bootstrap/Tabs"
import Tab from "react-bootstrap/Tab"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
// 
import {
    generateMobInfo,
    decodeElemAttr,
    renderImageWithItemIdType,
    renderImageWithMobId,
    sortDropsToFourArr,
    itemIdToNavUrl,
} from "./utility.jsx"

import { convertMapIdToUrl, convertMapIdToName } from '../map/utility.jsx'

export default function MonsterDetail() {

    const [mobInfo, setMobInfo] = useState({})
    let { mobId } = useParams();

    useEffect(() => {
        let targetMobId = Number(mobId.split("=")[1])
        const generated = generateMobInfo(targetMobId)
        setMobInfo(generated)
    }, [])

    const numFormatter = num => Number(num).toLocaleString("en-US")

    // console.log(mobInfo)

    return (
        <div className="monster-detail">
            <Container>
                <Row>
                    {/* Mob Image, hp, mp, etc ... */}
                    <Col lg={4}>
                        <div className="mob-stats-card text-center">
                            <Table bordered hover>
                                <tbody>
                                    <tr>
                                        <th colSpan={2} className="rounded-5">{mobInfo.name}</th>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="bg-transparent">
                                            {renderImageWithMobId(mobInfo.id)}
                                            <p className="text-danger fw-bold">{mobInfo?.boss ? "BOSS" : ""}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>Level : {mobInfo.level}</td>
                                    </tr>
                                    <tr>
                                        <td>EXP : {numFormatter(parseInt(mobInfo.exp * 3.2))}</td>
                                        <td>Meso : no info</td>
                                    </tr>
                                    <tr>
                                        <td>HP : {numFormatter(mobInfo.maxHP)}</td>
                                        <td>MP : {numFormatter(mobInfo.maxMP)}</td>
                                    </tr>
                                    <tr>
                                        <td>W. Attack : {numFormatter(mobInfo.PADamage)}</td>
                                        <td>M. Attack : {numFormatter(mobInfo.MADamage)}</td>
                                    </tr>
                                    <tr>
                                        <td>W. Defense : {numFormatter(mobInfo.PDDamage)}</td>
                                        <td>M. Defense : {numFormatter(mobInfo.MDDamage)}</td>
                                    </tr>
                                    <tr>
                                        <td>Accuracy :  {numFormatter(mobInfo.acc)}</td>
                                        <td>Avoidability : {numFormatter(mobInfo.eva)}</td>
                                    </tr>
                                    <tr>
                                        <td>HP Regen : {numFormatter(mobInfo?.hpRecovery || 0)}</td>
                                        <td>MP Regen : {numFormatter(mobInfo?.mpRecovery || 0)}</td>
                                    </tr>
                                    <tr>
                                        <td>Speed : {numFormatter(mobInfo.speed)}</td>
                                        <td>Knockback : {numFormatter(mobInfo.pushed)}</td>
                                    </tr>
                                    <tr>
                                        <td>Elements</td>
                                        <td>
                                            {/* undead */}
                                            {mobInfo?.undead === '1' && <p className="m-0 text-start"> Take "Heal" damage </p>}

                                            {/* elemental relationship */}
                                            {decodeElemAttr(mobInfo.elemAttr).map((x, i) => <p key={i} className="m-0  text-start">{x}</p>)}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                        </div>

                    </Col>
                    {/* Monster Drop / Map Spawn */}
                    <Col lg={8}>
                        <div className="mob-drops-locations-card">
                            <Tabs
                                id="controlled-tab-example"
                                className="mb-3"
                            >
                                <Tab eventKey="Drops" title="Drops">
                                    {renderSortedDrops(sortDropsToFourArr(mobInfo.drops))}
                                </Tab>
                                <Tab eventKey="Locations" title="Locations">
                                    {renderTableOfMap(mobInfo.spawnMap)}
                                </Tab>
                            </Tabs>

                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    )
}

const renderTableOfMap = (mapArr) => {

    const [hasAlerted, setHasAlerted] = useState(false)

    const sortedMapArr = mapArr && mapArr.slice().sort((a, b) => {
        if (b[2] !== a[2]) return b[2] - a[2] // descendingly sorted in Count
        // if a[1] or b[1] is empty obj
        if (a[1] === undefined) return 1
        if (b[1] === undefined) return 0

        return b[1].streetName > a[1].streetName ? 1 : -1 // descendingly sorted in alphabet order if same count
    })

    const handleMapLinkClick = (hasHiddenStreetUrl) => {
        if (hasHiddenStreetUrl) return
        if (hasAlerted) return
        setHasAlerted(true)
        alert('You are being redirected to mapleLegends library. Come back later. Be aware that both site look similar but different mob drops.')
    }

    return (
        <Table bordered hover className="text-center">
            <tbody >
                <tr>
                    <th className="bg-transparent">Map</th>
                    <th className="bg-transparent">Count</th>
                </tr>
                {sortedMapArr && sortedMapArr.map((map, i) => <MapRowCard key={i} map={map} handleMapLinkClick={handleMapLinkClick} />)}
            </tbody>
        </Table>
    )
}

const MapRowCard = ({ map, handleMapLinkClick }) => {
    //  {mapCategory: __ , mapName: __, streetName: ___}
    const [mapId, mapObj, mobCount] = [...map]
    const { streetName } = { ...mapObj }

    return (
        <tr key={mapId}>
            <td className="bg-transparent">
                {streetName
                    ? <Link to={convertMapIdToUrl(mapId)}>
                        {convertMapIdToName(mapId)}
                    </Link>
                    : <p>`map info missing. map_id : ${mapId}`</p>
                }
            </td>
            <td className="bg-transparent">{mobCount}</td>
        </tr>
    )
}

const renderSortedDrops = ({ EquipDrops, UseDrops, SetupDrops, EtcDrops, result }) => {
    if (result === "fail") return

    return (
        <>
            <h6>Equip</h6>
            <div>
                {EquipDrops.map(x => dropsOverlayWrapper(x))}
            </div>
            <h6>Use</h6>
            <div>
                {UseDrops.map(x => dropsOverlayWrapper(x))}
            </div>
            <h6>Setup</h6>
            <div>
                {SetupDrops.map(x => dropsOverlayWrapper(x))}
            </div>
            <h6>Etc</h6>
            <div>
                {EtcDrops.map(x => dropsOverlayWrapper(x))}
            </div>
        </>
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
            <Link to={itemIdToNavUrl(id)}>
                {renderImageWithItemIdType(id, name, para)}
            </Link>
        </OverlayTrigger>
    )
}

