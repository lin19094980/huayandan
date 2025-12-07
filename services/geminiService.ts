import { GoogleGenAI } from "@google/genai";
import { FileRecord, PatientInfo, AnalysisRecord } from "../types";

// Helper to strip base64 prefix for Gemini API
const stripBase64Prefix = (base64: string) => {
  return base64.split(',')[1];
};

export const analyzeLabReports = async (files: FileRecord[], patientInfo?: PatientInfo): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please configure the environment.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Prepare parts
  const parts = files.map(file => ({
    inlineData: {
      mimeType: file.type,
      data: stripBase64Prefix(file.data)
    }
  }));

  // Build patient info string
  let patientContext = "";
  if (patientInfo) {
    const infos = [];
    if (patientInfo.name) infos.push(`姓名: ${patientInfo.name}`);
    if (patientInfo.age) infos.push(`年龄: ${patientInfo.age}`);
    if (patientInfo.gender) infos.push(`性别: ${patientInfo.gender}`);
    if (patientInfo.diagnosis) infos.push(`临床诊断/主诉: ${patientInfo.diagnosis}`);
    
    if (infos.length > 0) {
      patientContext = `\n### 患者基本信息\n${infos.join('\n')}\n`;
    }
  }

  // Add text prompt
  const promptPart = {
    text: `你是一位经验丰富的临床医学专家和病理学家。请分析所提供的化验单图片/PDF。${patientContext}
    
    请严格按照以下结构输出分析结果（使用Markdown格式）：

    ### 1. 基本信息摘要
    *   **检测项目**: (例如：血常规、肝功能、肾功能、尿常规等。请务必用一句话总结主要项目)
    *   **样本日期**: (如果可见，不可见则写未注明)

    ### 2. 异常指标分析
    请列出所有超出正常参考范围的指标。如果没有异常，请明确说明。
    *   **指标名称**: [数值] (参考范围: [范围]) [偏高/偏低]
    *   *临床意义*: 简要解释该指标异常可能代表的含义。

    ### 3. 综合解读与可能风险
    基于上述结果${patientInfo ? '及患者信息' : ''}，结合医学知识进行逻辑推理：
    *   这些结果组合起来可能指向什么健康问题？(例如：细菌感染、贫血、肝损伤等)
    *   目前的严重程度评估。

    ### 4. 建议与下一步
    *   生活方式建议（饮食、休息等）。
    *   是否需要复查或进一步检查（如CT、B超）。
    *   **免责声明**: 必须包含一句提示，强调本结果由AI生成，仅供参考，不能替代医生诊断。

    请确保语气专业、客观，但也通俗易懂。如果图片模糊无法识别，请直接指出。`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [...parts, promptPart]
      },
      config: {
        temperature: 0.2, // Low temperature for more analytical/factual output
      }
    });

    return response.text || "无法生成分析结果，请重试。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("分析过程中发生错误，请检查网络或图片质量。");
  }
};

export const compareLabReports = async (record1: AnalysisRecord, record2: AnalysisRecord): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Format dates for the prompt
  const date1 = new Date(record1.timestamp).toLocaleDateString();
  const date2 = new Date(record2.timestamp).toLocaleDateString();

  // We primarily rely on the previous analysis text to save tokens and latency, 
  // as it already contains the extracted values.
  const prompt = `你是一位专业的医学顾问。请对比以下两份化验单的解读记录，找出重要的病情变化。

  === 化验单 A (日期: ${date1}) ===
  ${record1.analysisResult}
  
  === 化验单 B (日期: ${date2}) ===
  ${record2.analysisResult}

  请生成一份对比分析报告，严格遵循以下规则：
  1.  **只列出不合理或显著的变化**：忽略正常的生理波动或微小的数值差异。
  2.  **变化解读**：对于列出的每一项变化，请说明其临床意义（例如：病情好转、恶化、出现新并发症、药物起效等）。
  3.  如果两份报告主要项目不同（无法对比），请明确指出。
  
  输出格式建议（Markdown）：
  
  ### 📊 重点指标变化
  *   **[指标名称]**: [化验单A数值] -> [化验单B数值]
      *   *解读*: ...

  ### 💡 综合趋势分析
  ...

  ### 📝 建议
  ...
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.2,
      }
    });
    return response.text || "无法生成对比结果。";
  } catch (error) {
    console.error("Gemini Comparison Error:", error);
    throw new Error("对比分析失败，请稍后重试。");
  }
};