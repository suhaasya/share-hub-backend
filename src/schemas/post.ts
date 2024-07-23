import { z } from "zod";
import { DefaultSearchParams } from "./comman";
// import { DefaultSearchParams } from "./common";

export const AddPost = z.object({
  title: z.string(),
  thumbnailUrl: z.string().optional(),
  articleLink: z.string().optional(),
  videoLink: z.string().optional(),
  description: z.string(),
  tagIds: z.array(z.number()).optional(),
  newTags: z.array(z.string()).optional(),
  type: z.enum(["public", "private"]).optional(),
  emails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional(),
});

export const SearchPost = DefaultSearchParams.extend({
  tagId: z.string().optional(),
  userId: z.string().optional(),
  query: z.string().optional(),
});

export const UpdatePost = z.object({
  title: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  articleLink: z.string().optional(),
  videoLink: z.string().optional(),
  description: z.string().optional(),
  tagIds: z.array(z.number()).optional(),
  newTags: z.array(z.string()).optional(),
  deletedTagIds: z.array(z.number()).optional(),
  type: z.enum(["public", "private"]).optional(),
  emails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional(),
  removedEmails: z
    .array(z.string().email({ message: "Invalid email address" }))
    .optional(),
});

export type PostSchema = z.infer<typeof AddPost>;
export type UpdatePostSchema = z.infer<typeof UpdatePost>;
export type SearchPostSchema = z.infer<typeof SearchPost>;
