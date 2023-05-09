import axios from 'axios';

export const fetchData = (fileID) => {
    const tnPromise = fetchThumbnail(fileID);

    return {
        tn: wrapPromise(tnPromise),
    }
}

const wrapPromise = (promise) => {
    // set initial status
    let status = 'pending'
    let result;
    let suspender = promise.then(
        res => {
            status = 'success';
            result = res;
        },
        err => {
            status = 'error';
            result = err;
        }
    );

    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            }
            else if (status === 'error') {
                throw result;
            }
            else if (status === 'sucess' ) {
                return result;
            }
        }
    }
}

const fetchThumbnail = (fileID) => {
    console.log('fetching thumbnail')
    return axios.get(`http://localhost:8000/api/thumbnail/${fileID}`)
    .then(res => res.data)
    .catch(err => console.log(err))
}