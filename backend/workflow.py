from crewai import Crew, Task
from agents import (
    prompt_agent, coder_agent, reviewer_agent,
    qa_agent, deployment_agent
)
import os
os.environ["OPENAI_API_KEY"] = os.getenv("OPENAI_API_KEY")

def create_tasks(step, input_data, user_feedback=None):
    if step == "prompt":
        if user_feedback:
            # User wants changes to the prompt
            description = f"""
            The user has provided feedback on your previous prompt: "{user_feedback}"
            
            Original request: {input_data['prompt']}
            
            Please refine the prompt based on this feedback and create a better, more detailed specification.
            """
        else:
            # Initial prompt creation
            description = f"""
            Create a detailed, actionable prompt specification for this request: "{input_data['prompt']}"
            
            Your prompt should include:
            1. Clear requirements and features
            2. Technical specifications
            3. User interface requirements
            4. Any specific technologies or frameworks to use
            5. Expected functionality
            
            Make it comprehensive enough for a developer to implement without additional questions.
            """
    
    elif step == "coder":
        prompt = input_data.get("prompt") or input_data.get("code") or ""
        description = f"""You are a senior AI code generation bot. Your only purpose is to write code.

Given the following specification, generate a complete, production-ready, working codebase.

**Your response format MUST be strictly followed:**
1. Start with a Markdown code structure tree in a code block (use ```tree ... ```).
2. For each file, output a code block (e.g., ```js, ```py, etc.) starting with a comment indicating the full path (e.g., // frontend/src/App.js).

**RULES:**
- DO NOT write ANY text, explanation, summary, or prose. Your entire response must consist of the structure tree and the code blocks. Nothing else.
- DO NOT use placeholders like // ... code here ....
- DO NOT output anything except the code structure tree and code blocks as described.
- DO NOT output any thoughts, explanations, or summaries.
- DO NOT say 'I now can give a great answer' or similar phrases.
- If you do not follow this format exactly, your answer will be rejected and you will not be paid.

**You MUST include all files required for a real, working project, such as:**
- For a web app: package.json, public/index.html, src/index.js, src/App.js, src/components/, .gitignore, README.md, and any other files needed for a real project.
- For a backend: server.js, database connection/config, routes, controllers, .env.example, README.md, etc.

**Each file must contain realistic, production-ready code. Do NOT use placeholders.**
"""
#         description = f"""You are an advanced AI code generation bot with senior full-stack engineering experience.

# Your job is to generate a fully functional, production-ready codebase for the following project request.

# """
        print("Code Generator LLM prompt:", description)  # Debug
        return Task(
            description=description,
            agent=coder_agent,
            expected_output="A complete, production-ready codebase with all required files and realistic code.",
            allow_delegation=False
        )
    
    elif step == "reviewer":
        description = f"""
        Review this code thoroughly: {input_data['code']}
        
        Check for:
        1. Code quality and best practices
        2. Potential bugs or issues
        3. Security vulnerabilities
        4. Performance optimizations
        5. Code structure and organization
        
        Provide detailed feedback and suggestions for improvement.
        """
    
    elif step == "qa":
        description = f"""You are a senior QA Engineer. Test the following code thoroughly and provide a detailed QA report.

Your response MUST be in this exact format:
```markdown
## Test Cases
1. [Test Name]: [Expected Result] vs [Actual Result]
   - Setup: [Steps to reproduce]
   - Status: ✅ Pass / ❌ Fail
   ...

## Issues Found
1. [Issue Description]
   - Severity: [High/Medium/Low]
   - Location: [File path and line numbers]
   ...

## Edge Cases
1. [Edge Case Scenario]
   - Risk: [Description]
   - Mitigation: [Solution]
   ...

## Performance Recommendations
1. [Recommendation]
   - Impact: [Description]
   - Implementation: [How to implement]
   ...

## User Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
...
```

DO NOT include any other text, summaries, or explanations outside this format.
DO NOT say 'I now can give a great answer' or similar phrases.

CODE TO TEST:
{input_data['code']}
"""
    
    elif step == "deployment":
        description = f"""
        Prepare this code for deployment: {input_data['code']}
        
        Provide:
        1. Deployment instructions
        2. Environment setup
        3. Configuration requirements
        4. Monitoring and logging setup
        5. Security considerations
        6. Scaling recommendations
        
        Make it ready for production deployment.
        """
    
    else:
        return None
    
    # Get the appropriate agent
    agents = {
        "prompt": prompt_agent,
        "coder": coder_agent,
        "reviewer": reviewer_agent,
        "qa": qa_agent,
        "deployment": deployment_agent
    }
    
    agent = agents.get(step)
    if not agent:
        return None
    
    expected_outputs = {
        "prompt": "A refined, clear prompt for the coder agent.",
        "coder": "Working code that matches the prompt.",
        "reviewer": "A reviewed and improved version of the code.",
        "qa": "Test results and bug reports.",
        "deployment": "Deployment confirmation and details."
    }
    expected_output = expected_outputs.get(step, "A result for this step.")

    return Task(
        description=description,
        agent=agent,
        expected_output=expected_output
    )

# def run_step_workflow(step, input_data, user_feedback=None):
#     if step == "coder":
#         prompt_spec = input_data.get("prompt") or input_data.get("code") or ""
#         result = coder_reviewer_loop(prompt_spec, max_iterations=3)
#         return {"result": result}
#     elif step == "qa":
#         task = create_tasks("qa", {"code": input_data.get("code")})
#         crew = Crew(
#             agents=[task.agent],
#             tasks=[task],
#             verbose=False
#         )
#         result = crew.kickoff()
#         return {"result": result}
#     else:
#         task = create_tasks(step, input_data, user_feedback)
#         if not task:
#             return {"error": "Invalid step"}
#         crew = Crew(
#             agents=[task.agent],
#             tasks=[task],
#             verbose=False
#         )
#         result = crew.kickoff()
#         return {"result": result}

def run_step_workflow(step, input_data, user_feedback=None):
    if step == "coder":
        prompt = input_data.get("prompt") or input_data.get("code") or ""
        task = create_tasks("coder", {"prompt": prompt})
        crew = Crew(
            agents=[task.agent],
            tasks=[task],
            verbose=False
        )
        result = crew.kickoff()
        return {"result": result}

    elif step == "qa":
        task = create_tasks("qa", {"code": input_data.get("code")})
        crew = Crew(
            agents=[task.agent],
            tasks=[task],
            verbose=False
        )
        result = crew.kickoff()
        return {"result": result}

    elif step == "deployment":
        task = create_tasks("deployment", {"code": input_data.get("code")})
        crew = Crew(
            agents=[task.agent],
            tasks=[task],
            verbose=False
        )
        result = crew.kickoff()
        return {"result": result}

    elif step == "prompt":
        task = create_tasks("prompt", input_data, user_feedback)
        crew = Crew(
            agents=[task.agent],
            tasks=[task],
            verbose=False
        )
        result = crew.kickoff()
        return {"result": result}

    else:
        return {"error": f"Invalid step: {step}"}

def run_workflow(user_prompt: str):
    # Define tasks for each agent
    prompt_task = Task(agent=prompt_agent, input=user_prompt)
    coder_task = Task(agent=coder_agent, input=prompt_task)
    reviewer_task = Task(agent=reviewer_agent, input=coder_task)
    qa_task = Task(agent=qa_agent, input=reviewer_task)
    deployment_task = Task(agent=deployment_agent, input=qa_task)

    # Orchestrate the workflow
    crew = Crew(tasks=[prompt_task, coder_task, reviewer_task, qa_task, deployment_task])
    result = crew.run()
    return result

def coder_self_review_loop(prompt_spec, max_iterations=3):
    code = None
    feedback = None
    for i in range(max_iterations):
        coder_input = prompt_spec if i == 0 else feedback
        coder_task = Task(
            description=f"""You are a senior full-stack developer and code reviewer.

Your job is to:
1. Generate the complete, production-ready source code for the following specification.
2. **Immediately review your own output** for:
   - Code structure tree at the top (in a ```tree ... ``` code block)
   - Each file in a code block, starting with a comment indicating the full path (e.g., // project/frontend/App.js)
   - No summaries, explanations, or prose outside code blocks
   - No placeholders or incomplete code
3. If you find any issues, **fix them and output the improved code**.
4. Repeat this process up to {max_iterations} times, or until the code is perfect.

SPECIFICATION OR FEEDBACK:
{coder_input}

Your response must be ONLY the code structure tree and the code blocks. Do not include any review comments, explanations, or summaries.
""",
            agent=coder_agent,
            expected_output="A complete, production-ready codebase with a code structure tree and code blocks for each file."
        )
        code = Crew(agents=[coder_agent], tasks=[coder_task]).kickoff()

        # Optionally, you can add a simple format check here to break early if the code is correct
        # For now, just repeat max_iterations times or until code doesn't change
        if feedback == code:
            break
        feedback = code

    return {
        "code": code,
        "review_feedback": None
    }
