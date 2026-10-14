import { useEffect, useRef, useState } from "react";
// 
import { DragDropProvider } from '@dnd-kit/react';
import { useSortable } from '@dnd-kit/react/sortable';
import Button from 'react-bootstrap/Button';
import FormBS from "react-bootstrap/Form";
import ListGroup from 'react-bootstrap/ListGroup';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Badge from 'react-bootstrap/Badge';

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

    // Ref to import input
    const fileInputRef = useRef(null);

    const musicResult = Object.keys(data_Music).filter(name => {
        // cond 1: name match
        if (name.toLowerCase().includes(searchText.toLowerCase())) return true

        // cond 2: category match
        let category = ostToCategory[name]
        if (category.toLowerCase().includes(searchText.toLowerCase())) return true

        return false
    })

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

    // badge-related
    const searchThisBadge = (text) => {
        setSearchText(text)
    }

    const exportPlaylist = () => {
        exportTxt(playlist)
    }

    const importPlaylist = () => {
        fileInputRef.current.click()
    }

    // Import TXT to array
    async function importTxt(event) {
        const file = event.target.files?.[0]
        if (!file) return

        const content = await file.text()

        const importedItems = content
            .split(/\r?\n/)
            .map((item) => item.trim())
            .filter((item) => item.length > 0)
            .filter(item => item in ostToCategory)

        setPlaylist(importedItems)

        // Allow importing the same file again
        event.target.value = ""
    }

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
                            let category = ostToCategory[name] ?? ''
                            return <ListGroup.Item key={name} className="d-flex align-center justify-content-between">
                                {/* Text */}
                                <div className="m-0 p-0 d-flex gap-1">
                                    <div>{name.replace('.mp3', '')}</div>
                                    <Badge bg="primary" role="button" onClick={() => searchThisBadge(category)}>{category}</Badge>
                                </div>

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
                <h4 className="d-flex gap-1 align-items-center">
                    Current Playlist

                    {/* import icon */}
                    <IconToolTip text={"import"}>
                        <Button variant="" onClick={() => importPlaylist()}><i class="bi bi-upload"></i></Button>
                    </IconToolTip>

                    {/* export icon */}
                    <IconToolTip text={"export"}>
                        <Button variant="" onClick={() => exportPlaylist()}><i class="bi bi-share"></i></Button>
                    </IconToolTip>
                </h4>

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

            {/* For playlist import only (Hidden) */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain"
                onChange={importTxt}
                hidden
            />


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
                <Offcanvas.Header closeButton className="d-flex gap-1 justify-content-between bg-dark text-white" closeVariant="white">
                    {/* OST name being played */}
                    <h5><i className="bi bi-music-note"></i> {playlist[playIdx]}</h5>
                    <Badge bg="primary" role="button" onClick={() => searchThisBadge(ostToCategory[playlist[playIdx]])}>{ostToCategory[playlist[playIdx]]}</Badge>

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


// Export array to TXT
function exportTxt(items) {
    const content = items.join("\n");

    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "playlist.txt";
    link.click();

    URL.revokeObjectURL(url);
}

// Import TXT to array
async function importTxt(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const content = await file.text();

    const importedItems = content
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter((item) => item.length > 0);


    setItems(importedItems);

    // Allow importing the same file again
    event.target.value = "";
}

// Category of each OST 
const ostToCategory = {
    "AbandonedMine.mp3": "El Nath",
    "AboveTheTreetops.mp3": "Lith Harbor",
    "AcientForest.mp3": "Leafre",
    "AcientRemain.mp3": "Perion",
    "Akiabara.mp3": "Neo Tokyo",
    "amoria.mp3": "Amoria",
    "Amorianchallenge.mp3": "Amoria",
    "AncientMove.mp3": "Sleepywood",
    "Anniv1.mp3": "Events",
    "AquaCave.mp3": "Aqua Road",
    "Aquarium.mp3": "Aqua Road",
    "ArabPirate.mp3": "Other",
    "Ariant.mp3": "Ariant",
    "BadGuys.mp3": "Kerning City",
    "BambooGym.mp3": "Mu Lung",
    "Bathroom.mp3": "Other",
    "BattleField.mp3": "Other",
    "Beachway.mp3": "Florina Beach",
    "Bigfoot.mp3": "Other",
    "BizarreForest.mp3": "Mushroom Shrine",
    "BizarreTales.mp3": "Ludibrium",
    "BlizzardCastle.mp3": "Lion King's Castle",
    "BlueSky.mp3": "Kerning City",
    "BlueWorld.mp3": "Aqua Road",
    "BoatQuay_field.mp3": "Singapore",
    "BoatQuay_town.mp3": "Singapore",
    "CakeMap4th.mp3": "Events",
    "CastleBoss.mp3": "Ninja Castle",
    "CastleInside.mp3": "Ninja Castle",
    "CastleOutSide.mp3": "Ninja Castle",
    "CastleTrap.mp3": "Ninja Castle",
    "cathedral.mp3": "Amoria",
    "CavaBien.mp3": "Henesys",
    "CaveOfHontale.mp3": "Leafre",
    "CBD_field.mp3": "Singapore",
    "CBD_town.mp3": "Singapore",
    "chapel.mp3": "Amoria",
    "ComeWithMe.mp3": "Orbis",
    "Congratulation.mp3": "Events",
    "Courtyard.mp3": "Crimsonwood Keep",
    "CrimsonTower.mp3": "Crimsonwood Keep",
    "CrimsonwoodKeep.mp3": "Crimsonwood Keep",
    "CrimsonwoodKeepInterior.mp3": "Crimsonwood Keep",
    "DarkMountain.mp3": "Korean Folk Town",
    "DarkShadow.mp3": "Ludibrium",
    "DeepCave.mp3": "Elin Forest",
    "DeepSee.mp3": "Aqua Road",
    "Dispute.mp3": "Magatia",
    "DownTown.mp3": "Korean Folk Town",
    "DragonLoad.mp3": "Leafre",
    "DragonNest.mp3": "Leafre",
    "DragonTigerField.mp3": "Events",
    "DragonTigerField2.mp3": "Events",
    "Duskofgod.mp3": "Temple of Time",
    "Elfwood.mp3": "Elin Forest",
    "ElinCave.mp3": "Elin Forest",
    "ElinForest.mp3": "Elin Forest",
    "EnSchool.mp3": "Other",
    "Eregos.mp3": "Party Quest",
    "EvilEyes.mp3": "Sleepywood",
    "FairyTale.mp3": "Ludibrium",
    "FairyTalediffvers.mp3": "Ludibrium",
    "Fantasia.mp3": "Other",
    "FantasticThinking.mp3": "Ludibrium",
    "Feeling.mp3": "Mushroom Shrine",
    "FightingPinkBeen.mp3": "Temple of Time",
    "FightSand.mp3": "Ariant",
    "FinalFight.mp3": "Zakum",
    "FindingForest.mp3": "Omega Sector",
    "FirstStepMaster.mp3": "Maple Island",
    "FishingMemories.mp3": "Other",
    "FloralLife.mp3": "Henesys",
    "FlyingInABlueDream.mp3": "Travel",
    "Forgetfulness.mp3": "Temple of Time",
    "ForTheGlory.mp3": "Omega Sector",
    "FunnyRabbit.mp3": "Events",
    "FunnyRabbitFaster.mp3": "Events",
    "FunnyTimeMaker.mp3": "Ludibrium",
    "Ghostship.mp3": "Singapore",
    "GLBurningSanta.mp3": "Events",
    "GoPicnic.mp3": "Henesys",
    "GoShanghai.mp3": "Shanghai",
    "GrandmastersGauntlet.mp3": "Crimsonwood Keep",
    "halloweenMainHall.mp3": "Events",
    "halloweenParty.mp3": "Events",
    "halloweenracing.mp3": "Events",
    "HauntedHouse.mp3": "Haunted House",
    "HellGate.mp3": "Zakum",
    "HighEnough.mp3": "Travel",
    "Highland.mp3": "Other",
    "HighlandStar.mp3": "Perion",
    "HonTale.mp3": "Leafre",
    "HotDesert.mp3": "Ariant",
    "inNautilus.mp3": "Nautilus",
    "JoyfulTeaParty.mp3": "Events",
    "JungleBook.mp3": "Kerning City",
    "Kamuna.mp3": "Neo Tokyo",
    "KualaLumpur.mp3": "Malaysia",
    "Leafre.mp3": "Leafre",
    "LetsHuntAliens.mp3": "Omega Sector",
    "LetsMarch.mp3": "Omega Sector",
    "LionHeart.mp3": "Lion King's Castle",
    "masterOfKeyboard.mp3": "Other",
    "Minar'sDream.mp3": "Leafre",
    "MineQuest.mp3": "Zakum",
    "MissingYou.mp3": "Ellinia",
    "monsterWorld.mp3": "Events",
    "MoonlightShadow.mp3": "Ellinia",
    "MureungForest.mp3": "Mu Lung",
    "MureungHill.mp3": "Mu Lung",
    "MureungSchool1.mp3": "Mu Lung",
    "MureungSchool2.mp3": "Mu Lung",
    "MureungSchool3.mp3": "Mu Lung",
    "MureungSchool4.mp3": "Mu Lung",
    "MushCatle.mp3": "Mushroom Castle",
    "Nautilus.mp3": "Nautilus",
    "Nightmare.mp3": "Perion",
    "NLChunt.mp3": "New Leaf City",
    "NLCtown.mp3": "New Leaf City",
    "NLCupbeat.mp3": "New Leaf City",
    "Odaiba.mp3": "Neo Tokyo",
    "Office.mp3": "Neo Tokyo",
    "Park.mp3": "Neo Tokyo",
    "PartyQuestGL.mp3": "Other",
    "PhantomForest.mp3": "Crimsonwood Keep",
    "Pirate.mp3": "Mu Lung",
    "PlayWithMe.mp3": "Other",
    "PlotOfPixie.mp3": "Orbis",
    "PoisonForest.mp3": "Elin Forest",
    "PoisonForest2.mp3": "Elin Forest",
    "PvP.mp3": "Other",
    "QueensGarden.mp3": "Cygnus Garden",
    "QueensHideout.mp3": "Cygnus Garden",
    "RaindropFlower.mp3": "Cygnus Garden",
    "Remembrance.mp3": "Temple of Time",
    "Repentance.mp3": "Temple of Time",
    "RestNPeace.mp3": "Henesys",
    "Rockbongi1.mp3": "Other",
    "Rockbongi2.mp3": "Other",
    "RoyalsChristmas.mp3": "Events",
    "RuinCastle.mp3": "Party Quest",
    "ShanghaiField.mp3": "Shanghai",
    "shaolin_cangjingge.mp3": "Shaolin Temple",
    "shaolin_daxiongbaodian.mp3": "Shaolin Temple",
    "shaolin_mishi.mp3": "Shaolin Temple",
    "shaolin_shan.mp3": "Shaolin Temple",
    "shaolin_songshan.mp3": "Shaolin Temple",
    "Shinin'Harbor.mp3": "Orbis",
    "ShiningSea.mp3": "Aqua Road",
    "ShopBgm.mp3": "Other",
    "SleepyWood.mp3": "Sleepywood",
    "SnowDrop.mp3": "Other",
    "SnowyVillage.mp3": "El Nath",
    "Subway.mp3": "Kerning City",
    "summerboating01.mp3": "Events",
    "SunsetDesert.mp3": "Ariant",
    "ThaiField.mp3": "Thailand",
    "ThaiTown.mp3": "Thailand",
    "TheWayGrotesque.mp3": "Ludibrium",
    "TheyMenacingYou.mp3": "Ludibrium",
    "TimeAttack.mp3": "Party Quest",
    "Timeless.mp3": "Ludibrium",
    "TimelessB.mp3": "Ludibrium",
    "TimeTemple.mp3": "Temple of Time",
    "Title.mp3": "Other",
    "Tokyosky.mp3": "Neo Tokyo",
    "TowerOfGoddess.mp3": "Party Quest",
    "Ulu_field.mp3": "Singapore",
    "UponTheSky.mp3": "Travel",
    "WaltzForWork.mp3": "Ludibrium",
    "WarmRegard.mp3": "El Nath",
    "WaterWay.mp3": "Party Quest",
    "wedding.mp3": "Amoria",
    "weddingDance.mp3": "Amoria",
    "WelcomeToTheHell.mp3": "Zakum",
    "WhenTheMorningComes.mp3": "Ellinia",
    "WhereverYouAre.mp3": "Ludibrium",
    "WhiteChristmas.mp3": "Events",
    "WhiteChristmas2.mp3": "Events",
    "WhiteHerb.mp3": "Mu Lung",
    "wichTower.mp3": "Events",
    "WolfAndSheep.mp3": "Events",
    "WolfWood.mp3": "El Nath",
    "YoTaipei.mp3": "Taiwan",
    "Yume.mp3": "Showa Town"
}
