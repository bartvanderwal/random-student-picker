import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { authorized } from "../middlewares/isAuthorized.ts";

import { signup, signin } from "../controllers/users.ts";
import { postTask, getTasks, getTask, updateTask, deleteTask} from "../controllers/tasks.ts";
import { postVraag, getVragen} from "../controllers/vragen.ts";
import { postAntwoord, getAntwoordenVoorVraag, deleteAntwoorden} from "../controllers/antwoorden.ts";


const router = new Router();

// User endpoints.
router.post("/api/signup", signup)
      .post("/api/signin", signin);

// Task endpoints.
router.post("/api/tasks", authorized, postTask)
      .get("/api/tasks", authorized, getTasks)
      .get("/api/tasks/:taskId", authorized, getTask)
      .patch("/api/tasks/:taskId", authorized, updateTask)
      .delete("/api/tasks/:taskId", authorized, deleteTask);

// Vraag endpoints.
router.post("/api/vragen", postVraag)
      .get("/api/vragen", getVragen)

// Vraag endpoints.
router.get("/api/antwoorden", getAntwoordenVoorVraag)
      .delete("/api/antwoorden", deleteAntwoorden)
      .post("/api/antwoorden", postAntwoord)

console.log('URL routes loaded.')

export default router;