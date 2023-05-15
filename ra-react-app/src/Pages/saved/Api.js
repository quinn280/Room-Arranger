import axios from 'axios';

export const getFiles = async () => {
    return axios.get("http://localhost:8000/api/files/");
};

export const deleteFile = async (fileID) => {
    axios.delete(`http://localhost:8000/api/files/${fileID}/`);
}

export const deleteObjAtFile = async (fileID) =>
{
    axios.delete(`http://localhost:8000/api/ro/file/${fileID}/`);
}

export const updateFile = async (fileID, fileObj) => {
    axios.put(`http://localhost:8000/api/files/${fileID}/`, fileObj);
};

export const addFile = async(fileObj) => {
    axios.post(`http://localhost:8000/api/files/`, fileObj);
}
