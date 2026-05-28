    // import {END, START, StateGraph,StateSchema,type GraphNode,type CompiledStateGraph} from '@langchain/langgraph'
    // import z from 'zod';
    // import { mistralAiModel , cohereModel, geminiModel } from './model.ai.js';
    // import {createAgent , HumanMessage, providerStrategy,toolStrategy } from 'langchain';

    // const state = new StateSchema({
    //     problem: z.string().default(''),
    //     solution_1: z.string().optional().default(''),
    //     solution_2: z.string().optional().default(''),
    //     judge:z.object({
    //         solution_1_score: z.number().default(0),
    //         solution_2_score: z.number().default(0),
    //         solution_1_reasoning: z.string().default(''),
    //         solution_2_reasoning: z.string().default(''), 
    //     })

    // })

    // const solutionNode:GraphNode<typeof state> = async (state)=>{
    // const [mistralResponse,cohereResponse] = await Promise.all([
    //     mistralAiModel.invoke(state.problem),
    //     cohereModel.invoke(state.problem)
    // ])

    // return {
    //     solution_1: mistralResponse.text,
    //     solution_2: cohereResponse.text 
    // }


    // }

    // const judgeNode:GraphNode<typeof state> = async (state)=>{
    //     const {problem,solution_1,solution_2} = state;

    //     const judeg = createAgent({
    //         model:geminiModel,
    //         responseFormat:providerStrategy(z.object({
    //     solution_1_score: z.number().min(0).max(10).default(0),
    //     solution_2_score: z.number().min(0).max(10).default(0),
    //     solution_1_reasoning: z.string(),
    //     solution_2_reasoning: z.string(),   
    //         })),
    //         systemPrompt:`You are a judge tasked with evaluating two solutions to a problem. The problem is: ${problem}. The first solution is: ${solution_1}. The second solution is: ${solution_2}. Please evaluate each solution on a scale of 0 to 10, where 0 means the solution does not address the problem at all, and 10 means the solution fully addresses the problem. Provide your reasoning for each score.`
    //     })
    //     const judgeResponse = await judeg.invoke({
    //         messages:[
    //             new HumanMessage(`
    // Problem: ${problem}
    // Solution 1: ${solution_1}
    // Solution 2: ${solution_2}
    // please evaluate each solution on a scale of 0 to 10, where 0 means the solution does not address the problem at all, and 10 means the solution fully addresses the problem. Provide your reasoning for each score.
    //                 `)
    //         ]
    //     });

    //     const {
    //         solution_1_score,
    //         solution_2_score,
    //         solution_1_reasoning,
    //         solution_2_reasoning
    //     } = judgeResponse.structuredResponse


    //     return {
    //         judge:{
    //             solution_1_score,
    //             solution_2_score,   
    //             solution_1_reasoning,
    //             solution_2_reasoning
    //         }
    //     }

    // }

    // const graph = new StateGraph(state)
    // .addNode('solutionNode',solutionNode)
    // .addNode('judge_node',judgeNode)
    // .addEdge(START,'solutionNode')
    // .addEdge('solutionNode','judge_node')
    // .addEdge('judge_node',END)
    // .compile()

    // export default async function runGraph(problem:string){
    //     const result = await graph.invoke({
    //     problem:problem
    //     })
    //     return result;
    // }


import {
  END,
  START,
  StateGraph
} from '@langchain/langgraph';

import z from 'zod';
import {
  mistralAiModel,
  cohereModel,
  geminiModel
} from './model.ai.js';

const delay = (ms) => new Promise(res => setTimeout(res, ms));

// ✅ FIXED STATE
const state = {
  problem: z.string().default(''),
  solution_1: z.string().default(''),
  solution_2: z.string().default(''),
  judge: z.object({
    solution_1_score: z.number().default(0),
    solution_2_score: z.number().default(0),
    solution_1_reasoning: z.string().default(''),
    solution_2_reasoning: z.string().default('')
  })
};

// 🔹 SOLUTION NODE
const solutionNode = async (state) => {
  let solution1 = "";
  let solution2 = "";

  try {
    const res1 = await geminiModel.invoke(state.problem);
    solution1 = res1.content;
  } catch (err) {
    console.log("Gemini error:", err.message);
    solution1 = "Error from Gemini";
  }

  await delay(1000);

  try {
    const res2 = await mistralAiModel.invoke(state.problem);
    solution2 = res2.content;
  } catch (err) {
    console.log("Mistral error:", err.message);
    solution2 = "Error from Mistral";
  }

  return {
    solution_1: solution1,
    solution_2: solution2
  };
};

// 🔹 JUDGE NODE
const judgeNode = async (state) => {
  const { problem, solution_1, solution_2 } = state;

  await delay(1000); // 🔥 IMPORTANT

  const prompt = `
Return ONLY JSON.

Problem:
${problem}

Solution 1:
${solution_1}

Solution 2:
${solution_2}

{
  "solution_1_score": number,
  "solution_2_score": number,
  "solution_1_reasoning": "text",
  "solution_2_reasoning": "text"
}
`;

  let judgeData;

  try {
    const res = await cohereModel.invoke(prompt);

    const cleaned = res.content.replace(/```json|```/g, '').trim();
    judgeData = JSON.parse(cleaned);

  } catch (err) {
    console.log("Judge error:", err.message);

    judgeData = {
      solution_1_score: 5,
      solution_2_score: 5,
      solution_1_reasoning: "Judge failed",
      solution_2_reasoning: "Judge failed"
    };
  }

  return {
    judge: judgeData
  };
};

// 🔗 GRAPH
const graph = new StateGraph({ channels: state })
  .addNode('solutionNode', solutionNode)
  .addNode('judgeNode', judgeNode)
  .addEdge(START, 'solutionNode')
  .addEdge('solutionNode', 'judgeNode')
  .addEdge('judgeNode', END)
  .compile();

// 🚀 MAIN
export default async function runGraph(problem) {
  return await graph.invoke({ problem });
}