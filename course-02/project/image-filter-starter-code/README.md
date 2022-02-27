# Udagram Image Filtering Microservice

Udagram is a simple cloud application developed alongside the Udacity Cloud Engineering Nanodegree. It allows users to register and log into a web client, post photos to the feed, and process photos using an image filtering microservice.

The project is split into three parts:
1. [The Simple Frontend](https://github.com/udacity/cloud-developer/tree/master/course-02/exercises/udacity-c2-frontend)
A basic Ionic client web application which consumes the RestAPI Backend. [Covered in the course]
2. [The RestAPI Backend](https://github.com/udacity/cloud-developer/tree/master/course-02/exercises/udacity-c2-restapi), a Node-Express server which can be deployed to a cloud service. [Covered in the course]
3. [The Image Filtering Microservice](https://github.com/udacity/cloud-developer/tree/master/course-02/project/image-filter-starter-code), the final project for the course. It is a Node-Express application which runs a simple script to process images. [Your assignment]

## Tasks

### Setup Node Environment

You'll need to create a new node server. Open a new terminal within the project directory and run:

1. Initialize a new project: `npm i`
2. run the development server with `npm run dev`

### Create a new endpoint in the server.ts file

The starter code has a task for you to complete an endpoint in `./src/server.ts` which uses query parameter to download an image from a public URL, filter the image, and return the result.

We've included a few helper functions to handle some of these concepts and we're importing it for you at the top of the `./src/server.ts`  file.

```typescript
import {filterImageFromURL, deleteLocalFiles} from './util/util';
```

### Deploying your system

Follow the process described in the course to `eb init` a new application and `eb create` a new environment to deploy your image-filter service! Don't forget you can use `eb deploy` to push changes.

## Stand Out (Optional)

### Refactor the course RESTapi

If you're feeling up to it, refactor the course RESTapi to make a request to your newly provisioned image server.

### Authentication

Prevent requests without valid authentication headers.
> !!NOTE if you choose to submit this, make sure to add the token to the postman collection and export the postman collection file to your submission so we can review!

### Custom Domain Name

Add your own domain name and have it point to the running services (try adding a subdomain name to point to the processing server)
> !NOTE: Domain names are not included in AWS’ free tier and will incur a cost.

### Implementation of image filter endpoint
The image filter endpoint code is in server.ts. \
It's a GET request with image_url as a query parameter, i.e. `/filteredimage?image_url={}`.

The query parameter had to be set explicitly to type `String`, otherwise `npm run build` would fail due to an error message. \
I.e. changing `let {image_url} = req.query;` to `let image_url = req.query.image_url as string;`
(This was not a problem during local runs).

I implemented an additional URL check using the `image-validator` package (https://www.npmjs.com/package/@types/jsonwebtoken). That is, before the image is being downloaded and filtered, we check for the validity of the url (assuming e.g. the user is providing the URL of an image that does not exist or is malformatted.) If the image URL is not successfully validated we return an 404 error message to the user. This way the user would be informed of the error. Otherwise if the image URL validation were not there, the image filter code would return an error message such as "Could not find MIME for buffer (null)", with no message being returned to the client.

If the image validation passes, then the image is filtered and saved locally to ./util/tmp. We then send the filtered image as a response with `res.sendFile`. Afterwards we delete the local file.


### Local deployment
The app is running locally on `localhost:8082` per default. 
Local testing can be done with Postman using the provided `udacity-c2-project.postman_collection.json` Postman collection.
