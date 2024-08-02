import { useLocation } from "react-router-dom"
// 
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { LinkContainer } from 'react-router-bootstrap'
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


    // if isEquip and weapon. Add one more breadcrumb to link to weapon category search result
    // e.g. home / weapon /id=1302000 
    // becomes: home / weapon / One-Handed-Sword /id=1302000
    if (id && Number(id) >= 1300000 && Number(id) <= 1500000) {    // between OneHandedSword - Gun
        // generate category name and url from equipId
        let subCategory = equipIdToWeaponSubCategory(id)
        let filterKey = weaponSubCategoryToFilterKey(subCategory)
        let symbolObj = <LinkContainer to={{ pathname: "/weapon", search: `?page=1&job=0&category=${filterKey}&order=id&sort=ascending&search=` }} key={subCategory} >
            <Breadcrumb.Item> {subCategory.toLowerCase()} </Breadcrumb.Item>
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
export function equipIdToWeaponSubCategory(id) {
    // info used from https://maplestory.io/api/GMS/64/item/category
    id = parseInt(id)
    let overallCategory = "Equip"
    let category = undefined
    let subCategory = undefined
    const isIDInRange = (min, max) => id >= min && id <= max

    const catogeryRangeList = {
        "Gun": { min: 1490000, max: 1500000, category: "Two-Handed Weapon" },
        "Knuckle": { min: 1480000, max: 1490000, category: "Two-Handed Weapon" },
        "Claw": { min: 1470000, max: 1480000, category: "Two-Handed Weapon" },
        "Dagger": { min: 1330000, max: 1340000, category: "One-Handed Weapon" },
        "Bow": { min: 1450000, max: 1460000, category: "Two-Handed Weapon" },
        "CrossBow": { min: 1460000, max: 1470000, category: "Two-Handed Weapon" },
        "Staff": { min: 1380000, max: 1390000, category: "One-Handed Weapon" },
        "Wand": { min: 1370000, max: 1380000, category: "One-Handed Weapon" },
        "One-Handed Sword": { min: 1300000, max: 1310000, category: "One-Handed Weapon" },
        "Two-Handed Sword": { min: 1400000, max: 1410000, category: "Two-Handed Weapon" },
        "One-Handed Blunt Weapon": { min: 1320000, max: 1330000, category: "One-Handed Weapon" },
        "Two-Handed Blunt Weapon": { min: 1420000, max: 1430000, category: "Two-Handed Weapon" },
        "One-Handed Axe": { min: 1310000, max: 1320000, category: "One-Handed Weapon" },
        "Two-Handed Axe": { min: 1410000, max: 1420000, category: "Two-Handed Weapon" },
        "Spear": { min: 1430000, max: 1440000, category: "Two-Handed Weapon" },
        "Pole Arm": { min: 1440000, max: 1450000, category: "Two-Handed Weapon" },
    }

    Object.entries(catogeryRangeList).forEach(x => {
        if (isIDInRange(x[1].min, x[1].max)) {
            category = x[1].category
            subCategory = x[0]
        }
    })

    return subCategory
    // return [overallCategory, category, subCategory]
    // ['Equip', 'Two-Handed Weapon', 'Gun']
    // ['Equip', 'Armor', 'Bottom']
}
const weaponSubCategoryToFilterKey = (subCategoryName) => {
    const categoryKeywords = {
        "any": "any",
        "OHSword": "One-Handed Sword",
        "OHAxe": "One-Handed Axe",
        "OHMace": "One-Handed Blunt Weapon",
        "dagger": "Dagger",
        "wand": "Wand",
        "staff": "Staff",
        "THSword": "Two-Handed Sword",
        "THAxe": "Two-Handed Axe",
        "THMace": "Two-Handed Blunt Weapon",
        "spear": "Spear",
        "polearm": "Pole Arm",
        "bow": "Bow",
        "crossbow": "CrossBow",
        "claw": "Claw",
        "knuckle": "Knuckle",
        "gun": "Gun"
    }

    let nameToKeyMap = Object.fromEntries(Object.entries(categoryKeywords).map(([k, v]) => [v, k]))
    return nameToKeyMap[subCategoryName]
}