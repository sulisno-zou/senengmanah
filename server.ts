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
      const { athlete, recentScores, attendanceRate, sppStatus, requestedTopic } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        // Fallback local heuristic analysis if no API key
        const avg = recentScores && recentScores.length > 0 
          ? (recentScores.reduce((a: number, b: any) => a + (b.totalScore || 0), 0) / recentScores.length).toFixed(1)
          : "82.5";
        
        return res.json({
          success: true,
          isFallback: true,
          analysis: {
            title: `Evaluasi Horse Bow & Rekomendasi: ${athlete?.name || "Atlet"}`,
            summary: `Atlet ${athlete?.name || ""} (${athlete?.division || "Horsebow"} - ${athlete?.ageCategory || "Senior/Umum"}) memiliki performa rata-rata skor ${avg} dari sesi latihan & scoring terakhir. Disiplin kehadiran presensi tercatat ${attendanceRate || "85"}%.`,
            performanceGrade: "A (Sangat Baik)",
            strengths: [
              "Kuncian Thumb Draw (Ibu Jari) rapat dan pelepasan khatra buang samping sangat konsisten.",
              "Kemampuan blind nocking cepat dan mulus saat uji FAST SHOOTING (< 3.5 detik/panah).",
              "Keseimbangan di pelana (seat balance) saat canter terkoordinasi stabil pada lintasan berkuda."
            ],
            areasToImprove: [
              "Stabilitas postur bahu kiri (bow shoulder) saat menembak target sudut belakang (Kassai shot pada HBA track 90m).",
              "Sinkronisasi ketukan langkah kuda (gait rhythm) dengan detik pelepasan tali busur saat canter.",
              "Konsistensi dynamic anchor point saat berpindah rintangan pada lintasan Tactical Obstacle."
            ],
            drillsRecommended: [
              "Blind Nocking Drill 5 Panah: Latihan memasang anak panah tanpa melihat tangan (target < 3 detik/panah).",
              "Khatra & Thumb Release Drill: 40 repetisi tembak jarak 5m dengan fokus dorong forward-khatra.",
              "Canter & Reins Control Simulation: Latihan memegang tali kekang bersama busur dan 3 panah di bow hand."
            ],
            techniqueRating: {
              thumbDrawRelease: 88,
              khatraAction: 85,
              anchorStability: 82,
              equitationBalance: 86,
              fastShootingSpeed: 90
            },
            coachNote: `Pertahankan disiplin latihan 6 topik Horse Bow (Latihan Rutin, Persiapan Lomba, HBA, Berkuda, FAST SHOOTING, DYNAMIC). Pastikan administrasi SPP (${sppStatus === "LUNAS" ? "Status: LUNAS" : "Perlu verifikasi SPP"}) terpantau tertib demi kelancaran pembinaan atlit.`
          }
        });
      }

      const prompt = `
Anda adalah 'Coach Al-Fatih AI', Master Coach Panahan Tradisional & Horseback Archery Nasional (Horse Bow & HBA Specialist).
Berikan evaluasi performa mendalam, analisis teknik biomekanika Horse Bow (Thumb draw, Khatra, Blind Nocking, Equitation Berkuda, Dynamic Archery), serta menu drill latihan terstruktur:

PROFIL & DATA ATLET:
- Nama Lengkap: ${athlete?.name || "Atlet"}
- Divisi Busur: ${athlete?.division || "Horsebow"}
- Kategori Usia: ${athlete?.ageCategory || "Senior/Umum"}
- Draw Weight: ${athlete?.equipment?.drawWeightLbs || "35"} lbs
- Draw Length: ${athlete?.equipment?.drawLengthInch || "28"} inch
- Thumb Ring & Khatra Style: ${athlete?.equipment?.thumbRingType || "Ottoman Brass"} / ${athlete?.equipment?.khatraStyle || "Forward Khatra"}
- Tingkat Kehadiran Presensi: ${attendanceRate || "85"}%
- Status Administrasi SPP: ${sppStatus || "LUNAS"}
- Fokus Topik Yang Diminta: ${requestedTopic || "Semua 6 Topik Horsebow"}
- Riwayat Scoring Latihan Terkini: ${JSON.stringify(recentScores || [])}

Format balasan HARUS JSON valid dengan struktur persis:
{
  "title": "string (Judul Evaluasi Resmi)",
  "summary": "string (Ringkasan komprehensif performa atlet dalam 2-3 kalimat tajam)",
  "performanceGrade": "string (Misal: A+, A, B+, atau B)",
  "strengths": ["string poin keunggulan 1", "string poin keunggulan 2", "string poin keunggulan 3"],
  "areasToImprove": ["string aspek yang perlu diperbaiki 1", "string aspek yang perlu diperbaiki 2", "string aspek yang perlu diperbaiki 3"],
  "drillsRecommended": ["string menu latihan khusus & repetisinya 1", "string menu latihan khusus & repetisinya 2", "string menu latihan khusus & repetisinya 3"],
  "techniqueRating": {
    "thumbDrawRelease": 85,
    "khatraAction": 80,
    "anchorStability": 82,
    "equitationBalance": 80,
    "fastShootingSpeed": 88
  },
  "coachNote": "string (Catatan motivasi dan instruksi pelatih kepala untuk atlit dan wali murid)"
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

  // AI Interactive Chat Assistant for Archery
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { messages, athleteContext } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        const lastMsg = messages && messages.length > 0 ? messages[messages.length - 1].text : "";
        return res.json({
          success: true,
          isFallback: true,
          reply: `Halo! Saya Coach Al-Fatih AI. Terkait pertanyaan Anda "${lastMsg}": Pada teknik Horse Bow, kunci utama konsistensi tembakan terletak pada kuncian ibu jari (thumb lock 69 atau 63), dorongan khatra yang sinkron saat tali lepas, serta anchor point yang stabil di sudut bibir/rahang bawah. Lakukan drill blind nocking 10 menit setiap hari untuk meningkatkan refleks dan kecepatan!`
        });
      }

      const systemInstruction = `
Anda adalah 'Coach Al-Fatih AI', Pelatih Kepala & Konsultan Utama Panahan Tradisional Horse Bow & Horseback Archery Klub Seneng Manah Batu.
Karakter Anda: Sangat berpengetahuan, ramah, membimbing, tegas, memotivasi, dan berorientasi pada ketelitian teknik.
Keahlian Anda mencakup:
1. Teknik Thumb Draw (Ottoman, Slavic, Persian, Mongol, Korean 69/63 lock)
2. Aksi Khatra (Forward khatra, side khatra, diagonal drop) dan tuning clearance panah
3. Horseback Archery (HBA Hungarian track, Korean track, Qabaq, Polish track, seat balance di pelana saat canter/gallop, irama langkah kuda)
4. Fast Shooting & Blind Nocking (Teknik memegang multiple arrows di bow hand / draw hand, transisi < 2 detik)
5. Dynamic Archery (Memanah sambil bergerak, rintangan taktikal, 360° target hunt)
6. Arrow & Bow Tuning (Spine matching, point weight, arrow length, FOC, brace height, string waxing)
7. Manajemen Mental Atlet (Mengatasi Target Panic, flinching, ketenangan uji tanding lomba)

DATA KONTEKS ATLET YANG SEDANG DIKONSULTASIKAN:
${athleteContext ? JSON.stringify(athleteContext) : "Atlet Umum / Member Klub Seneng Manah"}

Gunakan bahasa Indonesia yang santun, jelas, terstruktur, gunakan poin-poin jika menjelaskan langkah teknik.
`;

      const formattedContents = (messages || []).map((m: any) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return res.json({
        success: true,
        isFallback: false,
        reply: response.text || "Mohon maaf, saya belum bisa memproses respon saat ini.",
      });
    } catch (error: any) {
      console.error("AI Chat error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Gagal memproses pesan AI Chat",
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
            cause: `Pola grouping (${groupingPattern}) pada divisi ${division} jarak ${distance}m umumnya disebabkan oleh inkonsistensi bow hand grip pressure, drop bow shoulder saat release, atau pergeseran anchor point.`,
            solution: "Gunakan finger sling/tali pengaman busur yang pas, biarkan busur terdorong alami ke depan lewat khatra tanpa digenggam erat (dead grip), dan pastikan ekspansi otot punggung (back tension) kontinu hingga panah lepas.",
            quickChecklist: [
              "Periksa posisi anchor point di tulang pipi/sudut bibir.",
              "Pastikan ibu jari rileks saat melepaskan kuncian thumb ring.",
              "Jaga bow arm tetap tegak lurus mengarah ke target selama follow-through (1-2 detik setelah panah lepas)."
            ]
          }
        });
      }

      const prompt = `
Sebagai pakar biomekanika panahan tradisional Horse Bow & Target Archery Expert, berikan diagnosa teknis mendalam dan solusi koreksi untuk:
- Masalah / Gejala / Pola Grouping: "${groupingPattern}"
- Divisi Busur: "${division || 'Horsebow'}"
- Jarak Tembak: "${distance || 30} meter"

Format respon JSON:
{
  "cause": "string (Penjelasan detail penyebab mekanika tubuh, alat, atau teknik)",
  "solution": "string (Langkah instruksi perbaikan form dan solusi pelatih)",
  "quickChecklist": ["poin 1", "poin 2", "poin 3", "poin 4"]
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });

      const parsedData = JSON.parse(response.text || "{}");
      return res.json({ success: true, isFallback: false, diagnostic: parsedData });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Auto-Generate Progress Report Evaluation Endpoint
  app.post("/api/ai/generate-report-evaluation", async (req, res) => {
    try {
      const { athlete, periodLabel, periodType, scoringStats, attendanceStats } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isFallback: true,
          evaluation: {
            overallScore: 86,
            overallGrade: "A (Sangat Memuaskan)",
            pillarScores: {
              formThumbDraw: 88,
              accuracyConsistency: 84,
              endurance: 85,
              mentalFocus: 87,
              disciplineAttendance: attendanceStats?.attendanceRatePercent || 90,
              bowTuning: 86
            },
            coachFeedback: `Perkembangan ${athlete?.name || "Atlet"} selama periode ${periodLabel} menunjukkan progres yang sangat positif. Konsistensi tarikan thumb draw semakin stabil dan akurasi pada jarak target menengah telah mencapai standar kualifikasi.`,
            strengths: [
              "Kuncian jempol (Thumb Draw Lock) sangat kokoh dan minim getaran saat release.",
              "Ketahanan fisik (Endurance) mampu menyelesaikan 6 seri rambu tembakan tanpa penurunan akurasi.",
              "Disiplin kehadiran latihan rutin terjaga dengan baik."
            ],
            targets: [
              "Tingkatkan kecepatan blind nocking di bawah 2.5 detik per panah.",
              "Optimalkan dorongan khatra ke arah depan-bawah untuk mempercepat laju anak panah.",
              "Uji coba target scoring pada simulasi lomba resmi."
            ],
            recommendations: [
              "Latihan penguatan otot punggung (Rhomboid & Trapezius) 3x seminggu.",
              "Latihan blind nocking dengan mata tertutup 50 repetisi.",
              "Latihan scoring simulasi tanding dengan batasan waktu 30 detik per panah."
            ]
          }
        });
      }

      const prompt = `
Anda adalah Pelatih Kepala Klub Panahan Tradisional Seneng Manah.
Buat penilaian rapor komprehensif untuk atlet panahan Horse Bow berdasarkan data performa periode berikut:

DATA ATLET:
- Nama: ${athlete?.name || "Atlet"}
- Periode Rapor: ${periodLabel} (${periodType})
- Divisi: ${athlete?.division || "Horsebow"} - ${athlete?.ageCategory || "Senior/Umum"}
- Draw Weight: ${athlete?.equipment?.drawWeightLbs || 35} lbs
- Statistik Scoring Periode Ini: ${JSON.stringify(scoringStats || {})}
- Statistik Kehadiran: ${JSON.stringify(attendanceStats || {})}

Berikan balasan JSON dengan struktur berikut:
{
  "overallScore": 88,
  "overallGrade": "A (Sangat Memuaskan)",
  "pillarScores": {
    "formThumbDraw": 88,
    "accuracyConsistency": 85,
    "endurance": 84,
    "mentalFocus": 86,
    "disciplineAttendance": 90,
    "bowTuning": 85
  },
  "coachFeedback": "string (Evaluasi naratif 2-3 kalimat yang membangun, profesional, dan edukatif)",
  "strengths": ["poin kelebihan 1", "poin kelebihan 2", "poin kelebihan 3"],
  "targets": ["target capaian 1", "target capaian 2", "target capaian 3"],
  "recommendations": ["menu drill rekomendasi 1", "menu drill rekomendasi 2", "menu drill rekomendasi 3"]
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
      return res.json({ success: true, isFallback: false, evaluation: parsedData });
    } catch (error: any) {
      console.error("AI Report Evaluation error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Scoring Session Insights Endpoint
  app.post("/api/ai/scoring-insights", async (req, res) => {
    try {
      const { session, athlete } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          success: true,
          isFallback: true,
          insight: {
            summary: `Sesi ${session?.topic || "Latihan"} jarak ${session?.distanceMeters || 30}m mencatat total skor ${session?.totalScore || 0} poin (${session?.arrowsShotCount || 0} panah).`,
            rating: "Bagus",
            groupingQuality: "Terkumpul Baik",
            quickTip: "Fokuskan pandangan pada titik tengah target (spotting) sebelum memulai siklus tarikan tali busur."
          }
        });
      }

      const prompt = `
Berikan analisis coaching instan untuk 1 sesi penilaian panahan berikut:
- Topik Sesi: ${session?.topic || "Latihan Rutin"}
- Atlet: ${athlete?.name || "Atlet"} (${athlete?.division || "Horsebow"})
- Jarak: ${session?.distanceMeters || 30} meter
- Total Skor: ${session?.totalScore || 0}
- Jumlah Panah: ${session?.arrowsShotCount || 0}
- Rata-rata per panah: ${session?.averagePerArrow || 0}
- X Count / 10s: ${session?.xCount || 0}

Berikan respon JSON:
{
  "summary": "string (Evaluasi singkat 1-2 kalimat)",
  "rating": "Sangat Baik / Baik / Cukup",
  "groupingQuality": "string (Kualitas grouping)",
  "quickTip": "string (1 tips teknis krusial untuk sesi berikutnya)"
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
      return res.json({ success: true, isFallback: false, insight: parsedData });
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
