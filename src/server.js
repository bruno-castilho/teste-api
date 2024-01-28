import express from "express";
import routes from "./routes.js";
import db from "./db.js";
import cors from 'cors'
import cookieParser from 'cookie-parser';

const corsOptions = {
    origin: process.env.CLIENT_URL, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTION'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  };


  
const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.use(routes);

db.sync(() => console.log(`Banco de dados conectado: ${process.env.DB_NAME}`));


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Servidor iniciado na porta ${PORT}`));