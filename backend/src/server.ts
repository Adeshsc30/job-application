import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import applicationRoutes from "./routes/application.routes";

// Load environment variables from .env file
// This is how we access DATABASE_URL, PORT etc.
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// MIDDLEWARE
// cors() allows our React frontend (on port 3000) to talk to this backend (port 5001)
// Without this, the browser would block the request
app.use(cors());

// express.json() lets Express read JSON from request body
// Without this, req.body would be undefined
app.use(express.json());

// ROUTES
// All application-related routes are handled by applicationRoutes
// So GET /api/applications, POST /api/applications etc. all go there
app.use("/api/applications", applicationRoutes);

// Health check route — useful to confirm the server is running
app.get("/", (req, res) => {
  res.json({ message: "Job Tracker API is running!" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});