ISSUE ==> unable to get insights

Invalid Metrics
Ensure all metrics you are requesting are valid and supported by the Facebook Graph API for the selected page. The following metrics are likely incorrect or deprecated:

"page_reactions_total" → This metric does not exist; instead, use "page_actions_post_reactions_total" or "page_total_actions".
"page_content_clicks" → This metric might not be valid; consider "page_consumptions".



Fix: Update the metrics array:

const metrics = [
  "page_fan_adds",
  "page_engaged_users",
  "page_impressions",
  "page_views_total",
  "page_post_engagements",
  "page_follower_count",
  "page_actions_post_reactions_total", // Updated metric
  "page_consumptions" // Updated metric
];



// const getPageImpression = (access_token)=>{

//       // Define the date range for insights
//       const since = "2025-01-01";
//       const until = "2025-03-10";

  
//   axios.request({
//     method: 'get',
//     maxBodyLength: Infinity,
//     url: `https://graph.facebook.com/v22.0/${selectedPageDetails?.id}/insights?access_token=${access_token}&since=${since}&until=${until}&metric=page_impressions`,
//     headers: { 
//       'Content-Type': 'application/json'
//     },
//   })
//   .then((response) => {
//     console.log(JSON.stringify(response.data));
//   })
//   .catch((error) => {
//     console.log(error);
//   });
// }



<!-- * WHILE USING SINCE & UNTIL -->

# day --> add all values
# week --> choose the greatest value
# 28_days --> choose the greatest value

<!-- * IF SINCE AND UNTIL HAVE NOT USED  -->


 <!-- *TASK TODO -->

# GET THE POST LIST API
# GET THE POSTS COMMENT SHARE AND IMPRESSIONS USING THAT POST ID
# THE GET THE PAGE VIEWS









 <li>
                          Total Reactions: {like+love+haha+wow+sad+angry+care}
                          </li>