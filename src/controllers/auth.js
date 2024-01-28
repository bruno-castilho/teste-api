import 'dotenv/config';
import axios from 'axios';
import queryString from 'query-string';
import jwt from 'jsonwebtoken';
import Users from "../models/users.js";



const config = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUrl: process.env.REDIRECT_URL,
    clientUrl: process.env.CLIENT_URL,
    tokenSecret: process.env.TOKEN_SECRET,
    tokenExpiration: 86400,
    postUrl: 'https://jsonplaceholder.typicode.com/posts'
  };


const authParams = queryString.stringify({
client_id: config.clientId,
redirect_uri: config.redirectUrl,
response_type: 'code',
scope: 'openid profile email',
access_type: 'offline',  
state: 'standard_oauth',
prompt: 'consent',
});

const getTokenParams = (code) => queryString.stringify({
client_id: config.clientId,
client_secret: config.clientSecret,
code,
grant_type: 'authorization_code',
redirect_uri: config.redirectUrl,
});



export const auth = {
    async login(req, res) {
        try {

            const user = await Users.findOne({ 
                attributes: ['user_id', 'first_name', 'last_name', 'avatar_url', 'country', 'password'],
                where: { email:  req.body.email} });



            if(!user) return res.status(403).send(`E-mail ou senha invalido.`)
            
            if(user.password !== req.body.password) return res.status(403).send(`E-mail ou senha invalido.`)
            

            delete user.dataValues.password;

            const token = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });

            res.cookie('token', token, { maxAge: config.tokenExpiration, httpOnly: true,  })

            res.json({ user})

        } catch(error) {
            res.status(500).send(`Erro interno do servidor.`)
        }
    },

    async logged(req, res){
        try {
            const token = req.cookies.token;

            if (!token) return res.json({ logged: false });


            const { user } = jwt.verify(token, config.tokenSecret);
            const newToken = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });


            res.cookie('token', newToken, { maxAge: config.tokenExpiration, httpOnly: true,  })

            res.json({ logged: true, user });
        } catch(error) {
            console.log(error)
            res.status(500).send(`Erro interno do servidor!`)
        }
    },

    async loginByGoogle(req, res) {
        try {
            const { code } = req.query;
            if (!code) return res. status(400).json({ message: 'Authorization code must be provided' });
            const tokenParam = getTokenParams(code);

            const { data: { id_token} } = await axios.post(`${config.tokenUrl}?${tokenParam}`);
            if (!id_token) return res.status(400).json({ message: 'Auth error' });

            
            const { email, name, picture } = jwt.decode(id_token);

            const user = await Users.findOne({ 
                attributes: ['user_id', 'first_name', 'last_name', 'avatar_url', 'country'],
                where: { email } });

            if(user) {
                const token = jwt.sign({ user }, config.tokenSecret, { expiresIn: config.tokenExpiration });

                res.cookie('token', token, { maxAge: config.tokenExpiration, httpOnly: true,  })

                res.json({haveAnAccount: true, user})
            }
            else {
                res.json({haveAnAccount: false, user: {email, name, picture}})
            } 
                
        } catch(error) {
            res.status(500).send(`Erro interno do servidor!`)
        }
    },

    async logout(req, res) {
        try {
            res.clearCookie('token').send('Logged out');
        } catch(error) {
            res.status(500).send(`Erro interno do servidor!`)
        }
    },

    async url(req, res){
        try {
            
            res.json({
                url: `${config.authUrl}?${authParams}`,
              });

        } catch(error) {
            res.status(500).send(`Erro interno do servidor!`)
        }

    },
    


}