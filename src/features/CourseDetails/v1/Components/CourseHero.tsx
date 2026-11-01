import { Building2 } from "lucide-react";
import Badge from "./Badge";

interface CourseHeroProps {
  title: string;
  department: string;
  image?: string;
  logo?: string;
  duration?: string;
  mode?: string;
}

export default function CourseHero({
  title,
  department,
  image = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1600",
  logo,
  duration = "3 Years",
  mode = "Full Time",
}: CourseHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-800 min-h-[260px] sm:min-h-[320px] flex items-end">
      {/* Background Image */}
      <img src={image} alt={title} className="absolute inset-0 h-full w-full object-cover" />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07080C] via-[#07080C]/85 to-transparent" />

      {/* Content */}
      <div className="relative z-10 w-full p-4 sm:p-6 lg:p-8">
        <div className="flex items-center gap-3.5 sm:gap-4">
          {logo && (
            <img
              src={logo}
              alt={`${title} Logo`}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-2xl bg-zinc-950/90 shrink-0"
            />
          )}
          <div className="min-w-0">
            <Badge>Academic Program Specification</Badge>
            <h1 className="mt-1 text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight text-white truncate">
              {title}
            </h1>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2 text-xs sm:text-sm text-zinc-300">
          <Building2 size={16} className="text-indigo-400" />
          <span>{department}</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 sm:gap-3">
          <div className="rounded-xl border border-zinc-800 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Duration</p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white">{duration}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Mode</p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-white capitalize">{mode}</p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/60 px-3.5 py-1.5 backdrop-blur-md">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400">Institution</p>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-indigo-300">
              Eduvanta Academic Board
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
