import express, { Request, Response } from 'express';
import { Server, createServer } from 'http';
import config from '../config';

const app = express();
const { port } = config;

export default function createExpressServer() {
    const serverListener: Server = createServer(app);

    app.all("*", (req: Request, res: Response) => {
        // console.log({ url: req.url, host: req.hostname });
        req.get
        res.send("Hello World");
    });

    serverListener.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });

    return serverListener;
}