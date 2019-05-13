/**
 * Created by Yueqi on 3/8/2016.
 */
//var r_size = d3.scale.linear().range([5, 20]).domain([3, 4000])
//var d_color = d3.scale.category10()

//load detail view
var width =800,
    height= 600,
    ox = d3.scale.linear().range([10, width-10]),
    oy = d3.scale.linear().range([height-10, 10]);

var timer;
function zoomed() {
  d3.select('#overview_svg')
      .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
}

function draw_overview(){
    $('#preview')
        .attr('data-featherlight', 'ajax')
        .hide()
    var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

    d3.json('overview', function(data){
        for (var i in data){
            data[i].visit = 0
        }
        ox.domain([d3.min(data, function(d){return d.x}), d3.max(data, function(d){return d.x})])
        oy.domain([d3.min(data, function(d){return d.y}), d3.max(data, function(d){return d.y})])

        var svg = d3.select('#overview-svg-wrap').append('svg')
            .attr('viewBox','0 0 '+width+' '+height)
            .style('height','100%')
            .style('width','100%')
            .append('g')
            .attr('id','overview_svg')
            //.attr("transform", "translate(200, 200) scale(2)")
            .call(zoom);

        svg.append('rect')
            .attr("width", width)
            .attr("height", height)
            .style("fill", "white")
            //.style("pointer-events", "all")
            .on('click', function(){
                reset_relate()
            });

        var over = svg.selectAll('pos')
            .data(data).enter()
            .append('circle')
            .attr('class','over')
            .attr('id', function(d){
                return 'over-'+ d.mid
            })
            .on('click', function(d){
                if (!d3.select(this).classed('selected')){
                    show_neigh(d)
                }
                else{
                    reset_relate()
                }
            })
            .attr('cx',function(d){return ox(d.x)})
            .attr('cy',function(d){return oy(d.y)})
            .attr('r', 5)
            .attr('stroke','gray')
            .attr('fill', 'white')
            .attr('stroke-weight', 1)
    })
}

function reset_relate(){
    $('#preview').hide()
    d3.selectAll('.selected').classed('selected', false)
    d3.selectAll('.related').classed('related', false)
}

function set_visited_in_overview(mid){
    d3.select('#over-'+ mid)
        .classed('visited_dot', true)
    $('#over-'+ mid).parent().append($('#over-'+ mid))
}

function show_neigh(d){
    //clean the old one
    d3.selectAll('.selected').classed('selected',false)
    $('#preview').hide()

    $('#preview img').attr('src', d.poster)
    $('#preview').attr('href', "detail?mid="+d.mid)

    $('#preview').show()
    d3.json('neigh?mid='+ d.mid, function(list){
        var selected = 0
        if ($('#over-'+ d.mid).length == 0){
            var index = 0
            while ($('#over-'+ list[index]).length == 0){index++}
            selected = list[index]
        }
        else{
            selected = d.mid
        }
        $('#over-'+ selected).parent().append($('#over-'+ selected))
        d3.select('#over-'+ selected).classed('selected',true)

        d3.selectAll('.over')
            .classed('related', function(d){
                if ($.inArray(d.mid, list) < 0 ){
                    return false
                }
                else{
                    return true
                }
            })
    })
}

function dropoverview(ev){
    show_neigh(dragdata)
}