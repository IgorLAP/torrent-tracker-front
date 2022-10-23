import React, { useState } from "react";

import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

import { Movie } from "~/interfaces/Movie";

import styles from "./highlight.module.scss";

interface HighlightListProps {
  title: "Movies" | "4K Movies";
  movies: Movie[];
  handleGetLink: (href: string, name: string) => Promise<void>;
}

export function HighlightList({
  title,
  movies,
  handleGetLink,
}: HighlightListProps) {
  const [scrollX, setScrollX] = useState(0);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);

  function handleGoLeft() {
    let x = scrollX + Math.round(window.innerWidth / 2);
    if (x > 0) x = 0;
    setScrollX(x);
  }

  function handleGoRight() {
    let x = scrollX - Math.round(window.innerWidth / 2);
    const listW = movies.length * 166;
    if (window.innerWidth - listW > x) {
      x = window.innerWidth - listW;
    }
    setScrollX(x);
  }

  function putId(index: number) {
    if (title === "Movies") return `firstrow-${index}`;
    return `secondrow-${index}`;
  }

  function handleHover(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    hoverId: string
  ) {
    const element = document.getElementById(hoverId);
    const boundTo = element?.getBoundingClientRect();
    const globalX = event.clientX;
    const globalY = event.clientY;
    setXPos(scrollX === 0 ? globalX - boundTo!.left : globalX - boundTo!.right);
    setYPos(globalY - boundTo!.top);
  }

  return (
    <div className={styles.container}>
      <h2>{title}</h2>
      <div style={{ marginLeft: scrollX }} className={styles["movie-slider"]}>
        {movies.map((movie, index) => (
          <button
            key={movie.name}
            type="button"
            className={styles["movie-card"]}
            id={putId(index)}
            onMouseMove={(e) => handleHover(e, e.currentTarget.id)}
            onClick={() => handleGetLink(movie.link, movie.name)}
          >
            <img src={movie.poster} alt={movie.name} />
            <p
              style={{ top: yPos as number, left: xPos as number }}
              className={styles["movie-name"]}
            >
              {movie.name}
            </p>
          </button>
        ))}
      </div>
      <div className={styles["control-btns"]}>
        <button type="button" onClick={handleGoLeft} disabled={scrollX === 0}>
          <AiOutlineLeft />
        </button>
        <button
          type="button"
          onClick={handleGoRight}
          disabled={scrollX === window.innerWidth - movies.length * 166}
        >
          <AiOutlineRight />
        </button>
      </div>
    </div>
  );
}
