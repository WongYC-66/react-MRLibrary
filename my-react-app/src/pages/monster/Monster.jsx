import { useSearchParams, Form, redirect, useLocation, NavLink, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { renderImageWithMobId, filterMobList, updateSearchResultCount } from "./utility.jsx"
import { mapCategory, findMapCategoryByMapId } from "../map/utility.jsx"

import data_mob from "../../../data/data_Mob.json"
import data_mobStats from "../../../data/data_MobStats.json"
import data_mapMobCount from "../../../data/data_MapMobCount.json"
import data_mobMap from "../../../data/data_Mob_MapOnly.json"

export default function Monster() {
    const [mobLibrary, setMobLibrary] = useState({})

    useEffect(() => {
        Object.entries(data_mob).forEach(([mobId, mobName]) => {
            if (data_mobStats.hasOwnProperty(mobId)) {
                data_mobStats[mobId] = { ...data_mobStats[mobId], name: mobName }
            }
        })

        // HEAVY CALC MAPPING
        const addMapCategoryToMobStats = () => {
            const mapIdToCategory = {}  //  '100000000' => 'Henesys'

            // data from inside data_MapMobCount (map.wz)
            for (let mapId in data_mapMobCount) {
                if (!(mapId in mapIdToCategory)) {
                    mapIdToCategory[mapId] = findMapCategoryByMapId(mapId)
                }

                Object.keys(data_mapMobCount[mapId]).forEach(mobId => {
                    if (!data_mobStats[mobId]) return
                    if (!data_mobStats[mobId].mapCategory) {
                        data_mobStats[mobId].mapCategory = new Set()
                    }
                    data_mobStats[mobId].mapCategory.add(mapIdToCategory[mapId])
                })
            }

            // there is a problem, boss-type mob not inside data_MapMobCount
            // combine data from monsterbook together then (string.wz)
            // might have bugs for LKC mobs
            for (let mobId in data_mobMap) {
                if (!data_mobStats[mobId]) continue
                data_mobMap[mobId].forEach(mapId => {
                    if (!(mapId in mapIdToCategory)) {
                        mapIdToCategory[mapId] = findMapCategoryByMapId(mapId)
                    }

                    if (!data_mobStats[mobId].mapCategory) {
                        data_mobStats[mobId].mapCategory = new Set()
                    }
                    data_mobStats[mobId].mapCategory.add(mapIdToCategory[mapId])    
                })
            }
        }

        addMapCategoryToMobStats()

        setMobLibrary(data_mobStats)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    const filteredMobList = filterMobList(mobLibrary)

    return (
        <div className="monster d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/monster">
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless >
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Filter</th>
                                    <th className="bg-transparent">Category</th>
                                    <th className="bg-transparent">Order By</th>
                                    <th className="bg-transparent">Sort</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="filter by" data-bs-theme="light" name="filterBy">
                                            <option value="any">Any</option>
                                            <option value="monster">Monster</option>
                                            <option value="boss">Boss</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="category by" data-bs-theme="light" name="categoryBy">
                                            <option value="any">Any</option>
                                            {mapCategory.map(mapName =>
                                                <option key={mapName} value={mapName}>{mapName}</option>
                                            )}
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="order by" data-bs-theme="light" name="orderBy">
                                            <option value="id">Id</option>
                                            <option value="level">Level</option>
                                            <option value="exp">Exp</option>
                                            <option value="maxHP">Hp</option>
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
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Exp</th>
                        <th>Hp</th>
                    </tr>
                </thead>
                <tbody>
                    {renderMobList(filteredMobList)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(filteredMobList)}

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

    // console.log(filteredMobList)

    return filteredMobList.map(x => {
        const mobId = x[0]
        return (
            <tr key={x[0]}>
                <td>
                    <Link to={`/monster/id=${mobId}`}>
                        {renderImageWithMobId(mobId)}
                    </Link>
                </td>
                <td>
                    <Link to={`/monster/id=${mobId}`}>
                        <p dangerouslySetInnerHTML={{ __html: x[1].name }}></p>
                        {/* {x[1].name} */}
                    </Link>
                </td>
                <td>{x[1].level}</td>
                <td>{numFormatter(parseInt(x[1].exp * 3.2))}</td>
                <td>{numFormatter(x[1].maxHP)}</td>
            </tr>
        )
    })
}

export const monsterAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        filterBy: data.get('filterBy'),
        categoryBy: data.get('categoryBy'),
        orderBy: data.get('orderBy'),
        sortBy: data.get('sortBy'),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/monster?page=1&filter=${submission.filterBy}&category=${submission.categoryBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`

    return redirect(actionUrl)
}

const numFormatter = num => Number(num).toLocaleString("en-US")
