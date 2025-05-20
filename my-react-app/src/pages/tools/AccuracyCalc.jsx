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

    const magicAcc = getMagicalAccuracy(playerStats)

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
        if (statName == 'playerAcc' || statName == 'playerINT' || statName == 'playerLUK') {     // between 1-9999
            val = Math.min(9999, Number(val))
            val = Math.max(1, Number(val))
        }

        newStats[statName] = val
        setPlayerStats(newStats)
    }
    // console.log(playerStats)

    return (
        <div className="accuracy-tab d-flex flex-column">

            {/* Player Stats Input */}
            <div className="d-flex w-100">
                {/* {Left - Warrior/Mage Img} */}
                <div className="me-3">
                    <img src={playerStats.isMage ? '/images/accuracy_calc/mage.png' : '/images/accuracy_calc/warrior.png'}
                        alt="warriorPic"
                        className="rounded-3"
                        onClick={() => handlePlayerStatsChange('isMage', !playerStats.isMage)}
                        style={{ cursor: 'pointer' }}>
                    </img>
                </div>

                {/* Right  - Level / Acc / INT / LUK */}
                <div className="d-flex gap-2">
                    {/* Player Level */}
                    <FloatingLabel
                        controlId="floatingLevel"
                        label="Player Level"
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

                    {/* Physical Accuracy */}
                    {!playerStats.isMage &&
                        <FloatingLabel
                            controlId="floatingAccuracy"
                            label="Accuracy"
                            className="h-100"
                            style={{ fontSize: '1.5rem', minWidth: '2.5rem' }}
                        >
                            <FormBS.Control aria-label="playerAccuracy" type="Number" min='1' max='9999'
                                value={playerStats.playerAcc}
                                onChange={e => handlePlayerStatsChange('playerAcc', e.target.value)}
                                style={{ fontSize: '3rem' }}
                                className="text-center h-100"
                                disabled={playerStats.isMage}>
                            </FormBS.Control>
                        </FloatingLabel>
                    }

                    {/* Magic INT */}
                    {playerStats.isMage &&
                        <FloatingLabel
                            controlId="floatingINT"
                            label="INT"
                            className="h-100"
                            style={{ fontSize: '1.5rem', minWidth: '2.5rem' }}
                        >
                            <FormBS.Control aria-label="playerINT" type="Number" min='1' max='9999'
                                value={playerStats.playerINT}
                                onChange={e => handlePlayerStatsChange('playerINT', e.target.value)}
                                style={{ fontSize: '3rem' }}
                                className="text-center h-100"
                                disabled={!playerStats.isMage}>
                            </FormBS.Control>
                        </FloatingLabel>
                    }

                    {/* Magic LUK */}
                    {playerStats.isMage &&
                        <FloatingLabel
                            controlId="floatingLUK"
                            label="LUK"
                            className="h-100"
                            style={{ fontSize: '1.5rem', minWidth: '2.5rem' }}
                        >
                            <FormBS.Control aria-label="playerLUK" type="Number" min='1' max='9999'
                                value={playerStats.playerLUK}
                                onChange={e => handlePlayerStatsChange('playerLUK', e.target.value)}
                                style={{ fontSize: '3rem' }}
                                className="text-center h-100"
                                disabled={!playerStats.isMage}>
                            </FormBS.Control>
                        </FloatingLabel>
                    }

                </div>


            </div>

            {/* Magic Accuracy for mage */}
            {playerStats.isMage && <p className="w-100 text-end">Magic Accuracy : {magicAcc}</p>}

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

                        {/* Physical  Accuracy*/}
                        {!playerStats.isMage && <th>Hit rate (mrsoupman's)</th>}
                        {!playerStats.isMage && <th>Hit rate (ayumilove's)</th>}
                        {!playerStats.isMage && <th>Accuracy for (100%)</th>}

                        {/* Magic  Accuracy*/}
                        {playerStats.isMage && <th>Hit rate (ayumilove's)</th>}
                        {playerStats.isMage && <th>Accuracy for (100%)</th>}
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
            <p className="my-0">Source_4 : <a href="https://ayumilovemaple.wordpress.com/2009/09/06/maplestory-formula-compilation/" target="_blank">Ayumilove</a></p>
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

    // console.log(filteredMobList)
    return filteredMobList.map(x => {
        const mobId = x[0]
        const accuracyToHitNoMissPhysical = calculateAccForNoMissPhysical(x[1], playerStats)
        const currentPhysicalHitRate = calculatePhysicalHitRate(accuracyToHitNoMissPhysical, playerStats)
        const currentPhysicalHitRate2 = calculatePhysicalHitRate2(x[1], playerStats)

        const accuracyToHitNoMissMagic = calculateAccForNoMissMagic(x[1], playerStats)
        // const currentMagicalHitRate = calculateMagicalHitRate(x[1], playerStats)
        const currentMagicalHitRate = calculateMagicalHitRate(accuracyToHitNoMissMagic, playerStats)


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

                {/* Physical Accuracy */}
                {!playerStats.isMage && <td>{currentPhysicalHitRate.toFixed(1)}%</td>}
                {!playerStats.isMage && <td>{currentPhysicalHitRate2.toFixed(1)}%</td>}
                {!playerStats.isMage && <td>{accuracyToHitNoMissPhysical}</td>}

                {/* Magical Accuracy */}
                {playerStats.isMage && <td>{currentMagicalHitRate.toFixed(1)}%</td>}
                {playerStats.isMage && <td>{accuracyToHitNoMissMagic}</td>}

            </tr>
        )
    })
}

const calculateAccForNoMissPhysical = (mobStats, playerStats) => {
    // https://royals.ms/forum/threads/horntail-party-quest-bossing-guide.6152/
    // https://ayumilovemaple.wordpress.com/2008/09/03/maplestory-accuracy-calculator-how-to-100-hit-without-miss/

    // formula for Accuracy required for 100% HIT rate :
    // = (55+2*lvl difference) * mob avoid/15 
    // = (55+2*5)*30/15 = 120

    const mobAvoid = getMobAvoid(mobStats)
    const levelDiff = getLevelDiff(mobStats, playerStats)

    return Math.ceil((55 + 2 * levelDiff) * (mobAvoid) / 15)
}

const calculatePhysicalHitRate = (accuracyToHitNoMiss, playerStats) => {
    // view-source:https://mrsoupman.github.io/Maple-ACC-calculator/

    // formula of player current hit rate on this mob
    // = (char Accuracy - 0.5 x accuracyToHitNoMiss) / (0.5 x accuracyToHitNoMiss)
    // = (35 - 0.5 x 92) / (0.5 x 92)

    let hitRate = (playerStats.playerAcc - 0.5 * accuracyToHitNoMiss) / (0.5 * accuracyToHitNoMiss)
    hitRate = Math.max(0, hitRate)
    hitRate = Math.min(1, hitRate)

    return hitRate * 100
}

const calculatePhysicalHitRate2 = (mobStats, playerStats) => {
    // https://ayumilovemaple.wordpress.com/2009/09/06/maplestory-formula-compilation/

    // Chance to Hit = Accuracy/((1.84 + 0.07 * D) * Avoid) - 1
    // (D = monster level - your level. If negative, make it 0.)

    const levelDiff = getLevelDiff(mobStats, playerStats)
    const mobAvoid = getMobAvoid(mobStats)

    let hitRate = playerStats.playerAcc / ((1.84 + 0.07 * levelDiff) * mobAvoid) - 1
    hitRate = Math.max(0, hitRate)
    hitRate = Math.min(1, hitRate)

    return hitRate * 100
}

// const calculateMagicalHitRate = (mobStats, playerStats) => {
const calculateMagicalHitRate = (accuracyToHitNoMissMagic, playerStats) => {
    // BUGGY - NOT WORKING
    // https://ayumilovemaple.wordpress.com/2009/09/06/maplestory-formula-compilation/

    //  Magical Accuracy:
    //  Thikket and Nekonecat's version:
    //  Quote:
    //  Let x = (trunc(INT/10) + trunc(LUK/10))/(Avoid+1)*(1+0.0415*D), where D is the level difference between the player and the monster.
    //  Then
    //  hitrate% = -2.5795x^2 + 5.2343x - 1.6749


    // const levelDiff = getLevelDiff(mobStats, playerStats)
    // const mobAvoid = getMobAvoid(mobStats)

    // let x = Math.floor(playerStats.playerINT / 10) + Math.floor(playerStats.playerLUK / 10)
    // x /= (mobAvoid + 1)
    // x *= (1 + 0.0415 * levelDiff)

    // let hitRate = -2.5795 * (x ** 2) + (5.2343 * x) - 1.6749
    // console.log(x, hitRate)
    // hitRate = Math.min(1, hitRate)
    // hitRate = Math.max(0, hitRate)
    // return hitRate * 100

    // A Direct port from mrsoupman formula
    let currAcc = getMagicalAccuracy(playerStats)
    if (currAcc >= accuracyToHitNoMissMagic) return 100

    let acc100 = accuracyToHitNoMissMagic
    let acc1 = Math.round(0.41 * acc100)
    let accPart = (currAcc - acc1 + 1) / (acc100 - acc1 + 1)
    let accRatio = ((-0.7011618132 * Math.pow(accPart, 2)) + (1.702139835 * accPart));
    accRatio = Math.max(0, accRatio)
    accRatio = Math.min(1, accRatio)
    return accRatio * 100
}

const calculateAccForNoMissMagic = (mobStats, playerStats) => {
    // https://ayumilovemaple.wordpress.com/2009/09/06/maplestory-formula-compilation/

    // Stianweij's version:
    // Quote:
    // Magic Accuracy = trunc(total int/10)+ trunc(luk/10) (source: Sleepywood forum)

    // Accuracy to hit 100% = (Avoid+1)(1+D/24) = (34+1)*(1+(100-68)/24) = 81.67 (** this formula is simplified by myself, slighly differs from the one found in SW thread)
    // Min Accuracy to hit at all = Max Accuracy *10/24

    // D = level difference

    const levelDiff = getLevelDiff(mobStats, playerStats)
    const mobAvoid = getMobAvoid(mobStats)

    return Math.ceil((mobAvoid + 1) * (1 + levelDiff / 24));
}

const getLevelDiff = (mobStats, playerStats) => {
    let { level: mobLevel } = mobStats
    mobLevel = Number(mobLevel) || 0

    let levelDiff = mobLevel - playerStats.playerLevel
    levelDiff = Math.max(0, levelDiff)

    return levelDiff
}

const getMobAvoid = (mobStats) => {
    const { eva: mobAvoid } = mobStats
    return Number(mobAvoid) || 0
}

const getMagicalAccuracy = (playerStats) => {
    return Math.floor(playerStats.playerINT / 10) + Math.floor(playerStats.playerLUK / 10)
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
