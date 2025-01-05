import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
const app = express();
const port = parseInt(process.env.PORT || '3001')
import router from './routes/index.route';
import { HTTPErrorLogger, HTTPLogger } from './utils/logging.util';
import { rateLimiter } from './middlewares/ratelimiter';
import cookieParser from 'cookie-parser';
import { logRequest } from './middlewares/logging.middleware';
import { swaggerDocs } from './utils/documentation.util';
import fileUpload from 'express-fileupload';

// CORS configuration
app.use(cors({
  origin: '*', 
  credentials: false,
  methods: ['GET', 'POST','PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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
app.use("/api", logRequest, router);
swaggerDocs(app, port);

app.get('/', (req, res) => {
  res.json({'message': 'ok'});
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
