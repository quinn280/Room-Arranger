import React, { useState, useRef } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import InfiniteViewer from "react-infinite-viewer";
import { flushSync } from "react-dom";
import axios from 'axios';
import './home.css';
import furnitureList from "./furnitureData.js";
import structureList from "./structureData.js"

const apiurl = "http://127.0.0.1:8000/testpost/";
const inchPixelRatio = 3;
const wallWidth = 1;
const defaultRoomDimensions = {
  width: "168in",
  height: "144in"
}
const Modes = Object.freeze({ room: "room", furnish: "furnish" }) // modes enum

function compareByUid(a,b) {
  if (a.uid < b.uid)
     return -1;
  if (a.uid > b.uid)
    return 1;
  return 0;
}

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




const Home = () => {
  const [activeObjects, setActiveObjects] = useState((localStorage.activeObjects) ? JSON.parse(localStorage.activeObjects) : []);
  const [roomDimensions] = useState((localStorage.roomDimensions) ? JSON.parse(localStorage.roomDimensions) : defaultRoomDimensions)
  const [designMode, setDesignMode] = useState(localStorage.designMode || Modes.room);
  const [roomLock, setRoomLock] = useState((localStorage.roomLock) ? JSON.parse(localStorage.roomLock) : false);

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
    window.addEventListener('resize', zoomFit)
    initScrollOptions();
    zoomFit();
    if (designMode === Modes.room) updateRoomForm();

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    function request() {

      moveableRef.current.request("draggable", {
        x: inchToPx(xInputRef.current.value),
        y: inchToPx(yInputRef.current.value),
      }, true);

      moveableRef.current.request("resizable", {
        offsetWidth: inchToPx(widthInputRef.current.value),
        offsetHeight: inchToPx(heightInputRef.current.value),
      }, true);

      moveableRef.current.request("rotatable", {
        rotate: parseInt(rotateInputRef.current.value),
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

  const [requestCallbacksRoom] = useState(() => {

    function request() {
      boxRef.current.request("resizable", {
        offsetWidth: inchToPx(roomWidthInputRef.current.value) + inchToPx(2*wallWidth),
        offsetHeight: inchToPx(roomHeightInputRef.current.value) + inchToPx(2*wallWidth),
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
    var _activeObjects = activeObjects.filter(f => !uidArray.includes(f.uid));

    _activeObjects.sort(compareByUid);
    _activeObjects.forEach((o, i) => {o.z = i+1;})

    setActiveObjects(() => _activeObjects);
    localStorage.activeObjects = JSON.stringify(_activeObjects);
    setTargets([]);
    clearObjectForm();
  };

  const removeActiveTargets = () => {
    const uidArray = targets.map(t => t.id);
    handleRemove(uidArray);
  } 

  const handleZoomChange = (newZoom) => {
    if (newZoom < .1 || newZoom > 10)
      return;

    setZoom(newZoom);
  }

  const handleAdd = (itemKey) => {
    const activeList = (designMode === Modes.room ? structureList : furnitureList);
    const foundItem = activeList.find(f => parseInt(f.itemKey) === parseInt(itemKey));

    const newActvObj = Object.assign({}, foundItem);
    newActvObj.uid = generateUID();
    newActvObj.z = activeObjects.length + 1; // initialize to top z-index
    newActvObj.width = newActvObj.defaultWidth;
    newActvObj.height = newActvObj.defaultHeight;
    newActvObj.rotate = 0;

    const roomWidth = pxToInch(document.getElementById("room").style.width);
    const roomHeight = pxToInch(document.getElementById("room").style.height);
    newActvObj.x = roomWidth / 2 - newActvObj.width / 2;
    newActvObj.y = roomHeight / 2 - newActvObj.height / 2;

    const _activeObjects = [...activeObjects, newActvObj];
    localStorage.activeObjects = JSON.stringify(_activeObjects);
    setActiveObjects(() => _activeObjects);

    // schedule async callback
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
    const _activeObjects = activeObjects.filter((f) => f.type !== "furniture");

    setTargets([]);
    localStorage.activeObjects = JSON.stringify(_activeObjects);
    setActiveObjects(() => _activeObjects);
    clearObjectForm();
  }

  const handleModeChange = (e) => {
    const checked = e.target.checked;
    const newMode = (checked ? Modes.furnish : Modes.room)
    setDesignMode(newMode);
    setTargets([]);
    localStorage.designMode = newMode;

    if (newMode === Modes.room) {
      updateRoomForm();
    }
  };

  const handleRoomLockChange = (e) => {
    const checked = e.target.checked;
    setRoomLock(checked);
    localStorage.roomLock = JSON.stringify(checked);
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
      roomWidthInputRef.current.value = `${round(pxToInch(rect.offsetWidth) - wallWidth*2, 0)}`;
      roomHeightInputRef.current.value = `${round(pxToInch(rect.offsetHeight) - wallWidth*2, 0)}`;
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
    jsonObj.roomDimensions = (localStorage.roomDimensions) ? JSON.parse(localStorage.roomDimensions) : roomDimensions;
    jsonObj.activeObjects = (localStorage.activeObjects) ? JSON.parse(localStorage.activeObjects) : activeObjects;
    const jsonStr = JSON.stringify(jsonObj, undefined, 4);

    console.log("posted: ")
    console.log(jsonStr);
    console.log("response: ")
    axios.post(apiurl, jsonObj)
      .then(response => {
        console.log(response.data);
      })
      .catch(error => {
        console.log(error);
      });
  }

  const bringFront = () => {
    // return if no item currently selected
    if (!moveableRef.current.refTargets || moveableRef.current.refTargets.length < 1)
      return;

    const uid = moveableRef.current.refTargets[0].getAttribute("data-key");
    const foundItem = activeObjects.find(f => f.uid === uid);
    const oldZ = foundItem.z;

    const _activeObjects = activeObjects.map(f => {
      if (uid === f.uid) {
        f.z = activeObjects.length;
      }
      else if (f.z > oldZ) {
        f.z -= 1;
      }

      return f;
    })

    setActiveObjects(() => _activeObjects);
    localStorage.activeObjects = JSON.stringify(_activeObjects);
  }

  const sendBack = () => {
    if (!moveableRef.current.refTargets || moveableRef.current.refTargets.length < 1)
      return;

    const uid = moveableRef.current.refTargets[0].getAttribute("data-key");
    const foundItem = activeObjects.find(f => f.uid === uid);
    const oldZ = foundItem.z;

    const _activeObjects = activeObjects.map(f => {
      if (uid === f.uid) {
        f.z = 1;
      }
      else if (f.z < oldZ) {
        f.z += 1;
      }

      return f;
    })

    setActiveObjects(() => _activeObjects);
    localStorage.activeObjects = JSON.stringify(_activeObjects);
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
        top: `${rect.height + 20*(1/zoom)}px`,
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
        {Math.round(pxToInch(rect.offsetWidth) - 2*wallWidth)}" x {Math.round(pxToInch(rect.offsetHeight) - 2*wallWidth)}"
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
    }, 10);
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
    boxRef.current.updateRect();
  };

  const updateAOStorage = (e) => {
    var newX = pxToInch(parseTransform(e.target.style.transform).x);
    var newY = pxToInch(parseTransform(e.target.style.transform).y);
    var newHeight = pxToInch(e.target.style.height);
    var newWidth = pxToInch(e.target.style.width);
    var newRotate = normalizeRotation(parseFloat(parseTransform(e.target.style.transform).rotate));

    var uid = e.target.id;
    const _activeObjects = [...activeObjects];
    var foundItem = _activeObjects.find(f => f.uid === uid);

    foundItem.x = newX;
    foundItem.y = newY;
    foundItem.height = newHeight;
    foundItem.width = newWidth;
    foundItem.rotate = newRotate;

    localStorage.activeObjects = JSON.stringify(_activeObjects);
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

  
  return (
    <div className="home-page">
      <div className="left-bar">
        <div className="card-container">
          {
            (designMode === Modes.room)
              ?
              structureList.map((f) => (
                <div className="card structure" key={f.itemKey} data-key={f.itemKey} onClick={() => handleAdd(f.itemKey)}>
                  <div className="image-container">
                    <img src={f.url} alt={f.description} draggable="false" />
                  </div>
                  <div className="description">{f.description}</div>
                </div>
              ))
              :
              furnitureList.map((f) => (
                <div className="card furniture" key={f.itemKey} data-key={f.itemKey} onClick={() => handleAdd(f.itemKey)}>
                  <div className="image-container">
                    <img src={f.url} alt={f.description} draggable="false" />
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
                width: `${inchToPx(roomDimensions.width)}px`,
                height: `${inchToPx(roomDimensions.height)}px`,
                position: "absolute",
                borderWidth: `${inchToPx(wallWidth)}px`
              }}>
              {activeObjects.map((f) => (
                <img
                  draggable="false"
                  src={f.url}
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
                groupableProps =   {{
                  rotatable: false,
                  resizable: false,
                }}
                renderDirections={(designMode === Modes.furnish) ? ["nw", "n", "ne", "w", "e", "sw", "s", "se"] : ["n", "w", "s", "e"]}
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
                  updateAOStorage(e);
                  updateFurnitureForm(e);
                }}
                onRenderGroupEnd={({ events }) => {
                  events.forEach(ev => {
                    updateAOStorage(ev);
                  });
                }}
                onRender={e => {
                  updateFurnitureForm(e);
                }}
              ></Moveable>
              <Selecto
                ref={selectoRef}
                selectableTargets={(designMode === Modes.furnish) ? [".furn-target"] : [".struc-target"]}
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
              target={(((designMode === Modes.room) && !(roomLock)) ? ".room" : ".dummyvalue")}
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

                var newRoomDimensions = { width: newWidth, height: newHeight };
                localStorage.roomDimensions = JSON.stringify(newRoomDimensions);
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
          (designMode === Modes.furnish)
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
              <button onClick={exportData}>Dev: API Post</button>
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
              <input type="checkbox" checked={roomLock} onChange={handleRoomLockChange} />
              <br />
              <br />
              <label htmlFor="roomWidth">Width:</label><br />
              <input readOnly={roomLock} ref={roomWidthInputRef} {...requestCallbacksRoom} type="number" id="roomWidth" name="roomWidth" /><br />
              <label htmlFor="roomHeight">Height:</label><br />
              <input readOnly={roomLock} ref={roomHeightInputRef} {...requestCallbacksRoom} type="number" id="roomHeight" name="roomHeight" /><br />
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
              <br/><br/>
              <button onClick={exportData}>Dev: API Post</button>
            </div>
        }
        <div>
          <p className="tog">{designMode === Modes.furnish ? "Floor Plan" : "Furnish"}</p>
          <label className="switch tog">
            <input type="checkbox" checked={(designMode === Modes.furnish)} onChange={handleModeChange} />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
};



export default Home;