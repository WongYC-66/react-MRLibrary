import { Link, useLoaderData } from "react-router-dom"

export default function Careers() {
  const careers = useLoaderData()

  return (
    <div className="careers">
      {careers.map(career => (
        <Link to={career.id.toString()} key={career.id}>
          <p>{career.title} <span>Based in {career.location}</span> </p>
        </Link>
      ))}
    </div>
  )
}

// data loader
export const careersLoader = async () => {
  // const res = await fetch('http://localhost:4000/careers')
  // if (!res.ok) {
  //   throw Error('Could not fetch the list of careers')
  // }
  // return res.json()

  // my fake simulation
  const res = await fetchSimulation(2000)
  if (!res) {
    throw Error("Could not fetch the list of careers")
  }
  return res
}

import { careers } from "../../../data/db.json"
const fetchSimulation = millisec =>{
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(careers), millisec)
  })
}