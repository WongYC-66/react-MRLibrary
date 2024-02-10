import { useSearchParams, useLocation, Link } from "react-router-dom"
import { LinkContainer } from 'react-router-bootstrap'
// 
import Pagination from 'react-bootstrap/Pagination';
import Image from "react-bootstrap/Image"
// 
// 
export const filterItemList = (itemLibrary) => {
    const [searchParams] = useSearchParams()
    if (searchParams.size) { // If URL has query param, filter ...
        const filterOption = Object.fromEntries([...searchParams.entries()])
        const searchTerm = filterOption.search.toLowerCase()

        let filteredItemList = Object.entries(itemLibrary)
            .filter(x => {
                if (!x[1].hasOwnProperty('name')) return false
                if (x[1].name.toLowerCase().includes(searchTerm)) return true
            })
        return filteredItemList
    }
    // No filter at first loading or if URL don't have query param 
    return Object.entries(itemLibrary)
}
// 

export const renderItemList = (filteredItemList, type = "use") => {
    const [searchParams] = useSearchParams()
    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredItemList = filteredItemList.slice(sliceStartIndex, sliceEndIndex)
    // [ [itemId, {name : xxxx , desc : xxx}] , [] , [] , ... ]

    return filteredItemList.map(x => {
        const itemId = x[0]
        return (
            <tr key={itemId}>
                <td>
                    <Link to={`/${type}/id=${itemId}`}>
                        {renderImageWithItemId(itemId)}
                    </Link>
                </td>
                <td>
                    <Link to={`/${type}/id=${itemId}`}>
                        {x[1].name}
                    </Link>
                </td>
                <td>
                    {x[1].desc.split("\\n").map(x =>
                        <p key={x} className="p-0 m-0" dangerouslySetInnerHTML={{ __html: x }}></p>
                    )}
                </td>
            </tr>
        )
    })
}


// 
export const renderImageWithItemId = (itemId) => {
    const ImageComponent = <Image src="abc" id={`image-${itemId}`} fluid alt="Image not found" />

    findGoodItemImgUrl({ id: itemId }).then(x => {
        // console.log("resolving x , src will be :", x)
        document.getElementById(`image-${itemId}`).src = x
    })

    return ImageComponent
}
// 

export const findGoodItemImgUrl = ({ id }) => {

    // 1. fetch from MapleLegends
    let p1 = new Promise((resolve, reject) => {
        let x = fetch(`https://maplelegends.com/static/images/lib/item/${id.padStart(8, 0)}.png`, {
            mode: "no-cors"
        })
            .then(res => resolve(`https://maplelegends.com/static/images/lib/item/${id.padStart(8, 0)}.png`))
            .catch(err => reject(err))
    })

    // 2. fetch from MapleStory.io
    let p2 = new Promise((resolve, reject) => {
        let x = fetch(`https://maplestory.io/api/SEA/198/item/${id}/icon?resize=1.0`, {
            mode: "no-cors"
        })
            .then(res => {
                resolve(`https://maplestory.io/api/SEA/198/item/${id}/icon?resize=1.0`)
            })
            .catch(err => reject(err))
    })

    return Promise.any([p1, p2])
}

//
export const itemIdToImgUrl = ({ id, name }) => {
    name = name.toLowerCase()
    if (["scroll", "10%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040200/icon?resize=1.0`
    if (["scroll", "30%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040108/icon?resize=1.0`
    if (["scroll", "60%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2044501/icon?resize=1.0`
    if (["scroll", "70%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2040814/icon?resize=1.0`
    if (["scroll", "100%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2041300/icon?resize=1.0`
    if (["scroll", "clean slate", "1%"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2049000/icon?resize=1.0`
    if (["scroll", "chaos"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/2049100/icon?resize=1.0`
    if (["nx cash", "1000"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/5680151/icon?resize=1.0`
    if (["nx cash", "5000"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/5680578/icon?resize=1.0`
    if (["white scroll fragment"].every(x => name.includes(x))) return `https://maplestory.io/api/SEA/198/item/4001533/icon?resize=1.0`
    return `https://maplelegends.com/static/images/lib/item/${id.padStart(8, '0')}.png`
}

// 

export const updatePagination = (library, filterLibraryFunction) => {
    const [searchParams] = useSearchParams()
    const currentPage = Number(Object.fromEntries([...searchParams.entries()]).page) || 1

    const urlPathname = useLocation().pathname
    const urlSearch = useLocation().search || `?search=`
    const lastPageIndex = Math.ceil(filterLibraryFunction(library).length / 10)

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
        <Pagination className="d-flex justify-content-center">

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
        </Pagination>
    );
}
