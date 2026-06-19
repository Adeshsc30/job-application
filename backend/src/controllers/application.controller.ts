import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const VALID_STATUSES = ["Applied", "Interviewing", "Offer", "Rejected"];
const VALID_JOB_TYPES = ["Internship", "FullTime", "PartTime"];

export const getAllApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search } = req.query;
    const where: any = {};

    if (status && VALID_STATUSES.includes(status as string)) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { company_name: { contains: search as string, mode: "insensitive" } },
        { job_title: { contains: search as string, mode: "insensitive" } },
      ];
    }

    const applications = await prisma.application.findMany({
      where,
      orderBy: { applied_date: "desc" },
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch applications" });
  }
};

export const getApplicationById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const application = await prisma.application.findUnique({ where: { id } });

    if (!application) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch application" });
  }
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { company_name, job_title, job_type, status, applied_date, notes } = req.body;

    if (!company_name || company_name.trim().length < 2) {
      res.status(400).json({ success: false, message: "Company name must be at least 2 characters" });
      return;
    }
    if (!job_title || job_title.trim().length === 0) {
      res.status(400).json({ success: false, message: "Job title is required" });
      return;
    }
    if (!applied_date) {
      res.status(400).json({ success: false, message: "Applied date is required" });
      return;
    }
    if (job_type && !VALID_JOB_TYPES.includes(job_type)) {
      res.status(400).json({ success: false, message: "Invalid job type" });
      return;
    }

    const application = await prisma.application.create({
      data: {
        company_name: company_name.trim(),
        job_title: job_title.trim(),
        job_type: job_type || "Internship",
        status: status || "Applied",
        applied_date: new Date(applied_date),
        notes: notes?.trim() || null,
      },
    });

    res.status(201).json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create application" });
  }
};

export const updateApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { company_name, job_title, job_type, status, applied_date, notes } = req.body;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }

    if (company_name !== undefined && company_name.trim().length < 2) {
      res.status(400).json({ success: false, message: "Company name must be at least 2 characters" });
      return;
    }
    if (job_type !== undefined && !VALID_JOB_TYPES.includes(job_type)) {
      res.status(400).json({ success: false, message: "Invalid job type" });
      return;
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      res.status(400).json({ success: false, message: "Invalid status" });
      return;
    }

    const updateData: any = {};
    if (company_name !== undefined) updateData.company_name = company_name.trim();
    if (job_title !== undefined) updateData.job_title = job_title.trim();
    if (job_type !== undefined) updateData.job_type = job_type;
    if (status !== undefined) updateData.status = status;
    if (applied_date !== undefined) updateData.applied_date = new Date(applied_date);
    if (notes !== undefined) updateData.notes = notes?.trim() || null;

    const updated = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update application" });
  }
};

export const deleteApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.application.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: "Application not found" });
      return;
    }

    await prisma.application.delete({ where: { id } });
    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete application" });
  }
};