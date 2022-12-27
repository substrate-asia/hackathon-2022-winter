import dotenv from 'dotenv';
dotenv.config();
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import api from './routes/api';
import graphql from './graphql';
import rateLimit from './helpers/rateLimit';

const app = express();
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.set('trust proxy', 1);
app.use(rateLimit);

app.use('/api', api);
app.use('/graphql', graphql);

app.get('/*', (req, res) => res.redirect('/api'));

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => console.log(`Started on: http://127.0.0.1:${PORT}`));

