import React from 'react';
import './saved.css';
import axios from 'axios';

const Thumbnail = ({fileID}) => {
    const [loading, setLoading] = React.useState(true);
    const [tn, setTn] = React.useState()

    const getThumbnail = async () => {
         return axios.get(`http://localhost:8000/api/thumbnail/${fileID}`);
    }

    React.useEffect(() => {
        const tnPromise = getThumbnail();

        Promise.all([tnPromise]).then(([tnResponse]) => {
            setTn(tnResponse.data);
            setLoading(false);
        })
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    
    if (loading)
        return (<div className="loading-space"><h1>Loading</h1></div>)

    return (
        <img alt="lol" className="thumbnail-image" src={`data:image/png;base64,${tn}`}/>
    )
}

export default Thumbnail;