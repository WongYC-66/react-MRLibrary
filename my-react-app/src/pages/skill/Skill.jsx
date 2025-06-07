import { useSearchParams, Form, redirect, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { generateSkillLibrary, filterSkillList, renderImageWithSkillId, updateSearchResultCount, skillIdToJobString } from "./utility.jsx"

export default function ElementalTable() {
    const [searchParams] = useSearchParams()
    const [skillLibrary, setSkillLibrary] = useState({})

    useEffect(() => {
        const generatedLibrary = generateSkillLibrary()
        setSkillLibrary(generatedLibrary)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    const filteredSkillList = filterSkillList({skillLibrary, searchParams})

    return (
        <div className="monster d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/skill">
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless >
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Filter</th>
                                    <th className="bg-transparent">Order</th>
                                    <th className="bg-transparent">Sort</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="filter by" data-bs-theme="light" name="filterBy">
                                            <option value="any">Any</option>
                                            <option value="beginner">Beginner</option>
                                            <option value="special">Special</option>
                                            <option value="" disabled>-----------------------------------------------</option>
                                            <option value="swordman">Swordman</option>
                                            <option value="hero">Fighter / Crusader / Hero </option>
                                            <option value="pal">Page / White Knight / Paladin </option>
                                            <option value="dk">Spearman / Dragon Knight / Dark Knight </option>
                                            <option value="" disabled>-----------------------------------------------</option>
                                            <option value="magician">Magician</option>
                                            <option value="fp">F/P Wizard / Mage / Arch Mage </option>
                                            <option value="il">I/L Wizard / Mage / Arch Mage </option>
                                            <option value="bishop">Cleric / Priest / Bishop </option>
                                            <option value="" disabled>-----------------------------------------------</option>
                                            <option value="archer">Archer</option>
                                            <option value="bm">Hunter / Ranger / Bow Master </option>
                                            <option value="mm">Crossbowman / Sniper / Marksman </option>
                                            <option value="" disabled>-----------------------------------------------</option>
                                            <option value="rogue">Rogue</option>
                                            <option value="nl">Assassin / Hermit / Night Lord </option>
                                            <option value="shad">Bandit / Chief Bandit / Shadower </option>
                                            <option value="" disabled>-----------------------------------------------</option>
                                            <option value="pirate">Pirate</option>
                                            <option value="bucc">Brawler / Marauder / Buccaneer </option>
                                            <option value="sair">Gunslinger / Outlaw / Corsair </option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="order by" data-bs-theme="light" name="orderBy">
                                            <option value="id">Id</option>
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
                        <th>Description</th>
                        <th>Job</th>
                    </tr>
                </thead>
                <tbody>
                    {renderSkillList(filteredSkillList)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(filteredSkillList)}

        </div>

    )
}

const renderSkillList = (filteredSkillList) => {
    const [searchParams] = useSearchParams()
    // console.log(filteredSkillList)

    updateSearchResultCount(filteredSkillList.length)
    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredSkillList = filteredSkillList.slice(sliceStartIndex, sliceEndIndex)
    // [ ["100100", {name: xxx, exp: xxx, maxHP: xxx}], ... ...]
    // return 
    return filteredSkillList.map(([skill_id, obj]) =>
        <tr key={skill_id} className="text-center">
            <td>
                <Link to={`/skill/id=${skill_id}`}>
                    {renderImageWithSkillId(skill_id)}
                </Link>
            </td>
            <td>
                <Link to={`/skill/id=${skill_id}`}>
                    <p dangerouslySetInnerHTML={{ __html: obj.name }}></p>
                </Link>
            </td>
            <td>
                {obj.desc.split('\\n').map((str, i) => {
                    // place "#cImportant Text#" into "<span>Important Text</span>"
                    str = str.replace(/\#c(.*)#/, `<span class='text-warning fw-bolder'>$1</span>`)
                    return <p key={skill_id + i} className="my-0" dangerouslySetInnerHTML={{ __html: str }}></p>
                })}
            </td>
            <td>{skillIdToJobString(skill_id)}</td>
        </tr>

    )
}

export const skillAction = async ({ request }) => {
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
    const actionUrl = `/skill?page=1&filter=${submission.filterBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

const numFormatter = num => Number(num).toLocaleString("en-US") // '12345 => 12,345'
