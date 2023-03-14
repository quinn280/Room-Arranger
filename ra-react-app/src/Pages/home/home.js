import React, { useState } from "react";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { flushSync } from "react-dom";
import bed from '../../Assets/vectors/furniture/bed.svg';
import desk from '../../Assets/vectors/furniture/desk.svg';
import plant from '../../Assets/vectors/furniture/plant.svg';
import table from '../../Assets/vectors/furniture/bedsidetable.svg';
import door from '../../Assets/vectors/furniture/door.svg';
import './home.css';


const furnitureList = [
  {
    key: 2,
    url: bed,
    position: {
      x: 40,
      y: 5
    },
    width: "200px",
    height: "200px",
    class: "bed",
    rotate: 0
  },
  {
    key: 3,
    url: desk,
    position: {
      x: 5,
      y: 240
    },
    width: "210px",
    height: "160px",
    class: "desk",
    rotate: 0,
  },
  {
    key: 4,
    url: table,
    position: {
      x: 5,
      y: 5
    },
    width: "50px",
    height: "50px",
    rotate: 0,
  },
  {
    key: 5,
    url: plant,
    position: {
      x: 300,
      y: 20
    },
    width: "80px",
    height: "80px",
    rotate: 0,
  },
  {
    key: 6,
    url: table,
    position: {
      x: 220,
      y: 5
    },
    width: "50px",
    height: "50px",
    rotate: 0,
  },
  {
    key: 7,
    url: door,
    position: {
      x: 300,
      y: 310
    },
    width: "100px",
    height: "100px",
    rotate: 0,
  },


];



const Home = () => {
  const [furniture, setFurniture] = useState(furnitureList);
  const [targets, setTargets] = useState([]);
  const [designMode, setDesignMode] = useState("room");
  const moveableRef = React.useRef(null);
  const selectoRef = React.useRef(null);
  const boxRef = React.useRef(null);

  const handleRemove = (key) => {
    // eslint-disable-next-line
    setFurniture(furniture.filter((f) => f.key != key));
    setTargets([]);
  };

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
    <div className="homepage">
      <div>
        <p className="tog">{designMode === "furnish" ? "Floor Plan" : "Furnish"}</p>
        <label className="switch tog">
          <input type="checkbox" onChange={handleModeChange}/>
          <span className="slider round"></span>
        </label>
      </div>
      
      <div className="room" ref={boxRef}>
        {furniture.map((a) => (
          <img 
            src={a.url} 
            key={a.key}
            data-key={a.key}
            className="target" 
            alt=""
            onKeyDown={onKeyPressed}
            tabIndex="-1"
            style={{
              position: "absolute",
              left: `${a.position.x}px`,
              top: `${a.position.y}px`,
              width: `${a.width}`,
              height: `${a.height}`,
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







