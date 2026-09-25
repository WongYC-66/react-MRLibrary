import { useEffect, useRef, useState } from "react";
// 
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable, isSortable } from '@dnd-kit/react/sortable';
import Button from 'react-bootstrap/Button';
import FormBS from "react-bootstrap/Form";
import ListGroup from 'react-bootstrap/ListGroup';
import Offcanvas from 'react-bootstrap/Offcanvas';
// 
import data_Music from "../../../data/data_Music.json";
import IconToolTip from "../../components/ToolTip";

export default function Music() {
    // search & preview OST states
    const [searchText, setSearchText] = useState('')
    const [previewOST, setPreviewOST] = useState('')

    // playlist & playlist-player states
    const [playlist, setPlaylist] = useState(loadPlaylistFromLocalStorage())
    const [showPlayer, setShowPlayer] = useState(false);    // flag of whether to show
    const [loopPlaylist, setLoopPlalist] = useState(false)  // flag of whether to loop
    const [play, setPlay] = useState(false)                 // flag of whether to start/pause current playlist player
    const [playIdx, setPlayIdx] = useState(-1)

    // Ref to audio html element
    const previewAudioRef = useRef(null)
    const playlistAudioRef = useRef(null)

    const musicResult = Object.keys(data_Music).filter(name => name.toLowerCase().includes(searchText.toLowerCase()))

    useEffect(() => {
        // OST Preview 
        if (!previewAudioRef.current) return
        previewAudioRef.current.currentTime = 0;
        if (previewOST === "") {
            previewAudioRef.current.pause()     // press to pause
        } else {
            previewAudioRef.current.play()      // pres to play preview
        }
    }, [previewOST]);

    useEffect(() => {
        // Playlist
        if (!playlistAudioRef.current) {
            return
        }
        if (!play || playIdx === -1) {
            playlistAudioRef.current.pause()     // press to pause
        } else {
            playlistAudioRef.current.play()      // pres to play preview
        }
    }, [play, playIdx]);



    const handlePreviewClick = (name) => {
        if (previewOST === name) {
            setPreviewOST("") // same song clicked twice, clear
        } else {
            setPreviewOST(name) // new preview clicked
        }
    }

    const handleAddToMenuClick = (name) => {
        if (playlist.includes(name)) return
        let newPlaylist = [...playlist]
        newPlaylist.push(name)
        setPlaylist(newPlaylist)
    }

    const removeFromPlaylist = (idx) => {
        let newPlaylist = [...playlist]
        newPlaylist.splice(idx, 1)
        setPlaylist(newPlaylist)
        let nextIdx = Math.min(newPlaylist.length - 1, playIdx)
        setPlayIdx(nextIdx)
    }

    const sortPlaylist = () => {
        let newPlaylist = [...playlist]
        newPlaylist.sort((a, b) => a.localeCompare(b))
        setPlaylist(newPlaylist)
    }

    const shufflePlaylist = () => {
        let newPlaylist = [...playlist]
        newPlaylist.sort((a, b) => Math.random() - 0.5)
        setPlaylist(newPlaylist)
    }

    const togglePlayMusic = () => {
        setPlay(prev => !prev)
    }

    const toggleLoopPlaylist = () => {
        setLoopPlalist(prev => !prev)
    }

    const startPlaylistPlayer = () => {
        setPlayIdx(0)
        setShowPlayer(true)
        setPlay(true)
    }

    const stopPlaylistPlayer = () => {
        setPlayIdx(-1)
        setShowPlayer(false)
        setPlay(false)
    }

    const playlistGoPrev = () => {
        setPlayIdx(prevIdx => Math.max(0, prevIdx - 1))
    }

    const playlistGoNext = () => {
        let nextIdx = playIdx + 1
        if (nextIdx === playlist.length) {
            // reach ending
            if (loopPlaylist) {
                nextIdx = 0     // go back to first song if loop
            } else {
                nextIdx -= 1    // no loop, hold at last song
            }
        }
        setPlayIdx(nextIdx)
    }

    const handleDragEnd = ({ operation }) => {
        // https://dndkit.com/react/guides/sortable-state-management/
        const { source } = operation;

        if (!source) return;

        const oldIndex = source.initialIndex;
        const newIndex = source.index;

        setPlaylist(items => {
            const newPlaylist = [...items];

            const [moved] = newPlaylist.splice(oldIndex, 1);
            newPlaylist.splice(newIndex, 0, moved);

            return newPlaylist;
        });

        setPlayIdx(0)   // reset to first song in the list
    };

    const OST_SOURCE_URL = "https://github.com/scotty66f/mapleroyals_library_related/raw/refs/heads/main/audio/"
    const PREVIEW_OST_URL = `${OST_SOURCE_URL}${previewOST}`        // e.g. "https://github.com/scotty66f/mapleroyals_library_related/raw/refs/heads/main/audio/amoria.mp3"
    const PLAYLIST_OST_URL = `${OST_SOURCE_URL}${playlist[playIdx]}`         // e.g. "https://github.com/scotty66f/mapleroyals_library_related/raw/refs/heads/main/audio/amoria.mp3"

    savePlaylistToLocalStorage(playlist)

    return (
        <div className="music d-flex flex-column flex-md-row p-3 gap-3">

            {/* Left window */}
            <div className="d-flex flex-column w-100">
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
                        {musicResult.map(name => {
                            let isPlayingThisSongPreview = name === previewOST
                            let ostUrl = `${OST_SOURCE_URL}/${name}`
                            return <ListGroup.Item key={name} className="d-flex align-center justify-content-between">
                                {/* Text */}
                                <p className="m-0 p-0">{name.replace('.mp3', '')}</p>

                                <div className="d-flex gap-3">
                                    {/* Preview Button */}
                                    {!isPlayingThisSongPreview && <IconToolTip text={"Preview"}>
                                        <i className="bi bi-play-circle" style={{ cursor: "pointer" }} onClick={() => handlePreviewClick(name)}></i>
                                    </IconToolTip>
                                    }
                                    {isPlayingThisSongPreview && <IconToolTip text={"Pause"}>
                                        <i className="bi bi-pause-circle" style={{ cursor: "pointer" }} onClick={() => handlePreviewClick(name)}></i>
                                    </IconToolTip>
                                    }

                                    {/* Add to playlist Button */}
                                    <IconToolTip text={"Add to playlist"}>
                                        <i className="bi bi-folder-plus" style={{ cursor: "pointer" }} onClick={() => handleAddToMenuClick(name)}></i>
                                    </IconToolTip>


                                    {/* Download button */}
                                    <a href={ostUrl} download={ostUrl}>
                                        <IconToolTip text={"Download"}>
                                            <i className="bi bi-download"></i>
                                        </IconToolTip>
                                    </a>
                                </div>
                            </ListGroup.Item>
                        })}
                    </ListGroup>

                    {/* Invisible preview music player */}
                    <div className=''>
                        <audio ref={previewAudioRef} src={PREVIEW_OST_URL}></audio>
                    </div>
                </div>
            </div>

            {/* Right window - Playlist */}
            <div className="w-100">
                <h4>Current Playlist</h4>

                <div className="mt-2 d-flex justify-content-end gap-3">
                    {/* Sort button */}
                    <IconToolTip text={"sort"}>
                        <Button variant="outline-light" onClick={() => sortPlaylist()}><i className="bi bi-sort-alpha-down"></i></Button>
                    </IconToolTip>

                    {/* shuffle button */}
                    <IconToolTip text={"shuffle"}>
                        <Button variant="outline-light" onClick={() => shufflePlaylist()}><i className="bi bi-shuffle"></i></Button>
                    </IconToolTip>

                    {/* loop button */}
                    <IconToolTip text={"loop"}>
                        <Button variant={loopPlaylist ? "light" : "outline-light"} onClick={() => toggleLoopPlaylist()}><i className="bi bi-repeat"></i></Button>
                    </IconToolTip>

                    {/* Start play playlist button */}
                    {!showPlayer &&
                        <IconToolTip text={"start"}>
                            <Button variant="outline-light" onClick={() => startPlaylistPlayer()}><i className="bi-play"></i></Button>

                        </IconToolTip>
                    }
                    {showPlayer &&
                        <IconToolTip text={"End"}>
                            <Button variant="light" onClick={() => stopPlaylistPlayer()}><i className="bi-pause"></i></Button>
                        </IconToolTip>
                    }
                </div>

                {/* Playlist */}
                <DragDropProvider onDragEnd={handleDragEnd}>
                    <ListGroup variant="flush" className="mt-3" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                        {playlist.map((ost, idx) => {
                            let name = ost.replace(".mp3", "")
                            {/* playlist - row item */ }
                            return <Sortable key={ost} id={ost} index={idx} >
                                <ListGroup.Item key={ost} className="d-flex align-items-center justify-content-between m-1 py-2 border rounded-2 gap-3">

                                    {/* row - left */}
                                    <div className="d-flex align-items-center gap-3">
                                        <img className="rounded-1" style={{ height: '40px' }} src={`https://ui-avatars.com/api/?name=${name}&background=random`}></img>
                                        {name}
                                    </div>

                                    {/* row - right */}
                                    <div>
                                        {/* X button */}
                                        <IconToolTip text={"Remove"}>
                                            <Button variant="outline-light" onClick={() => removeFromPlaylist(idx)}><i className="bi bi-trash"></i></Button>
                                        </IconToolTip>
                                    </div>

                                </ListGroup.Item >
                            </Sortable>
                        })}
                    </ListGroup>
                </DragDropProvider>
            </div>


            {/* Bottom Playlist Player */}
            <Offcanvas
                show={showPlayer}
                onHide={stopPlaylistPlayer}
                placement="bottom"
                scroll={true}
                backdrop={false}
                className="bg-dark"
                style={{ height: "15vh" }}
                onEntered={() => {
                    if (play && playlistAudioRef.current) {
                        playlistAudioRef.current.play().catch(err => {
                            console.log("play failed:", err);
                        });
                    }
                }}>
                <Offcanvas.Header closeButton className="d-flex justify-content-between bg-dark text-white" closeVariant="white">
                    {/* OST name being played */}
                    <h5><i className="bi bi-music-note"></i> {playlist[playIdx]}</h5>


                </Offcanvas.Header>
                <Offcanvas.Body className="d-flex justify-content-center align-items-center gap-3 overflow-hidden">

                    {/* Playlist Control < || > */}
                    {/* < */}
                    <Button variant="outline-light" onClick={() => playlistGoPrev()}><i className="bi bi-skip-backward-fill"></i></Button>

                    {/* Play or Pause */}
                    {!play && <Button variant="outline-light" onClick={() => togglePlayMusic()}><i className="bi-play"></i></Button>}
                    {play && <Button variant="light" onClick={() => togglePlayMusic()}><i className="bi-pause"></i></Button>}

                    {/* > */}
                    <Button variant="outline-light" onClick={() => playlistGoNext()}><i className="bi bi-skip-forward-fill"></i></Button>

                    {/* Invisible playlist music player */}
                    <div>
                        <audio controls style={{ maxHeight: "35px" }} ref={playlistAudioRef} src={PLAYLIST_OST_URL} onEnded={() => playlistGoNext()} ></audio>
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    )
}

const loadPlaylistFromLocalStorage = () => {
    // default
    let playlist = JSON.parse(localStorage.getItem("playlist") ?? "[]")
    if (!playlist.length) {
        // if no previous playlist or is empty, populate with my default favorite :)
        return [
            "BadGuys.mp3",
            "AboveTheTreetops.mp3",
        ]
    }
    return playlist
}

const savePlaylistToLocalStorage = (playlist) => {
    localStorage.setItem("playlist", JSON.stringify(playlist))
}

function Sortable({ id, index, children }) {
    const { ref } = useSortable({ id, index });

    return (
        <div ref={ref}>
            {children}
        </div>
    );
}
