import logging
import sys
from logging.handlers import RotatingFileHandler

# ==========================================
# 1. Logger Configuration
# ==========================================
LOG_FILE_NAME = "backend.log"

def setup_logger():
    """
    Configures and returns a logger to be used across the application.
    - Logs to a rotating file (`backend.log`).
    - Also logs to the console (stdout).
    """
    # Create a logger object
    logger = logging.getLogger('mall_map_backend')
    logger.setLevel(logging.INFO) # Set the lowest level of messages to handle

    # Create a formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # --- File Handler ---
    # Rotates logs to prevent the file from becoming too large.
    # Max size 5MB, keeps 3 backup files.
    file_handler = RotatingFileHandler(LOG_FILE_NAME, maxBytes=5*1024*1024, backupCount=3)
    file_handler.setFormatter(formatter)
    
    # --- Console Handler ---
    # Prints logs to the console, which is useful for development and services like Docker.
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # Add handlers to the logger, but only if they haven't been added before
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger

# Create a single logger instance to be imported by other modules
log = setup_logger()
