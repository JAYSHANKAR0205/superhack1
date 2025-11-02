import os
import random
import json
from typing import List, Dict

from langchain_ollama import OllamaLLM

# Initialize Ollama LLM (you can change the model name)
llm = OllamaLLM(model="llama3")  # or "mistral", "phi3", etc.


def draft_email_via_llm(asset: Dict) -> Dict:
    """
    Draft a polite recovery email for the given asset using Ollama (local model).
    """
    subject = f"Regarding your company asset: {asset.get('name') or asset.get('asset_id')}"
    
    prompt = (
        f"Draft a polite, concise recovery email to {asset.get('owner') or 'the owner'} "
        f"({asset.get('owner_email', 'unknown email')}) about asset {asset.get('asset_id')} "
        f"({asset.get('name', '')}) last seen on {asset.get('last_seen', 'unknown')}. "
        "Include a suggested next step and a friendly closing."
    )
    
    try:
        response = llm.invoke(prompt)
        body = response.strip()
    except Exception as e:
        print(" Ollama generation failed, using fallback:", e)
        body = (
            f"Hi {asset.get('owner') or 'there'},\n\n"
            f"Our records show that the device {asset.get('name') or asset.get('asset_id')} "
            f"was last seen at {asset.get('last_seen') or 'an unknown time'}. "
            "If you still have it, please confirm. If not, please reply with any info you have "
            "about its whereabouts so we can take the next steps to recover it.\n\n"
            "Next step: reply to this email or visit the asset portal to confirm its status.\n\n"
            "Thanks,\nAsset Recovery Team"
        )

    return {"subject": subject, "body": body, "to": asset.get("owner_email")}


def answer_chat_via_llm(query: str, context: str) -> str:
    """
    Answer user queries about assets using local Ollama model.
    """
    prompt = (
        "You are an assistant that helps with IT asset recovery. "
        "Use only the provided context below to answer the user's question.\n\n"
        f"Context:\n{context}\n\nQuestion: {query}"
    )

    try:
        response = llm.invoke(prompt)
        return response.strip()
    except Exception as e:
        print(" Ollama chat failed, using heuristic fallback:", e)

    # Simple fallback rules if Ollama is unavailable
    lowered = query.lower()
    if "owner" in lowered:
        return "Owner: Based on the context, the owner appears to be " + (context.split("owner:")[-1].split("\n")[0].strip() or "unknown")
    if "last-seen" in lowered or "last seen" in lowered:
        return "Last seen: " + (context.split("last_seen:")[-1].split("\n")[0].strip() or "unknown")
    if "disposition" in lowered:
        return "Suggested disposition: Attempt outreach; if no response in 7 days, escalate to IT asset disposal."
    return "I couldn't find a direct answer in the context. Based on the available asset data, consider outreach and manual verification."


def rag_context_for_assets(assets: List[Dict]) -> str:
    """
    Build a compact context string from a list of assets.
    """
    parts = []
    for a in assets:
        parts.append(
            f"asset_id: {a.get('asset_id')}\n"
            f"name: {a.get('name')}\n"
            f"owner: {a.get('owner')}\n"
            f"owner_email: {a.get('owner_email')}\n"
            f"last_seen: {a.get('last_seen')}\n"
            f"status: {a.get('status')}\n"
            f"value_estimate: {a.get('value_estimate')}\n"
            f"disposition: {a.get('disposition_suggestion')}\n"
        )
    return "\n---\n".join(parts)
