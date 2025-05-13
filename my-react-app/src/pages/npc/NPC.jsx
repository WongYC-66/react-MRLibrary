import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { decode } from 'html-entities'
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { filterNPCList, renderImageWithNPCId, updateSearchResultCount } from "./utility.jsx"
import { convertMapIdToUrl, convertMapIdToName } from "../map/utility.jsx"

import data_NPC from "../../../data/data_NPC.json"
import data_NPCStats from "../../../data/data_NPCStats.json"
import data_Map from "../../../data/data_Map.json"
import data_MapUrl from "../../../data/data_MapUrl.json"

export default function NPC() {
    const [npcLibrary, setNPCLibrary] = useState({})

    useEffect(() => {
        const combined = { ...data_NPC }
        Object.entries(data_NPCStats).forEach(([id, obj]) => {
            if (!(id in combined)) return        // if id not found, skip
            Object.keys(obj).forEach(k => combined[id][k] = obj[k])
        })

        // map location_id to mapObj
        Object.entries(combined).forEach(([id, obj]) => {
            if (!obj.location) return
            const mapArr = []
            Object.values(obj.location).forEach(mapId => {
                mapArr.push([mapId, data_Map[mapId]])
            })
            delete obj.location
            return obj.npcLocation = mapArr
        })

        setNPCLibrary(combined)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    // console.log(npcLibrary)

    return (
        <div className="npc d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/npc" className="">
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
                                            <option value="amoria">Amoria</option>
                                            <option value="ellin">Ellin</option>
                                            <option value="maple-island">Maple Island</option>
                                            <option value="masteria">Masteria</option>
                                            <option value="ossyria">Ossyria</option>
                                            <option value="victoria-island">Victoria Island</option>
                                            <option value="world-tour">World Tour</option>
                                            <option value="other">Other</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="type by" data-bs-theme="light" name="typeBy">
                                            <option value="all">ALL</option>
                                            <option value="beauty">Beauty</option>
                                            <option value="crafter">Crafter</option>
                                            <option value="job">Job</option>
                                            <option value="merchant">Merchant</option>
                                            <option value="pet">Pet</option>
                                            <option value="storage">Storage</option>
                                            <option value="transport">Transport</option>
                                            <option value="wedding">Wedding</option>
                                            <option value="other">Other</option>
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
                        <th>Image</th>
                        <th>Name</th>
                        <th>Function</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {renderNPCList(filterNPCList(npcLibrary))}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(npcLibrary, filterNPCList)}
        </div>
    )
}

const renderNPCList = (filteredNPCList) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredNPCList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredNPCList = filteredNPCList.slice(sliceStartIndex, sliceEndIndex)

    // console.log(filteredNPCList)

    return filteredNPCList.map(([npc_id, obj]) =>
        <tr key={npc_id + obj.name}>
            <td>{renderImageWithNPCId(npc_id)}</td>
            <td>{obj.name}</td>
            <td>{obj.func ? obj.func : ''}</td>
            <td>{obj.npcLocation && obj.npcLocation.length && obj.npcLocation.map(([mapId]) =>
                <Link to={convertMapIdToUrl(mapId)} key={npc_id + mapId} className="d-block">
                    {convertMapIdToName(mapId)}
                </Link>
            )}</td>
        </tr>
    )
}

export const npcAction = async ({ request }) => {
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
    const actionUrl = `/npc?page=1&location=${submission.locationBy}&type=${submission.typeBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

