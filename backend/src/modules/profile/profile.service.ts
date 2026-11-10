import type { Rank } from "@prisma/client";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../../config/database";
import { badRequest } from "../../utils/errors";

const extensionByMimeType: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function imageBufferFromPayload(data: string) {
  const base64 = data.includes(",") ? data.split(",").pop() : data;
  if (!base64) throw badRequest("Invalid image data");
  const buffer = Buffer.from(base64, "base64");
  if (!buffer.length) throw badRequest("Invalid image data");
  return buffer;
}

export const profileService = {
  getMe: (userId: string) =>
    prisma.profile.findUniqueOrThrow({
      where: { userId },
      include: { user: { select: { id: true, email: true, role: true, status: true } } },
    }),

  updateMe: (userId: string, data: { firstName?: string; lastName?: string; photoUrl?: string | null; rank?: Rank | null }) =>
    prisma.profile.update({ where: { userId }, data }),

  async uploadPhoto(userId: string, input: { data: string; mimeType: string; fileName?: string }) {
    const extension = extensionByMimeType[input.mimeType];
    if (!extension) throw badRequest("Unsupported image type");
    const buffer = imageBufferFromPayload(input.data);
    if (buffer.length > 2 * 1024 * 1024) throw badRequest("Profile photo must be smaller than 2MB");

    const dir = path.join(process.cwd(), "uploads", "profiles");
    await fs.mkdir(dir, { recursive: true });
    const fileName = `${userId}-${Date.now()}.${extension}`;
    await fs.writeFile(path.join(dir, fileName), buffer);

    const photoUrl = `/uploads/profiles/${fileName}`;
    return prisma.profile.update({ where: { userId }, data: { photoUrl } });
  },
};
