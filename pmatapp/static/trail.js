/**
 * Created by Yueqi on 2/23/2016.
 */
var setting = {
    tids: [],
    tid: 2,
    mid: 2617,
}

var d_color = d3.scale.ordinal().range([
    '#1f573b',
    '#1f5757',
    '#1f3b57',
    '#57571f',
    '#571f57',
    '#571f1f',
    '#573b1f',
    '#3b1f57',
    '#312212',
    '#3b571f']
)

function load_trail_frame(){
    d3.json('topic_list', function(d){
        setting.tids = d;

        //assign color
        var array = []
        $.each(d, function(tid){
            array.push(tid)
        })
        d_color.domain(array)

        //update_overview_color();
        load_movie_detail()
        load_topic_trail()
    })
}

//put 100 topic there
function initial_trail(){
    $('#trail').sortable( {
        handle: '.sidebtn',
        //cancel: ".ui-state-disabled",
        stop  : function(event,ui){
            $('.order').html('\&#9658\;')
            var order = {}
            var i = 0
            $('.topic').each(function(){
                order[d3.select(this).datum().tid] = i * 20 + 10
                i ++
            })

            d3.selectAll('.p_weight .weight')
                .transition()
                .attr('cx', function(d){
                    return order[d.tid]
                })
        }
    } );

    var t_data = []
    for (var i =0; i<100; i++){
        t_data.push({tid:i})
    }
    var topic = d3.select('#invisible_topic')
        .selectAll('topic')
        .data(t_data)
        .enter()
        .append('div')
        .attr('id', function(d){
            return 'topic'+ d.tid
        })
        .attr('class', 'topic')

    topic.append('div')
        .classed('sidebtn', true)
        .append('img')
        .classed('end', true)
        .style('width', '80%')
        .style('margin-right', '20%')
        .attr('src','pmatapp/static/left.png')
        .on('click', function(){
            move_right()
        })

    topic.append('div')
        .classed('itemwrap', true)
        .append('div')
        .style('width', '150%')
        .style('height', '100%')

    topic.append('div')
        .classed('sidebtn', true)
        .append('img')
        .style('width', '80%')
        .style('margin-left', '20%')
        .attr('src','pmatapp/static/right.png')
        .on('click', function(){
            move_left()
        })

    $('.sidebtn').click(function(){
        if (!$(this).parent().hasClass('middle')){
            $('.middle').removeClass('middle')
            $(this).parent().addClass('middle')
            change_topic()
        }
    })
}

function load_topic_trail(){
    //d3.select('#trail').html('');
    //$('.topic').hide()
    $('.middle').removeClass('middle')
    $('.topic').appendTo($('#invisible_topic'))
    d3.selectAll('.topic')
        .each(function(d){
            if (d.tid in setting.tids){
                d.dist = setting.tids[d.tid].dist
                $('#trail').append(this)
            }
        })
    d3.select('#trail').selectAll('.topic')
        .sort(function(a, b){
            return b.dist - a.dist
        })

    var cnt = 0;
    $.each(setting.tids, function(tid, d){
        var cur = $('#topic'+ tid);
        //cur.show();
        if (d.center)
            cur.addClass('middle')
        cur.css({
            background: d_color(tid)
        })

        if (cur.find('.itemwrap div').length == 1){
            d3.json('get_topic_strip?tid='+ tid, function(error, ms){
                d3.select('#topic'+tid+' .itemwrap div')
                    .selectAll('item').data(ms).enter()
                    .append('a')
                    .classed('item',true)
                    .each(function(m){
                        m.order = m.mid in d.order ? d.order[m.mid] : 0
                        create_snap(d3.select(this))
                    })
                    .sort(order_func)
                cnt += 1
                if (cnt == Object.keys(setting.tids).length){
                    change_topic()
                    fliter_trail()
                }
            })
        }
        else{
            d3.select('#topic'+tid).selectAll('.item').each(function(m){
                if (m.mid in d.order){
                    m.order = d.order[m.mid]
                }
                else{
                    m.order = 0
                }
            })
            .sort(order_func)
            cnt += 1;
            if (cnt == Object.keys(setting.tids).length){
                change_topic()
                fliter_trail()
            }
        }
    })
}

function load_snap(){
    //load first 7 items after start index
    $('.topic:visible').each(function(){
        var start = $(this).find('.item:visible:first')
        if (start.length == 0){
            start= $(this).find('.item:not(.filter):last')
            start.show()
            return
        }
        var cnt = 0
        while (cnt < 7){
            if (start.hasClass('filter')){
                start = start.next();
                continue
            }
            d3.select(start[0])
                .each(function(d){
                    if (!d.load){
                        d.load = true;

                        if ($(this).parents('.middle').length){
                            if ($.inArray(d.mid, visited_item)<0){
                                visited_item.push(d.mid.toString())
                                set_visited_in_overview(d.mid)
                            }
                        }

                        $(this).load('snap?mid='+ d.mid, function(){
                            d.pids = JSON.parse($(this).find('.pid').attr('pid'))
                        })
                    }
                })
                .on('mouseover', function(d){
                    var pids = d.pids
                    $('.prolink').each(function(){
                        if ($.inArray(parseInt($(this).attr('data-pid')), pids) >= 0){
                            $(this).addClass('comp')
                        }
                    })

                })
                .on('mouseout', function(){
                    $('.prolink').removeClass('comp')
                })
            start = start.next();
            cnt ++
        }
    })
}
