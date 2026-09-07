import fs from "node:fs";
import path from "node:path";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/ui/Reveal";
import { getPartners } from "@/lib/content";

// The brands DGB India builds with. `slug` is the filename to drop into
// Frontend/public/partners/ — e.g. "nvidia" matches nvidia.svg / nvidia.png.
// Where no file exists the brand name renders as a wordmark instead, so the
// strip reads correctly even before any logo assets are added.
const BRANDS: { name: string; slug: string }[] = [
  { name: "MSI", slug: "msi" },
  { name: "NVIDIA", slug: "nvidia" },
  { name: "PNY", slug: "pny" },
  { name: "ASUS", slug: "asus" },
  { name: "ASRock", slug: "asrock" },
  { name: "GIGABYTE", slug: "gigabyte" },
  { name: "ADATA", slug: "adata" },
  { name: "XPG", slug: "xpg" },
  { name: "G.SKILL", slug: "gskill" },
  { name: "DeepCool", slug: "deepcool" },
  { name: "Samsung", slug: "samsung" },
  { name: "BenQ", slug: "benq" }, // monitors
  { name: "Dell", slug: "dell" }, // monitors
  { name: "Seagate", slug: "seagate" },
  { name: "WD", slug: "wd" },
  { name: "QNAP", slug: "qnap" },
  { name: "Synology", slug: "synology" },
];

const LOGO_EXTENSIONS = [".svg", ".png", ".webp", ".jpg", ".jpeg"];

// Read public/partners once per render so a logo is picked up whatever
// extension it was saved with. Missing directory is the normal "no logos
// added yet" case, not an error.
function readLocalLogos(): Record<string, string> {
  const dir = path.join(process.cwd(), "public", "partners");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir);
  } catch {
    return {};
  }

  const logos: Record<string, string> = {};
  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!LOGO_EXTENSIONS.includes(ext)) continue;
    logos[path.basename(file, ext).toLowerCase()] = `/partners/${file}`;
  }
  return logos;
}

type LogoItem = { name: string; logo: string | null };

export async function Partners() {
  const cmsPartners = await getPartners();
  const localLogos = readLocalLogos();

  // CMS partners win when the collection has been filled in; otherwise fall
  // back to the fixed brand list above + whatever is in public/partners/.
  const items: LogoItem[] = cmsPartners.length
    ? cmsPartners.map((p) => ({
        name: p.name,
        logo: (typeof p.logo === "object" && p.logo?.url) || localLogos[p.name.toLowerCase()] || null,
      }))
    : BRANDS.map((b) => ({ name: b.name, logo: localLogos[b.slug] ?? null }));

  if (items.length === 0) return null;

  // Rendered twice so the -50% translate loops without a visible seam.
  const track = [...items, ...items];

  return (
    <section className="border-b border-border bg-background py-16 sm:py-20">
      <div className="container-page">
        <Reveal className="text-center">
          <Eyebrow>Technology Partners</Eyebrow>
          <h2 className="font-display mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            Built With Industry-Leading Brands.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted sm:text-base">
            We configure and deploy infrastructure using hardware from the manufacturers our
            customers already trust.
          </p>
        </Reveal>
      </div>

      <div
        className="group/marquee mt-10 overflow-hidden sm:mt-12"
        style={{
          WebkitMaskImage:
            "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
          maskImage: "linear-gradient(to right, transparent, #000 6%, #000 94%, transparent)",
        }}
      >
        <div className="dgb-logos-track flex w-max items-center">
          {track.map((item, i) => {
            const isClone = i >= items.length;
            return (
              <div
                key={`${item.name}-${i}`}
                {...(isClone ? { "data-logo-clone": "true", "aria-hidden": true } : {})}
                className="flex shrink-0 items-center justify-center px-6 sm:px-9"
              >
                {item.logo ? (
                  <div
                    role="img"
                    aria-label={isClone ? undefined : item.name}
                    title={item.name}
                    className="h-9 w-[112px] bg-contain bg-center bg-no-repeat opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0 sm:h-11 sm:w-[140px]"
                    style={{ backgroundImage: `url(${item.logo})` }}
                  />
                ) : (
                  <span className="font-display flex h-9 items-center whitespace-nowrap text-lg font-bold tracking-tight text-[#9aa0a6] transition-colors duration-300 hover:text-ink-800 sm:h-11 sm:text-[22px]">
                    {item.name}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
