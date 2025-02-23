import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home() {
  // State variables to store user profile, pages, selected page, and insights data
  const [profile, setProfile] = useState(null);
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

  console.log({profile,pages,selectedPage,insights,fanCount,totalImpressions,totalReactions,views,reach,contentInteractions,follows,accessToken})

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
  console.log(selectedPage,'selectedPage');
  const fetchPages = async (token) => {
    try {
      // Fetch user's Facebook pages using Graph API
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/me/accounts?fields=489993570873674,name,email,access_token&access_token=${token}`
      );
      setPages(response.data.data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

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
      setFanCount(response.data.fan_count ?? "N/A");
    } catch (error) {
      console.error("Error fetching fan count:", error);
    }
  };

  const fetchInsights = async (pageId) => {
    // Define the date range for insights
    const since = "2024-01-01";
    const until = "2024-02-23";

    // Define the metrics to retrieve
    const metrics = [
      "page_fan_adds",
      "page_engaged_users",
      "page_impressions",
      "page_views_total",
      "page_post_engagements",
      "page_follower_count",
      "page_reactions_total",
      "page_content_clicks"
    ];
    

    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${pageId}/insights?metric=${metrics.join(
          ","
        )}&since=${since}&until=${until}&access_token=${accessToken}`
      );
  

      // Parse and store insights data
      response.data.data.forEach((item) => {
        if (item.name === "page_follower_count")
          setFanCount(item.values[0]?.value ?? "N/A");
        if (item.name === "page_engaged_users")
          setInsights(item.values[0]?.value ?? "N/A");
        if (item.name === "page_impressions")
          setTotalImpressions(item.values[0]?.value ?? "N/A");
        if (item.name === "page_reactions_total")
          setTotalReactions(item.values[0]?.value ?? "N/A");
        if (item.name === "page_views_total")
          setViews(item.values[0]?.value ?? "N/A");
        if (item.name === "page_reach")
          setReach(item.values[0]?.value ?? "N/A");
        if (item.name === "page_content_clicks")
          setContentInteractions(item.values[0]?.value ?? "N/A");
        if (item.name === "pages_manage_ads")
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
          className="mt-4 w-full py-2 bg-red-500 text-white rounded-md"
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
            <p className="text-lg">{totalImpressions ?? "N/A"}</p>
          </div>
          <div className="p-4 bg-white shadow-md rounded-lg">
            <h3 className="font-bold">Total Reactions</h3>
            <p className="text-lg">{totalReactions ?? "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Displays recent activity */}
      <div className="w-1/4 p-4 bg-white shadow-md">
        <h3 className="font-bold text-xl">Recent Activity</h3>
        <ul className="mt-4 space-y-2">
          <li className="p-2 bg-gray-200 rounded-md">
            New followers: {fanCount}
          </li>
          <li className="p-2 bg-gray-200 rounded-md">
            Recent engagements: {insights}
          </li>
        </ul>

        <div className="p-4 bg-white shadow-md rounded-lg">
  <h3 className="font-bold">Total Views</h3>
  <p className="text-lg">{views ?? "N/A"}</p>
</div>

<div className="p-4 bg-white shadow-md rounded-lg">
  <h3 className="font-bold">Total Reach</h3>
  <p className="text-lg">{reach ?? "N/A"}</p>
</div>

<div className="p-4 bg-white shadow-md rounded-lg">
  <h3 className="font-bold">Content Interactions</h3>
  <p className="text-lg">{contentInteractions ?? "N/A"}</p>
</div>

<div className="p-4 bg-white shadow-md rounded-lg">
  <h3 className="font-bold">Total Follows</h3>
  <p className="text-lg">{follows ?? "N/A"}</p>
</div>



      </div>
    </div>
  );
}

export default Home;
