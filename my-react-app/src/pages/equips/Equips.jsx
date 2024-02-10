import { Form, redirect, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"

// 
import { filterEquipList, updatePagination, renderEquipList, itemIdToCategory } from "./utility.jsx"
import data_Eqp from "../../../data/data_Eqp.json"
import data_GearStats from "../../../data/data_GearStats.json"

export default function Equips() {
    const [equipLibrary, setEquipLibrary] = useState({})
    const urlPathname = useLocation().pathname
    const isWeapon = urlPathname === "/weapon"

    // console.log(equipLibrary)

    useEffect(() => {
        Object.entries(data_Eqp).forEach(([eqpId, eqpName]) => {
            if (data_GearStats.hasOwnProperty(eqpId)) {
                data_GearStats[eqpId] = {
                    ...data_GearStats[eqpId],
                    name: eqpName,
                    category: itemIdToCategory(eqpId)
                }
            }
        })
        let filtered_data_GearStats = Object.fromEntries(
            Object.entries(data_GearStats)
                .filter(([id, { name }]) => name) // filtered out those without name
                .filter(([id, { category }]) => !category.includes(undefined)) // filtered out those without category/subcategory
        )

        setEquipLibrary(filtered_data_GearStats)
    }, [])

    return (
        <div className="use d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action={`${urlPathname}`}>
                <Table className="text-center" borderless>
                    <thead>
                        <tr>
                            <th className="bg-transparent">Job</th>
                            {isWeapon && <th className="bg-transparent">Category</th>}
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
                            {isWeapon &&
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
                                    {isWeapon && weaponOrderByList.map(({ text, value }) =>
                                        <option key={value} value={value}>{text}</option>
                                    )}

                                    {!isWeapon && armorOrderByList.map(({ text, value }) =>
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

            {/* Item Search Result */}
            <Table className="mt-5 table-sm text-center">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th className="w-25">Name</th>
                        <th>Category</th>
                        <th>Level</th>
                        <th>Speed</th>
                        <th>Attack</th>
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
    const isWeapon = urlPathname === "weapon"

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
    const actionUrl = isWeapon
        ? `?page=1&job=${submission.jobBy}&category=${submission.categoryBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`
        : `?page=1&job=${submission.jobBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`

    return redirect(actionUrl)
}
