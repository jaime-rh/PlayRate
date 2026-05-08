// src/components/Inicio.tsx
import { useEffect, useState, type ReactNode } from "react";
import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindows, faPlaystation, faXbox, faApple } from "@fortawesome/free-brands-svg-icons";
import { faChevronLeft, faChevronRight, faMinus, faPlus, faPlusCircle, faS, faStar } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { jwtDecode as decodeToken, jwtDecode } from "jwt-decode";
import "./inicio.css";

interface Game {
  parent_platforms: any;
  ratings_count: ReactNode;
  id: number;
  name: string;
  background_image: string;
  rating: number;
}

export default function Inicio() {
  const [newTopGames, setNewTopGames] = useState<Game[]>([]);
  const [newestGames, setNewestGames] = useState<Game[]>([]);
  
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [userRating, setUserRating] = useState(0);

  const sliderRef = useRef<HTMLInputElement>(null);
  const sliderValueRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState(""); 

  const [wishlist, setWishlist] = useState<number[]>([]);


  // Fetch juegos desde API RAWG
  const fetchGames = async (
    ordering: string,
    setter: (games: Game[]) => void,
    extraParams: string = ""
  ) => {
    const res = await fetch(
      `https://api.rawg.io/api/games?key=${import.meta.env.VITE_RAWG_KEY}&page_size=15&ordering=${ordering}${extraParams}`
    );
    const data = await res.json();
    const games = data.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      background_image: item.background_image,
      rating: item.rating,
      released: item.released,
      parent_platforms: item.parent_platforms,
      ratings_count: item.ratings_count
    }));
    setter(games);
  };

  useEffect(() => {
    fetchGames("-released,-rating", setNewTopGames);
    const today = new Date().toISOString().split("T")[0];
    fetchGames("-released", setNewestGames, `&dates=2000-01-01,${today}`);
    updateSliderColor(userRating);

    // Función para sincronizar la lista desde la DB
    const syncWishlist = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const decoded: any = jwtDecode(token);
        // Petición GET a tu nueva ruta del backend
        const res = await fetch(`http://localhost:3001/api/wishlist/${decoded.id}`);
        if (res.ok) {
          const ids = await res.json();
          // Guardamos los IDs: ahora 'wishlist' tiene datos persistentes
          setWishlist(ids); 
        }
      } catch (err) {
        console.error("Error al sincronizar wishlist:", err);
      }
    };

    // Ejecutamos las cargas iniciales
    fetchGames("-released,-rating", setNewTopGames);
    syncWishlist();
  }, []);

  // Abrir popup de rating
  const openRatingPopup = (game: Game) => {
    setSelectedGame(game);
    setUserRating(0);
    setPopupOpen(true);
  };

  // Actualizar posición del valor del slider
  const updateSliderValuePosition = () => {
    if (!sliderRef.current || !sliderValueRef.current) return;

    const slider = sliderRef.current;
    const valueDiv = sliderValueRef.current;

    const min = Number(slider.min);
    const max = Number(slider.max);
    const value = Number(slider.value);

    const percent = (value - min) / (max - min);

    // obtener ancho total del slider
    const sliderWidth = slider.offsetWidth;

    // ancho del thumb (coincide con CSS: 20px)
    const thumbWidth = 20;

    // posición real centrada sobre el thumb
    const left = percent * (sliderWidth - thumbWidth);

    // asignar posición
    valueDiv.style.left = `${left}px`;
  };

  //thumb cambiando de color depende de rating
  const updateSliderColor = (value: number) => {
    const percent = value / 100;
    let color;

    if (percent < 0.5) {
      // rojo → amarillo
      const t = percent / 0.5;
      color = `rgb(
        ${Math.round(244 + t * (245 - 244))},
        ${Math.round(67 + t * (182 - 67))},
        ${Math.round(54 + t * (9 - 54))}
      )`;
    } else {
      //amarillo → verde
      const t = (percent - 0.5) / 0.5;
      color = `rgb(
        ${Math.round(245 + t * (76 - 245))},
        ${Math.round(182 + t * (175 - 182))},
        ${Math.round(9 + t * (80 - 9))}
      )`;
    }

    sliderRef.current?.style.setProperty("--thumb-color", color);
  };

  // Enviar rating al backend
  const submitRating = async () => {
    if (!selectedGame) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    // Decodificamos el token para sacar el user_id
    const decoded: any = jwtDecode(token);
    const userIdFromToken = decoded.id; 
    console.log("User ID from token:", userIdFromToken);

    try {
      // Usamos el alias que creamos
      const decoded: any = decodeToken(token); 
      const userIdFromToken = decoded.id; 

      const res = await fetch("http://localhost:3001/api/game-ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userIdFromToken,
          game_api_id: selectedGame.id,
          rating: userRating,
          comment: comment || null,
        }),
      });

      const data = await res.json();
      console.log("Respuesta backend:", data);

      if (res.ok) {
        setPopupOpen(false);
        setComment("");
        alert("¡Rating enviado!");
      } else {
        alert("❌ Error backend: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al enviar el rating");
    }
  };

  // Función para manejar la Wishlist (Añadir/Quitar)
  const toggleWishlist = async (gameId: number) => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Debes iniciar sesión para gestionar tu lista de deseados");
      return;
    }

    try {
      //Decodificar el ID del usuario desde el token
      const decoded: any = jwtDecode(token);
      const userIdFromToken = decoded.id

      //Determinar si el juego ya está en la lista (basado en el estado local)
      const isInWishlist = wishlist.includes(gameId);

      //Realizar la petición al backend
      const res = await fetch("http://localhost:3001/api/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userIdFromToken,
          game_api_id: gameId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        //Actualizar el estado 'wishlist' localmente para cambiar el icono
        if (isInWishlist) {
          //Si estaba, lo filtramos para quitarlo
          setWishlist((prev) => prev.filter((id: number) => id !== gameId));
          console.log("Eliminado:", data.message);
        } else {
          // Si no estaba, lo añadimos al array
          setWishlist((prev) => [...prev, gameId]);
          console.log("Añadido:", data.message);
        }
      } else {
        //Manejar errores del backend (como el 409 de duplicado)
        alert("❌ Error: " + data.error);
      }
    } catch (err) {
      console.error("Error en toggleWishlist:", err);
      alert("Hubo un fallo al conectar con el servidor");
    }
  };

  return (
    <div className="inicio-container">
      {/* Mitad izquierda: carruseles */}
      <div className="inicio-left">
        <h2>🏆 Mejores rankeados</h2>
        <Carousel games={newTopGames} onRate={openRatingPopup} wishlist={wishlist} onWishlist={toggleWishlist} />

        <h2>🆕 Nuevos</h2>
        <Carousel games={newestGames} onRate={openRatingPopup} wishlist={wishlist} onWishlist={toggleWishlist} />
      </div>

      {/* Mitad derecha: contenido principal */}
      <div className="inicio-right">
        <p>aqui irá el contenido de tus seguidos</p>
      </div>

     {popupOpen && selectedGame && (
      <div
        className="popup-overlay"
        onClick={() => setPopupOpen(false)} // 🔹 clic fuera cierra
      >
        <div
          className="popup"
          onClick={(e) => e.stopPropagation()} // 🔹 evita cerrar al clicar dentro
        >
          <button
            className="popup-close"
            onClick={() => setPopupOpen(false)}
            aria-label="Cerrar"
          >
            ✕
          </button>
          <h3>Rankear {selectedGame.name}</h3>
          <div className="rating-slider">
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={100}
              value={userRating}
              onChange={(e) => {
                const val = Number(e.target.value);
                setUserRating(val);
                updateSliderValuePosition();
                updateSliderColor(val);
              }}
            />
            <div className="slider-value" ref={sliderValueRef}>
              {userRating}
            </div>
          </div>
          <div className="comment">
           <textarea
              className="comment-input"
              placeholder="Comentario (opcional)"
              rows={3}
              value={comment} 
              onChange={(e) => setComment(e.target.value)} 
            />
          </div>
          <div className="popup-buttons">
            <button onClick={submitRating}>Enviar</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// Componente Carrusel
function Carousel({ 
  games, 
  onRate, 
  wishlist, 
  onWishlist 
}: { 
  games: Game[], 
  onRate: (game: Game) => void,
  wishlist: number[],           // Array de IDs de juegos en deseados
  onWishlist: (id: number) => void // Función toggleWishlist
}) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    carouselRef.current?.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="carousel-container">
      {/* Botón izquierdo */}
      <button className="carousel-btn left" onClick={scrollLeft}>
        <FontAwesomeIcon className="IconoScroll" icon={faChevronLeft} />
      </button>

      {/* Carrusel */}
      <div className="carousel" ref={carouselRef}>
        {games.map((game) => (
          <Link to={`/juego/${game.id}`} key={game.id} className="game-card">
            <div className="game-image-container">
              <img
                src={game.background_image}
                alt={game.name}
                className="game-image"
              />
              <div className="game-overlay">
                <span className="game-engagement">🎯 +{game.ratings_count}</span>
              </div>
            </div>

            <div className="game-info">
              {/* fila con plataformas y rating */}
              <div className="game-meta">
                <div className="game-platforms">
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
                <span
                  className={`game-rating-number ${
                    Math.round(game.rating * 20) < 50
                      ? "rating-red"
                      : Math.round(game.rating * 20) < 70
                      ? "rating-yellow"
                      : "rating-green"
                  }`}
                >
                  {Math.round(game.rating * 20)}
                </span>
              </div>

              <p className="game-title">{game.name}</p>

              <div className="BotonesInt">
                <button className="addButton" onClick={(e) => {
                  e.preventDefault();
                  onRate(game);
                }}>
                <FontAwesomeIcon icon={faStar} />
                </button>

                <button 
                  className={`addButton ${wishlist.includes(game.id) ? "active-wishlist" : ""}`} 
                  onClick={(e) => {
                    e.preventDefault(); 
                    onWishlist(game.id); 
                  }}
                >
                  <FontAwesomeIcon icon={wishlist.includes(game.id) ? faMinus : faPlus} />
                </button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Botón derecho */}
      <button className="carousel-btn right" onClick={scrollRight}>
        <FontAwesomeIcon className="IconoScroll" icon={faChevronRight} />
      </button>
    </div>
  );
}


function setWishlist(arg0: (prev: any) => any) {
  throw new Error("Function not implemented.");
}

