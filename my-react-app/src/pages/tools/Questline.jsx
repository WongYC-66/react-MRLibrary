import { useState, useMemo, useEffect } from "react"
import { useParams, useNavigate, Link } from 'react-router-dom';
// 
import Container from "react-bootstrap/esm/Container"
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Accordion from 'react-bootstrap/Accordion';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';

// 

import data_Quest from "../../../data/data_Quest.json"
import data_NPC from "../../../data/data_NPC.json"
import data_Questline from "../../../data/data_Questline.json"


import {
    renderImageWithNPCId,
    renderItemImageWrapper,
    convertAreaCodeToName,
    convertItemIdToName,
    convertMobIdToName,
    convertMobIdToUrl,
    generateNPCLink,
    convertQuestIdToUrl,
} from "../quest/utility.jsx"
import { renderImageWithMobId, itemIdToNavUrl } from "../monster/utility.jsx"

export default function Questline() {

    const navigate = useNavigate();

    const [searchText, setSearchText] = useState('')

    let { questId } = useParams();
    questId = questId?.split('=')[1]

    const seriesOfQuestline = validQuestId(questId) ? generateQuestSeriesId(questId).map(id => { return { questId: id, ...data_Quest[id] } }) : []

    const areaNames = [
        'Job',
        'Maple Island',
        'Victoria Island',
        'Elnath Mt + Aquaroad',
        'Ludus Lake',
        'Ellin Forest',
        'Leafre',
        'Neo Tokyo',
        'Mu Lung + Nihal Desert',
        'Masteria',
        'Temple of Time',
        'Party Quest',
        'World Tour',
        'Malaysia',
        'Event',
        'Title',
        'Zakum',
        'Hero With The Lost Memory',
    ]

    const areaToQuestlineDict = useMemo(generateQuestline, [])

    const areaToQuestline = areaNames
        .map(name => areaToQuestlineDict[name] || [])
        .map(arr => filterBySearchText(arr, searchText))

    const handleQuestlineClick = (questId) => {
        navigate(`/questline/id=${questId}`); // This changes the URL
    }

    console.log(seriesOfQuestline)

    return (
        <Container>
            <Row>
                {/* Left window - Search Input & List*/}
                <Col md={4}>
                    <div className="d-flex flex-column">
                        {/* Search Input */}
                        <FormBS.Control
                            className=""
                            type="search"
                            placeholder=" Search ..."
                            aria-label="Search"
                            data-bs-theme="light"
                            name="searchName"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />

                        {/* List of area + questline series */}
                        <div className="mt-3">
                            <Accordion defaultActiveKey="null" className="px-1">
                                {areaNames.map((area, i) =>
                                    <Accordion.Item eventKey={i} key={area + "-" + i}>
                                        <Accordion.Header className={areaToQuestline[i].length ? '' : 'opacity-25'}>{area} ({areaToQuestline[i].length})</Accordion.Header>
                                        <Accordion.Body>
                                            <ListGroup variant="flush">
                                                {areaToQuestline[i].map(({ questId, questlineName }) =>
                                                    <ListGroup.Item action key={questId} onClick={() => handleQuestlineClick(questId)}>
                                                        {questlineName}
                                                    </ListGroup.Item>
                                                )}
                                            </ListGroup>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                )}
                            </Accordion>
                        </div>
                    </div>
                </Col>

                {/* Right window - series of a questline*/}
                <Col md={8}>
                    <div className="d-flex flex-column">
                        {seriesOfQuestline.length
                            ? <div>
                                {/* questline name */}
                                <h3 className="mb-4">Questline : {seriesOfQuestline[0]?.QuestInfo.parent || seriesOfQuestline[0]?.QuestInfo.name} </h3>

                                {/* series of quest */}
                                <Accordion defaultActiveKey='0' alwaysOpen>
                                    {seriesOfQuestline.map((nextQuestData, i) =>
                                        <Accordion.Item eventKey={nextQuestData.QuestInfo.name + i} key={nextQuestData.QuestInfo.name + i}>
                                            <Accordion.Header>{nextQuestData.QuestInfo.name}</Accordion.Header>
                                            <Accordion.Body>
                                                {/* Quest Card */}
                                                <div className="d-flex justify-content-between flex-wrap">

                                                    {/* left */}
                                                    <div className="flex-grow-1 mb-3">
                                                        <Link to={convertQuestIdToUrl(nextQuestData.questId)} className="opacity-75">
                                                            {nextQuestData.questId}
                                                        </Link>
                                                        <p>Level : {nextQuestData.Check[0]?.lvmin || 'None'}</p>
                                                        <p>LevelCap : {nextQuestData.Check[0]?.lvmax || 'None'}</p>
                                                        <p>NPC: {renderNPC(nextQuestData.Check[0]?.npc || '')}</p>
                                                        <p>Submit : {renderNPC(nextQuestData.Check[1]?.npc || '')}</p>

                                                        <h6>Prerequisite (Item):</h6>
                                                        {
                                                            nextQuestData.Check['0']?.item
                                                                ? Object.values(nextQuestData.Check['0'].item).map((itemObj, i) => renderItemAndQty(itemObj, i, nextQuestData.questId))
                                                                : <p className="opacity-50">None</p>
                                                        }

                                                        <h6>Initial Rewards:</h6>
                                                        {
                                                            nextQuestData.Act && nextQuestData.Act['0']?.item
                                                                ? Object.values(nextQuestData.Act['0'].item).map((itemObj, i) => renderItemAndQty(itemObj, i, nextQuestData.questId))
                                                                : <p className="opacity-50">None</p>
                                                        }
                                                    </div>

                                                    {/* right */}
                                                    <div className="flex-grow-1 d-flex justify-content-between">
                                                        {/* Required  */}
                                                        <div className="p-3 border border-opacity-50 rounded" style={{ width: "48%" }}>
                                                            <h6>Required Items:</h6>
                                                            {
                                                                nextQuestData.Check['1']?.item
                                                                    ? Object.values(nextQuestData.Check['1'].item).map((itemObj, i) => renderItemAndQty(itemObj, i, nextQuestData.questId))
                                                                    : <p className="opacity-50">None</p>
                                                            }

                                                            <h6 className="mt-4">Required Monsters:</h6>
                                                            {
                                                                nextQuestData.Check['1']?.mob
                                                                    ? Object.values(nextQuestData.Check['1'].mob).map((mobObj, i) => renderMobAndQty(mobObj, i, nextQuestData.questId))
                                                                    : <p className="opacity-50">None</p>
                                                            }
                                                        </div>

                                                        {/* Rewards */}
                                                        <div className="p-3 border border-opacity-50 rounded" style={{ width: "48%" }}>
                                                            <h6>Rewards:</h6>
                                                            {/* EXP */}
                                                            { nextQuestData.Act && nextQuestData.Act['1']?.exp && <p>Exp : {nextQuestData.Act['1'].exp}</p>}
                                                            
                                                            {/* fixed item reward */}
                                                            {
                                                                nextQuestData.Act && nextQuestData.Act['1']?.item
                                                                    ? Object.values(nextQuestData.Act['1'].item).map((itemObj, i) => renderItemAndQty(itemObj, i, nextQuestData.questId))
                                                                    : <p className="opacity-50">None</p>
                                                            }

                                                            {/* random item reward */}
                                                            <h6 className="mt-4">Random Rewards:</h6>
                                                            {
                                                                nextQuestData.Act && nextQuestData.Act['1']?.item
                                                                    ? Object.values(nextQuestData.Act['1'].item).map((itemObj, i) => renderRandomItemAndQty(itemObj, i, nextQuestData.questId))
                                                                    : <p className="opacity-50">None</p>

                                                            }
                                                        </div>
                                                    </div>

                                                </div>
                                            </Accordion.Body>
                                        </Accordion.Item>
                                    )}
                                </Accordion>

                            </div>
                            : <></>
                        }
                    </div>
                </Col>
            </Row>
        </Container>
    )
}

const generateQuestline = () => {
    let dict = {}   // ['20' : [ {questId1, questlineName1} , ...], '44': [...]]

    for (let questId in data_Questline) {
        if (!data_Questline[questId].isHead) continue

        // due to unknown, some quest prerequisite never existed, royals team delete them ?
        if (!(questId in data_Quest)) continue

        // is Head of questline
        let questlineName = data_Quest[questId].QuestInfo.parent || data_Quest[questId].QuestInfo.name
        let questlineArea = data_Quest[questId].QuestInfo.area
        let areaName = convertAreaCodeToName(questlineArea)
        // if (!questlineName) continue // consider remove this line to check if overfiltered

        if (!(areaName in dict)) dict[areaName] = []

        dict[areaName].push({ questId, questlineName })
    }

    return dict
}

const filterBySearchText = (arr, searchText) => {
    let lowerSearch = searchText.toLowerCase()
    return arr.filter(({ questlineName }) => questlineName.toLowerCase().includes(lowerSearch))
}

const generateQuestSeriesId = (questId) => {

    let questSeries = []

    // bfs to add to queue
    let seen = new Set([questId])

    let queue = [questId]
    while (queue.length) {
        let id = queue.shift()
        questSeries.push(id)
        if (data_Questline[id]?.children.length) {
            data_Questline[id].children.forEach(childId => {
                if (seen.has(childId)) return
                queue.push(childId)
                seen.add(childId)
            })
        }
    }

    return questSeries
}

const validQuestId = (questId) => {
    return questId in data_Questline && data_Questline[questId].isHead
}

const renderNPC = (npcId) => {
    const npcName = data_NPC[npcId]?.name || ''
    return <Link to={generateNPCLink(npcId)}>
        {renderImageWithNPCId(npcId)} {npcName}
    </Link>
}

const renderItemAndQty = ({ id: itemId, count, prop }, i, questId) => {
    if (prop) return ""
    if(count <= 0) return ""

    return <div key={`${questId}-${itemId}-${i}`}>
        <Link to={itemIdToNavUrl(itemId)}>
            {renderItemImageWrapper(itemId)}
            <span className="mx-1"></span>
            {convertItemIdToName(itemId)}
        </Link>
        <Badge bg="secondary" className="ms-3">{count}</Badge>
    </div>
}

const renderRandomItemAndQty = ({ id: itemId, count, prop }, i, questId) => {
    if (!prop) return ""
    if(count <= 0) return ""

    return <div key={`${questId}-${itemId}-${i}`}>
        <Link to={itemIdToNavUrl(itemId)}>
            {renderItemImageWrapper(itemId)}
            <span className="mx-1"></span>
            {convertItemIdToName(itemId)}
        </Link>
        <Badge bg="secondary" className="ms-3">{count}</Badge>
    </div>
}

const renderMobAndQty = ({ id: mobId, count }, i, questId) => {
    return <div key={`${questId}-${mobId}-${i}`}>
        <Link to={convertMobIdToUrl(mobId)}>
            {renderImageWithMobId(mobId)}
            {convertMobIdToName(mobId)}
        </Link>
        <Badge bg="secondary" className="ms-3">{count}</Badge>
    </div>
}

