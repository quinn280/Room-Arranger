import React, { useState } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { flushSync } from "react-dom";
import './home.css';
import furnitureList from "./furnitureData.js";


const Home = () => {
  const [activeFurniture, setActiveFurniture] = useState([]);
  const [targets, setTargets] = useState([]);
  const [designMode, setDesignMode] = useState("room");
  const moveableRef = React.useRef(null);
  const selectoRef = React.useRef(null);
  const boxRef = React.useRef(null);

  const xInputRef = React.useRef(null);
  const yInputRef = React.useRef(null);
  const widthInputRef = React.useRef(null);
  const heightInputRef = React.useRef(null);
  const rotateInputRef = React.useRef(null);

  const roomWidthInputRef = React.useRef(null);
  const roomHeightInputRef = React.useRef(null);

  const [requestCallbacksFurniture] = useState(() => {
    function request() {

      
      moveableRef.current.request("draggable", {
        x: parseInt(xInputRef.current.value),
        y: parseInt(yInputRef.current.value),
      }, true);

      moveableRef.current.request("resizable", {
        offsetWidth: parseInt(widthInputRef.current.value),
        offsetHeight: parseInt(heightInputRef.current.value),
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
        offsetWidth: parseInt(roomWidthInputRef.current.value),
        offsetHeight: parseInt(roomHeightInputRef.current.value),
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

  const handleRemove = (uid) => {
    setActiveFurniture(activeFurniture.filter((f) => f.uid !== uid));
    setTargets([]);
  };

  const handleAdd = (itemKey) => {
    const foundItem = furnitureList.find(f => parseInt(f.itemKey) === parseInt(itemKey));
    const foundItemCopy = Object.assign({}, foundItem);
    foundItemCopy.uid = generateUID();
    setActiveFurniture(oldArray => [...oldArray, foundItemCopy]);
  }

  const generateUID = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  const handleModeChange = (e) => {
    const checked = e.target.checked;
    setDesignMode(checked ? "furnish" : "room");
  };

  const onKeyPressed = (e) => {
    const keyCode = e.keyCode;
    const dataKey = e.target.getAttribute("data-key");

    if (keyCode === 8 || keyCode === 46) {
      handleRemove(dataKey);
    }
  };

  function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  const updateFurnitureForm = (e) => {
    requestAnimationFrame(() => {
      const rect = e.moveable.getRect();
      xInputRef.current.value = `${round(rect.left, 1)}`;
      yInputRef.current.value = `${round(rect.top, 1)}`;
      widthInputRef.current.value = `${round(rect.offsetWidth, 1)}`;
      heightInputRef.current.value = `${round(rect.offsetHeight, 1)}`;
      rotateInputRef.current.value = `${round(rect.rotation, 1)}`;
    })
  };

  const updateRoomForm = (e) => {
    requestAnimationFrame(() => {
      const rect = e.moveable.getRect();
      roomWidthInputRef.current.value = `${round(rect.offsetWidth, 1)}`;
      roomHeightInputRef.current.value = `${round(rect.offsetHeight, 1)}`;
    })
  };

  return (
    <div className="home-page">
      <div className="left-bar">
        <div className="card-container">
          {(designMode === "room") ? null : furnitureList.map((f) => (
            <div className="card" key={f.itemKey} data-key={f.itemKey} onClick={() => handleAdd(f.itemKey)}>
              <div className="image-container">
                <img src={f.url} alt={f.description} />
              </div>
              <div className="description">{f.description}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="design-area">
        <div className="room" ref={boxRef}>
          {activeFurniture.map((f) => (
            <img
              src={f.url}
              key={f.uid}
              data-key={f.uid}
              className="target"
              alt=""
              onKeyDown={onKeyPressed}
              tabIndex="-1"
              style={{
                position: "absolute",
                left: `${0}px`,
                top: `${0}px`,
                width: `${f.defaultWidth}`,
                height: `${f.defaultHeight}`,
              }}
            />
          ))}
          <Moveable
            flushSync={flushSync}
            ref={moveableRef}
            props={{
              dimensionViewable: true,
            }}
            ables={[DimensionViewable]}
            target={(designMode === "furnish") ? targets: null}
            individualGroupable={true}
            draggable={true}
            throttleDrag={1}
            throttleRotate={5}
            resizable={true}
            renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
            rotatable={true}
            onDragStart={e => {
              e.target.focus();
            }}
            onDrag={e => {
              e.target.style.transform = e.transform;
            }}
            onRotate={e => {
              e.target.style.transform = e.drag.transform;
            }}
            onResize={e => {
              e.target.style.width = `${e.width}px`;
              e.target.style.height = `${e.height}px`;
              e.target.style.transform = e.drag.transform;
            }}
            onDragEnd={e => {
              updateFurnitureForm(e);
            }}
            onRotateEnd={e => {
              updateFurnitureForm(e);
            }}
            onResizeEnd={e => {
              updateFurnitureForm(e);
            }}
          ></Moveable>
          <Selecto
            ref={selectoRef}
            selectableTargets={[".target"]}
            dragContainer={".room"}
            hitRate={0}
            selectByClick={true}
            selectFromInside={false}
            ratio={0}
            onDragStart={e => {
              const moveable = moveableRef.current;
              const target = e.inputEvent.target;
              if (
                moveable.isMoveableElement(target)
                || targets.some(t => t === target || t.contains(target))
              ) {
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
            }}
          ></Selecto>
        </div>
        <Moveable
          flushSync={flushSync}
          props={{
            dimensionViewable: true,
          }}
          ables={[DimensionViewable]}
          target={((designMode === "room") ? ".room" : ".dummyvalue")}
          ref={boxRef}
          resizable={true}
          onResize={(e) => {
            e.target.style.width = `${e.width}px`;
            e.target.style.height = `${e.height}px`;
            e.target.style.transform = e.drag.transform;
          }}
          onResizeEnd={e => {
            updateRoomForm(e);
          }}
        ></Moveable>
      </div>
      <div className="right-bar">
        {
          (designMode === "furnish")
            ?
            <form className="furnFormEntry" key="furnFormEntry">
              <label htmlFor="x">X:</label><br />
              <input ref={xInputRef} {...requestCallbacksFurniture} type="number" id="x" name="x" /><br />
              <label htmlFor="y">Y:</label><br />
              <input ref={yInputRef} {...requestCallbacksFurniture} type="number" id="y" name="y" /><br />
              <label htmlFor="width">Width</label><br />
              <input ref={widthInputRef} {...requestCallbacksFurniture} type="number" id="width" name="width" /><br />
              <label htmlFor="height">Height</label><br />
              <input ref={heightInputRef} {...requestCallbacksFurniture} type="number" id="height" name="height" /><br />
              <label htmlFor="rotation">Rotation:</label><br />
              <input ref={rotateInputRef} {...requestCallbacksFurniture} type="number" id="rotation" name="rotation" /><br />
            </form>
            :
            <form className="roomFormEntry" key="roomFormEntry">
              <label htmlFor="roomWidth">Width:</label><br />
              <input ref={roomWidthInputRef} {...requestCallbacksRoom} type="number" id="roomWidth" name="roomWidth" /><br />
              <label htmlFor="roomHeight">Height:</label><br />
              <input ref={roomHeightInputRef} {...requestCallbacksRoom} type="number" id="roomHeight" name="roomHeight" /><br />
            </form>
        }

        <div>
          <p className="tog">{designMode === "furnish" ? "Floor Plan" : "Furnish"}</p>
          <label className="switch tog">
            <input type="checkbox" onChange={handleModeChange} />
            <span className="slider round"></span>
          </label>
        </div>
      </div>
    </div>

  );
};

const DimensionViewable = {
  name: "dimensionViewable",
  props: {},
  events: {},
  render(moveable, React) {
    const rect = moveable.getRect();

    // Add key (required)
    // Add class prefix moveable-(required)
    return <div key={"dimension-viewer"} className={"moveable-dimension"} style={{
      position: "absolute",
      left: `${rect.width / 2}px`,
      top: `${rect.height + 20}px`,
      background: "#4af",
      borderRadius: "2px",
      padding: "2px 4px",
      color: "white",
      fontSize: "13px",
      whiteSpace: "nowrap",
      fontWeight: "bold",
      willChange: "transform",
      transform: `translate(-50%, 0px)`,
    }}>
      {Math.round(rect.offsetWidth)} x {Math.round(rect.offsetHeight)}
    </div>;
  },
};



export default Home;







