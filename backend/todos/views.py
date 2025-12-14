from django.shortcuts import render

# Create your views here.
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from .models import Todo

@csrf_exempt
@require_http_methods(["GET","POST"])
def todos_api(request): # GET /api/todos -> list all todos
	if request.method == "GET":
		todos = Todo.objects.all().order_by("-id")
		data = [
			{"id": t.id, "title": t.title, "is_completed": t.is_completed}
			for t in todos
		]
		return JsonResponse(data, safe=False)
	
	#POST /api/todos -> create new todo
	try:
		body = json.loads(request.body.decode("utf-8"))
	except json.JSONDecodeError:
		return JsonResponse({"error": "Invalid JSON"},status = 400)
	
	title = (body.get("title") or "").strip()
	if not title: #title boş mu?
		return JsonResponse({"error": "title is required"},status= 400)
	#database e kayıt!!		
	todo = Todo.objects.create(title=title,is_completed=False)

	return JsonResponse(
		{"id": todo.id,"title": todo.title, "is_completed": todo.is_completed},
		status = 201
	)
