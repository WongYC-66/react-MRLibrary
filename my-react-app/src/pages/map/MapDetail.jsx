import { useParams, Link } from "react-router-dom"
import { decode } from 'html-entities'
// 
import Accordion from 'react-bootstrap/Accordion';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from "react-bootstrap/Table"
import Tabs from "react-bootstrap/Tabs"
import Tab from "react-bootstrap/Tab"
// 
import LabelledMap from "./LabelledMap.jsx";
// 
import { renderImageWithMapId, renderHDImageWithMapId, convertMapIdToUrl, convertMapIdToName, parseBgmToName } from "./utility.jsx"

import { renderImageWithMobId } from "../monster/utility.jsx"
import { renderImageWithNPCId, convertNpcIdToName } from "../npc/utility.jsx"
import { generateNPCLink, convertMobIdToUrl, convertMobIdToName } from "../quest/utility.jsx"

import data_Map from "../../../data/data_Map.json"
import data_MapUrl from "../../../data/data_MapUrl.json"
import data_MapStats from "../../../data/data_MapStats.json"
import data_MapMobCount from "../../../data/data_MapMobCount.json"

export default function MapDetail() {

    // const [questInfo, setQuestInfo] = useState({})
    let { mapId } = useParams();

    const map_id = mapId.split("=")[1]

    const hashMapId = Number(map_id)

    const mapInfo = {
        mapId: map_id,
        mob: data_MapMobCount[hashMapId],
        ...data_Map[hashMapId],
        ...data_MapStats[hashMapId],
    }

    // console.log(map_id)
    // console.log(mapInfo)

    return (
        <div className="map-detail" key={map_id}>
            <Container>
                <Row>
                    {/* Image Image, map name, streetname, audio, etc ... */}
                    <Col lg={4}>
                        <div className="text-center">
                            <Table bordered hover>
                                {renderTableLeft(mapInfo)}
                            </Table>

                        </div>

                    </Col>
                    {/* Map Stats, monster spawn, npc, portals */}
                    <Col lg={8}>
                        <div>
                            {renderTableRight(mapInfo)}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    )
}

const renderTableLeft = (mapInfo) => {
    if (!Object.keys(mapInfo).length) return <></>

    return <tbody>
        {/* Street Name */}
        <tr>
            <th className="rounded-5">{decode(mapInfo.streetName)}</th>
        </tr>
        {/* Map Image */}
        <tr>
            <td className="bg-transparent">{renderHDImageWithMapId(mapInfo.mapId)}</td>
        </tr>
        {/* Map Name */}
        <tr>
            <td>{decode(mapInfo.mapName)}</td>
        </tr>
        {/* BGM */}
        <tr>
            <td>
                {renderMP3(mapInfo.bgm)}
                <p>{mapInfo.bgm && parseBgmToName(mapInfo.bgm)}</p>
            </td>
        </tr>
    </tbody>
};

const renderTableRight = (mapInfo) => {
    if (!Object.keys(mapInfo).length) return <></>

    const npcs = mapInfo.npc
    const mobs = mapInfo.mob ? Object.entries(mapInfo.mob) : []

    const map_id = mapInfo.mapId
    const hasUrl = data_MapUrl[map_id] && data_MapUrl[map_id][1]
    const mapUrl = hasUrl ? data_MapUrl[map_id][0] : `https://maplelegends.com/lib/map?id=${map_id}`


    return (
        <Tabs id="controlled-tab-example" className="mb-3">
            {/* Map Tab - NPC + Monster + References */}
            <Tab eventKey="Map" title="Map">
                <div>
                    <h5>NPC</h5>
                    {npcs
                        ? npcs.map(renderNPCImageAndName)
                        : <p className="opacity-50 ms-3">None</p>
                    }
                </div>

                <hr />

                <div>
                    <h5>Monster</h5>
                    {mobs.length
                        ? renderMobCountTable(mobs)
                        : <p className="opacity-50 ms-3">None</p>}
                </div>

                <hr />

                <h5>References</h5>
                <a href={mapUrl} target="_blank">Link</a>
            </Tab>

            {/* Stats Tab */}
            <Tab eventKey="Stats" title="Stats">
                {renderMapStats(mapInfo)}
            </Tab>

            {/* Portals Tab */}
            <Tab eventKey="Portals" title="Portals">
                {renderLabelledMapAndTable(mapInfo)}
                {renderPortalTable(mapInfo)}
            </Tab>
        </Tabs>
    )
};

const renderNPCImageAndName = (npc_id) => {
    return <div key={npc_id} className="ms-3">
        <Link to={generateNPCLink(npc_id)}>
            {renderImageWithNPCId(npc_id)}
        </Link>
        <Link to={generateNPCLink(npc_id)}>
            <span className="ms-3">{convertNpcIdToName(npc_id)}</span>
        </Link>
    </div>
}

const renderMobCountTable = (mobs) => {
    return (
        <Table bordered hover className="text-center">
            <tbody >
                <tr>
                    <th className="bg-transparent">Image</th>
                    <th className="bg-transparent">Name</th>
                    <th className="bg-transparent">Count</th>
                </tr>
                {mobs.map(([mob_id, count]) =>
                    <tr key={mob_id + count}>
                        <td>
                            <Link to={convertMobIdToUrl(mob_id)}>
                                {renderImageWithMobId(mob_id)}
                            </Link>
                        </td>
                        <td>
                            <Link to={convertMobIdToUrl(mob_id)}>
                                <span className="ms-3">{convertMobIdToName(mob_id)}</span>
                            </Link>
                        </td>
                        <td>{count}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}

const renderPortalTable = (mapInfo) => {
    if (!mapInfo.portal) return <></>
    let portals = mapInfo.portal
        .filter(({ tm }) => tm != "999999999")
        .filter(({ tm }) => tm != mapInfo.mapId)  // ignore same-map tp

    portals = Array.from(new Set(portals.map(({ tm }) => tm)))

    if (!portals.length) return <p className="opacity-50">None</p>

    return (
        <Table bordered hover className="text-center">
            <tbody >
                <tr>
                    <th className="bg-transparent">Map</th>
                    <th className="bg-transparent">Name</th>
                </tr>
                {portals.map(nextMapId =>
                    <tr key={nextMapId}>
                        <td>
                            <Link to={convertMapIdToUrl(nextMapId)}>
                                {renderImageWithMapId(nextMapId)}
                            </Link>
                        </td>
                        <td>
                            <Link to={convertMapIdToUrl(nextMapId)}>
                                <span className="ms-3">{convertMapIdToName(nextMapId)}</span>
                            </Link>
                        </td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}




const renderMP3 = (audioName) => {
    if (!audioName) return <></>
    audioName = parseBgmToName(audioName)
    const OST_URL = `https://github.com/scotty66f/royals-ost/raw/refs/heads/main/audio/${audioName}.mp3`
    return <audio className="w-100" controls src={OST_URL}></audio>
}


const renderMapStats = (mapInfo) => {
    let unwanted = new Set(["portal", "mapCategory", "mapName", "streetName", 'mob', 'npc', 'miniMap'])
    let keys = Object.keys(mapInfo)
        .filter(k => !unwanted.has(k))
        .sort((a, b) => a.localeCompare(b))
    return (
        <Table bordered hover className="text-center">
            <tbody>
                <tr>
                    <td>Map id </td>
                    <td>{mapInfo.mapId} </td>
                </tr>
                {keys.map(k =>
                    <tr key={k}>
                        <td>{k}</td>
                        <td>{mapInfo[k]}</td>
                    </tr>
                )}
            </tbody>
        </Table>
    )
}

const renderLabelledMapAndTable = (mapInfo) => {
    // console.log(mapInfo)
    return (
        <Accordion defaultActiveKey="null" className="mb-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>Show Labelled Mini Map</Accordion.Header>
                <Accordion.Body>
                    {/*  Map with labelled portal */}
                    <LabelledMap
                        mapId={mapInfo.mapId}
                        portals={mapInfo.portal}
                        miniMap={mapInfo.miniMap}
                    />

                    {/* Table of Portal */}
                    {/* pn: "sp", pt: "0", tm: "999999999", tn: "", x: "-218", y: "93" */}
                    <Table bordered hover className="text-center">
                        <tbody>
                            <tr>
                                <th> pn </th>
                                <th> pt </th>
                                <th> tm </th>
                                <th> tn </th>
                                <th> x </th>
                                <th> y </th>
                            </tr>
                            {mapInfo.portal.map(({ pn, pt, tm, tn, x, y }, index) =>
                                <tr key={mapInfo.mapId + "-" + index + '-' + pn}>
                                    <td>{pn}</td>
                                    <td>{pt}</td>
                                    <td>{tm}</td>
                                    <td>{tn}</td>
                                    <td>{x}</td>
                                    <td>{y}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>

                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}