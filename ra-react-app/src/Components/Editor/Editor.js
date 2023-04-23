import { useParams } from "react-router-dom";
import React, { useState, useRef } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import InfiniteViewer from "react-infinite-viewer";
import { flushSync } from "react-dom";
import axios from 'axios';
import './Editor.css';
import furnitureList from "./furnitureData.js";
import structureList from "./structureData.js";

const vectorsPath = `${process.env.PUBLIC_URL}/vectors/`
const fengShuiAPIURL = "http://127.0.0.1:8000/testpost/";
const furnRecAPIURL = "http://127.0.0.1:8000/furnRec/";
const inchPixelRatio = 3;
const wallWidth = 1;
const Modes = Object.freeze({ room: "room", furnish: "furnish" }) // modes enum
const MAX_Z = 2147483647;

const inchToPx = (inches) => {
  inches = parseFloat(inches);
  var pixels = inches * inchPixelRatio;
  return pixels;
}

const pxToInch = (pixels) => {
  pixels = parseFloat(pixels);
  var inches = parseFloat(pixels / inchPixelRatio);
  return inches;
}

const generateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

const normalizeRotation = (rotation) => {
  var nRotation = parseFloat(rotation) % 360;
  if (nRotation < 0)
    nRotation += 360;

  return nRotation;
}

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.round(value * multiplier) / multiplier;
}

const parseTransform = (transformText) => {
  const rotateRE = new RegExp('rotate\\((.*)\\)');
  const xRE = new RegExp('translate\\((.*),');
  const yRE = new RegExp('translate\\(.*, (.*?)\\)');

  const rotate = (transformText.match(rotateRE)) ? transformText.match(rotateRE)[1] : "0deg";
  const x = (transformText.match(xRE)) ? transformText.match(xRE)[1] : "0px";
  const y = (transformText.match(yRE)) ? transformText.match(yRE)[1] : "0px";

  return { rotate: rotate, x: x, y: y };
}



// 2 high level objects. 1 is design file, 1 is array of queried room objects
// file-detail to get file at start, 

const Editor = () => {
  let { file } = useParams();

  const [isLoading, setLoading] = useState(true);
  const [activeObjects, setActiveObjects] = useState([]);
  const [fileData, setFileData] = useState();

  const [zoom, setZoom] = useState(1);
  const [targets, setTargets] = useState([]);
  const [scrollOptions, setScrollOptions] = useState({});

  const moveableRef = useRef(null);
  const selectoRef = useRef(null);
  const boxRef = useRef(null);
  const viewerRef = useRef(null);

  const xInputRef = useRef(null);
  const yInputRef = useRef(null);
  const widthInputRef = useRef(null);
  const heightInputRef = useRef(null);
  const rotateInputRef = useRef(null);
  const roomWidthInputRef = useRef(null);
  const roomHeightInputRef = useRef(null);

  React.useEffect(() => {
    const filePromise = getFileDB(file);
    const objectsPromise = getObjectsDB(file);

    Promise.all([filePromise, objectsPromise]).then(([fileResponse, objectsResponse]) => {
      setFileData(fileResponse.data);
      setActiveObjects(objectsResponse.data);  
      window.addEventListener('resize', zoomFit);      
      

      setTimeout(() => {
        initScrollOptions();
        zoomFit();
        if (fileResponse.data.designMode === Modes.room) updateRoomForm();
      }, 0);

      setLoading(false);
      
    })

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getFileDB = async (fileID) => {
    return axios.get(`http://localhost:8000/api/files/${fileID}/`);
  };

  const updateFileDB = async (fileID, fileObj) => {
    return axios.put(`http://localhost:8000/api/files/${fileID}/`, fileObj);
  };

  const getObjectsDB = async (fileID) => {
    return axios.get(`http://localhost:8000/api/ro/file/${fileID}/`);
  }

  const addObjectDB = async (obj) => {
    return axios.post(`http://localhost:8000/api/ro/`, obj);
  }

  const updateObjectDB = async (obj, uid) => {
    return axios.put(`http://localhost:8000/api/ro/${uid}/`, obj);
  }

  const removeObjectsArrayDB = async (uidArray) => {
    return axios.post(`http://localhost:8000/api/ro/DeleteAllByID/`, uidArray);
  }

  const getMaxZ = () => {
    return Math.max(...activeObjects.map(obj => obj.z));
  }

  const getMinZ = () => {
    return Math.min(...activeObjects.map(obj => obj.z));
  }

  const getNewZ = (toTop = true) => {
    if (activeObjects.length < 1)
      return parseInt(MAX_Z / 2);

    let newZ = (toTop) ? getMaxZ() + 1 : getMinZ() - 1;
    return newZ;
  }

  const updateFileModifiedDate = () => {
    const newFileData = { ...fileData };
    newFileData["modifiedDate"] = new Date(Date.now());
    updateFileDB(file, newFileData);
  }

  const updateFileSetting = (setting, newValue, updateState = true) => {
    const newFileData = { ...fileData };
    newFileData[setting] = newValue;
    newFileData["modifiedDate"] = new Date(Date.now());
    updateFileDB(file, newFileData);

    if (updateState)
      setFileData(newFileData);
  }


  const updateFileSettings = (settings, newValues, updateState = true) => {
    if (settings.length !== newValues.length)
      return;

    const newFileData = { ...fileData };
    for (let i = 0; i < settings.length; i++) {
      newFileData[settings[i]] = newValues[i];
    }
    newFileData["modifiedDate"] = new Date(Date.now());

    updateFileDB(file, newFileData);
    if (updateState)
      setFileData(newFileData);
  }

  const updateObjectValue = (uid, property, newValue, updateState = true) => {
    let _activeObjects = [...activeObjects];
    let foundIndex = _activeObjects.findIndex(o => o.uid === uid);
    let foundObject = {..._activeObjects[foundIndex]};

    foundObject[property] = newValue;

    updateObjectDB(foundObject, uid);
    updateFileModifiedDate();
    if (updateState)
    {
      _activeObjects[foundIndex] = foundObject;
      setActiveObjects(_activeObjects);
    }   
  }

  const updateObjectValues = (uid, properties, newValues, updateState = true) => {
    if (properties.length !== newValues.length)
      return;
      
    let _activeObjects = [...activeObjects];
    let foundIndex = _activeObjects.findIndex(o => o.uid === uid);
    let foundObject = {..._activeObjects[foundIndex]};

    for (let i = 0; i < properties.length; i++)
    {
      foundObject[properties[i]] = newValues[i];
    }

    console.log(foundObject);
    
    updateObjectDB(foundObject, uid);
    updateFileModifiedDate();
    if (updateState)
    {
      _activeObjects[foundIndex] = foundObject;
      setActiveObjects(_activeObjects);
    }   
  }

  const initScrollOptions = () => {
    setScrollOptions({
      container: viewerRef.current.getElement(),
      getScrollPosition: () => {
        return [
          viewerRef.current.getScrollLeft(),
          viewerRef.current.getScrollTop()
        ];
      },
      throttleTime: 30,
      threshold: 0
    });
  }

  const [requestCallbacksFurniture] = useState(() => {
    function request(caller) {

      if (caller === "x" || caller === "y")
      {
        moveableRef.current.request("draggable", {
          x: inchToPx(xInputRef.current.value),
          y: inchToPx(yInputRef.current.value),
        }, true);
      }
      else if (caller === "height" || caller === "width")
      {
        moveableRef.current.request("resizable", {
          offsetWidth: inchToPx(widthInputRef.current.value),
          offsetHeight: inchToPx(heightInputRef.current.value),
        }, true);
      }
      else if (caller === "rotation")
      {
        moveableRef.current.request("rotatable", {
          rotate: parseInt(rotateInputRef.current.value),
        }, true);
      }
      else
      {
        console.log("requestCallBacksObjects: Unexpected Caller")
      }
      

      

      
    }

    return {
      onInput(e) {
        const ev = (e.nativeEvent || e);

        if (typeof ev.data === "undefined") {
          request(e.target.id);
        }
      },
      onKeyUp(e) {
        e.stopPropagation();

        if (e.keyCode === 13) {
          request(e.target.id);
        }
      },
      onBlur(e) {
        request(e.target.id);
      },
    };
  });

  const [requestCallbacksRoom] = useState(() => {

    function request() {
      boxRef.current.request("resizable", {
        offsetWidth: inchToPx(roomWidthInputRef.current.value) + inchToPx(2 * wallWidth),
        offsetHeight: inchToPx(roomHeightInputRef.current.value) + inchToPx(2 * wallWidth),
      }, true);
    }


    return {
      onInput(e) {
        const ev = (e.nativeEvent || e);

        if (typeof ev.data === "undefined") {
          request();
        }
      },
      onKeyUp(e) {
        e.stopPropagation();

        if (e.keyCode === 13) {
          request();
        }
      },
    };
  });


  const handleRemove = (uidArray) => {
    setActiveObjects(activeObjects.filter(f => !uidArray.includes(f.uid)));
    removeObjectsArrayDB(uidArray);

    setTargets([]);
    clearObjectForm();
  };

  const removeActiveTargets = () => {
    const uidArray = targets.map(t => t.id);
    handleRemove(uidArray);
  }

  const exportRecData = () => {
    if (targets.length !== 1)
      return;

    const uid = targets[0].id;
    const foundItem = activeObjects.find(o => o.uid === uid);
    const jsonStr = JSON.stringify(foundItem, undefined, 4);

    console.log("posted: ")
    console.log(jsonStr);
    console.log("response: ")
    axios.post(furnRecAPIURL, foundItem)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const handleZoomChange = (newZoom) => {
    if (newZoom < .1 || newZoom > 10)
      return;

    setZoom(newZoom);
  }

  const handleAdd = (itemKey) => {
    const activeList = (fileData.designMode === Modes.room ? structureList : furnitureList);
    const foundItem = activeList.find(f => parseInt(f.itemKey) === parseInt(itemKey));

    const newActvObj = Object.assign({}, foundItem);
    newActvObj.fileID = file;
    newActvObj.uid = generateUID();
    newActvObj.z = getNewZ();
    newActvObj.width = newActvObj.defaultWidth;
    newActvObj.height = newActvObj.defaultHeight;
    newActvObj.rotate = 0;

    const roomWidth = pxToInch(document.getElementById("room").style.width);
    const roomHeight = pxToInch(document.getElementById("room").style.height);
    newActvObj.x = roomWidth / 2 - newActvObj.width / 2;
    newActvObj.y = roomHeight / 2 - newActvObj.height / 2;

    const _activeObjects = [...activeObjects, newActvObj];
    setActiveObjects(() => _activeObjects);
    addObjectDB(newActvObj);

    // schedule async callback to highlight and update forms
    setTimeout(() => {
      const elem = document.getElementById(newActvObj.uid);
      setTargets([elem]);

      xInputRef.current.value = `${round(newActvObj.x, 1)}`;
      yInputRef.current.value = `${round(newActvObj.y, 1)}`;
      widthInputRef.current.value = `${round(newActvObj.width, 1)}`;
      heightInputRef.current.value = `${round(newActvObj.height, 1)}`;
      rotateInputRef.current.value = `${round(newActvObj.rotate, 1)}`;
    }, 0);
  }

  const clearFurniture = () => {
    const uidArray = activeObjects.filter(obj => obj.type === "furniture").map(obj => obj.uid);
    handleRemove(uidArray);
  }

  const handleModeChange = (e) => {
    const checked = e.target.checked;
    const newMode = (checked ? Modes.furnish : Modes.room)
    updateFileSetting("designMode", newMode);
    setTargets([]);

    if (newMode === Modes.room) {
      updateRoomForm();
    }
  };

  const handleRoomLockChange = (e) => {
    const checked = e.target.checked;
    updateFileSetting("roomLock", checked);
  }

  const onKeyPressed = (e) => {
    const keyCode = e.keyCode;

    if (keyCode === 8 || keyCode === 46) {
      removeActiveTargets()
    }
  };

  const updateFurnitureForm = (e) => {
    requestAnimationFrame(() => {
      const rect = e.moveable.getRect();
      xInputRef.current.value = `${round(pxToInch(rect.left), 1)}`;
      yInputRef.current.value = `${round(pxToInch(rect.top), 1)}`;
      widthInputRef.current.value = `${round(pxToInch(rect.offsetWidth), 1)}`;
      heightInputRef.current.value = `${round(pxToInch(rect.offsetHeight), 1)}`;
      rotateInputRef.current.value = `${round(rect.rotation, 0)}`;
    })
  };

  const updateRoomFormResizeEnd = (e) => {
    requestAnimationFrame(() => {
      const rect = e.moveable.getRect();
      roomWidthInputRef.current.value = `${round(pxToInch(rect.offsetWidth) - wallWidth * 2, 0)}`;
      roomHeightInputRef.current.value = `${round(pxToInch(rect.offsetHeight) - wallWidth * 2, 0)}`;
    })
  };

  const updateRoomForm = () => {
    setTimeout(() => {
      const roomElem = document.getElementsByClassName("room")[0];
      roomWidthInputRef.current.value = `${round(pxToInch(roomElem.style.width), 0)}`;
      roomHeightInputRef.current.value = `${round(pxToInch(roomElem.style.height), 0)}`;
    }, 10);
  };

  const exportData = () => {
    const jsonObj = {};
    jsonObj.roomDimensions = { width: fileData.width, height: fileData.height };
    jsonObj.activeObjects = activeObjects;

    console.log(jsonObj);

    axios.post(fengShuiAPIURL, jsonObj)
      .then(response => {
        console.log(response.data);
        const responseData = JSON.parse(response.data);
        showFengShuiResults(responseData)
      })
      .catch(error => {
        console.log(error);
      });
  }

  const showFengShuiResults = (results) => {
    const alertStr = `Rating: ${results['rating']}/100\n\nNotes:\n\n${results['complaints'].length > 0 ? results['complaints'] : "None"}`
    window.alert(alertStr);
  }

  const bringFront = () => {
    // return if no item currently selected
    if (!moveableRef.current.refTargets || moveableRef.current.refTargets.length < 1)
      return;

    const uid = moveableRef.current.refTargets[0].getAttribute("data-key");
    updateObjectValue(uid, "z", getNewZ());
  }

  const sendBack = () => {
    if (!moveableRef.current.refTargets || moveableRef.current.refTargets.length < 1)
      return;

    const uid = moveableRef.current.refTargets[0].getAttribute("data-key");
    console.log(getNewZ(false))
    updateObjectValue(uid, "z", getNewZ(false));
  }

  const DimensionViewable = {
    name: "dimensionViewable",
    props: {},
    events: {},
    render(moveable, React) {
      const rect = moveable.getRect();

      return <div key={"dimension-viewer"} className={"moveable-dimension"} style={{
        position: "absolute",
        left: `${rect.width / 2}px`,
        top: `${rect.height + 20}px`,
        background: "#4af",
        borderRadius: "2px",
        padding: `${2}px ${4}px`,
        color: "white",
        fontSize: `${13 * 1 / zoom}px`,
        whiteSpace: "nowrap",
        fontWeight: "bold",
        willChange: "transform",
        transform: `translate(-50%, 0px)`,
      }}>
        {Math.round(pxToInch(rect.offsetWidth))}" x {Math.round(pxToInch(rect.offsetHeight))}"
      </div>;
    },
  };

  const DimensionViewableRoom = {
    name: "dimensionViewable",
    props: {},
    events: {},
    render(moveable, React) {
      const rect = moveable.getRect();

      return <div key={"dimension-viewer"} className={"moveable-dimension"} style={{
        position: "absolute",
        left: `${rect.width / 2}px`,
        top: `${rect.height + 20 * (1 / zoom)}px`,
        background: "#4af",
        borderRadius: "2px",
        padding: `${2}px ${4}px`,
        color: "white",
        fontSize: `${13 * 1 / zoom}px`,
        whiteSpace: "nowrap",
        fontWeight: "bold",
        willChange: "transform",
        transform: `translate(-50%, 0px)`,
      }}>
        {Math.round(pxToInch(rect.offsetWidth) - 2 * wallWidth)}" x {Math.round(pxToInch(rect.offsetHeight) - 2 * wallWidth)}"
      </div>;
    },
  };

  const zoomFit = (timeOut = 0) => {
    var ivWidth = document
      .getElementsByClassName("infinite-viewer")[0]
      .getBoundingClientRect().width;
    var ivHeight = document
      .getElementsByClassName("infinite-viewer")[0]
      .getBoundingClientRect().height;
    var rWidth = parseInt(
      document.getElementsByClassName("room")[0].style.width,
      10
    );
    var rHeight = parseInt(
      document.getElementsByClassName("room")[0].style.height,
      10
    );
    var borderWidth = parseInt(
      document.getElementsByClassName("room")[0].style.borderWidth,
      10
    );

    rWidth += 2 * borderWidth;
    rHeight += 2 * borderWidth;

    var x = ivWidth / 2 - rWidth / 2;
    var y = ivHeight / 2 - rHeight / 2;

    var padX = 0.2 * ivWidth;
    var padY = 0.2 * ivHeight;

    var newZoom = getZoomFitValue(
      ivWidth,
      ivHeight,
      rWidth,
      rHeight,
      padX,
      padY
    );

    var xScroll = ((1 - 1 / newZoom) / 2) * ivWidth;
    var yScroll = ((1 - 1 / newZoom) / 2) * ivHeight;

    moveRoom(x, y);
    setZoom(newZoom);

    // schedule async callback
    setTimeout(() => {
      viewerRef.current.scrollTo(xScroll, yScroll);
    }, 0);
  };

  const getZoomFitValue = (
    ivWidth,
    ivHeight,
    rWidth,
    rHeight,
    padX = 0,
    padY = 0
  ) => {
    var maxZoomX = (ivWidth - padX) / rWidth;
    var maxZoomY = (ivHeight - padY) / rHeight;
    return Math.min(maxZoomX, maxZoomY);
  };

  const moveRoom = (x, y) => {
    const room = document.getElementById("room");
    room.style.transform = `translate(${x}px,${y}px)`;

    setTimeout(() => {
      boxRef.current.updateRect();
    }, 0);  
  };

  const updateObjectStorage = (e) => {
    var uid = e.target.id;
    var newX = pxToInch(parseTransform(e.target.style.transform).x);
    var newY = pxToInch(parseTransform(e.target.style.transform).y);
    var newHeight = pxToInch(e.target.style.height);
    var newWidth = pxToInch(e.target.style.width);
    var newRotate = normalizeRotation(parseFloat(parseTransform(e.target.style.transform).rotate));

    const modifiedProperties = ["x", "y", "height", "width", "rotate"];
    const newValues = [newX, newY, newHeight, newWidth, newRotate];

    updateObjectValues(uid, modifiedProperties, newValues, false);
  }

  const clearObjectForm = () => {
    xInputRef.current.value = '';
    yInputRef.current.value = '';
    widthInputRef.current.value = '';
    heightInputRef.current.value = '';
    rotateInputRef.current.value = '';
  }

  const getNumFurniture = () => {
    return activeObjects.filter(o => o.type === "furniture").length;
  }

  if (isLoading) {
    return <div className="loading"><h1 className="loadingText">Loading...</h1></div>;
  }

  return (
    <div className="editor">
      <div className="left-bar">
        <div className="card-container">
          {
            (fileData.designMode === Modes.room)
              ?
              structureList.map((f) => (
                <div className="card structure" key={f.itemKey} data-key={f.itemKey} onClick={() => handleAdd(f.itemKey)}>
                  <div className="image-container">
                    <img src={`${vectorsPath}${f.url}`} alt={f.description} draggable="false" />
                  </div>
                  <div className="description">{f.description}</div>
                </div>
              ))
              :
              furnitureList.map((f) => (
                <div className="card furniture" key={f.itemKey} data-key={f.itemKey} onClick={() => handleAdd(f.itemKey)}>
                  <div className="image-container">
                    <img src={`${vectorsPath}/${f.url}`} alt={f.description} draggable="false" />
                  </div>
                  <div className="description">{f.description}</div>
                </div>
              ))
          }
        </div>
      </div>
      <div className="design-area-wrapper">
        <InfiniteViewer zoom={zoom} className="infinite-viewer" ref={viewerRef}>
          <div>
            <div className="room" ref={boxRef} id="room"
              style={{
                width: `${inchToPx(fileData.width)}px`,
                height: `${inchToPx(fileData.height)}px`,
                position: "absolute",
                borderWidth: `${inchToPx(wallWidth)}px`
              }}>
              {activeObjects.map((f) => (
                <img
                  draggable="false"
                  src={`${vectorsPath}${f.url}`}
                  key={f.uid}
                  data-key={f.uid}
                  id={f.uid}
                  className={`${f.type === "furniture" ? "furn-target" : "struc-target"} ${f.category}`}
                  alt={f.description}
                  onKeyDown={onKeyPressed}
                  tabIndex="-1"
                  style={{
                    draggable: false,
                    position: "absolute",
                    zIndex: `${f.z}`,
                    width: `${inchToPx(f.width)}px`,
                    height: `${inchToPx(f.height)}px`,
                    transform: `translate(${inchToPx(f.x)}px, ${inchToPx(f.y)}px) rotate(${f.rotate}deg)`
                  }}
                />
              ))}
              <Moveable
                rootContainer={document.body}
                flushSync={flushSync}
                ref={moveableRef}
                props={{
                  dimensionViewable: true,
                }}
                ables={[DimensionViewable]}
                target={targets}
                zoom={1 / zoom}
                //individualGroupable={true}
                draggable={true}
                throttleDrag={0}
                throttleRotate={5}
                resizable={true}
                groupableProps={{
                  rotatable: false,
                  resizable: false,
                }}
                renderDirections={(fileData.designMode === Modes.furnish) ? ["nw", "n", "ne", "w", "e", "sw", "s", "se"] : ["n", "w", "s", "e"]}
                rotatable={true}
                scrollable={true}
                scrollOptions={scrollOptions}
                onScroll={({ direction }) => {
                  viewerRef.current.scrollBy(
                    direction[0] * 10,
                    direction[1] * 10
                  );
                }}
                onDragStart={e => {
                  e.target.focus();
                }}
                onDragGroupStart={e => {
                  e.target.focus();
                }}
                onDragEnd={e => {
                  const controlBox = e.moveable.controlBox.element;
                  controlBox.classList.remove('active-drag');
                }}
                onDrag={e => {
                  e.target.style.transform = e.transform;
                  const controlBox = e.moveable.controlBox.element;
                  controlBox.classList.add('active-drag');
                }}
                onRotate={e => {
                  e.target.style.transform = e.drag.transform;
                }}
                onResize={e => {
                  e.target.style.width = `${e.width}px`;
                  e.target.style.height = `${e.height}px`;
                  e.target.style.transform = e.drag.transform;
                }}
                onDragGroup={({ events }) => {
                  events.forEach(ev => {
                    ev.target.style.transform = ev.transform;
                  });
                }}
                onRenderEnd={e => {
                  updateObjectStorage(e);
                  updateFurnitureForm(e);
                }}
                onRenderGroupEnd={({ events }) => {
                  events.forEach(ev => {
                    updateObjectStorage(ev);
                  });
                }}
                onRender={e => {
                  updateFurnitureForm(e);
                }}
              ></Moveable>
              <Selecto
                ref={selectoRef}
                selectableTargets={(fileData.designMode === Modes.furnish) ? [".furn-target"] : [".struc-target"]}
                rootContainer={document.body}
                dragContainer={".infinite-viewer"}
                hitRate={0}
                selectByClick={true}
                selectFromInside={false}
                ratio={0}
                onDragStart={e => {
                  const moveable = moveableRef.current;
                  const target = e.inputEvent.target;
                  if (moveable.isMoveableElement(target) || targets.some(t => t === target || t.contains(target))) {
                    e.stop();
                  }
                }}
                onSelectEnd={e => {
                  const moveable = moveableRef.current;
                  setTargets(e.selected);

                  if (e.isDragStart) {
                    e.inputEvent.preventDefault();

                    setTimeout(() => {
                      moveable.dragStart(e.inputEvent);
                    });
                  }
                  else {
                    clearObjectForm();
                  }
                }}
              ></Selecto>
            </div>
            <Moveable
              rootContainer={document.body}
              flushSync={flushSync}
              props={{
                dimensionViewable: true,
              }}
              ables={[DimensionViewableRoom]}
              target={(((fileData.designMode === Modes.room) && !(fileData.roomLock)) ? ".room" : ".dummyvalue")}
              scrollable={true}
              scrollOptions={scrollOptions}
              ref={boxRef}
              throttleResize={inchPixelRatio}
              resizable={true}
              zoom={1 / zoom}
              onResize={(e) => {
                e.target.style.width = `${e.width}px`;
                e.target.style.height = `${e.height}px`;
                e.target.style.transform = e.drag.transform;
                updateRoomFormResizeEnd(e);
              }}
              onResizeEnd={e => {
                updateRoomFormResizeEnd(e);

                var newHeight = round(pxToInch(e.target.style.height), 0);
                var newWidth = round(pxToInch(e.target.style.width), 0);

                console.log("resize end");
                updateFileSettings(["width", "height"], [newWidth, newHeight], false);
              }}
              onScroll={({ direction }) => {
                viewerRef.current.scrollBy(
                  direction[0] * 10,
                  direction[1] * 10
                );
              }}
            ></Moveable>
          </div>
        </InfiniteViewer>
      </div>
      <div className="right-bar">
        {
          (fileData.designMode === Modes.furnish)
            ?
            <div>
              <div>
                <button onClick={(e) => { e.preventDefault(); handleZoomChange(zoom + .1); }}>Zoom In</button>
                <button onClick={(e) => { e.preventDefault(); handleZoomChange(zoom - .1); }}>Zoom Out</button>
                <button onClick={(e) => { e.preventDefault(); zoomFit(); }}>Zoom Fit</button>
              </div>
              <br />
              <div>Object Dimensions</div>
              <br />
              <label htmlFor="xyz">X:</label><br />
              <input ref={xInputRef} {...requestCallbacksFurniture} type="number" id="x" name="x" disabled={targets.length !== 1} /><br />
              <label htmlFor="y">Y:</label><br />
              <input ref={yInputRef} {...requestCallbacksFurniture} type="number" id="y" name="y" disabled={targets.length !== 1} /><br />
              <label htmlFor="width">Width</label><br />
              <input ref={widthInputRef} {...requestCallbacksFurniture} type="number" id="width" name="width" disabled={targets.length !== 1} /><br />
              <label htmlFor="height">Height</label><br />
              <input ref={heightInputRef} {...requestCallbacksFurniture} type="number" id="height" name="height" disabled={targets.length !== 1} /><br />
              <label htmlFor="rotation">Rotation:</label><br />
              <input ref={rotateInputRef} {...requestCallbacksFurniture} type="number" id="rotation" name="rotation" disabled={targets.length !== 1} /><br />
              <br />
              <button onClick={removeActiveTargets} disabled={targets.length === 0}>Delete</button>
              <br />
              <button onClick={bringFront} disabled={targets.length === 0}>Bring Front</button>
              <button onClick={sendBack} disabled={targets.length === 0}>Send Back</button>
              <br /><br />
              <button onClick={clearFurniture} disabled={getNumFurniture() === 0}>Delete All Furniture</button><br />
              <button onClick={exportData}>Score Feng Shui</button>
              <button onClick={exportRecData} disabled={targets.length !== 1}>Recommend</button>
            </div>
            :
            <div className="roomFormEntry" key="roomFormEntry">
              <div>
                <button onClick={(e) => { e.preventDefault(); handleZoomChange(zoom + .1); }}>Zoom In</button>
                <button onClick={(e) => { e.preventDefault(); handleZoomChange(zoom - .1); }}>Zoom Out</button>
                <button onClick={(e) => { e.preventDefault(); zoomFit(); }}>Zoom Fit</button>
              </div>
              <br />
              <div>Room Dimensions</div>
              <label htmlFor="roomWidth">Lock:</label>
              <input type="checkbox" checked={fileData.roomLock} onChange={handleRoomLockChange} />
              <br />
              <br />
              <label htmlFor="roomWidth">Width:</label><br />
              <input readOnly={fileData.roomLock} ref={roomWidthInputRef} {...requestCallbacksRoom} type="number" id="roomWidth" name="roomWidth" /><br />
              <label htmlFor="roomHeight">Height:</label><br />
              <input readOnly={fileData.roomLock} ref={roomHeightInputRef} {...requestCallbacksRoom} type="number" id="roomHeight" name="roomHeight" /><br />
              <br />

              <div>Object Dimensions</div>
              <br />

              <label htmlFor="x">X:</label><br />
              <input ref={xInputRef} {...requestCallbacksFurniture} type="number" id="x" name="x" disabled={targets.length !== 1} /><br />
              <label htmlFor="y">Y:</label><br />
              <input ref={yInputRef} {...requestCallbacksFurniture} type="number" id="y" name="y" disabled={targets.length !== 1} /><br />
              <label htmlFor="width">Width</label><br />
              <input ref={widthInputRef} {...requestCallbacksFurniture} type="number" id="width" name="width" disabled={targets.length !== 1} /><br />
              <label htmlFor="height">Height</label><br />
              <input ref={heightInputRef} {...requestCallbacksFurniture} type="number" id="height" name="height" disabled={targets.length !== 1} /><br />
              <label htmlFor="rotation">Rotation:</label><br />
              <input ref={rotateInputRef} {...requestCallbacksFurniture} type="number" id="rotation" name="rotation" disabled={targets.length !== 1} /><br />
              <br /><br />
              <button onClick={removeActiveTargets} disabled={targets.length === 0}>Delete</button>
              <br /><br />
              <button onClick={exportData}>Score Feng Shui</button>
            </div>
        }
        <div>
          <p className="tog">{fileData.designMode === Modes.furnish ? "Floor Plan" : "Furnish"}</p>
          <label className="switch tog">
            <input type="checkbox" checked={(fileData.designMode === Modes.furnish)} onChange={handleModeChange} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};



export default Editor;
