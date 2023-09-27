import express, { Request, Response } from 'express';
import { Server, createServer } from 'http';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import config from '../config';
import ApiRouter from '../api';
import GoogleAuth from '../api/user/google-auth';
import errorHandler from '../middlewares/error-handler';

const app = express();
const { port, clientURI } = config;

export default function createExpressServer() {
    const serverListener: Server = createServer(app);

    app.use(cors({
        origin: clientURI,
        credentials: true,
    }));
    
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use('/', GoogleAuth);
    app.use('/api', ApiRouter);

    app.all("*", (req: Request, res: Response) => {
        // console.log({ url: req.url, host: req.hostname });
        req.get
        res.send("Hello World");
    });

    app.use(errorHandler);

    serverListener.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    return serverListener;
}