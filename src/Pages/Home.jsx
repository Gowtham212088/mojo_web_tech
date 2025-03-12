import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useFacebookInsights from "../Custom-hook/useFacebookInsights";
import useFindByPeriod from "../Functions/FilterByPeriod";
import useGetPagesOrPosts from "../Custom-hook/useGetPagesOrPosts";

function Home() {
  const sortButton = [
    { name: "Today", value: "day" },
    { name: "Week", value: "week" },
    { name: "Month", value: "days_28" },
  ];

  // State variables
  const [profile, setProfile] = useState(null);
  const [sortBy, setSortBy] = useState("day");
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("");
  const [fanCount, setFanCount] = useState(null);
  const [postDetails, setPostDetails] = useState([]);
  const [selectedPageDetails, setSelectedPageDetails] = useState(null);
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  // Get user profile from local storage on mount
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth"));
    if (authData) {
      setProfile(authData);
      fetchPages(authData.accessToken);
    } else {
      navigate("/");
    }
  }, [navigate]);

  // Update selected page details when page selection changes
  useEffect(() => {
    if (selectedPage) {
      const page = pages.find((p) => p.id === selectedPage);
      setSelectedPageDetails(page || null);
    }
  }, [selectedPage, pages]);

  // Fetch page data when a page is selected
  useEffect(() => {
    if (selectedPage && selectedPageDetails?.access_token) {
      fetchFanCount(selectedPage, selectedPageDetails.access_token);
    }
  }, [selectedPage, selectedPageDetails]);

  // Fetch pages associated with user
  const fetchPages = async (token) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token&access_token=${token}`
      );
      setPages(response.data.data);
    } catch (error) {
      console.error("Error fetching pages:", error);
    }
  };

  // Fetch fan count for selected page
  const fetchFanCount = async (pageId, token) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${pageId}?fields=fan_count&access_token=${token}`
      );
      setFanCount(response.data.fan_count ?? "N/A");
    } catch (error) {
      console.error("Error fetching fan count:", error);
    }
  };

  // Get page impressions using custom hook
  const { data: pageImpressions } = useFacebookInsights(
    selectedPageDetails?.id,
    selectedPageDetails?.access_token,
    "page_impressions",
    "",
    ""
  );

  // Get page reactions using custom hook
  const { data: pagePostReactions } = useFacebookInsights(
    selectedPageDetails?.id,
    selectedPageDetails?.access_token,
    "page_actions_post_reactions_total",
    "",
    ""
  );

  // Get posts data using custom hook
  const { data: postData } = useGetPagesOrPosts(
    selectedPageDetails?.id && selectedPageDetails?.access_token
      ? `https://graph.facebook.com/v22.0/${selectedPage}/posts?fields=id,message,created_time&access_token=${selectedPageDetails.access_token}`
      : null
  );

  // Fetch post details when post data changes
  useEffect(() => {
    const getPostDetails = async () => {
      if (!postData?.data || !selectedPageDetails?.access_token) return;

      try {
        const postRequests = postData.data.map((post) =>
          axios.get(
            `https://graph.facebook.com/v22.0/${post.id}?since=2025-01-10&until=2025-03-10&fields=comments.summary(true),shares,insights.metric(post_clicks)&access_token=${selectedPageDetails.access_token}`
          )
        );

        const responses = await Promise.all(postRequests);
        const postDetailsData = responses.map((res) => res.data);
        setPostDetails(postDetailsData);
      } catch (error) {
        console.error("Error fetching post details:", error);
      }
    };

    getPostDetails();
  }, [postData, selectedPageDetails]);

  // Process data for display
  const pagePostReactionData = { ...pagePostReactions }.data;
  const pagePostReactionDataSorted = useFindByPeriod(
    pagePostReactionData,
    sortBy
  );

  const {
    like = 0,
    love = 0,
    wow = 0,
    haha = 0,
    sad = 0,
    angry = 0,
    care = 0,
  } = pagePostReactionDataSorted?.values?.[1]?.value || {};

  const totalReactions = like + love + wow + haha + sad + angry + care;

  // Process page impressions data
  const pageImpressionsData = { ...pageImpressions }.data;
  const pageImpressionsSorted = useFindByPeriod(pageImpressionsData, sortBy);

  // Calculate total engagement
  const totalEngagement = postDetails.reduce((total, post) => {
    const comments = post.comments?.summary?.total_count || 0;
    const shares = post.shares?.count || 0;
    const clicks =
      post.insights?.data?.find((insight) => insight.name === "post_clicks")
        ?.values?.[0]?.value || 0;

    return total + comments + shares + clicks + totalReactions;
  }, 0);

  const handleLogout = () => {
    localStorage.removeItem("auth");
    setProfile(null);
    navigate("/");
  };

  if (!profile) {
    return <p className="text-center text-gray-600">Redirecting to login...</p>;
  }

  return (
    <div className="flex h-screen text-amber-400 bg-gray-100">
      {/* Sidebar: Displays profile picture, name, and logout button */}
      <aside className="w-1/4 p-4 bg-white shadow-md">
        <img
          src={profile?.picture}
          alt="Profile"
          className="w-20 h-20 rounded-full mx-auto"
        />
        <h2 className="text-center text-xl font-bold mt-2">{profile.name}</h2>
        <button
          className="mt-4 w-full py-2 bg-red-500 text-dark hover:bg-black rounded-md"
          onClick={handleLogout}
          type="button"
        >
          Logout
        </button>
      </aside>

      {/* Main Content: Displays page selection dropdown and insights data */}
      <main className="w-1/2 p-6 overflow-auto">
        <h1 className="text-2xl text-indigo-950 font-bold mb-4">
          Facebook Insights
        </h1>

        {/* Dropdown to select a Facebook page */}
        <label htmlFor="page-select" className="sr-only">
          Select a Facebook page
        </label>
        <select
          id="page-select"
          className="w-full p-2 border rounded-md"
          onChange={(e) => setSelectedPage(e.target.value)}
          value={selectedPage}
        >
          <option value="">Select a Page</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>

        {/* Insights Display */}
        {selectedPage && (
          <div className="mt-6 space-y-4">
            <section className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="font-bold">Total Followers / Fans</h2>
              <p className="text-lg">{fanCount ?? "N/A"}</p>
            </section>

            <section
              onClick={() => setShow(!show)}
              className="p-4 bg-white shadow-md cursor-pointer rounded-lg"
            >
              <h2 className="font-bold">Total Engagement</h2>
              <p className="text-lg">{totalEngagement || 0}</p>

              {postData?.data && postData.data.length > 0 && (
                <>
                  {show && (
                    <div className="mt-3">
                      {postData.data.map((post, index) => (
                        <article key={post.id} className="mb-4 pb-2">
                          <h4 className="font-medium">
                            Post Details :{" "}
                            {post?.message || `Post ${index + 1}`}
                          </h4>
                          {postDetails[index] && (
                            <ul className="mt-1 pl-4">
                              <li>
                                Comments:{" "}
                                {postDetails[index].comments?.summary
                                  ?.total_count || 0}
                              </li>
                              <li>
                                Shares: {postDetails[index].shares?.count || 0}
                              </li>
                              <li>
                                Post Clicks:{" "}
                                {postDetails[index].insights?.data?.find(
                                  (insight) => insight.name === "post_clicks"
                                )?.values[0]?.value || 0}
                              </li>
                              <li>
                                Total Reactions:{" "}
                                {like + love + haha + wow + sad + angry + care}
                              </li>
                            </ul>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </>
              )}
            </section>

            <section className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="font-bold">Total Impressions</h2>
              <p className="text-lg">
                {pageImpressionsSorted?.values?.[1]?.value ?? "N/A"}
              </p>
            </section>

            <section className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="font-bold">Total Reactions</h2>
              <p className="text-lg mb-1">{totalReactions || 0}</p>
              <div className="text-lg px-5">
                <div>👍 {like || 0}</div>
                <div>💖 {love || 0}</div>
                <div>😲 {wow || 0}</div>
                <div>😆 {haha || 0}</div>
                <div>😢 {sad || 0}</div>
                <div>😡 {angry || 0}</div>
                <div>🤗 {care || 0}</div>
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Right Sidebar: Filter buttons */}
      <aside className="w-1/4 p-4 bg-white shadow-md">
        <h2 className="font-bold mb-3">Filter by Period</h2>
        <div className="flex flex-col gap-3">
          {sortButton.map((button) => (
            <button
              type="button"
              key={button.value}
              onClick={() => setSortBy(button.value)}
              className={`w-full px-4 py-3 rounded-md transition-colors ${
                sortBy === button.value && "text-amber-400 bg-white"
              }`}
            >
              {button.name}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}

export default Home;
