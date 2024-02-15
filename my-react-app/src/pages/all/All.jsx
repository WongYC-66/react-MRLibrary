import { Form, redirect, useSearchParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import {
    filterGlobalList,
    updateSearchResultCount,
    renderImageWithItemIdType,
    renderImageWithMobId,
    itemIdToNavUrl,
} from "./utility.jsx"
import { updatePagination } from "../../components/Pagination.jsx"
import data_mob from "../../../data/data_Mob.json"
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"

export default function All() {
    const [searchParams] = useSearchParams()
    const [globalLibrary, setGlobalLibrary] = useState([])
    const searchTerm = Object.fromEntries([...searchParams.entries()]).search.toLowerCase()
    // console.log(globalLibrary)

    useEffect(() => {
        const globalArr = []
        // [ { id : xxx, name: xxx, type: xxx }, ... ...]
        // combining data_mob / data_Consume / data_Ins / data_Etc / data_Eqp into 1 library
        Object.entries(data_mob).forEach(([id, name]) =>
            id && name && globalArr.push( //if id and name both exists, push an obj
                {
                    id,
                    name,
                    type: "monster"
                }
            ))
        Object.entries(data_Eqp).forEach(([id, name]) =>
            id && name && globalArr.push( //if id and name both exists, push an obj
                {
                    id,
                    name,
                    type: "equip"
                }
            ))
        Object.entries(data_Consume).forEach(([id, { name }]) =>
            id && name && globalArr.push( //if id and name both exists, push an obj
                {
                    id,
                    name,
                    type: "use"
                }
            ))
        Object.entries(data_Ins).forEach(([id, { name }]) =>
            id && name && globalArr.push( //if id and name both exists, push an obj
                {
                    id,
                    name,
                    type: "setup"
                }
            ))
        Object.entries(data_Etc).forEach(([id, { name }]) =>
            id && name && globalArr.push( //if id and name both exists, push an obj
                {
                    id,
                    name,
                    type: "etc"
                }
            ))

        setGlobalLibrary(globalArr)
    }, [])

    return (
        <div className="use d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action="/all">

                <div className="d-flex px-2">
                    <FormBS.Control
                        id="allInput"
                        className="me-3"
                        type="search"
                        placeholder=" Search ..."
                        aria-label="Search"
                        data-bs-theme="light"
                        name="searchName"
                        defaultValue={searchTerm}
                    />
                    <Button variant="secondary" type="submit" className="w-50">Search</Button>
                </div>

            </Form>

            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

            {/* Item Search Result */}
            <Table className="mt-3 table-sm text-center align-middle">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th className="w-50" >Name</th>
                        <th className="w-25">Type</th>
                    </tr>
                </thead>
                <tbody>
                    { renderGlobalList(filterGlobalList(globalLibrary)) }
                </tbody>
            </Table>

            {/* Pagination */}
            { updatePagination(globalLibrary, filterGlobalList) }
        </div>

    )
}

export const renderGlobalList = (filteredGlobalList) => {
    const [searchParams] = useSearchParams()
    
    updateSearchResultCount(filteredGlobalList.length)
    
    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredGlobalList = filteredGlobalList.slice(sliceStartIndex, sliceEndIndex)
    // [ { id : xxx, name: xxx, type: monster/etc/equip }] , {} , {} , ... ]

    return filteredGlobalList?.map(({ id, name, type }) => {
        const navUrl = type === "monster" ? `/monster/id=${id}` : itemIdToNavUrl(id)
        return (
            <tr key={id}>
                <td>
                    <Link to={`${navUrl}`}>
                        {type === "monster" && renderImageWithMobId(id)}
                        {type !== "monster" && renderImageWithItemIdType(id, name, type)}
                    </Link>
                </td>
                <td>
                    <Link to={`${navUrl}`}>
                        {name}
                    </Link>
                </td>
                <td>
                    {type.slice(0, 1).toUpperCase() + type.slice(1,)}
                </td>
            </tr>
        )
    })
}


export const globalSearchAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // clear rootlayout input
    document.getElementById("globalInput").value = ""
    document.activeElement.blur()
    // set all.jsx input
    const input = document.getElementById("allInput")
    if(input) input.value = submission.searchName

    // redirect the user
    const actionUrl = `/all?page=1&search=${submission.searchName}`
    return redirect(actionUrl)
}