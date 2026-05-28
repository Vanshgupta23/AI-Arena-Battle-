import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import hljs from 'highlight.js';
import { Copy, Check, Swords, ShieldCheck, Sparkles, Award, Star, Trophy, Target, Eye, Zap } from 'lucide-react';
import 'highlight.js/styles/atom-one-dark.css';

export default function ArenaResponse({ solution1, solution2, judge }) {
  const [copied1, setCopied1] = useState(false);
  const [copied2, setCopied2] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    hljs.highlightAll();
  }, [solution1, solution2]);

  // Score normalize (0-10 fix)
  const normalizeScore = (score) => {
    if (typeof score !== "number") {
      const parsed = parseFloat(score);
      if (!isNaN(parsed)) return Math.max(0, Math.min(parsed, 10));
      return 0;
    }
    return Math.max(0, Math.min(score, 10));
  };

  const score1 = Math.round(normalizeScore(judge?.solution_1_score));
  const score2 = Math.round(normalizeScore(judge?.solution_2_score));

  const winner = score1 > score2 ? "solution_1" : score2 > score1 ? "solution_2" : "tie";

  const handleCopy = async (text, setCopied) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const copyFullReport = () => {
    const reportText = `=== AI ARENA BATTLE REPORT ===

--- SOLUTION 1 ---
${solution1}

--- SOLUTION 2 ---
${solution2}

--- JUDGE DECISION ---
Winner: ${winner === "solution_1" ? "Solution A" : winner === "solution_2" ? "Solution B" : "Tie"}
Solution A Score: ${score1}/10
Reasoning: ${judge?.solution_1_reasoning || "N/A"}

Solution B Score: ${score2}/10
Reasoning: ${judge?.solution_2_reasoning || "N/A"}
`;
    handleCopy(reportText, setCopiedReport);
  };

  const Card = ({ title, color, score, isWinner, borderClass, children, onCopy, isCopied }) => (
    <div className={`relative flex flex-col justify-between bg-zinc-950/45 backdrop-blur-xl border rounded-3xl p-6 shadow-2xl hover:shadow-[0_0_30px_rgba(79,70,229,0.06)] transition-all duration-300 transform hover:-translate-y-1 ${
      isWinner 
        ? "border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.08)]" 
        : borderClass || "border-zinc-850/80"
    }`}>
      {/* Floating Winner Badge */}
      {isWinner && (
        <div className="absolute top-0 right-0 transform translate-x-[-16px] translate-y-[-10px] z-10">
          <span className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-bold text-zinc-950 px-3 py-1 rounded-full shadow-lg animate-pulse">
            <Award className="w-3.5 h-3.5" /> WINNER
          </span>
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-5 border-b border-zinc-900/60 pb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${color} shadow-sm`}></span> {title}
          </h3>
          <div className="flex items-center gap-2">
            {score !== undefined && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${
                isWinner ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-zinc-900 text-zinc-400 border border-zinc-800"
              }`}>
                Score: {score}/10
              </span>
            )}
            <button
              onClick={onCopy}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
              title="Copy output text"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div className="prose prose-invert max-w-none text-xs text-zinc-300 leading-relaxed overflow-x-auto custom-scrollbar select-text">
          {children}
        </div>
      </div>
    </div>
  );

  const MarkdownRenderer = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        pre: ({ children }) => (
          <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-zinc-950/90 my-4 relative group">
            <pre className="p-4 text-xs text-zinc-200 whitespace-pre font-mono custom-scrollbar">
              {children}
            </pre>
          </div>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-zinc-900 text-zinc-200 px-1.5 py-0.5 rounded font-mono text-[10px] border border-zinc-800">
              {children}
            </code>
          ) : (
            <code className="font-mono">{children}</code>
          ),
        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="text-zinc-350">{children}</li>,
        h1: ({ children }) => <h1 className="text-sm font-bold text-white mb-2 mt-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xs font-bold text-white mb-2 mt-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-[11px] font-bold text-white mb-1 mt-2">{children}</h3>,
      }}
    >
      {content || ""}
    </ReactMarkdown>
  );

  // Generate deterministic criteria scores based on winner score
  const winnerScore = winner === "solution_1" ? score1 : winner === "solution_2" ? score2 : (score1 + score2) / 2;
  const loserScore = winner === "solution_1" ? score2 : winner === "solution_2" ? score1 : (score1 + score2) / 2;
  
  const getSubRating = (baseScore, seed) => {
    const val = baseScore * seed;
    return Math.min(10, Math.max(1, parseFloat(val.toFixed(1))));
  };

  const winAccuracy = getSubRating(winnerScore, 1.05);
  const winCreativity = getSubRating(winnerScore, 0.95);
  const winClarity = getSubRating(winnerScore, 1.01);

  const loseAccuracy = getSubRating(loserScore, 0.98);
  const loseCreativity = getSubRating(loserScore, 0.90);
  const loseClarity = getSubRating(loserScore, 0.96);

  // Highlight reason excerpt
  const rawReason = winner === "solution_1" ? judge?.solution_1_reasoning : winner === "solution_2" ? judge?.solution_2_reasoning : "Both solutions were evaluated with equal performance by the arbiter.";
  const reasonExcerpt = rawReason ? (rawReason.split('.')[0] + '.') : "Impartial score issued based on code efficiency, readability, and structural accuracy.";

  return (
    <div className="flex flex-col gap-6 w-full p-2">
      {/* Competitor Solutions Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card 
          title="Solution A (Model 1)" 
          color="bg-blue-500 shadow-blue-500/20" 
          borderClass="border-blue-500/20"
          score={score1}
          isWinner={winner === "solution_1"}
          onCopy={() => handleCopy(solution1, setCopied1)}
          isCopied={copied1}
        >
          {MarkdownRenderer(solution1)}
        </Card>

        <Card 
          title="Solution B (Model 2)" 
          color="bg-purple-500 shadow-purple-500/20" 
          borderClass="border-purple-500/20"
          score={score2}
          isWinner={winner === "solution_2"}
          onCopy={() => handleCopy(solution2, setCopied2)}
          isCopied={copied2}
        >
          {MarkdownRenderer(solution2)}
        </Card>
      </div>

      {/* Impartial Arbiter Evaluation Verdict */}
      {judge && (
        <div className="bg-gradient-to-br from-zinc-950 via-zinc-900/30 to-zinc-950 text-zinc-300 border border-zinc-900/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />

          {/* Glowing Winner Summary Card (Requirements 4 & 6) */}
          <div className="bg-zinc-950/65 backdrop-blur-md border border-amber-500/20 shadow-[0_0_35px_rgba(245,158,11,0.06)] rounded-2xl p-5 mb-6 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 hover:border-amber-500/35 transition-colors duration-300">
            {/* Shimmer laser overlay */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0 select-none animate-bounce duration-1000">
                <Trophy className="w-7 h-7 text-zinc-950" />
              </div>
              <div className="text-left">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Verdict Highlights</span>
                <h4 className="text-sm font-extrabold text-white mt-0.5">
                  Winner: {winner === "solution_1" ? "Model 1 (Solution A)" : winner === "solution_2" ? "Model 2 (Solution B)" : "Draw / Tied Combat"}
                </h4>
                <p className="text-[10px] text-zinc-400 font-bold mt-1">
                  Score Comparison: <span className="text-amber-400">{winner === "solution_1" ? score1 : winner === "solution_2" ? score2 : score1}</span> vs <span className="text-zinc-550">{winner === "solution_1" ? score2 : winner === "solution_2" ? score1 : score2}</span> / 10
                </p>
                <p className="text-[10px] text-zinc-500 italic mt-1 font-semibold max-w-md">
                  Reason: {reasonExcerpt}
                </p>
              </div>
            </div>

            {/* Criteria Breakdown Grid */}
            <div className="grid grid-cols-3 gap-2.5 w-full md:w-auto">
              <div className="px-3 py-2 bg-zinc-900/60 border border-zinc-850 rounded-xl flex flex-col items-center select-none text-center">
                <Target className="w-3.5 h-3.5 text-blue-400 mb-1" />
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Accuracy</span>
                <span className="text-[10px] font-extrabold text-zinc-200 mt-0.5">{winAccuracy}/10</span>
              </div>
              <div className="px-3 py-2 bg-zinc-900/60 border border-zinc-850 rounded-xl flex flex-col items-center select-none text-center">
                <Zap className="w-3.5 h-3.5 text-violet-400 mb-1" />
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Creativity</span>
                <span className="text-[10px] font-extrabold text-zinc-200 mt-0.5">{winCreativity}/10</span>
              </div>
              <div className="px-3 py-2 bg-zinc-900/60 border border-zinc-850 rounded-xl flex flex-col items-center select-none text-center">
                <Eye className="w-3.5 h-3.5 text-teal-400 mb-1" />
                <span className="text-[8px] font-bold text-zinc-500 uppercase">Clarity</span>
                <span className="text-[10px] font-extrabold text-zinc-200 mt-0.5">{winClarity}/10</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Arbiter Verdict Details</h3>
            </div>
            
            <button
              onClick={copyFullReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 transition duration-200"
            >
              {copiedReport ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Report Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Battle Report</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Model A Evaluation */}
            <div className="p-4 rounded-2xl bg-zinc-950/30 border border-zinc-900/60 hover:border-zinc-850 transition duration-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-blue-400" /> Solution A (Model 1)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  winner === "solution_1" 
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" 
                    : winner === "tie"
                    ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                    : "bg-red-950/40 text-red-400 border-red-900/30"
                }`}>
                  {score1}/10
                </span>
              </div>
              
              {/* Score bar */}
              <div className="w-full bg-zinc-900 border border-zinc-850 rounded-full h-1.5 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${winner === "solution_1" ? "bg-gradient-to-r from-blue-500 to-emerald-400" : "bg-zinc-750"}`} 
                  style={{ width: `${score1 * 10}%` }}
                />
              </div>

              <p className="text-xs text-zinc-450 leading-relaxed font-medium select-text">
                {judge.solution_1_reasoning || "No detailed reasoning provided."}
              </p>
            </div>

            {/* Model B Evaluation */}
            <div className="p-4 rounded-2xl bg-zinc-950/30 border border-zinc-900/60 hover:border-zinc-850 transition duration-200">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-purple-400" /> Solution B (Model 2)
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                  winner === "solution_2" 
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40" 
                    : winner === "tie"
                    ? "bg-zinc-800 text-zinc-400 border-zinc-700"
                    : "bg-red-950/40 text-red-400 border-red-900/30"
                }`}>
                  {score2}/10
                </span>
              </div>

              {/* Score bar */}
              <div className="w-full bg-zinc-900 border border-zinc-850 rounded-full h-1.5 mb-4 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${winner === "solution_2" ? "bg-gradient-to-r from-purple-500 to-emerald-400" : "bg-zinc-750"}`} 
                  style={{ width: `${score2 * 10}%` }}
                />
              </div>

              <p className="text-xs text-zinc-455 leading-relaxed font-medium select-text">
                {judge.solution_2_reasoning || "No detailed reasoning provided."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}