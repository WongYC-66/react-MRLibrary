import Table from 'react-bootstrap/Table';
// 
import data_ExpTable from "../../../data/data_ExpTable.json"

export default function ExpTable() {

    console.log(data_ExpTable)

    return (
        <div className="exp-table">
            <Table striped className='text-center'>
                <tbody>
                    <tr>
                        <th>Level</th>
                        <th>Exp to level up</th>
                        <th>Accumulated Exp</th>
                    </tr>
                    {data_ExpTable.map(x => {
                        return (
                            <tr>
                                <td>{x.level}</td>
                                <td>{x.exp}</td>
                                <td>{x.accumulatedExp}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </Table>

            <p>Source : <a href="https://bbb.hidden-street.net/experience-table" target="_blank">bbb hidden-street</a></p>
        </div>
    )
}