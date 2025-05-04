import { useState, useMemo } from "react"
import { Link } from "react-router-dom"

// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Accordion from 'react-bootstrap/Accordion';
// 

export function OPQSolver() {
    return (
        <div className="d-flex flex-column p-3">
            <div className="instruction">
                <h4>Instructions</h4>
                <p>Start with "500", click and read info from npc, then submit the feedback here, you will see next guess prepared for you.</p>

                {/* Example */}
                <Accordion defaultActiveKey="null">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header>E.g.</Accordion.Header>
                        <Accordion.Body>
                            <p className="m-0 ms-3"><span className="fw-bolder"> 1 </span> agreed the offering is <span className="fw-bolder"> correct </span> </p>
                            <p className="m-0 ms-3"><span className="fw-bolder"> 1 </span>  have declared the offering is <span className="fw-bolder"> incorrect </span> </p>
                            <p className="m-0 ms-3"><span className="fw-bolder"> 2 </span>  have said it's an <span className="fw-bolder"> unknown </span> offering</p>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>

            </div>

            <hr></hr>
            {/* show all guesses / remaining */}
            <Accordion defaultActiveKey="null">
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Remaining {`(${allGuess.length - eliminated.size})`}</Accordion.Header>
                    <Accordion.Body>
                        <Table bordered>
                            {/* 256 = 32 row x 8 col */}
                            <tbody>
                                {Array(32).fill().map((_, rowIdx) =>
                                    <tr key={rowIdx}>{
                                        Array(8).fill().map((_, colIdx) => {
                                            const cellIdx = rowIdx * 8 + colIdx
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

            <p className="ms-3">
                Test it at <Link to='/opq-simulator'>My Simulator</Link>
            </p>
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
                    {feedback}
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
        feedback = '0 platforms match / All the steps weigh different'
    } else {
        // 1 match
        feedback = '1 platform matches / All 1 steps weigh the same'
    }

    return { hasWin, feedback }
}