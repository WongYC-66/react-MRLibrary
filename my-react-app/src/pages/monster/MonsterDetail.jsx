import { useParams, Link } from "react-router-dom"
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
import Badge from 'react-bootstrap/Badge';
// 
import {
    decodeElemAttr,
    renderImageWithItemIdType,
    renderImageWithMobId,
    sortDropsToFourArr,
    itemIdToNavUrl,
} from "./utility.jsx"
import data_mob from "../../../data/data_Mob.json"
import data_mobStats from "../../../data/data_MobStats.json"
import data_MB from "../../../data/data_MB.json"
import data_MapMobCount from "../../../data/data_MapMobCount.json"
import data_Mob_MapOnly from "../../../data/data_Mob_MapOnly.json"
import data_Map from "../../../data/data_Map.json"
import data_MapUrl from "../../../data/data_MapUrl.json"

export default function MonsterDetail() {

    const [mobInfo, setMobInfo] = useState({})
    let { mobId } = useParams();

    // console.log(mobInfo)

    useEffect(() => {
        const mob_Id = mobId.split("=")[1]
        const obj = {
            ...data_mobStats[mob_Id],
            id: mob_Id,
            name: data_mob[mob_Id],
            drops: data_MB[mob_Id],
        }
        const spawnMaps = []
        // data from inside data_MapMobCount (map.wz)
        let seen_mapId = new Set()
        Object.entries(data_MapMobCount).forEach(([mapId, mobId_to_count_obj]) => {
            Object.entries(mobId_to_count_obj).forEach(([MobId, count]) => {
                if (Number(MobId) === Number(mob_Id)) {
                    const mapNameObj = data_Map[mapId]
                    spawnMaps.push([mapId, mapNameObj, count])
                    seen_mapId.add(mapId)
                }
            })
        })
        // there is a problem, boss-type mob not inside data_MapMobCount
        // combine data from monsterbook together then (string.wz)
        // might have bugs for LKC mobs
        let monsterBookLocationArr = data_Mob_MapOnly[mob_Id]
        if (monsterBookLocationArr) {
            monsterBookLocationArr.forEach(mapId => {
                if (seen_mapId.has(mapId)) return
                const mapNameObj = data_Map[mapId]
                spawnMaps.push([mapId, mapNameObj, 1])
                seen_mapId.add(mapId)
            })
        }
        // 
        obj.spawnMap = spawnMaps

        setMobInfo(obj)
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
        if(hasHiddenStreetUrl) return 
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
    const { streetName , mapName } = {...mapObj}
    // hasHiddenStreetUrl
    const hasUrl = data_MapUrl[mapId] && data_MapUrl[mapId][1]
    const mapUrl = hasUrl ? data_MapUrl[mapId][0] : `https://maplelegends.com/lib/map?id=${mapId}`

    return (
        <tr key={mapId}>
            <td className="bg-transparent">
                <a href={mapUrl} target="_blank" onClick={() => handleMapLinkClick(hasUrl)}>
                    {streetName ?
                        <>
                            {/* Map Name */}
                            <span dangerouslySetInnerHTML={{ __html: `${streetName + ":" + mapName}` }}></span>
                            {/* Badge of legends or hidden street */}
                            <Badge bg={`${hasUrl ? 'success' : 'danger'}`} className="mx-3">{hasUrl ? "hidden-street" : "legends"}</Badge>
                        </>
                        : `map info missing. map_id : ${mapId}`
                    }

                </a>
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
                {/* <Image src={itemIdToImgUrl(para, { id, name })} alt="img not found" className="me-1" /> */}
            </Link>
        </OverlayTrigger>
    )
}

