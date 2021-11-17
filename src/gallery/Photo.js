import React from "react";

const imgWithClick = { cursor: "pointer" };

const Photo = ({ index,onClick, photo, margin, direction, top, left,onGridRemoveClick,indexkey }) => {
  const imgStyle = { margin: margin };
  if (direction === "column") {
    imgStyle.position = "absolute";
    imgStyle.left = left;
    imgStyle.top = top;
  }
  const handleClick = event => {
    onClick(event, { photo, index });
  };
  // console.log(indexkey);

  return (
    <div
    style={onClick ? { ...imgStyle, ...imgWithClick } : imgStyle} 
    onClick={onClick ? handleClick : null}
    className="design-image-grid-drag"
    >
    <span onClick={onGridRemoveClick} data-id={indexkey}>X</span>
    <img
      {...photo}
      alt="img"
    />
    </div>
  );
};

export default Photo;
