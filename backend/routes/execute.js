import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const router = express.Router();

router.post("/", (req, res) => {
  const { language, sourceCode, files } = req.body;
  const code = (files && files[0] && files[0].content) || sourceCode || "";
  const lang = (language || "java").toLowerCase().trim();

  if (!code.trim()) {
    return res.json({ run: { output: "Error: No source code provided.", code: 1 } });
  }

  const tmpDir = os.tmpdir();
  const runId = Date.now();

  // ── PYTHON ───────────────────────────────────────────────────────────────
  if (lang === "python" || lang === "py") {
    const pyFile = path.join(tmpDir, `script_${runId}.py`);
    fs.writeFileSync(pyFile, code, "utf8");

    exec(`python "${pyFile}"`, { timeout: 7000 }, (error, stdout, stderr) => {
      try { if (fs.existsSync(pyFile)) fs.unlinkSync(pyFile); } catch (_) {}

      if (error) {
        if (error.killed || error.signal === "SIGTERM") {
          return res.json({ run: { output: "Time Limit Exceeded (7s)", code: 1 } });
        }
        return res.json({ run: { output: (stderr || stdout || error.message).trim(), code: 1 } });
      }
      return res.json({ run: { output: (stdout || "Program completed successfully.").trim(), code: 0 } });
    });

  // ── JAVASCRIPT ───────────────────────────────────────────────────────────
  } else if (lang === "javascript" || lang === "js") {
    const jsFile = path.join(tmpDir, `script_${runId}.js`);
    fs.writeFileSync(jsFile, code, "utf8");

    exec(`node "${jsFile}"`, { timeout: 5000 }, (error, stdout, stderr) => {
      try { if (fs.existsSync(jsFile)) fs.unlinkSync(jsFile); } catch (_) {}

      if (error) {
        if (error.killed || error.signal === "SIGTERM") {
          return res.json({ run: { output: "Time Limit Exceeded (5s)", code: 1 } });
        }
        return res.json({ run: { output: (stderr || stdout || error.message).trim(), code: 1 } });
      }
      return res.json({ run: { output: (stdout || "Program completed successfully.").trim(), code: 0 } });
    });

  // ── C++ ──────────────────────────────────────────────────────────────────
  } else if (lang === "cpp" || lang === "c++" || lang === "c") {
    const cppFile = path.join(tmpDir, `main_${runId}.cpp`);
    const exeFile = path.join(tmpDir, `main_${runId}.exe`);
    fs.writeFileSync(cppFile, code, "utf8");

    exec(`g++ "${cppFile}" -o "${exeFile}" && "${exeFile}"`, { timeout: 7000 }, (error, stdout, stderr) => {
      try { if (fs.existsSync(cppFile)) fs.unlinkSync(cppFile); } catch (_) {}
      try { if (fs.existsSync(exeFile)) fs.unlinkSync(exeFile); } catch (_) {}

      if (error) {
        if (error.code === "ENOENT" || (error.message && error.message.includes("not found"))) {
          return res.json({
            run: {
              output: "C++ compiler (g++) is not detected in host system PATH. Please select Java, Python, or JavaScript.",
              code: 1,
            },
          });
        }
        if (error.killed || error.signal === "SIGTERM") {
          return res.json({ run: { output: "Time Limit Exceeded (7s)", code: 1 } });
        }
        return res.json({ run: { output: (stderr || stdout || error.message).trim(), code: 1 } });
      }
      return res.json({ run: { output: (stdout || "Program completed successfully.").trim(), code: 0 } });
    });

  // ── JAVA (default) ───────────────────────────────────────────────────────
  } else {
    const classMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
    const className = classMatch ? classMatch[1] : "Solution";
    const javaFile = path.join(tmpDir, `${className}.java`);
    const classFile = path.join(tmpDir, `${className}.class`);

    let finalCode = code;
    if (!code.includes("class ")) {
      finalCode = `public class ${className} {\n  public static void main(String[] args) {\n    ${code}\n  }\n}`;
    }

    try {
      fs.writeFileSync(javaFile, finalCode, "utf8");
    } catch (e) {
      return res.json({ run: { output: "File write error: " + e.message, code: 1 } });
    }

    const cmd = `javac "${javaFile}" && java -cp "${tmpDir}" ${className}`;

    exec(cmd, { timeout: 7000 }, (error, stdout, stderr) => {
      try { if (fs.existsSync(javaFile)) fs.unlinkSync(javaFile); } catch (_) {}
      try { if (fs.existsSync(classFile)) fs.unlinkSync(classFile); } catch (_) {}

      if (error) {
        if (error.killed || error.signal === "SIGTERM") {
          return res.json({ run: { output: "Time Limit Exceeded (7s)", code: 1 } });
        }
        return res.json({ run: { output: (stderr || stdout || error.message).trim(), code: 1 } });
      }
      return res.json({ run: { output: (stdout || "Program completed successfully.").trim(), code: 0 } });
    });
  }
});

export default router;
