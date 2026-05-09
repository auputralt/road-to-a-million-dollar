import { chatCompletion, type ChatMessage } from "@/lib/openrouter";

const SYSTEM_PROMPT = `You are a CRM-savvy contact agent. Given a task description and a list of available contacts, recommend who to reach out to and draft a brief outreach message.
Respond in plain text, structured with clear sections: Recommended Contact, Outreach Draft, Follow-up Plan.`;

export async function getContactRecommendation(taskDescription: string, contacts: any[], clientProvider?: string, clientKey?: string): Promise<string> {
  const contactList = contacts.length > 0 
    ? contacts.map(c => `- ${c.name} | ${c.email ?? "no email"} | Tag: ${c.tag ?? "none"} | Notes: ${c.notes ?? "none"}`).join("\n") 
    : "No contacts in database yet.";

  const messages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: `Task: "${taskDescription}"\n\nAvailable contacts:\n${contactList}\n\nRecommend who to contact and draft the outreach.` },
  ];
  return chatCompletion(messages, undefined, clientProvider, clientKey);
}
