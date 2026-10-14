import axios from "axios";

export const executeCode = async (language, sourceCode) => {
  const lang = (language || "java").toLowerCase().trim();
  const code = sourceCode || "";

  try {
    const response = await axios.post("https://devsync-backend-tbv2.onrender.com/api/execute", {
      language: lang,
      sourceCode: code,
      files: [{ content: code }],
    });

    return response.data;
  } catch (error) {
    const out =
      error.response?.data?.run?.output ||
      error.response?.data?.message ||
      error.message;
    return {
      run: {
        output: "Execution failed: " + out,
        code: 1,
      },
    };
  }
};

