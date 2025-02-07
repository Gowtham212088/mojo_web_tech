import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated, redirect to Home if logged in
    const authData = JSON.parse(localStorage.getItem("auth"));
    if (authData) {
      navigate("/home");
    }

    // Load Facebook SDK
    window.fbAsyncInit = function () {
      window.FB.init({
        appId: "1862710634471993",
        cookie: true,
        xfbml: true,
        version: "v18.0", // Use the latest version
      });
    };

    // Load SDK script dynamically
    (function (d, s, id) {
      let js,
        fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s);
      js.id = id;
      js.src = "https://connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    })(document, "script", "facebook-jssdk");
  }, [navigate]);

  const handleLogin = () => {
    window.FB.login(
      (response) => {
        if (response.authResponse) {
          window.FB.api("/me", { fields: "id,name,email,picture" }, (userInfo) => {
            const profileData = {
              id: userInfo.id,
              name: userInfo.name,
              email: userInfo.email,
              picture: userInfo.picture.data.url,
              accessToken: response.authResponse.accessToken,
            };

            localStorage.setItem("auth", JSON.stringify(profileData));
            navigate("/home");
          });
        } else {
          setError("Login failed. Please try again.");
        }
      },
      { scope: "public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata" }
    );
  };

  return (
    <div>
      <h2>Facebook Login</h2>
      
      <button onClick={handleLogin} style={{ padding: "10px 20px", background: "#1877f2", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
        Login with Facebook
      </button>

      {/* Display error message if login fails */}
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
