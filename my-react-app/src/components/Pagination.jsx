import { useSearchParams, useLocation } from "react-router-dom"
import { useNavigate } from "react-router"
import { useState } from "react"
// 
import Pagination from "react-bootstrap/Pagination"
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/Button"

export const updatePagination = (data, ...para) => {
    const [searchParams] = useSearchParams();
    const { search: urlSearch, pathname: urlPathname } = useLocation();
    const navigate = useNavigate();

    const [paginationBarStatus, setPaginationBarStatus] = useState({
        isNext: true,
        toShow: false
    });  // OffCanvas to skip pages <...>

    const currentPage = getCurrentPage(searchParams)

    const lastPageIndex = Math.ceil(data.length / 10)

    const generateQueryString = (inputNumber) => {
        const queryParaCount = searchParams.size
        // just replace url query string with new page number
        if (queryParaCount >= 1) return urlSearch.replace(/\?page=\d+/, (...para) => {
            return `?page=${inputNumber}`
        })
        // --------------------------------------------------------------------
        // else when URL:query has nothing. It is initial loading, render the button with URL of:
        if (urlPathname === "/all") {
            return `?page=${inputNumber}&search=`
        }
        if (urlPathname === "/weapon") {
            return `?page=${inputNumber}&job=0&category=any&order=id&sort=ascending&cosmetic=null&search=`
        }
        if (["/hat", "/top", "/bottom", "/overall", "/shoes", "/gloves", "/cape", "/shield", "/faceacc", "/eyeacc", "/earring", "/ring", "/pendant", "/belt", "/medal"].includes(urlPathname)) {
            return `?page=${inputNumber}&job=0&order=id&sort=ascending&cosmetic=null&search=`
        }
        if (urlPathname === "/monster") {
            return `?page=${inputNumber}&filter=any&category=any&order=id&sort=ascending&search=`
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
            return `?page=${inputNumber}&filter=any&category=any&order=level&sort=ascending&search=`
        }
        if (urlPathname === "/skill") {
            return `?page=${inputNumber}&filter=any&order=id&sort=ascending&search=`
        }
        if (urlPathname === "/union-search") {
            return `?page=${inputNumber}&itemId=`
        }
        if (urlPathname === "/craft-table") {
            return `?page=${inputNumber}&search=`
        }
        if (urlPathname === "/npc") {
            return `?page=${inputNumber}&location=all&type=all&search=`
        }
        if (urlPathname === "/quest") {
            return `?page=${inputNumber}&location=all&type=all&search=`
        }
        if (urlPathname === "/map") {
            return `?page=${inputNumber}&location=any&search=`
        }
        if (urlPathname === "/accuracy-calc") {
            return `?page=${inputNumber}&filter=any&category=any&order=id&sort=ascending&search=`
        }

    }

    let pageButtonArr = []
    for (let i = currentPage - 2; i <= currentPage + 2; i++) {
        if (i <= 1 || i >= lastPageIndex) continue
        const obj = {
            // pathname: `${urlPathname}`,
            // search: generateQueryString(i),
            text: i,
        }
        pageButtonArr.push(obj)
    }

    const handlePageBtnClick = (pageNum) => {
        navigate(`${urlPathname}${generateQueryString(pageNum)}`)
    }

    const handleEllipsisPageBtnClick = (direction) => {
        // pop OffCanvas to jump to which page
        setPaginationBarStatus(prev => {
            return { toShow: true, isNext: direction === 'next' }
        })

        // remove backdrop overlay effect
        setTimeout(() => {
            const backdrop = document.querySelector('.offcanvas-backdrop');
            if (backdrop) {
                backdrop.style.opacity = '0';
            }
        }, 50); // Delay to ensure the backdrop is in the DOM
    }

    // console.log(pageButtonArr)
    // console.log(currentPage)

    return (
        <>
            <Pagination id="paginationGroup" className="d-flex justify-content-center">

                {/* page 1 */}
                <Pagination.Item className={`bg-white ${lastPageIndex <= 1 ? "rounded-5" : "rounded-start-5"} `} active={currentPage === 1} onClick={() => handlePageBtnClick(1)}>
                    1
                </Pagination.Item>

                {/* <...> button for pages far ahead */}
                {currentPage >= 5 && <Pagination.Ellipsis onClick={() => handleEllipsisPageBtnClick('prev')} />}

                {pageButtonArr.map(x =>
                    <Pagination.Item className='bg-white' key={x.text} active={x.text == Number(currentPage)} onClick={() => handlePageBtnClick(x.text)}>
                        {x.text}
                    </Pagination.Item>
                )}

                {/* <...> button for pages far behind */}
                {currentPage <= lastPageIndex - 4 && <Pagination.Ellipsis onClick={() => handleEllipsisPageBtnClick('next')} />}

                {/* page Last */}
                {lastPageIndex >= 2 && <Pagination.Item className='bg-white rounded-end-5' active={currentPage === lastPageIndex} onClick={() => handlePageBtnClick(lastPageIndex)}>
                    {lastPageIndex}
                </Pagination.Item>}
            </Pagination>

            {/* Bottom Offcanvas shows when <...> btn click */}
            <PaginationBar
                paginationBarStatus={paginationBarStatus}
                setPaginationBarStatus={setPaginationBarStatus}
                generateQueryString={generateQueryString}
                lastPageIndex={lastPageIndex}
            />
        </>
    );
}

function PaginationBar({ paginationBarStatus, setPaginationBarStatus, generateQueryString, lastPageIndex }) {

    const [searchParams] = useSearchParams()
    const { pathname: urlPathname } = useLocation()
    const navigate = useNavigate();

    const handleClose = () => {
        setPaginationBarStatus(prev => {
            return { ...prev, toShow: false }
        })
    };

    const isNextPage = paginationBarStatus.isNext
    const currentPage = getCurrentPage(searchParams)

    const handleBtnClick = (val) => {
        val = isNextPage ? +val : -val      // red btn = -5/-10/-20/-50, blue btn= +5/+10/+20/+50
        let nextPageNum = val + currentPage
        nextPageNum = Math.max(nextPageNum, 0)      // if exceed 0, becomes 0
        nextPageNum = Math.min(lastPageIndex, nextPageNum)  // if exceed lastPage, becomes lastPage
        let queryStr = generateQueryString(nextPageNum)
        navigate(`${urlPathname}${queryStr}`)   // redirect to new url
    }

    return (
        <Offcanvas show={paginationBarStatus.toShow} onHide={handleClose} placement="bottom" style={{ height: "7.5vh" }}>
            <Offcanvas.Body className='bg-dark d-flex justify-content-center align-items-center' >
                <h5 className="text-white mx-5">Skip to page</h5>
                {[5, 10, 20, 50].map(num =>
                    <Button key={num} variant={isNextPage ? 'primary' : 'danger'} className="m-1" style={{ width: 50 }} onClick={() => handleBtnClick(num)}>
                        {isNextPage ? '+' : '-'}{num}
                    </Button>)}
            </Offcanvas.Body>
        </Offcanvas>
    )
}

const getCurrentPage = (searchParams) => {
    return Number(Object.fromEntries([...searchParams.entries()]).page) || 1
}