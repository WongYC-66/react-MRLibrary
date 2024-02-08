import { useLoaderData, useParams } from "react-router-dom"

export default function CareerDetails() {
    const { id } = useParams()
    const career = useLoaderData()

    return (
        <div className="career-details">
            <h2>Career Details for {career.title}</h2>
            <p>Starting salary: {career.salary}</p>
            <p>Location: {career.location}</p>
            <div className="details">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Quos qui asperiores sapiente quae, praesentium deserunt?</p>
            </div>
        </div>
    )
}

// data loader
export const careerDetailsLoader = async ({ params }) => {
    // const { id } = params
    // const res = await fetch('http://localhost:4000/careers/' + id)
    // if (!res.ok) {
    //     throw Error('Could not find that career.')
    // }
    // return res.json()

    // my fake simulation xD
    const { id } = params
    const res = await fetchDetailsSimulation(id, 500)
    if (!res) {
        throw Error("Could nto find that career")
    }
    return res
}

// import { careers } from "../../../data/db.json"
const fetchDetailsSimulation = (id, millisec) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => resolve(careers[id]), millisec)
    })
}