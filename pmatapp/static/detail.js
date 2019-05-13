/**
 * Created by Yueqi on 3/10/2016.
 */
function load_movie_detail(){
    //load select movie details
    if ($('.featherlight-content').length > 0){
        $('#msnap').append($('.snapcontent'))
        $('.featherlight-close').click();
    }
    else{
        $('#msnap').load('detail?mid='+setting.mid, function(){
            //remove button
            $(this).find('button').remove()
        })
    }
    load_movie_profile()
}

function load_movie_profile(){
    $('#mdetail').load('dprofile?mid='+setting.mid, function(){
        //draw weight bubble
        $('.p_weight').each(function(){
            var data = $.parseJSON($(this).attr('data'))
            var order = []
            d3.selectAll('.topic').each(function(d,i){
                order[d.tid] = i
            })
            r_scale = d3.scale.log().domain([1, 30, 300]).range([2, 6, 10])
            d3.select(this)
                .append('svg')
                .style('width', '100%')
                .style('height', '17px')
                .attr('viewBox', '0 0 '+20*data.length+' 20')
                .selectAll('w').data(data)
                .enter()
                .append('circle')
                .attr('class', 'weight')
                .attr('fill', function(d){
                    return d_color(d.tid)
                })
                .attr('r', function(d){
                    if (d.w > 0)
                        return r_scale(d.w)
                    else
                        return 0
                })
                .attr('opacity', function(d){
                    if (d.tid == setting.tid)
                    return 1
                    else
                    return 0.4
                })
                .attr('data', function(d){
                    return d.tid
                })
                .attr('cy', 10)
                .attr('cx', function(d){
                    return order[d.tid] * 20 + 10
                })
                .style('cursor','pointer')
                //.attr('title', function(d){
                //    return 'appears in '+ d.w+ ' movies in the theme'
                //})
                .on('mouseover', function(d){
                    var pos = $(this).offset();
                    $('#tooltip')
                        .html(d.w)
                        .css({
                            top: pos.top - 30,
                            left: pos.left - 12
                        })
                        .show()
                })
                .on('mouseout', function(d){
                    $('#tooltip').hide()
                })

        })
        //order by weight
        $('.order').click(function(){
            //update legend
            $('.order').html('\&#9658\;')
            $(this).html('\&#9660\;')
            var order = {}
            d3.select(this.parentNode.parentNode).selectAll('.weight')
                .sort(function(a, b){
                    return b.w - a.w
                })
                .each(function(d, i){
                    order[d.tid] = i * 20 + 10
                })

            d3.selectAll('.p_weight .weight')
                .transition()
                .attr('cx', function(d){
                    return order[d.tid]
                })
            d3.select('#trail').selectAll('.topic').sort(function(a, b){
                return order[a.tid] - order[b.tid]
            })

            var length = $('.topic:not(.filter)').length
            var index = Math.max(0, $('.topic:not(.filter)').index($('.middle')[0]))
            $('.topic:not(.filter)').each(function(i){
                if (Math.abs(i-index) > 1 &&
                    !(index == 0 && i==2) &&
                    !(index == length-1 && i == length-3))
                    $(this).hide()
                else {
                    $(this).show()
                }
            })
            load_snap()
        })

        init_links('#mdetail')
    });
}

function init_links(base){
    //add color to node
    $('.dim').click(function(){
		$(this).toggleClass()
        $(this).nextUntil('.dim').toggle();
    });

    $(base).find('.weight')
        .click(function(){
            var tid = parseInt($(this).attr('data'))
            d3.selectAll('.topic').classed('middle',function(d){
                return d.tid == tid
            })
            change_topic()
        })

    // make hyperlink click able
    d3.select(base).selectAll('.prolink').each(function(){
        d3.select(this).datum(function(){
                return {
                    pid:parseInt($(this).attr('data-pid')),
                    val:$(this).text()
                }
            })
        })
        //higlight snap with same profile id
        .on('mouseover', function(d){
            d3.selectAll('.item').classed('highlight', function(item){
                if (item.load)
                    return $.inArray(d.pid, item.pids) >=0;
                else
                    return false
            })
        })
        .on('mouseout', function(){
            d3.selectAll('.item').classed('highlight', false)
        })
        .on('click', function(d){
            if (d.pid in filter_pid){
                delete filter_pid[d.pid]
            }
            else{
                filter_pid[d.pid] = d.val
            }
            update_filter()
        })
}