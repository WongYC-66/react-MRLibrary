import { useState, useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
import Accordion from 'react-bootstrap/Accordion';
// 

export default function GPQSolver() {

    const [allGuess, setAllGuess] = useState([]);
    const [eliminated, setEliminated] = useState(new Set([]));
    const [log, setLog] = useState([])

    useEffect(() => {
        // generate 256 combination from "SSSS" to "WWWW" when intially loadeded
        // ie. 4x4x4x4
        const choice = ["S", "M", "W", "F"]
        const tmpArr = []

        for (let c1 of choice) {
            for (let c2 of choice) {
                for (let c3 of choice) {
                    for (let c4 of choice) {
                        let guess = `${c1}${c2}${c3}${c4}`
                        tmpArr.push(guess)
                    }
                }
            }
        }

        setAllGuess(tmpArr)
    }, [])

    // next guess = any first guess which is not in the wrongGuess list
    const nextGuess = allGuess.find(guess => !eliminated.has(guess)) || ''

    // hash table, code -> item code
    const charToItemCode = {
        "S": "04001028",
        "M": "04001027",
        "W": "04001030",
        "F": "04001029",
    }

    const generateItemImgTag = (char) => {
        if (!char) return ""
        let itemCode = charToItemCode[char]
        return < img src={`/images/items/${itemCode}.png`}></img >
    }

    const handleNextBtnClick = (currentGuess) => {
        let correctCount = document.getElementById("correct-count").value
        let incorrectCount = document.getElementById("incorrect-count").value
        let unknownCount = document.getElementById("unknown-count").value
        let npcSequence = `${correctCount}${incorrectCount}${unknownCount}`

        if (Number(correctCount) + Number(incorrectCount) + Number(unknownCount) !== 4) {
            alert("Please enter valid feedback from NPC, correct+incorrect+unkown = 4")
            return
        }

        let nextEliminated = new Set(eliminated)
        const toBeEliminated = generateArrayOfEliminated(allGuess, currentGuess, npcSequence)

        for (let el of toBeEliminated) {
            nextEliminated.add(el)
        }

        setEliminated(nextEliminated)

        // update log if havent reach end, 256 = end = no more remaining
        if (nextEliminated.size != 256) setLog(prevLog => [...prevLog, createNextLog(prevLog, currentGuess, npcSequence)])
    }


    const handleResetBtnClick = () => {
        document.getElementById("correct-count").value = '0'
        document.getElementById("incorrect-count").value = '0'
        document.getElementById("unknown-count").value = '0'
        setEliminated(new Set())
        setLog([])
    }

    return (
        <div className="d-flex flex-column p-3">
            <div className="instruction">
                <h4>Instructions</h4>
                <ul>
                    <li>
                        <b>S</b> = <img src='/images/items/04001028.png'></img> Scroll
                    </li>
                    <li>
                        <b>M</b> = <img src='/images/items/04001027.png'></img> Medal
                    </li>
                    <li>
                        <b>W</b> = <img src='/images/items/04001030.png'></img> Wine
                    </li>
                    <li>
                        <b>F</b> = <img src='/images/items/04001029.png'></img> Food
                    </li>
                </ul>

                <h4>Feedback</h4>
                <p>Start with "SSSS", click and read info from npc, then submit the feedback here, you will see next guess prepared for you.</p>
            </div>

            <hr></hr>

            <div className="next-guess">
                <h4>Next guess:</h4>
                <Table striped bordered className="w-25 mx-auto">
                    <tbody>
                        <tr>
                            <td><img src='/images/gpq_solver/left_statue.png'></img></td>
                            <td><img src='/images/gpq_solver/left_mid_statue.png'></img></td>
                            <td><img src='/images/gpq_solver/right_mid_statue.png'></img></td>
                            <td><img src='/images/gpq_solver/right_statue.png'></img></td>
                        </tr>
                        <tr>
                            {/* render the next guess dynamically, icon + legend */}
                            {nextGuess === ''
                                ? <td colSpan={4} className="text-center text-bg-danger">Oopps, no more remaining, please reset.</td>
                                : nextGuess.split('').map((char, i) =>
                                    <td className="text-center fw-bolder" key={char + i}>
                                        {generateItemImgTag(char)}
                                        <span className="ms-3">{char}</span>
                                    </td>
                                )
                            }
                        </tr>
                    </tbody>
                </Table>
            </div>

            {/* Feedback select Correct/Incorrect/Unkown and Next button */}
            <Table className="w-75 mx-auto">
                <thead className="text-center">
                    <tr>
                        <th> Correct </th>
                        <th> Incorrect </th>
                        <th> Unknown </th>
                        <th>  </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="px-3">
                            <FormBS.Select id="correct-count">
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                            </FormBS.Select>
                        </td>

                        <td className="px-3">
                            <FormBS.Select id="incorrect-count">
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                            </FormBS.Select>
                        </td>

                        <td className="px-3">
                            <FormBS.Select id="unknown-count">
                                <option>0</option>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                            </FormBS.Select>
                        </td>

                        <td className="">
                            <Button variant="primary" className="w-100" onClick={() => handleNextBtnClick(nextGuess)}>Next</Button>
                        </td>
                    </tr>
                </tbody>
            </Table>

            {/* Reset Button */}
            <Button variant="primary" className="w-25 mx-auto" onClick={handleResetBtnClick}>Reset</Button>

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



            {/* Reference */}
            <div className="mt-3">
                <h6>References:</h6>
                <p className="ms-3">
                    <a href="https://maplegpq.com/" target="_blank">maplegpq.com</a>
                </p>
                <p className="ms-3">
                    <a href="https://nebupookins.github.io/JS-Mastermind-Solver/" target="_blank">mastermind solver</a>
                </p>
            </div>

        </div>
    )
}

const createNextLog = (prevLog, currentGuess, npcSequence) => {
    return `${prevLog.length + 1}. ${currentGuess} - ${npcSequence}`
}

const generateArrayOfEliminated = (allGuess, currentGuess, npcSequence) => {
    // return array of codes which unmatch the feedback from npc

    let unmatched = []

    for (let guess of allGuess) {
        // for each guess, count how many Correct/Incorrect/Unknown to our currentGuess
        // then compare the npcSequence to see if matched

        let correct = 0
        let incorrect = 0
        let unknown = 0

        let g = [...guess]
        let curr = [...currentGuess]

        // count correct positions
        for (let i = 0; i < 4; i++) {
            if (g[i] === curr[i]) {
                correct += 1
                g[i] = null
                curr[i] = null
            }
        }

        // count incorrect(misplaced) positions
        for (let i = 0; i < 4; i++) {
            if (!curr[i]) continue
            for (let j = 0; j < 4; j++) {
                if (!g[j]) continue
                if (curr[i] == g[j]) {
                    // found item wrongly placed
                    incorrect += 1
                    curr[i] = null
                    g[j] = null
                    break
                }
            }
        }

        unknown = 4 - correct - incorrect

        let thisGuessSeq = `${correct}${incorrect}${unknown}`

        // found unmatched, can be elimnated
        if (thisGuessSeq !== npcSequence) {
            unmatched.push(guess)
        }
    }

    return unmatched
}