import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import './saved.css';
import axios from 'axios';
import Thumbnail from "./thumbnail";

const SortTypes = Object.freeze({ alphabetical: "Alphabetical", dateCreated: "Date Created", dateModified: "Date Modified" }) // modes enum
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
    if (a.name < b.name)
        return -1;
    if (a.name > b.name)
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
        const fileListPromise = getFiles();

        Promise.all([fileListPromise]).then(([fileListResponse]) => {
            setFileList(initialSort(fileListResponse.data));
        })
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const getFiles = async () => {
        return axios.get("http://localhost:8000/api/files/");
    };

    // const getThumbnail = async () => {
    //     return axios.get("http://localhost:8000/api/thumbnail/");
    // };

    // const getThumbnail2 = async (fileID) => {
    //     let what = axios.get(`http://localhost:8000/api/thumbnail/${fileID}`).data;
    //     console.log(what)
    //     return what;
    // };

    const removeFile = async (fileID) => {
        setFileList(fileList.filter(f => f.fileID !== fileID));
        axios.delete(`http://localhost:8000/api/files/${fileID}/`);
        axios.delete(`http://localhost:8000/api/ro/file/${fileID}/`);
    };

    const addFileAndOpen = async (fileObj) => {
        await axios.post(`http://localhost:8000/api/files/`, fileObj).then(() => {
            openFile(fileObj.fileID);
        });
    };

    const updateFile = async (fileID, fileObj) => {
        axios.put(`http://localhost:8000/api/files/${fileID}/`, fileObj);
    };

    const changeFileName = (fileID) => {
        let _fileList = [...fileList];
        let foundIndex = fileList.findIndex(file => file.fileID === fileID);
        let foundFile = { ..._fileList[foundIndex] };

        let newName = window.prompt("Enter a new name", foundFile.name)
        if (!newName)
            newName = foundFile.name;

        foundFile.name = newName;
        _fileList[foundIndex] = foundFile;
        _fileList = initialSort(_fileList);
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

        addFileAndOpen(fileObj);
    }

    const openFile = (fileID) => {
        navigate(`/file/${fileID}`);
    }

    const sortFiles = (newSortType) => {
        const _fileList = [...fileList];
        var sortFunction;

        switch (newSortType) {
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
        setFileList(_fileList);
    }

    const initialSort = (theFileList) => {
        console.log("sort");

        const _fileList = [...theFileList];
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
        return _fileList;
    }

    const handleSortChange = (e) => {
        let newSortType = e.target.value;
        localStorage.sortType = JSON.stringify(newSortType);
        setSortType(newSortType);
        sortFiles(newSortType)
    }

    return (
        <div className="saved-wrapper">
            <div>
                <button className="button-23" onClick={openNewFile}>Create New File</button>
            </div>

            <div className="yourDesigns">
                <form method="post">Sort By:
                    <select name='SortBy' onChange={handleSortChange} defaultValue={sortType}>
                        <option value={SortTypes.alphabetical}>Alphabetical</option>
                        <option value={SortTypes.dateCreated}>Date Created</option>
                        <option value={SortTypes.dateModified}>Date Modified</option>
                    </select>
                </form>
            </div>

            <div className="designCardContainer">
                {
                    fileList.map(f => (
                        <div className="designCard" key={f.fileID} id={f.fileID} onClick={() => openFile(f.fileID)}>
                            <Suspense fallback={<h1>loading thumbnail</h1>}>
                                <Thumbnail fileID={f.fileID}/>
                            </Suspense>
                            <div className="file-info">
                                <div>
                                    <h3>{f.name}</h3>
                                    <p>last modified {formatDate(f.modifiedDate)}</p>
                                </div>
                                
                                <div className="fileButtons">
                                    <button className="button-16" onClick={(e) => { e.stopPropagation(); removeFile(f.fileID); }}>Delete</button>
                                    <button className="button-16" onClick={(e) => { e.stopPropagation(); changeFileName(f.fileID); }}>Rename</button>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Saved;