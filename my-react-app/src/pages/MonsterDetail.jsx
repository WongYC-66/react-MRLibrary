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


export default function MonsterDetail() {
    const [mobInfo, setMobInfo] = useState({})
    let { mobId } = useParams();

    console.log(mobInfo)

    useEffect(() => {
        const mob_Id = mobId.split("=")[1]
        const obj = {
            ...data_mobStats[mob_Id],
            name: data_mob[mob_Id],
            drops: data_MB[mob_Id]
        }
        setMobInfo(obj)
    }, [])

    return (
        <div className="monster-detail">
            <Container>
                <Row>
                    <Col>
                        <div>${ }</div>

                    </Col>
                    <Col> bbbb </Col>
                </Row>
            </Container>
        </div>

    )
}
