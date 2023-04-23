from django.urls import path
from . import views
 
urlpatterns = [ 
    path('api/files/', views.file_list),
    path('api/files/<str:fID>/', views.file_detail),

    path('api/ro/DeleteAllByID/', views.ro_delete_by_ids),
    path('api/thumbnail/<str:fID>', views.get_thumbnail),
    path('api/ro/file/<str:fID>/', views.ro_in_file),
    path('api/ro/', views.ro_create),
    path('api/ro/<str:oID>/', views.ro_detail),
]