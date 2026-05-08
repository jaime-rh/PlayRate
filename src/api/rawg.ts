export const fetchGames = async (
  ordering: string,
  extraParams: string = ""
) => {
  const res = await fetch(
    `https://api.rawg.io/api/games?key=${
      import.meta.env.VITE_RAWG_KEY
    }&page_size=15&ordering=${ordering}${extraParams}`
  );

  const data = await res.json();

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    background_image: item.background_image,
    rating: item.rating,
    released: item.released,
    parent_platforms: item.parent_platforms,
    ratings_count: item.ratings_count,
  }));
};

export const searchGames = async (query: string) => {
  const res = await fetch(
    `https://api.rawg.io/api/games?key=${
      import.meta.env.VITE_RAWG_KEY
    }&search=${query}&page_size=10`
  );

  const data = await res.json();

  return data.results.map((item: any) => ({
    id: item.id,
    name: item.name,
    cover: item.short_screenshots[0].image,
    rating: item.rating,
    parent_platforms: item.parent_platforms,
  }));
};



