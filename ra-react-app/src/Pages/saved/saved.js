import React, { useState, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import './saved.css';
import axios from 'axios';
import Thumbnail from "./thumbnail";
import * as Utils from 'Utils/utils.js';
import * as Api from './Api.js';

const SortTypes = Object.freeze({ alphabetical: "Alphabetical", dateCreated: "Date Created", dateModified: "Date Modified" }) // modes enum
const generateUID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


const Saved = () => {
    const [fileList, setFileList] = useState([]);
    const [sortType, setSortType] = useState((localStorage.sortType) ? JSON.parse(localStorage.sortType) : SortTypes.dateModified);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fileListPromise = Api.getFiles();

        Promise.all([fileListPromise]).then(([fileListResponse]) => {
            setFileList(initialSort(fileListResponse.data));
        })
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const removeFile = async (fileID) => {
        setFileList(fileList.filter(f => f.fileID !== fileID));
        Api.deleteFile(fileID);
        Api.deleteObjAtFile(fileID);
    };

    const addFileAndOpen = async (fileObj) => {
        await axios.post(`http://localhost:8000/api/files/`, fileObj).then(() => {
            openFile(fileObj.fileID);
        });
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
        Api.updateFile(fileID, foundFile);
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
                sortFunction = Utils.compareByFileName;
                break;
            case SortTypes.dateModified:
                sortFunction = Utils.compareByDateModified;
                break;
            case SortTypes.dateCreated:
                sortFunction = Utils.compareByDateCreated;
                break;
            default:
                sortFunction = Utils.compareByDateModified;
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
                sortFunction = Utils.compareByFileName;
                break;
            case SortTypes.dateModified:
                sortFunction = Utils.compareByDateModified;
                break;
            case SortTypes.dateCreated:
                sortFunction = Utils.compareByDateCreated;
                break;
            default:
                sortFunction = Utils.compareByDateModified;
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
                                    <p>last modified {Utils.formatDate(f.modifiedDate)}</p>
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