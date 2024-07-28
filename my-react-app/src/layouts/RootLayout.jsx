import { Outlet, ScrollRestoration, Form } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx"
// 
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import FormBS from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap'
import { Link } from "react-router-dom";
import Image from 'react-bootstrap/Image'
// 

export default function RootLayout() {
  return (
    <div className="root-layout bg-body-tertiary d-flex flex-column vh-100 " data-bs-theme="dark">

      <ScrollRestoration />

      <header className="z-1000">
        {/* <NavLink to="/">Home</NavLink>
          <NavLink to="about">About</NavLink>
          <NavLink to="help">Help</NavLink>
          <NavLink to="careers">Careers</NavLink> */}

        <Navbar collapseOnSelect expand="md" className="bg-body-tertiary">
          <Container fluid>
            <LinkContainer to="/">
              <Navbar.Brand className="w-25" ><Image src="/logov5.webp" width="175px" /></Navbar.Brand>
            </LinkContainer>

            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">

              <Nav className="me-auto">
                <NavDropdown title="Equips" id="collapsible-nav-dropdown">
                  <LinkContainer to="/weapon">
                    <NavDropdown.Item>Weapon</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/hat">
                    <NavDropdown.Item>Hat</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/top">
                    <NavDropdown.Item>Top</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/bottom">
                    <NavDropdown.Item>Bottom</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/overall">
                    <NavDropdown.Item>Overall</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/shoes">
                    <NavDropdown.Item>Shoes</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/gloves">
                    <NavDropdown.Item>Gloves</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/cape">
                    <NavDropdown.Item>Cape</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/shield">
                    <NavDropdown.Item>Shield</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/faceacc">
                    <NavDropdown.Item>Face Acc</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <LinkContainer to="/eyeacc">
                    <NavDropdown.Item>Eye Acc</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/earring">
                    <NavDropdown.Item>Earrings</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/ring">
                    <NavDropdown.Item>Ring</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/pendant">
                    <NavDropdown.Item>Pendant</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>

                <LinkContainer to="/monster">
                  <Nav.Link>Monster</Nav.Link>
                </LinkContainer>

                {/* <LinkContainer to="/npc">
                  <Nav.Link>NPC</Nav.Link>
                </LinkContainer> */}

                {/* <LinkContainer to="/map">
                  <Nav.Link>Map</Nav.Link>
                </LinkContainer> */}

                <NavDropdown title="Items" id="collapsible-nav-dropdown">
                  <LinkContainer to="/use">
                    <NavDropdown.Item>Use</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/setup">
                    <NavDropdown.Item>Setup</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/etc">
                    <NavDropdown.Item>Etc</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/gacha">
                    <NavDropdown.Item>Gacha</NavDropdown.Item>
                  </LinkContainer>
                  {/* <LinkContainer to="/cash">
                    <NavDropdown.Item>Cash</NavDropdown.Item>
                  </LinkContainer> */}
                </NavDropdown>

                {/* <LinkContainer to="/skill">
                  <Nav.Link>Skill</Nav.Link>
                </LinkContainer> */}

                {/* <LinkContainer to="/quest">
                  <Nav.Link>Quest</Nav.Link>
                </LinkContainer> */}

                {/* Tables */}
                <NavDropdown title="Tables" id="collapsible-nav-dropdown">
                  <LinkContainer to="/exptable">
                    <NavDropdown.Item>Exp Table</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/elemental-table">
                    <NavDropdown.Item>Elemental Table</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>

                {/* External links */}
                <NavDropdown title="Links" id="collapsible-nav-dropdown">

                  <Link to='https://royals-droppy.netlify.app/' target="_blank" >
                    <p className="m-0 p-0 mx-3"> old droptracker</p>
                  </Link>

                  <Link to='https://royals-droppy-v2-pc.netlify.app/' target="_blank" >
                    <p className="m-0 p-0 mx-3"> droptracker v2</p>
                  </Link>

                  <Link to='https://royals-droppy-v2-mobile.netlify.app/' target="_blank" >
                    <p className="m-0 p-0 mx-3"> droptracker v2-m</p>
                  </Link>

                </NavDropdown>
              </Nav>

              <Nav>
                <Form className="d-flex" method="post" action="/all">
                  <FormBS.Control
                    id="globalInput"
                    type="search"
                    placeholder="Global search ..."
                    className="me-1"
                    aria-label="Search"
                    data-bs-theme="light"
                    name="searchName"
                    defaultValue=""
                  />
                  <Button variant="secondary" type="submit">Submit</Button>
                </Form>
              </Nav>

            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Breadcrumbs />

      </header>
      <main className="text-bg-secondary p-4 flex-fill d-flex justify-content-center">
        <div className="tab-card container-md p-md-4 mx-md-4 py-3 m-0  bg-body-tertiary rounded-5">
          <Outlet />
        </div>
      </main>
    </div >
  )
}

