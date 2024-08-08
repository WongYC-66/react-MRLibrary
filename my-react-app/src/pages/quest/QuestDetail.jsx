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
import Accordion from 'react-bootstrap/Accordion';

// 

// import { renderImageWithSkillId, skillIdToJobString, elementCharToKey } from "./utility.jsx"
import { filterQuestList, renderImageWithNPCId, convertAreaCodeToName } from "./utility.jsx"

import data_Quest from "../../../data/data_Quest.json"
import data_NPC from "../../../data/data_NPC.json"

export default function QuestDetail() {

    const [questInfo, setQuestInfo] = useState({})
    let { questId } = useParams();

    useEffect(() => {
        let quest_Id = questId.split("=")[1]
        let obj = { quest_Id, ...data_Quest[quest_Id] }
        setQuestInfo(obj)
    }, [])

    console.log(questInfo)
    // return 'quest detail'

    return (
        <div className="quest-detail">
            <Container>
                <Row>
                    {/* NPC Image, quest name, desc, etc ... */}
                    <Col lg={4}>
                        <div className="quest-stats-card text-center">
                            <Table bordered hover>
                                {renderTableLeft(questInfo)}
                            </Table>

                        </div>

                    </Col>
                    {/* Quest Stats */}
                    <Col lg={8}>
                        <div className="quest-detail-card">
                            {renderTableRight(questInfo)}
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    )
}

const renderTableLeft = (questInfo) => {
    if (!Object.keys(questInfo).length) return <></>
    const obj = questInfo
    const quest_Id = obj.quest_Id
    const npc_id = obj.Check ? obj.Check['0'].npc : null
    const npcName = data_NPC[npc_id] ? data_NPC[npc_id].name : `name not found, npc id : ${npc_id}`
    const questName = obj.QuestInfo && obj.QuestInfo.name ? obj.QuestInfo.name : `quest name not found, quest id : ${quest_Id}`
    const questRegion = obj.QuestInfo ? convertAreaCodeToName(obj.QuestInfo.area) : `quest location code not found`

    return <tbody>
        {/* Name */}
        <tr>
            <th className="rounded-5">
                <p>{questName}</p>
            </th>
        </tr>
        {/* NPC Image */}
        <tr>
            <td className="bg-transparent">
                {renderImageWithNPCId(npc_id)}
            </td>
        </tr>
        {/* NPC Name */}
        <tr>
            <td>{npcName}</td>
        </tr>
        {/* Job Type */}
        <tr>
            <td>Location : {questRegion}</td>
        </tr>
    </tbody>
};

const renderTableRight = (questInfo) => {
    if (!Object.keys(questInfo).length) return <></>

    let maxIndex = Object.keys(questInfo.Act).length + 1
    let indexArr = Array(maxIndex).fill()

    return (
        <Tabs id="controlled-tab-example" className="mb-3">
            {indexArr.map((_, i) => renderTabByIndex(questInfo, i))}
        </Tabs>
    )
};

const renderTabByIndex = (questInfo, index) => {
    const questInfoString = questInfo.QuestInfo ? questInfo.QuestInfo[index] : ''

    let rewards = []   // [{type : item/fame/mesos/exp/other, Quantity :}, {...}, ...]
    let randomRewards = []    //{type, id, Quantity, Prop}, {...}, ...]
    let totalProp = 0         // calculate total probabiltiy ?

    let needed = []

    let dialogueNormal = []
    let dialogueYes = []
    let dialogueNo = []
    let dialogueStop = []
    let dialogueLost = []

    // process Act - into  rewards & randomRewards
    if (questInfo.Act && questInfo.Act[index]) {
        let obj = questInfo.Act[index]
        for (let k in obj) {
            if (k != 'item') {
                let propertyName = k
                if (propertyName == 'pop') propertyName = 'fame'
                rewards.push({ type: propertyName, count: obj[k] })
                continue
            }

            if (k == 'item') {
                let arr = Object.values(obj['item'])
                arr.forEach(({ id, count, prop }) => {
                    if (!prop) {
                        // not random
                        rewards.push({ type: 'item', id, count })
                    } else {
                        totalProp += Number(prop)
                        randomRewards.push({ type: 'item', id, count, prop: Number(prop) })
                    }
                })
            }
        }
    }

    // process Check - into needed array
    if (questInfo.Check && questInfo.Check[index]) {
        let obj = questInfo.Check[index]
        for (let k in obj) {
            if (k == 'npc') continue
            if (obj[k] && typeof obj[k] == 'string') {
                let propertyName = k
                if (propertyName == 'lvmin') propertyName = 'level'
                needed.push({ type: propertyName, count: obj[k] })
                continue
            }

            if (k != 'item' && k != 'mob' && k != 'quest') continue

            // 'item' / 'mob' / 'quest' array
            let arr = Object.values(obj[k])
            arr.forEach(propObj => {
                needed.push({ type: k, ...propObj })
            })
        }
    }

    const recursiveFind = (obj) => {
        let res = []
        for (let k in obj) {
            if (isNaN(k)) {
                let deeperRes = recursiveFind(obj[k])
                res.push(...deeperRes)
            } else {
                res.push(obj[k])
            }
        }
        return res
    }

    // process Say - into  dialogueNormal/dialogueYes/dialogueNo/dialogueStop/dialoguelost
    if (questInfo.Say && questInfo.Say[index]) {
        let obj = questInfo.Say[index]
        for (let k in obj) {
            if (k == 'yes') {
                dialogueYes.push(...recursiveFind(obj[k]))
            } else if (k == 'no') {
                dialogueNo.push(...recursiveFind(obj[k]))
            } else if (k == 'stop') {
                dialogueStop.push(...recursiveFind(obj[k]))
            } else if (k == 'lost') {
                dialogueLost.push(...recursiveFind(obj[k]))
            } else {
                dialogueNormal.push(obj[k])
            }
        }
    }

    // console.log(dialogueNormal)

    return (
        <Tab eventKey={index} title={index} key={index}>
            {/* QuestInfo - what u see at in-game Quest Window */}
            <Accordion flush className="my-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Background</Accordion.Header>
                    <Accordion.Body>
                        {questInfoString}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Act - Reward/Deduct item */}
            <h5>Rewards : </h5>
            <ul>
                {rewards.map((obj, i) =>
                    obj.type === 'item'
                        ? <li key={'reward' + obj.id + i}>
                            img . name .  {obj.id} x {obj.count}
                        </li>
                        : <li key={'reward' + obj.id + i}>
                            {obj.type} : {obj.count}
                        </li>
                )}
            </ul>
            <h5>Random Rewards : </h5>
            <ul>
                {randomRewards.map((obj, i) =>
                    // calculate probability too
                    <li key={'rewardRand' + obj.id + i}>
                        img . name .  {obj.id} x {obj.count} ({(obj.prop / totalProp * 100).toFixed(2)}%)
                    </li>
                )}
            </ul>

            {/* Check */}
            <Accordion flush className="my-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Needed</Accordion.Header>
                    <Accordion.Body>
                        <ul>
                            {needed.map((obj, i) =>
                                obj.type === 'item'
                                    ? <li key={'check' + obj.id + i}>
                                        img . name .  {obj.id} x {obj.count}
                                    </li>
                                    : obj.type === 'mob'
                                        ? <li key={'check' + obj.id + i}>
                                            {obj.type} : {obj.count}
                                        </li>
                                        : obj.type === 'quest'
                                            ? <li key={'check' + obj.id + i}>
                                                {obj.type} : {obj.id} {obj.state}
                                            </li>
                                            : <li key={'check' + obj.id + i}>
                                                {obj.type} : {obj.count}
                                            </li>
                            )}
                        </ul>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Say */}
            <Accordion flush className="my-3">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Dialogue</Accordion.Header>
                    <Accordion.Body>
                        {renderDialogSection(dialogueNormal, '')}
                        {renderDialogSection(dialogueYes, 'Yes')}
                        {renderDialogSection(dialogueNo, 'No')}
                        {renderDialogSection(dialogueStop, 'Stop')}
                        {renderDialogSection(dialogueLost, 'Lost')}
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </Tab>
    )
}

const renderDialogSection = (dialogArr, title) => {
    if (!dialogArr.length) return <></>
    return (
        <>
            <h5>{title}</h5>
            {dialogArr.map(str => <p key={title + str}>{str}</p>)}
        </>
    )
}

