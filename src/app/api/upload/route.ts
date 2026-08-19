import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "filename and contentType are required" },
        { status: 400 }
      );
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      console.error("Missing R2 environment variables. Please check .env.local");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Create a unique file key
    const timestamp = Date.now();
    const safeName = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `pin_images/${timestamp}_${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Get signed URL valid for 5 minutes (300 seconds)
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    // The final URL where the image will be accessible
    let publicUrl = "";
    if (process.env.NEXT_PUBLIC_R2_PUBLIC_URL) {
      // Remove trailing slash if exists, then append key
      const baseUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL.replace(/\/$/, "");
      publicUrl = `${baseUrl}/${key}`;
    }

    return NextResponse.json({
      signedUrl,
      publicUrl,
      key,
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
