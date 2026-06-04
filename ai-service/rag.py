import os
import re
import json
import urllib.request
import urllib.error
import hashlib
import time
from typing import List, Dict, Any, Optional

import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from utils import clean_text

# Optional NLTK WordNet for simple query expansion (synonyms)
try:
    import nltk  # noqa: F401
    from nltk.corpus import wordnet as wn
except Exception:
    wn = None

def chunk_text(text: str, max_words: int = 120, overlap: int = 30) -> List[str]:
    """
    Create overlapping, sentence-aware chunks using a sliding window.
    Overlap helps preserve context and improves retrieval recall for short queries.
    """
    if not text:
        return []

    cleaned = re.sub(r"\s+", " ", text.strip())
    sentences = re.split(r'(?<=[.!?])\s+', cleaned)
    if not sentences:
        return [cleaned]

    chunks: List[str] = []

    def words_of(sent_list):
        return sum(len(s.split()) for s in sent_list)

    i = 0
    while i < len(sentences):
        current = []
        current_count = 0
        j = i
        while j < len(sentences) and current_count + len(sentences[j].split()) <= max_words:
            current.append(sentences[j].strip())
            current_count = words_of(current)
            j += 1

        if current:
            chunk = " ".join(current).strip()
            chunks.append(chunk)

        # Advance by window minus overlap to create overlapping chunks
        if j == i:
            i += 1
        else:
            i = max(i + 1, j - overlap)

    # Remove extremely short chunks
    chunks = [c for c in chunks if len(c.split()) > 8]
    return chunks

def retrieve_relevant_chunks(query: str, chunks: List[str], top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Prefer semantic retrieval using embeddings (OpenAI or local SentenceTransformer) when available.
    Falls back to TF-IDF + cosine similarity if embeddings are not available.
    """
    if not chunks or not query:
        return []
    try:
        proc_chunks = [clean_text(c) for c in chunks]
        proc_query = clean_text(query)
        # Expand query with synonyms when possible to improve recall
        try:
            proc_query = _expand_query(proc_query)
        except Exception:
            pass

        # Try embeddings first (OpenAI or local SentenceTransformer)
        embeddings = _get_or_build_embeddings(proc_chunks)
        query_emb = _embed_query(proc_query)

        if embeddings is not None and query_emb is not None:
            # Compute cosine similarities in numpy
            emb_arr = np.array(embeddings)
            q = np.array(query_emb)
            # Normalize
            emb_norm = emb_arr / (np.linalg.norm(emb_arr, axis=1, keepdims=True) + 1e-8)
            q_norm = q / (np.linalg.norm(q) + 1e-8)
            sims = (emb_norm @ q_norm).flatten()
            ranked_indices = np.argsort(sims)[::-1]

            results: List[Dict[str, Any]] = []
            for idx in ranked_indices[:min(max(top_k, 10), len(ranked_indices))]:
                score = float(sims[idx])
                results.append({"chunk": chunks[int(idx)], "score": score})

            # Try to re-rank with a Cross-Encoder for better precision if available
            try:
                reranked = _rerank_with_cross_encoder(results, proc_query, top_k=top_k)
                if reranked:
                    return reranked
            except Exception:
                pass

            return results[:top_k]

        # Fallback to TF-IDF if embeddings unavailable
        vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1,2), max_features=5000)
        tfidf_matrix = vectorizer.fit_transform(proc_chunks)
        query_vec = vectorizer.transform([proc_query])

        similarities = cosine_similarity(query_vec, tfidf_matrix).flatten()
        ranked_indices = similarities.argsort()[::-1]

        results = []
        for idx in ranked_indices[:min(top_k, len(ranked_indices))]:
            score = float(similarities[idx])
            results.append({"chunk": chunks[idx], "score": score})

        return results
    except Exception as e:
        print(f"Error in chunk retrieval: {e}")
        # Simple lexical fallback
        matched = []
        words = query.lower().split()
        for c in chunks:
            matches = sum(1 for w in words if w in c.lower())
            if matches > 0:
                matched.append((c, matches))
        matched.sort(key=lambda x: x[1], reverse=True)
        return [{"chunk": m[0], "score": float(m[1])} for m in matched[:top_k]]

def generate_llm_response(
    system_prompt: str,
    user_query: str,
    history: List[Dict[str, str]]
) -> str:
    """
    Call Gemini API or OpenAI API depending on environment variables.
    Falls back to intelligent rule-based response if no API keys are provided.
    """
    gemini_key = os.environ.get("GEMINI_API_KEY")
    openai_key = os.environ.get("OPENAI_API_KEY")
    
    # 1. Google Gemini API
    if gemini_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
            
            # Format contents with conversation history
            contents = []
            for h in history:
                role = "user" if h.get("role") == "user" else "model"
                contents.append({
                    "role": role,
                    "parts": [{"text": h.get("content", "")}]
                })
            
            # Append latest query
            contents.append({
                "role": "user",
                "parts": [{"text": user_query}]
            })
            
            payload = {
                "contents": contents,
                "systemInstruction": {
                    "parts": [{"text": system_prompt}]
                },
                "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 1000
                }
            }
            
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={'Content-Type': 'application/json'}
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                text_response = res_data['candidates'][0]['content']['parts'][0]['text']
                return text_response
        except Exception as e:
            print(f"Gemini API execution error: {e}. Trying OpenAI fallback...")
            
    # 2. OpenAI API
    if openai_key:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            messages = [{"role": "system", "content": system_prompt}]
            for h in history:
                messages.append({"role": h.get("role"), "content": h.get("content")})
            messages.append({"role": "user", "content": user_query})
            
            payload = {
                "model": "gpt-4o-mini",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 1000
            }
            
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {openai_key}'
                }
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                res_data = json.loads(response.read().decode('utf-8'))
                return res_data['choices'][0]['message']['content']
        except Exception as e:
            print(f"OpenAI API execution error: {e}")
            
    # 3. Dynamic Local Heuristic Fallback
    return ""


# ---- Embedding helpers ----
def _cache_path_for_chunks(chunks: List[str]) -> str:
    cache_dir = os.path.join(os.path.dirname(__file__), '.cache')
    os.makedirs(cache_dir, exist_ok=True)
    h = hashlib.sha256("||".join(chunks).encode('utf-8')).hexdigest()
    return os.path.join(cache_dir, f'emb_{h}.json')


def _get_or_build_embeddings(chunks: List[str]) -> Optional[List[List[float]]]:
    """Return embeddings for chunks, using cache when available. Tries OpenAI, then local SentenceTransformer."""
    if not chunks:
        return None

    cache_path = _cache_path_for_chunks(chunks)
    # Attempt to load from cache
    try:
        if os.path.exists(cache_path):
            with open(cache_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('embeddings')
    except Exception:
        pass

    # 1) OpenAI embeddings if key present
    openai_key = os.environ.get('OPENAI_API_KEY')
    if openai_key:
        try:
            url = 'https://api.openai.com/v1/embeddings'
            payload = {
                'input': chunks,
                'model': 'text-embedding-3-small'
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {openai_key}'
                }
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                embeddings = [d['embedding'] for d in res.get('data', [])]
                # cache
                try:
                    with open(cache_path, 'w', encoding='utf-8') as f:
                        json.dump({'embeddings': embeddings, 'created': time.time()}, f)
                except Exception:
                    pass
                return embeddings
        except Exception as e:
            print(f'OpenAI embeddings failed: {e}')

    # 2) Local sentence-transformers if installed
    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        embs = model.encode(chunks, show_progress_bar=False)
        embeddings = [e.tolist() if hasattr(e, 'tolist') else list(e) for e in embs]
        try:
            with open(cache_path, 'w', encoding='utf-8') as f:
                json.dump({'embeddings': embeddings, 'created': time.time()}, f)
        except Exception:
            pass
        return embeddings
    except Exception:
        pass

    return None


def _embed_query(query: str) -> Optional[List[float]]:
    """Compute embedding for a single query using OpenAI or local model."""
    if not query:
        return None

    openai_key = os.environ.get('OPENAI_API_KEY')
    if openai_key:
        try:
            url = 'https://api.openai.com/v1/embeddings'
            payload = {'input': query, 'model': 'text-embedding-3-small'}
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'Content-Type': 'application/json',
                    'Authorization': f'Bearer {openai_key}'
                }
            )
            with urllib.request.urlopen(req, timeout=15) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                return res['data'][0]['embedding']
        except Exception as e:
            print(f'OpenAI query embedding failed: {e}')

    try:
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')
        emb = model.encode([query], show_progress_bar=False)[0]
        return emb.tolist() if hasattr(emb, 'tolist') else list(emb)
    except Exception:
        return None


def _expand_query(query: str, max_synonyms_per_word: int = 2) -> str:
    """Best-effort query expansion using WordNet synonyms for nouns/adjectives/verbs.
    Falls back to the original query if WordNet is unavailable.
    """
    if not query:
        return query
    if wn is None:
        return query

    words = re.findall(r"\w+", query)
    extras = []
    for w in words:
        try:
            synsets = wn.synsets(w)
            if not synsets:
                continue
            lemmas = []
            for s in synsets[:3]:
                for l in s.lemmas()[:max_synonyms_per_word]:
                    lem = l.name().replace('_', ' ')
                    if lem.lower() != w.lower() and lem not in lemmas:
                        lemmas.append(lem)
            extras.extend(lemmas[:max_synonyms_per_word])
        except Exception:
            continue

    if extras:
        # Append unique extras
        uniq = []
        for e in extras:
            if e not in uniq:
                uniq.append(e)
        return query + ' ' + ' '.join(uniq[:10])
    return query


def _rerank_with_cross_encoder(candidates: List[Dict[str, Any]], query: str, top_k: int = 3) -> Optional[List[Dict[str, Any]]]:
    """Use a Cross-Encoder model to re-score (query, chunk) pairs for precision.
    Returns reranked top_k candidates or None if the model isn't available.
    """
    if not candidates:
        return None

    try:
        # Lazy import to avoid heavy dependency if not installed
        from sentence_transformers import CrossEncoder
        model_name = 'cross-encoder/ms-marco-MiniLM-L-6-v2'
        model = CrossEncoder(model_name)
        texts = [(query, c['chunk']) for c in candidates]
        scores = model.predict(texts)
        scored = []
        for c, s in zip(candidates, scores):
            scored.append({'chunk': c['chunk'], 'score': float(s)})
        scored.sort(key=lambda x: x['score'], reverse=True)
        return scored[:top_k]
    except Exception:
        return None

def build_local_fallback(
    query: str,
    context: Dict[str, Any],
    retrieved_chunks: List[Dict[str, Any]]
) -> str:
    """
    Construct a highly coherent, professional mock answer based on the resume context
    if no LLM API keys are provided in the environment.
    """
    q_lower = query.lower()
    
    target_role = context.get("target_role", "Software Engineer")
    skills = context.get("skills", [])
    missing_skills = context.get("missing_skills", [])
    roadmap = context.get("roadmap", [])
    interview_prep = context.get("interview_prep", {})
    name = context.get("name", "Applicant")
    
    # Time-aware, warmer conversational intro
    try:
        hour = time.localtime().tm_hour
        if 5 <= hour < 12:
            greet = 'Good morning'
        elif 12 <= hour < 17:
            greet = 'Good afternoon'
        elif 17 <= hour < 22:
            greet = 'Good evening'
        else:
            greet = 'Hi'
    except Exception:
        greet = 'Hi'

    intro = f"{greet} {name}! \n\n"
    
    # 1. Ask about missing skills
    if any(word in q_lower for word in ["missing", "skill gap", "skills to learn", "lack"]):
        if not missing_skills:
            return intro + f"Based on your profile, you have a 100% skill match with the **{target_role}** guidelines! No major missing skills were detected. You are ready to start applying!"
        
        skills_list = ", ".join([f"`{s.upper()}`" for s in missing_skills])
        ans = intro + f"Hi {name}, based on your resume, you have a strong foundation but you have a gap in the following skills required for **{target_role}**:\n\n{skills_list}\n\n"
        ans += "Here is a quick learning recommendation:\n"
        for idx, s in enumerate(missing_skills[:3]):
            ans += f"- **{s.capitalize()}**: Look for standard introductory courses on Coursera, Udemy, or official documentation. Building a tiny project (like a CRUD app or utility) is the best way to get this onto your resume.\n"
        return ans

    # 2. Ask about the learning roadmap
    if any(word in q_lower for word in ["roadmap", "steps", "plan", "learn", "how to improve"]):
        if not roadmap:
            return intro + f"I don't have a customized roadmap loaded for you yet. Once you run an ATS match against a target role, I will compile a step-by-step roadmap."
        
        ans = intro + f"Here is the customized roadmap we compiled for you to master the **{target_role}** requirements:\n\n"
        for step in roadmap:
            ans += f"#### Step {step.get('step')}: {step.get('title')}\n"
            ans += f"- **Focus**: {step.get('description')}\n"
            if step.get('resources'):
                ans += f"- **Resources**: *{step.get('resources')}*\n"
            ans += "\n"
        ans += "Which step would you like me to detail further or provide coding exercises for?"
        return ans

    # 3. Ask about projects
    if any(word in q_lower for word in ["project", "portfolio", "build", "coding project"]):
        projects = roadmap = context.get("roadmap", []) # fallback to default projects in recommendations
        # Let's extract recommended projects from context if they exist
        rec_projects = context.get("recommendedProjects", [])
        if not rec_projects:
            # Let's provide standard projects for target_role
            rec_projects = [
                {"title": f"Custom {target_role} Web Application", "description": "Build an end-to-end responsive application solving a niche business problem.", "techStack": "React, Node.js, REST APIs"}
            ]
            
        ans = intro + f"To boost your resume compatibility for **{target_role}**, I recommend building these portfolio projects:\n\n"
        for p in rec_projects:
            ans += f"#### 🛠️ {p.get('title')}\n"
            ans += f"- **Description**: {p.get('description')}\n"
            if p.get('techStack'):
                ans += f"- **Tech Stack**: `{p.get('techStack')}`\n"
            ans += "\n"
        ans += "Building these will directly cover the skill gaps and make your resume stand out to recruiters."
        return ans

    # 4. Ask about interview preparation / mock interview
    if any(word in q_lower for word in ["interview", "mock", "question", "prep", "test"]):
        tech_qs = interview_prep.get("technical_questions", [])
        behavioral = interview_prep.get("behavioral_guidance", "")
        focus = interview_prep.get("role_specific_focus", "")
        
        ans = intro + f"Let's prepare for your upcoming **{target_role}** interview!\n\n"
        if focus:
            ans += f"**Interview Focus**: {focus}\n\n"
        if tech_qs:
            ans += "**Sample Technical Questions to practice:**\n"
            for idx, q in enumerate(tech_qs):
                ans += f"{idx+1}. *{q}*\n"
            ans += "\n"
        if behavioral:
            ans += f"**Behavioral Guidance**: {behavioral}\n\n"
        ans += "Try answering one of these questions, and I will critique your answer!"
        return ans

    # 5. Ask about cover letter
    if any(word in q_lower for word in ["cover letter", "draft letter", "apply"]):
        ans = intro + f"Here is a draft cover letter tailored for a **{target_role}** application based on your resume:\n\n"
        ans += f"```\nDear Hiring Team,\n\n"
        ans += f"I am writing to express my strong interest in the {target_role} position. "
        if skills:
            ans += f"With hands-on experience in {', '.join(skills[:4])}, I bring a solid technical skillset to your team. "
        ans += f"\n\nIn my previous projects, I have focused on building scalable systems and writing clean, maintainable code. "
        ans += f"I am particularly excited about this role because it aligns perfectly with my career goal to continue growing as a {target_role}.\n\n"
        ans += f"Thank you for your time and consideration. I look forward to discussing how my background matches your needs.\n\n"
        ans += f"Sincerely,\n{name}\n```"
        return ans

    # 6. Default response using RAG retrieved chunks (concise and human)
    ans = intro
    ans += f"Thanks — I checked your resume for details related to {target_role}.\n\n"

    if retrieved_chunks:
        ans += "Here are a couple of things I found that seem relevant:\n"
        for rc in retrieved_chunks[:2]:
            snippet = rc['chunk'].strip()
            snippet = (snippet[:220] + '...') if len(snippet) > 220 else snippet
            ans += f"— {snippet}\n"
        ans += "\n"

    ans += "What would you like me to do next? I can:\n"
    ans += "• Walk through your learning roadmap and suggest the next 1–2 actions.\n"
    ans += "• Suggest 1–3 portfolio projects that close your top skill gaps.\n"
    ans += "• Run a short mock interview and give feedback.\n"
    ans += "• Draft a friendly, specific cover letter.\n\n"
    ans += "Tell me in plain words what you want — I’ll keep it short and practical."

    return ans
