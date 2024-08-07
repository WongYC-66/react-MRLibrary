import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { filterGachaList, renderImageWithNPCId, updateSearchResultCount } from "./utility.jsx"

export default function NPC() {
    const [npcLibrary, setNPCLibrary] = useState([])

    useEffect(() => {

    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    return (
        <div className="npc d-flex flex-column">
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
                    {/* {renderGachaList(filterGachaList(itemLibrary), itemIdToNameDict)} */}
                </tbody>
            </Table>

            {/* Pagination */}
            {/* {updatePagination(itemLibrary, filterGachaList)} */}
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
    const actionUrl = `/gacha?page=1&location=${submission.locationBy}&type=${submission.typeBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

