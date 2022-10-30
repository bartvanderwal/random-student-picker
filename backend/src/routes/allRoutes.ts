import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { authorized } from "../middlewares/Authorized.ts";
import { admin } from "../middlewares/Admin.ts"

import { signup, signin } from "../controllers/users.ts";
import { postTask, getTasks, getTask, updateTask, deleteTask} from "../controllers/tasks.ts";
import { postVraag, getVragen, deleteVraag } from "../controllers/vragen.ts";
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
      .delete("/api/vragen/:vraagId", deleteVraag)

// Vraag endpoints.
router.get("/api/antwoorden/:vraagId", getAntwoordenVoorVraag)
      .delete("/api/antwoorden", admin, deleteAntwoorden)
      .post("/api/antwoorden", postAntwoord)

export default router;