import React, { useState } from "react";
import { DndContext, useDraggable } from "@dnd-kit/core";
import { Draggable } from "./Draggable";
import { Droppable } from "./Droppable";
import "./styles.scss";
import bed from './furnsvg/bed.svg'; // with import
import desk from './furnsvg/desk.svg'; // with import
import plant from './furnsvg/plant.svg'; // with import
import table from './furnsvg/bedsidetable.svg'; // with import
import door from './furnsvg/door.png'; // with import
import $ from 'jquery';

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

export default function App() {
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
    <DndContext onDragEnd={handleDragEnd}>
      <header id="nav-wrapper">
        <nav id="nav">
          <div class="nav left">
            <span class="gradient skew"><h1 class="logo un-skew"><a href="#home">Room Arranger</a></h1></span>
            <button id="menu" class="btn-nav"><span class="fas fa-bars"></span></button>
          </div>
          <div class="nav right">
            <a href="#home" class="nav-link active"><span class="nav-link-span"><span class="u-nav">Home</span></span></a>
            <a href="#about" class="nav-link"><span class="nav-link-span"><span class="u-nav">Saved</span></span></a>
            <a href="#work" class="nav-link"><span class="nav-link-span"><span class="u-nav">Explore</span></span></a>
            <a href="#contact" class="nav-link"><span class="nav-link-span"><span class="u-nav">About</span></span></a>
          </div>
        </nav>
      </header>
      <main>
        <section id="home">

        </section>
        <section id="about">

        </section>
        <section id="work">

        </section>
        <section id="contact">

        </section>
      </main>
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
  );
}


var util = {
  mobileMenu() {
    $("#nav").toggleClass("nav-visible");
  },
  windowResize() {
    if ($(window).width() > 800) {
      $("#nav").removeClass("nav-visible");
    }
  },
  scrollEvent() {
    var scrollPosition = $(document).scrollTop();

    $.each(util.scrollMenuIds, function (i) {
      var link = util.scrollMenuIds[i],
        container = $(link).attr("href"),
        containerOffset = $(container).offset().top,
        containerHeight = $(container).outerHeight(),
        containerBottom = containerOffset + containerHeight;

      if (scrollPosition < containerBottom - 20 && scrollPosition >= containerOffset - 20) {
        $(link).addClass("active");
      } else {
        $(link).removeClass("active");
      }
    });
  }
};

$(document).ready(function () {

  util.scrollMenuIds = $("a.nav-link[href]");
  $("#menu").click(util.mobileMenu);
  $(window).resize(util.windowResize);
  $(document).scroll(util.scrollEvent);

});