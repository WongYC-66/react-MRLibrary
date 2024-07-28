import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { renderImageWithMobId } from "../monster/utility.jsx"

import { filterMobElementalList, updateSearchResultCount } from "./utility.jsx"
import data_mob from "../../../data/data_Mob.json"
import data_mobStats from "../../../data/data_MobStats.json"

export default function ElementalTable() {
    const [mobLibrary, setMobLibrary] = useState({})

    useEffect(() => {
        Object.entries(data_mob).forEach(([mobId, mobName]) => {
            if (data_mobStats.hasOwnProperty(mobId)) {
                data_mobStats[mobId] = { ...data_mobStats[mobId], name: mobName }
            }
        })
        setMobLibrary(data_mobStats)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    // return <>Elemental Table</>

    return (
        <div className="monster d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/elemental-table">
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless >
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Filter</th>
                                    <th className="bg-transparent">Order By</th>
                                    <th className="bg-transparent">Sort</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="filter by" data-bs-theme="light" name="filterBy">
                                            <option value="any">Any</option>
                                            <option value="undead">Undead</option>
                                            <option value="weak-holy">Weak to Holy</option>
                                            <option value="weak-fire">Weak to Fire</option>
                                            <option value="weak-ice">Weak to Ice</option>
                                            <option value="weak-lightning">Weak to Lightning</option>
                                            <option value="weak-poison">Weak to Poison</option>
                                            <option value="immune-holy">Immune to Holy</option>
                                            <option value="immune-fire">Immune to Fire</option>
                                            <option value="immune-ice">Immune to Ice</option>
                                            <option value="immune-lightning">Immune to Lightning</option>
                                            <option value="immune-poison">Immune to Poison</option>
                                            <option value="strong-holy">Strong to Holy</option>
                                            <option value="strong-fire">Strong to Fire</option>
                                            <option value="strong-ice">Strong to Ice</option>
                                            <option value="strong-lightning">Strong to Lightning</option>
                                            <option value="strong-poison">Strong to Poison</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="order by" data-bs-theme="light" name="orderBy">
                                            {/* <option value="id">Id</option> */}
                                            <option value="level">Level</option>
                                            {/* <option value="exp">Exp</option> */}
                                            {/* <option value="maxHP">Hp</option> */}
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="sort by" data-bs-theme="light" name="sortBy">
                                            <option value="ascending">Ascending</option>
                                            <option value="descending">Descending</option>
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
                                <tr className="d-none d-lg-block">
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

            {/* Monster Result */}
            <Table className="mt-3">
                <thead className="sticky-top text-center z-2">
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th> <p>Undead</p> <img src='/images/elemental_table/undead.png'></img>             </th>
                        <th> <p>Holy</p> <img src='/images/elemental_table/holy.png'></img>             </th>
                        <th> <p>Fire</p> <img src='/images/elemental_table/fire.png'></img>             </th>
                        <th> <p>Ice</p> <img src='/images/elemental_table/ice.png'></img>               </th>
                        <th> <p>Lightning</p> <img src='/images/elemental_table/lightning.png'></img>   </th>
                        <th> <p>Poison</p> <img src='/images/elemental_table/poison.png'></img>         </th>
                    </tr>
                </thead>
                <tbody>
                    {renderMobList(filterMobElementalList(mobLibrary))}
                    {/* {renderMobList(mobLibrary)} */}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(mobLibrary, filterMobElementalList)}

        </div>

    )
}

const renderMobList = (filteredMobList) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredMobList.length)
    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredMobList = filteredMobList.slice(sliceStartIndex, sliceEndIndex)
    // [ ["100100", {name: xxx, exp: xxx, maxHP: xxx}], ... ...]


    return filteredMobList.map(([mobId, obj]) =>
        <tr key={mobId} className="text-center">
            <td>
                <Link to={`/monster/id=${mobId}`}>
                    {renderImageWithMobId(mobId)}
                </Link>
            </td>
            <td>
                <Link to={`/monster/id=${mobId}`}>
                    <p dangerouslySetInnerHTML={{ __html: obj.name }}></p>
                </Link>
            </td>
            <td>{obj.level}</td>
            <td>{obj.elemMap.undead}</td>
            <td>{obj.elemMap.holy}</td>
            <td>{obj.elemMap.fire}</td>
            <td>{obj.elemMap.ice}</td>
            <td>{obj.elemMap.lightning}</td>
            <td>{obj.elemMap.poison}</td>
        </tr>

    )
}

export const elementalTableAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        filterBy: data.get('filterBy'),
        orderBy: data.get('orderBy'),
        sortBy: data.get('sortBy'),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/elemental-table?page=1&filter=${submission.filterBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

const numFormatter = num => Number(num).toLocaleString("en-US") // '12345 => 12,345'
