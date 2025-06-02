import { useLocation } from "react-router-dom"
// 
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { LinkContainer } from 'react-router-bootstrap'
//
import { equipIdToCategory, categoryQueryToCategory } from "../pages/equips/utility.jsx"
// 
export default function Breadcrumbs() {
    const location = useLocation()
    let currentLink = ''

    // 
    let id = null
    location.pathname.split('id=').forEach(str => {
        if (isNaN(Number(str))) return
        id = str
    })

    const crumbs = location.pathname.split('/')
        .filter(crumb => crumb !== '')
        .map(crumb => {
            currentLink += `/${crumb}`
            return (
                <LinkContainer to={currentLink} key={crumb}>
                    <Breadcrumb.Item >{crumb}</Breadcrumb.Item>
                </LinkContainer>
            )
        })

    const isWeaponDetailPage = location.pathname.includes('weapon') && location.pathname.includes('id=')

    // if isEquip and weapon. Add one more breadcrumb to link to weapon category search result
    // e.g. home / weapon /id=1302000 
    // becomes: home / weapon / One-Handed-Sword /id=1302000
    if (isWeaponDetailPage) {
        // generate category name and url from equipId
        let weaponCategory = equipIdToCategory(id)[2]  // subCategory
        let filterKey = weaponCategoryToFilterKey(weaponCategory)
        let symbolObj = <LinkContainer to={{ pathname: "/weapon", search: `?page=1&job=0&category=${filterKey}&order=id&sort=ascending&cosmetic=null&search=` }} >
            <Breadcrumb.Item> {weaponCategory.toLowerCase()} </Breadcrumb.Item>
        </LinkContainer >
        crumbs.splice(1, 0, symbolObj)
    }

    return (
        <Breadcrumb className="ps-3">
            <LinkContainer to="/">
                <Breadcrumb.Item>home</Breadcrumb.Item>
            </LinkContainer>
            {crumbs}             {/* render breadcrumb from url location  */}
        </Breadcrumb>
    )
}

const weaponCategoryToFilterKey = (subCategoryName) => {
    const categoryToCategoryQuery = Object.entries(categoryQueryToCategory).map(([k, v]) => [v, k]) // reverse
    return Object.fromEntries(categoryToCategoryQuery)[subCategoryName]
}