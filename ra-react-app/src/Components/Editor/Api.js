import axios from 'axios';

export const fetchData = (fileID) => {
    const filePromise = fetchFile();
    const objectsPromise = fetchPosts();

    return {
        file: wrapPromise(filePromise),
        objects: wrapPromise(objectsPromise)
    }
}

const wrapPromise = (promise) => 
{
    // Set initial status
    let status = 'pending';
    // Store result
    let result;
    // Wait for promise
    let suspender = promise.then(
        res => {
            status = 'success';
            result = res;
        },
        err => {
            status = 'success';
            result = err;
        },
    );

    return {
        read() {
            if (status === 'pending') {
                throw suspender;
            }
            else if (status === 'error') {
                throw result;
            }
            else if (status === 'success') {
                return result;
            }
        }
    }
}

const fetchFile = (fileID) => {
    console.log("Fetch Data")
    axios.get(`http://localhost:8000/api/files/${fileID}/`)
    .then(res => res.data)
    .catch(err => console.log(err));
}

const fetchObjects = (fileID) => {
    console.log("Fetch Objects")
    axios.get(`http://localhost:8000/api/ro/file/${fileID}/`)
    .then(res => res.data)
    .catch(err => console.log(err));
}