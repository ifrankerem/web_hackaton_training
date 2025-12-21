from django.db import models
from django.utils import timezone

class User(models.Model):
    """Simple user model for authentication"""
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=100)  # Simple password storage
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.username


class Todo(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, related_name='todos')
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    details = models.TextField(blank=True, default="")
    photo = models.ImageField(upload_to="photos/", blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    alarm_time = models.TimeField(blank=True, null=True)
    repeat_days = models.CharField(max_length=100, blank=True, default="")  # JSON: ["Mon","Wed"]
    due_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return self.title