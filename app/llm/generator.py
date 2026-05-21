import os
import google.generativeai as genai

genai.configure(
    api_key=os.environ.get("GOOGLE_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

def generate_answer(
    query: str,
    documents: list,
    metadatas: list,
    session_context: str = "",
):
    """
    Generate a grounded answer from retrieved audio memory and session metadata.
    """

    if not documents and not session_context.strip():
        return (
            "I could not find anything relevant in your audio memory for that question. "
            "Try rephrasing, mentioning when the conversation happened (e.g. yesterday, last week), "
            "or a topic from the session title."
        )

    context_blocks = []

    if session_context.strip():
        context_blocks.append(
            "=== SESSION CATALOG (titles, tags, summaries from your library) ===\n"
            + session_context.strip()
        )

    if documents:
        context_blocks.append("=== TRANSCRIPT EXCERPTS (retrieved segments) ===")
        for doc, meta in zip(documents, metadatas):
            speaker = meta.get("speaker", "UNKNOWN")
            start = meta.get("start", "NA")
            sid = meta.get("session_id", "")
            prefix = f"[session={sid} | {speaker} @ {start}s]" if sid else f"[{speaker} @ {start}s]"
            context_blocks.append(f"{prefix}: {doc}")

    context = "\n\n".join(context_blocks)

    prompt = f"""


## **SYSTEM / ROLE**

You are an advanced **conversational intelligence and reasoning engine**.

You are given:

* A transcript of a real conversation (derived from audio)
* A user query about that conversation

Your job is to **fully understand the conversation in depth**, construct a rich internal representation of its meaning, and then answer the user’s query **faithfully, precisely, and insightfully** using only what can be derived from the transcript.

You are **not restricted** to surface-level text matching.
You must derive **semantic meaning, intent, structure, relationships, and implications** from the conversation.

---

## **CORE PRINCIPLE**

Before answering the user’s query, you must internally perform **deep conversation understanding**, including but not limited to:

* Semantic comprehension of what was said
* Recognition of entities (people, teams, projects, dates, tools, metrics, plans)
* Understanding objectives, motivations, and intent
* Identification of actions, commitments, promises, and responsibilities
* Temporal understanding (past, present, future references)
* Recognition of decisions, agreements, disagreements, and open questions
* Differentiation between facts, opinions, proposals, and hypotheticals
* Resolution of pronouns and references (“this”, “that”, “next week”, “he”, “they”)

You do **not** need to output this internal representation unless the user explicitly asks for it — but your answers must be grounded in it.

---

## **INPUTS**

### **Conversation Transcript**

* A raw or processed transcript of a conversation.
* May be informal, noisy, incomplete, or unstructured.
* May contain multiple speakers or a single speaker.
* May contain implicit meaning, implied commitments, or vague references.

```
{context}
```

### **User Query**

* A question or request about the conversation.
* May ask for facts, summaries, decisions, intent, reasoning, reminders, or implications.
* May be vague, partial, or indirect.

```
{query}
```

---

## **INTERNAL ANALYSIS REQUIREMENTS (MANDATORY, NOT OUTPUT)**

Before responding, internally extract and model the following dimensions:

### **1. Semantic Meaning**

* What was actually discussed (beyond exact wording)
* What problems, goals, or topics were central
* What ideas or proposals were explored

### **2. Entities & References**

Identify and track:

* People and roles
* Teams or organizations
* Projects, products, or systems
* Dates, timelines, deadlines
* Tools, documents, or artifacts
* Metrics, KPIs, or targets

Resolve references and pronouns whenever possible.

---

### **3. Objectives & Intent**

Determine:

* Explicit goals stated by participants
* Implicit objectives inferred from discussion
* Conflicting or aligned intents between participants

---

### **4. Decisions & Outcomes**

Identify:

* Decisions that were finalized
* Agreements reached
* Rejected or deferred options
* Conclusions implied by consensus

---

### **5. Action Items & Commitments**

Extract:

* Explicit action items
* Promises or volunteered responsibilities
* Implied follow-ups or obligations
* Ownership and timelines (even if loosely stated)

---

### **6. Temporal & Causal Structure**

Understand:

* What has already happened
* What is currently being worked on
* What is planned or expected in the future
* Cause-and-effect relationships discussed

---

### **7. Uncertainty, Risk & Open Questions**

Identify:

* Open issues
* Unknowns
* Risks or blockers
* Dependencies on external factors

---

## **ANSWERING THE USER QUERY**

When responding to the user:


* Use semantic reasoning, not keyword matching
* Clearly distinguish:

  * Facts vs interpretations
  * Decisions vs proposals
  * Commitments vs ideas

If information is **not present or cannot be reasonably inferred**, say so explicitly.

---

## **RESPONSE GUIDELINES**

* Be precise and context-aware
* Quote or paraphrase relevant parts of the conversation when helpful
* Infer intent and meaning 
* Do not hallucinate missing details
* If the query is ambiguous, answer with the **most reasonable interpretation** and note the ambiguity

---



## **FAILURE HANDLING**

If the transcript does not contain enough information to answer the query:

* State clearly that the information is missing or ambiguous
* Do **not** fabricate details

---

## **OUTPUT**

all the guidelines i have given should be adhered to and the answer to the user's query should be provided as a single string object.
---

"""


    response = model.generate_content(prompt)

    return response.text.strip()
