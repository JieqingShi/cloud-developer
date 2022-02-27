import {Request, Response } from 'express';
import { NextFunction } from 'connect';
// import * as jwt from 'jsonwebtoken';
import jwt from 'jsonwebtoken'
import {config} from '../config/config';

// have a user type which is basically a Map/Record/(dictionary) consisting of username and password
// Create a /login post endpoint which takes in username and password in the requests body
// Use that to generate a JWT if the user posts his information and return the token

// Then use that token to verify the authentication through requireAuth


export function generateJWT(user: {}): string {
    return jwt.sign(JSON.stringify(user), config.jwt.secret);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    // console.warn("auth.router not yet implemented, you'll cover this in lesson 5")
    // return next();
    if (!req.headers || !req.headers.authorization){
        return res.status(401).send({ message: 'No authorization headers.' });
    }
    
    // Bearer token has format: 'Bearer blablasomekindoftokenblabla' -> so split on whitespace
    const token_bearer = req.headers.authorization.split(' ');
    if(token_bearer.length != 2){
        return res.status(401).send({ message: 'Malformed token.' });
    }
    
    const token = token_bearer[1];

    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
      }
      return next();
    });
}