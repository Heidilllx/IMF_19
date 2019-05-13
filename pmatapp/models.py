from django.db import models

# Create your models here.
from django.db import models


class Catetopic(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    pid = models.IntegerField(blank=True, null=True)
    tid = models.IntegerField(blank=True, null=True)
    cnt = models.IntegerField(blank=True, null=True)
    l_w = models.FloatField(blank=True, null=True)
    g_w = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'catetopic'


class DjangoContentType(models.Model):
    app_label = models.CharField(max_length=100)
    model = models.CharField(max_length=100)

    class Meta:
        managed = False
        db_table = 'django_content_type'
        unique_together = (('app_label', 'model'),)


class DjangoMigrations(models.Model):
    app = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    applied = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_migrations'


class DjangoSession(models.Model):
    session_key = models.CharField(primary_key=True, max_length=40)
    session_data = models.TextField()
    expire_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'django_session'


class Feedback(models.Model):
    feedback = models.TextField(blank=True, null=True)
    rate = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'feedback'


class Itemneigh(models.Model):
    mid = models.IntegerField(primary_key=True)
    list = models.BinaryField(blank=True, null=True)
    t_list = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'itemneigh'


class Itempos(models.Model):
    mid = models.IntegerField(primary_key=True)
    x = models.FloatField(blank=True, null=True)
    y = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'itempos'


class ItemtopicCut(models.Model):
    id = models.CharField(primary_key=True, max_length=20)
    mid = models.IntegerField(blank=True, null=True)
    tid = models.IntegerField(blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'itemtopic_cut'


class Midleft(models.Model):
    mid = models.IntegerField(primary_key=True)

    class Meta:
        managed = False
        db_table = 'midleft'


class Movie(models.Model):
    rate_ave = models.FloatField(blank=True, null=True)
    genres = models.TextField(blank=True, null=True)
    keyword = models.TextField(blank=True, null=True)
    revenue = models.IntegerField(blank=True, null=True)
    overview = models.TextField(blank=True, null=True)
    rate_cnt = models.IntegerField(blank=True, null=True)
    popularity = models.FloatField(blank=True, null=True)
    mid = models.IntegerField(primary_key=True)
    poster = models.CharField(max_length=100, blank=True, null=True)
    crew = models.TextField(blank=True, null=True)
    releasedate = models.DateField(blank=True, null=True)
    cast = models.TextField(blank=True, null=True)
    studio = models.TextField(blank=True, null=True)
    budget = models.IntegerField(blank=True, null=True)
    title = models.CharField(max_length=80, blank=True, null=True)
    runtime = models.IntegerField(blank=True, null=True)
    homepage = models.CharField(max_length=80, blank=True, null=True)
    trailer = models.CharField(max_length=80, blank=True, null=True)
    tids = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'movie'


class Outlink(models.Model):
    mid = models.IntegerField(primary_key=True)
    imdbid = models.IntegerField(db_column='imdbId')  # Field name made lowercase.
    tmdbid = models.IntegerField(db_column='tmdbId')  # Field name made lowercase.

    class Meta:
        managed = False
        db_table = 'outlink'


class Plink(models.Model):
    mid = models.IntegerField(blank=True, null=True)
    pid = models.IntegerField(blank=True, null=True)
    val = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'plink'


class Profile(models.Model):
    pid = models.AutoField(primary_key=True)
    val = models.TextField(blank=True, null=True)
    dim = models.TextField(blank=True, null=True)
    count = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'profile'


class Tsnap(models.Model):
    tid = models.IntegerField(primary_key=True)
    snap = models.BinaryField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tsnap'
