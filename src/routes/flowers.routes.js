import { Router } from "express"
import { getFlowers } from "../controllers/flowers.controller.js";

const router = Router();

router.get('/flowers', getFlowers);


export default router;