import os
import google.generativeai as genai

genai.configure(api_key=os.environ.get("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

ALLOWED_SESSION_TYPES = [
  "meeting",
  "discussion",
  "brainstorming",
  "decision_making",
  "planning",
  "review",
  "retrospective",
  "status_update",
  "interview",
  "training",
  "casual_chat",

  "product",
  "engineering",
  "design",
  "sales",
  "marketing",
  "finance",
  "operations",
  "hiring",
  "customer_support",
  "research",

  "decision_made",
  "problem_solving",
  "idea_generation",
  "alignment",
  "information_sharing",
  "prioritization",
  "feedback",
  "conflict_resolution",

  "formal",
  "informal",
  "structured",
  "unstructured",
  "recurring",
  "ad_hoc",

  "action_items_present",
  "deadlines_mentioned",
  "roadmap_discussed",
  "metrics_discussed",
  "blockers_discussed",
  "risks_discussed",
  "follow_up_required",

  "multi_party",
  "one_sided",
  "leadership_driven",
  "collaborative",
  "debate"
]


def infer_session_types_from_query(query: str) -> list[str]:
    """
    Infer likely session types from a user query.
    """

    prompt =f"""
   You are an expert intent extraction system for a conversation-memory application.

Your task is to analyze a USER QUERY and extract ALL RELEVANT SEMANTIC TAGS
that describe the kinds of conversation sessions the user is referring to.

This is NOT keyword matching.
You must infer intent, topic, structure, and signals even when they are implicit.

–––––––––––––––––––––––––––––––
TAGGING RULES (IMPORTANT)
–––––––––––––––––––––––––––––––

1. You MUST return MULTIPLE tags when applicable.
2. If the query is broad or vague, return broader tags.
3. If the query is specific, return more specific tags.
4. Do NOT invent tags outside the taxonomy.
5. Do NOT include tags that are not reasonably implied.

7. Output MUST be valid JSON only. No text, no explanations.

–––––––––––––––––––––––––––––––
TAG TAXONOMY (USE ONLY THESE)
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

–––––––––––––––––––––––––––––––
OUTPUT FORMAT (STRICT)
–––––––––––––––––––––––––––––––
Return ONLY a JSON array of tags.
Example:
["product_discussion", "meeting"]

Do NOT include:
- explanations
- confidence scores
- rationale
- extra fields
- markdown

–––––––––––––––––––––––––––––––
USER QUERY:
–––––––––––––––––––––––––––––––

{query}
"""


    response = model.generate_content(prompt)

    return _safe_parse_array(response.text)


def _safe_parse_array(text: str) -> list[str]:
    import json, re
    match = re.search(r"\[.*\]", text, re.S)
    if not match:
        return []
    result = json.loads(match.group())
    return [r for r in result if r in ALLOWED_SESSION_TYPES]
