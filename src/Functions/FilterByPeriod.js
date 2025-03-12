import { useState, useEffect } from "react";

const useFindByPeriod = (data, period) => {
  const [filteredData, setFilteredData] = useState(null);

  useEffect(() => {
    if (data && period) {
      const filtered = data.find((e) => e.period === period);
      setFilteredData(filtered);
    }
  }, [data, period]);

  return filteredData;
};

export default useFindByPeriod;
