import { useState } from "react"
// 
import FormBS from "react-bootstrap/Form"
import ListGroup from 'react-bootstrap/ListGroup';
// 
import data_Music from "../../../data/data_Music.json"

export default function Music() {

    const [searchText, setSearchText] = useState('')
    const [selectedOST, setSelectedOST] = useState('')

    const musicResult = Object.keys(data_Music).filter(name => name.toLowerCase().includes(searchText.toLowerCase()))

    const handleMusicClick = (name) => {
        setSelectedOST(name)
    }

    const OST_URL = `https://github.com/scotty66f/royals-ost/raw/refs/heads/main/audio/${selectedOST}`
    const ALL_OST_URL = 'https://github.com/scotty66f/royals-ost/archive/refs/heads/main.zip'

    return (
        <div className="music d-flex p-3">

            {/* Left window */}
            <div className="d-flex flex-column" style={{ width: '250px' }}>
                {/* Search Input */}
                <FormBS.Control
                    className=""
                    type="search"
                    placeholder=" Search ..."
                    aria-label="Search"
                    data-bs-theme="light"
                    name="searchName"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                />

                <p className="p-0 mt-2 text-center">found {musicResult.length} records</p>

                {/* List of Music */}
                <div className="mt-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    <ListGroup variant="flush">
                        {musicResult.map(name =>
                            <ListGroup.Item action key={name} onClick={() => handleMusicClick(name)} active={name === selectedOST}>
                                {name.replace('.mp3', '')}
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </div>
            </div>

            {/* Right window */}
            {selectedOST &&
                <div className='ms-3 w-50'>
                    <figure>
                        <figcaption>Listen to {selectedOST}:</figcaption>
                        <audio controls src={OST_URL} loop></audio>
                        <p>
                            <a href={OST_URL} download={OST_URL} className="btn btn-primary mt-2"> Download audio </a>
                        </p>
                    </figure>

                    {/* Download All */}
                    <p>
                        <a href={ALL_OST_URL} download={ALL_OST_URL} className="btn btn-primary mt-2"> Download All (360mb) </a>
                    </p>
                </div>
            }

        </div>
    )
}