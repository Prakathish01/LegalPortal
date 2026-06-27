/**
 * ragEngine.js
 * ------------------------------------------------------------------
 * Client-side Retrieval-Augmented Generation (RAG) search engine.
 * Computes tf-idf like similarity based on token overlap between
 * the user query and the company policies.
 * ------------------------------------------------------------------
 */

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "arent",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "cant",
  "cannot", "could", "couldnt", "did", "didnt", "do", "does", "doesnt", "doing", "dont", "down", "during",
  "each", "few", "for", "from", "further", "had", "hadnt", "has", "hasnt", "have", "havent", "having",
  "he", "hed", "hell", "hes", "her", "here", "heres", "hers", "herself", "him", "himself", "his", "how",
  "hows", "i", "id", "ill", "im", "ive", "if", "in", "into", "is", "isnt", "it", "its", "itself", "lets",
  "me", "more", "most", "mustnt", "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only",
  "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shant", "she", "shed",
  "shell", "shes", "should", "shouldnt", "so", "some", "such", "than", "that", "thats", "the", "their",
  "theirs", "them", "themselves", "then", "there", "theres", "these", "they", "theyd", "theyll", "theyre",
  "theyve", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasnt",
  "we", "wed", "well", "were", "weve", "werent", "what", "whats", "when", "whens", "where", "wheres",
  "which", "while", "who", "whos", "whom", "why", "whys", "with", "wont", "would", "wouldnt", "you",
  "youd", "youll", "youre", "youve", "your", "yours", "yourself", "yourselves"
]);

/**
 * Tokenizes, lowercases, and removes punctuation from text, filtering stop words.
 * @param {string} text 
 * @returns {string[]}
 */
export function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 0 && !STOP_WORDS.has(token));
}

/**
 * Basic stemmer that strips common suffixes.
 * @param {string} word 
 * @returns {string}
 */
export function getStem(word) {
  if (!word || word.length <= 2) return word;
  
  let stem = word;
  const suffixes = [
    "fulness", "lessness", "ational", "tional", "ization", "isation",
    "bility", "ments", "tions", "sions", "ations", "ities", "alism",
    "ment", "ness", "tion", "sion", "ation", "ties", "ings", "sive",
    "tive", "ally", "able", "ible", "ance", "ence", "ized", "ised",
    "ises", "izes", "ing", "est", "ful", "led", "red", "ted", "eed",
    "ied", "ies", "ers", "ous", "ive", "less", "ated", "ates", "ate",
    "ent", "ant", "ism", "ist", "er", "ed", "es", "ly", "al", "s", "y"
  ];

  for (const suffix of suffixes) {
    if (stem.endsWith(suffix) && stem.length - suffix.length >= 3) {
      stem = stem.slice(0, -suffix.length);
      break;
    }
  }

  if (stem.length >= 4 && stem[stem.length - 1] === stem[stem.length - 2]) {
    const doubleEnd = stem[stem.length - 1];
    if (doubleEnd !== 's' && doubleEnd !== 'f' && doubleEnd !== 'z') {
      stem = stem.slice(0, -1);
    }
  }
  
  return stem;
}

/**
 * Search the company policies for chunks matching the query.
 * @param {string} query The user's query message
 * @param {Array} policies List of policy chunks
 * @param {number} topN Number of results to return
 * @returns {Array} Top matching policies, each with a relevanceScore property
 */
export function searchPolicies(query, policies, topN = 3) {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return [];
  }

  const queryStems = queryTokens.map(getStem);

  const scoredPolicies = policies.map(policy => {
    let score = 0;
    
    const titleTokens = tokenize(policy.title);
    const contentTokens = tokenize(policy.content);
    const categoryTokens = tokenize(policy.category);
    const keywordTokens = policy.keywords ? policy.keywords.flatMap(kw => tokenize(kw)) : [];

    const titleStems = titleTokens.map(getStem);
    const contentStems = contentTokens.map(getStem);
    const categoryStems = categoryTokens.map(getStem);
    const keywordStems = keywordTokens.map(getStem);

    queryTokens.forEach((queryToken, idx) => {
      const queryStem = queryStems[idx];

      // 1. Title match check
      if (titleTokens.includes(queryToken)) {
        score += 3.0;
      } else if (titleStems.includes(queryStem)) {
        score += 2.0;
      } else if (queryToken.length >= 4 && titleTokens.some(t => t.length >= 4 && (t.includes(queryToken) || queryToken.includes(t)))) {
        score += 1.5;
      }
      
      // 2. Keyword match check
      if (keywordTokens.includes(queryToken)) {
        score += 2.0;
      } else if (keywordStems.includes(queryStem)) {
        score += 1.25;
      } else if (queryToken.length >= 4 && keywordTokens.some(t => t.length >= 4 && (t.includes(queryToken) || queryToken.includes(t)))) {
        score += 1.0;
      }

      // 3. Category match check
      if (categoryTokens.includes(queryToken)) {
        score += 1.5;
      } else if (categoryStems.includes(queryStem)) {
        score += 1.0;
      } else if (queryToken.length >= 4 && categoryTokens.some(t => t.length >= 4 && (t.includes(queryToken) || queryToken.includes(t)))) {
        score += 0.75;
      }

      // 4. Content match check
      const exactContentCount = contentTokens.filter(t => t === queryToken).length;
      if (exactContentCount > 0) {
        score += exactContentCount * 1.0;
      } else {
        const stemContentCount = contentStems.filter(s => s === queryStem).length;
        if (stemContentCount > 0) {
          score += stemContentCount * 0.5;
        } else if (queryToken.length >= 4) {
          const substringContentCount = contentTokens.filter(t => t.length >= 4 && (t.includes(queryToken) || queryToken.includes(t))).length;
          if (substringContentCount > 0) {
            score += substringContentCount * 0.25;
          }
        }
      }
    });

    return {
      ...policy,
      relevanceScore: score
    };
  });

  return scoredPolicies
    .filter(p => p.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, topN);
}

/**
 * Validates a grievance description and subject.
 * Returns { isInvalid: boolean, reason: string, message: string }
 */
export function validateGrievance(subject, description) {
  const text = `${subject || ""} ${description || ""}`.toLowerCase();

  // 1. Check for admission of personal fault, breaking rules, negligence
  const personalFaultKeywords = [
    "lost my own",
    "overtime fraud",
    "hide my mistake",
    "i broke the",
    "my own negligence",
    "my fault",
    "was my fault",
    "i am at fault",
    "my mistake",
    "my carelessness",
    "carelessness",
    "falsified",
    "fabricated",
    "cheated",
    "stole",
    "embezzled",
    "lied",
    "admit i violated",
    "admit i broke",
    "my direct violation"
  ];

  // 2. Check for intent to make someone purposefully suffer without validation / revenge / malice
  const maliceKeywords = [
    "revenge",
    "make them pay",
    "make them suffer",
    "ruin them",
    "get them fired",
    "teach them a lesson",
    "punish them",
    "destroy their career",
    "without proof",
    "don't have proof",
    "no proof",
    "no evidence",
    "purposefully suffer",
    "without validation",
    "without any validation",
    "ruin their life"
  ];

  const hasFault = personalFaultKeywords.some(kw => text.includes(kw));
  const hasMalice = maliceKeywords.some(kw => text.includes(kw));

  if (hasFault) {
    return {
      isInvalid: true,
      reason: "user_fault",
      message: "We can't take this case. Our Legal & Grievance desk does not handle cases where the issue arises from an employee's own admitted negligence, policy violation, or personal misconduct."
    };
  }

  if (hasMalice) {
    return {
      isInvalid: true,
      reason: "malice",
      message: "We can't take this case. Submitting complaints to purposefully make someone suffer, seek personal revenge, or without any objective proof/validations is strictly prohibited under our Ethical Code of Conduct."
    };
  }

  return { isInvalid: false };
}
