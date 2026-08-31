// Seeds representative content for the Industry -> Workload -> Application ->
// Requirement -> Infrastructure graph so the site isn't empty on first run.
// Safe to re-run: it checks for existing records by slug/email before creating.
import "../../scripts/load-env.mts";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { getPayload } from "payload";
import importedConfig from "../payload.config";

const config = (importedConfig as any)?.default ?? importedConfig;

const frontendEnvPath = path.resolve(import.meta.dirname, "../../../Frontend/.env");

function frontendEnvHasServiceKey(): boolean {
  if (!fs.existsSync(frontendEnvPath)) return false;
  const match = fs.readFileSync(frontendEnvPath, "utf-8").match(/^BACKEND_SERVICE_API_KEY=(.*)$/m);
  return Boolean(match?.[1]?.trim());
}

function writeServiceKeyToFrontendEnv(apiKey: string) {
  if (!fs.existsSync(frontendEnvPath)) return;
  const contents = fs.readFileSync(frontendEnvPath, "utf-8");
  const line = `BACKEND_SERVICE_API_KEY=${apiKey}`;
  const updated = /^BACKEND_SERVICE_API_KEY=.*$/m.test(contents)
    ? contents.replace(/^BACKEND_SERVICE_API_KEY=.*$/m, line)
    : `${contents.trimEnd()}\n${line}\n`;
  fs.writeFileSync(frontendEnvPath, updated);
}

const lexical = (text: string) => ({
  root: {
    type: "root",
    format: "",
    indent: 0,
    version: 1,
    direction: "ltr" as const,
    children: [
      {
        type: "paragraph",
        format: "",
        indent: 0,
        version: 1,
        direction: "ltr" as const,
        children: [{ type: "text", format: 0, style: "", mode: "normal", detail: 0, version: 1, text }],
      },
    ],
  },
});

async function main() {
  const payload = await getPayload({ config });

  // --- Admin user ---
  const existingAdmin = await payload.find({
    collection: "users",
    where: { email: { equals: "harshit.digibuggy@gmail.com" } },
    limit: 1,
  });
  if (existingAdmin.docs.length === 0) {
    await payload.create({
      collection: "users",
      data: {
        email: "harshit.digibuggy@gmail.com",
        password: "DGB-Enterprise-2026!",
        name: "Harshit",
        role: "admin",
      },
    });
    console.log("Created admin user harshit.digibuggy@gmail.com (password: DGB-Enterprise-2026!) — change this after first login.");
  }

  // --- Service account for Frontend -> Backend writes (e.g. the contact form) ---
  // Payload hashes `apiKey` at rest and never returns the plaintext back on
  // read, so we generate it ourselves (rather than relying on Payload to
  // auto-generate one and reading it back — that returns undefined) and
  // write that same plaintext into Frontend/.env. Safe to re-run: if
  // Frontend/.env already has a key, we leave the existing one alone.
  const existingService = await payload.find({
    collection: "users",
    where: { email: { equals: "frontend-service@dgbindia.local" } },
    limit: 1,
  });
  const frontendHasKey = frontendEnvHasServiceKey();

  if (existingService.docs.length === 0) {
    const apiKey = crypto.randomBytes(32).toString("hex");
    await payload.create({
      collection: "users",
      data: {
        email: "frontend-service@dgbindia.local",
        password: crypto.randomUUID(),
        name: "Frontend service account",
        role: "service",
        enableAPIKey: true,
        apiKey,
      },
    });
    writeServiceKeyToFrontendEnv(apiKey);
    console.log("Created Frontend service account and wrote its API key to Frontend/.env (BACKEND_SERVICE_API_KEY).");
  } else if (!frontendHasKey) {
    const apiKey = crypto.randomBytes(32).toString("hex");
    await payload.update({
      collection: "users",
      id: existingService.docs[0].id,
      data: { enableAPIKey: true, apiKey },
    });
    writeServiceKeyToFrontendEnv(apiKey);
    console.log("Frontend/.env was missing BACKEND_SERVICE_API_KEY — rotated the service account's key and wrote it there.");
  }

  // --- Infrastructure ---
  const infra = await upsertInfrastructure(payload, [
    { name: "Compute", category: "compute", summary: "The processing core of every workload we design for." },
    { name: "Servers", category: "compute", parentName: "Compute", summary: "Rack and tower servers for general-purpose enterprise compute.", capabilities: ["Dual-socket high-core-count CPUs", "ECC memory up to multiple TB", "Redundant power and hot-swap storage"], businessValue: ["Consolidate workloads onto fewer, more reliable systems", "Predictable performance for production applications"] },
    { name: "GPU Servers", category: "compute", parentName: "Compute", summary: "Multi-GPU systems for rendering, simulation, training and inference.", capabilities: ["Up to 8-way NVLink GPU configurations", "High-bandwidth PCIe Gen5 topology", "Data-center-grade thermals for sustained load"], businessValue: ["Cut render and training time from days to hours", "Scale GPU capacity without re-architecting"] },
    { name: "Workstations", category: "compute", parentName: "Compute", summary: "Certified GPU workstations for artists, engineers and quants at the desk.", capabilities: ["ISV-certified GPUs for CAD/DCC applications", "Workstation-class ECC memory", "Whisper-quiet chassis for studio environments"], businessValue: ["Real-time viewport performance for complex scenes", "One machine per artist, sized to their actual workload"] },
    { name: "Storage", category: "storage", summary: "Fast, resilient storage sized to throughput, not just capacity." },
    { name: "NAS", category: "storage", parentName: "Storage", summary: "Shared network storage for collaborative pipelines and archives.", capabilities: ["Multi-10/25GbE connectivity", "Snapshot and replication", "Scalable from tens of TB to PB"], businessValue: ["One shared source of truth across an entire team", "Predictable performance under concurrent access"] },
    { name: "Networking", category: "networking", summary: "The fabric that keeps compute and storage from bottlenecking each other.", capabilities: ["10/25/100GbE switching", "Low-latency fabric for clustered compute", "Redundant, loop-free topologies"], businessValue: ["Storage and compute perform as fast as they're specced", "Headroom for the next phase of growth"] },
    { name: "Data Protection", category: "data-protection", summary: "Backup and recovery designed around your actual RPO/RTO, not a checkbox." },
    { name: "Backup", category: "data-protection", parentName: "Data Protection", summary: "Automated backup, replication and disaster recovery.", capabilities: ["Immutable, air-gapped backup targets", "Application-consistent snapshots", "Tested recovery runbooks"], businessValue: ["Recover from ransomware or hardware failure in hours, not weeks", "Meet compliance and client data-retention requirements"] },
  ]);

  // --- Applications ---
  const apps = await upsertApplications(payload, [
    { name: "Autodesk Maya", vendor: "Autodesk", category: "3d-rendering", optimisationNotes: "Viewport and simulation are CPU/GPU hybrid; scales with core count and VRAM." },
    { name: "Houdini", vendor: "SideFX", category: "simulation", optimisationNotes: "Simulation is heavily multi-threaded CPU work; large sims are memory-bound." },
    { name: "Redshift", vendor: "Maxon", category: "3d-rendering", optimisationNotes: "GPU renderer, VRAM-bound and scales near-linearly across GPUs." },
    { name: "Nuke", vendor: "Foundry", category: "compositing-vfx", optimisationNotes: "Compositing is I/O and RAM heavy at high resolutions; benefits from fast local cache storage." },
    { name: "PyTorch", vendor: "Meta", category: "ai-ml", optimisationNotes: "Training throughput scales with GPU count, VRAM and interconnect bandwidth." },
    { name: "Revit", vendor: "Autodesk", category: "cad-bim", optimisationNotes: "Large BIM models are RAM and single-thread-CPU bound." },
    { name: "DaVinci Resolve", vendor: "Blackmagic Design", category: "media-editing", optimisationNotes: "Color and playback are GPU-bound; high-res media needs fast local/shared storage." },
    { name: "QuantLib backtesting engines", vendor: "Open Source", category: "trading-quant", optimisationNotes: "CPU-bound, latency-sensitive; benefits from high clock speed and NVMe scratch storage." },
  ]);

  // --- Workloads ---
  const workloads = await upsertWorkloads(payload, [
    {
      name: "Rendering",
      description: "GPU and CPU rendering of 3D scenes for animation, VFX and archviz.",
      applications: ["Autodesk Maya", "Redshift"],
      recommendedInfrastructure: ["GPU Servers", "Workstations", "Storage"],
      requirementProfile: { gpuIntensity: "extreme", cpuIntensity: "medium", vramMinGB: 24, ramMinGB: 128, storageType: "nvme-ssd", networkMin: "25gbe", scalingPattern: "scale-out-cluster" },
    },
    {
      name: "Simulation",
      description: "Fluid, cloth and destruction simulation for VFX and engineering.",
      applications: ["Houdini"],
      recommendedInfrastructure: ["Servers", "Workstations"],
      requirementProfile: { gpuIntensity: "medium", cpuIntensity: "extreme", ramMinGB: 256, storageType: "nvme-ssd", networkMin: "10gbe", scalingPattern: "scale-up" },
    },
    {
      name: "Compositing",
      description: "Multi-layer image compositing at 4K/8K resolution.",
      applications: ["Nuke"],
      recommendedInfrastructure: ["Workstations", "NAS"],
      requirementProfile: { gpuIntensity: "medium", cpuIntensity: "high", ramMinGB: 128, storageType: "nvme-raid", networkMin: "25gbe", scalingPattern: "single-workstation" },
    },
    {
      name: "Model Training",
      description: "Training and fine-tuning deep learning models.",
      applications: ["PyTorch"],
      recommendedInfrastructure: ["GPU Servers", "Storage", "Networking"],
      requirementProfile: { gpuIntensity: "extreme", cpuIntensity: "medium", vramMinGB: 80, ramMinGB: 512, storageType: "parallel-fs", networkMin: "infiniband", scalingPattern: "scale-out-cluster" },
    },
    {
      name: "BIM Modeling",
      description: "Large-scale building information modeling and coordination.",
      applications: ["Revit"],
      recommendedInfrastructure: ["Workstations", "NAS"],
      requirementProfile: { gpuIntensity: "low", cpuIntensity: "high", ramMinGB: 64, storageType: "nvme-ssd", networkMin: "10gbe", scalingPattern: "single-workstation" },
    },
    {
      name: "Backtesting",
      description: "Historical simulation of trading strategies against tick-level data.",
      applications: ["QuantLib backtesting engines"],
      recommendedInfrastructure: ["Servers", "Storage"],
      requirementProfile: { gpuIntensity: "none", cpuIntensity: "extreme", ramMinGB: 256, storageType: "nvme-raid", networkMin: "10gbe", scalingPattern: "scale-up" },
    },
    {
      name: "Video Editing & Color",
      description: "4K/8K editorial, color grading and delivery.",
      applications: ["DaVinci Resolve"],
      recommendedInfrastructure: ["Workstations", "NAS"],
      requirementProfile: { gpuIntensity: "high", cpuIntensity: "medium", vramMinGB: 16, ramMinGB: 64, storageType: "nvme-raid", networkMin: "25gbe", scalingPattern: "single-workstation" },
    },
  ]);

  // --- Industries ---
  const industryDefs = [
    {
      name: "Architecture & Engineering",
      tagline: "Infrastructure for CAD, BIM and simulation at scale.",
      challenges: [
        { title: "Growing model complexity", description: "BIM models routinely exceed what standard workstations can handle in real time." },
        { title: "Multi-office collaboration", description: "Distributed teams need shared, fast access to the same large files." },
      ],
      workloads: ["BIM Modeling", "Rendering"],
      apps: ["Revit", "Autodesk Maya"],
      infra: ["Workstations", "NAS", "Networking"],
      narrative: "BIM and CAD workloads are memory and single-thread-CPU bound, with rendering adding GPU demand on top. We size workstations for the largest models in your pipeline and back them with shared, fast NAS so distributed teams aren't waiting on file transfers.",
      architecture: "Certified GPU workstations at each desk, connected over 10/25GbE to a central NAS holding the shared model library, with nightly backup to an off-site target.",
    },
    {
      name: "VFX & Animation",
      tagline: "Rendering, simulation and compositing pipelines that don't wait on hardware.",
      challenges: [
        { title: "Render farm bottlenecks", description: "Deadlines slip when GPU capacity can't keep pace with shot complexity." },
        { title: "Simulation memory ceilings", description: "Complex fluid and destruction sims outgrow single-workstation memory." },
      ],
      workloads: ["Rendering", "Simulation", "Compositing"],
      apps: ["Autodesk Maya", "Houdini", "Redshift", "Nuke"],
      infra: ["GPU Servers", "Workstations", "Storage", "Networking"],
      narrative: "A VFX pipeline stresses infrastructure differently at every stage: simulation is CPU and memory bound, rendering is GPU and VRAM bound, compositing is I/O bound. We architect each stage separately instead of forcing one generic spec across the whole pipeline.",
      architecture: "GPU workstations for lookdev and compositing, a GPU render farm for final frames, high-throughput shared storage for the asset library, and 25GbE+ networking tying it together.",
    },
    {
      name: "AI & Machine Learning",
      tagline: "Training, fine-tuning and inference infrastructure that scales with your models.",
      challenges: [
        { title: "GPU memory ceilings", description: "Larger models outgrow single-GPU VRAM, forcing multi-GPU or multi-node training." },
        { title: "Data pipeline throughput", description: "Slow storage starves fast GPUs, wasting expensive compute cycles." },
      ],
      workloads: ["Model Training"],
      apps: ["PyTorch"],
      infra: ["GPU Servers", "Storage", "Networking"],
      narrative: "Training throughput is gated by whichever component is slowest — GPU, interconnect, or storage. We size all three together: multi-GPU servers with high-bandwidth interconnect, parallel filesystem storage, and networking that doesn't bottleneck distributed training.",
      architecture: "Multi-node GPU cluster with InfiniBand interconnect, parallel filesystem storage for training data, and a dedicated management network for orchestration.",
    },
    {
      name: "Trading & Finance",
      tagline: "Low-latency compute for quant research, backtesting and trading desks.",
      challenges: [
        { title: "Backtest turnaround time", description: "Slow historical simulation delays strategy iteration." },
        { title: "Data integrity and uptime", description: "Trading infrastructure can't afford unplanned downtime." },
      ],
      workloads: ["Backtesting"],
      apps: ["QuantLib backtesting engines"],
      infra: ["Servers", "Storage", "Backup"],
      narrative: "Backtesting is CPU-clock-speed bound and latency-sensitive to storage. We prioritize high-clock-speed CPUs and NVMe scratch storage, backed by tested backup and recovery so a hardware failure never becomes a data-loss event.",
      architecture: "High-clock-speed compute nodes with local NVMe scratch storage, redundant power, and automated, tested backup to an immutable target.",
    },
    {
      name: "Media & Production",
      tagline: "Editing, color and delivery infrastructure at broadcast scale.",
      challenges: [
        { title: "4K/8K media throughput", description: "High-resolution footage saturates standard storage and networking." },
        { title: "Multi-editor collaboration", description: "Teams need simultaneous access to the same shared media pool." },
      ],
      workloads: ["Video Editing & Color"],
      apps: ["DaVinci Resolve"],
      infra: ["Workstations", "NAS", "Networking"],
      narrative: "Editorial and color workloads are GPU-bound for playback and grading, with storage throughput as the real ceiling at 4K/8K. We size shared NAS and networking around simultaneous multi-editor access, not just single-workstation performance.",
      architecture: "GPU-accelerated edit and color workstations connected over 25GbE to shared NAS holding the media pool, with proxy workflows for remote collaboration.",
    },
  ];

  const industries = await upsertIndustries(payload, industryDefs, workloads, apps, infra);

  // --- Case study (VFX) ---
  const vfx = industries.find((i) => i.name === "VFX & Animation");
  if (vfx) {
    const existing = await payload.find({ collection: "case-studies", where: { slug: { equals: "animation-studio-render-pipeline" } }, limit: 1 });
    if (existing.docs.length === 0) {
      const gpuServers = infra.find((i) => i.name === "GPU Servers");
      const cs = await payload.create({
        collection: "case-studies",
        data: {
          title: "Cutting render turnaround for a 40-artist animation pipeline",
          slug: "animation-studio-render-pipeline",
          clientAnonymous: true,
          industry: vfx.id,
          summary: "A growing animation studio redesigned its render farm and storage around Redshift's GPU/VRAM profile instead of a generic CPU farm.",
          challenge: lexical("The studio's existing CPU render farm couldn't keep pace with Redshift's GPU-first rendering, creating nightly render backlogs that delayed delivery."),
          approach: lexical("We replaced the CPU farm with a GPU render farm sized to Redshift's VRAM requirements, paired with high-throughput shared storage so multiple render nodes could pull assets simultaneously without contention."),
          infrastructureDeployed: gpuServers ? [gpuServers.id] : undefined,
          results: [
            { metric: "Average render time per frame", before: "38 min", after: "14 min" },
            { metric: "Nightly render backlog", before: "Regular", after: "Eliminated" },
          ],
          quote: { text: "We stopped designing schedules around render time. The farm keeps up with us now.", person: "Studio Pipeline Lead" },
          publishedAt: new Date().toISOString(),
        } as any,
      });
      await payload.update({ collection: "industries", id: vfx.id, data: { caseStudies: [cs.id] } });
    }
  }

  // --- Case study (AI & ML) ---
  const ml = industries.find((i) => i.name === "AI & Machine Learning");
  if (ml) {
    const existing = await payload.find({ collection: "case-studies", where: { slug: { equals: "ml-team-multi-gpu-training-cluster" } }, limit: 1 });
    if (existing.docs.length === 0) {
      const gpuServers = infra.find((i) => i.name === "GPU Servers");
      const cs = await payload.create({
        collection: "case-studies",
        data: {
          title: "Cutting model training time with a right-sized GPU cluster",
          slug: "ml-team-multi-gpu-training-cluster",
          clientAnonymous: true,
          industry: ml.id,
          summary: "A machine learning team outgrew single-GPU workstations and needed multi-node training that actually scaled.",
          challenge: lexical("Training runs on single-GPU workstations were taking days, and adding GPUs without matching interconnect bandwidth had previously failed to speed things up."),
          approach: lexical("We deployed a multi-node GPU cluster with high-bandwidth interconnect and parallel filesystem storage, sized so throughput scaled with GPU count instead of plateauing."),
          infrastructureDeployed: gpuServers ? [gpuServers.id] : undefined,
          results: [
            { metric: "Time to train a full model", before: "4.5 days", after: "9 hours" },
            { metric: "GPU utilization during training", before: "~40%", after: "~92%" },
          ],
          quote: { text: "We stopped waiting on training runs to plan the next experiment.", person: "ML Infrastructure Lead" },
          publishedAt: new Date().toISOString(),
        } as any,
      });
      await payload.update({ collection: "industries", id: ml.id, data: { caseStudies: [cs.id] } });
    }
  }

  // --- Case study (Trading & Finance) ---
  const trading = industries.find((i) => i.name === "Trading & Finance");
  if (trading) {
    const existing = await payload.find({ collection: "case-studies", where: { slug: { equals: "quant-desk-backtest-turnaround" } }, limit: 1 });
    if (existing.docs.length === 0) {
      const servers = infra.find((i) => i.name === "Servers");
      const cs = await payload.create({
        collection: "case-studies",
        data: {
          title: "Turning multi-hour backtests into a strategy-iteration loop",
          slug: "quant-desk-backtest-turnaround",
          clientAnonymous: true,
          industry: trading.id,
          summary: "A quant desk's historical simulation was too slow to support same-day strategy iteration.",
          challenge: lexical("Backtests against years of tick-level data were CPU-clock-speed bound, and the desk's shared compute was tuned for core count, not single-thread performance."),
          approach: lexical("We deployed high-clock-speed compute nodes with local NVMe scratch storage, backed by tested, automated backup so the desk never had to choose between speed and data safety."),
          infrastructureDeployed: servers ? [servers.id] : undefined,
          results: [
            { metric: "Full historical backtest runtime", before: "6.2 hours", after: "48 minutes" },
            { metric: "Strategy iterations per day", before: "1", after: "5+" },
          ],
          quote: { text: "We can test an idea and know by lunch whether it holds up.", person: "Head of Quant Research" },
          publishedAt: new Date().toISOString(),
        } as any,
      });
      await payload.update({ collection: "industries", id: trading.id, data: { caseStudies: [cs.id] } });
    }
  }

  // --- Posts ---
  await upsertPost(payload, {
    title: "Why VRAM, not core count, decides your GPU render farm size",
    slug: "vram-vs-core-count-gpu-render-farm",
    type: "blog",
    excerpt: "GPU renderers like Redshift are bound by VRAM long before they're bound by anything else. Here's how to size a farm around it.",
    body: lexical("Most render farm sizing conversations start with GPU count. The more useful question is VRAM per scene: once a scene's textures and geometry exceed available VRAM, performance falls off a cliff regardless of how many GPUs you add. Size for your largest shots' VRAM footprint first, then scale GPU count for throughput."),
  });

  await upsertPost(payload, {
    title: "The real bottleneck in distributed model training isn't the GPU",
    slug: "distributed-training-real-bottleneck",
    type: "insight",
    excerpt: "Multi-node training lives or dies on interconnect bandwidth and storage throughput, not raw GPU count.",
    body: lexical("Adding GPUs to a training cluster without matching interconnect bandwidth just moves the bottleneck. InfiniBand or equivalent high-bandwidth, low-latency networking is what lets multi-GPU, multi-node training actually scale near-linearly instead of plateauing."),
  });

  console.log("Seed complete.");
  process.exit(0);
}

async function upsertInfrastructure(
  payload: Awaited<ReturnType<typeof getPayload>>,
  defs: { name: string; category: string; parentName?: string; summary?: string; capabilities?: string[]; businessValue?: string[] }[],
) {
  const created: { name: string; id: string | number }[] = [];
  for (const def of defs) {
    const existing = await payload.find({ collection: "infrastructure", where: { name: { equals: def.name } }, limit: 1 });
    if (existing.docs.length > 0) {
      created.push({ name: def.name, id: existing.docs[0].id });
      continue;
    }
    const parent = def.parentName ? created.find((c) => c.name === def.parentName) : undefined;
    const doc = await payload.create({
      collection: "infrastructure",
      data: {
        name: def.name,
        category: def.category as any,
        parent: parent?.id as any,
        summary: def.summary,
        capabilities: def.capabilities?.map((text) => ({ text })),
        businessValue: def.businessValue?.map((text) => ({ text })),
      },
    });
    created.push({ name: def.name, id: doc.id });
  }
  return created;
}

async function upsertApplications(
  payload: Awaited<ReturnType<typeof getPayload>>,
  defs: { name: string; vendor: string; category: string; optimisationNotes?: string }[],
) {
  const created: { name: string; id: string | number }[] = [];
  for (const def of defs) {
    const existing = await payload.find({ collection: "applications", where: { name: { equals: def.name } }, limit: 1 });
    if (existing.docs.length > 0) {
      created.push({ name: def.name, id: existing.docs[0].id });
      continue;
    }
    const doc = await payload.create({
      collection: "applications",
      data: { name: def.name, vendor: def.vendor, category: def.category as any, optimisationNotes: def.optimisationNotes },
    });
    created.push({ name: def.name, id: doc.id });
  }
  return created;
}

async function upsertWorkloads(
  payload: Awaited<ReturnType<typeof getPayload>>,
  defs: {
    name: string;
    description: string;
    applications: string[];
    recommendedInfrastructure: string[];
    requirementProfile: Record<string, unknown>;
  }[],
) {
  const created: { name: string; id: string | number }[] = [];
  for (const def of defs) {
    const existing = await payload.find({ collection: "workloads", where: { name: { equals: def.name } }, limit: 1 });
    if (existing.docs.length > 0) {
      created.push({ name: def.name, id: existing.docs[0].id });
      continue;
    }
    const appIds = await resolveIds(payload, "applications", def.applications);
    const infraIds = await resolveIds(payload, "infrastructure", def.recommendedInfrastructure);
    const doc = await payload.create({
      collection: "workloads",
      data: {
        name: def.name,
        description: def.description,
        applications: appIds as any,
        recommendedInfrastructure: infraIds as any,
        requirementProfile: def.requirementProfile as any,
      },
    });
    created.push({ name: def.name, id: doc.id });
  }
  return created;
}

async function upsertIndustries(
  payload: Awaited<ReturnType<typeof getPayload>>,
  defs: any[],
  _workloads: { name: string; id: string | number }[],
  _apps: { name: string; id: string | number }[],
  _infra: { name: string; id: string | number }[],
) {
  const created: { name: string; id: string | number }[] = [];
  for (const def of defs) {
    const existing = await payload.find({ collection: "industries", where: { name: { equals: def.name } }, limit: 1 });
    if (existing.docs.length > 0) {
      created.push({ name: def.name, id: existing.docs[0].id });
      continue;
    }
    const workloadIds = await resolveIds(payload, "workloads", def.workloads);
    const appIds = await resolveIds(payload, "applications", def.apps);
    const infraIds = await resolveIds(payload, "infrastructure", def.infra);
    const doc = await payload.create({
      collection: "industries",
      data: {
        name: def.name,
        tagline: def.tagline,
        challenges: def.challenges,
        workloads: workloadIds as any,
        featuredApplications: appIds as any,
        recommendedInfrastructure: infraIds as any,
        requirementsNarrative: lexical(def.narrative) as any,
        possibleArchitecture: { description: lexical(def.architecture) as any },
      },
    });
    created.push({ name: def.name, id: doc.id });
  }
  return created;
}

async function upsertPost(
  payload: Awaited<ReturnType<typeof getPayload>>,
  def: { title: string; slug: string; type: "blog" | "insight"; excerpt: string; body: unknown },
) {
  const existing = await payload.find({ collection: "posts", where: { slug: { equals: def.slug } }, limit: 1 });
  if (existing.docs.length > 0) return;
  await payload.create({
    collection: "posts",
    data: {
      title: def.title,
      slug: def.slug,
      type: def.type,
      excerpt: def.excerpt,
      body: def.body as any,
      publishedAt: new Date().toISOString(),
    },
  });
}

async function resolveIds(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: "applications" | "infrastructure" | "workloads",
  names: string[] = [],
) {
  const ids: (string | number)[] = [];
  for (const name of names) {
    const res = await payload.find({ collection, where: { name: { equals: name } }, limit: 1 });
    if (res.docs[0]) ids.push(res.docs[0].id);
  }
  return ids;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
