from django.urls import path
from .views import todos_list, todo_detail, login, register

urlpatterns = [
    path("auth/login", login),
    path("auth/register", register),
    path("todos", todos_list),
    path("todos/", todos_list),
    path("todos/<int:todo_id>", todo_detail),
    path("todos/<int:todo_id>/", todo_detail),
]