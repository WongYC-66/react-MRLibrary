//
import Image from "react-bootstrap/Image"
import Form from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import { AiFillGithub } from "react-icons/ai";

export default function Home() {
    return (
        <div className="home text-center">
            <h2>Welcome to </h2>

            <h1 className="m-5 p-1">MapleRoyals Library (Un-official)</h1>

            <Image src="/library2.png" fluid />


            <Form className="d-flex m-5 p-3">
                <Form.Control
                    type="search"
                    placeholder="Global search ..."
                    className="p-1 me-3"
                    aria-label="Search"
                    data-bs-theme="light"
                />
                <Button className="me-5" variant="secondary">Submit</Button>
            </Form>


            <p>Designed and credited to : <a href="https://maplelegends.com/lib/">MapleLegends</a></p>
            <p>This is an unofficial library</p>
            <p>Created by ScottY5C</p>
            <p>Tech Stack : React/Bootstrap/React Router</p>
            <p className="d-flex  align-items-center justify-content-center gap-1">
                <a href="/" target="_blank"><AiFillGithub /> </a>
                <span><a href="https://royals.ms/forum/threads/monster-drop-table-website-scottys-version.228204/" target="_blank">Forum Link</a></span>
            </p>
        </div>
    )
}