
export default function AboutMe() {

    // console.log(data_ExpTable)

    return (
        <div className="about-me text-center d-flex flex-column justify-content-center align-items-center">
            <h3>About us </h3>
            <h5>Librarian</h5>
            <div className="librarian my-3">
                <img src='/images/about_me/scotty5c.png'></img>

            </div>

            <h5>Contributors</h5>
            <div className="book-donator d-flex flex-wrap my-3">
                <img src='/images/about_me/pavlord_2.png' className="mx-3"></img>
                <img src='/images/about_me/xhugo.png' className="mx-3"></img>
            </div>


        </div>
    )
}