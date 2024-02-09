import { useSearchParams, Form, redirect, useLocation, NavLink, Link } from "react-router-dom"
import { LinkContainer } from 'react-router-bootstrap'
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Image from "react-bootstrap/Image"
import Pagination from 'react-bootstrap/Pagination';
// 
import data_mob from "../../../data/data_Mob.json"
import data_mobStats from "../../../data/data_MobStats.json"

export default function Monster() {
    const [mobLibrary, setMobLibrary] = useState({})

    useEffect(() => {
        Object.entries(data_mob).forEach(mob => {
            const mobId = mob[0]
            const mobName = mob[1]
            if (data_mobStats.hasOwnProperty(mobId)) {
                data_mobStats[mobId] = { ...data_mobStats[mobId], name: mobName }
            }
        })
        setMobLibrary(data_mobStats)
    }, [])

    const filterMobList = () => {
        const [searchParams] = useSearchParams()
        if (searchParams.size) { // If URL has query param, filter ...
            const filterOption = Object.fromEntries([...searchParams.entries()])
            const searchTerm = filterOption.search.toLowerCase()
            const filter = filterOption.filter
            const order = filterOption.order
            const sort = filterOption.sort

            let filteredMobList = Object.entries(mobLibrary)
                .filter(x => {
                    if (!x[1].hasOwnProperty('name')) return false
                    if (x[1].name.toLowerCase().includes(searchTerm)) return true
                })
                .filter(x => {
                    if (filter === "any") return true
                    if (filter === "boss" && x[1]?.boss === "1") return true
                    if (filter === "monster" && !x[1].hasOwnProperty("boss")) return true
                })
                .sort((a, b) => {
                    // default is ascending, if descend, then reverse upon return
                    if (filter === "id") return Number(a[0] - b[0])
                    return Number(a[1][order]) - Number(b[1][order])
                })
            return sort === "descending" ? filteredMobList.reverse() : filteredMobList
        }
        // No filter at first loading or if URL don't have query param 
        return Object.entries(mobLibrary)
    }

    const renderMobList = (filteredMobList) => {
        const [searchParams] = useSearchParams()
        const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
        const sliceStartIndex = (pageNum - 1) * 10
        const sliceEndIndex = sliceStartIndex + 10
        filteredMobList = filteredMobList.slice(sliceStartIndex, sliceEndIndex)

        return filteredMobList.map(x => {
            const mobId = x[0]
            // const imgUrl = mobIdToImgUrl({ id: mobId, name: x[1].name })
            return (
                <tr key={x[0]}>
                    <td>
                        <Link to={`/monster/id=${mobId}`}>
                            {renderImageWithMobId(mobId)}
                            {/* <Image src={imgUrl} fluid alt="Image not found" /> */}
                        </Link>
                    </td>
                    <td>
                        <Link to={`/monster/id=${mobId}`}>
                            {x[1].name}
                        </Link>
                    </td>
                    <td>{x[1].level}</td>
                    <td>{parseInt(x[1].exp * 3.2)}</td>
                    <td>{x[1].maxHP}</td>
                </tr>
            )
        })
    }

    const updateResult = () => {
        return renderMobList(filterMobList())
    }

    const updatePagination = () => {
        const [searchParams] = useSearchParams()
        const currentPage = Number(Object.fromEntries([...searchParams.entries()]).page) || 1

        const urlPathname = useLocation().pathname
        const urlSearch = useLocation().search || `?filter=any&order=id&sort=ascending&search=`
        const lastPageIndex = Math.ceil(filterMobList(mobLibrary).length / 10)

        let pageButtonArr = []
        for (let i = currentPage - 1; i <= lastPageIndex; i++) {
            const obj = {
                pathname: `${urlPathname}`,
                search: `?page=${i}&${urlSearch.slice(1,).replace(/page=\d+&/, "")}`,
                text: i
            }
            pageButtonArr.push(obj)
        }
        pageButtonArr = pageButtonArr.filter(x => x.text >= 1 && x.text - currentPage <= 3)

        return (
            <>
                <LinkContainer to={{ pathname: urlPathname, search: `?page=1&${urlSearch.slice(1,).replace(/page=\d+&/, "")}` }} key='first'>
                    <Pagination.First className="bg-transparent" style="--bs-bg-opacity: .5;" />
                </LinkContainer>

                {pageButtonArr.map(x =>
                    <LinkContainer to={{ pathname: x.pathname, search: x.search }} key={x.text}>
                        <Pagination.Item className="bg-white">{x.text}</Pagination.Item>
                    </LinkContainer>
                )}

                <LinkContainer to={{ pathname: urlPathname, search: `?page=${lastPageIndex}&${urlSearch.slice(1,).replace(/page=\d+&/, "")}` }} key="last">
                    <Pagination.Last />
                </LinkContainer>
            </>);
    }

    return (
        <div className="monster d-flex flex-column">
            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/monster">

                <Table className="text-center" borderless>
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
                                    <option value="monster">Monster</option>
                                    <option value="boss">Boss</option>
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

            {/* Monster Result */}
            <Table className="mt-5">
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
                    {updateResult()}
                </tbody>
            </Table>

            {/* Pagination */}
            <Pagination className="d-flex justify-content-center">
                {updatePagination()}
            </Pagination>

        </div>

    )
}

const renderImageWithMobId = (mobId) => {
    const ImageComponent = <Image src="abc" id={`image-${mobId}`} fluid alt="Image not found" />

    findGoodImgUrl({ id: mobId }).then(x => {
        // console.log("resolving x , src will be :", x)
        document.getElementById(`image-${mobId}`).src = x
    })

    return ImageComponent
}

import data_fixMobImg from "./data_fixMobImg.json"
const data_MobIdImg = Object.fromEntries(data_fixMobImg.map(x => [Object.keys(x), Object.values(x)]))
const findGoodImgUrl = ({ id }) => {

    // 1. fetch from MapleLegends
    let p1 = new Promise((resolve, reject) => {
        let x = fetch(`https://maplelegends.com/static/images/lib/monster/${id.padStart(7, 0)}.png`, {
            mode: "no-cors"
        })
            .then(res => resolve(`https://maplelegends.com/static/images/lib/monster/${id.padStart(7, 0)}.png`))
            .catch(err => reject(err))
    })

    // 2. fetch from MapleStory.io
    let p2 = new Promise((resolve, reject) => {
        let x = fetch(`https://maplestory.io/api/SEA/198/mob/${id}/render/stand`, {
            mode: "no-cors"
        })
            .then(res => {
                resolve(`https://maplestory.io/api/SEA/198/mob/${id}/render/stand`)
            })
            .catch(err => reject(err))
    })

    // 3. fetch from Maplestory.io , but populated from List of manual record
    let p3 = new Promise((resolve, reject) => {
        let x = data_MobIdImg[id] // {region : xxx , version : xxx , animation : ...}
        if (!x) return
        x = x[0]
        fetch(`https://maplestory.io/api/${x.region}/${x.version}/mob/${id}/render/${x.animation}`, {
            mode: "no-cors"
        })
            .then(res => resolve(`https://maplestory.io/api/${x.region}/${x.version}/mob/${id}/render/${x.animation}`))
            .catch(err => reject(err))
    })
    return Promise.any([p1, p2, p3])
}


export const monsterAction = async ({ request }) => {
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
    const actionUrl = `/monster?page=1&filter=${submission.filterBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}
