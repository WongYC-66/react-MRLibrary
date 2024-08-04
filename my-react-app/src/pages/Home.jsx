import { Form, redirect } from "react-router-dom"
import { useState, useEffect } from "react";
//
import Image from "react-bootstrap/Image"
import FormBS from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { AiFillGithub } from "react-icons/ai";
import Card from 'react-bootstrap/Card';

export default function Home() {

    const [quote, setQuote] = useState({})
    const [itemPrices, setItemPrices] = useState({})


    useEffect(() => {

        const fetchQuote = async () => {
            const url = 'https://famous-quotes4.p.rapidapi.com/random?category=inspirational&count=1';
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '6606d34f47mshecb88aac7233f33p19f723jsn7604c405836b',
                    'x-rapidapi-host': 'famous-quotes4.p.rapidapi.com'
                }
            };

            try {
                const response = await fetch(url, options);
                const result = await response.json();
                setQuote(result[0])
            } catch (error) {
                console.error("update quote failed at ", url);
            }
        }

        const fetchItemPrice = async () => {
            const SHEET_NAME = "Overview"
            const SHEET_ID = "1B3sxmpaW7RGrQAAxAyeR-xS4mdKCTTs_DzgV0qo2p_8"
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:text&sheet=${SHEET_NAME}`;
            try {
                const response = await fetch(url);
                let result = await response.text();
                result = result.replace(`google.visualization.Query.setResponse(`, '')
                    .replace(/\)\;$/, '')
                    .slice(7,)
                result = JSON.parse(result)
                // console.log(result)
                if (result.status === 'ok') {
                    result = result.table.cols[3].label
                }
                // console.log(result)
                result = result.trim().split(" ")
                let prices = {
                    'cs': result[0],
                    'ws': result[1],
                    'apr': result[2],
                    'apple': result[3],
                }
                setItemPrices(prices)
            } catch (error) {
                console.error("update item prices failed at ", url);
            }
        }

        fetchQuote()
        fetchItemPrice()

    }, [])

    return (
        <div className="home text-center">
            <h2 className="display-6">Welcome to </h2>

            <h2 className="display-5 my-3 p-0">MapleRoyals Library (Un-official)</h2>
            <h5 className="my-3 p-0"> Game version : v92 </h5>

            <Form className="d-flex m-5 p-3" method="post" action="/all">
                <FormBS.Control
                    className="p-1 me-3"
                    type="search"
                    placeholder="Global search ..."
                    aria-label="Search"
                    data-bs-theme="light"
                    name="searchName"
                />
                <Button className="w-50" variant="secondary" type="submit">Submit</Button>
            </Form>


            <Image className="w-75" src="/library2.png" />

            {/* Info board */}
            <div className="info-board d-flex flex-wrap justify-content-center align-items-center container-fluid">
                {/* Quote Card */}
                <Card className="m-3 p-3 container-md" style={{maxWidth:"400px"}}>
                    {/* <Card.Header>Quote</Card.Header> */}
                    <Card.Body>
                        <blockquote className="blockquote mb-0">
                            <p>{quote.text ? quote.text : 'loading...'}</p>
                            <footer className="blockquote-footer">
                                <cite title="Source Title">{quote.author ? quote.author : 'loading ...'}</cite>
                            </footer>
                        </blockquote>
                    </Card.Body>
                </Card>

                {/* Price Table */}
                <Table className="m-3 p-5 container-md" style={{maxWidth:"400px"}} striped bordered>
                    <thead>
                        <tr><th colSpan={2}>Today's Price from 
                            <a target="_blank" href="https://docs.google.com/spreadsheets/d/1B3sxmpaW7RGrQAAxAyeR-xS4mdKCTTs_DzgV0qo2p_8/edit?gid=0#gid=0" className="ms-3 text-decoration-none"> Sylafia's</a>
                            </th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Chaos Scroll</td><td> {itemPrices['cs'] || 'loading...'} </td>
                        </tr>
                        <tr>
                            <td>White Scroll</td><td> {itemPrices['ws'] || 'loading...'} </td>
                        </tr>
                        <tr>
                            <td>Ap Reset</td><td> {itemPrices['apr'] || 'loading...'} </td>
                        </tr>
                        <tr>
                            <td>Onyx Apple</td><td> {itemPrices['apple'] || 'loading...'} </td>
                        </tr>
                    </tbody>
                </Table>

            </div>


            <p className="mt-3">Designed and credited to : <a href="https://maplelegends.com/lib/">MapleLegends</a></p>
            <p>This is an unofficial library</p>
            <p>Created by ScottY5C</p>
            <p>Tech Stack : React/Bootstrap/React Router</p>
            <p className="d-flex  align-items-center justify-content-center gap-1">
                <a href="https://anonymous.4open.science/r/react-MRLibrary-36D1/" target="_blank"><AiFillGithub /> </a>
                <span><a href="https://royals.ms/forum/threads/un-official-mapleroyals-library-scottys-version.229606/" target="_blank">Forum Link</a></span>
            </p>
        </div>
    )
}
