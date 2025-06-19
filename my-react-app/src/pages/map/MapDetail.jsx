import { useState } from "react";
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
import FormBS from "react-bootstrap/Form"
// 
import LabelledMap from "./LabelledMap.jsx";
import RenderedMap from "./RenderedMap.jsx";
// 
import { RenderImageWithMapId, convertMapIdToUrl, convertMapIdToName, parseBgmToName, addMonsterBookSpawn, portalPtValueToTypeName, resolveMapIdIfLink } from "./utility.jsx"

import { renderImageWithMobId } from "../monster/utility.jsx"
import { renderImageWithNPCId, convertNpcIdToName } from "../npc/utility.jsx"
import { generateNPCLink, convertMobIdToUrl, convertMobIdToName } from "../quest/utility.jsx"

import data_Map from "../../../data/data_Map.json"
import data_MapUrl from "../../../data/data_MapUrl.json"
import data_MapStats from "../../../data/data_MapStats.json"
import data_MapMobCount from "../../../data/data_MapMobCount.json"

export default function MapDetail() {

    const [mapBlob, setMapBlob] = useState(null)    // recyle

    const [canvasOption, setCanvasOption] = useState({
        showMob: true,
        showNpc: true,
        showPortal: true,
        showReactor: true,
    })

    let { mapId } = useParams();

    const map_id = mapId.split("=")[1]

    const hashMapId = resolveMapIdIfLink(map_id)
    // console.log({ map_id, hashMapId })
    let mapInfo = {
        mapId: hashMapId,
        mob: data_MapMobCount[hashMapId],
        ...data_Map[hashMapId],
        ...data_MapStats[hashMapId],
        // link- related
        originalMapId: Number(map_id),
        link : hashMapId,
    }
    mapInfo = addMonsterBookSpawn(mapInfo)

    const onRenderComplete = (blob) => {
        setMapBlob(blob)
    }

    if (!data_MapStats[hashMapId]) throw new Error('No such Map Id')
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
                                {renderTableLeft(mapInfo, onRenderComplete)}
                            </Table>

                        </div>

                    </Col>
                    {/* Map Stats, monster spawn, npc, portals */}
                    <Col lg={8}>
                        <div>
                            {renderTableRight(mapInfo, canvasOption, setCanvasOption, mapBlob)}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    )
}

const renderTableLeft = (mapInfo, onRenderComplete) => {
    if (!Object.keys(mapInfo).length) return <></>
    const mapId = mapInfo.mapId

    return <tbody>
        {/* Street Name */}
        <tr>
            <th className="rounded-5">{decode(mapInfo.streetName)}</th>
        </tr>
        {/* Map Image */}
        <tr>
            {/* <td className="bg-transparent">{renderHDImageWithMapId(mapInfo.mapId)}</td> */}
            <td className="bg-transparent">{<RenderedMap mapId={mapId} onRenderComplete={onRenderComplete} />}</td>
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

const renderTableRight = (mapInfo, canvasOption, setCanvasOption, mapBlob) => {
    if (!Object.keys(mapInfo).length) return <></>

    const npcs = mapInfo.npc
    const mobs = mapInfo.mob ? Object.entries(mapInfo.mob) : []

    const map_id = mapInfo.mapId
    const hasUrl = data_MapUrl[map_id] && data_MapUrl[map_id][1]
    const mapUrl = hasUrl ? data_MapUrl[map_id][0] : `https://maplelegends.com/lib/map?id=${map_id}`

    const handleCheckboxClick = (val, property) => {
        let nextObj = { ...canvasOption, [property]: val }
        setCanvasOption(nextObj)
    }

    return (
        <Tabs id="controlled-tab-example" className="mb-3">
            {/* Map Tab - NPC + Monster + References */}
            <Tab eventKey="Map" title="Map">
                <div>
                    <h5>NPC</h5>
                    {npcs
                        ? <div className="d-grid gap-0" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', justifyItems: 'start' }}>
                            {npcs.map(renderNPCImageAndName)}
                        </div>
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
                {renderLabelledMapAndTable(mapInfo, mapBlob)}
                {renderPortalTable(mapInfo)}
            </Tab>

            {/* Canvas Tab */}
            <Tab eventKey="Canvas" title="Canvas">
                <FormBS.Check inline label='Mob' name="Mob" type='checkbox' id='Mob' checked={canvasOption.showMob} onChange={e => handleCheckboxClick(e.target.checked, 'showMob')} />
                <FormBS.Check inline label='Npc' name="Npc" type='checkbox' id='Npc' checked={canvasOption.showNpc} onChange={e => handleCheckboxClick(e.target.checked, 'showNpc')} />
                <FormBS.Check inline label='Reactor' name="Reactor" type='checkbox' id='Reactor' checked={canvasOption.showReactor} onChange={e => handleCheckboxClick(e.target.checked, 'showReactor')} />
                <FormBS.Check inline label='Portal' name="Portal" type='checkbox' id='Portal' checked={canvasOption.showPortal} onChange={e => handleCheckboxClick(e.target.checked, 'showPortal')} />

                <RenderedMap mapId={map_id} canvasOption={canvasOption} />
            </Tab>
        </Tabs>
    )
};

const renderNPCImageAndName = (npc_id) => {
    return <div key={npc_id} className="ms-3 d-flex flex-column align-items-center">
        <Link to={generateNPCLink(npc_id)}>
            <div style={{ maxWidth: '50px' }}>
                {renderImageWithNPCId(npc_id)}
            </div>

        </Link>
        <Link to={generateNPCLink(npc_id)}>
            {/* <span className="ms-3">{convertNpcIdToName(npc_id)}</span> */}
            <p className="ms-3 text-center">{convertNpcIdToName(npc_id)}</p>
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
    // Next Map Table
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
                                <RenderImageWithMapId mapId={nextMapId} />
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
    return <audio className="w-100" controls src={OST_URL} loop></audio>
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

const renderLabelledMapAndTable = (mapInfo, mapBlob) => {
    if (!mapInfo.portal) return <></>
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
                        mapBlob={mapBlob}
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
                                    <td>{portalPtValueToTypeName[pt]}</td>
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