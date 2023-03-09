import React, { useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import bed from '../../Assets/vectors/furniture/bed.svg';
import desk from '../../Assets/vectors/furniture/desk.svg';
import plant from '../../Assets/vectors/furniture/plant.svg';
import table from '../../Assets/vectors/furniture/bedsidetable.svg';
import door from '../../Assets/vectors/furniture/door.png';
import { Draggable } from "./Draggable";
import { Droppable } from "./Droppable";
import './home.css';


const furnitureList = [
    {
      id: "2",
      url: bed,
      position: {
        x: 40,
        y: 5
      },
      width: "200px",
      height: "200px",
      class: "bed",
    },
    {
      id: "3",
      url: desk,
      position: {
        x: 5,
        y: 226
      },
      width: "185px",
      height: "185px",
      class: "desk",
    },
    {
      id: "4",
      url: table,
      position: {
        x: 5,
        y: 5
      },
      width: "50px",
      height: "50px",
    },
    {
      id: "5",
      url: plant,
      position: {
        x: 300,
        y: 20
      },
      width: "80",
      height: "80px",
    },
    {
      id: "6",
      url: table,
      position: {
        x: 220,
        y: 5
      },
      width: "50px",
      height: "50px",
    },
    {
      id: "7",
      url: door,
      position: {
        x: 300,
        y: 310
      },
      width: "100px",
      height: "100px",
    },
  
  
  ];

const Home = () => {
    const [furniture, setFurniture] = useState(furnitureList);
  
    function handleDragEnd(ev) {
      const f = furniture.find((x) => x.id === ev.active.id);
      f.position.x += ev.delta.x;
      f.position.y += ev.delta.y;
      const _furniture = furniture.map((x) => {
        if (x.id === f.id) return f;
        return x;
      });
      setFurniture(_furniture);
    }

    return (
      <div className="room">
        <DndContext onDragEnd={handleDragEnd}>
          <Droppable>
            {furniture.map((f) => (
              <Draggable
                styles={{
                  position: "absolute",
                  left: `${f.position.x}px`,
                  top: `${f.position.y}px`
                }}
                key={f.id}
                id={f.id}
                content={f.content}
                url={f.url}
                width={f.width}
                height={f.height}
              />
            ))}
          </Droppable>
        </DndContext>
      </div>
    );
  };

  export default Home;