import express from 'express';
import http from 'http';
import cors from 'cors';

import { fromSocketServer } from './rxjs-socket.io.js';

import chalk from 'chalk';
import { info, warn } from 'console';

const { yellow, blueBright, red, blue } = chalk;

const app = express();

app.use(cors());

const server = http.createServer(app);

const port = 4000;
const url = 'http://localhost';

server.listen(port, () => {
    info(blueBright(`listening on ${url}:${port} \u{1F440}`));
});

const { message$$, pushEvent } = fromSocketServer(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

message$$('client-chat').subscribe((msg) => info(yellow(JSON.stringify(msg))));
message$$('client-chat').subscribe((msg) => pushEvent('server-chat').next(msg));
