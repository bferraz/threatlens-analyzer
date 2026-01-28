from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from config.settings import Settings
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    
    @classmethod
    async def connect_db(cls, settings: Settings):
        """Connect to MongoDB database"""
        try:
            cls.client = AsyncIOMotorClient(settings.mongodb_url)
            
            # Ping the database to check connection
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB at {settings.mongodb_url}")
            
            # Initialize Beanie with the models
            from models.database_models import SavedAnalysisDocument
            
            await init_beanie(
                database=cls.client[settings.mongodb_db_name],
                document_models=[SavedAnalysisDocument]
            )
            logger.info("Beanie initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise
    
    @classmethod
    async def close_db(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")
