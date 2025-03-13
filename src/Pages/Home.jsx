import { useEffect, useState } from "react";         // Import React hooks for component lifecycle and state management
import axios from "axios";                           // Import axios for making HTTP requests
import { useNavigate } from "react-router-dom";      // Import for programmatic navigation
import useFacebookInsights from "../Custom-hook/useFacebookInsights";   // Custom hook for fetching Facebook insights
import useFindByPeriod from "../Functions/FilterByPeriod";              // Custom hook for filtering data by period
import useGetPagesOrPosts from "../Custom-hook/useGetPagesOrPosts";     // Custom hook for fetching pages or posts

function Home() {
  // Array of filter buttons for different time periods
  const sortButton = [
    { name: "Today", value: "day" },                 // Daily view option
    { name: "Week", value: "week" },                 // Weekly view option
    { name: "Month", value: "days_28" },             // Monthly (28 days) view option
  ];

  // State declarations
  const [profile, setProfile] = useState(null);       // Stores user profile data
  const [sortBy, setSortBy] = useState("day");        // Tracks selected time period filter (defaults to "day")
  const [pages, setPages] = useState([]);             // Stores list of Facebook pages user has access to
  const [selectedPage, setSelectedPage] = useState(""); // Tracks currently selected page ID
  const [fanCount, setFanCount] = useState(null);     // Stores follower/fan count for selected page
  const [postDetails, setPostDetails] = useState([]); // Stores detailed data about posts
  const [selectedPageDetails, setSelectedPageDetails] = useState(null); // Stores full details of selected page
  const [show, setShow] = useState(false);            // Toggle for expanding/collapsing post details section

  const navigate = useNavigate();                     // Hook for navigation between routes

  // Effect hook that runs on component mount to check authentication
  useEffect(() => {
    const authData = JSON.parse(localStorage.getItem("auth")); // Get auth data from local storage
    if (authData) {
      setProfile(authData);                           // Set profile state if auth data exists
      fetchPages(authData.accessToken);               // Fetch user's Facebook pages using the access token
    } else {
      navigate("/");                                  // Redirect to login page if not authenticated
    }
  }, [navigate]);                                     // Dependency array includes navigate to avoid ESLint warnings

  // Effect to update selected page details when page selection changes
  useEffect(() => {
    if (selectedPage) {
      const page = pages.find((p) => p.id === selectedPage); // Find the selected page in pages array
      setSelectedPageDetails(page || null);           // Update selected page details state
    }
  }, [selectedPage, pages]);                          // Run when selectedPage or pages state changes

  // Effect to fetch fan count when selected page changes
  useEffect(() => {
    if (selectedPage && selectedPageDetails?.access_token) {
      fetchFanCount(selectedPage, selectedPageDetails.access_token); // Get fan count for the selected page
    }
  }, [selectedPage, selectedPageDetails]);            // Run when selected page or its details change

  // Function to fetch pages associated with the user
  const fetchPages = async (token) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token&access_token=${token}`
      );                                              // Call Facebook Graph API to get user's pages
      setPages(response.data.data);                   // Update pages state with the response data
    } catch (error) {
      console.error("Error fetching pages:", error);  // Log any errors that occur
    }
  };

  // Function to fetch fan count for a specific page
  const fetchFanCount = async (pageId, token) => {
    try {
      const response = await axios.get(
        `https://graph.facebook.com/v22.0/${pageId}?fields=fan_count&access_token=${token}`
      );                                              // Call Facebook Graph API to get fan count
      setFanCount(response.data.fan_count ?? "N/A");  // Update fan count state, defaulting to "N/A" if null
    } catch (error) {
      console.error("Error fetching fan count:", error); // Log any errors
    }
  };

  // Use custom hook to get page impressions data
  const { data: pageImpressions } = useFacebookInsights(
    selectedPageDetails?.id,                          // Page ID parameter
    selectedPageDetails?.access_token,                // Page access token parameter
    "page_impressions",                               // Metric to fetch (page impressions)
    "",                                               // No start date specified (using default)
    ""                                                // No end date specified (using default)
  );

  // Use custom hook to get page post reactions data
  const { data: pagePostReactions } = useFacebookInsights(
    selectedPageDetails?.id,                          // Page ID parameter
    selectedPageDetails?.access_token,                // Page access token parameter
    "page_actions_post_reactions_total",              // Metric to fetch (total post reactions)
    "",                                               // No start date specified
    ""                                                // No end date specified
  );

  // Use custom hook to get posts data for the selected page
  const { data: postData } = useGetPagesOrPosts(
    selectedPageDetails?.id && selectedPageDetails?.access_token
      ? `https://graph.facebook.com/v22.0/${selectedPage}/posts?fields=id,message,created_time&access_token=${selectedPageDetails.access_token}`
      : null                                          // URL is null if no page is selected or no access token is available
  );

  // Effect to fetch details for each post when post data changes
  useEffect(() => {
    const getPostDetails = async () => {
      if (!postData?.data || !selectedPageDetails?.access_token) return; // Exit if no post data or access token

      try {
        // Create an array of promises for fetching details of each post
        const postRequests = postData.data.map((post) =>
          axios.get(
            `https://graph.facebook.com/v22.0/${post.id}?since=2025-01-10&until=2025-03-10&fields=comments.summary(true),shares,insights.metric(post_clicks)&access_token=${selectedPageDetails.access_token}`
          )
        );

        const responses = await Promise.all(postRequests); // Execute all requests in parallel
        const postDetailsData = responses.map((res) => res.data); // Extract data from responses
        setPostDetails(postDetailsData);              // Update post details state
      } catch (error) {
        console.error("Error fetching post details:", error); // Log any errors
      }
    };

    getPostDetails();                                 // Call the async function
  }, [postData, selectedPageDetails]);                // Run when post data or selected page details change

  // Process reaction data for display
  const pagePostReactionData = { ...pagePostReactions }.data; // Extract data from pagePostReactions
  const pagePostReactionDataSorted = useFindByPeriod(
    pagePostReactionData,                             // Input data
    sortBy                                            // Period to filter by (day, week, or days_28)
  );

  // Destructure reaction counts with default values of 0
  const {
    like = 0,
    love = 0,
    wow = 0,
    haha = 0,
    sad = 0,
    angry = 0,
    care = 0,
  } = pagePostReactionDataSorted?.values?.[1]?.value || {}; // Get values or empty object if undefined

  const totalReactions = like + love + wow + haha + sad + angry + care; // Calculate total reactions

  // Process page impressions data for display
  const pageImpressionsData = { ...pageImpressions }.data; // Extract data from pageImpressions
  const pageImpressionsSorted = useFindByPeriod(
    pageImpressionsData,                              // Input data
    sortBy                                            // Period to filter by
  );

  // Calculate total engagement across all posts
  const totalEngagement = postDetails.reduce((total, post) => {
    const comments = post.comments?.summary?.total_count || 0; // Comment count or 0 if undefined
    const shares = post.shares?.count || 0;                    // Share count or 0 if undefined
    const clicks =
      post.insights?.data?.find((insight) => insight.name === "post_clicks")
        ?.values?.[0]?.value || 0;                    // Click count or 0 if undefined

    return total + comments + shares + clicks + totalReactions; // Sum all engagement metrics
  }, 0);

  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem("auth");                  // Remove auth data from local storage
    setProfile(null);                                 // Clear profile state
    navigate("/");                                    // Redirect to login page
  };

  // Show loading message if profile is not loaded
  if (!profile) {
    return <p className="text-center text-gray-600">Redirecting to login...</p>;
  }

  // Main component return - UI rendering
  return (
    <div className="flex h-screen text-amber-400 bg-gray-100">
      {/* Left Sidebar: Profile information */}
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

      {/* Main Content: Insights dashboard */}
      <main className="w-1/2 p-6 overflow-auto">
        <h1 className="text-2xl text-indigo-950 font-bold mb-4">
          Facebook Insights
        </h1>

        {/* Page selection dropdown */}
        <label htmlFor="page-select" className="sr-only">
          Select a Facebook page
        </label>
        <select
          id="page-select"
          className="w-full p-2 border rounded-md"
          onChange={(e) => setSelectedPage(e.target.value)} // Update selected page when changed
          value={selectedPage}
        >
          <option value="">Select a Page</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>

        {/* Insights Display - Only shown when a page is selected */}
        {selectedPage && (
          <div className="mt-6 space-y-4">
            {/* Fan count section */}
            <section className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="font-bold">Total Followers / Fans</h2>
              <p className="text-lg">{fanCount ?? "N/A"}</p>
            </section>

            {/* Engagement section - clickable to expand */}
            <section
              onClick={() => setShow(!show)}          // Toggle show state on click
              className="p-4 bg-white shadow-md cursor-pointer rounded-lg"
            >
              <h2 className="font-bold">Total Engagement</h2>
              <p className="text-lg">{totalEngagement || 0}</p>

              {/* Expandable post details section */}
              {postData?.data && postData.data.length > 0 && (
                <>
                  {show && (                           // Only show if expanded
                    <div className="mt-3">
                      {postData.data.map((post, index) => (
                        <article key={post.id} className="mb-4 pb-2">
                          <h4 className="font-medium">
                            Post Details :{" "}
                            {post?.message || `Post ${index + 1}`} {/* Show message or default text */}
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

            {/* Impressions section */}
            <section className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="font-bold">Total Impressions</h2>
              <p className="text-lg">
                {pageImpressionsSorted?.values?.[1]?.value ?? "N/A"} {/* Show impressions or N/A */}
              </p>
            </section>

            {/* Reactions section with emoji breakdown */}
            <section className="p-4 bg-white shadow-md rounded-lg">
              <h2 className="font-bold">Total Reactions</h2>
              <p className="text-lg mb-1">{totalReactions || 0}</p>
              <div className="text-lg px-5">
                <div>👍 {like || 0}</div>              {/* Like reactions count */}
                <div>💖 {love || 0}</div>             {/* Love reactions count */}
                <div>😲 {wow || 0}</div>              {/* Wow reactions count */}
                <div>😆 {haha || 0}</div>             {/* Haha reactions count */}
                <div>😢 {sad || 0}</div>              {/* Sad reactions count */}
                <div>😡 {angry || 0}</div>            {/* Angry reactions count */}
                <div>🤗 {care || 0}</div>             {/* Care reactions count */}
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
              onClick={() => setSortBy(button.value)}  // Update sortBy state when clicked
              className={`w-full px-4 py-3 rounded-md transition-colors ${
                sortBy === button.value && "text-amber-400 bg-white" // Highlight selected button
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