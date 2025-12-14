from django.db import models

# Create your models here.

class Todo(models.Model): #database tablosu olacak sınıf
    title = models.CharField(max_length=200) #database de görev ismi
    is_completed= models.BooleanField(default=False) #database de görev yapıldı yapılmadı?
    
def __str__(self):
    return self.title