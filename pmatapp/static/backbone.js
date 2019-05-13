/**
 * Created by Yueqi on 3/10/2016.
 */
var visited_topic = {}
var visited_item = []
function initial_overview(){
    initial_trail()

    //if catalog exist, load catalog
    d3.json('getcatalog', function(d){
        if (d.length > 0){
            d3.select('#collection').selectAll('cata').data(d)
                .enter()
                .append('div')
                .attr('class','collect')
                .each(function(){
                    draw_catalog(d3.select(this))
                })
        }
    })
    // if history exist, load history, else load one item
    d3.json('history', function(d){
        if (d.length == 0){
            visit(5618)
        }
        else{
            //load history
            var last = d.pop()
            visited = []

            d3.select('#wraphistory')
                .selectAll('snap')
                .data(d)
                .enter()
                .append('a')
                .each( function(d){
                    visited.push(d.mid)
                    var base = d3.select(this)
                    create_history_snap(base)
                })
            visit(last.mid)
        }
    })
    setTimeout(draw_overview, 15000)
}

function create_history_snap(base){
    base.classed('history', true)
        .on('mouseover', function(d){
            var pos = $(this).offset();
            $('#tooltip')
                .html(d.title)
                .css({
                    top: pos.top - 30,
                    left: pos.left - 12
                })
                .show()

            d3.select(this).select('img').classed('desaturate', false)
        })
        .on('mouseout', function(){
            $('#tooltip').hide()
            d3.select(this).select('img').classed('desaturate', true)
        })
        .each(function(d){
            d3.json('sdata?mid='+ d.mid, function(p){
                d.title = p.title
                d.poster = p.poster
                create_snap(base)

                base.select('img')
                    .classed('desaturate', true)
            })
        })
}

function create_snap(base){
    base.attr('title', 'Click to see details')
        .attr('href', function(d){
            return "detail?mid="+ d.mid
        })
        .attr('data-featherlight', 'ajax')
        //.text(function(d){return d.mid})
        //.attr('id', function(d){return 'mt-'+ d.mid+'-'+ t.tid})
        .attr('draggable', "true")
        .attr('ondragstart', "drag(event)")

    base.append('img')
        .attr('src', function(d){return d.poster})

    //
    //base.append('a')
    //    .attr('href', function(d){return "detail?mid="+d.mid})
    //    .attr('data-featherlight', 'ajax')
    //    .append('img')
    //    .attr('src', function(d){return d.poster})
    //    .attr('ondrag');
}

var dragdata = null
function drag(ev) {
    dragdata = {
        title : $(ev.target).find('.title').attr('data'),
        poster : $(ev.target).find('img').attr('src'),
        mid : d3.select(ev.target).datum().mid
    }
}

function allowDrop(ev){
    ev.preventDefault();
}

function add_to_dragdata(mid, title, poster){
    dragdata = {
        title: title,
        mid: mid,
        poster: poster
    }
}

function add_to_collection(mid, title, poster){
    add_to_dragdata(mid, title, poster)
    drop()
}

function drop(ev) {
    var flag = true
    d3.selectAll('.collect').each(function(d){
        if (d.mid == dragdata.mid){
            flag = false;
            return false
        }
    })
    if (flag){
        $.get('catalog?data='+JSON.stringify(dragdata), function(){
            console.log('upload')
        })

        if (ev)
            ev.preventDefault();

        var base = d3.select('#collection')
            .append('div')
            .datum(dragdata)
            .attr('class','collect')

        draw_catalog(base)
    }
    dragdata = null
}

function draw_catalog(base){
    base.append('a')
        .attr('href', function(d){return "detail?mid="+d.mid})
        .attr('data-featherlight', 'ajax')
        .append('img')
        .attr('src', function(d){return d.poster});
    base.append('div')
        .text(function(d){return d.title})

    base.append('text')
        .text('x')
        .style('position','absolute')
        .style('cursor','pointer')
        .style('right','10px')
        .style('top', '0px')
        .on('click', function(){
            d3.select(this.parentNode).remove()
        })

    d3.json('outlink?mid='+base.datum().mid, function(d){
        base.append('a')
            .text('imdb')
            .attr('target',"_blank")
            .attr('href', 'http://www.imdb.com/title/tt'+d.imdb)
        base.append('br')
        base.append('a')
            .text('watch')
            .attr('target',"_blank")
            .attr('href', 'https://www.fan.tv/movies/'+d.tmdb)
    })
}

function start(){
    visited_topic = {}
    // load all topic lists
    $.get('set?mid='+setting.mid, function(){
        load_trail_frame()
    })
}

//only animations
var duration = 500,
    up = { direction: 'up'},
    down = { direction: 'down'}

var f = parseFloat($('#order').val())
function order_func(a,b){
    if (b.order == a.order)
        return b.weight - a.weight
    else
        return (b.order + f * b.w) - (a.order + f * a.w)
}

function set_interaction() {
    $('#overview_btn').click(function(){
        $('#overview-wrap').show()
    });
    $('#overview_close').click(function(){
        $('#overview-wrap').hide()
    });

    $('#feedback_btn').click(function(){
        $('#feedback').show()
    })
    $('#feedback_close').click(function(){
        $('#feedback').hide()
    });
    $('#feedback_form').submit(function(e){
        e.preventDefault();
        $.ajax({
            url: 'feedback',
            type: 'post',
            data:$('#feedback_form').serialize(),
            success: function(){
                $('#feedback').hide()
            }
        })
    });
    $('#feedback').hide()


    $('#visited').change(function (d) {
        if ($(this).is(':checked')) {
            d3.selectAll(".item").each(function (d) {
                if ($.inArray(d.mid, visited_item) < 0) {
                    $(this).removeClass('visited')
                }
                else {
                    $(this).addClass('visited')
                }
            })
            load_snap()
        }
        else {
            $('.item').removeClass('visited')
        }
    })

    Split(['#trailwrap', '#overview'], {
        sizes: [76, 24],
    });
    //$("#detail").tabs();
    $("#overview").tabs({
        select: function (event, ui) {
            if (ui.panel.id == 'summary-wrap') {
                if ($('#summary-wrap').is(':empty')) {
                    load_topic_profile_page()
                }
            }
        }
    });
    f = 2000
    $('#slider').slider({
        value:2000,
        min: 0,
        max: 10000,
        step: 50,
        slide: function( event, ui ) {
            f = ui.value
            d3.selectAll('.topic').each(function () {
                d3.select(this).selectAll('.item').sort(order_func)
            })
            load_snap()
        }
    })

    $('#cleanhistory').click(function () {
        $.get('cleanhistory', function () {
            $('#history_title').text("")
            $('.history').last().prevAll().remove()
        })
    })
    $('#cleancollection').click(function () {
        $.get('cleancatalog', function(){
            d3.selectAll('.collect').remove()
        })
    })
    $('#reset_visit').click(function () {
        visited_item = []
        d3.selectAll('.over').classed('visited_dot', false)
    })

    $("#searchbox").autocomplete({
        source: "search",
        minLength: 2,
        select: function (event, ui) {
            $('#dummy').attr('href', "detail?mid="+ui.item.id)
            $('#dummy').click()
            //visit(ui.item.id)
            $(this).val('')
            return false;
        }
    });
    $('#filtersearch').autocomplete({
        source: "filtersearch",
        minLength: 2,
        select: function (event, ui) {
            filter_pid[ui.item.id] = ui.item.label;
            update_filter()
            $(this).val('')
            return false;
            //$('#filtersearch').hide()
        }
    })
    $('#overview_help').click(function () {
        $('#help_context').show()
    })
    $('#leftlable').hide()

    $('body').keydown(function (event) {
        switch (event.which) {
            //up:
            case 38:
                move_up()
                break;
            //down:
            case 40:
                move_down()
                break;
            //left (hide the first one):
            case 39:
                move_left()
                break;
            //right (every item on left should have be loaded, no need to reload):
            case 37:
                move_right()
                break;
        }
    });

    $('#trail')
        .on('wheel', function (e) {
            clearTimeout(wheeling);
            wheeling = setTimeout(function () {
                //console.log('stop wheeling!');
                wheeling = undefined;
                if (wheeldelta < 0) {
                    move_up()
                }
                else if (wheeldelta > 0) {
                    move_down()
                }
                wheeldelta = 0;
            }, 250);

            wheeldelta += e.originalEvent.deltaY;

            //console.log(wheeldelta);
        })
        .swipe({
            //Generic swipe handler for all directions
            swipe: function (event, direction, distance, duration, fingerCount, fingerData) {
                $(this).text("You swiped " + direction);
            }
        });
}

var wheeldelta = 0
var wheeling = undefined

function move_up(){
    var prev = $('.middle').prevAll(':not(.filter)')
    if (prev.length > 0){
        $('.middle').removeClass('middle')
        prev.first().addClass('middle')
        change_topic()
    }
}

function move_down(){
    var next = $('.middle').nextAll(':not(.filter)')
    if (next.length > 0){
        $('.middle').removeClass('middle')
        next.first().addClass('middle')
        change_topic()
    }
}

function move_left(){
    var first = $('.middle').find('.item:visible:first').hide();
    //reload if visible
    $('.middle').find('.sidebtn:first').find('img').removeClass('end')
    load_snap('.middle')
}

function move_right(){
    var start = $('.middle').find('.item:visible:first').prev()

    if (start.length==0){
        $('.middle').find('.sidebtn:first').find('img').addClass('end')
    }
    else{
        while(start.length>0 && start.hasClass('filter')){
            start = start.prev()
        }
        start.show()
    }
}

function change_topic(){
    //add visible items in the middle lane to visited list
    var cnt = 0
    var start = $('.middle').find('.item:visible:first')[0]
    while(cnt<6){
        d3.select(start).each(function(d){
            if ($.inArray(d.mid, visited_item)<0){
                visited_item.push(d.mid)
                set_visited_in_overview(d.mid)
            }
        })
        start = $(start).next(':visible')[0]
        cnt += 1
    }

    var length = $('.topic:not(.filter)').length
    var index = Math.max(0, $('.topic:not(.filter)').index($('.middle')[0]))
    d3.select('.middle').style('border-color', function(d){
        setting.tid = d.tid
        return d_color(d.tid)
    })
    $('.topic:not(.filter)').each(function(i){
        if (Math.abs(i-index) > 1 &&
            !(index == 0 && i==2) &&
            !(index == length-1 && i == length-3))
            $(this).hide()
            //$(this).addClass('hide')
        else {
            $(this).show()
            //$(this).removeClass('hide')
        }
    })
    d3.selectAll('.weight').attr('opacity', function(d){
        if (d.tid == setting.tid)
            return 1
        else
            return 0.4
    })

    load_snap()
    load_topic_profile()
}

// keep the source topic
var visited = [];

function visit(mid){
    $('#msnap').html('')
    $('#mdetail').html('')

    var flag = true;
    d3.select('#wraphistory').selectAll('a').each(function(d){
        if (d.mid == mid){
            $(this).parent().append($(this));
            flag = false;
            return false
        }
    })
    if (flag){
        visited.push(mid);
        d3.select('#wraphistory')
            .append('a')
            .each(function(){
                var base = d3.select(this);
                base.datum({mid:mid});
                create_history_snap(base)
            })
    }

    setting = {
        tids: [],
        mid: mid,
    }
    start()
}
function remove_movie(mid){
    d3.selectAll('.item').each(function(d){
        if (d.mid == mid){
            $(this).hide()
        }
    })
    $('.featherlight-close').click()
}

function binding(url){
    $.featherlight($('a'),
        {
            iframe: url,
            iframeWidth: '100%',
            iframeHeight: 500,
        });
}

var filter = []
var filter_pid = []
function clearfilter(){
    $('#leftlable').hide()
    $('#filter').text('')
    filter = []
    filter_pid = []
    d3.selectAll('.filter').classed('filter', false)
    d3.selectAll('.filter_key').classed('filter_key', false)
    $('#leftlist').html('')
    //change_topic()
    load_snap()
}

function fliter_trail(){
    if (Object.keys(filter_pid).length == 0)
        return

    d3.selectAll('.item')
        .style('display', '')
        .classed('filter', function(d){
            return $.inArray(d.mid, filter) < 0
    })
    d3.selectAll('.topic')
        .style('display', '')
        .classed('filter', function(){
        if($(this).children(':not(.filter)').length > 0){
            return false;
        }
        else{
            return true;
        }
    })
    var index = $('.topic:not(.filter)').index($('.middle')[0])
    if (index < 0){
        $('.middle').removeClass('middle')
        $('.topic:not(.filter)').first().addClass('middle')
    }

    d3.selectAll('.over')
        .classed('filter', function(d){
            return $.inArray(d.mid, filter) < 0
        })
    load_snap()
}

function update_filter(){
    if (Object.keys(filter_pid).length == 0 ){
        clearfilter()
        return
    }

    //highlight profile row
    d3.selectAll('.prolink').each(function(d){
        if (d.pid in filter_pid){
            $(this).parents('.row').addClass('filter_key')
        }
        else{
            $(this).parents('.row').removeClass('filter_key')
        }
    })
    //update filter text
    $('#filter').html('')
    var pids = Object.keys(filter_pid)
    d3.select('#filter')
        .selectAll('text')
        .data(pids)
        .enter()
        .append('span')
        .on('click', function(d){
            delete filter_pid[d]
            delete filter_pid[d]
            update_filter()
        })
        .text(function(d){
            return filter_pid[d]+' x  '
        })

    d3.json('p2item?pids='+JSON.stringify(pids), function(mid){
        $('#leftlable').show()
        $('#leftlist').html('')
        filter = mid
        fliter_trail()

        //TODO: More filter result
        //update other list
        var toplist = []
        d3.selectAll('.topic').each(function(d){
            d3.select(this).selectAll('.item').each(function(d, i){
                if (i < 40 && $.inArray(d.mid, toplist)){
                    toplist.push(d.mid)
                }
            })
        })
        var data = []
        for (var i=0; i<filter.length; i++){
            //not visited yet
            if ($.inArray(filter[i], visited_item) < 0 && $.inArray(filter[i], toplist)<0){
                data.push(filter[i])
            }
        }
        //get order and poster
        $.post('morder', {
                csrfmiddlewaretoken:token,
                mids: data
            },function(d){
                d3.select('#leftlist')
                .selectAll('left').data(d)
                .enter()
                .append('a')
                .classed('left_item', true)
                .on('mouseover', function(d){
                    var pos = $(this).offset();
                    $('#tooltip')
                        .html(d.title)
                        .css({
                            top: pos.top - 30,
                            left: pos.left - 12
                        })
                        .show()
                })
                .on('mouseout', function(){
                    $('#tooltip').hide()
                })
                .each(function(){
                    create_snap(d3.select(this))
                })
        },'json')

        //d3.json('morder?data='+JSON.stringify(data), function(d){
        //
        //})
    })
}