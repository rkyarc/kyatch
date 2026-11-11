export async function searchPosterByTitle(query) {
  if (!query || query.trim().length < 2) return [];

  try {
    const [tvmazeRes, jikanRes] = await Promise.allSettled([
      fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`).then((r) => r.json()),
      fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`).then((r) => r.json()),
    ]);

    const results = [];

    if (jikanRes.status === "fulfilled" && jikanRes.value?.data) {
      jikanRes.value.data.forEach((item) => {
        results.push({
          id: `mal-${item.mal_id}`,
          title: item.title,
          type: "Anime",
          year: item.year || (item.aired?.from ? item.aired.from.slice(0, 4) : ""),
          totalEpisodes: item.episodes || 0,
          posterUrl: item.images?.webp?.large_image_url || item.images?.jpg?.large_image_url || "",
        });
      });
    }

    if (tvmazeRes.status === "fulfilled" && Array.isArray(tvmazeRes.value)) {
      tvmazeRes.value.slice(0, 5).forEach((entry) => {
        const show = entry.show;
        if (show) {
          results.push({
            id: `tvm-${show.id}`,
            title: show.name,
            type: "Series",
            year: show.premiered ? show.premiered.slice(0, 4) : "",
            totalEpisodes: 0,
            posterUrl: show.image?.original || show.image?.medium || "",
          });
        }
      });
    }

    return results.filter((item) => item.posterUrl !== "");
  } catch (error) {
    console.error("Gagal mencari poster:", error);
    return [];
  }
}