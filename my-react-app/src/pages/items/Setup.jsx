import { Form, redirect } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"

// 
import { updatePagination } from "../../components/Pagination.jsx"
import { filterItemList, renderItemList } from "./utility.jsx"
import data_Ins from "../../../data/data_Ins.json"

export default function Setup() {
    const [itemLibrary, setItemLibrary] = useState({})

    useEffect(() => {
        setItemLibrary(data_Ins)
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
                        <th>Image</th>
                        <th className="w-25">Name</th>
                        <th>Description</th>
                    </tr>
                </thead>
                <tbody>
                    {renderItemList(filterItemList(itemLibrary), "setup")}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(itemLibrary, filterItemList)}
        </div>

    )
}

export const setupAction = async ({ request }) => {
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
