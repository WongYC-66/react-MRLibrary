import { useParams, Form, redirect, useLocation, NavLink, Link } from "react-router-dom"
import { LinkContainer } from 'react-router-bootstrap'
import { useState, useEffect } from "react"
// 
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Image from "react-bootstrap/Image"
import Pagination from 'react-bootstrap/Pagination';
// 
import data_mob from "../../data/data_Mob.json"
import data_mobStats from "../../data/data_MobStats.json"
import data_MB from "../../data/data_MB.json"
import data_MapMobCount from "../../data/data_MapMobCount.json"
import data_Map from "../../data/data_Map.json"

export default function MonsterDetail() {

    const [mobInfo, setMobInfo] = useState({})
    let { mobId } = useParams();

    console.log(mobInfo)

    useEffect(() => {
        const mob_Id = mobId.split("=")[1]
        const obj = {
            ...data_mobStats[mob_Id],
            id: mob_Id,
            name: data_mob[mob_Id],
            imgUrl: `https://maplelegends.com/static/images/lib/monster/${mob_Id.padStart(7, 0)}.png`,
            drops: data_MB[mob_Id],
        }
        const spawnMapObj = []
        Object.entries(data_MapMobCount).forEach(([mapId, valueObj]) => {
            const valueArr = Object.entries(valueObj)
            valueArr.forEach(([MobId, count]) => {
                if (Number(MobId) === Number(mob_Id)) {
                    const mapNameObj = data_Map[mapId]
                    spawnMapObj.push([mapId, mapNameObj, count])
                }
            })
        })
        obj.spawnMap = spawnMapObj

        setMobInfo(obj)
    }, [])

    const numFormatter = num => Number(num).toLocaleString("en-US")

    return (
        <div className="monster-detail">
            <Container>
                <Row>
                    <Col lg={4}>
                        <div className="mob-stats-card text-center">
                            <Table bordered hover size="lg">
                                <tbody>
                                    <tr>
                                        <th colSpan={2} className="rounded-5">{mobInfo.name}</th>
                                    </tr>
                                    <tr>
                                        <td colSpan={2} className="bg-transparent">
                                            <Image src={mobInfo.imgUrl} fluid className="mw-50" />
                                            <p className="text-danger fw-bold">{mobInfo?.boss ? "BOSS" : ""}</p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>Level : {mobInfo.level}</td>
                                    </tr>
                                    <tr>
                                        <td>EXP : {numFormatter(mobInfo.exp * 3.2)}</td>
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
                                            {decodeElemAttr(mobInfo.elemAttr).map(x => <p className="m-0 ms-5 pe-0 me-0 text-start">{x}</p>)}
                                        </td>
                                    </tr>
                                </tbody>
                            </Table>

                        </div>

                    </Col>
                    <Col lg={8}>
                        <div className="mob-drops-locations-card"></div>
                    </Col>
                </Row>
            </Container>
        </div>

    )
}

function decodeElemAttr(elemAttr) {
    if (!elemAttr || elemAttr === "") return ["No elemental weak/strong/immune"]
    const elemList = { F: 'Fire', I: 'Ice', L: "Lightining", S: "Poison", H: "Holy" }
    let returnStrArr = elemAttr.match(/.{2}/g).map(x => {
        let element = elemList[x[0]]
        let word = x[1] === "2" ? "Take less damage:"
            : x[1] === "3" ? "Take more damage:"
                : x[1] === "1" ? "Immune to:"
                    : "Error elem"
        return `${word} ${element}`
    })
    // console.log(returnStrArr, returnStrArr.length)
    return returnStrArr
}
