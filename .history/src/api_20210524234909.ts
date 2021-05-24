import express, { Request, Response,NextFunction  } from "express";
import { createStripeCheckoutSession } from './checkout';

//app
export const app = express();

// Allows cross origin requests
import cors from "cors";
app.use(cors({ origin: true }));

app.use(express.json());



  
/**
 * Checkouts
 */
app.post(
  '/checkouts/',
  runAsync(async ({ body }: Request, res: Response) => {
    res.send(await createStripeCheckoutSession(body.line_items));
  })
);

/**
 * Catch async errors when awaiting promises 
 */
function runAsync(callback: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    callback(req, res, next).catch(next);
  };


///testroute
app.post("/test", (req: Request, res: Response) => {
  const amount = req.body.amount;
  res.status(200).send({ with_tax: amount * 7 });
});
