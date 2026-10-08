import trainingData from "./data/data.json";

export type MainIntent = "ask" | "search";
export type SubIntent = 
  | "support" | "recommendation" | "specification" | "general" 
  | "vehicle" | "route" | "accessory" | "service";

export type IntentCategory = `${MainIntent}:${SubIntent}`;

export interface IntentResult {
  main: MainIntent;
  sub: SubIntent;
  confidence: number;
}

class NaiveBayes {
  private vocab = new Set<string>();
  private wordCounts: Record<string, Record<string, number>> = {};
  private docCounts: Record<string, number> = {};
  private totalDocs = 0;

  tokenize(text: string): string[] {
    const unigrams = text.toLowerCase().match(/\b\w+\b/g) || [];
    const tokens = [...unigrams];
    
    // Generate bi-grams (2-word phrases) to capture context like "how to", "near me"
    for (let i = 0; i < unigrams.length - 1; i++) {
      tokens.push(`${unigrams[i]} ${unigrams[i+1]}`);
    }
    
    return tokens;
  }

  train(text: string, category: string) {
    if (!this.wordCounts[category]) this.wordCounts[category] = {};
    if (!this.docCounts[category]) this.docCounts[category] = 0;

    const tokens = this.tokenize(text);
    this.docCounts[category]++;
    this.totalDocs++;
    
    for (const token of tokens) {
      this.vocab.add(token);
      this.wordCounts[category][token] = (this.wordCounts[category][token] || 0) + 1;
    }
  }

  predict(text: string): IntentResult {
    const tokens = this.tokenize(text);
    if (tokens.length === 0) return { main: "search", sub: "vehicle", confidence: 1 };

    let maxProb = -Infinity;
    let bestCategory = "search:vehicle";

    // Small heuristic boost for obvious question words
    let askBoost = 0;
    const questionWords = ["how", "what", "why", "when", "where", "who", "can", "do", "does", "is", "are", "help", "show", "tell", "best", "list", "top", "cheapest", "suggest", "recommend", "compare", "difference"];
    
    // Higher boost if it starts with a question word, lower boost if it contains one anywhere
    if (tokens.length > 0 && questionWords.includes(tokens[0])) {
      askBoost += Math.log(5);
    } else if (tokens.some(t => questionWords.includes(t))) {
      askBoost += Math.log(2);
    }
    
    if (text.includes("?")) {
      askBoost += Math.log(2);
    }

    const categories = Object.keys(this.docCounts);
    
    for (const category of categories) {
      let logProb = Math.log(this.docCounts[category] / this.totalDocs);
      const totalWordsInCategory = Object.values(this.wordCounts[category]).reduce((a, b) => a + b, 0);
      const vocabSize = this.vocab.size;

      for (const token of tokens) {
        const count = this.wordCounts[category][token] || 0;
        // Laplace smoothing
        logProb += Math.log((count + 1) / (totalWordsInCategory + vocabSize));
      }

      if (category.startsWith("ask:")) logProb += askBoost;

      if (logProb > maxProb) {
        maxProb = logProb;
        bestCategory = category;
      }
    }

    const [main, sub] = bestCategory.split(":") as [MainIntent, SubIntent];
    return { main, sub, confidence: maxProb };
  }
}

const classifier = new NaiveBayes();

// Train the model with JSON data
(trainingData as { text: string; intent: IntentCategory }[]).forEach(data => {
  classifier.train(data.text, data.intent);
});

export function classifyIntent(text: string): IntentResult {
  if (!text.trim()) return { main: "search", sub: "vehicle", confidence: 1 };
  if (text.length < 3) return { main: "search", sub: "vehicle", confidence: 1 }; 
  return classifier.predict(text);
}
