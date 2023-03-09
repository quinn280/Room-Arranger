import React from "react";
import { useDraggable } from "@dnd-kit/core";

const CustomStyle = {

};

export function Draggable({ id, url, width, height, styles }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id
  });

  const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
  } : {};

  return (
    <img ref={setNodeRef} style={{ ...style, ...CustomStyle, ...styles }}{...listeners}{...attributes} src={url} width={width} height={height}>
    </img>
  );
}