import { Form, redirect, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"

// 
import { updatePagination } from "../../components/Pagination.jsx"
import { filterEquipList, renderEquipList, equipIdToCategory } from "./utility.jsx"
import data_Eqp from "../../../data/data_Eqp.json"
import data_GearStats from "../../../data/data_GearStats.json"

export default function Equips() {
    const [equipLibrary, setEquipLibrary] = useState({})
    const urlPathname = useLocation().pathname
    const isWeaponPage = urlPathname === "/weapon"

    // console.log(equipLibrary)

    useEffect(() => {
        Object.entries(data_Eqp).forEach(([eqpId, eqpName]) => {
            if (data_GearStats.hasOwnProperty(eqpId)) {
                data_GearStats[eqpId] = {
                    ...data_GearStats[eqpId],
                    name: eqpName,
                    category: equipIdToCategory(eqpId)
                }
            }
        })
        let filtered_data_GearStats = Object.fromEntries(
            Object.entries(data_GearStats)
                .filter(([_id, { name }]) => name) // filtered out those without name
                .filter(([_id, { category }]) => !category.includes(undefined)) // filtered out those without category/subcategory
        )

        setEquipLibrary(filtered_data_GearStats)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    return (
        <div className="use d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action={`${urlPathname}`}>
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless>
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Job</th>
                                    {isWeaponPage && <th className="bg-transparent">Category</th>}
                                    <th className="bg-transparent">Order By</th>
                                    <th className="bg-transparent">Sort</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    {/* Job dropdown */}
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="filter job by" data-bs-theme="light" name="jobBy">
                                            <option value="0">Any</option>
                                            <option value="1">Warrior</option>
                                            <option value="2">Magician</option>
                                            <option value="4">Archer</option>
                                            <option value="8">Thief</option>
                                            <option value="16">Pirate</option>
                                            <option value="-1">Beginner</option>
                                        </FormBS.Select>
                                    </td>

                                    {/* Category dropdown */}
                                    {isWeaponPage &&
                                        < td className="bg-transparent">
                                            <FormBS.Select aria-label="category by" data-bs-theme="light" name="categoryBy">
                                                {weaponCategoryList.map(({ text, value }) =>
                                                    <option key={value} value={value}>{text}</option>
                                                )}
                                            </FormBS.Select>
                                        </td>
                                    }

                                    {/* Order By dropdown */}
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="order by" data-bs-theme="light" name="orderBy">
                                            {isWeaponPage && weaponOrderByList.map(({ text, value }) =>
                                                <option key={value} value={value}>{text}</option>
                                            )}

                                            {!isWeaponPage && armorOrderByList.map(({ text, value }) =>
                                                <option key={value} value={value}>{text}</option>
                                            )}
                                        </FormBS.Select>
                                    </td>

                                    {/* Sort dropdown */}
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

            {/* Item Search Result */}
            <Table className="mt-3 table-sm text-center">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th className="w-25">Name</th>
                        {isWeaponPage && <th>Category</th>}
                        <th>Level</th>
                        {isWeaponPage && <th>Speed</th>}
                        {isWeaponPage && <th>Attack</th>}
                        <th>Slots</th>
                    </tr>
                </thead>
                <tbody>
                    {renderEquipList(filterEquipList(equipLibrary), `${urlPathname.slice(1,)}`)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(equipLibrary, filterEquipList)}
        </div >

    )
}

const weaponCategoryList = [
    { text: "Any", value: "any" },
    { text: "One Handed Sword", value: "OHSword" },
    { text: "One Handed Axe", value: "OHAxe" },
    { text: "One Handed Mace", value: "OHMace" },
    { text: "Dagger", value: "dagger" },
    { text: "Wand", value: "wand" },
    { text: "Staff", value: "staff" },
    { text: "Two Handed Sword", value: "THSword" },
    { text: "Two Handed Axe", value: "THAxe" },
    { text: "Two Handed Mace", value: "THMace" },
    { text: "Spear", value: "spear" },
    { text: "Polearm", value: "polearm" },
    { text: "Bow", value: "bow" },
    { text: "Crossbow", value: "crossbow" },
    { text: "Claw", value: "claw" },
    { text: "Knuckle", value: "knuckle" },
    { text: "Gun", value: "gun" }
]

const weaponOrderByList = [
    { text: "ID", value: "id" },
    { text: "Level", value: "reqLevel" },
    { text: "W.Attack", value: "incPAD" },
    { text: "M.Attack", value: "incMAD" },
    { text: "Attack Speed", value: "attackSpeed" },
    { text: "Slots", value: "tuc" }
]

const armorOrderByList = [
    ...weaponOrderByList.slice(0, 4),
    { text: "HP", value: "incMHP" },
    { text: "MP", value: "incMMP" },
    { text: "STR", value: "incSTR" },
    { text: "DEX", value: "incDEX" },
    { text: "INT", value: "incINT" },
    { text: "LUK", value: "intLUK" },
    { text: "W.def", value: "incPDD" },
    { text: "M.def", value: "incMDD" },
    { text: "Accuracy", value: "incACC" },
    { text: "Avoidability", value: "incEVA" },
    { text: "Slots", value: "tuc" }
]

export const equipsAction = async ({ request }) => {
    const data = await request.formData()
    const urlPathname = request.url.split("/").pop()
    const isWeaponPage = urlPathname === "weapon"

    const submission = {
        jobBy: data.get("jobBy"),
        categoryBy: data.get("categoryBy"),
        orderBy: data.get("orderBy"),
        sortBy: data.get("sortBy"),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = isWeaponPage
        ? `?page=1&job=${submission.jobBy}&category=${submission.categoryBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`
        : `?page=1&job=${submission.jobBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`

    return redirect(actionUrl)
}
