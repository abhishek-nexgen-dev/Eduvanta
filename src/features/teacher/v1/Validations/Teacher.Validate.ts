import { z } from "zod";

export const TeacherValidation = z.object({
  name: z.string().trim().min(2, "Faculty full name is required (at least 2 characters)"),
  email: z.string().trim().email("Please provide a valid institutional email address"),
  department: z.string().min(1, "Please select an academic department"),
  designation: z.string().trim().min(1, "Designation / Role is required"),
  qualification: z.string().trim().min(1, "Educational qualification is required"),
  Experience: z.coerce.number().min(0, "Experience must be 0 or greater").default(1),
  phone: z.string().trim().optional().default(""),
  Avtar: z.string().optional().default(""),
  facebook: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val || val === "#" || val === "") return "https://facebook.com/eduvanta";
      const cleaned = val.trim();
      return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    }),
  linkedin: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val || val === "#" || val === "") return "https://linkedin.com/company/eduvanta";
      const cleaned = val.trim();
      return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    }),
  twitter: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val || val === "#" || val === "") return "https://twitter.com/eduvanta";
      const cleaned = val.trim();
      return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    }),
  instagram: z
    .string()
    .trim()
    .optional()
    .transform((val) => {
      if (!val || val === "#" || val === "") return "https://instagram.com/eduvanta";
      const cleaned = val.trim();
      return /^https?:\/\//i.test(cleaned) ? cleaned : `https://${cleaned}`;
    }),
});

export type TeacherSchema = z.infer<typeof TeacherValidation>;

