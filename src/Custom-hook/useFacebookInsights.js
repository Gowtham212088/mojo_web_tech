import { useState, useEffect } from "react";
import axios from "axios";

const useFacebookInsights = (pageId, accessToken, metric, since, until) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!pageId || !accessToken || !metric) return;

    const fetchInsights = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v22.0/${pageId}/insights`,
          {
            params: {
              access_token: accessToken,
              since: since || "",
              until: until || "",
              metric,
            },
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setData(response.data);
      } catch (error) {
        setError(error.response?.data || error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [pageId, accessToken, metric, since, until]);

  return { data, loading, error };
};

export default useFacebookInsights;
