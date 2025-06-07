import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const ApiDocs = ({ url }) => {
    const [markdown, setMarkdown] = useState('');

    // console.log(url)

    useEffect(() => {
        fetch(url)
            .then((res) => res.text())
            .then(res => setMarkdown(res));
    }, []);

    return (
        <div className="p-3 mx-auto">
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {markdown}
            </ReactMarkdown>
        </div>
    );
};

export default ApiDocs;