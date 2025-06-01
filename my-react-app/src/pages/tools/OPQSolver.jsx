import { useState, useMemo } from "react"
import { Link } from "react-router-dom"

// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Accordion from 'react-bootstrap/Accordion';
// 

export function OPQSolver() {
    // universal solver for APQ / OPQ

    const [eliminated, setEliminated] = useState(new Set());
    const [log, setLog] = useState([])
    const [prevGuess, setPrevGuess] = useState(null)

    const allGuess = useMemo(generateAllGuess, [])

    const nextGuess = getBestGuessWithMinMove(allGuess, prevGuess, eliminated)

    const handleFeedback = (matchCount) => {
        let currentGuess = nextGuess

        let nextEliminated = new Set(eliminated)
        const toBeEliminated = generateArrayOfEliminated(allGuess, currentGuess, matchCount)

        for (let el of toBeEliminated) {
            nextEliminated.add(el)
        }

        setEliminated(nextEliminated)
        setPrevGuess(currentGuess)

        // update log if havent reach end, 256 = end = no more remaining
        if (nextEliminated.size != 21) setLog(prevLog => [...prevLog, createNextLog(prevLog, currentGuess, matchCount)])

    }

    const handleResetBtnClick = () => {
        setPrevGuess(null)
        setLog([])
        setEliminated(new Set())
    }


    return (
        <div className="d-flex flex-column p-3">
            <div className="instruction">
                {/* <h4 className="text-danger"> Pending to test, use it at your own risk !</h4> */}
                <h4>APQ stage-2 / OPQ's sealed room solver</h4>
                <h5>Instructions</h5>
                <p>Start with "500", click and read info from npc, then submit the feedback here, you will see next guess prepared for you.</p>

                {/* Example */}
                <Accordion defaultActiveKey="null">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>E.g.</Accordion.Header>
                        <Accordion.Body>
                            <p className="m-0">OPQ:</p>
                            {/* https://royals.ms/forum/threads/un-official-mapleroyals-library-scottys-version.229606/page-6#post-1535239 */}
                            <p className="m-0 ms-3">All platforms weigh <span className="fw-bolder"> differently </span> </p>
                            <p className="m-0 ms-3">The weight on platform 1 is <span className="fw-bolder"> correct </span></p>

                            <p className="m-0">APQ:</p>
                            {/* https://www.youtube.com/watch?v=O8ApWQBl9is&t=186s */}
                            <p className="m-0 ms-3"> All the steps weigh <span className="fw-bolder"> different </span> </p>
                            <p className="m-0 ms-3"> All 1 steps weigh the <span className="fw-bolder"> same </span> </p>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

            </div>

            <hr></hr>

            <div className="next-guess">
                <h4>Next guess:</h4>
                <div className="d-flex justify-content-around">
                    <img src='/images/opq_solver/apq.png' className="w-25"></img>
                    <img src='/images/opq_solver/opq.jpeg' className="w-25"></img>
                </div>


                {/* dynamically load next guess */}
                <Table striped bordered className="mt-3 w-50 mx-auto text-center align-middle">
                    <tbody>
                        <tr>
                            {nextGuess === ''
                                ? <td colSpan={3} className="text-bg-danger">Oopps, no more remaining, please reset solver and in-game puzzle.</td>
                                : nextGuess.split('').map((num, i) =>
                                    <td className="fw-bolder fs-5" key={num + '-' + i}>
                                        {num}
                                    </td>
                                )
                            }
                        </tr>
                    </tbody>
                </Table>
            </div>

            {/* Feedback section */}
            <h4>Feedback:</h4>
            <div className="d-flex justify-content-center gap-3">
                <Button variant="primary" onClick={() => handleFeedback(1)}> Same / Correct </Button>
                <Button variant="primary" onClick={() => handleFeedback(0)}> Different </Button>
            </div>

            {/* Reset Button */}
            <Button variant="primary" className="mt-5 w-25 mx-auto" onClick={handleResetBtnClick}>Reset</Button>

            {/* Log */}
            <section className="history w-75 m-3">

                {log.length >= 1 ? <h5>History</h5> : ''}

                {log.map((text, i) =>
                    <p key={text + i} className="m-0 p-0"> {text}</p>
                )}
            </section>

            <hr></hr>
            {/* show all guesses / remaining */}
            <Accordion defaultActiveKey="null">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Remaining {`(${allGuess.length - eliminated.size})`}</Accordion.Header>
                    <Accordion.Body>
                        <Table bordered className="text-center">
                            {/* 21 = 5 row x 5 col */}
                            <tbody>
                                {Array(5).fill().map((_, rowIdx) =>
                                    <tr key={rowIdx}>{
                                        Array(5).fill().map((_, colIdx) => {
                                            const cellIdx = rowIdx * 5 + colIdx
                                            const isEliminated = eliminated.has(allGuess[cellIdx])

                                            return isEliminated
                                                ? <td key={cellIdx}><span className="opacity-25"> {allGuess[cellIdx]}</span></td>
                                                : <td key={cellIdx}>{allGuess[cellIdx]}</td>
                                        })
                                    }
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>

            {/* Reference */}
            <div className="mt-3">
                <h6>References:</h6>
                Test it at <Link to='/opq-simulator'>My Simulator</Link>
                <p className="m-0">
                    <a href="https://royals.ms/forum/threads/un-official-mapleroyals-library-scottys-version.229606/page-6#post-1535239" target="_blank">NPC's response(OPQ)</a>
                </p>
                <p className="m-0">
                    <a href="https://www.youtube.com/watch?v=O8ApWQBl9is" target="_blank">NPC's response(APQ)</a>
                </p>
            </div>
        </div>)
}

// 
// 
// 
// 

export function OPQSimulator() {

    const [answer, setAnswer] = useState(generateRandomAnswer())
    const [attemptCount, setAttemptCount] = useState(0)
    const [feedback, setFeedback] = useState('')
    const [gameStatus, setGameStatus] = useState('playing')

    const [left, setLeft] = useState(0)
    const [mid, setMid] = useState(0)
    const [right, setRight] = useState(0)

    const isInputValid = (left + mid + right) === 5

    const handleUserInput = (e, which) => {
        let val = Number(e.target.value)
        switch (which) {
            case 'left':
                setLeft(val)
                break;
            case 'mid':
                setMid(val)
                break;
            case 'right':
                setRight(val)
                break;
            default:
                break
        }
    }


    const handleSubmit = () => {
        if (gameStatus !== 'playing') return

        let guess = `${left}${mid}${right}`

        const { hasWin, feedback } = getFeedback(guess, answer)

        setAttemptCount(prev => prev + 1)
        setFeedback(feedback)

        if (hasWin) {
            setGameStatus('win')
        } else if (attemptCount === 6) {
            // when submit, next = 7th attempt, and havent win, = lose
            setGameStatus('lose')
        }
    }

    const handlePlayAgain = () => {
        setAttemptCount(0)
        setFeedback('')
        setGameStatus('playing')
        setAnswer(generateRandomAnswer())

        setLeft(0)
        setMid(0)
        setRight(0)
    }

    return (
        <div className="d-flex flex-column p-3">
            <h4>APQ stage-2 / OPQ's sealed room simulator</h4>

            {/* Attempt Count */}
            <h5 className="m-3 text-center opacity-50">Attempt : {attemptCount} / 7</h5>

            {/* Playing Screen, user input, button, feedback */}
            {gameStatus === 'playing' && <div className="d-flex flex-column m-0 p-0">
                <Table borderless className="mx-auto align-middle">
                    <tbody>
                        <tr>
                            <td className="d-flex flex-column justify-content-center align-items-center">
                                <img src='/images/npcs/2013001.png'></img>
                                <h6>Chamberlain Eak</h6>
                            </td>
                            <td>{/* fillter */}</td>
                            <td>{/* fillter */}</td>
                            <td>{/* fillter */}</td>
                            <td>{/* fillter */}</td>
                        </tr>
                        <tr>
                            <td>{/* fillter */}</td>
                            <td>
                                <FormBS.Select id="left-count" value={left} onChange={e => handleUserInput(e, 'left')}>
                                    <option value='0'>0</option>
                                    <option value='1'>1</option>
                                    <option value='2'>2</option>
                                    <option value='3'>3</option>
                                    <option value='4'>4</option>
                                    <option value='5'>5</option>
                                </FormBS.Select>
                            </td>
                            <td>
                                <FormBS.Select id="mid-count" value={mid} onChange={e => handleUserInput(e, 'mid')}>
                                    <option value='0'>0</option>
                                    <option value='1'>1</option>
                                    <option value='2'>2</option>
                                    <option value='3'>3</option>
                                    <option value='4'>4</option>
                                    <option value='5'>5</option>
                                </FormBS.Select>
                            </td>
                            <td>
                                <FormBS.Select id="right-count" value={right} onChange={e => handleUserInput(e, 'right')}>
                                    <option value='0'>0</option>
                                    <option value='1'>1</option>
                                    <option value='2'>2</option>
                                    <option value='3'>3</option>
                                    <option value='4'>4</option>
                                    <option value='5'>5</option>
                                </FormBS.Select>
                            </td>
                            <td>{/* fillter */}</td>
                        </tr>
                        <tr>
                            <td>{/* fillter */}</td>
                            <td>{/* fillter */}</td>
                            <td>{/* fillter */}</td>
                            <td>{/* fillter */}</td>
                            <td className="d-flex flex-column justify-content-center align-items-center">
                                <img src='/images/npcs/9201044.png'></img>
                                <h6>Amos The Strong</h6>
                            </td>
                        </tr>
                    </tbody>
                </Table>

                {/* Submit Button */}
                <Button variant={isInputValid ? "primary" : "secondary"} className="w-25 mx-auto" disabled={!isInputValid} onClick={handleSubmit}>Submit Answer</Button>

                {/* Game Feedback section */}
                <div className="npc-feedback my-3 p-3 bg-body-secondary" style={{ height: 100 }}>
                    <p dangerouslySetInnerHTML={{ __html: feedback }}></p>
                    {/* {feedback} */}
                </div>
            </div>}

            {/* Lose Screen*/}
            {gameStatus === 'lose' &&
                <div className="text-center">
                    <p>The actual answer is : <span className="fw-bold text-danger">{answer}</span></p>
                    <Button variant="primary" className="w-25 mx-auto my-3" onClick={handlePlayAgain}>Play Again</Button>
                </div>
            }

            {/* Win Screen*/}
            {gameStatus === 'win' &&
                <div className="text-center">
                    <h1 className="text-warning-emphasis">You Won ! </h1>
                    <p className="text-center">The actual answer is : <span className="fw-bold text-success">{answer}</span></p>
                    <Button variant="primary" className="w-25 mx-auto my-3" onClick={handlePlayAgain}>Play Again</Button>
                </div>
            }

            {/* Show Actual Answer */}
            <Accordion defaultActiveKey="null">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Show Answer</Accordion.Header>
                    <Accordion.Body>{answer}</Accordion.Body>
                </Accordion.Item>
            </Accordion>


            <hr></hr>

            {/* Reference */}
            <section className="mt-3">
                <h6>References:</h6>
                <p className="ms-3"><Link to='/opq-solver'>My Solver</Link></p>
                <p className="ms-3">
                    <a href="https://forum.dream.ms/threads/orbis-pq-guide.9872/" target="_blank">dreamMS OPQ guide</a>
                </p>
            </section>
        </div >
    )
}

// ------------------ helper fn ------------------------

const generateRandomAnswer = () => {
    const allPossibleAnswers = generateAllGuess()
    let randomIdx = Math.floor(Math.random() * allPossibleAnswers.length)
    return allPossibleAnswers[randomIdx]
}

const generateAllGuess = () => {

    // 3 spot, _ _ _
    // from 0 - 5, sum of all must be 5
    // e.g. 500, 410, 032, 005

    let allGuess = []

    for (let i = 0; i <= 5; i++) {
        for (let j = 0; j <= 5; j++) {
            for (let k = 0; k <= 5; k++) {
                let total = i + j + k
                if (total !== 5) continue
                allGuess.push(`${i}${j}${k}`)
            }
        }
    }

    // start with '500'
    let firstGuess = '500'
    let idx = allGuess.indexOf(firstGuess)
    allGuess.splice(idx, 1)
    allGuess.unshift(firstGuess)

    return allGuess
}

const getFeedback = (guess, answer) => {
    let sameSlotCount = 0
    for (let i = 0; i < 3; i++) {
        sameSlotCount += (guess[i] == answer[i])
    }

    let feedback = ''
    let hasWin = false

    if (sameSlotCount === 3) {
        hasWin = true
    } else if (sameSlotCount === 0) {
        feedback = `
            <p> OPQ : All platforms weigh differently </p>
            <p> APQ : All the steps weigh different </p>
        `
    } else {
        // 1 match
        feedback = `
            <p> OPQ : The weight on platform 1 is correct </p>
            <p> APQ : All 1 steps weigh the same </p>
        `
    }

    return { hasWin, feedback }
}

// -------------- solver logic below -----------------------------

const getBestGuessWithMinMove = (allGuess, prevGuess, eliminated) => {

    let validGuess = allGuess.filter(code => !eliminated.has(code))
    if (!validGuess.length) return ''

    if (!prevGuess) return validGuess[0]

    validGuess = validGuess.map(code => [code, getTotalNumDiff(code, prevGuess)])

    validGuess.sort((a, b) => a[1] - b[1])  // sort, the fewest step to move sort at front

    return validGuess[0][0]
}

const getTotalNumDiff = (str1, str2) => {
    let diff = 0
    for (let i = 0; i < 3; i++) {
        diff += Math.abs(str1[i] - str2[i])
    }
    return diff
}

const createNextLog = (prevLog, currentGuess, feedback) => {
    return `${prevLog.length + 1}. ${currentGuess} - ${feedback}`
}

const generateArrayOfEliminated = (allGuess, currentGuess, feedbackCount) => {


    // return array of codes which unmatch the feedback from npc
    let unmatched = []

    for (let guess of allGuess) {
        // for each guess, count how many Correct/Incorrect/Unknown to our currentGuess
        // then compare the npcSequence to see if matched

        let currMatch = 0

        // count correct positions
        for (let i = 0; i < 3; i++) {
            currMatch += (guess[i] === currentGuess[i])
        }

        // found unmatched, can be elimnated
        if (currMatch !== feedbackCount) {
            unmatched.push(guess)
        }
    }

    return unmatched
}