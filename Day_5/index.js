import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from 'readline-sync';
import { exec } from "child_process";
import { promisify } from "util";
import os from 'os';

const platform = os.platform();
const asyncExecute = promisify(exec);

const history = [];
const genAI = new GoogleGenerativeAI(""); // Add your actual API key

// Tool to execute terminal/shell commands
async function executeCommand({ command }) {
  try {
    const { stdout, stderr } = await asyncExecute(command);
    
    if (stderr && stderr.trim()) {
      return `Error: ${stderr}`;
    }
    
    return `Success: ${stdout || 'Command executed successfully'}`;
  } catch (error) {
    return `Error: ${error.message}`;
  }
}

const executeCommandDeclaration = {
  name: "executeCommand",
  description: "Execute a single terminal/shell command. Can create folders, files, write content, edit files, or delete files",
  parameters: {
    type: 'object',
    properties: {
      command: {
        type: 'string',
        description: 'A single terminal command, Ex: "mkdir calculator"'
      },
    },
    required: ['command']
  }
};

const availableTools = {
  executeCommand
};

async function runAgent(userProblem) {
  history.push({
    role: 'user',
    parts: [{ text: userProblem }]
  });

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    tools: [{
      functionDeclarations: [executeCommandDeclaration]
    }],
    systemInstruction: `You are a Website builder expert. You create frontend websites by analyzing user input.
    
    You have access to tools that can execute shell/terminal commands.
    Current user Operating system is: ${platform}
    
    Your job:
    1. Analyze the user query to understand what type of website they want
    2. Execute commands step by step to build the website
    3. Use the executeCommand tool
    
    Process:
    1. Create a project folder (mkdir project-name)
    2. Create index.html file
    3. Create style.css file  
    4. Create script.js file
    5. Write HTML content to the file
    6. Write CSS content to the file
    7. Write JavaScript content to the file
    
    Use appropriate commands for ${platform} operating system.
    For Windows: use 'type nul > filename' to create files and 'echo content > filename' to write content
    For Unix/Mac: use 'touch filename' to create files and 'echo "content" > filename' to write content`
  });

  while (true) {
    try {
      const result = await model.generateContent({
        contents: history
      });

      const response = result.response;
      
      // Check if there are function calls
      const functionCalls = response.functionCalls();
      
      if (functionCalls && functionCalls.length > 0) {
        const functionCall = functionCalls[0];
        console.log(functionCall);
        
        const { name, args } = functionCall;
        const funcToCall = availableTools[name];
        
        if (funcToCall) {
          const result = await funcToCall(args);
          
          // Add function call to history
          history.push({
            role: 'model',
            parts: [{
              functionCall: {
                name: functionCall.name,
                args: functionCall.args
              }
            }]
          });
          
          // Add function response to history
          history.push({
            role: 'user',
            parts: [{
              functionResponse: {
                name: name,
                response: {
                  result: result
                }
              }
            }]
          });
        }
      } else {
        // Regular text response
        const text = response.text();
        history.push({
          role: 'model',
          parts: [{ text: text }]
        });
        console.log(text);
        break;
      }
    } catch (error) {
      console.error('Error:', error.message);
      break;
    }
  }
}

async function main() {
  try {
    console.log("I am a cursor: let's create a website");
    const userProblem = readlineSync.question("Ask me anything--> ");
    await runAgent(userProblem);
    
    // Ask if user wants to continue
    const continueChoice = readlineSync.question("Do you want to create another website? (y/n): ");
    if (continueChoice.toLowerCase() === 'y' || continueChoice.toLowerCase() === 'yes') {
      main();
    }
  } catch (error) {
    console.error('Main error:', error.message);
  }
}

main();