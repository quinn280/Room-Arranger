import axios from 'axios';

export const getFileDB = async (fileID) => {
    return axios.get(`http://localhost:8000/api/files/${fileID}/`);
};

  export const updateFileDB = async (fileID, fileObj) => {
    return axios.put(`http://localhost:8000/api/files/${fileID}/`, fileObj);
  };

  export const getObjectsDB = async (fileID) => {
    return axios.get(`http://localhost:8000/api/ro/file/${fileID}/`);
  }

  export const addObjectDB = async (obj) => {
    return axios.post(`http://localhost:8000/api/ro/`, obj);
  }

  export const updateObjectDB = async (obj, uid) => {
    return axios.put(`http://localhost:8000/api/ro/${uid}/`, obj);
  }

  export const removeObjectsArrayDB = async (uidArray) => {
    return axios.post(`http://localhost:8000/api/ro/DeleteAllByID/`, uidArray);
  }