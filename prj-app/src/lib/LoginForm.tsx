import { createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";
import axios from "axios";
import logo from "../logos/junimo-tippy.png";

const Login = () => {
  const [username, setUsername] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [error, setError] = createSignal("");
  const navigate = useNavigate();

  const handleLogin = async (e: Event) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:3001/login", {
        username: username(),
        password: password(),
      });

      if (response.data.success) {
        localStorage.setItem("isLoggedIn", "true");
        navigate("/Overview");
      } else {
        setError("Invalid credentials");
      }
    } catch (err) {
      setError("An error occurred during login");
    }
  };

  return (
    <div class="fixed top-0 w-full h-full flex flex-col items-center justify-center">
      <form
        class="p-6 w-[20rem] flex flex-col items-center justify-center border border-border-gray rounded-md"
        onSubmit={handleLogin}
      >
        <div
          id='profile'
          class='mb-6 text-white text-md font-semibold flex items-center gap-1.5 cursor-default'
        >
          <img
            id='avatarButton'
            class='w-5 h-5'
            draggable='false'
            src={logo}
          ></img>
          tippy
        </div>
        <span class="mb-6 font-medium text-sm text-table-header-gray text-center">Welcome back! Enter your credentials below to get started.</span>
        <div class="w-full mb-4 flex flex-col">
          <label class="mb-1.5 text-sm font-semibold">Username</label>
          <input
            type="text"
            // placeholder="Username"
            class="px-3 py-1.5 border border-border-gray rounded-md bg-black text-white text-sm placeholder-content-gray"
            value={username()}
            onInput={(e) => setUsername(e.target.value)}
          />
        </div>
        <div class="w-full flex flex-col">
          <label class="mb-1.5 text-sm font-semibold">Password</label>
          <input
            type="password"
            // placeholder="Password"
            class="px-3 py-1.5 border border-border-gray rounded-md bg-black text-white text-sm placeholder-content-gray"
            value={password()}
            onInput={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          class="mt-4 py-1.5 px-6 w-full text-center text-black font-medium rounded-md bg-white hover:bg-white/90 text-sm"
        >
          Login
        </button>
        {error() && <div>{error()}</div>}
      </form>
    </div>
  );
};

export default Login;
