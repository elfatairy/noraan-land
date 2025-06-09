import express, {
  NextFunction,
  Request,
  Response,
} from "express";
import bodyParser from "body-parser";
import cors from "cors";
import path from "path";
import apiRouter from "./routes/index.route";
import router from "./routes/nonApi.route";
import { HTTPErrorLogger, HTTPLogger } from "./utils/logging.util";
import { rateLimiter } from "./middlewares/ratelimiter";
import cookieParser from "cookie-parser";
import { logRequest } from "./middlewares/logging.middleware";
import { swaggerDocs } from "./utils/documentation.util";
import fileUpload from "express-fileupload";
import fs from "fs/promises";

const app = express();
const port = parseInt(process.env.PORT || "3000");
app.set("trust proxy", 1);

// CORS configuration
app.use(
  cors({
    origin: "*",
    credentials: false,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());
app.disable("x-powered-by");
app.use(fileUpload());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(HTTPErrorLogger);
app.use(HTTPLogger);
app.use(cookieParser());
app.use(rateLimiter);
app.get("/videos/:videoId", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const videoId = req.params.videoId;

    if (!videoId || videoId.includes("..") || videoId.includes("/")) {
      res.status(400).send("Invalid video ID.");
      return;
    }

    const directoryPath = path.join(__dirname, "../uploads", "videos", videoId);

    let dirents;
    try {
      dirents = await fs.readdir(directoryPath, { withFileTypes: true });
    } catch (err: any) {
      if (err.code === "ENOENT") {
        console.error(`Directory not found: ${directoryPath}`);
        res.status(404).send("Video content not found.");
        return;
      }
      throw err;
    }

    const firstFileDirent = dirents.find((dirent: any) => dirent.isFile());

    if (!firstFileDirent) {
      console.warn(`No files found in directory: ${directoryPath}`);
      res.status(404).send("No video file found.");
      return;
    }

    const filePath = path.join(directoryPath, firstFileDirent.name);

    res.sendFile(filePath, (err: any) => {
      if (err) {
        console.error(`Error sending file ${filePath}:`, err);
        if (!res.headersSent) {
          res.status(500).send("Error serving video file.");
        }
      } else {
        console.log(`Sent file: ${filePath}`);
      }
    });
  } catch (error) {
    console.error("Error processing video request:", error);
    if (!res.headersSent) {
      res.status(500).send("Internal server error.");
    }
    next(error);
  }
});

app.use("/api", logRequest, apiRouter);
app.use("/", logRequest, router);
swaggerDocs(app, port);

app.get("/", (req, res) => {
  res.json({ message: "ok" });
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
