import { Router } from "express";
import {
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
} from "../controllers/application.controller";

const router = Router();

// Each line here maps:
// HTTP METHOD + URL path → which controller function handles it

// GET  /api/applications         → list all (supports ?status= and ?search= filters)
// POST /api/applications         → create a new application
router.route("/").get(getAllApplications).post(createApplication);

// GET    /api/applications/:id   → get one application by ID
// PATCH  /api/applications/:id   → partially update an application
// DELETE /api/applications/:id   → delete an application
router
  .route("/:id")
  .get(getApplicationById)
  .patch(updateApplication)
  .delete(deleteApplication);

export default router;