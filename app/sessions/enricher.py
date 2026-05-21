import os
import google.generativeai as genai
from app.db.mongo import sessions_collection

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")


def enrich_session(
    session_id: str,
    transcript_snippets: list[str]
):
    """
    Generate session title, type, tags, and summary from transcript snippets.
    """

    # Limit context (important for cost + quality)
    context = "\n".join(transcript_snippets)  # Increased for better summaries

    prompt = f"""
You are analyzing a conversation transcript.

TASKS:
1. Generate a short session title (max 6 words)
2.You are an expert conversation analyst.

Your task is to analyze a conversation transcript and assign HIGH-QUALITY, SEMANTIC TAGS
that describe the nature of the discussion.

These tags will be used by a system to:
- classify conversations
- recognize meeting types
- answer queries like “yesterday’s product discussion”
- group similar sessions
- improve retrieval accuracy

This is NOT keyword extraction.
This is INTENT and CONTEXT understanding.

–––––––––––––––––––––––––––––––
TAGGING GUIDELINES (VERY IMPORTANT)
–––––––––––––––––––––––––––––––

1. You MUST assign MULTIPLE tags.
   • Typical sessions have 5–12 tags.
   • If fewer than 5 apply, you are under-tagging.

2. Tags must describe:
   • what type of conversation this is
   • what it is about
   • why it happened
   • how it was conducted
   • what outcomes or signals are present

3. Do NOT invent facts.
   • Only tag what is clearly implied or discussed.

4. Do NOT rely on keywords like “meeting”, “standup”, “call”.
   • Infer intent from the conversation itself.

5. Tags should be selected from the taxonomy below.
   • Do not create new tags unless absolutely necessary.

–––––––––––––––––––––––––––––––
TAG TAXONOMY (USE THESE)
–––––––––––––––––––––––––––––––

Conversation Type:
- meeting
- discussion
- brainstorming
- decision_making
- planning
- review
- retrospective
- status_update
- interview
- training
- casual_chat

Domain / Topic:
- product
- engineering
- design
- sales
- marketing
- finance
- operations
- hiring
- customer_support
- research

Intent / Outcome:
- decision_made
- problem_solving
- idea_generation
- alignment
- information_sharing
- prioritization
- feedback
- conflict_resolution

Structure / Formality:
- formal
- informal
- structured
- unstructured
- recurring
- ad_hoc

Signals / Indicators:
- action_items_present
- deadlines_mentioned
- roadmap_discussed
- metrics_discussed
- blockers_discussed
- risks_discussed
- follow_up_required

Participation Style:
- multi_party
- one_sided
- leadership_driven
- collaborative
- debate
3. For the session_type field in the json object use the categories listed below:
Conversation Type:
- meeting
- discussion
- brainstorming
- decision_making
- planning
- review
- retrospective
- status_update
- interview
- training
- casual_chat





4.FOLLOW THESE RULES FOR SUMMARY GENERATION:
### **SYSTEM / ROLE**

You are an expert **conversation intelligence, meeting analysis, and knowledge extraction system**.
You specialize in extracting structured, actionable, and recall-ready information from conversational transcripts generated from audio.

The transcript may be:

* Informal, noisy, or partially incomplete
* Multi-speaker or single-speaker
* Contain implicit goals, decisions, or commitments

Your task is to extract **maximum useful information** while remaining factual and concise.

---

## 🔹 INPUT

* A conversational transcript derived from audio.
* Speaker labels, timestamps, or roles may or may not be present.
* Commitments and intent may be implied rather than explicitly stated.

---

## 🔹 OUTPUT REQUIREMENTS

* Use the headings **exactly as defined below**
* Do **not** invent facts
* If a section is not applicable, write `None`
* Prefer clarity, structure, and signal density over verbosity

---

## 🔹 OUTPUT STRUCTURE (MANDATORY)

---

### **1. High-Level Summary**

A concise paragraph (3–5 lines) answering:

* What this conversation was about
* Why it took place
* The dominant mode (planning, problem-solving, brainstorming, decision-making, review)

---

### **2. Primary Objectives**

List:

* Explicit objectives stated by participants
* Strongly implied objectives if clearly inferable

---

### **3. Key Topics & Themes**

Bullet points listing:

* Major subjects discussed
* Subtopics that received meaningful attention
* Recurring or emphasized ideas

---

### **4. Important Discussion Points**

Bullet points capturing:

* Key arguments, ideas, or explanations
* Trade-offs or alternatives discussed
* Constraints, risks, or blockers raised
* Open questions that remained unresolved

---

### **5. Decisions & Agreements**

List:

* Decisions finalized
* Agreements reached
* Rejected options (if explicitly stated)

If none, write: `No explicit decisions were finalized`.

---

### **6. Action Items**

Bullet points in the format:

* **Task** – Owner (if identifiable) – Deadline or timeframe (if mentioned or implied)

Include only concrete, actionable tasks.

---

### **7. Commitments & Promises**

List any:

* Explicit promises
* Voluntary ownership taken
* Implied commitments inferred from strong intent statements

---

### **8. Follow-Ups, Deadlines & Reminders**

List:

* Scheduled meetings or check-ins
* Deadlines or review points
* Time-based reminders (e.g., “next Friday”, “by end of sprint”)

---

### **9. Participants & Roles**

List:

* Identifiable participants and their roles (if known)
* Otherwise: `Multiple unidentified participants`

---

### **10. Decisions Pending / Open Items**

List:

* Topics requiring further discussion
* Decisions that were deferred
* Information still needed to proceed

---

### **11. Risks, Blockers & Dependencies**

Capture:

* Risks mentioned
* Blockers preventing progress
* Dependencies on people, teams, or external events

---

### **12. Signals & Metadata Worth Indexing**

Extract high-value signals such as:

* Metrics or KPIs referenced
* Timelines or roadmap mentions
* Priority or urgency indicators
* Confidence vs uncertainty in statements

---

### **13. Conversation Dynamics (Optional but Valuable)**

Briefly note:

* Collaboration level (collaborative, debate-heavy, leadership-driven)
* Participation balance (one-sided vs multi-party)
* Emotional or tonal cues if clearly present (e.g., tension, alignment, urgency)

---

### **14. One-Line Takeaway**

A single sentence capturing the most important outcome or insight from the conversation.

---

## 🔹 GUIDING PRINCIPLES

* Extract **facts first**, then **clearly labeled inferences**
* Avoid redundancy
* Treat this output as:

  * A future memory
  * A searchable artifact
  * A decision log
  * A task tracker input
 ### SUMMARY  MUST be a single string.
 ### SUMMARY MUST BE AT LEAST 3 well-formed paragraphs worth of content, but return it as ONE string.
 

## 🔹 OUTPUT FORMAT REQUIREMENTS (MANDATORY)

* The entire output must be **one single string**
* Use **clear title headers** (plain text, no markdown symbols)
* Under each header, use bullet points (`-`)
* If a section has no information, write `None`
* Be concise, factual, and high-signal
* Do not invent information

---

## 🔹 REQUIRED SECTIONS (USE THESE HEADERS EXACTLY)

Conversation Overview

* High-level summary of what the conversation was about
* Overall purpose and tone of the discussion

Objectives

* Explicit and clearly implied goals of the conversation

Key Topics Discussed

* Main themes and areas of discussion
* Important advice, explanations, or viewpoints shared

Action Items

* Concrete tasks or next steps
* Include owner and timing if mentioned or implied

Commitments & Promises

* Any promises, assurances, or responsibilities accepted by participants

Decisions Made

* Any conclusions, agreements, or decisions finalized
* If none, explicitly state that

Follow-Ups & Reminders

* Future meetings, deadlines, or time-based commitments
* Example: “meeting next Thursday”, “share document later”

People Involved

* Participants and their roles or relationships (if identifiable)

Important Context & Insights

* Non-obvious but useful takeaways
* Strategic advice, advantages, risks, or guiding principles mentioned

One-Line Takeaway

* A single sentence capturing the most important outcome or insight from the conversation

---

## 🔹 GUIDELINES FOR THE MODEL

* Extract both **explicit statements** and **strongly implied information**
* Prioritize actionable and recall-worthy details
* Preserve semantic meaning over exact phrasing
* Treat this summary as something that may be used later for:

  * Career tracking
  * Decision recall
  * Task follow-up
  * Knowledge retrieval

---






---

## 🔹 TRANSCRIPT:
{context}




Respond in strict JSON:
{{
  "title": "...",
  "session_type": "...",
  "tags": ["...", "..."],
  "summary": "..."(Summary should be one long string object, do not split it into multiple objects)
}}
"""

    response = model.generate_content(prompt)
    print("RAW LLM RESPONSE ↓↓↓")
    print(response.text)
    print("↑↑↑ RAW LLM RESPONSE")

    result = _safe_parse_json(response.text)

    sessions_collection.update_one(
        {"session_id": session_id},
        {
            "$set": {
                "title": result["title"],
                "session_type": result["session_type"],
                "tags": result["tags"],
                "summary": result["summary"],
                "auto_named": True,
            }
        },
    )

    return result


def generate_summary(session_id: str, transcript_snippets: list[str]) -> str:
    """
    Generate or update a summary for an existing session.
    Can be called independently of enrich_session.
    """
    if not transcript_snippets:
        return "No transcript available for summarization."

    # Use more context for summaries (up to 100 snippets for better quality)
    context = "\n".join(transcript_snippets[:300])

    prompt = f"""

**SYSTEM / TASK PROMPT**

You are an expert conversation summarization and information extraction assistant.

Your task is to analyze a conversational transcript and generate a **clear, structured, and information-dense summary**.
The summary must be written as **one continuous string**, but internally organized using **clear title headers and bullet points**.

Do **not** include markdown symbols like `##` or numbering before headers.
Each section should begin with a **plain text title header**, followed by bullet points.

---

## 🔹 OUTPUT FORMAT REQUIREMENTS (MANDATORY)

* The entire output must be **one single string**
* Use **clear title headers** (plain text, no markdown symbols)
* Under each header, use bullet points (`-`)
* If a section has no information, write `None`
* Be concise, factual, and high-signal
* Do not invent information

---

## 🔹 REQUIRED SECTIONS (USE THESE HEADERS EXACTLY)

Conversation Overview

* High-level summary of what the conversation was about
* Overall purpose and tone of the discussion

Objectives

* Explicit and clearly implied goals of the conversation

Key Topics Discussed

* Main themes and areas of discussion
* Important advice, explanations, or viewpoints shared

Action Items

* Concrete tasks or next steps
* Include owner and timing if mentioned or implied

Commitments & Promises

* Any promises, assurances, or responsibilities accepted by participants

Decisions Made

* Any conclusions, agreements, or decisions finalized
* If none, explicitly state that

Follow-Ups & Reminders

* Future meetings, deadlines, or time-based commitments
* Example: “meeting next Thursday”, “share document later”

People Involved

* Participants and their roles or relationships (if identifiable)

Important Context & Insights

* Non-obvious but useful takeaways
* Strategic advice, advantages, risks, or guiding principles mentioned

One-Line Takeaway

* A single sentence capturing the most important outcome or insight from the conversation

---

## 🔹 GUIDELINES FOR THE MODEL

* Extract both **explicit statements** and **strongly implied information**
* Prioritize actionable and recall-worthy details
* Preserve semantic meaning over exact phrasing
* Treat this summary as something that may be used later for:

  * Career tracking
  * Decision recall
  * Task follow-up
  * Knowledge retrieval

---

## 🔹 TRANSCRIPT

```
{context}
```

---



"""

    response = model.generate_content(prompt)
    summary = response.text.strip()

    # Update the session with the summary
    sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": {"summary": summary}}
    )

    return summary


def _safe_parse_json(text: str) -> dict:
    """
    Defensive JSON parsing for LLM output.
    """
    import json
    import re

    match = re.search(r"\{.*\}", text, re.S)
    if not match:
        raise ValueError("LLM did not return JSON")

    return json.loads(match.group())
