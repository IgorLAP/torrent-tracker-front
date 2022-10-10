import { FormEvent, useEffect, useState } from "react";

import { AiOutlineSearch } from "react-icons/ai";
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

  useEffect(() => {
    getMovies();
  }, []);

  function getMovies() {
    if (movies.length === 0) setLoading(true);
    fetch("https://torrenttracker.onrender.com/new-movies")
      .then((results) => results.json())
      .then((response) => {
        setMovies(response.movies);
        setFourKMovies(response.fourKMovies);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        alert(error.message);
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
        fetch("https://torrenttracker.onrender.com/get-link", {
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
          .catch((error) => {
            setAbsoluteLoading(false);
            alert(error.message);
          });
      }
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!search) return;
    setAbsoluteLoading(true);
    fetch("https://torrenttracker.onrender.com/search-torrents", {
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
        setTorrents(torrentList);
        setAbsoluteLoading(false);
      })
      .catch((error) => {
        setAbsoluteLoading(false);
        alert(error.message);
      });
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
              setAbsoluteLoading={setAbsoluteLoading}
              setMovies={setMovies}
            />
            <HighlightList
              movies={fourKMovies}
              title="4K Movies"
              handleGetLink={handleGetLink}
              setAbsoluteLoading={setAbsoluteLoading}
              setMovies={setFourKMovies}
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
                        <th>Size</th>
                        <th>Seeds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {torrents.map((torrent) => (
                        <tr
                          key={torrent.link}
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
        <div className={`${styles.loading} ${styles.absoluteLoading}`}>
          <ReactLoading type="bars" color="white" height="10%" width="10%" />
        </div>
      )}
    </>
  );
}
