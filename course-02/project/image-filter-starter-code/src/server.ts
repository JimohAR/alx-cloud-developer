import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { filterImageFromURL, deleteLocalFiles } from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage/",
    async (req: Request, res: Response) => {
      const image_url: string = req.query.image_url as string;

      if (image_url.match(/^https?:\/\/.+\.(jpg|jpeg|gif|png|tiff|bmp)$/gmi) === null) {
        return res.status(415)
          .send('bad image url\nmust be http[s]\nacceptable image formats: jpg , jpeg , gif , png , tiff , and bmp');
      }

      try {
        var img_path: string = await filterImageFromURL(image_url) as string;
      } catch (error) {
        return res.status(422).send('unable to process image url');
      }

      res.status(200).sendFile(img_path);
      res.on('finish', () => deleteLocalFiles([img_path]));

    });

  //! END @TODO1

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req: Request, res: Response) => {
    res.send("try GET /filteredimage?image_url={{}}")
  });


  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();