import { Link } from "react-router-dom";
import "./Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faWindows, faPlaystation, faXbox, faApple } from "@fortawesome/free-brands-svg-icons";
import { useState, useEffect } from "react";
import { searchGames } from "../../api/rawg";

interface SearchGame {
  id: number;
  name: string;
  cover: string | null;
  parent_platforms: any;
}


export default function Navbar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchGame[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const fetchData = async () => {
      const games = await searchGames(query);
      setResults(games);
    };

    console.log("Fetching search results for query:", query); // 👈 AÑADE ESTO

    fetchData();
  }, [query]);

  return (
    <nav className="navbar">
      <Link to="/inicio">
        <img src="/logoDibujoBlanco.png" alt="Logo" className="logo-navbar" />
      </Link>

      <div className="navbar-search">
        <div className="search-wrapper">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" />

          <input
            type="text"
            placeholder="Busca entre 897.538 juegos..."
            className="search-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onBlur={() => setTimeout(() => setShowResults(false), 200)}
            onFocus={() => query.length > 1 && setShowResults(true)}
          />

          {showResults && results.length > 0 && (
            <ul className="search-results">
             {results.map((game) => (
                <Link to={`/juego/${game.id}`} className="search-item" key={game.id}>
                  <img
                    src={game.cover || "/placeholder.jpg"}
                    alt={game.name}
                    className="search-thumb"
                  />
                  <div className="search-game-rigth">
                    <div className="game-platforms-search">
                      {game.parent_platforms?.map((p: { platform: { slug: string; id: number } }) => {
                        switch (p.platform.slug) {
                          case "pc":
                            return <FontAwesomeIcon key={p.platform.id} icon={faWindows} className="platform-icon" />;
                          case "playstation":
                            return <FontAwesomeIcon key={p.platform.id} icon={faPlaystation} className="platform-icon" />;
                          case "xbox":
                            return <FontAwesomeIcon key={p.platform.id} icon={faXbox} className="platform-icon" />;
                          case "ios":
                            return <FontAwesomeIcon key={p.platform.id} icon={faApple} className="platform-icon" />;
                          default:
                            return null;
                        }
                      })}
                    </div>
                    <span className="search-title">{game.name}</span>
                  </div>
                </Link>
              ))}
            </ul>
          )}
        </div>
      </div>

      <ul className="navbar-links">
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/games">Juegos</Link></li>
        <li><Link to="/profile">Perfil</Link></li>
      </ul>
    </nav>
  );
}
