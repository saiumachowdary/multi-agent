from crewai import Agent, Task
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize the LLM
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0.2,
    api_key=os.getenv("OPENAI_API_KEY")
)
llm_reviewer = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0.0,
    api_key=os.getenv("OPENAI_API_KEY"),
    max_tokens=4096
)

# Create agents with specific LLM tools and configurations
prompt_agent = Agent(
    role="Prompt Engineer",
    goal="Create clear, detailed, and actionable prompts from user requests. If user wants changes, refine the prompt accordingly.",
    backstory="You are an expert prompt engineer who specializes in converting vague user requests into precise, detailed specifications that developers can work with. You always ask for clarification when needed and refine prompts based on user feedback.",
    allow_delegation=False,
    llm=llm,
    verbose=True
)

coder_agent = Agent(
    role="Code Generator",
    goal="Generate and self-review complete, production-ready code for given specifications, ensuring all formatting and completeness requirements are met.",
    backstory="You are an expert full-stack engineer who always double-checks your own work for completeness and formatting before submitting.",
    allow_delegation=False,
    llm=llm_reviewer,
    # verbose=True
)

reviewer_agent = Agent(
    role="Code Reviewer",
    goal="Review code for quality, bugs, best practices, and suggest improvements",
    backstory="You are a senior code reviewer with extensive experience in multiple programming languages and frameworks. You identify potential issues, suggest optimizations, and ensure code follows best practices.",
    allow_delegation=False,
    llm=llm_reviewer,
    verbose=True
)

qa_agent = Agent(
    role="QA Engineer",
    goal="Test code thoroughly, identify potential issues, and ensure it meets requirements",
    backstory="You are a QA expert who creates comprehensive test plans, identifies edge cases, and ensures the code works as intended across different scenarios.",
    allow_delegation=False,
    llm=llm,
    verbose=True
)

deployment_agent = Agent(
    role="Deployment Manager",
    goal="Prepare code for deployment and provide deployment instructions",
    backstory="You are a DevOps expert who ensures code is deployment-ready, provides clear deployment instructions, and considers security, scalability, and monitoring requirements.",
    allow_delegation=False,
    llm=llm,
    verbose=True
)
