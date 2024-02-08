import { Navigate, useSearchParams, Form, useActionData, redirect } from "react-router-dom"
import { useEffect } from "react"
// 
import FormBS from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table"
// 
import data_mob from "../../data/data_Mob.json"
import data_mobStats from "../../data/data_MobStats.json"

export default function Monster() {
    // const [searchParams] = useSearchParams()
    useEffect(() => {
        Object.entries(data_mob).forEach(mob => {
            const mobId = mob[0]
            const mobName = mob[1]
            if (data_mobStats.hasOwnProperty(mobId)) {
                data_mobStats[mobId] = { ...data_mobStats[mobId], name: mobName }
            }
        })
    }, [])

    const renderMobList = (data_mobStats) => {
        console.log(data_mobStats)
    }
    // const name = searchParams.get('name')

    return (
        <div className="monster">
            {/* { name && <p>Hi, {name}!</p>} */}
            <Form method="post" action="/monster">

                <Table className="text-center" borderless>
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
                                <FormBS.Select aria-label="order by" data-bs-theme="light">
                                    <option value="id">Id</option>
                                    <option value="level">Level</option>
                                    <option value="exp">Exp</option>
                                    <option value="hp">Hp</option>
                                </FormBS.Select>
                            </td>
                            <td className="bg-transparent">
                                <FormBS.Select aria-label="sort by" data-bs-theme="light">
                                    <option value="ascending">Ascending</option>
                                    <option value="descending">Descending</option>
                                </FormBS.Select>
                            </td>
                        </tr>
                    </tbody>
                </Table>

                <div className="d-flex">
                    <FormBS.Control
                        type="search"
                        placeholder=" Search ..."
                        className="me-3"
                        aria-label="Search"
                        data-bs-theme="light"
                    />
                    <Button variant="secondary" type="submit" className="w-50">Search</Button>
                </div>

            </Form>

        </div>

    )
}

export const monsterAction = async ({ request }) => {
    const data = await request.formData()
    console.log(data)

    const submission = {
    }
  
    console.log(submission)
    
    // send your post request . ajax
  
    // redirect the user
    return redirect('/monster')
  }
  