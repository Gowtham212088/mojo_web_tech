import { useEffect, useState } from "react";
import { LoginSocialFacebook } from "reactjs-social-login";
import { FacebookLoginButton } from "react-social-login-buttons";
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
  }, [navigate]);

  return (
    <div>
      <h2>Facebook Login</h2>
      
      {/* Facebook login button */}
      <LoginSocialFacebook
        appId="1862710634471993"
        scope="public_profile,email,pages_show_list,pages_read_engagement,pages_manage_metadata"
        onResolve={(response) => {
          // Store authentication data and navigate to home
          const profileData = response.data;
          localStorage.setItem("auth", JSON.stringify(profileData));
          navigate('/home');
        }}
        onReject={(error) => {
          console.error("Auth Error:", error);
          setError("Login failed. Please try again.");
        }}
      >
        <FacebookLoginButton />
      </LoginSocialFacebook>

      {/* Display error message if login fails */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
