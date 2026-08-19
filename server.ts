import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import JSZip from "jszip";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper for Gemini AI client
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Direct 1-Click Project Source Code ZIP Download Endpoint
  app.get("/api/download-source-zip", async (req, res) => {
    try {
      const zip = new JSZip();
      const projectRoot = process.cwd();

      const ignoredDirs = new Set(["node_modules", "dist", ".git", ".vite", ".turbo", ".aistudio"]);

      function addDirectoryToZip(dirPath: string, zipFolder: JSZip) {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
          if (ignoredDirs.has(item)) continue;
          const fullPath = path.join(dirPath, item);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            const nestedZipFolder = zipFolder.folder(item);
            if (nestedZipFolder) {
              addDirectoryToZip(fullPath, nestedZipFolder);
            }
          } else if (stat.isFile()) {
            const fileData = fs.readFileSync(fullPath);
            zipFolder.file(item, fileData);
          }
        }
      }

      addDirectoryToZip(projectRoot, zip);

      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });

      const today = new Date().toISOString().slice(0, 10);
      const filename = `seneng-manah-horsebow-project-source_${today}.zip`;

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.setHeader("Content-Length", zipBuffer.length);
      res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
      res.send(zipBuffer);
    } catch (err: any) {
      console.error("Error creating project zip:", err);
      res.status(500).json({ error: "Gagal membuat berkas ZIP kode sumber: " + err.message });
    }
  });

  // AI Archery Coach Analysis Endpoint
  app.post("/api/ai/coach-analysis", async (req, res) => {
    try {
      const { athlete, recentScores, attendanceRate, sppStatus } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback local heuristic analysis if no API key
        const avg = recentScores && recentScores.length > 0 
          ? (recentScores.reduce((a: number, b: any) => a + (b.totalScore || 0), 0) / recentScores.length).toFixed(1)
          : "N/A";
        
        return res.json({
          success: true,
          isFallback: true,
          analysis: {
            title: `Evaluasi Horse Bow & Rekomendasi: ${athlete?.name || "Atlet"}`,
            summary: `Atlet ${athlete?.name || ""} (${athlete?.division || "Horsebow"} - ${athlete?.ageCategory || "Senior/Umum"}) memiliki performa rata-rata skor ${avg} dari sesi latihan & scoring terakhir. Disiplin kehadiran presensi tercatat ${attendanceRate || "85"}%.`,
            strengths: [
              "Kuncian Thumb Draw (Ibu Jari) rapat dan pelepasan khatra buang samping sangat konsisten.",
              "Kemampuan blind nocking cepat dan mulus saat uji FAST SHOOTING.",
              "Keseimbangan di pelana (seat balance) saat canter terkoordinasi stabil."
            ],
            areasToImprove: [
              "Stabilitas postur bahu kiri (bow arm) saat menembak target sudut belakang (Kassai shot pada HBA track 90m).",
              "Sinkronisasi ketukan langkah kuda (gait rhythm) dengan detik pelepasan tali busur.",
              "Manajemen waktu dan transisi nocking saat berpindah rintangan pada Dynamic Archery."
            ],
            drillsRecommended: [
              "Blind Nocking Drill 5 Panah: Latihan memasang anak panah tanpa melihat tangan (target < 3 detik/panah).",
              "Khatra & Thumb Release Drill: 40 repetisi tembak jarak 5m dengan fokus dorong forward-khatra.",
              "Canter & Reins Control Simulation: Latihan memegang tali kekang bersama busur dan 3 panah di bow hand."
            ],
            coachNote: `Pertahankan disiplin latihan 6 topik Horse Bow (Latihan Rutin, Persiapan Lomba, HBA, Berkuda, FAST SHOOTING, DYNAMIC). Pastikan administrasi SPP (${sppStatus === "LUNAS" ? "Status: LUNAS" : "Perlu verifikasi SPP"}) terpantau tertib.`
          }
        });
      }

      const prompt = `
Anda adalah seorang Pelatih Kepala Panahan Tradisional & Horseback Archery Nasional (Master Coach Horse Bow & HBA Expert).
Berikan analisis mendalam, evaluasi teknik Horse Bow (Thumb draw, Khatra, Blind Nocking, Equitation Berkuda, Dynamic Track), dan menu drill khusus:

DATA ATLET HORSE BOW:
- Nama: ${athlete?.name || "Atlet"}
- Divisi: ${athlete?.division || "Horsebow"}
- Kategori Usia: ${athlete?.ageCategory || "Senior/Umum"}
- Draw Weight: ${athlete?.equipment?.drawWeightLbs || "40"} lbs, Draw Length: ${athlete?.equipment?.drawLengthInch || "28"} inch
- Thumb Ring & Khatra Style: ${athlete?.equipment?.thumbRingType || "Ottoman Brass Ring"} / ${athlete?.equipment?.khatraStyle || "Forward Khatra"}
- Tingkat Kehadiran: ${attendanceRate || "80"}%
- Status Administrasi SPP: ${sppStatus || "LUNAS"}
- Riwayat Sesi Penilaian (Latihan Rutin, Persiapan Lomba, HBA, Berkuda, FAST SHOOTING, DYNAMIC): ${JSON.stringify(recentScores || [])}

Format balasan HARUS JSON valid dengan struktur berikut:
{
  "title": "string (Judul Evaluasi)",
  "summary": "string (Ringkasan performa Horse Bow 2-3 kalimat)",
  "strengths": ["string poin kelebihan 1", "string poin kelebihan 2", "string poin kelebihan 3"],
  "areasToImprove": ["string aspek yang perlu diperbaiki 1", "string aspek yang perlu diperbaiki 2", "string aspek yang perlu diperbaiki 3"],
  "drillsRecommended": ["string menu latihan khusus 1", "string menu latihan khusus 2", "string menu latihan khusus 3"],
  "coachNote": "string (Pesan motivasi pelatih)"
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.6,
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      return res.json({
        success: true,
        isFallback: false,
        analysis: parsedData,
      });
    } catch (error: any) {
      console.error("AI Coach Analysis error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Gagal memproses evaluasi AI Coach",
      });
    }
  });

  // AI Form & Grouping Diagnostic Endpoint
  app.post("/api/ai/grouping-diagnostic", async (req, res) => {
    try {
      const { groupingPattern, division, distance } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isFallback: true,
          diagnostic: {
            cause: `Pola grouping (${groupingPattern}) pada divisi ${division} jarak ${distance}m umumnya disebabkan oleh inkonsistensi bow hand grip pressure, drop bow arm saat release, atau anchor point yang bergeser.`,
            solution: "Gunakan finger sling yang pas, biarkan busur terlempar alami ke depan tanpa digenggam erat (dead grip), dan pastikan ekspansi otot punggung kontinu hingga panah lepas."
          }
        });
      }

      const prompt = `
Sebagai pakar biomekanika panahan (Archery Biomechanics Expert), berikan diagnosa teknis dan solusi untuk pola tembakan anak panah:
- Pola Grouping / Masalah: "${groupingPattern}"
- Divisi: "${division}"
- Jarak: "${distance}m"

Berikan respon JSON:
{
  "cause": "string (Penyebab teknis mekanika tubuh/alat secara spesifik)",
  "solution": "string (Langkah perbaikan form, drill koreksi, atau tuning alat)",
  "quickChecklist": ["poin 1", "poin 2", "poin 3"]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.5,
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ success: true, isFallback: false, diagnostic: parsedData });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Panahan running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
