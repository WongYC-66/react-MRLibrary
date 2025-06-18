import { useParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Table from "react-bootstrap/Table"
import Tabs from "react-bootstrap/Tabs"
import Tab from "react-bootstrap/Tab"
import Accordion from 'react-bootstrap/Accordion';

// 
import {
    renderItemImageWrapper,
    convertAreaCodeToName,
    questIdToName,
    convertItemIdToName,
    convertMobIdToName,
    translateText,
    convertMobIdToUrl,
    generateNPCLink,
    convertQuestParentNameToUrl
} from "./utility.jsx"

import { renderImageWithNPCId, } from "../npc/utility.jsx"

import { renderImageWithMobId, itemIdToNavUrl } from "../monster/utility.jsx"

import data_Quest from "../../../data/data_Quest.json"
import data_NPC from "../../../data/data_NPC.json"

export default function QuestDetail() {

    // const [questInfo, setQuestInfo] = useState({})
    let { questId } = useParams();

    useEffect(() => {
        let quest_Id = questId.split("=")[1]
        let obj = { quest_Id, ...data_Quest[quest_Id] }
        // setQuestInfo(obj)
    }, [])

    let quest_Id = questId.split("=")[1]
    let obj = { quest_Id, ...data_Quest[quest_Id] }
    const questInfo = obj

    // console.log(questInfo)

    return (
        <div className="quest-detail" key={quest_Id}>
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
    const npc_id = obj.Check && obj.Check['0']?.npc || null
    const npcName = data_NPC[npc_id] ? data_NPC[npc_id].name : `name not found, npc id : ${npc_id}`
    const questName = obj.QuestInfo && obj.QuestInfo.name ? obj.QuestInfo.name : `quest name not found, quest id : ${quest_Id}`
    const parentName = obj.QuestInfo && obj.QuestInfo.parent
    const questRegion = obj.QuestInfo ? convertAreaCodeToName(obj.QuestInfo.area) : `quest location code not found`

    return <tbody>
        {/* Name */}
        <tr>
            <th className="rounded-5">
                <p>{questName}</p>
                {parentName &&
                    <p>Parent : <Link to={convertQuestParentNameToUrl(parentName)}>
                        {parentName}
                    </Link></p>
                }
            </th>
        </tr>
        {/* NPC Image */}
        <tr>
            <td className="bg-transparent">
                <Link to={generateNPCLink(npc_id)}>
                    {renderImageWithNPCId(npc_id)}
                </Link>
            </td>
        </tr>
        {/* NPC Name */}
        <tr>
            <td>
                <Link to={generateNPCLink(npc_id)}>

                    {npcName}
                </Link>
            </td>
        </tr>
        {/* Job Type */}
        <tr>
            <td>Location : {questRegion}</td>
        </tr>
    </tbody>
};

const renderTableRight = (questInfo) => {
    if (!Object.keys(questInfo).length) return <></>

    const lengthArr = [questInfo.Act, questInfo.Say, questInfo.Check, questInfo.QuestInfo]
        .filter(Boolean)
        .map(obj => Math.max(...Object.keys(obj).filter(k => Number.isInteger(Number(k)))))

    let maxIndex = Math.max(...lengthArr) + 1
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
                rewards.push({ type: propertyName, count: JSON.stringify(obj[k]) })
                continue
            }

            if (k == 'item') {
                let arr = Object.values(obj['item'])
                arr.forEach(({ id, count, prop }) => {
                    if (!id) return

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
                needed.push({ type: propertyName, count: JSON.stringify(obj[k]) })
                continue
            }

            if (k != 'item' && k != 'mob' && k != 'quest' && k != 'equipAllNeed') continue

            // 'equipAllNeed' array
            if (k == 'equipAllNeed') {
                let arr = Object.values(obj[k])
                arr.forEach(itemId => {
                    needed.push({ type: k, id: itemId })
                })
                continue
            }

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
            if (typeof obj[k] == 'string') {
                res.push(obj[k])
                continue
            }
            let deeperRes = recursiveFind(obj[k])
            res.push(...deeperRes)
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

    // console.log(needed)
    // console.log(dialogueNormal)
    // console.log(dialogueYes)
    // console.log(dialogueNo)
    // console.log(dialogueStop)
    // console.log(dialogueLost)


    return (
        <Tab eventKey={index} title={index} key={index}>
            {/* QuestInfo - Background, what u see at in-game Quest Window */}
            {renderBackground(questInfoString)}

            {/* Act - Reward/Random Rewards*/}
            {renderReward(rewards, randomRewards, totalProp)}

            {/* Check - Needed of Level/Mob Kill/Items*/}
            {renderNeeded(needed)}

            {/* Say - Dialogue */}
            <Accordion defaultActiveKey='999' flush className="my-3">
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

const renderBackground = (questInfoString) => {
    return (
        <Accordion defaultActiveKey='999' flush className="my-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>Background</Accordion.Header>
                <Accordion.Body>
                    <p dangerouslySetInnerHTML={{ __html: translateText(questInfoString) }}></p>
                    {/* {translateText(questInfoString) } */}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

const renderReward = (rewards, randomRewards, totalProp) => {
    return (
        <>
            <h5>Rewards : </h5>
            <ul>
                {rewards.map((obj, i) =>
                    obj.type === 'item'
                        ? <li key={'reward' + obj.id + i}>
                            <Link to={itemIdToNavUrl(obj.id)}>
                                {renderItemImageWrapper(obj.id)}
                            </Link>
                            <Link to={itemIdToNavUrl(obj.id)}>
                                {convertItemIdToName(obj.id)}
                            </Link> :
                            <span className={`${obj.count < 0 && 'text-danger'} ms-1`}>{obj.count}</span>
                        </li>
                        : obj.type === 'nextQuest'
                            ? <li key={'check' + obj.id + i}>
                                {obj.type} :
                                <Link to={`../id=${obj.count}`}> {questIdToName(obj.count)} </Link>
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
                        <Link to={itemIdToNavUrl(obj.id)}>
                            {renderItemImageWrapper(obj.id)}
                        </Link>
                        <Link to={itemIdToNavUrl(obj.id)}>
                            {convertItemIdToName(obj.id)}
                        </Link> x {obj.count}
                        <span className="ms-3"> ({(obj.prop / totalProp * 100).toFixed(2)}%)
                        </span>
                    </li>
                )}
            </ul>
        </>
    )
}

const renderNeeded = (needed) => {
    // console.log(needed)
    return (
        <Accordion defaultActiveKey='0' flush className="my-3">
            <Accordion.Item eventKey="0">
                <Accordion.Header>Needed</Accordion.Header>
                <Accordion.Body>
                    <ul>
                        {needed.map((obj, i) =>
                            obj.type === 'item'
                                ? <li key={'check' + obj.id + i}>
                                    <Link to={itemIdToNavUrl(obj.id)}>
                                        {renderItemImageWrapper(obj.id)}
                                    </Link>
                                    <Link to={itemIdToNavUrl(obj.id)}>
                                        {convertItemIdToName(obj.id)}
                                    </Link> x {obj.count}
                                </li>
                                : obj.type === 'mob'
                                    ? <li key={'check' + obj.id + i}>
                                        <Link to={convertMobIdToUrl(obj.id)}>
                                            {renderImageWithMobId(obj.id)}
                                        </Link>
                                        <Link to={convertMobIdToUrl(obj.id)}>
                                            {convertMobIdToName(obj.id)}
                                        </Link> x {obj.count}
                                    </li>
                                    : obj.type === 'quest'
                                        ? <li key={'check' + obj.id + i}>
                                            {obj.type} :
                                            <Link to={`../id=${obj.id}`}>{questIdToName(obj.id)} </Link>
                                            . State : {obj.state}
                                        </li>
                                        : obj.type === 'equipAllNeed'
                                            ? <li key={'check' + obj.id + i}>
                                                {renderItemImageWrapper(obj.id)}
                                                {convertItemIdToName(obj.id)}
                                            </li>
                                            : <li key={'check' + obj.id + i}>
                                                {obj.type} : {obj.count}
                                            </li>
                        )}
                    </ul>
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

const renderDialogSection = (dialogArr, title) => {
    if (!dialogArr.length) return <></>
    return (
        <>
            <h5>{title}</h5>
            {/* {dialogArr.map((str, i) => <p key={title + str + i}>{translateText(str)}</p>)} */}
            {dialogArr.map((str, i) => <p key={title + str + i} dangerouslySetInnerHTML={{ __html: translateText(str) }}></p>)}
        </>
    )
}

