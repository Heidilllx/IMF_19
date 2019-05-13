from django.shortcuts import render
from django.template.loader import render_to_string
from pmatapp import models
from django.http import HttpResponse
from collections import *
import json

# Create your views here.
# for new user
cate = ['genres', 'keyword', 'crew', 'cast', 'studio']


def register(request):
    request.session['left'] = [m.mid for m in models.Midleft.objects.all()]
    return render(request, 'trailindex.html')


# change start point, change topic
# update cookie
def get_new_setting(request):
    # the focus item is changed, change neighbor
    # coordinates stay same
    mid = int(request.GET['mid'])
    request.session['mid'] = mid

    resp = HttpResponse('success', content_type='text')
    if 'lasttrail' in request.COOKIES:
        trail = json.loads(request.COOKIES['lasttrail'])
        if not any(d['mid'] == mid for d in trail):
            trail.append({'mid': mid})
        resp.set_cookie('lasttrail', json.dumps(trail))
    else:
        resp.set_cookie('lasttrail', json.dumps([{'mid': mid}]))

    return resp


def get_cookie_history(request):
    res = '[]'
    if 'lasttrail' in request.COOKIES:
        res = request.COOKIES['lasttrail']
    return HttpResponse(res)


def clear_history_cookie(request):
    resp = HttpResponse('success', content_type='text')
    resp.set_cookie('lasttrail', '[]')
    return resp


def add_cookie_catalog(request):
    data = json.loads(request.GET['data'])
    resp = HttpResponse('success', content_type='text')
    if 'catalog' in request.COOKIES:
        trail = json.loads(request.COOKIES['catalog'])
        trail.append(data)
        resp.set_cookie('catalog', json.dumps(trail))
    else:
        resp.set_cookie('catalog', json.dumps([data]))
    return resp


def get_cookie_catalog(request):
    res = '[]'
    if 'catalog' in request.COOKIES:
        res = request.COOKIES['catalog']
    return HttpResponse(res)


def clear_catelog_cookie(request):
    resp = HttpResponse('success', content_type='text')
    resp.set_cookie('catalog', '[]')
    return resp


# input: mid, tid(for highlighting)
# a template to show movie detail
def get_details(request):
    m = models.Movie.objects.get(mid=request.GET['mid'])
    res = {}
    res['left'] = m.mid in request.session['left']
    res['mid'] = m.mid
    res['title'] = m.title
    res['year'] = m.releasedate.year
    res['release'] = m.releasedate
    res['rate'] = "%.1f" % m.rate_ave
    res['width'] = m.rate_ave * 20
    res['cnt'] = m.rate_cnt
    res['run'] = m.runtime
    res['genres'] = ', '.join(json.loads(m.genres))
    starlist = []
    for star in json.loads(m.cast):
        starlist.append(star['name'])
    res['star'] = ', '.join(starlist[:5])

    crewlist = defaultdict(list)
    for crew in json.loads(m.crew):
        crewlist[crew['job']].append(crew['name'])
    res['crew'] = dict(crewlist)
    topjob = ['Director', 'Producer', 'Writer', 'Screenplay']
    res['topjob'] = [{'job': j, 'names': ', '.join(crewlist[j])} for j in topjob if j in crewlist]

    if m.poster is None:
        res['poster'] = '/pmatapp/static/placeholder.jpg'
    else:
        res['poster'] = m.poster.replace('original', 'w185')
    if m.trailer is not None:
        res['trailer'] = m.trailer.replace('watch?v=', 'embed/')
    res['overview'] = m.overview

    m = models.Outlink.objects.get(mid=request.GET['mid'])
    res['imdb'] = m.imdbid
    res['tmdb'] = m.tmdbid

    return render(request, 'detail.html', res)


def get_details_profile(request):
    m = models.Movie.objects.get(mid=request.GET['mid'])
    tids = json.loads(models.Itemneigh.objects.get(mid=request.session['mid']).t_list)

    ps = models.Plink.objects.filter(mid=request.GET['mid'])
    dim = defaultdict(list)
    pid = set()
    for p in ps:
        if p.pid in pid:
            continue
        pid.add(p.pid)
        ws = []
        for tid in tids:
            try:
                w = models.Catetopic.objects.get(id=str(p.pid) + '-' + str(tid)).cnt - 1
                top = w > 5
                if p.pid.dim == 'genres':
                    top = w > 50
                if p.pid.dim == 'release':
                    top = w > 20

                ws.append({'tid': tid, 'w': w, 'top': top})
            except:
                # print (tid, p.pid_id)
                ws.append({'tid': tid, 'w': -1})
                continue
        obj = {'val': p.pid, 'ws': json.dumps(ws), 'len': len([w for w in ws if w['w'] > 0]), 'pid': p.pid}
        if p.val is not None:
            obj['job'] = p.val
        profile = models.Profile.objects.get(pid=p.pid)
        dim[profile.dim].append(obj)
    # request.session['visited'].append(request.GET['mid'])
    res = {}
    res['mid'] = m.mid
    res['title'] = m.title
    res['release'] = m.releasedate.year
    res['genres'] = ', '.join(json.loads(m.genres))
    res['run'] = m.runtime
    res['width'] = m.rate_ave * 20
    res['poster'] = m.poster.replace('original', 'w185')
    res['ws'] = tids
    res['dims'] = [{'key': k, 'val': dim[k]} for k in ['release', 'genres', 'cast', 'crew', 'keyword', 'studio'] if
                   k in dim]
    # res['title'] = m.title
    return render(request, 'detail_profile.html', res)


def get_snapdata(request):
    m = models.Movie.objects.get(mid=request.GET['mid'])
    return HttpResponse(json.dumps(
        {
            'title': m.title + '(' + str(m.releasedate.year) + ')',
            'poster': m.poster.replace('original', 'w185'),
            'rate': int(m.rate_ave * 10) / 10.0,
        }))


def get_snap(request):
    m = models.Movie.objects.get(mid=request.GET['mid'])
    return render(request, 'snap.html',
                  {
                      'title': m.title,
                      'year': m.releasedate.year,
                      'poster': m.poster.replace('original', 'w185'),
                      'rate': int(m.rate_ave * 10) / 10.0,
                      'width': m.rate_ave * 20,
                      'cnt': m.rate_cnt,
                      'pid': json.dumps([p.pid for p in models.Plink.objects.filter(mid=m.mid)])
                  })


# no input
# return: tid list with mids
from django.db.models.aggregates import Max
import zlib


def get_topic_list(request):
    item_neigh = models.Itemneigh.objects.get(mid=request.session['mid'])
    return HttpResponse(zlib.decompress(item_neigh.list))


def get_strip(request):
    tw = models.ItemtopicCut.objects.filter(tid=request.GET['tid']).aggregate(Max('weight'))['weight__max']
    return HttpResponse(json.dumps([{'mid': m.mid,
                                     'w': m.weight * 1.0 / tw
                                     } for m in models.ItemtopicCut.objects.filter(tid=request.GET['tid'])]))


def get_overview(request):
    return HttpResponse(json.dumps([{'mid': i.mid,
                                     # 'poster': i.mid.poster.replace('original', 'w92'),
                                     'x': i.x,
                                     'y': i.y
                                     } for i in models.Itempos.objects.all()]))


def create_topic_snap(tid):
    mids = []
    for m in models.ItemtopicCut.objects.filter(tid=tid).order_by('-weight')[:12]:
        mids.append({
            'mid': m.mid,
            # 'title': unicode(m.mid.title),
            'title': m.mid.title,
            'mid': m.mid,
            'poster': m.mid.poster.replace('original', 'w185')
        })
    pids = defaultdict(list)
    tool_tmp = {
        'release': '%(l)s movies in this strip | %(g)s in all movies',
        'genres': '%(l)s movies in this strip | %(g)s in all movies',
        'cast': '%(l)s movies in this strip | %(g)s in all movies',
        'crew': '%(l)s movies in this strip | %(g)s in all movies',
        'keyword': '%(l)s movies in this strip | %(g)s in all movies',
        'studio': '%(l)s movies in this strip | %(g)s in all movies'
    }
    t_size = models.ItemtopicCut.objects.filter(tid=tid).count()
    for p in models.Catetopic.objects.exclude(l_w__isnull=True).filter(tid=tid).filter(cnt__gte=10).order_by('-g_w'):
        pids[p.pid.dim].append({
            # 'val': unicode(p.pid.val),
            'val': p.pid.val,
            'g_cnt': p.pid.count * 1.0 / 8600,
            'g_rare': p.pid.count,
            'cnt': p.cnt * 1.0 / t_size,
            'l_rare': p.cnt,
            # 'pid': p.pid_id
            'pid': p.pid
        })

    p = []
    for dim in ['release', 'genres', 'cast', 'keyword', 'studio', 'crew']:
        if dim not in pids:
            continue
        tmp = sorted(pids[dim][:4], key=lambda k: k['cnt'], reverse=True)
        for t in tmp:
            t['tool'] = tool_tmp[dim] % {'l': t['l_rare'], 'g': t['g_rare']}
            # t['tool2'] = tool_tmp[dim][1]%{'c':"%.1f" % (t['g_cnt']*100)+'%','n':t['val'],'p':t['g_rare']}
        p.append({'dim': dim, 'p': tmp})
    data = {'mid': mids, 'pid': p, 'tid': tid, 'size': t_size}
    try:
        rendered = render_to_string('topic_snap.html', data)
        models.Tsnap(tid=tid, snap=zlib.compress(rendered)).save()
    except:
        return [data, True]

    return [rendered, False]


def get_topic_snap(request):
    tid = request.GET['tid']
    try:
        data = zlib.decompress(models.Tsnap.objects.get(tid=tid).snap)
    except:
        [data, flag] = create_topic_snap(tid)
        if flag:
            return render(request, 'topic_snap.html', data)

    return HttpResponse(data)


def search(request):
    term = request.GET['term']
    res = []
    for p in models.Movie.objects.filter(title__iregex='[[:<:]]' + term + '[[:>:]]').order_by('-popularity')[:10]:
        if p.mid in request.session['left']:
            res.append({'id': p.mid, 'label': p.title})

    return HttpResponse(json.dumps(res))


def profilesearch(request):
    term = request.GET['term']
    res = []
    for p in models.Profile.objects.filter(val__contains=term).order_by('-count')[:10]:
        res.append({'id': p.pid, 'label': p.val})

    return HttpResponse(json.dumps(res))


def biggest_topic(request):
    return HttpResponse(models.ItemtopicCut.objects.filter(mid=request.GET['mid']).order_by('-weight')[0].tid)


# from django.db.models.aggregates import Count
def item_from_profile(request):
    pids = json.loads(request.GET['pids'])
    res = [m.mid for m in models.Plink.objects.raw(
        'select id, mid from plink where pid in %s group by id,mid having count(distinct(mid*100000+pid))=%s',
        (pids, len(pids)))]
    # print(res)
    return HttpResponse(json.dumps(res))


def get_outlink(request):
    tmp = models.Outlink.objects.get(mid=request.GET['mid'])
    return HttpResponse(json.dumps({'imdb': tmp.imdbid, 'tmdb': tmp.tmdbid}))


import heapq


def get_neigh(request):
    res = set()
    for m in models.Itemneigh.objects.filter(mid=request.GET['mid']):
        # print(m.list)
        d = json.loads(m.list)
        k = heapq.nlargest(int(len(d) / 3), d, key=d.__getitem__)
        res |= set(k)
    return HttpResponse(json.dumps([int(t) for t in res]))


def get_morder(request):
    res = []
    for m in models.Movie.objects.filter(mid__in=request.POST.getlist('mids[]')).order_by('-popularity')[:20]:
        res.append({
            'mid': m.mid,
            'poster': m.poster.replace('original', 'w185'),
            'title': m.title
        })
    return HttpResponse(json.dumps(res))


def feedback(request):
    models.Feedback(rate=request.POST['rate'], feedback=request.POST['comments']).save()
    return HttpResponse('success', content_type='text')
