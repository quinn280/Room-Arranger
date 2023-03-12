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
  const moveableRef = React.useRef(null);
  const selectoRef = React.useRef(null);


  return (
    <div className="homepage">
      <div className="room">
        {furniture.map((a) => (
          <img src={a.url} className="target" alt=""
            style={{
              position: "absolute",
              left: `${a.position.x}px`,
              top: `${a.position.y}px`,
              width: `${a.width}`,
              height: `${a.height}`,
            }}
            key={a.key}
          />
        ))}
      </div>
      <Moveable
        flushSync={flushSync}
        ref={moveableRef}
        target={targets}
        individualGroupable={true}
        draggable={true}
        throttleDrag={1}
        throttleRotate={5}
        edgeDraggable={false}
        startDragRotate={0}
        throttleDragRotate={0}
        scalable={true}
        keepRatio={false}
        throttleScale={0}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        rotatable={true}
        rotationPosition={"top"}
        hideDefaultLines={false}
        onDrag={e => {
          e.target.style.transform = e.transform;
        }}
        onScale={e => {
          e.target.style.transform = e.drag.transform;
        }}
        onRotate={e => {
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

export default Home;