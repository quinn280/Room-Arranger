import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './saved.css';
import axios from 'axios';

const defaultRoomDimensions = {
    width: "168",
    height: "144"
}

const SortTypes = Object.freeze({ alphabetical: "Alphabetical", dateCreated: "Date Created", dateModified: "Date Modified" }) // modes enum
const Modes = Object.freeze({ room: "room", furnish: "furnish" }) // modes enum

const generateUID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function compareByDateCreated(a, b) {
    const aDate = new Date(a.createDate);
    const bDate = new Date(b.createDate);

    if (aDate > bDate)
        return -1;
    if (aDate < bDate)
        return 1;
    return 0;
}

function compareByDateModified(a, b) {
    const aDate = new Date(a.modifiedDate);
    const bDate = new Date(b.modifiedDate);

    if (aDate > bDate)
        return -1;
    if (aDate < bDate)
        return 1;
    return 0;
}

function compareByFileName(a, b) {
    if (a.fileName < b.fileName)
        return -1;
    if (a.fileName > b.fileName)
        return 1;
    return 0;
}

function formatDate(dateString) {
    const today = new Date(Date.now());
    const date = new Date(dateString);

    // return time if today
    if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    else {
        return date.toLocaleDateString("en-US");
    }
}

const Saved = () => {
    const [fileList, setFileList] = useState([]);
    const [sortType, setSortType] = useState((localStorage.sortType) ? JSON.parse(localStorage.sortType) : SortTypes.dateModified);
    const navigate = useNavigate();

    React.useEffect(() => {
        getFiles();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getFiles = async()  => {
        axios.get("http://localhost:8000/api/file-list/")
            .then(response => {
                setFileList(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    };

    const removeFile = async (fileID) => {
        setFileList(fileList.filter(f => f.fileID !== fileID));

        axios.delete(`http://localhost:8000/api/file-delete/${fileID}/`)
            .then(response => {        
            })
            .catch(error => {
                console.log(error);
            });
    };

    const addFile = async (fileObj) => {
        axios.post(`http://localhost:8000/api/file-create/`, fileObj)
            .then(response => {
            })
            .catch(error => {
                console.log(error);
            });
    };

    const updateFile = async (fileID, fileObj) => {
        axios.post(`http://localhost:8000/api/file-update/${fileID}/`, fileObj)
            .then(response => {
            })
            .catch(error => {
                console.log(error);
            });
    };

    const changeFileName = (fileID) => 
    {      
        let _fileList = [...fileList];
        let foundIndex = fileList.findIndex(file => file.fileID === fileID);
        let foundFile = {..._fileList[foundIndex]};

        let newName = window.prompt("Enter a new name", foundFile.name)
        if (!newName)
            newName = foundFile.name; 

        foundFile.name = newName;
        _fileList[foundIndex] = foundFile;
        setFileList(_fileList);
        updateFile(fileID, foundFile);
    }

    const openNewFile = () => {
        const timestamp = new Date(Date.now());
        const uid = generateUID();

        const fileObj = {
            name: "Untitled",
            fileID: uid,
            modifiedDate: timestamp,
            createDate: timestamp,   
        }

        console.log(fileObj);

        //setFileList([...fileList, fileObj])
        addFile(fileObj);
        
        openFile(fileObj.fileID);
    }

    const openFile = (fileID) => {
        console.log(`Opening ${fileID}`)
        navigate(`/file/${fileID}`);
    }

    const sortFiles = () => {
        console.log("sort");

        const _fileList = [...fileList];
        var sortFunction;

        switch (sortType) {
            case SortTypes.alphabetical:
                sortFunction = compareByFileName;
                break;
            case SortTypes.dateModified:
                sortFunction = compareByDateModified;
                break;
            case SortTypes.dateCreated:
                sortFunction = compareByDateCreated;
                break;
            default:
                sortFunction = compareByDateModified;
                break;
        }

        _fileList.sort(sortFunction);
        console.log('sorted', _fileList);
        setFileList(_fileList);
        console.log('result', fileList);
    }

    return (
        <div>
            <button className="createNewFileButton" onClick={openNewFile}>Create New File</button>
            <p>Your Designs</p>
            <div className="designCardContainer">
                {
                    fileList.map(f => (
                        <div className="designCard" key={f.fileID} id={f.fileID} onClick={() => openFile(f.fileID)}>
                            <p>{f.name}</p>
                            <p>last modified {formatDate(f.modifiedDate)}</p>
                            <p>{f.fileID}</p>
                            <button onClick={(e) => { e.stopPropagation(); removeFile(f.fileID); }}>X</button>
                            <button onClick={(e) => { e.stopPropagation(); changeFileName(f.fileID); }}>Rename</button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Saved;