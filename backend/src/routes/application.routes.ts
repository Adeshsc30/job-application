import { Router } from "express";
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/application.controller";

const router = Router();

router.route("/").get(getAllApplications).post(createApplication);
router
  .route("/:id")
  .get(getApplicationById)
  .patch(updateApplication)
  .delete(deleteApplication);

export default router;