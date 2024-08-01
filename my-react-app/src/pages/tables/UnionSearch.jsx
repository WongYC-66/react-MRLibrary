import { Form, redirect } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"

// 
import { updatePagination } from "../../components/Pagination.jsx"
// import { filterItemList, renderItemList } from "./utility.jsx"
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"

import data_mob from "../../../data/data_Mob.json"

export default function UnionSearch() {
    const [itemLibrary, setItemLibrary] = useState({})
    const [searchTextInput, setSearchTextInput] = useState('')
    const [selectedItems, setSelectedItems] = useState(['2000000', '2000003'])  // default red potion & blue potion
    const [mobLibrary, setMobLibrary] = useState([])

    useEffect(() => {
        // setItemLibrary(data_Ins)
        console.log(data_Eqp)
        console.log(data_Consume)
        console.log(data_Ins)
        console.log(data_Etc)

        let mobArr = Object.entries(data_mob) // [id, name]
        setMobLibrary(mobArr)
    }, [])

    return (
        <div className="use d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action="/setup">

                <div className="d-flex px-2">
                    <FormBS.Control
                        className="me-3"
                        type="search"
                        placeholder=" Search ..."
                        aria-label="Search"
                        data-bs-theme="light"
                        name="searchName"
                    />
                    <Button variant="secondary" type="submit" className="w-50">Search</Button>
                </div>

            </Form>

            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

            {/* Item Search Result */}
            <Table className="mt-3 table-sm text-center">
                <thead>
                    <tr>
                        {/* <th>Image</th> */}
                        <th>Search Results:</th>
                        {/* <th className="w-25">Name</th> */}
                        {/* <th>Description</th> */}
                    </tr>
                </thead>
                <tbody>
                    {/* {renderItemList(filterItemList(itemLibrary), "setup")} */}
                    {/* {renderItemList(itemLibrary, "setup")} */}
                </tbody>
            </Table>

            {/* Pagination */}
            {/* {updatePagination(itemLibrary, filterItemList)} */}
        </div>

    )
}

export const unionSearchAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/setup?page=1&search=${submission.searchName}`
    return redirect(actionUrl)
}
