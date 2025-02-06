"""
LLMHelper Module

This module provides a helper class (LLMHelper) that interfaces with OpenAI's API to generate 
summaries, introductions, detailed report bodies, responses, and to extract relevant context from 
past interactions. It also includes functionality to generate both a summary and title from input text.

Before using this module, ensure that you have set your OpenAI API key.
"""

import openai
from typing import Optional
import logging
from openai import OpenAI
import os

api_key = os.environ.get("OPENAI_API_KEY")

# Initialize the OpenAI client
client = OpenAI()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Set your OpenAI API key here
openai.api_key = api_key

class LLMHelper:
    """
    A helper class to interface with OpenAI's API for generating text-based outputs.
    
    Provides static methods to:
      - Generate a summary for a given text.
      - Generate an introduction for a report.
      - Generate a detailed report body.
      - Generate a response for a user prompt.
      - Extract relevant context from past interactions.
      - Generate both a summary and title from input text.
    """

    @staticmethod
    def generate_summary(text: str, max_tokens: int = 50, temperature: float = 0.7) -> Optional[str]:
        """
        Generates a concise and well-formatted summary for the given text using OpenAI's API.
        
        Args:
            text (str): The text to summarize.
            max_tokens (int, optional): The maximum number of tokens for the summary. Default is 50.
            temperature (float, optional): Sampling temperature for generation. Default is 0.7.
        
        Returns:
            Optional[str]: The generated summary if successful; otherwise, None.
        """
        logger.info("Generating summary for text: %s", text[:100])
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": "You are a summary creator..."},
                    {"role": "user", "content": text}
                ],
            )
            summary = response.choices[0].message.content.strip()
            logger.info("Generated summary: %s", summary[:100])
            return summary
        except Exception as e:
            logger.error("Error generating summary: %s", e)
            return None

    @staticmethod
    def generate_introduction(text: str, max_tokens: int = 50, temperature: float = 0.7) -> Optional[str]:
        """
        Generates an introduction for a report based on the given text using OpenAI's API.
        
        Args:
            text (str): The text to base the introduction on.
            max_tokens (int, optional): The maximum number of tokens for the introduction. Default is 50.
            temperature (float, optional): Sampling temperature for generation. Default is 0.7.
        
        Returns:
            Optional[str]: The generated introduction if successful; otherwise, None.
        """
        logger.info("Generating introduction for text: %s", text[:100])
        try:
            response = client.chat.completions.create(
                model="o1-mini",
                messages=[
                    {"role": "user", "content": "You are an introduction generator..."},
                    {"role": "user", "content": text}
                ],
            )
            introduction = response.choices[0].message.content.strip()
            logger.info("Generated introduction: %s", introduction[:100])
            return introduction
        except Exception as e:
            logger.error("Error generating introduction: %s", e)
            return None

    @staticmethod
    def generate_body(text: str, max_tokens: int = 1024, temperature: float = 0.7) -> Optional[str]:
        """
        Generates a detailed report body based on the input text using OpenAI's API.
        
        Args:
            text (str): The text to expand into a detailed report.
            max_tokens (int, optional): The maximum number of tokens for the report body. Default is 1024.
            temperature (float, optional): Sampling temperature for generation. Default is 0.7.
        
        Returns:
            Optional[str]: The generated report body if successful; otherwise, None.
        """
        logger.info("Generating report body for text: %s", text[:100])
        try:
            response = client.chat.completions.create(
                model="o1-mini",
                messages=[
                    {"role": "user", "content": "Expand the user's input into a detailed report..."},
                    {"role": "user", "content": text}
                ],
            )
            body = response.choices[0].message.content.strip()
            logger.info("Generated report body: %s", body[:100])
            return body
        except Exception as e:
            logger.error("Error generating report body: %s", e)
            return None

    @staticmethod
    def generate_response(prompt: str, max_tokens: int = 150, temperature: float = 0.7) -> Optional[str]:
        """
        Generates a response to a user prompt using OpenAI's API.
        
        Args:
            prompt (str): The user prompt to generate a response for.
            max_tokens (int, optional): The maximum number of tokens for the response. Default is 150.
            temperature (float, optional): Sampling temperature for generation. Default is 0.7.
        
        Returns:
            Optional[str]: The generated response if successful; otherwise, None.
        """
        logger.info("Generating response for prompt: %s", prompt[:100])
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": "You are an AI assistant..."},
                    {"role": "user", "content": prompt}
                ],
            )
            response_text = response.choices[0].message.content.strip()
            logger.info("Generated response: %s", response_text[:100])
            return response_text
        except Exception as e:
            logger.error("Error generating response: %s", e)
            return None

    @staticmethod
    def extract_relevant_context(prompt: str, context_data: list) -> str:
        """
        Extracts relevant context from past interactions using OpenAI's API.
        
        Args:
            prompt (str): The current user prompt.
            context_data (list): A list of dictionaries containing past interaction data with keys 'role' and 'content'.
        
        Returns:
            str: The extracted relevant context if successful; otherwise, a default message indicating no context found.
        """
        logger.info("Extracting relevant context for prompt: %s", prompt[:100])
        formatted_context = "\n".join([f"- {item['role'].capitalize()}: {item['content']}" for item in context_data])
        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": "Extract relevant details..."},
                    {"role": "user", "content": f"User prompt: {prompt}\n\nPast interactions:\n{formatted_context}"}
                ],
            )
            relevant_context = response.choices[0].message.content.strip()
            logger.info("Extracted relevant context: %s", relevant_context[:100])
            return relevant_context
        except Exception as e:
            logger.error("Error extracting relevant context: %s", e)
            return "No relevant context found."

    @staticmethod
    def generate_summary_and_title(text: str, max_tokens: int = 200, temperature: float = 0.5) -> Optional[dict]:
        """
        Generates both a summary and a title for the given text using OpenAI's API.
        
        The response is expected to contain a title on the first line, followed by the summary in the subsequent lines.
        
        Args:
            text (str): The text to generate a summary and title for.
            max_tokens (int, optional): The maximum number of tokens for the output. Default is 200.
            temperature (float, optional): Sampling temperature for generation. Default is 0.5.
        
        Returns:
            Optional[dict]: A dictionary with keys "title" and "summary" if successful; otherwise, None.
        """
        logger.info("Generating summary and title for text: %s", text[:1000])
        try:
            title = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": "Generate a title(max 5 words) and just answer with the title, for this: " + text}
                ],
            )
            title = title.choices[0].message.content.strip().split("\n")
            summary = client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {"role": "user", "content": "Generate a summary for this" + text}
                ],
            )
            summary = summary.choices[0].message.content.strip().split("\n")
            
            result = {"title": "\n".join(title), "summary": "\n".join(summary)}
            logger.info("Generated title: %s", result["title"])
            logger.info("Generated summary: %s", result["summary"][:100])
            return result
        except Exception as e:
            logger.error("Error generating summary and title: %s", e)
            return None
