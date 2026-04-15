import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import userRouter from "./routes/userRoutes.js";
import jobRouter from "./routes/jobRoutes.js";
import companyRouter from "./routes/companyRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/jobs", jobRouter);
app.use("/api/v1/companies", companyRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "Server is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: err.message || "An error occurred"
    }
  });
});

const PORT = process.env.DB_PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Test with: http://localhost:${PORT}/health`);
});
