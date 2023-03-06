import React from "react";
import { useDroppable } from "@dnd-kit/core";
import "./styles.scss";

const CustomStyle = {
  display: "flex",
  width: "400px",
  height: "400px",
  background: "white",
  border: "solid",
};

export function Droppable({ children }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable"
  });
  const style = {
    
  };

  return (
    <div class="room" ref={setNodeRef} style={{ ...style, ...CustomStyle }}>
      {children}
    </div>
  );
}