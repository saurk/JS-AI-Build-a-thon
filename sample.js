import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import fs from "fs";
import path from "path";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.github.ai/inference";
const modelName = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

export async function main() {
  // Read image as base64
  const imagePath = path.join(process.cwd(), "contoso_layout_sketch.jpg");
  const imageData = fs.readFileSync(imagePath).toString("base64");
  const imageUrl = `data:image/jpeg;base64,${imageData}`;

  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: [
            { type: "text", text: "Generate a HTML / CSS webpage based on the hand drawn image." },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 2000,
      model: modelName
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});