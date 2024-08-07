import { Form, redirect, useSearchParams, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Image from "react-bootstrap/Image"
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { renderImageWithNPCId } from "../npc/utility.jsx"
import { updateSearchResultCount } from "./utility.jsx"
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

    // console.log(itemLibrary)
    // return "im craft table"

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

            <p>Source : <a href="https://royals.ms/forum/threads/zancks-crafting-guide.214322/" target="_blank">Zancks' Crafting Guide</a></p>

        </div>

    )
}

const filterCraftItemList = (itemLibrary) => {
    const [searchParams] = useSearchParams()

    // If URL has query param, filter ...
    const filterOption = Object.fromEntries([...searchParams.entries()])
    const searchTermArr = filterOption.search?.toLowerCase().split(" ") || ['']

    let filteredItemList = Object.entries(itemLibrary)
    if (searchTermArr.length === 1 && searchTermArr[0] === '') return filteredItemList

    // pre-process, turn all name tolowercase
    filteredItemList = filteredItemList.map(([id, obj]) => {
        // [id, {NPC,NPC_Id,itemId, itemName, materials : obj]
        // materials : [{materialId, materialName, quantity, unitOfMeasure}, {...}] 
        let newObj = {
            ...obj,
            itemName: obj.itemName.toLowerCase()
        }

        let newMaterialObj = obj.materials.map(materialObj => {
            let subObj = { ...materialObj }
            if (subObj.materialName) subObj.materialName = subObj.materialName.toLowerCase()
            return subObj
        })

        newObj['materials'] = newMaterialObj
        return [id, newObj]
    })

    // filter by craft-item-name OR material-item-name
    filteredItemList = filteredItemList
        .filter(([_, { itemName, materials }]) => {
            // check if craft-item name
            if (searchTermArr.some(term => itemName.includes(term))) return true

            // check each material-item name
            return searchTermArr.some(term => materials.some(({ materialName }) => materialName && materialName.includes(term)))
        })
        //sort by itemNameMatchCount, then MaterialNameMatchCount, then by id.
        .map(([id, obj]) => {
            // [id, obj] => [id, obj, craftNameMatchCount, materialNameMatchCount]

            let craftNameMatchCount = 0, materialNameMatchCount = 0
            searchTermArr.forEach(term => craftNameMatchCount += obj.itemName.includes(term))

            // option - 1 : search each term, the more the merrier against each material, score at Max = Infinity
            // option - 2 : seach by each material, score at Max = materials.length
            obj.materials.forEach(({ materialName }) => { // option-2 adopted
                materialNameMatchCount += materialName && searchTermArr.some(term =>
                    materialName.includes(term))
            })

            return [id, obj, craftNameMatchCount, materialNameMatchCount]
        })
        .sort((a, b) => {
            if (a[2] != b[2]) return b[2] - a[2] // by craftNameMatchCount DESC
            if (a[3] != b[3]) return b[3] - a[3] // by materialNameMatchCount DESC
            return a[0] - b[0]                  // by Id ASC
        })
        .map(([id, obj, ...rest]) => {
            // remove side-effect, [id, obj, craftNameMatchCount, materialNameMatchCount] => [id, obj]
            return [id, itemLibrary[id]]
        })

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
            <td className="align-middle">
                {/* Item Image and name */}
                <Link to={itemIdToNavUrl(itemId)}>
                    {renderItemImageWrapper(itemId, itemName)}
                    <p> {itemName}</p>
                </Link>
            </td>
            <td className="py-3 align-middle">
                {/* Materials */}
                <Table striped bordered hover size="sm">
                    <tbody>
                        {materials.map(({ materialId, materialName, quantity, unitOfMeasure }) =>
                            <tr key={itemId + materialId}>
                                <td>
                                    {/* Material Image */}
                                    <Link to={itemIdToNavUrl(materialId)}>
                                        {renderItemImageWrapper(materialId, materialName)}
                                    </Link>
                                </td>
                                <td>
                                    {/* Material Name */}
                                    <Link to={itemIdToNavUrl(materialId)}>
                                        <p> {materialName != null ? materialName : "Mesos"}</p>
                                    </Link>
                                </td>
                                {/* Material Quantity */}
                                <td>{quantity}{unitOfMeasure === 'pcs' ? '' : unitOfMeasure}</td>
                            </tr>

                        )}
                    </tbody>
                </Table>

            </td>
            <td className="align-middle">
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
    if (typeof itemIdToNameDict[id] === 'string') {
        return itemIdToNameDict[id]
    }
    return itemIdToNameDict[id]['name']
}

const renderItemImageWrapper = (itemId, itemName) => {
    if (!itemId || itemId == 'null') {
        // mesos image
        return <Image
            id={`image-${itemId}`}
            src='/images/items/mesos.png'
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
