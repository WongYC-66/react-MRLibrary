import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import {
    filterMapList,
    RenderImageWithMapId,
    convertMapIdToUrl,
    updateSearchResultCount,
    convertMapIdToName,
    mapCategory,
    generateMapLibrary,
} from "./utility.jsx"

export default function Quest() {
    const [searchParams] = useSearchParams()
    const [mapLibrary, setMapLibrary] = useState({})

    useEffect(() => {
        const generatedLib = generateMapLibrary()
        setMapLibrary(generatedLib)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    // console.log(mapLibrary)
    const filteredMapList = filterMapList({ mapLibrary, searchParams })

    return (
        <div className="quest d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/map" className="">
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless >
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Location</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="location by" data-bs-theme="light" name="locationBy">
                                            <option value='any'>Any</option>
                                            {mapCategory.map(category =>
                                                <option key={category} value={category}>{category} </option>
                                            )}
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
                        <th>Location</th>
                        <th>Name</th>
                    </tr>
                </thead>
                <tbody>
                    {renderMapList(filteredMapList)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(filteredMapList)}
        </div>
    )
}

const renderMapList = (filteredMapList) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredMapList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredMapList = filteredMapList.slice(sliceStartIndex, sliceEndIndex)

    // console.log(filteredMapList)

    return filteredMapList.map(([map_id, obj]) => mapCard(map_id, obj))
}

const mapCard = (map_id, obj) => {

    return (
        <tr key={map_id}>
            <td>
                {obj.myMapCateogry}
            </td>
            <td className="d-flex flex-column">
                {<Link to={convertMapIdToUrl(map_id)}>
                    {convertMapIdToName(map_id)}
                </Link>}

                <div className="mt-auto ms-auto" style={{ maxWidth: '150px' }}>
                    {<Link to={convertMapIdToUrl(map_id)}>
                        <RenderImageWithMapId mapId={map_id} />
                    </Link>}
                </div>
            </td>
        </tr>)

}

export const mapAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        locationBy: data.get('locationBy'),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/map?page=1&location=${submission.locationBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

