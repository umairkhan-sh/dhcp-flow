// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import axios from "axios";
// import { useState } from "react";
// import { useNavigate } from "react-router";

// const Auth = () => {
//   // sign in form state
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");

//   // navigate hook
//   const navigate = useNavigate();

//   // handle sign in
//   const handleSignIn = async () => {
//     try {
//       const response = await axios.post("http://localhost:8080/auth/signin", {
//         username,
//         password,
//       });
//       console.log(response.data);
//       setError("");
//       navigate("/dashboard");
//     } catch (error: any) {
//       console.error(error.response);
//       setError(error.response.data);
//     }
//   };
//   return (
//     <div className="flex bg-gradient-to-b from-sky-600 to-sky-50 w-screen h-screen">
//       <div className="flex flex-col justify-between p-10 w-1/2 h-screen">
//         <div className="flex items-center">
//           <p className="font-extrabold text-lg text-white">DHCP Flow</p>
//         </div>
//         <div>
//           <p className="w-2/3 font-bold text-7xl text-black italic">
//             Seamless IP Management for Dynamic Kubernetes Networks.
//           </p>
//         </div>
//       </div>
//       <div className="flex flex-col justify-center items-center bg-white p-10 w-1/2 h-screen">
//         <div className="flex flex-col space-y-4 w-1/2">
//           <p className="font-bold text-2xl">Sign In To Your Account.</p>
//           <form
//             onSubmit={(e) => {
//               e.preventDefault();
//               handleSignIn();
//             }}
//             className="flex flex-col space-y-4"
//           >
//             <Input
//               placeholder="Username"
//               required={true}
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//             />
//             <Input
//               placeholder="Password"
//               required={true}
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//             />
//             {error && <p className="text-red-500">{error}</p>}
//             <Button variant="default" type="submit">
//               Sign In
//             </Button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Auth;
