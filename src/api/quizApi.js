import axios from "axios";

export const api = axios.create({
  // This tells React to look at your .env file for the URL
  baseURL: process.env.REACT_APP_API_URL,
});

// import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://localhost:5000/api",
// });
