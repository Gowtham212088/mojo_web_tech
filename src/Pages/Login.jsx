import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1862710634471993",
        cookie: true,
        xfbml: true,
        version: "v22.0",
      });
    };

    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      js.onload = () => window.fbAsyncInit();
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, []);

  const handleLogin = () => {
    window.FB.getLoginStatus((response) => {
      if (response.status === "connected") {
        console.log("Already logged in!");
        fetchUserData(response.authResponse);
      } else {
        window.FB.login(
          (res) => {
            if (res.authResponse) {
              fetchUserData(res.authResponse);
            } else {
              setError("Login failed. Please try again.");
            }
          },
          {
            scope:
              "public_profile,email,pages_show_list,read_insights,pages_read_user_content,pages_read_engagement,page_events,business_management,pages_manage_metadata,ads_read,pages_manage_engagement,pages_manage_metadata,pages_manage_posts,pages_read_engagement,pages_read_engagement,pages_show_list,publish_video",
          }
        );
      }
    });
  };

  //! unable to login with this following scopes.
  //? page_engaged_users
  // ? page_impressions
  // ? page_actions_post_reactions_total


  const fetchUserData = (authResponse) => {
    window.FB.api("/me", { fields: "id,name,email,picture" }, (userInfo) => {
      const profileData = {
        id: userInfo.id,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture.data.url,
        accessToken: authResponse.accessToken,
      };

      localStorage.setItem("auth", JSON.stringify(profileData));
      navigate("/home");
    });
  };

  return (
    <div>
      <h2>Facebook Login</h2>
      <button
        onClick={handleLogin}
        style={{
          padding: "10px 20px",
          background: "#1877f2",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Login with Facebook
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;

// import { useEffect, useState } from "react";
// import { LoginSocialFacebook } from "reactjs-social-login";
// import { FacebookLoginButton } from "react-social-login-buttons";
// import { useNavigate } from "react-router-dom";

// function Login() {
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Check if user is already authenticated, redirect to Home if logged in
//     const authData = JSON.parse(localStorage.getItem("auth"));
//     if (authData) {
//       navigate("/home");
//     }
//   }, [navigate]);

//   return (
//     <div>
//       <h2>Facebook Login</h2>

//       {/* Facebook login button */}
//       <LoginSocialFacebook
//         appId="1862710634471993"
//         scope="public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata"
//         onResolve={(response) => {
//           // Store authentication data and navigate to home
//           const profileData = response.data;
//           localStorage.setItem("auth", JSON.stringify(profileData));
//           navigate('/home');
//         }}
//         onReject={(error) => {
//           console.error("Auth Error:", error);
//           setError("Login failed. Please try again.");
//         }}
//       >
//         <FacebookLoginButton />
//       </LoginSocialFacebook>

//       {/* Display error message if login fails */}
//       {error && <p style={{ color: "red" }}>{error}</p>}
//     </div>
//   );
// }

// export default Login;
