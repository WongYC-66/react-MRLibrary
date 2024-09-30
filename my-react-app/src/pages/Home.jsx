import { Form, redirect } from "react-router-dom"
import { useState, useEffect } from "react";
//
import Image from "react-bootstrap/Image"
import FormBS from "react-bootstrap/Form"
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import { AiFillGithub } from "react-icons/ai";
import Card from 'react-bootstrap/Card';

export default function Home() {

    const [quote, setQuote] = useState({ text: '...loading', author: '...loading' })
    const [itemPrices, setItemPrices] = useState({})

    useEffect(() => {

        const fetchQuote = async () => {
            const url = 'https://famous-quotes4.p.rapidapi.com/random?category=inspirational&count=1';
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': '6606d34f47mshecb88aac7233f33p19f723jsn7604c405836b',
                    'x-rapidapi-host': 'famous-quotes4.p.rapidapi.com'
                }
            };

            try {
                const response = await fetch(url, options);
                const result = await response.json();
                if (!result || !result[0]) throw new Error()
                setQuote(result[0])
            } catch (error) {
                console.error("update quote failed at ", url);
                //  use manual quote then
                let idx = Math.floor(Math.random() * MANUAL_QUOTES.length)
                let random_quote = MANUAL_QUOTES[idx]
                setQuote({ author: random_quote.author, text: random_quote.quote })
            }
        }

        const fetchItemPrice = async () => {
            const SHEET_NAME = "Overview"
            const SHEET_ID = "1B3sxmpaW7RGrQAAxAyeR-xS4mdKCTTs_DzgV0qo2p_8"
            const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:text&sheet=${SHEET_NAME}`;
            try {
                const response = await fetch(url);
                let result = await response.text();
                result = result.replace(`google.visualization.Query.setResponse(`, '')
                    .replace(/\)\;$/, '')
                    .slice(7,)
                result = JSON.parse(result)
                // console.log(result)
                if (result.status !== 'ok') throw new Error()

                result = result.table.cols[3].label
                // console.log(result)
                result = result.trim().split(" ")
                let prices = {
                    'cs': result[0],
                    'ws': result[1],
                    'apr': result[2],
                    'apple': result[3],
                }
                setItemPrices(prices)
            } catch (error) {
                console.error("update item prices failed at ", url);
            }
        }

        fetchQuote()
        fetchItemPrice()

    }, [])

    return (
        <div className="home text-center">
            <h2 className="display-6">Welcome to </h2>

            <h2 className="display-5 my-3 p-0">MapleRoyals Library (Un-official)</h2>
            <h5 className="my-3 p-0"> Game version : v92.2 </h5>

            <Form className="d-flex m-5 p-3" method="post" action="/all">
                <FormBS.Control
                    className="p-1 me-3"
                    type="search"
                    placeholder="Global search ..."
                    aria-label="Search"
                    data-bs-theme="light"
                    name="searchName"
                />
                <Button className="w-50" variant="secondary" type="submit">Submit</Button>
            </Form>


            <Image className="w-75" src="/library2.png" />

            {/* Info board */}
            <div className="info-board d-flex flex-wrap justify-content-center align-items-center container-fluid">
                {/* Quote Card */}
                <Card className="m-3 p-3 container-md" style={{ maxWidth: "400px" }}>
                    {/* <Card.Header>Quote</Card.Header> */}
                    <Card.Body>
                        <blockquote className="blockquote mb-0">
                            <p>{quote.text ? quote.text : 'loading...'}</p>
                            <footer className="blockquote-footer">
                                <cite title="Source Title">{quote.author ? quote.author : 'loading ...'}</cite>
                            </footer>
                        </blockquote>
                    </Card.Body>
                </Card>

                {/* Price Table */}
                <Table className="m-3 p-5 container-md" style={{ maxWidth: "400px" }} striped bordered>
                    <thead>
                        <tr><th colSpan={2}>Today's Price from
                            <a target="_blank" href="https://docs.google.com/spreadsheets/d/1B3sxmpaW7RGrQAAxAyeR-xS4mdKCTTs_DzgV0qo2p_8/edit?gid=0#gid=0" className="ms-3 text-decoration-none"> Sylafia's</a>
                        </th></tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Chaos Scroll</td><td> {itemPrices['cs'] || 'loading...'} </td>
                        </tr>
                        <tr>
                            <td>White Scroll</td><td> {itemPrices['ws'] || 'loading...'} </td>
                        </tr>
                        <tr>
                            <td>Ap Reset</td><td> {itemPrices['apr'] || 'loading...'} </td>
                        </tr>
                        <tr>
                            <td>Onyx Apple</td><td> {itemPrices['apple'] || 'loading...'} </td>
                        </tr>
                    </tbody>
                </Table>

            </div>


            <p className="mt-3">Designed and credited to : <a href="https://maplelegends.com/lib/">MapleLegends</a></p>
            <p>This is an unofficial library</p>
            <p>Created by ScottY5C</p>
            <p>Tech Stack : React/Bootstrap/React Router</p>
            <p className="d-flex  align-items-center justify-content-center gap-1">
                <a href="https://anonymous.4open.science/r/react-MRLibrary-36D1/" target="_blank"><AiFillGithub /> </a>
                <span><a href="https://royals.ms/forum/threads/un-official-mapleroyals-library-scottys-version.229606/" target="_blank">Forum Link</a></span>
            </p>
        </div>
    )
}


const MANUAL_QUOTES = [
    { "author": "Nelson Mandela", "quote": "The greatest glory in living lies not in never falling, but in rising every time we fall." },
    { "author": "Walt Disney", "quote": "The way to get started is to quit talking and begin doing." },
    { "author": "Eleanor Roosevelt", "quote": "The future belongs to those who believe in the beauty of their dreams." },
    { "author": "Steve Jobs", "quote": "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work." },
    { "author": "John Lennon", "quote": "Life is what happens when you're busy making other plans." },
    { "author": "Franklin D. Roosevelt", "quote": "The only limit to our realization of tomorrow is our doubts of today." },
    { "author": "Helen Keller", "quote": "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart." },
    { "author": "Aristotle", "quote": "It is during our darkest moments that we must focus to see the light." },
    { "author": "Maya Angelou", "quote": "You will face many defeats in life, but never let yourself be defeated." },
    { "author": "Albert Einstein", "quote": "Life is like riding a bicycle. To keep your balance, you must keep moving." },
    { "author": "Confucius", "quote": "It does not matter how slowly you go as long as you do not stop." },
    { "author": "Oprah Winfrey", "quote": "The biggest adventure you can take is to live the life of your dreams." },
    { "author": "Henry Ford", "quote": "Whether you think you can or you think you can't, you're right." },
    { "author": "Vince Lombardi", "quote": "It's not whether you get knocked down, it's whether you get up." },
    { "author": "Babe Ruth", "quote": "Every strike brings me closer to the next home run." },
    { "author": "Mother Teresa", "quote": "Spread love everywhere you go. Let no one ever come to you without leaving happier." },
    { "author": "Mahatma Gandhi", "quote": "The best way to find yourself is to lose yourself in the service of others." },
    { "author": "Ralph Waldo Emerson", "quote": "Do not go where the path may lead, go instead where there is no path and leave a trail." },
    { "author": "Mark Twain", "quote": "The secret of getting ahead is getting started." },
    { "author": "Theodore Roosevelt", "quote": "Believe you can and you're halfway there." },
    { "author": "Wayne Gretzky", "quote": "You miss 100% of the shots you don't take." },
    { "author": "Tony Robbins", "quote": "The only limit to your impact is your imagination and commitment." },
    { "author": "Bruce Lee", "quote": "The successful warrior is the average man, with laser-like focus." },
    { "author": "Dr. Seuss", "quote": "Don't cry because it's over, smile because it happened." },
    { "author": "Winston Churchill", "quote": "Success is not final, failure is not fatal: It is the courage to continue that counts." },
    { "author": "Michael Jordan", "quote": "I've missed more than 9000 shots in my career. I've lost almost 300 games. I've been trusted to take the game winning shot and missed. I've failed over and over and over again in my life. And that is why I succeed." },
    { "author": "Napoleon Hill", "quote": "Whatever the mind of man can conceive and believe, it can achieve." },
    { "author": "Zig Ziglar", "quote": "People often say that motivation doesn't last. Well, neither does bathing - that's why we recommend it daily." },
    { "author": "Henry David Thoreau", "quote": "Go confidently in the direction of your dreams. Live the life you have imagined." },
    { "author": "Vince Lombardi", "quote": "Perfection is not attainable, but if we chase perfection we can catch excellence." },
    { "author": "Les Brown", "quote": "Shoot for the moon. Even if you miss, you'll land among the stars." },
    { "author": "Jim Rohn", "quote": "Success is nothing more than a few simple disciplines, practiced every day." },
    { "author": "Mark Twain", "quote": "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So throw off the bowlines. Sail away from the safe harbor. Catch the trade winds in your sails. Explore. Dream. Discover." },
    { "author": "Ayn Rand", "quote": "The question isn't who is going to let me; it's who is going to stop me." },
    { "author": "Winston Churchill", "quote": "The pessimist sees difficulty in every opportunity. The optimist sees opportunity in every difficulty." },
    { "author": "Nelson Mandela", "quote": "It always seems impossible until it’s done." },
    { "author": "Albert Einstein", "quote": "Try not to become a man of success. Rather become a man of value." },
    { "author": "Steve Jobs", "quote": "Your time is limited, don't waste it living someone else's life." },
    { "author": "Eleanor Roosevelt", "quote": "Do one thing every day that scares you." },
    { "author": "Helen Keller", "quote": "Keep your face to the sunshine and you cannot see a shadow." },
    { "author": "Steve Jobs", "quote": "The only way to do great work is to love what you do." },
    { "author": "Albert Schweitzer", "quote": "Success is not the key to happiness. Happiness is the key to success. If you love what you are doing, you will be successful." },
    { "author": "Walt Disney", "quote": "All our dreams can come true, if we have the courage to pursue them." },
    { "author": "Confucius", "quote": "When it is obvious that the goals cannot be reached, don't adjust the goals, adjust the action steps." },
    { "author": "Michael Jordan", "quote": "Some people want it to happen, some wish it would happen, others make it happen." },
    { "author": "Zig Ziglar", "quote": "You don’t have to be great to start, but you have to start to be great." },
    { "author": "Norman Vincent Peale", "quote": "Believe in yourself! Have faith in your abilities! Without a humble but reasonable confidence in your own powers you cannot be successful or happy." },
    { "author": "John Wooden", "quote": "Things work out best for those who make the best of how things work out." },
    { "author": "Dalai Lama", "quote": "Happiness is not something ready-made. It comes from your own actions." },
    { "author": "Robert H. Schuller", "quote": "Tough times never last, but tough people do." },
    { "author": "Theodore Roosevelt", "quote": "Do what you can, with what you have, where you are." },
    { "author": "Og Mandino", "quote": "Failure will never overtake me if my determination to succeed is strong enough." },
    { "author": "Arnold Schwarzenegger", "quote": "The mind is the limit. As long as the mind can envision the fact that you can do something, you can do it, as long as you really believe 100 percent." },
    { "author": "Denis Waitley", "quote": "The greatest achievements were at first and for a time dreams. The oak sleeps in the acorn, the bird waits in the egg, and in the highest vision of the soul a waking angel stirs. Dreams are the seedlings of realities." },
    { "author": "Jim Rohn", "quote": "If you are not willing to risk the unusual, you will have to settle for the ordinary." },
    { "author": "Vince Lombardi", "quote": "The difference between a successful person and others is not a lack of strength, not a lack of knowledge, but rather a lack in will." },
    { "author": "Albert Einstein", "quote": "Imagination is more important than knowledge. For knowledge is limited, whereas imagination embraces the entire world, stimulating progress, giving birth to evolution." },
    { "author": "Steve Jobs", "quote": "Innovation distinguishes between a leader and a follower." },
    { "author": "Bill Gates", "quote": "Don't compare yourself with anyone in this world. If you do so, you are insulting yourself." },
    { "author": "Walt Disney", "quote": "The way to get started is to quit talking and begin doing." },
    { "author": "Henry Ford", "quote": "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it." },
    { "author": "Wayne Dyer", "quote": "Go for it now. The future is promised to no one." },
    { "author": "Norman Vincent Peale", "quote": "Change your thoughts and you change your world." },
    { "quote": "Life isn’t about getting and having, it’s about giving and being.", "author": "Kevin Kruse" },
    { "quote": "Whatever the mind of man can conceive and believe, it can achieve.", "author": "Napoleon Hill" },
    { "quote": "Strive not to be a success, but rather to be of value.", "author": "Albert Einstein" },
]