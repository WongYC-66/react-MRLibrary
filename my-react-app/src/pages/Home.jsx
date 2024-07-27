import { Form, redirect } from "react-router-dom"
//
import Image from "react-bootstrap/Image"
import FormBS from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import { AiFillGithub } from "react-icons/ai";

export default function Home() {
    return (
        <div className="home text-center">
            <h2 className="display-6">Welcome to </h2>

            <h2 className="display-5 my-3 p-0">MapleRoyals Library (Un-official)</h2>
            <h5 className="my-3 p-0"> Game version : v92 </h5>

            <Image className="w-75" src="/library2.png"/>

            <Form className="d-flex m-5 p-3" method="post" action="/all">
                <FormBS.Control
                    className="p-1 me-3"
                    type="search"
                    placeholder="Global search ..."
                    aria-label="Search"
                    data-bs-theme="light"
                    name="searchName"
                />
                <Button className="me-5" variant="secondary" type="submit">Submit</Button>
            </Form>


            <p>Designed and credited to : <a href="https://maplelegends.com/lib/">MapleLegends</a></p>
            <p>This is an unofficial library</p>
            <p>Created by ScottY5C</p>
            <p>Tech Stack : React/Bootstrap/React Router</p>
            <p className="d-flex  align-items-center justify-content-center gap-1">
                <a href="https://anonymous.4open.science/r/react-MRLibrary-36D1/" target="_blank"><AiFillGithub /> </a>
                <span><a href="https://royals.ms/forum/threads/un-official-mapleroyals-library-scottys-version.229606/" target="_blank">Forum Link</a></span>
            </p>
        </div>
    )
}
