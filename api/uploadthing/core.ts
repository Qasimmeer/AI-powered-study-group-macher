import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getSession } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  studyMaterial: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "16MB" } })
    .middleware(async ({ req }) => {
      const session = await getSession();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("File URL", file.url);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
