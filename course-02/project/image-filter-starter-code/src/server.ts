import express, {Request, Response} from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import globby = require("globby");
import {generateJWT, requireAuth} from './auth/authorization'
import { nextTick } from 'process';

const isImageURL = require('image-url-validator').default;


(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // Added authorization
  app.get("/filteredimage/", requireAuth, async (req: Request, res: Response) => {
    // As per instructions the image url should be a query parameter
    // let {image_url} = req.query;

    // However this will lead to an error during 'npm run build' because await filterImageFromURL(image_url) will error out with the message
    // Argument of type 'string | string[] | ParsedQs | ParsedQs[]' is not assignable to parameter of type 'string'.
    // Found this fix in the in the udacity forum: https://knowledge.udacity.com/questions/346736
    
    let image_url = req.query.image_url as string;


    // If no image_url query parameter is provided, return error message
    if (!image_url) {
      return res.status(400).send({message: "Bad request => 'image_url' has to be provided in the query"});
    }
    

    // First we check if the image_url is even valid, using the image-url-validator package (https://www.npmjs.com/package/image-url-validator)
    // If not we return an error message to the user
    const validImageUrl = await isImageURL(image_url);
    if (!validImageUrl) {
      return res.status(404).send({message: "Not found! Image URL is probably invalid."});
    }

    // Filter the image using the provided function
    const filteredImage = await filterImageFromURL(image_url);

    if (filteredImage) {
      // Send filtered image path as response
      const filteredImagePaths = await globby("./**/util/tmp/*.jpg");

      // Assuming there will only be one image file present in the tmp folder (as we will always delete the folder content after sending the response)
      // we send the first result, then delete the local file
      res.sendFile(filteredImagePaths[0], {root: "."}, () => {deleteLocalFiles(filteredImagePaths)});
      
    }
    

    // Original idea: delete image after sending the response.
    // However turns out that it does not work if the file deletion is done after sending the image as the image will be deleted immediately and will not be shown in the browser
    // The deletion has to be a part of the sendFile function, it seems
    // await deleteLocalFiles(filteredImagePaths);

    
  })

  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );


  // Adding a very primitive authorization endpoint
  app.post("/login", async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    
    if (!password) {
      return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    if (!username) {
      return res.status(400).send({auth: false, message: 'Username is required'})
    }

    let user = {"username": username, "password": password}
    const jwt = generateJWT(user);

    res.status(200).send({ auth: true, token: jwt, user: username, message: "Make a note of the jwt token for authentication"});

  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();