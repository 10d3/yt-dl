import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import fs from "fs/promises"; // Import the file system module
import path from "path"; // Import path module

const app = new Hono();

// Serve static files
app.use("/static/*", serveStatic({ root: "./public" }));
app.use("/", serveStatic({ root: "./public" })); // Serve index.html from the root

// Download endpoint
app.post("/download", async (c) => {
  try {
    const { url, format } = await c.req.json();

    // Generate unique filename
    const filename = `download${Date.now()}.${
      format === "audio" ? "mp3" : "mp4"
    }`;

    // Execute Python script
    const process = Bun.spawn([
      "python3",
      "./downloader.py",
      url,
      filename,
      format,
    ]);

    // Wait for process to finish
    await process.exited;

    // Check process exit code and stderr
    if (process.exitCode !== 0) {
      const stderr = await new Response(process.stderr).text();
      throw new Error(`Download failed: ${stderr}`);
    }

    // Check if file exists
    const filePath = `./downloads/${filename}`;
    if (!(await Bun.file(filePath).exists())) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Return the file
    const file = Bun.file(filePath);
    const exists = await file.exists();

    if (!exists) {
      throw new Error("File was not created successfully");
    }

    // Read the file contents
    const arrayBuffer = await file.arrayBuffer();

    return new Response(arrayBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Type": format === "audio" ? "audio/mpeg" : "video/mp4",
      },
    });
  } catch (error: any) {
    console.error("Download error:", error);
    return c.json(
      {
        success: false,
        message: error.message,
      },
      500
    );
  }
});

// Cleanup function to delete files older than 10 seconds
async function cleanupDownloads() {
  const downloadDir = "./downloads";
  const files = await fs.readdir(downloadDir);

  const now = Date.now();
  const tenSeconds = 10000; // 10 seconds in milliseconds

  for (const file of files) {
    const filePath = path.join(downloadDir, file);
    const stats = await fs.stat(filePath);

    // Check if the file is older than 10 seconds
    if (now - stats.mtimeMs > tenSeconds) {
      await fs.unlink(filePath); // Delete the file
      console.log(`Deleted old file: ${filePath}`);
    }
  }
}

// Set interval to clean up downloads every 10 seconds
setInterval(cleanupDownloads, 10000);

export default {
  port: 3000,
  fetch: app.fetch,
};