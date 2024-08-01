import { Form, redirect, useSearchParams, Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect, useCallback, useMemo } from "react"
// 
import 'bootstrap-icons/font/bootstrap-icons.css'
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import ListGroup from "react-bootstrap/ListGroup"
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

// 
import { updatePagination } from "../../components/Pagination.jsx"
// import { filterItemList, renderItemList } from "./utility.jsx"
import { renderImageWithItemIdType, renderImageWithMobId, updateSearchResultCount } from '../all/utility.jsx'
import { itemIdToNavUrl } from '../monster/utility.jsx'
import data_Eqp from "../../../data/data_Eqp.json"
import data_Consume from "../../../data/data_Consume.json"
import data_Ins from "../../../data/data_Ins.json"
import data_Etc from "../../../data/data_Etc.json"

import data_mob from "../../../data/data_Mob.json"
import data_MB from "../../../data/data_MB.json"

export default function UnionSearch() {

    const [searchParams] = useSearchParams()
    const { pathname, search } = useLocation();
    const navigate = useNavigate();
    // 
    const [itemLibrary, setItemLibrary] = useState({})          // {id: name, ...}
    const [searchTerm, setSearchTerm] = useState('')  //
    const [selectedItems, setSelectedItems] = useState([])      // ['2000003', '4010001',...]
    const [mobLibrary, setMobLibrary] = useState([])            // [[id, name], ...]
    // 
    const [isFocused, setIsFocused] = useState(false)   // user-mouse-tracking
    const [isMouseInside, setMouseInside] = useState(false);

    useEffect(() => {
        // Eqp/Consume/Ins/Etc
        let newAllItemObj = { ...data_Eqp }
        let tmp = { ...data_Consume, ...data_Ins, ...data_Etc }
        for (let id in tmp) {
            if (!id) continue
            if (!('name' in tmp[id])) continue
            newAllItemObj[id] = tmp[id]['name']
        }
        setItemLibrary(newAllItemObj)  // {id: name,}

        // Mob
        let mobArr = Object.entries(data_mob)
            .map(([id, name]) => [id, name, new Set(data_MB[id])])
        setMobLibrary(mobArr)           // [id, name, hashSet([itemIDs])]

        // extract URL itemId
        // /union-search?page=1&itemId=4010003
        let added = new Set(selectedItems)
        let params = Object.fromEntries([...searchParams.entries()])
        let itemIdStr = params.itemId
        let arr = selectedItems.slice()
        if (itemIdStr) {
            itemIdStr.split(' ').forEach(id => {
                if (added.has(id)) return
                arr.push(id)
            })
        }
        if (!arr.length) arr = ['2000003', '4010001']   // default initial is blue potion + steel ore
        setSelectedItems(arr)

    }, [])

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
        // /union-search?page=1&itemId=4010003
        let itemIdStr = nextSelectedItems.join('+')
        let newSearchStr = search
            ? search.replace(/itemId=(.+)$/, `itemId=${itemIdStr}`)
                .replace(/page=[0-9]*/, 'page=1')
            : `?page=1&itemId=${itemIdStr}`

        if (!nextSelectedItems.length) newSearchStr = ''
        // console.log({pathname, search,searchParams})
        navigate(`${pathname}${newSearchStr}`);
    }

    const handleBlur = () => {
        let searchBar = document.querySelector('#searchBar')
        setTimeout(() => {
            if (document.activeElement == searchBar) return
            if (isMouseInside) return
            setIsFocused(false)
        }, 50);
    };

    const handleFocus = () => {
        setIsFocused(true)
    };


    const handleSearchTermChanged = text => {
        setSearchTerm(text)
    };

    const filteredItems = useMemo(() => {
        return filterItemBySearchTerm(itemLibrary, searchTerm)
    }, [searchTerm])

    const filteredMobs = filterMobBySelectedItem(mobLibrary, selectedItems)


    // console.log(itemLibrary)
    // console.log(selectedItems)
    // console.log(filteredMobs)


    // --------------------------------- RENDERING --------------------------
    return (
        <div className="union-search d-flex flex-column">
            {/* Search input and Button */}
            <Form method="post" action="/union-search">

                <div className="d-flex px-2">
                    <div className="position-relative me-3 flex-fill">
                        {/* Input - Text */}
                        <FormBS.Control
                            type="search"
                            placeholder=" Add new item ..."
                            aria-label="Search"
                            data-bs-theme="light"
                            name="searchTextInput"
                            value={searchTerm}
                            onChange={e => handleSearchTermChanged(e.target.value)}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            id="searchBar"
                        />
                        {/* Live search dropdown */}
                        <div className="position-absolute me-3 top-2 start-1 bg-dark" style={{ zIndex: 10 }}>
                            {isFocused && searchTerm &&
                                renderSearchDropDown(
                                    filteredItems,
                                    itemLibrary,
                                    selectedItems,
                                    handleCardChange,
                                    setMouseInside
                                )}
                        </div>
                    </div>

                    <Button variant="secondary" type="submit" className="w-25">Search</Button>
                </div>

            </Form>

            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

            {/* Row for Selected Item-Card */}
            {renderItemCards(selectedItems, itemLibrary, handleCardChange)}

            {/* Mob Search Result */}
            <Table variant="danger" className="mt-3 table-sm text-center" style={{ borderSpacing: "0px 1rem", borderCollapse: "separate" }} >
                <thead>
                    <tr>
                        {/* <th></th> */}
                        {/* <th></th> */}
                        {/* <th colSpan={3}>Search Results</th> */}
                    </tr>
                </thead>
                <tbody>
                    {renderMobListFromUS(filteredMobs, itemLibrary)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(mobLibrary, filterMobBySelectedItem, selectedItems)}
        </div>

    )
}

const filterItemBySearchTerm = (itemLibrary, searchTerm) => {
    let searchTermArr = searchTerm.toLowerCase().split(' ').filter(Boolean)
    // OR condition for each searchTerm

    let filteredItems = Object.entries(itemLibrary)
        .map(([id, name]) => [id, name.toLowerCase()])
        .filter(([_, name]) => searchTermArr.some(term => name.includes(term)))
        .map(([id, name]) => {
            let matchCount = 0
            searchTermArr.every(term => matchCount += name.includes(term))
            return [id, name, matchCount]
        })
        // sort by most matchCount DESC,  then sort by id ASC
        .sort((a, b) => b[2] - a[2] || a[0] - b[1])
        .slice(0, 20)   // IMPORTANT, setting to infinite CAUSE INFINITE LAG

    return filteredItems
}

const filterMobBySelectedItem = (mobLibrary, selectedItems) => {
    if (!selectedItems || !selectedItems.length) return []
    let filteredMobs = mobLibrary
        .filter(([id, mob, dropSet]) => {
            return selectedItems.every(itemId => dropSet.has(itemId))
        })
        .sort((a, b) => a[0].localeCompare(b[0])) // sort by mobId

    return filteredMobs
}

const renderSearchDropDown = (filteredItems, itemLibrary, selectedItems, handleCardChange, setMouseInside) => {

    const handleCheckBoxChanged = (isChecked, itemId) => {
        if (isChecked) {
            handleCardChange('add', itemId)
        } else {
            handleCardChange('delete', itemId)
        }
        let searchBar = document.querySelector('#searchBar')
        searchBar.focus()
        setMouseInside(true)
    }

    const handleDropDownClick = (e) => {
        // console.log('moving')
        let searchBar = document.querySelector('#searchBar')
        searchBar.focus()
        setMouseInside(true)
    }

    const handleMouseLeave = e => setMouseInside(false)

    let addedSet = new Set(selectedItems)
    const searchBarWidth = document.querySelector('#searchBar').offsetWidth

    return (
        <ListGroup id="DropDownList" style={{ width: searchBarWidth, maxHeight: '45vh' }} className="me-1 overflow-y-scroll bg-black" onMouseMove={handleDropDownClick} onMouseLeave={handleMouseLeave}>
            {filteredItems && filteredItems.map(([itemId, name]) => (
                <ListGroup.Item key={itemId} className="text-secondary mt-1 d-flex align-items-center" style={{backgroundColor:'#fcd4dc'}}>
                    {/* item checkbox */}
                    <span className="ms-2">
                        <FormBS.Check
                            inline
                            type='checkbox'
                            id={`cbox-${itemId}`}
                            defaultChecked={addedSet.has(itemId)}
                            onChange={e => handleCheckBoxChanged(e.target.checked, itemId)}
                        />
                    </span>
                    {/* item Image */}
                    <span className="ms-3 rounded-circle p-2 d-flex justify-content-center align-items-center" style={{ maxWidth: 50, maxHeight: 50, backgroundColor: '#E3A5C7' }}> {renderItemImageWrapper(itemId, itemLibrary)}
                    </span>

                    {/* item name */}
                    <span className="ms-5 text-truncate"> {itemLibrary[itemId]}</span>

                </ListGroup.Item>
            ))}
        </ListGroup>
    )
}

const renderItemCards = (selectedItems, itemLibrary, handleCardChange) => {

    return (
        <div className="card-row mt-3 px-2 d-flex flex-wrap" >
            {/* Clear All button */}
            {selectedItems.length >= 1 && <Button
                className='rounded-circle'
                variant="outline-light"
                // style={{ height: '50px', width: '50px', fontSize: "0.7rem" }}
                style={{ height: '75px', width: '75px' }}
                onClick={e => handleCardChange('clear-all', '')}>
                Clear All
            </Button>}

            {/* each card */}
            {selectedItems.map(itemId => <ItemCard
                key={itemId}
                itemId={itemId}
                handleCardChange={handleCardChange}
                itemLibrary={itemLibrary} />)}
        </div>)
}

const ItemCard = ({ itemId, handleCardChange, itemLibrary }) => {

    const [isHover, setIsHover] = useState(false)

    return (
        <div className="position-relative mx-2 d-flex flex-column align-items-center">
            {/* Image & Trash icon inside ButtonWrapper */}
            <Button
                className='rounded-circle'
                variant=""
                style={{ height: '75px', width: '75px', backgroundColor: isHover ? '#694F8E' : '#E3A5C7', }}
                onMouseEnter={() => setIsHover(true)}
                onMouseLeave={() => setIsHover(false)}
                onClick={e => handleCardChange('delete', itemId)}>
                {/* Trash Icon */}
                <i className="bi bi-x-circle position-absolute top-0 end-0 p-2 text-light"></i>

                {/* Item Image */}
                {renderItemImageWrapper(itemId, itemLibrary)}

            </Button>

            {/* Item name */}
            <p className="fs-6 text-truncate" style={{ maxWidth: 75 }}>{itemLibrary[itemId]}</p>
        </div>)
}

const renderMobListFromUS = (filteredMobs, itemLibrary) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredMobs.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredMobs = filteredMobs.slice(sliceStartIndex, sliceEndIndex)
    // [ [id, name, hash set(dropItemsID) ], ... ...]

    return filteredMobs.map(([mobId, name, dropSet]) =>
        <tr key={mobId} className="text-start" style={{ backgroundColor: '#FFDFD6' }}>
            <td className="p-4 align-middle rounded-start-5">
                {/* Mob Image */}
                <Link to={`/monster/id=${mobId}`}>
                    <div className='rounded-circle p-2 d-flex justify-content-center align-items-center' style={{ height: '75px', width: '75px', backgroundColor: '#E3A5C7' }}>
                        {renderImageWithMobId(mobId)}
                    </div>
                </Link>
            </td>
            <td className="p-4 align-middle"><Link className="text-decoration-none" to={`/monster/id=${mobId}`}>
                {/* Mob Name */}
                <span className="fw-bold" style={{ color: '#694F8E' }}>{name}</span>
            </Link></td>
            <td className="p-4 align-middle rounded-end-5">
                {/* Many Items image */}
                {[...dropSet].map(itemId => <span key={mobId + itemId}>
                    {dropsOverlayWrapperUS(itemId, mobId, itemLibrary)}
                </span>)}
            </td>
        </tr>
    )
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



const dropsOverlayWrapperUS = (itemId, mobId, itemLibrary) => {
    if (!itemId || !mobId) return

    const renderTooltip = (props) => (
        <Tooltip id={`tooltip-${+mobId}`} {...props}>
            {itemLibrary[itemId]}
        </Tooltip>
    );
    return (
        <OverlayTrigger
            key={itemId + mobId}
            placement="top"
            overlay={renderTooltip}
        >
            <Link to={itemIdToNavUrl(itemId)}>
                {renderItemImageWrapper(itemId, itemLibrary)}
            </Link>
        </OverlayTrigger>
    )
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