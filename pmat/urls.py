"""pmat URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import include, url
from pmatapp import views as pmat
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
                  # url(r'^admin/', include(admin.site.urls)),
                  path('admin/', admin.site.urls),
                  url(r'^$', pmat.register),
                  url(r'^set', pmat.get_new_setting),
                  url(r'^detail', pmat.get_details),
                  url(r'^dprofile', pmat.get_details_profile),

                  url(r'^sdata', pmat.get_snapdata),
                  url(r'^snap', pmat.get_snap),
                  url(r'^outlink', pmat.get_outlink),
                  url(r'^p2item', pmat.item_from_profile),
                  # url(r'^item_list', pmat.getlist),

                  url(r'^topic_snap', pmat.get_topic_snap),
                  url(r'^search', pmat.search),
                  url(r'^filtersearch', pmat.profilesearch),
                  url(r'^neigh', pmat.get_neigh),
                  url(r'^get_biggest_topic', pmat.biggest_topic),
                  url(r'^feedback', pmat.feedback),

                  url(r'^get_topic_strip', pmat.get_strip),
                  url(r'^topic_list', pmat.get_topic_list),
                  url(r'^overview$', pmat.get_overview),
                  url(r'^morder', pmat.get_morder),

                  url(r'^history$', pmat.get_cookie_history),
                  url(r'^cleanhistory$', pmat.clear_history_cookie),

                  url(r'^catalog', pmat.add_cookie_catalog),
                  url(r'^getcatalog$', pmat.get_cookie_catalog),
                  url(r'^cleancatalog$', pmat.clear_catelog_cookie),
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
