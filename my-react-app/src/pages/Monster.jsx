import { useSearchParams, Form, redirect, useLocation, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Image from "react-bootstrap/Image"
import Pagination from 'react-bootstrap/Pagination';
// 
import data_mob from "../../data/data_Mob.json"
import data_mobStats from "../../data/data_MobStats.json"

export default function Monster() {
    const [searchParams] = useSearchParams()

    useEffect(() => {
        Object.entries(data_mob).forEach(mob => {
            const mobId = mob[0]
            const mobName = mob[1]
            if (data_mobStats.hasOwnProperty(mobId)) {
                data_mobStats[mobId] = { ...data_mobStats[mobId], name: mobName }
            }
        })
    }, [])

    const filterMobList = (data_mobStats) => {
        if (searchParams.size) { // If URL has query param, filter ...
            const filterOption = Object.fromEntries([...searchParams.entries()])
            const searchTerm = filterOption.search.toLowerCase()
            const filter = filterOption.filter
            const order = filterOption.order
            const sort = filterOption.sort

            let returnList = Object.entries(data_mobStats)
                .filter(x => (x[1]?.name?.toLowerCase().includes(searchTerm)))
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
            return sort === "descending" ? returnList.reverse() : returnList
        }
        // No filter at first loading or if URL don't have query param 
        return Object.entries(data_mobStats)
    }

    const renderMobList = (data_mobStats) => {
        const pageNum = Object.fromEntries([...searchParams.entries()]).page || 1
        console.log({pageNum})
        data_mobStats = data_mobStats.slice((pageNum - 1) * 10 , 10)

        console.log(data_mobStats)
        return data_mobStats.map(x => {
            const imgUrl = `https://maplelegends.com/static/images/lib/monster/${x[0].padStart(7, 0)}.png`
            // https://maplelegends.com/static/images/lib/monster/0100100.png
            return (
                <tr key={x[0]}>
                    <td><Image src={imgUrl} fluid alt="Image not found" /></td>
                    <td>{x[1].name}</td>
                    <td>{x[1].level}</td>
                    <td>{x[1].exp}0</td>
                    <td>{x[1].maxHP}</td>
                </tr>
            )
        })
    }

    const updateResult = (data_mobStats) => {
        return renderMobList(filterMobList(data_mobStats))
    }

    const updatePagination = (data_mobStats) => {
        const [searchParams] = useSearchParams()
        const currentPage = Number(Object.fromEntries([...searchParams.entries()])?.page) || 1

        const urlPathname = useLocation().pathname
        const urlSearch = useLocation().search || `?filter=any&order=id&sort=ascending&search=`
        const lastPageIndex = Math.ceil(filterMobList(data_mobStats).length / 10)

        let pageButtonArr = []
        for (let i = -1; i < 4; i++) {
            if (currentPage + i > lastPageIndex) return
            const obj = {
                pathname: `${urlPathname}`,
                search: `?page=${currentPage + i}&${urlSearch.slice(1,)}`,
                text: currentPage + i
            }
            pageButtonArr.push(obj)
        }
        pageButtonArr = pageButtonArr.filter(x => x.text >= 1)
        // console.log({ lastPageIndex, pageButtonArr })

        return (
            <>
                {/* <Pagination.First /> */}
                {pageButtonArr.map(x =>
                    <Pagination.Item href={x.pathname + x.search} key={x.text}>{x.text}</Pagination.Item>
                )}

                {/* <Pagination.Last /> */}
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
                    {updateResult(data_mobStats)}
                </tbody>
            </Table>

            {/* Pagination */}
            <Pagination className="d-flex justify-content-center">
                {updatePagination(data_mobStats)}
            </Pagination>
        </div>

    )
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
