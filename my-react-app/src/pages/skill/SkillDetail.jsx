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
// 

import { renderImageWithSkillId, skillIdToJobString, elementCharToKey } from "./utility.jsx"

import data_skill from "../../../data/data_Skill.json"
import data_skillStats from "../../../data/data_SkillStats.json"

export default function SkillDetail() {

    const [skillInfo, setSkillInfo] = useState({})
    let { skillId } = useParams();

    useEffect(() => {
        let skill_Id = skillId.split("=")[1]
        let obj = {}
        obj = {
            ...data_skillStats[skill_Id],
            ...data_skill[skill_Id],
            id: skill_Id,
        }
        setSkillInfo(obj)
    }, [])

    // console.log(skillInfo)

    return (
        <div className="skill-detail">
            <Container>
                <Row>
                    {/* Skill Image, name, desc, etc ... */}
                    <Col lg={4}>
                        <div className="skill-stats-card text-center">
                            <Table bordered hover>
                                {renderTableLeft(skillInfo)}
                            </Table>

                        </div>

                    </Col>
                    {/* Each Level Stats */}
                    <Col lg={8}>
                        <div className="skill-level-card">
                            <Table bordered hover className="text-center">
                                {renderTableRight(skillInfo)}
                            </Table>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>

    )
}

const renderTableLeft = (skillInfo) => {
    return <tbody>
        {/* Name */}
        <tr>
            <th className="rounded-5">
                <p dangerouslySetInnerHTML={{ __html: skillInfo.name }}></p>
            </th>
        </tr>
        {/* Image */}
        <tr>
            <td className="bg-transparent">
                {renderImageWithSkillId(skillInfo.id)}
            </td>
        </tr>
        {/* Description */}
        <tr>
            <td>
                {skillInfo.desc?.split('\\n').map((str, i) => {
                    // place "#cImportant Text#" into "<span>Important Text</span>"
                    str = str.replace(/\#c(.*)#/, `<span class='text-warning fw-bolder'>$1</span>`)
                    return <p key={i} className="my-0" dangerouslySetInnerHTML={{ __html: str }}></p>
                })}

            </td>
        </tr>
        {/* Job Type */}
        <tr>
            <td>Job : {skillIdToJobString(skillInfo.id)}</td>
        </tr>
        {/* Elemental Type Property */}
        {skillInfo.elemAttr && <tr>
            <td>Elemental Type :
                <span className="fw-bold">
                    {" " + elementCharToKey[skillInfo.elemAttr?.toUpperCase()]}
                </span>
            </td>
        </tr>}
    </tbody>
};

const renderTableRight = (skillInfo) => {

    // Level  & Description data pre-processing
    const strArr = []
    for (let i = 1; i <= 30; i++) {
        let key = `h${i}`
        if (skillInfo.hasOwnProperty(key)) {
            strArr.push(skillInfo[key])
        }
    }

    // Stats Column data pre-processing
    const statStrArr = []
    for (let i = 1; i <= 30; i++) {
        if (skillInfo.level && skillInfo.level[i]) {
            let str = ''

            Object.entries(skillInfo.level[i])
                .filter(x => x[0] != 'hs')
                .forEach(([key, val]) => {
                    let subStr = `${key} : ${val} , `
                    if (key == 'lt' || key == 'rb') {
                        // overwrite subStr with format : lt:[x:_ , y:_]  or rb:[x:_, y:_]
                        subStr = `${key} : [ x : ${val.x} , y : ${val.y} ] , `
                    }

                    str += subStr
                })

            statStrArr.push(str.slice(0, -2))
        }
    }

    return <tbody>
        {/* title row */}
        <tr>
            <th className="bg-transparent">Level</th>
            <th className="bg-transparent">Description</th>
            <th className="bg-transparent">Stats</th>
        </tr>
        {/* Each level row */}
        {strArr.map((str, i) =>
            <tr key={i}>
                <td>{i + 1}</td>
                <td>{str}</td>
                <td>{statStrArr[i]}</td>
            </tr>
        )}
    </tbody>
};

// const numFormatter = num => Number(num).toLocaleString("en-US")
