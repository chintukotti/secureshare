from fastapi import APIRouter
from app.api.v1 import activity_routes, analytics_routes, auth_routes, dashboard_routes, file_routes, folder_routes, profile_routes, share_routes

api_router = APIRouter(prefix='/api/v1')
api_router.include_router(auth_routes.router)
api_router.include_router(dashboard_routes.router)
api_router.include_router(file_routes.router)
api_router.include_router(folder_routes.router)
api_router.include_router(share_routes.router)
api_router.include_router(analytics_routes.router)
api_router.include_router(activity_routes.router)
api_router.include_router(profile_routes.router)
