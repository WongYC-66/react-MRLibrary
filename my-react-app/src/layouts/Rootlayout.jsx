import { Outlet, NavLink, ScrollRestoration } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs.jsx"
// 
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { LinkContainer } from 'react-router-bootstrap'
import Image from 'react-bootstrap/Image'
// 

export default function RootLayout() {
  return (
    <div className="root-layout bg-body-tertiary d-flex flex-column vh-100" data-bs-theme="dark">

      <ScrollRestoration />

      <header>
        {/* <NavLink to="/">Home</NavLink>
          <NavLink to="about">About</NavLink>
          <NavLink to="help">Help</NavLink>
          <NavLink to="careers">Careers</NavLink> */}

        <Navbar collapseOnSelect expand="md" className="bg-body-tertiary">
          <Container fluid>
            <LinkContainer to="/">
              <Navbar.Brand className="w-25" ><Image src="/logov5.webp" fluid /></Navbar.Brand>
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

                <LinkContainer to="/exptable">
                  <Nav.Link>ExpTable</Nav.Link>
                </LinkContainer>
              </Nav>

              <Nav>
                <Form className="d-flex">
                  <Form.Control
                    type="search"
                    placeholder="Global search ..."
                    className="me-1"
                    aria-label="Search"
                    data-bs-theme="light"
                  />
                  <Button variant="secondary">Submit</Button>
                </Form>
              </Nav>

            </Navbar.Collapse>
          </Container>
        </Navbar>

        <Breadcrumbs/>

      </header>
      <main className="text-bg-secondary p-4  flex-fill">
        <div className="p-4 mx-3 bg-body-tertiary rounded-5">
          <Outlet />
        </div>
      </main>
    </div>
  )
}