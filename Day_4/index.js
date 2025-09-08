import { GoogleGenAI } from "@google/genai";
import readlineSync from 'readline-sync';
import { exec } from "child_process";
import { promisify } from "util";
import { stderr } from "process";
import os from 'os'

const platform = os.platform();

const asyncExexute = promisify(exec)



const History = [];
const ai = new GoogleGenAI({ apiKey:""})
 //Tool create karte hai jo kisi bhi terminal/Sheel commad ko execute kr skte hai  
async function executeCommand({command}) {
  try{
    const {stdout, sterr} =  await asyncExexute(command);

    if(stderr){
      return `Error: ${stderr}`
    }

    return `Success: ${stdout} || Task Exececuted completely`
  }
  catch(error) {}
  
}

const executeCommandDeclaration = {
  name: "executeCommand",
  description: "Execute a single terminal/shell command. A command can be to create a folder, file, write, edit the file or delete the file",
  parameters:{
    type: 'OBJECT',
    properties: {
      command:{
        type:'STRING',
        description: 'It will be a single terminal command, Ex: "mkdir calculator" '
      },
    },
    required: ['command']
  }

}

const availableTools ={
  executeCommand
}

async function runAgent(userProblem) {
  History.push ({
    role:'user',
    parts:[{text:userProblem}]
  });
  while(true){
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: History,
      config: {
        systemInstruction: `You are an Website builder expert. You have to create the forntend of the website by analysing the user input. 
        You have access of tools, whihc can run or execute any shell or terminal command. 
        
        Current user Operating system is: ${platform}
        Give command to the user according to its operating system support.
        
         <--What is your job -->
        1: Analyse the user query to see what type of website the user want to build
        2: Give them command one by one, step by step
        3: use available tool executeCommand

        // Now you can give them command in follwing below
        1: First create a folder, Ex: mkdir
        2: Inside the folder, create index.html, EX: touch "calculator/index.html"
        3: The create style.css same as above 
        4: Then create script.js
        5: Then write a code in html file

        You have to provide the terminal or shell command to user, they will directly execute it 
        `,
        tools: [{
          functionDeclarations: [executeCommandDeclaration]
        }],
      },
    });
    if(response.functionCalls&&response.functionCalls.length>0){
      console.log(response.functionCalls[0]);
      const {name,args} = response.functionCalls[0];

      const funcCall = availableTools[name];
      const result = await funcCall(args);

      const functionResponsePart = {
        name: name,
        response: {
          result: result,
        },
      };

      History.push({
        role: "model",
        parts: [
          {
            functionCall: response.functionCalls[0],
          },
        ],
      });

      History.push({
        role:"user",
        parts: [
          {
            functionResponse: functionResponsePart,
          },
        ],
      });
    }
    else{
      History.push({
        role:'model',
        parts:[{text:response.text}]
      })
      console.log(response.text);
      break;
    }
  }


}

async function main() {
  console.log("I am a cursor: let's create a website")
  const userProblem = readlineSync.question("Ask me anything--> ");
  await runAgent(userProblem);
  main();

}

main();




