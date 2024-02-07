import { useState } from "react"
import { Navigate, useSearchParams } from "react-router-dom"

export default function About() {
    const [user, setUser] = useState('mario')
    const [searchParams] = useSearchParams()

    const name = searchParams.get('name')
    const key = searchParams.get('key')
    const value = searchParams.get('value')
    // try this > http://localhost:5173/about?name=abc
    // try this > http://localhost:5173/about?name=abc&key=mynewkey&value=mynewvalue

    if(! user){
        // return <Navigate to="/" />
        return <Navigate to="/" replace={true}/>
        // replace true, wont leave any browwer history when u go back /forward. 
    }

    return (
        <div className="about">
            { name && <p>Hi, {name}!</p>}
            { key && <p>key : {key}!</p>}
            { value && <p>value : {value}!</p>}

            <h2>About Us</h2>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui provident consequuntur vel omnis quisquam rem harum, maxime expedita, ullam ut dolore! Distinctio eos minima voluptatum totam id hic! Sapiente debitis quia illum officia obcaecati provident nulla odio molestiae suscipit quasi.</p>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui provident consequuntur vel omnis quisquam rem harum, maxime expedita, ullam ut dolore! Distinctio eos minima voluptatum totam id hic! Sapiente debitis quia illum officia obcaecati provident nulla odio molestiae suscipit quasi.</p>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Qui provident consequuntur vel omnis quisquam rem harum, maxime expedita, ullam ut dolore! Distinctio eos minima voluptatum totam id hic! Sapiente debitis quia illum officia obcaecati provident nulla odio molestiae suscipit quasi.</p>
        <button onClick={() => setUser(null)}> Logout </button>
        <p>user is : {user}</p>
        </div>

    )
}