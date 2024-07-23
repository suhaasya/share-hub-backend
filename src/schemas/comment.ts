import { z } from "zod";
import { DefaultSearchParams } from "./comman";
// import { DefaultSearchParams } from "./common";

export const AddComment = z.object({
  postId: z.number(),
  description: z.string(),
});

export const SearchComment = DefaultSearchParams.extend({
  postId: z.string().optional(),
  userId: z.string().optional(),
});

export const UpdateComment = z.object({
  description: z.string(),
});

export type CommentSchema = z.infer<typeof AddComment>;
export type UpdateCommentSchema = z.infer<typeof UpdateComment>;
export type SearchCommentSchema = z.infer<typeof SearchComment>;
