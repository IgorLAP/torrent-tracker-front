import React, { useEffect, useState } from "react";

import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";
import { BiRefresh } from "react-icons/bi";

import { Movie } from "~/interfaces/Movie";

import styles from "./highlight.module.scss";

interface HighlightListProps {
  title: "Movies" | "4K Movies";
  movies: Movie[];
  handleGetLink: (href: string, name: string) => Promise<void>;
  setAbsoluteLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setMovies: React.Dispatch<React.SetStateAction<Movie[]>>;
}

export function HighlightList({
  title,
  movies,
  handleGetLink,
  setAbsoluteLoading,
  setMovies,
}: HighlightListProps) {
  const [scrollX, setScrollX] = useState(0);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);

  function refreshMovies() {
    if (movies.length > 0) setAbsoluteLoading(true);
    fetch(
      `https://torrenttracker.onrender.com/new-movies?cat=${
        title === "4K Movies" ? "2" : "1"
      }`
    )
      .then((results) => results.json())
      .then((response) => {
        setMovies(response.movies);
        setAbsoluteLoading(false);
      })
      .catch((error) => {
        setAbsoluteLoading(false);
        alert(error.message);
      });
  }

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
      <div className={styles.listInfo}>
        <button
          type="button"
          className={styles.refreshBtn}
          onClick={refreshMovies}
        >
          <BiRefresh />
        </button>
        <h2>{title}</h2>
      </div>
      <div style={{ marginLeft: scrollX }} className={styles.movies}>
        {movies.map((movie, index) => (
          <button
            type="button"
            id={putId(index)}
            className={styles.movieCard}
            key={movie.name}
            onMouseMove={(e) => handleHover(e, e.currentTarget.id)}
            onClick={() => handleGetLink(movie.link, movie.name)}
          >
            <img src={movie.poster} alt={movie.name} />
            <p
              style={{ top: yPos as number, left: xPos as number }}
              className={styles.movieName}
            >
              {movie.name}
            </p>
          </button>
        ))}
      </div>
      <div className={styles.buttons}>
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
