import { FormEvent, useEffect, useState } from "react";

import { AiOutlineSearch } from "react-icons/ai";
import { HiChevronUp, HiChevronDown } from "react-icons/hi";
import ReactLoading from "react-loading";
import Swal from "sweetalert2";

import { HighlightList } from "~/components/HighlightList";
import { Movie } from "~/interfaces/Movie";
import { Torrent } from "~/interfaces/Torrent";
import styles from "~/styles/app.module.scss";

export function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [fourKMovies, setFourKMovies] = useState<Movie[]>([]);
  const [torrents, setTorrents] = useState<Torrent[]>([]);
  const [loading, setLoading] = useState(false);
  const [absoluteLoading, setAbsoluteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [ordering, setOrdering] = useState<{
    size: "" | "asc" | "desc";
    seed: "" | "asc" | "desc";
  }>({
    size: "",
    seed: "asc",
  });

  useEffect(() => {
    getMovies();
  }, []);

  function getMovies() {
    if (movies.length === 0) setLoading(true);
    fetch("https://torrent-tracker.deta.dev/new-movies")
      .then((results) => results.json())
      .then((response) => {
        setMovies(response.movies);
        setFourKMovies(response.fourKMovies);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        alert("Error getting movies");
      });
  }

  function generateLink(magnetLink: string) {
    const link = document.createElement("a");
    link.href = magnetLink;
    document.body.appendChild(link);
    link.click();
  }

  async function handleGetLink(link: string, name: string) {
    Swal.fire({
      title: `Get '${name}' torrent?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      confirmButtonColor: "#77cc55",
      cancelButtonColor: "#ef5350",
      color: "#f5f5f5",
      background: "#282828",
    }).then((result) => {
      if (result.isConfirmed) {
        if (link.includes("magnet")) {
          generateLink(link);
          return;
        }
        setAbsoluteLoading(true);
        fetch("https://torrent-tracker.deta.dev/get-link", {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-type": "application/json",
          },
          body: JSON.stringify({ link }),
        })
          .then((results) => results.json())
          .then((response) => {
            const { magnetLink } = response;
            generateLink(magnetLink);
            setAbsoluteLoading(false);
          })
          .catch(() => {
            setAbsoluteLoading(false);
            alert("Error getting your link");
          });
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!search) return;
    setAbsoluteLoading(true);
    fetch("https://torrent-tracker.deta.dev/search-torrents", {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-type": "application/json",
      },
      body: JSON.stringify({ query: search }),
    })
      .then((results) => results.json())
      .then((response) => {
        const { torrents: torrentList } = response;
        setOrdering({
          size: "",
          seed: "asc",
        });
        setTorrents(torrentList);
        setAbsoluteLoading(false);
      })
      .catch(() => {
        setAbsoluteLoading(false);
        alert("Search failed");
      });
  }

  function seedSizeToNum(value: string | number): number {
    if (typeof value === "number") {
      return value;
    }

    const [qt, unity] = value.split(" ");
    if (unity.includes("GB") || unity.includes("TB")) {
      if (qt.includes(".")) {
        return Number(qt.split(".").join("000."));
      }
      return Number(qt.concat("000"));
    }

    if (unity.toUpperCase().includes("KB")) {
      if (qt.includes(".")) {
        return Number(`0.${qt.split(".")[0]}`);
      }
      return Number(`0.${qt}`);
    }

    return Number(qt);
  }

  function handleOrder(orderBy: "seed" | "size") {
    const ascSortSeed = [...torrents].sort(
      (a, b) => seedSizeToNum(b[orderBy]) - seedSizeToNum(a[orderBy])
    );
    const descSortSeed = [...torrents].sort(
      (a, b) => seedSizeToNum(a[orderBy]) - seedSizeToNum(b[orderBy])
    );
    if (torrents[0].name === ascSortSeed[0].name) {
      setTorrents(descSortSeed);
      setOrdering({
        ...ordering,
        seed: orderBy === "seed" ? "desc" : "",
        size: orderBy === "size" ? "desc" : "",
      });
    } else {
      setTorrents(ascSortSeed);
      setOrdering({
        ...ordering,
        seed: orderBy === "seed" ? "asc" : "",
        size: orderBy === "size" ? "asc" : "",
      });
    }
  }

  return (
    <>
      <div
        style={{
          height: loading ? "100vh" : "",
          margin: loading ? "0" : "",
          display: loading ? "flex" : "",
          justifyContent: loading ? "center" : "",
          alignItems: loading ? "center" : "",
        }}
        className={styles.container}
      >
        {movies.length === 0 && fourKMovies.length === 0 && (
          <ReactLoading
            className={styles.loading}
            type="bars"
            color="white"
            height="10%"
            width="10%"
          />
        )}
        {movies.length > 0 && fourKMovies.length > 0 && (
          <>
            <HighlightList
              movies={movies}
              title="Movies"
              handleGetLink={handleGetLink}
            />
            <HighlightList
              movies={fourKMovies}
              title="4K Movies"
              handleGetLink={handleGetLink}
            />
            <main className={styles.main}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit">
                  <AiOutlineSearch />
                </button>
              </form>
              {torrents.length > 0 && (
                <div className={styles["table-container"]}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>
                          Size
                          <button
                            type="button"
                            className={styles["order-btn"]}
                            onClick={() => handleOrder("size")}
                          >
                            <HiChevronUp
                              color={
                                ordering.size === "asc" ? "green" : "white"
                              }
                            />
                            <HiChevronDown
                              color={ordering.size === "desc" ? "red" : "white"}
                            />
                          </button>
                        </th>
                        <th>
                          Seeds
                          <button
                            type="button"
                            className={styles["order-btn"]}
                            onClick={() => handleOrder("seed")}
                          >
                            <HiChevronUp
                              color={
                                ordering.seed === "asc" ? "green" : "white"
                              }
                            />
                            <HiChevronDown
                              color={ordering.seed === "desc" ? "red" : "white"}
                            />
                          </button>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {torrents.map((torrent) => (
                        <tr
                          key={torrent.link}
                          className={styles["content-tr"]}
                          onClick={() =>
                            handleGetLink(torrent.link, torrent.name)
                          }
                        >
                          <td>{torrent.name}</td>
                          <td>{torrent.size}</td>
                          <td>{torrent.seed}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </main>
          </>
        )}
      </div>
      {absoluteLoading && (
        <div className={`${styles.loading} ${styles["absolute-loading"]}`}>
          <ReactLoading type="bars" color="white" height="10%" width="10%" />
        </div>
      )}
    </>
  );
}
