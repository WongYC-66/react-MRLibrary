import { useLocation, Link } from "react-router-dom"

export default function Breadcrumbs() {
    const location = useLocation()
    // console.log(location)
    let currentLink = ''

    const crumbs = location.pathname.split('/')
        .filter(crumb => crumb !== '')
        .map(crumb => {
            currentLink += `/${crumb}`
            // console.log(currentLink)

            return (
                <div className="crumb" key={crumb}>
                    <Link to={currentLink}>{crumb}</Link>
                </div>
            )
        })

    return (
        <div className="breadcrumbs">
            {crumbs}
        </div>
    )
}