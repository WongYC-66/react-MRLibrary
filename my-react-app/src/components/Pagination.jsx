import { useSearchParams, useLocation } from "react-router-dom"
import { LinkContainer } from 'react-router-bootstrap'
import { useCallback } from "react"
// 
import Pagination from "react-bootstrap/Pagination"

export const updatePagination = (library, filterLibraryFunction, ...para) => {
    const [searchParams] = useSearchParams()
    const urlSearch = useLocation().search
    const currentPage = Number(Object.fromEntries([...searchParams.entries()]).page) || 1

    const urlPathname = useLocation().pathname
    const lastPageIndex = Math.ceil(filterLibraryFunction(library, ...para).length / 10)
    
    const generateSearchString = (inputNumber) => {
        const queryParaCount = searchParams.size
        // console.log(urlSearch)
        if(queryParaCount >= 1) return urlSearch.replace(/\?page=\d+/, (...para) => {
            // console.log({para})
            return `?page=${inputNumber}`
        })
        // else when URL:query has nothing. It is initial loading, render the button with URL of:
        if (urlPathname === "/all") {
            return `?page=${inputNumber}&search=`
        }
        if (urlPathname === "/weapon") {
            return `?page=${inputNumber}&job=0&category=any&order=id&sort=ascending&search=`
        }
        if (["/hat", "/top", "/bottom", "/overall", "/shoes", "/gloves", "/cape", "/shield", "/faceacc", "/eyeacc", "/earring", "/ring", "/pendant", "/belt", "/medal"].includes(urlPathname)) {
            return `?page=${inputNumber}&job=0&order=id&sort=ascending&search=`
        }
        if (urlPathname === "/monster") {
            return `?page=${inputNumber}&filter=any&order=id&sort=ascending&search=`
        }
        if (urlPathname === "/use") {
            return `?page=${inputNumber}&filter=any&order=id&sort=ascending&cbox=&search=`
        }

        // if (["/use", "/setup", "/etc"].includes(urlPathname)) {
        if (["/setup", "/etc"].includes(urlPathname)) {
            return `?page=${inputNumber}&search=`
        }
        if (urlPathname === "/gacha") {
            return `?page=${inputNumber}&location=all&type=all&search=`
        }
        if (urlPathname === "/elemental-table") {
            return `?page=${inputNumber}&filter=any&order=level&sort=ascending&search=`
        }
        if (urlPathname === "/skill") {
            return `?page=${inputNumber}&filter=any&order=id&sort=ascending&search=`
        }
        if (urlPathname === "/union-search") {
            return `?page=${inputNumber}&itemId=`
        }
    }

    const RemovePaginationActiveAttribute = useCallback(() => {
        new Promise((resolve, reject) => {
            setTimeout(() => resolve(""), 100)
        }).then(x => {
            document.getElementById("paginationGroup")
                .querySelectorAll("li").forEach(x => {
                    if (x.classList.contains("current")) return // if page item = query page number. Make it active
                    x.classList.remove("active") // else remove the active class tag
                })
        })
    }, [])

    let pageButtonArr = []
    for (let i = currentPage - 1; i <= lastPageIndex; i++) {
        const obj = {
            pathname: `${urlPathname}`,
            // search: `?page=${i}&${urlSearch.slice(1,).replace(/page=\d+&/, "")}`,
            search: generateSearchString(i),
            text: i
        }
        pageButtonArr.push(obj)
    }
    pageButtonArr = pageButtonArr.filter(x => x.text >= 1 && x.text - currentPage <= 2)

    RemovePaginationActiveAttribute()


    return (
        <Pagination id="paginationGroup" className="d-flex justify-content-center">

            <LinkContainer to={{ pathname: urlPathname, search: generateSearchString(1) }} key='first'>
                <Pagination.First className="bg-transparent" style="--bs-bg-opacity: .5;" />
            </LinkContainer>

            {pageButtonArr.map(x =>
                <LinkContainer to={{ pathname: x.pathname, search: x.search }} key={x.text}>
                    <Pagination.Item className={`bg-white ${x.text === currentPage && "current"}`}>{x.text}</Pagination.Item>
                </LinkContainer>
            )}

            <LinkContainer to={{ pathname: urlPathname, search: generateSearchString(lastPageIndex) }} key="last">
                <Pagination.Last />
            </LinkContainer>
        </Pagination>
    );
}