import { useSearchParams, useLocation, useNavigate } from "react-router-dom"
import { LinkContainer } from 'react-router-bootstrap'
import { useCallback, useState } from "react"
// 
import Pagination from "react-bootstrap/Pagination"
// import Modal from "react-bootstrap/Modal"
import Offcanvas from 'react-bootstrap/Offcanvas';
import Button from "react-bootstrap/Button"

export const updatePagination = (library, filterLibraryFunction, ...para) => {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate();

    const [showPaginationModal, setShowPaginationModal] = useState(false);  // modal to skip pages <...>
    const [isNextPage, setIsNextPage] = useState(true);  // modal 

    const urlSearch = useLocation().search
    const currentPage = Number(Object.fromEntries([...searchParams.entries()]).page) || 1

    const urlPathname = useLocation().pathname
    const lastPageIndex = Math.ceil(filterLibraryFunction(library, ...para).length / 10)

    const generateSearchString = (inputNumber) => {
        const queryParaCount = searchParams.size
        // console.log(urlSearch)
        if (queryParaCount >= 1) return urlSearch.replace(/\?page=\d+/, (...para) => {
            // console.log({para})
            return `?page=${inputNumber}`
        })
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
        if (urlPathname === "/craft-table") {
            return `?page=${inputNumber}&search=`
        }
        if (urlPathname === "/npc") {
            return `?page=${inputNumber}&location=all&type=all&search=`
        }
        if (urlPathname === "/quest") {
            return `?page=${inputNumber}&location=all&type=all&search=`
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

    // Generate [1][2][3]...[lastPage] button Object : {text: 1, pathname ..., seach:...}
    let pageButtonArr = []
    for (let i = currentPage - 2; i <= lastPageIndex; i++) {
        const obj = {
            pathname: `${urlPathname}`,
            // search: `?page=${i}&${urlSearch.slice(1,).replace(/page=\d+&/, "")}`,
            search: generateSearchString(i),
            text: i
        }
        pageButtonArr.push(obj)
    }
    pageButtonArr = pageButtonArr.filter(x =>
        (x.text >= 1) && (x.text - currentPage <= 2)
        && (x.text != 1 && x.text != lastPageIndex)
    )


    RemovePaginationActiveAttribute()

    let text = 'save changes'
    // Modal related
    const handleClose = () => setShowPaginationModal(false);
    const handleShow = () => setShowPaginationModal(true);

    const handleEllipsisPageBtnClick = (text) => {
        // pop modal to jump to which page
        // text = 'ahead' or 'behind'
        setIsNextPage(text === 'next')
        handleShow()

        // remove backdrop overlay effect
        setTimeout(() => {
            const backdrop = document.querySelector('.offcanvas-backdrop');
            if (backdrop) {
                backdrop.style.opacity = '0';
            }
        }, 50); // Delay to ensure the backdrop is in the DOM
    }
    const handleModalBtnClick = (val) => {
        val = isNextPage ? +val : -val      // red btn = -5/-10/-20/-50, blue btn= +5/+10/+20/+50
        let nextPageNum = val + currentPage
        nextPageNum = Math.max(nextPageNum, 0)      // if exceed 0, becomes 0
        nextPageNum = Math.min(lastPageIndex, nextPageNum)  // if exceed lastPage, becomes lastPage
        let queryStr = generateSearchString(nextPageNum)
        // handleClose()
        navigate(`${urlPathname}${queryStr}`)   // redirect to new url
    }

    // console.log({currentPage, lastPageIndex})


    return (
        <>
            <Pagination id="paginationGroup" className="d-flex justify-content-center">

                {/* page 1 */}
                <LinkContainer to={{ pathname: urlPathname, search: generateSearchString(1) }} key='first'>
                    {/* <Pagination.First className="bg-transparent" style="--bs-bg-opacity: .5;" /> */}
                    <Pagination.Item className={`bg-white ${lastPageIndex <= 1 ? "rounded-5" : "rounded-start-5"} ${currentPage === 1 && "current"}`}>1</Pagination.Item>
                </LinkContainer>

                {/* <...> button for pages far ahead */}
                {currentPage >= 4 && <Pagination.Ellipsis onClick={() => handleEllipsisPageBtnClick('prev')} />}

                {pageButtonArr.map(x =>
                    <LinkContainer to={{ pathname: x.pathname, search: x.search }} key={x.text}>
                        <Pagination.Item className={`bg-white ${x.text === currentPage && "current"}`}>{x.text}</Pagination.Item>
                    </LinkContainer>
                )}

                {/* <...> button for pages far behind */}
                {currentPage <= lastPageIndex - 4 && <Pagination.Ellipsis onClick={() => handleEllipsisPageBtnClick('next')} />}

                {/* page Last */}
                {lastPageIndex >= 2 && // >= 2 for bugfix of no result page
                    <LinkContainer to={{ pathname: urlPathname, search: generateSearchString(lastPageIndex) }} key="last">
                        {/*  <Pagination.Last /> */}
                        <Pagination.Item className={`bg-white rounded-end-5 ${currentPage === lastPageIndex && "current"}`}>{lastPageIndex}</Pagination.Item>
                    </LinkContainer>
                }
            </Pagination>

            {/* Modals show when <...> btn click */}
            {/* Not using model */}
            {/* <Modal onHide={handleClose} size="sm" centered>
                <Modal.Header className='bg-dark text-white' closeButton>
                    <Modal.Title><h5>Skip to page</h5> </Modal.Title>
                </Modal.Header>
                <Modal.Body className='bg-dark'>
                    {[5, 10, 20, 50].map(num =>
                        <Button key={num} variant={isNextPage ? 'primary' : 'danger'} className="m-1" style={{ width: 50 }} onClick={() => handleModalBtnClick(num)}>
                            {isNextPage ? '+' : '-'}{num}
                        </Button>)}
                </Modal.Body >
            </Modal > */}

            {/* Bottom Offcanvas shows when <...> btn click */}
            <Offcanvas show={showPaginationModal} onHide={handleClose} placement="bottom"    backdropClassName="custom-offcanvas-backdrop" style={{ height: "7.5vh" }}>
                <Offcanvas.Body className='bg-dark d-flex justify-content-center align-items-center' >
                    <h5 className="text-white mx-5">Skip to page</h5>
                    {[5, 10, 20, 50].map(num =>
                        <Button key={num} variant={isNextPage ? 'primary' : 'danger'} className="m-1" style={{ width: 50 }} onClick={() => handleModalBtnClick(num)}>
                            {isNextPage ? '+' : '-'}{num}
                        </Button>)}
                </Offcanvas.Body>
            </Offcanvas>

        </>
    );
}