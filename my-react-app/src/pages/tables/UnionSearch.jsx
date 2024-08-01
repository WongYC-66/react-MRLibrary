import { Form, redirect, useSearchParams, Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import 'bootstrap-icons/font/bootstrap-icons.css';
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"

// 
import { updatePagination } from "../../components/Pagination.jsx"
// import { filterItemList, renderItemList } from "./utility.jsx"
import { renderImageWithItemIdType } from '../all/utility.jsx'
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"

import data_mob from "../../../data/data_Mob.json"
import data_MB from "../../../data/data_MB.json"

export default function UnionSearch() {

    // url : /union-search?page=1&itemId=2000003+4010001+2000006

    const [searchParams] = useSearchParams()
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    // 
    const [itemLibrary, setItemLibrary] = useState({})          // {id: name, ...}
    const [searchTextInput, setSearchTextInput] = useState('')  //
    const [selectedItems, setSelectedItems] = useState([])      // ['2000003', '4010001',...]
    const [mobLibrary, setMobLibrary] = useState([])            // [[id, name], ...]

    useEffect(() => {
        // 
        let allItems = []
        for (let id in data_Eqp) {
            allItems.push({ id, name: data_Eqp[id] })
        }
        let allDataObj = { ...data_Consume, ...data_Ins, ...data_Etc }
        let newItemLibraryObj = {}
        for (let id in allDataObj) {
            if (!id) continue
            if (!('name' in allDataObj[id])) continue
            newItemLibraryObj[id] = allDataObj[id]['name']
        }
        setItemLibrary(newItemLibraryObj)  // {id: name,}
        // 
        let mobArr = Object.entries(data_mob) // [id, name]
        setMobLibrary(mobArr)
        // 
        let params = Object.fromEntries([...searchParams.entries()])
        let itemIdStr = params.itemId
        let arr = selectedItems.slice()
        if (itemIdStr) {
            itemIdStr.split(' ').forEach(id => arr.push(id))
        }
        // console.log(itemIdStr)
        if (!arr.length) arr = ['2000003', '4010001']   // default initial is blue potion + steel ore
        setSelectedItems(arr)
    }, [])

    const handleSearchTextChange = (text) => {
        setSearchTextInput(text)
    }


    const handleCardChange = (type, itemId) => {
        // handle User Click Checkbox/Remove Card of Items
        let nextSelectedItems = selectedItems.slice()
        if (type == 'clear-all') {
            nextSelectedItems = []
        } else if (type == 'add') {
            nextSelectedItems.push(itemId)
        } else if (type == 'delete') {
            let index = nextSelectedItems.indexOf(itemId)
            nextSelectedItems.splice(index, 1)
        } else {
            console.error('invalid')
            return
        }
        // update State
        setSelectedItems(nextSelectedItems)

        // update url and redirect to it to remember in browser history
        let itemIdStr = nextSelectedItems.join('+')
        let newSearchStr = search.replace(/itemId=(.+)$/, `itemId=${itemIdStr}`)

        if (!nextSelectedItems.length) newSearchStr = ''
        // // console.log({pathname, search,newSearchStr})
        navigate(`${pathname}${newSearchStr}`);
    }



    return (
        <div className="union-search d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action="/union-search">

                <div className="d-flex px-2">
                    <FormBS.Control
                        className="me-3"
                        type="search"
                        placeholder=" Search ..."
                        aria-label="Search"
                        data-bs-theme="light"
                        name="searchTextInput"
                        value={searchTextInput}
                        onChange={e => handleSearchTextChange(e.target.value)}
                    />
                    <Button variant="secondary" type="submit" className="w-50">Search</Button>
                </div>

            </Form>

            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

            {/* Row for Selected Item-Card */}
            {renderItemCards(selectedItems, itemLibrary, handleCardChange)}

            {/* Mob Search Result */}
            <Table className="mt-3 table-sm text-center">
                <thead>
                    <tr>
                        {/* <th>Image</th> */}
                        <th>Search Results:</th>
                        {/* <th className="w-25">Name</th> */}
                        {/* <th>Description</th> */}
                    </tr>
                </thead>
                <tbody>
                    {/* {renderItemList(filterItemList(itemLibrary), "setup")} */}
                    {/* {renderItemList(itemLibrary, "setup")} */}
                </tbody>
            </Table>

            {/* Pagination */}
            {/* {updatePagination(itemLibrary, filterItemList)} */}
        </div>

    )
}

const renderItemCards = (selectedItems, itemLibrary, handleCardChange) => {

    return (
        <div className="card-row mt-3 px-2 d-flex flex-wrap">
            {/* Clear All button */}
            {selectedItems.length >= 1 && <Button
                className='rounded-circle'
                variant="outline-light"
                style={{ height: '75px', width: '75px' }}
                onClick={e => handleCardChange('clear-all', '')}>
                Clear All
            </Button>}

            {/* each card */}
            {selectedItems.map(itemId =>
                <div key={itemId} className="position-relative mx-2 d-flex flex-column align-items-center">
                    {/* Image & Trash icon inside ButtonWrapper */}
                    <Button
                        className='rounded-circle'
                        variant="warning"
                        style={{ height: '75px', width: '75px' }}
                        onClick={e => handleCardChange('delete', itemId)}>
                        {/* Trash Icon */}
                        <i className="bi bi-x-circle position-absolute top-0 end-0 p-2 text-light"></i>

                        {/* Item Image */}
                        {renderItemImageWrapper(itemId, itemLibrary)}

                    </Button>

                    {/* Item name */}
                    <p className="text-truncate">{itemLibrary[itemId]}</p>
                </div>
            )}
        </div>)
}

const renderItemImageWrapper = (itemId, itemLibrary) => {
    // renderImageWithItemIdType(itemId, itemName, type)
    // itemId : str
    // type : "equip", "use", "setup", "etc"
    const itemName = itemLibrary[itemId]
    const type = itemId < '2000000'
        ? 'equip' : itemId < '3000000'
            ? 'use' : itemId < '4000000'
                ? 'setup' : 'etc'

    return renderImageWithItemIdType(itemId, itemName, type)
}

export const unionSearchAction = async ({ request }) => {


    // const data = await request.formData()

    // const submission = {
    //     searchName: data.get('searchName'),
    // }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = window.location.href

    return redirect(actionUrl)

}
