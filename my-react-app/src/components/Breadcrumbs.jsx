import { useLocation } from "react-router-dom"
// 
import Breadcrumb from 'react-bootstrap/Breadcrumb';
import { LinkContainer } from 'react-router-bootstrap'
// 
export default function Breadcrumbs() {
    const location = useLocation()
    let currentLink = ''
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

    return (
        <Breadcrumb className="ps-3">
            <LinkContainer to="/">
                <Breadcrumb.Item>home</Breadcrumb.Item>
            </LinkContainer>
            {crumbs}             {/* render breadcrumb from url location  */}
        </Breadcrumb>
    )
}