import { useSearchParams, Form, redirect, useLocation, NavLink, Link } from "react-router-dom"
import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import FloatingLabel from 'react-bootstrap/FloatingLabel';
// 
import { updatePagination } from "../../components/Pagination.jsx"
import { renderImageWithMobId, filterMobList, updateSearchResultCount } from "../monster/utility.jsx"
import data_mob from "../../../data/data_Mob.json"
import data_mobStats from "../../../data/data_MobStats.json"

export default function AccuracyCalc() {
    const [playerStats, setPlayerStats] = useState({
        isMage: false,
        playerLevel: 1,
        playerAcc: 1,
        playerINT: 1,
        playerLUK: 1,
    })
    const [mobLibrary, setMobLibrary] = useState({})

    useEffect(() => {
        Object.entries(data_mob).forEach(([mobId, mobName]) => {
            if (data_mobStats.hasOwnProperty(mobId)) {
                data_mobStats[mobId] = { ...data_mobStats[mobId], name: mobName }
            }
        })
        setMobLibrary(data_mobStats)
    }, [])

    const handleAdvancedSearchClick = (e) => {
        document.getElementById("advanced-table").classList.toggle("d-none")
        e.target.classList.toggle("d-none")
    }

    const handlePlayerStatsChange = (statName, val) => {
        let newStats = { ...playerStats }

        if (statName == 'playerLevel') {   // between 1-200
            val = Math.min(200, Number(val))
            val = Math.max(1, Number(val))
        }
        if (statName == 'playerAcc') {     // between 1-9999
            val = Math.min(9999, Number(val))
            val = Math.max(1, Number(val))
        }

        newStats[statName] = val
        setPlayerStats(newStats)
    }

    return (
        <div className="monster d-flex flex-column">

            {/* Player Stats Input */}
            <div className="d-flex w-100">
                {/* {Left - Warrior Img} */}
                <div className="me-3">
                    <img src={'/images/accuracy_calc/warrior.png'} alt="warriorPic" className="rounded-3"></img>
                </div>

                {/* Right  - Level / Acc / INT / LUK */}
                <div className="d-flex w-50 gap-4">
                    {/* Player Level */}
                    <FloatingLabel
                        controlId="floatingLevel"
                        label="Player Level"
                        className="h-100"
                        style={{ fontSize: '1.5rem', minWidth: '2.5rem' }}
                    >
                        <FormBS.Control aria-label="playerLevel" type="Number" min='1' max='200'
                            value={playerStats.playerLevel}
                            onChange={e => handlePlayerStatsChange('playerLevel', e.target.value)}
                            style={{ fontSize: '3rem' }}
                            className="text-center h-100"
                        >
                        </FormBS.Control>
                    </FloatingLabel>

                    <FloatingLabel
                        controlId="floatingAccuracy"
                        label="Accuracy"
                        className="h-100"
                        style={{ fontSize: '1.5rem', minWidth: '2.5rem' }}
                    >
                        <FormBS.Control aria-label="playerLevel" type="Number" min='1' max='9999'
                            value={playerStats.playerAcc}
                            onChange={e => handlePlayerStatsChange('playerAcc', e.target.value)}
                            style={{ fontSize: '3rem' }}
                            className="text-center h-100">
                        </FormBS.Control>
                    </FloatingLabel>


                </div>
            </div>

            <hr />

            {/* DropDown filter and Search input and Button */}
            <Form method="post" action="/accuracy-calc">
                <div className="d-flex flex-wrap">

                    <div id="advanced-table" className="col-lg-6 flex-grow-1 d-none d-md-block">
                        <Table className="text-center" borderless >
                            <thead>
                                <tr>
                                    <th className="bg-transparent">Filter</th>
                                    <th className="bg-transparent">Order By</th>
                                    <th className="bg-transparent">Sort</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="filter by" data-bs-theme="light" name="filterBy">
                                            <option value="any">Any</option>
                                            <option value="monster">Monster</option>
                                            <option value="boss">Boss</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="order by" data-bs-theme="light" name="orderBy">
                                            <option value="id">Id</option>
                                            <option value="level">Level</option>
                                            <option value="exp">Exp</option>
                                            <option value="maxHP">Hp</option>
                                        </FormBS.Select>
                                    </td>
                                    <td className="bg-transparent">
                                        <FormBS.Select aria-label="sort by" data-bs-theme="light" name="sortBy">
                                            <option value="ascending">Ascending</option>
                                            <option value="descending">Descending</option>
                                        </FormBS.Select>
                                    </td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                    <div className="col-12 flex-grow-1 d-md-none px-2"><Button onClick={handleAdvancedSearchClick} className="w-100" variant="secondary">Advanced Search</Button></div>

                    <div className="col-lg-6 flex-grow-1">
                        <Table className="text-center my-0" borderless >
                            <thead>
                                <tr className="d-none d-lg-block">
                                    <th className="bg-transparent w-100">Name</th>
                                    <th className="bg-transparent"> </th>
                                </tr>
                            </thead>
                            <tbody className="">
                                <tr>
                                    <td className="bg-transparent">
                                        <FormBS.Control
                                            className=""
                                            type="search"
                                            placeholder=" Search ..."
                                            aria-label="Search"
                                            data-bs-theme="light"
                                            name="searchName"
                                        />
                                    </td>
                                    <td className="bg-transparent"><Button variant="secondary" type="submit" className="w-100" >Search</Button></td>
                                </tr>
                            </tbody>
                        </Table>
                    </div>

                </div>
            </Form>
            <p id="record-count" className="m-0 p-0  me-2 text-end"></p>

            {/* Monster Result */}
            <Table className="mt-3">
                <thead>
                    <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Level</th>
                        <th>Hit rate (mrsoupman's)</th>
                        <th>Hit rate(Mana's)</th>
                        <th>Accuracy for (100%)</th>
                    </tr>
                </thead>
                <tbody>
                    {renderMobList(filterMobList(mobLibrary), playerStats)}
                </tbody>
            </Table>

            {/* Pagination */}
            {updatePagination(mobLibrary, filterMobList)}

            {/* References */}
            <p className="my-0">Source_1 : <a href="https://ayumilovemaple.wordpress.com/2008/09/03/maplestory-accuracy-calculator-how-to-100-hit-without-miss/" target="_blank">Ayumilove</a></p>
            <p className="my-0">Source_2 : <a href="https://royals.ms/forum/threads/horntail-party-quest-bossing-guide.6152/" target="_blank">Matts' Horntail Party Quest & Bossing Guide</a></p>
            <p className="my-0">Source_3 : <a href="https://mrsoupman.github.io/Maple-ACC-calculator/" target="_blank">mrsoupman</a></p>
            <p className="my-0">Source_4 : <a href="https://forum.maplelegends.com/index.php?threads/manas-physical-accuracy-guide.55286/" target="_blank">Mana's Physical accuracy guide</a></p>


        </div>

    )
}

const renderMobList = (filteredMobList, playerStats) => {
    const [searchParams] = useSearchParams()

    updateSearchResultCount(filteredMobList.length)

    const pageNum = Number(Object.fromEntries([...searchParams.entries()]).page) || 1
    const sliceStartIndex = (pageNum - 1) * 10
    const sliceEndIndex = sliceStartIndex + 10
    filteredMobList = filteredMobList.slice(sliceStartIndex, sliceEndIndex)
    // [ ["100100", {name: xxx, exp: xxx, maxHP: xxx}], ... ...]

    console.log(filteredMobList)
    return filteredMobList.map(x => {
        const mobId = x[0]
        const accuracyToHitNoMiss = calculateAccForNoMiss(x[1], playerStats)
        const currentHitRate = calculateHitRate(accuracyToHitNoMiss, playerStats)
        const currentHitRate2 = calculateHitRate2(x[1], playerStats)

        return (
            <tr key={x[0]} className="">
                <td>
                    <Link to={`/monster/id=${mobId}`}>
                        {renderImageWithMobId(mobId)}
                    </Link>
                </td>
                <td>
                    <Link to={`/monster/id=${mobId}`}>
                        <p dangerouslySetInnerHTML={{ __html: x[1].name }}></p>
                    </Link>
                </td>
                <td>{x[1].level}</td>
                <td>{currentHitRate.toFixed(1)}%</td>
                <td>{currentHitRate2.toFixed(1)}%</td>
                <td>{accuracyToHitNoMiss}</td>
            </tr>
        )
    })
}

const calculateAccForNoMiss = (mobStats, playerStats) => {
    // https://royals.ms/forum/threads/horntail-party-quest-bossing-guide.6152/
    // https://ayumilovemaple.wordpress.com/2008/09/03/maplestory-accuracy-calculator-how-to-100-hit-without-miss/

    // formula for Accuracy required for 100% HIT rate :
    // = (55+2*lvl difference) * mob avoid/15 
    // = (55+2*5)*30/15 = 120

    const { level: mobLevel, eva: mobAvoid } = mobStats
    let levelDiff = (mobLevel || 0) - playerStats.playerLevel     // mobLevel - playerLevel
    levelDiff = Math.max(0, levelDiff)

    return Math.ceil((55 + 2 * levelDiff) * (mobAvoid) / 15)
}

const calculateHitRate = (accuracyToHitNoMiss, playerStats) => {
    // view-source:https://mrsoupman.github.io/Maple-ACC-calculator/

    // formula of player current hit rate on this mob
    // = (char Accuracy - 0.5 x accuracyToHitNoMiss) / (0.5 x accuracyToHitNoMiss)
    // = (35 - 0.5 x 92) / (0.5 x 92)

    let hitRate = (playerStats.playerAcc - 0.5 * accuracyToHitNoMiss) / (0.5 * accuracyToHitNoMiss)
    hitRate = Math.max(0, hitRate)
    hitRate = Math.min(1, hitRate)

    return hitRate * 100
}

const calculateHitRate2 = (mobStats, playerStats) => {
    // https://forum.maplelegends.com/index.php?threads/manas-physical-accuracy-guide.55286/

    // To find your %chance to hit with your current accuracy :
    // Credit to Ayumilove
    // Accuracy/((1.84 + 0.07 * D) * Avoid) - 1

    const { level: mobLevel, eva: mobAvoid } = mobStats
    let levelDiff = (mobLevel || 0) - playerStats.playerLevel     // mobLevel - playerLevel
    levelDiff = Math.max(0, levelDiff)

    let hitRate = playerStats.playerAcc / ((1.84 + 0.07 * levelDiff) * mobAvoid) - 1
    hitRate = Math.max(0, hitRate)
    hitRate = Math.min(1, hitRate)

    return hitRate * 100
}

export const accuracyAction = async ({ request }) => {
    const data = await request.formData()

    const submission = {
        filterBy: data.get('filterBy'),
        orderBy: data.get('orderBy'),
        sortBy: data.get('sortBy'),
        searchName: data.get('searchName'),
    }
    // console.log(submission)

    // send your post request . ajax
    // ....

    // redirect the user
    const actionUrl = `/accuracy-calc?page=1&filter=${submission.filterBy}&order=${submission.orderBy}&sort=${submission.sortBy}&search=${submission.searchName}`
    return redirect(actionUrl)
}

const numFormatter = num => Number(num).toLocaleString("en-US")
