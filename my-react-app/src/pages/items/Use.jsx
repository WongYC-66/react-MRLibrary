import { Form, redirect, useSearchParams, Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Accordion from 'react-bootstrap/Accordion';
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { filterUseItemList, updateSearchResultCount, renderImageWithItemId } from "./utility.jsx"
import data_Consume from "../../../data/data_Consume.json"
import data_ItemStats from "../../../data/data_ItemStats.json"

export default function Use() {

    const [searchParams] = useSearchParams()

    const [itemLibrary, setItemLibrary] = useState({})
    const [showingProperty, setShowingProperty] = useState({
        c1: false, c2: false, c3: false, c4: false, c5: false,
        c6: false, c7: false, c8: false, c9: false, c10: false,
        c11: false, c11: false, c12: false, c13: false, c14: false, c15: false,
        c16: false, c17: false, c18: false,
    })

    useEffect(() => {
        Object.entries(data_Consume).forEach(([itemId, obj]) => {
            if (data_ItemStats.hasOwnProperty(itemId)) {
                data_Consume[itemId] = {
                    ...data_Consume[itemId],
                    ...data_ItemStats[itemId],
                    id: itemId,
                }
            }
        })
        setItemLibrary(data_Consume)

        let params = Object.fromEntries([...searchParams.entries()])
        let cboxStr = params.cbox
        // console.log(cboxStr)
        if (cboxStr) {
            let obj = { ...showingProperty }
            let cboxStrArr = cboxStr.match(/c[0-9]+/g)
                .forEach(key => obj[key] = true)
            setShowingProperty(obj)
        }

    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    let propertyKeys = generateKeys(showingProperty)
    // console.log(itemLibrary)
    // console.log(showingProperty)

    // print all unique keys
    // let keys = new Set()
    // Object.entries(itemLibrary).forEach(([id, obj]) => {
    //     Object.keys(obj).forEach(k => keys.add(k))
    // })

    // console.log(keys)
    // for(let k of keys){
    //     let item = Object.entries(itemLibrary).filter(([id, obj]) => obj[k]).slice(0,2)
    //     console.log(k, item)
    // }
    return (
        <div className="use d-flex flex-column">
            {/* Search input and Button */}
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/use">
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
                                            <option value="scroll">Scroll</option>
                                            <option value="potion">Potion</option>
                                            <option value="tp">Return Scroll / TP</option>
                                            <option value="morph">Morphing</option>
                                            <option value="mastery">Mastery Book</option>
                                            <option value="sack">Sack</option>
                                            <option value="mbook">Monster Book Card</option>
                                            <option value="other">Other</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="order by" data-bs-theme="light" name="orderBy">
                                            <option value="id">Id</option>
                                            <option value="hp">Hp recovery</option>
                                            <option value="hpR">Hp recovery %</option>
                                            <option value="mp">Mp recovery</option>
                                            <option value="mpR">Mp recovery %</option>
                                            <option value="pad">potion W.Att</option>
                                            <option value="mad">potion M.Att</option>
                                            <option value="acc">potion Accuracy</option>
                                            <option value="" disabled>------------------------</option>
                                            <option value="incPAD">scroll W.Att</option>
                                            <option value="incMAD">scroll M.Att</option>
                                            <option value="incACC">scroll Accuracy</option>
                                            <option value="incMHP">scroll max Hp</option>
                                            <option value="incSTR">scroll STR</option>
                                            <option value="incDEX">scroll DEX</option>
                                            <option value="incINT">scroll INT</option>
                                            <option value="incLUK">scroll LUK</option>
                                            <option value="incSpeed">scroll Speed</option>
                                            <option value="incJump">scroll Jump</option>
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

                <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

                {/* Accordion of checkboxes */}
                {renderCheckBoxes(showingProperty, setShowingProperty)}

            </Form>

            {/* Item Search Result */}
            <Table className="mt-3 table-sm text-center">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th className="w-25">Name</th>
                        <th>Description</th>
                        {/* optional render */}
                        {propertyKeys.map(k => <th key={k}>{checkboxIdToName[k]}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {renderUseItemList(filterUseItemList(itemLibrary), showingProperty)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(itemLibrary, filterUseItemList)}
        </div>

    )
}

const renderCheckBoxes = (showingProperty, setShowingProperty) => {
    const { pathname, search } = useLocation();
    const navigate = useNavigate();

    const handleCheckboxClick = (val, i) => {
        let key = `c${i}`
        let nextObj = { ...showingProperty, [key]: val }
        setShowingProperty(nextObj)

        // 
        let keysStr = generateKeys(nextObj).join('')
        let newSearchStr = search.replace(/cbox=(c..?)*&/, `cbox=${keysStr}&`)
        // console.log({pathname, search,newSearchStr})
        navigate(`${pathname}${newSearchStr}`, { replace: true });
    }

    return (
        <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
                <Accordion.Header>Property list</Accordion.Header>
                <Accordion.Body>
                    {/* <FormBS> */}
                    {['checkbox'].map((type) => (
                        <div key={`inline-${type}`} className="mb-3">
                            <FormBS.Check inline label={checkboxIdToName['c1']} name="c1" type={type} id={`inline-${type}-1`} checked={showingProperty['c1']} onChange={e => handleCheckboxClick(e.target.checked, 1)} />
                            <FormBS.Check inline label={checkboxIdToName['c2']} name="c2" type={type} id={`inline-${type}-2`} checked={showingProperty['c2']} onChange={e => handleCheckboxClick(e.target.checked, 2)} />
                            <FormBS.Check inline label={checkboxIdToName['c3']} name="c3" type={type} id={`inline-${type}-3`} checked={showingProperty['c3']} onChange={e => handleCheckboxClick(e.target.checked, 3)} />
                            <FormBS.Check inline label={checkboxIdToName['c4']} name="c4" type={type} id={`inline-${type}-4`} checked={showingProperty['c4']} onChange={e => handleCheckboxClick(e.target.checked, 4)} />
                            <FormBS.Check inline label={checkboxIdToName['c5']} name="c5" type={type} id={`inline-${type}-5`} checked={showingProperty['c5']} onChange={e => handleCheckboxClick(e.target.checked, 5)} />
                            <FormBS.Check inline label={checkboxIdToName['c6']} name="c6" type={type} id={`inline-${type}-6`} checked={showingProperty['c6']} onChange={e => handleCheckboxClick(e.target.checked, 6)} />
                            <FormBS.Check inline label={checkboxIdToName['c7']} name="c7" type={type} id={`inline-${type}-7`} checked={showingProperty['c7']} onChange={e => handleCheckboxClick(e.target.checked, 7)} />
                            <FormBS.Check inline label={checkboxIdToName['c8']} name="c8" type={type} id={`inline-${type}-8`} checked={showingProperty['c8']} onChange={e => handleCheckboxClick(e.target.checked, 8)} />
                            <FormBS.Check inline label={checkboxIdToName['c9']} name="c9" type={type} id={`inline-${type}-9`} checked={showingProperty['c9']} onChange={e => handleCheckboxClick(e.target.checked, 9)} />
                            <FormBS.Check inline label={checkboxIdToName['c10']} name="c10" type={type} id={`inline-${type}-10`} checked={showingProperty['c10']} onChange={e => handleCheckboxClick(e.target.checked, 10)} />
                            <FormBS.Check inline label={checkboxIdToName['c11']} name="c11" type={type} id={`inline-${type}-11`} checked={showingProperty['c11']} onChange={e => handleCheckboxClick(e.target.checked, 11)} />
                            <FormBS.Check inline label={checkboxIdToName['c12']} name="c12" type={type} id={`inline-${type}-12`} checked={showingProperty['c12']} onChange={e => handleCheckboxClick(e.target.checked, 12)} />
                            <FormBS.Check inline label={checkboxIdToName['c13']} name="c13" type={type} id={`inline-${type}-13`} checked={showingProperty['c13']} onChange={e => handleCheckboxClick(e.target.checked, 13)} />
                            <FormBS.Check inline label={checkboxIdToName['c14']} name="c14" type={type} id={`inline-${type}-14`} checked={showingProperty['c14']} onChange={e => handleCheckboxClick(e.target.checked, 14)} />
                            <FormBS.Check inline label={checkboxIdToName['c15']} name="c15" type={type} id={`inline-${type}-15`} checked={showingProperty['c15']} onChange={e => handleCheckboxClick(e.target.checked, 15)} />
                            <FormBS.Check inline label={checkboxIdToName['c16']} name="c16" type={type} id={`inline-${type}-16`} checked={showingProperty['c16']} onChange={e => handleCheckboxClick(e.target.checked, 16)} />
                            <FormBS.Check inline label={checkboxIdToName['c17']} name="c17" type={type} id={`inline-${type}-17`} checked={showingProperty['c17']} onChange={e => handleCheckboxClick(e.target.checked, 17)} />
                            <FormBS.Check inline label={checkboxIdToName['c18']} name="c18" type={type} id={`inline-${type}-18`} checked={showingProperty['c18']} onChange={e => handleCheckboxClick(e.target.checked, 18)} />
                        </div>
                    ))}
                    {/* </FormBS> */}
                </Accordion.Body>
            </Accordion.Item>
        </Accordion>
    )
}

export const renderUseItemList = (filteredItemList, showingProperty) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredItemList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredItemList = filteredItemList.slice(sliceStartIndex, sliceEndIndex)
    // [ [itemId, {name : xxxx , desc : xxx, ...} ] , ... ]

    let propertyKeys = generateKeys(showingProperty)


    return filteredItemList.map(([itemId, obj]) =>
        <tr key={itemId}>
            {/* Image */}
            <td>
                <Link to={`/use/id=${itemId}`}>
                    {renderImageWithItemId(itemId, obj.name)}
                </Link>
            </td>
            {/* Name */}
            <td>
                <Link to={`/use/id=${itemId}`}>
                    {obj.name}
                </Link>
            </td>
            {/* Description */}
            <td>
                {obj.desc && obj.desc.split("\\n").map(x =>
                    <p key={x} className="p-0 m-0" dangerouslySetInnerHTML={{ __html: x }}></p>
                )}
            </td>
            {/* optional render bassed on showingProperty */}
            {propertyKeys.map((k, i) =>
                <td key={itemId + k + i}> {obj[cboxIdToItemProperty[k]]} </td>
            )}
        </tr>
    )
}

const checkboxIdToName = {
    c1: 'id',
    c2: 'hp',
    c3: 'hp %',
    c4: 'mp',
    c5: 'mp %',
    c6: 'pot. W.ATT',
    c7: 'pot. M.ATT',
    c8: 'pot. Acc',
    c9: 'scrol W.ATT',
    c10: 'scrol M.ATT',
    c11: 'scrol Acc',
    c12: 'scrol maxhp',
    c13: 'scrol str',
    c14: 'scrol dex',
    c15: 'scrol int',
    c16: 'scrol luk',
    c17: 'scrol spd',
    c18: 'scrol jmp',
}

const cboxIdToItemProperty = {
    c1: 'id',
    c2: 'hp',
    c3: 'hpR',
    c4: 'mp',
    c5: 'mpR',
    c6: 'pad',
    c7: 'mad',
    c8: 'acc',
    c9: 'incPAD',
    c10: 'incMAD',
    c11: 'incACC',
    c12: 'incMHP',
    c13: 'incSTR',
    c14: 'incDEX',
    c15: 'incINT',
    c16: 'incLUK',
    c17: 'incSpeed',
    c18: 'incJump',
}

const generateKeys = (showingProperty) => {
    return Object.keys(showingProperty)
        .filter(k => showingProperty[k] === true)
        .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
}


export const useAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        filterBy: data.get('filterBy'),
        orderBy: data.get('orderBy'),
        sortBy: data.get('sortBy'),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // checkbox query string
    let data2 = Object.fromEntries(data);
    let checkboxStr = ''
    for (let i = 1; i <= 18; i++) { // from c1 - c18    
        let key = `c${i}`
        if (key in data2) checkboxStr += key
    }
    // console.log(checkboxStr)

    // send your post request . ajax
    // ....

    // redirect the user
    // const actionUrl = `/use?page=1&search=${submission.searchName}`
    const actionUrl = `/use?page=1&filter=${submission.filterBy}&order=${submission.orderBy}&sort=${submission.sortBy}&cbox=${checkboxStr}&search=${submission.searchName}`

    return redirect(actionUrl)
}
