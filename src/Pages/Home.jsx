import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useFacebookInsights from "../Custom-hook/useFacebookInsights";
import useFindByPeriod from "../Functions/FilterByPeriod";

function Home() {
  const sortButton = [
    { name: "Today", value: "day" },
    { name: "Week", value: "week" },
    { name: "Month", value: "days_28" },
  ];
  // State variables to store user profile, pages, selected page, and insights data
  const [profile, setProfile] = useState(null);
  const [sortBy, setSortBy] = useState("day");
  console.log(sortBy, "sortBy");
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [insights, setInsights] = useState(null);
  const [fanCount, setFanCount] = useState(null);
  const [totalImpressions, setTotalImpressions] = useState(null);
  const [totalReactions, setTotalReactions] = useState(null);
  const [views, setViews] = useState(null);
  const [reach, setReach] = useState(null);
  const [contentInteractions, setContentInteractions] = useState(null);
  const [follows, setFollows] = useState(null);
  const [accessToken, setAccessToken] = useState("");

  const [selectedPageDetails, setSelectedPageDetails] = useState(null);

  useEffect(() => {
    if (selectedPage) {
      const page = pages.find((p) => p.id === selectedPage);
      setSelectedPageDetails(page || null);
    }
  }, [selectedPage, pages]);

  console.log(selectedPageDetails?.access_token, "Selected Page Details");

  console.log(accessToken, "accessToken");
  console.log(selectedPage, "accessToken");
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve authentication data from local storage
    const authData = JSON.parse(localStorage.getItem("auth"));
    if (authData) {
      setProfile(authData);
      setAccessToken(authData.accessToken);
      fetchPages(authData.accessToken); // Fetch Facebook pages associated with the user
    }
  }, []);

  console.log(profile, "profile");
  const fetchPages = async (token) => {
    try {
      console.log("Page fetched");

      // Fetch user's Facebook pages using Graph API
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token&access_token=${token}`
      );
      console.log(response, "Page Response");
      setPages(response.data.data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  console.log(fanCount, "fanCount");
  // Fetch insights only when a page is selected
  useEffect(() => {
    if (selectedPage) {
      fetchFanCount(selectedPage);
      fetchInsights(selectedPage);
    }
  }, [selectedPage]);

  const fetchFanCount = async (pageId) => {
    try {
      // Fetch the fan count (followers) of the selected page
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${pageId}?fields=fan_count&access_token=${accessToken}`
      );
      console.log(response, "fanCount");
      setFanCount(response.data.fan_count ?? "N/A");
    } catch (error) {
      console.error("Error fetching fan count:", error);
    }
  };

  // ✅ Call the custom hook at the top level
  const {
    data: pageImpressions,
    loading,
    error,
  } = useFacebookInsights(
    selectedPageDetails?.id,
    selectedPageDetails?.access_token,
    "page_impressions",
    "",
    ""
  );



  // ✅ Call the custom hook at the top level
  const {
    data: pagePostReactions,
    loadingReaction,
    errorReaction,
  } = useFacebookInsights(
    selectedPageDetails?.id,
    selectedPageDetails?.access_token,
    "page_actions_post_reactions_total",
    "",
    ""
  );

  const pagePostReactionData = {...pagePostReactions}.data;

  const pagePostReactionDataSorted = useFindByPeriod(pagePostReactionData,sortBy)

  const { 
    like = 0, 
    love = 0, 
    wow = 0, 
    haha = 0, 
    sad = 0, 
    angry = 0, 
    care = 0 
  } = pagePostReactionDataSorted?.values?.[1]?.value || {};
  

  const check = pagePostReactionDataSorted?.values?.[1]?.value || {};

  console.log(check,"check")

console.log(pagePostReactionDataSorted,"pagePostReactionDataSorted");

  console.log(pageImpressions, "pageImpressions");
  // * COPIED DE-STUCTURED PAGE IMPRESSION DATA
  const pageImpressionsData = { ...pageImpressions }.data;
  // * SORTED IMPRESSIONS DATA
  const pageImpressionsSorted = useFindByPeriod(pageImpressionsData, sortBy);
  console.log(pageImpressionsSorted, "pageImpressionsSorted");
  console.log(pageImpressionsData, "pageImpressionsData");
  useEffect(() => {
    if (selectedPageDetails) {
      console.log("Fetching insights for:", selectedPageDetails?.id);
    }
  }, [selectedPageDetails]);

  const fetchInsights = async (pageId) => {
    // Define the date range for insights
    const since = "2025-01-01";
    const until = "2025-03-10";

    // Define the metrics to retrieve
    const metrics = [
      "page_fans",
      "page_engaged_users",
      "page_total_actions",
      "page_impressions_unique",
      "page_impressions",
      "page_actions_post_reactions_total",
      "page_views_total", // Views
      "page_post_reach", // Reach
      "page_content_activity", // Content interactions
      "page_follows", // Follows
      "post_shares",
      "post_reactions_by_type_total",
      "post_comments",
      "post_clicks",
    ];

    try {
      // Fetch Facebook page insights using Graph API
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${pageId}/insights?metric=${metrics.join(
          ","
        )}&since=${since}&until=${until}&access_token=${accessToken}`
      );

      // Parse and store insights data
      response.data.data.forEach((item) => {
        if (item.name === "page_fans")
          setFanCount(item.values[0]?.value ?? "N/A");
        if (item.name === "page_engaged_users")
          setInsights(item.values[0]?.value ?? "N/A");
        if (item.name === "page_impressions")
          setTotalImpressions(item.values[0]?.value ?? "N/A");
        if (item.name === "page_total_actions")
          setTotalReactions(item.values[0]?.value ?? "N/A");
        if (item.name === "page_views_total")
          setViews(item.values[0]?.value ?? "N/A");
        if (item.name === "page_post_reach")
          setReach(item.values[0]?.value ?? "N/A");
        if (item.name === "page_content_activity")
          setContentInteractions(item.values[0]?.value ?? "N/A");
        if (item.name === "page_follows")
          setFollows(item.values[0]?.value ?? "N/A");
      });
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  };

  const handleLogout = () => {
    // Clear authentication data and redirect to login page
    localStorage.removeItem("auth");
    setProfile(null);
    navigate("/");
  };

  // Redirect user to login page if not authenticated
  if (!profile) {
    return <p className="text-center text-gray-600">Redirecting to login...</p>;
  }

  return (
    <div className="flex h-screen text-amber-400 bg-gray-100">
      {/* Sidebar: Displays profile picture, name, and logout button */}
      <div className="w-1/4 p-4 bg-white shadow-md">
        <img
          src={profile?.picture}
          alt="Profile"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <h2 className="text-center text-xl font-bold mt-2">{profile.name}</h2>
        <button
          className="mt-4 w-full py-2 bg-red-500 text-dark hover:bg-black rounded-md"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Main Content: Displays page selection dropdown and insights data */}
      <div className="w-1/2 p-6 overflow-auto">
        <h2 className="text-2xl text-indigo-950 font-bold mb-4">
          Facebook Insights
        </h2>

        {/* Dropdown to select a Facebook page */}
        <select
          className="w-full p-2 border rounded-md"
          onChange={(e) => setSelectedPage(e.target.value)}
        >
          <option value="">Select a Page</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>

        {/* Insights Display */}
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-bold">Total Followers / Fans</h3>
            <p className="text-lg">{fanCount ?? "N/A"}</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-bold">Total Engagement</h3>
            <p className="text-lg">{insights ?? "N/A"}</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-bold">Total Impressions</h3>
            <p className="text-lg">
              {pageImpressionsSorted?.values[1]?.value ?? "N/A"}
            </p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-bold">Total Reactions</h3>
            <p className="text-lg mb-1">{like+love+wow+haha+sad+angry+care ?? "N/A"}</p>
            <p className="text-lg px-5">
              <span> 👍 {like || 0} </span> <br/>
              <span> 💖 {love || 0} </span> <br/>
              <span> 😲 {wow || 0} </span> <br/>
              <span> 😆 {haha || 0} </span> <br/>
              <span> 😡 {angry || 0} </span> <br/>
              <span> 🤗 {care || 0} </span> 
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Displays recent activity */}
      <div className="w-1/4 p-4 bg-white shadow-md flex flex-col gap-3">
        {sortButton.map((e, i) => (
          <>
            <button
              onClick={() => setSortBy(e.value)}
              key={i}
              className="max-w-[65mm] w-[100%] px-6 py-6"
            >
              {e?.name}
            </button>
          </>
        ))}
      </div>
    </div>
  );
}

export default Home;
