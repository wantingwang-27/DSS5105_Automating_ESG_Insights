## Core Python Application (app/):
***main.py***: Entry point for the project, orchestrating the data pipeline and analysis process.<br>
***config.py***: Central configuration for parameters.<br>
***utils.py***: Common utility functions.

## Modular Scripts:
Organized into logical subdirectories: ***preprocessing/***, ***models/***, and ***esg_scoring/***.<br>
Each module is self-contained with __init__.py for package initialization.

## API (api/):
Serves predictions and key insights.<br>
Includes modular endpoint logic under endpoints/.

## SQL Directory (sql/):
Contains scripts for database setup, initial data loading, and query execution.

## Tests (tests/):
Organized to mirror the application structure for easy maintenance.<br>
Contains unit tests for all critical components.

## Logs (logs/):
Stores runtime logs for execution tracking (optional).

## Docker Setup:
***Dockerfile***: Defines how to containerize the application.<br>
***docker-compose.yml (optional)***: Used if you need to orchestrate multiple services (e.g., database + app).

## Documentation:
***README.md***: Provides an overview, setup instructions, repository structure, and API documentation.

## Environment Files:
***requirements.txt***: Lists dependencies to reproduce the environment.<br>
***.gitignore***: Excludes unnecessary files (e.g., logs/, __pycache__/, virtual environments).

