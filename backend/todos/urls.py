from django.urls import path
from .views import todos_api

urlpatterns = [
	path("todos",todos_api), #django api
]