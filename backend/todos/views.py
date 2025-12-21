import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Todo, User


# ============== AUTH VIEWS ==============

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    """Register a new user"""
    try:
        body = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    username = (body.get("username") or "").strip().lower()
    password = (body.get("password") or "").strip()
    
    if not username or not password:
        return JsonResponse({"error": "Username and password required"}, status=400)
    
    if len(password) < 4:
        return JsonResponse({"error": "Password must be at least 4 characters"}, status=400)
    
    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Username already exists"}, status=400)
    
    user = User.objects.create(username=username, password=password)
    return JsonResponse({"id": user.id, "username": user.username}, status=201)


@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    """Login user"""
    try:
        body = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    
    username = (body.get("username") or "").strip().lower()
    password = (body.get("password") or "").strip()
    
    if not username or not password:
        return JsonResponse({"error": "Username and password required"}, status=400)
    
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "Invalid username or password"}, status=401)
    
    if user.password != password:
        return JsonResponse({"error": "Invalid username or password"}, status=401)
    
    return JsonResponse({"id": user.id, "username": user.username})


# ============== TODO HELPERS ==============

def get_user_from_header(request):
    """Get user from X-User-ID header"""
    user_id = request.headers.get("X-User-ID")
    if not user_id:
        return None
    try:
        return User.objects.get(id=int(user_id))
    except (User.DoesNotExist, ValueError):
        return None


def serialize_todo(t):
    """Serialize a Todo object to dictionary."""
    alarm_time_str = None
    if t.alarm_time:
        if hasattr(t.alarm_time, 'strftime'):
            alarm_time_str = t.alarm_time.strftime("%H:%M")
        else:
            alarm_time_str = str(t.alarm_time)
    
    repeat_days_list = []
    if t.repeat_days:
        try:
            repeat_days_list = json.loads(t.repeat_days)
        except (json.JSONDecodeError, TypeError):
            repeat_days_list = []
    
    return {
        "id": t.id,
        "title": t.title,
        "is_completed": t.is_completed,
        "details": t.details,
        "photo": t.photo.url if t.photo else None,
        "created_at": t.created_at.isoformat() if t.created_at else None,
        "updated_at": t.updated_at.isoformat() if t.updated_at else None,
        "alarm_time": alarm_time_str,
        "repeat_days": repeat_days_list,
        "due_date": t.due_date.isoformat() if t.due_date else None,
    }


def parse_time(time_str):
    """Parse time string to time object."""
    if not time_str:
        return None
    try:
        return datetime.strptime(time_str, "%H:%M").time()
    except ValueError:
        return None


# ============== TODO VIEWS ==============

@csrf_exempt
@require_http_methods(["GET", "POST"])
def todos_list(request):
    """
    GET  /api/todos      -> list all todos for user
    POST /api/todos      -> create new todo for user
    """
    user = get_user_from_header(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    if request.method == "GET":
        todos = Todo.objects.filter(user=user).order_by("-id")
        data = [serialize_todo(t) for t in todos]
        return JsonResponse(data, safe=False)

    # POST: create new todo
    content_type = request.content_type or ""
    
    if "multipart/form-data" in content_type:
        title = (request.POST.get("title") or "").strip()
        details = (request.POST.get("details") or "").strip()
        alarm_time = request.POST.get("alarm_time") or None
        repeat_days = request.POST.get("repeat_days") or ""
        due_date = request.POST.get("due_date") or None
        photo = request.FILES.get("photo")
    else:
        try:
            body = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        title = (body.get("title") or "").strip()
        details = (body.get("details") or "").strip()
        alarm_time = body.get("alarm_time") or None
        repeat_days = body.get("repeat_days") or ""
        due_date = body.get("due_date") or None
        photo = None

    if not title:
        return JsonResponse({"error": "title is required"}, status=400)

    if isinstance(repeat_days, list):
        repeat_days = json.dumps(repeat_days)

    alarm_time_obj = parse_time(alarm_time) if alarm_time else None

    todo = Todo.objects.create(
        user=user,
        title=title,
        details=details,
        alarm_time=alarm_time_obj,
        repeat_days=repeat_days,
        due_date=due_date if due_date else None,
    )

    if photo:
        todo.photo = photo
        todo.save()

    return JsonResponse(serialize_todo(todo), status=201)


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def todo_detail(request, todo_id):
    """
    GET    /api/todos/<id>  -> get single todo
    PATCH  /api/todos/<id>  -> update todo fields
    DELETE /api/todos/<id>  -> delete todo
    """
    user = get_user_from_header(request)
    if not user:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    try:
        todo = Todo.objects.get(id=todo_id, user=user)
    except Todo.DoesNotExist:
        return JsonResponse({"error": "Todo not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(serialize_todo(todo))

    if request.method == "DELETE":
        todo.delete()
        return JsonResponse({"message": "Deleted"}, status=200)

    # PATCH: update fields
    content_type = request.content_type or ""

    if "multipart/form-data" in content_type:
        data = request.POST.dict()
        photo = request.FILES.get("photo")
    else:
        try:
            data = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON"}, status=400)
        photo = None

    if "title" in data:
        todo.title = data["title"].strip()
    if "details" in data:
        todo.details = data["details"]
    if "is_completed" in data:
        todo.is_completed = bool(data["is_completed"])
    if "alarm_time" in data:
        todo.alarm_time = parse_time(data["alarm_time"]) if data["alarm_time"] else None
    if "repeat_days" in data:
        rd = data["repeat_days"]
        todo.repeat_days = json.dumps(rd) if isinstance(rd, list) else rd
    if "due_date" in data:
        todo.due_date = data["due_date"] if data["due_date"] else None
    if photo:
        todo.photo = photo

    todo.save()
    return JsonResponse(serialize_todo(todo))
