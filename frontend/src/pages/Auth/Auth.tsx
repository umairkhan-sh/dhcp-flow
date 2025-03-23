// react imports
import { useState } from "react";
// external libraries imports
import { useNavigate } from "react-router";
import axios from "axios";
import { Toaster, toast } from "sonner";
// components imports
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// store imports
import { useAuthStore } from "../../Store/AuthStore";

// Auth component
const Auth = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const setIsAuthenticated = useAuthStore((state) => state.setIsAuthenticated);

  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await axios.post("http://localhost:8080/signin", {
        username,
        password,
      });
      toast.success("login successfull");
      setIsAuthenticated(true);
      navigate("/dashboard");
    } catch (error: any) {
      console.error(error.response);
      toast.error(error.response.data);
    }
  };

  return (
    <>
      <Toaster richColors position="top-right" expand={true} />
      <div className="flex bg-gradient-to-l from-sky-500 to-sky-900 p-10 w-screen h-screen">
        <div className="flex flex-col justify-between w-1/2">
          <h1 className="font-extrabold text-2xl text-white">DHCP Flow</h1>
          <p className="w-5/6 font-medium text-6xl text-white">
            Seamless IP Management for
            <p className="inline mx-2 underline text">Cloud Native</p>
            DHCP.
          </p>
        </div>
        <div className="flex flex-col justify-center items-center gap-4 bg-white rounded-lg w-1/2">
          <h2 className="font-bold text-3xl text-gray-700">Welcome Back 👋</h2>
          <p className="text-gray-500">Sign in to your DHCP Flow account.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignIn();
            }}
            className="flex flex-col space-y-4 w-1/2"
          >
            <Input
              placeholder="Username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="Password"
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button className="w-full" variant="default" type="submit">
              Sign In
            </Button>
          </form>
          <p className="text-gray-500">
            Unable to sign in? Please contact the administrator for assistance.
          </p>
        </div>
      </div>
    </>
  );
};

export default Auth;
