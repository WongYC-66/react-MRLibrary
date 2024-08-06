import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Image from 'react-bootstrap/Image';
import Badge from 'react-bootstrap/Badge';
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { renderImageWithItemIdType, itemIdToNavUrl } from "../monster/utility.jsx"
import { filterGachaList, updateSearchResultCount } from "./utility.jsx"

import data_Gacha from "../../../data/data_Gacha.json"
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"

export default function Gacha() {
    const [itemLibrary, setItemLibrary] = useState([])
    const [itemIdToNameDict, setItemIdToNameDict] = useState({})

    useEffect(() => {

        const newDict = { ...data_Eqp }
        const all = { ...data_Consume, ...data_Ins, ...data_Etc }
        for (let id in all) {
            newDict[id] = all[id].name
        }
        setItemIdToNameDict(newDict)
        setItemLibrary(data_Gacha)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    return (
        <div className="gacha d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/gacha" className="">
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless >
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Location</th>
                                    <th className="bg-transparent">Type</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="location by" data-bs-theme="light" name="locationBy">
                                            <option value="all">ALL</option>
                                            <option value="cbd">CBD</option>
                                            <option value="ellinia">Ellinia</option>
                                            <option value="henesys">Henesys</option>
                                            <option value="kerning-city">Kerning City</option>
                                            <option value="lhc">LHC</option>
                                            <option value="mushroom-shrine">Mushroom Shrine</option>
                                            <option value="nautilus">Nautilus</option>
                                            <option value="nlc">NLC</option>
                                            <option value="perion">Perion</option>
                                            <option value="showa-town">Showa Town</option>
                                            <option value="sleepywood">Sleepywood</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="type by" data-bs-theme="light" name="typeBy">
                                            <option value="all">ALL</option>
                                            <option value="equip">Equip</option>
                                            <option value="scrolls">Scrolls</option>
                                            <option value="other-use">Other Use</option>
                                            <option value="set-up">Set-up</option>
                                            <option value="itcg">iTCG</option>
                                            <option value="quest-etc">Quest-Etc</option>
                                            <option value="stimulators">Stimulators</option>
                                        </FormBS.Select>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                    <div className="col-12 flex-grow-1 d-md-none px-2"><Button onClick={handleAdvancedSearchClick} className="w-100" variant="secondary">Advanced Search</Button></div>

                    <div className="col-lg-6 flex-grow-1">
                        <Table className="text-center my-0" borderless >
                            <thead>
                                <tr className="d-none d-md-block">
                                    <th className="bg-transparent w-100">Name</th>
                                    <th className="bg-transparent"> </th>
                                </tr>
                            </thead>
                            <tbody className="">
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Control
                                            className=""
                                            type="search"
                                            placeholder=" Search ..."
                                            aria-label="Search"
                                            data-bs-theme="light"
                                            name="searchName"
                                        />
                                    </td>
                                    <td className="bg-transparent"><Button variant="secondary" type="submit" className="w-100" >Search</Button></td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                </div>
            </Form>

            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>
            {/* <Image id='location-img' className="d-none img-fluid w-75 mx-auto" rounded /> */}
            <Image id='location-img' src='/images/gacha_map/all.png' className="img-fluid w-75 mx-auto" rounded />

            {/* Gacha Items Result */}
            <Table className="mt-3">
                <thead>
                    <tr>
                        <th>Location</th>
                        <th>Name</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    {renderGachaList(filterGachaList(itemLibrary), itemIdToNameDict)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(itemLibrary, filterGachaList)}

            <p>Source_1 : <a href="https://royals.ms/forum/threads/lets-play-gachapon.110983/" target="_blank">Let's Play Gachapon!</a></p>
            <p>Source_2 : <a href="https://royals.ms/forum/threads/lhc-exchange-rewards-cs-ws-bwg-taru-totem-rewards-found.193830/" target="_blank">LHC exchange rewards</a></p>
            <p>Source_3 : <a href="https://royals.ms/forum/threads/results-from-2575-lhc-totems.195508/" target="_blank">Results from 2575 LHC Totems</a></p>

        </div>
    )
}

const renderGachaList = (filteredItemList, itemIdToNameDict) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredItemList.length)
    updateLocationImage(searchParams.get('location'))

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredItemList = filteredItemList.slice(sliceStartIndex, sliceEndIndex)
    // [  {location: 'Perion', name: 'Beige Umbrella', type: 'Equip'}, ..., ...]
    // return 
    return filteredItemList.map(obj => {
        return (
            <tr key={obj.name + obj.location}>
                <td>{gachaLocationMapping(obj.location)}</td>
                <td>
                    <Link to={itemIdToNavUrl(obj.itemId)}>
                        {renderItemImageWrapper(obj.itemId, itemIdToNameDict)}
                        <span className="mx-3">{obj.name}</span>
                    </Link>
                    {obj["high-value"] && <Badge bg="danger" className="ms-3">High Value!</Badge>}
                </td>
                <td>{gachaTypeMapping(obj.type)}</td>
            </tr>
        )
    })
}

const gachaLocationMapping = (name) => {
    if (!name) return 'location not found'
    switch (name) {
        case 'cbd':
            return 'CBD'
        case 'ellinia':
            return 'Ellinia'
        case 'henesys':
            return 'Henesys'
        case 'kerning-city':
            return 'Kerning City'
        case 'mushroom-shrine':
            return 'Mushroom Shrine'
        case 'nautilus':
            return 'Nautilus'
        case 'nlc':
            return 'NLC'
        case 'perion':
            return 'Perion'
        case 'showa-town':
            return 'Showa Town'
        case 'sleepywood':
            return 'Sleepywood'
        case 'lhc':
            return 'LHC'
    }
}

const gachaTypeMapping = (name) => {
    if (!name) return 'type not found'
    switch (name) {
        case 'equip':
            return 'Equip'
        case 'scrolls':
            return 'Scrolls'
        case 'other-use':
            return 'Other Use'
        case 'set-up':
            return 'Set-Up'
        case 'itcg':
            return 'iTCG'
        case 'quest-etc':
            return 'Quest-Etc'
        case 'stimulators':
            return 'Stimulators'
    }
}

const updateLocationImage = (location) => {
    const imgEl = document.getElementById("location-img")
    if (!imgEl) return

    if (!location) return
    // if(location === 'all' || !location) return imgEl.classList.add("d-none");

    // imgEl.classList.remove("d-none");
    imgEl.setAttribute("src", `/images/gacha_map/${location}.png`)
}


const renderItemImageWrapper = (itemId, itemIdToNameDict) => {
    // renderImageWithItemIdType(itemId, itemName, type)
    // itemId : str
    // type : "equip", "use", "setup", "etc"
    const itemName = itemIdToNameDict[itemId]
    const type = itemId < '2000000'
        ? 'equip' : itemId < '3000000'
            ? 'use' : itemId < '4000000'
                ? 'setup' : 'etc'

    return renderImageWithItemIdType(itemId, itemName, type)
}


export const gachaAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        locationBy: data.get('locationBy'),
        typeBy: data.get('typeBy'),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/gacha?page=1&location=${submission.locationBy}&type=${submission.typeBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

