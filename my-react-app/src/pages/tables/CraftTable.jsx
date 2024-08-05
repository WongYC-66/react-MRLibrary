import { Form, redirect, useSearchParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Image from "react-bootstrap/Image"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { renderImageWithNPCId, updateSearchResultCount } from "./utility.jsx"
import { renderImageWithItemIdType } from "../all/utility.jsx"
import { itemIdToNavUrl } from '../monster/utility.jsx'

import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"
import data_Crafting from "../../../data/data_Crafting.json"

export default function CraftTable() {
    const [itemLibrary, setItemLibrary] = useState({})

    useEffect(() => {

        let craft_Library_Map = {}  // {id : {itemId, itemName, NPC, NPC_Id, materials: [{materialId, materialName, quantity, unitOfMeasure}, ...] }

        // itemName & materialName might be wrong, need to rematch
        // simplify the recipe, remove NPC/NPC_ID/itemId/itemName to parent property
        data_Crafting.forEach(({ itemId, materialId, quantity, unitOfMeasure, NPC, NPC_Id }) => {
            if (!(itemId in craft_Library_Map)) {
                // initialise craftItem if first see
                craft_Library_Map[itemId] = {
                    itemId,
                    itemName: convertItemIdToName(itemId),
                    materials: [],
                    NPC,    // name 
                    NPC_Id
                }
            }
            // add each material into materials Array
            craft_Library_Map[itemId]['materials'].push({
                materialId,
                materialName: convertItemIdToName(materialId),
                quantity,
                unitOfMeasure
            })
        })

        setItemLibrary(craft_Library_Map)
    }, [])

    console.log(itemLibrary)

    return (
        <div className="use d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action="/craft-table">

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
                        <th>Item</th>
                        <th>Materials</th>
                        <th className="w-25">NPC</th>
                    </tr>
                </thead>
                <tbody>
                    {renderItemList(filterCraftItemList(itemLibrary))}
                </tbody>
            </Table>

            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

            {/* Pagination */}
            {updatePagination(itemLibrary, filterCraftItemList)}
        </div>

    )
}

const filterCraftItemList = (itemLibrary) => {
    const [searchParams] = useSearchParams()

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search?.toLowerCase().split(" ") || ['']

    let filteredItemList = Object.entries(itemLibrary)

    return filteredItemList
}

const renderItemList = (filteredItemList) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredItemList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredItemList = filteredItemList.slice(sliceStartIndex, sliceEndIndex)
    // [ itemId : {itemName, NPC, NPC_Id,  materials :[{materialId, materialName, quantity, unitOfMeasure}, ...] }, ...]

    return filteredItemList.map(([itemId, { itemName, NPC, NPC_Id, materials }]) =>
        <tr key={itemId}>
            <td>
                {/* Item Image and name */}
                <Link to={itemIdToNavUrl(itemId)}>
                    {renderItemImageWrapper(itemId, itemName)}
                    <p> {itemName}</p>
                </Link>
            </td>
            <td>
                {/* Materials */}
                <Table striped bordered hover size="sm">
                    <tbody>
                        {materials.map(({ materialId, materialName, quantity, unitOfMeasure }) =>
                            <tr key={itemId + materialId}>
                                <td>
                                    <Link to={itemIdToNavUrl(materialId)}>
                                        {renderItemImageWrapper(materialId, materialName)}
                                    </Link>
                                </td>
                                <td>
                                    <Link to={itemIdToNavUrl(materialId)}>
                                        <p> {materialName != null ? materialName : "Mesos"}</p>
                                    </Link>
                                </td>

                                <td>{quantity}{unitOfMeasure === 'pcs' ? '' : unitOfMeasure}</td>
                            </tr>

                        )}
                    </tbody>
                </Table>

            </td>
            <td>
                {/* NPC */}
                {renderImageWithNPCId(NPC_Id)}
                <p className="text-wrap">{NPC}</p>
            </td>
        </tr>
    )
}


export const itemIdToNameDict = {
    ...data_Eqp,
    ...data_Consume,
    ...data_Ins,
    ...data_Etc,
}

export const convertItemIdToName = (id) => {   // helper fn
    if (id == 'null') return null
    // 'null' = mesos
    if (typeof itemIdToNameDict[id] == 'string') {
        return itemIdToNameDict[id]
    }
    return itemIdToNameDict[id]['name']
}

const renderItemImageWrapper = (itemId, itemName) => {
    if (!itemId || itemId == 'null') {
        // mesos image
        return <Image
            id={`image-${itemId}`}
            src= '/images/items/mesos.png'
            className="mw-50"
            fluid
            alt="Image not found" />
    }

    const type = itemId < '2000000'
        ? 'equip' : itemId < '3000000'
            ? 'use' : itemId < '4000000'
                ? 'setup' : 'etc'

    return renderImageWithItemIdType(itemId, itemName, type)
}


export const craftTableAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/craft-table?page=1&search=${submission.searchName}`
    return redirect(actionUrl)
}
