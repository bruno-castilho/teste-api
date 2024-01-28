import express from "express";
import { users } from './controllers/users.js';
import { auth } from './controllers/auth.js';
import { projects } from './controllers/projects.js';

const routes = express.Router();

routes.post('/login', auth.login);
routes.get('/logged', auth.logged)
routes.post('/logout', auth.logout);
routes.get('/google/url', auth.url)
routes.get('/google/login', auth.loginByGoogle);


routes.post('/register', users.post);


routes.get('/projetos', projects.findAll);
routes.get('/projetos/usuario', projects.findByUser);
routes.post('/projetos', projects.post);
routes.put('/projetos', projects.put);
routes.delete('/projetos', projects.delete);

export { routes as default };