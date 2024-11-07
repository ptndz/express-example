import axios from "axios";
import * as cheerio from "cheerio";

async function fetchHTML(url: string): Promise<string> {
  try {
    const { data } = await axios.get<string>(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
    });
    return data;
  } catch (error: any) {
    console.error("Lỗi khi lấy nội dung từ URL:", error.message);
    throw error;
  }
}

/**
 * Trích xuất văn bản chính từ HTML
 * @param html - Nội dung HTML
 * @returns Văn bản trích xuất
 */
function extractText(html: string): string {
  const $ = cheerio.load(html);

  // Loại bỏ các thẻ không cần thiết
  $("script, style, nav, footer, header, aside").remove();

  // Trích xuất văn bản từ các thẻ <p>
  let text = "";
  $("p").each((_, elem) => {
    text += $(elem).text() + "\n";
  });

  // Nếu không tìm thấy văn bản trong các thẻ <p>, lấy toàn bộ văn bản
  if (!text.trim()) {
    text = $("body").text();
  }

  // Loại bỏ các khoảng trắng thừa
  text = text.replace(/\s+/g, " ").trim();

  return text;
}

/**
 * Hàm chính để tóm tắt một trang web
 * @param url - URL của trang web
 * @returns Bản tóm tắt
 */
export async function summarizeWebpage(url: string): Promise<{
  text: string;
  translated_text: string;
} | null> {
  try {
    const { data } = await axios.post("http://127.0.0.1:8000/summarize/", {
      url,
    });

    return data;
  } catch (error) {
    return null;
  }
}

export async function chatOpenAI(prompt: string) {
  try {
    const { data } = await await axios.post(
      `http://localhost:8001/v1/chat/completions`,
      {
        // model: 'gpt-3.5-turbo',
        model: "gpt-4-1106-preview",
        messages: prompt,
        temperature: 0.9,
        max_tokens: 150,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return data;
  } catch (error) {
    return null;
  }
}
