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

  return (
    <div className="home-page">
      <div className="left-bar">
        <div className="card-container">
          {(designMode === "room") ? null : furnitureList.map((f) => (
            <div className="card" key={f.itemKey} data-key={f.itemKey} onClick={() => handleAdd(f.itemKey)}>
              <div className="image-container">
                <img src={f.url} alt={f.description}/>  
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
        </div>
        <Moveable
          flushSync={flushSync}
          ref={moveableRef}
          props={{
            dimensionViewable: true,
          }}
          ables={[DimensionViewable]}
          target={designMode === "furnish" ? targets : boxRef}
          individualGroupable={true}
          draggable={designMode === "furnish" ? true : false}
          throttleDrag={1}
          throttleRotate={5}
          edgeDraggable={false}
          startDragRotate={0}
          throttleDragRotate={0}
          resizable={true}
          keepRatio={false}
          throttleScale={0}
          renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
          rotatable={designMode === "furnish" ? true : false}
          rotationPosition={"top"}
          hideDefaultLines={false}
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
        />
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
      <div className="right-bar">
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







