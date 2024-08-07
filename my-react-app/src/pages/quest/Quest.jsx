import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { decode } from 'html-entities'
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { filterQuestList, renderImageWithNPCId, updateSearchResultCount } from "./utility.jsx"

import data_Quest from "../../../data/data_Quest.json"
import data_NPC from "../../../data/data_NPC.json"

export default function Quest() {
    const [questLibrary, setQuestLibrary] = useState({})

    useEffect(() => {
        const combined = { ...data_Quest }

        setQuestLibrary(combined)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    // console.log(questLibrary)

    // return 'a'
    return (
        <div className="quest d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/quest" className="">
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
                                            <option value="job">Job</option>
                                            <option value="maple-island">Maple Island</option>
                                            <option value="victoria">Victoria Island</option>
                                            <option value="elnath">Elnath Mt + Aquaroad</option>
                                            <option value="ludus">Ludus Lake</option>
                                            <option value="ellin">Ellin Forest</option>
                                            <option value="leafre">Leafre</option>
                                            <option value="neo-tokyo">Neo Tokyo</option>
                                            <option value="mulung">Mu Lung + Nihal Desert</option>
                                            <option value="masteria">Masteria</option>
                                            <option value="temple">Temple of Time</option>
                                            <option value="party">Party Quest</option>
                                            <option value="world">World Tour</option>
                                            <option value="malaysia">Malaysia</option>
                                            <option value="event">Event</option>
                                            <option value="title">Title</option>
                                            <option value="zakum">Zakum</option>
                                            <option value="hero">Hero with the lost memory</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="type by" data-bs-theme="light" name="typeBy">
                                            <option value="all">ALL</option>
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

            {/* Gacha Items Result */}
            <Table className="mt-3">
                <thead>
                    <tr>
                        <th>NPC</th>
                        <th>Name</th>
                        <th>Quest</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {renderQuestList(filterQuestList(questLibrary))}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(questLibrary, filterQuestList)}
        </div>
    )
}

const renderQuestList = (filteredQuestList) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredQuestList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredQuestList = filteredQuestList.slice(sliceStartIndex, sliceEndIndex)

    console.log(filteredQuestList)
    // return

    return filteredQuestList.map(([quest_id, obj]) =>
        <tr key={quest_id}>
            <td>{renderImageWithNPCId(obj.Check && obj.Check['0'] && obj.Check['0'].npc)}</td>
            <td>{obj.Check && data_NPC[obj.Check['0'].npc].name}</td>
            <td>{obj.QuestInfo && obj.QuestInfo.name}</td>
            <td>{convertAreaCodeToName(obj?.QuestInfo?.area)}</td>
        </tr>
    )
}

const convertAreaCodeToName = (val) => {
    const map = {
        10:	'Job',
        20:	'Maple Island',
        30:	'Victoria Island',
        33:	'Elnath Mt + Aquaroad',
        37:	'Ludus Lake',
        39:	'Ellin Forest',
        41:	'Leafre',
        43: 'Neo Tokyo',
        44:	'Mu Lung + Nihal Desert',
        45:	'Masteria',
        46:	'Temple of Time',
        47:	'Party Quest',
        48:	'World Tour',
        49:	'Malaysia',
        50:	'Event',
        51:	'Title',
        11:	'Hero With The Lost Memory',
        6:	'Zakum',
    }
    return map[val]
}

export const questAction = async ({ request }) => {
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
    const actionUrl = `/quest?page=1&location=${submission.locationBy}&type=${submission.typeBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

