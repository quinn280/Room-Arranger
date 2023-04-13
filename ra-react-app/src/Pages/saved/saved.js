import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import './saved.css';

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
    const [fileList, setFileList] = useState((localStorage.fileList) ? JSON.parse(localStorage.fileList) : []);
    const [sortType, setSortType] = useState((localStorage.sortType) ? JSON.parse(localStorage.sortType) : SortTypes.dateModified);
    const navigate = useNavigate();

    React.useEffect(() => {
        sortFiles();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const openNewFile = () => {
        const timestamp = new Date(Date.now());
        const uid = generateUID();

        const fileObj = {
            fileID: uid,
            createDate: timestamp,
            modifiedDate: timestamp,
            fileName: "Untitled",
            roomData: {
                roomDimensions: defaultRoomDimensions,
                activeObjects: []
            },
            settings: {
                designMode: Modes.room,
                roomLock: false,
            }
        }

        const _fileList = [...fileList, fileObj];
        localStorage.fileList = JSON.stringify(_fileList);
        openFile(fileObj.fileID);
    }

    const openFile = (fileID) => {
        navigate(`/file/${fileID}`);
    }

    const handleOpen = (e) => {
        openFile(e.target.id);
    }

    const removeFile = (fileID) => {
        const _fileList = fileList.filter(f => f.fileID !== fileID);
        localStorage.fileList = JSON.stringify(_fileList);
        setFileList(_fileList);
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
        localStorage.fileList = JSON.stringify(_fileList);
        setFileList(_fileList);
    }

    return (
        <div>
            <button className="createNewFileButton" onClick={openNewFile}>Create New File</button>
            <p>Your Designs</p>
            <div className="designCardContainer">
                {
                    fileList.map(f => (
                        <div className="designCard" key={f.fileID} id={f.fileID} onClick={handleOpen}>
                            <p>{f.fileName}</p>
                            <p>last modified {formatDate(f.modifiedDate)}</p>
                            <p>{f.fileID}</p>
                            <button onClick={(e) => {e.stopPropagation(); removeFile(f.fileID);}}>X</button>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Saved;