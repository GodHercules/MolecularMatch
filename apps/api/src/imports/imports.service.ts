import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import { ImportJob, ImportJobDocument } from "../schemas/import-job.schema";
import {
  StartChebiImportDto,
  StartHmdbImportDto,
  StartPubchemImportDto
} from "./dto/start-import.dto";

@Injectable()
export class ImportsService {
  constructor(
    @InjectModel(ImportJob.name)
    private readonly jobModel: Model<ImportJobDocument>
  ) {}

  async startPubchem(dto: StartPubchemImportDto) {
    const job = await this.jobModel.create({
      source: "PubChem",
      status: "pending",
      totalRequested: dto.limit,
      totalRead: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      checkpoint: { cursor: dto.startCid, resume: dto.resume },
      errors: [],
      startedAt: new Date()
    });
    this.spawnImporter("import:pubchem", [
      `--start-cid=${dto.startCid}`,
      `--limit=${dto.limit}`,
      `--resume=${dto.resume}`,
      `--job-id=${String(job._id)}`
    ]);
    return job;
  }

  async startChebi(dto: StartChebiImportDto) {
    const job = await this.jobModel.create({
      source: "ChEBI",
      status: "pending",
      totalRequested: dto.limit,
      totalRead: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      checkpoint: { limit: dto.limit },
      errors: [],
      startedAt: new Date()
    });
    this.spawnImporter("import:chebi", [`--limit=${dto.limit}`, `--job-id=${String(job._id)}`]);
    return job;
  }

  async startHmdb(dto: StartHmdbImportDto) {
    const job = await this.jobModel.create({
      source: "HMDB",
      status: "pending",
      totalRequested: 0,
      totalRead: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      checkpoint: { file: dto.file },
      errors: [],
      startedAt: new Date()
    });
    this.spawnImporter("import:hmdb", [`--file=${dto.file}`, `--job-id=${String(job._id)}`]);
    return job;
  }

  async listJobs() {
    return this.jobModel.find({}).sort({ createdAt: -1 }).limit(200).lean().exec();
  }

  async getJob(id: string) {
    const job = await this.jobModel.findById(id).lean().exec();
    if (!job) throw new NotFoundException("Job nao encontrado");
    return job;
  }

  async updateJob(
    id: string,
    patch: Partial<ImportJob>
  ) {
    const doc = await this.jobModel.findByIdAndUpdate(id, patch, { new: true }).lean().exec();
    if (!doc) throw new NotFoundException("Job nao encontrado");
    return doc;
  }

  private spawnImporter(script: string, args: string[]) {
    const candidates = [
      process.cwd(),
      path.resolve(process.cwd(), ".."),
      path.resolve(process.cwd(), "..", "..")
    ];
    const cwd =
      candidates.find((dir) => fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) ?? process.cwd();
    const child = spawn("pnpm", ["--filter", "@molecular-match/importers", script, ...args], {
      cwd,
      detached: true,
      stdio: "ignore",
      shell: true
    });
    child.unref();
  }
}

