import { useCallback, useEffect, useState } from "react";

import { programsApi } from "../lib/programsApi";
import fallbackPrograms from "../data/programs";

// Gives every program the same shape whether it came from MongoDB or the old static file.
const normalize = (p) => ({
  ...p,
  id: p._id ?? p.id,
  image: p.image?.url ? p.image : null,
  highlights: Array.isArray(p.highlights) ? p.highlights : [],
});

/*
  Loads published programs from the backend.
  If the request fails (server down), it falls back to the old static
  data/programs.js so the public page never goes blank.
*/
export default function usePrograms() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { programs: list } = await programsApi.listPublic();
      setPrograms(list.map(normalize));
      setUsingFallback(false);
    } catch (error) {
      console.warn("Programs API unavailable, using static data:", error.message);
      setPrograms(fallbackPrograms.map(normalize));
      setUsingFallback(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { programs, loading, usingFallback, reload: load };
}