import { Router } from "express"
import { getFlowers, getFlowerById, postFlower } from "../controllers/flowers.controller.js";

const router = Router();

router.get('/flowers', getFlowers);
router.get('/flowers/:id', getFlowerById);
router.post('/flowers', postFlower);


export default router;