import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Juego.css";

export default function Juego() {
  const { id } = useParams();
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const res = await fetch(
          `https://api.rawg.io/api/games/${id}?key=${import.meta.env.VITE_RAWG_KEY}`
        );
        const data = await res.json();
        setGame(data);
      } catch (error) {
        console.error("Error cargando juego:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  if (loading) return <div className="game-loading">Cargando juego...</div>;
  if (!game) return <div className="game-error">No se encontró el juego.</div>;

  return (
    <div className="game-page">
      {/* HEADER */}
      <div className="game-header">
        <img
          src={game.background_image}
          alt={game.name}
          className="game-cover"
        />

        <div className="game-info">
          <h1>{game.name}</h1>

          <p className="game-tagline">
            {game.released} · {game.genres?.map((g: any) => g.name).join(", ")}
          </p>

          <p className="game-rating">
            ⭐ {Math.round(game.rating * 20)} ({game.ratings_count} votos)
          </p>

          <p className="game-description">{game.description_raw}</p>

          <p>
            <strong>Desarrollador:</strong>{" "}
            {game.developers?.[0]?.name || "Desconocido"}
          </p>

          <p>
            <strong>Plataformas:</strong>{" "}
            {game.platforms
              ?.map((p: any) => p.platform.name)
              .join(", ")}
          </p>
        </div>
      </div>

      {/* TRAILER */}
      {game.clip && (
        <div className="game-trailer">
          <h2>Trailer</h2>
          <video controls src={game.clip.clip} />
        </div>
      )}

      {/* GALERÍA */}
      <div className="game-gallery">
        <h2>Capturas</h2>
        <div className="screenshots">
          {game.short_screenshots?.map((s: any) => (
            <img key={s.id} src={s.image} alt="screenshot" />
          ))}
        </div>
      </div>
    </div>
  );
}
