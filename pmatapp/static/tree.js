/**
 * Created by Yueqi on 2/22/2016.
 */

/*function drawTree(){
    d3.json('get_list', function(data){
        for (var i in data){
            data[i].visit = false;
        }
        var tree = {
            name: 'tree',
            children: data
        };

        var noZeroes = data.filter(function(d) { return d.order !== 0; });
        var n_color = d3.scale.linear()
            .range(['orange','yellow'])
            .domain([d3.min(noZeroes, function(d){return d.order}), d3.max(noZeroes, function(d){return d.order})]);

        var w_color = d3.scale.linear()
            .range(['white', 'lightblue'])
            .domain([d3.min(data, function(d){return d.weight}), d3.max(data, function(d){return d.weight})]);

        var width = 300,
            height = 100,
            div = d3.select("#left")
                .style('position','relative')
                .style('height', '100%');

        var treemap = d3.layout.treemap()
            .size([width, height])
            .sticky(true)
            .value(function(d) { return d.weight; });

        var node = div.datum(tree)
            .selectAll(".node")
            .data(treemap.nodes)
            .enter().append("div")
            .attr("class", "node")
            .call(position)
            .style("background-color", function(d) {
                if ('name' in d)
                    return 'white';
                if (d.order != 0)
                    return n_color(d.order);
                else
                    return w_color(d.weight)
            })
            .append('div')
            .style("font-size", function(d) {
            //    TODO: show title according to size
            })
            .text(function(d) { return d.children ? null : d.title; });

        node.on('mouseover', function(d){
                if (d.visit == false)
                    visit(d)
                else{
                    load_detail(d.topic)
                    $('#detail').html(m.html)
                }
            })
            .on('click', function(d){
                change_focus(d.mid)
            });

        function position() {
          this.style("left", function(d) { return d.x/3+'%'; })
              .style("top", function(d) { return d.y + "%"; })
              .style("width", function(d) { return Math.max(0, d.dx/3) + "%"; })
              .style("height", function(d) { return Math.max(0, d.dy) + "%"; });
        }
    })
}

var yscale = d3.scale.linear().range([0,100])
function drawTopic(){
    d3.json('get_topic', function(data){
        yscale.domain([d3.min(data,function(d){return d.size}),d3.max(data,function(d){return d.size})]);
        var color = d3.scale.linear().range(['lightgray','blue'])
            .domain([d3.min(data,function(d){return d.quality}),d3.max(data,function(d){return d.quality})]);
        var div = d3.select('#down')
            .selectAll('topic').data(data).enter()
            .append('div')
            .attr('class','topic')
            .attr('id', function(d){
                d.visit = 0;
                return 'topic-'+ d.tid
            })
            .style('width', '0.5%')
            .style('height','100%')

        div.append('div')
            .attr('class','total')
            .style('height', function(d){
                return yscale(d.size)+'%'
            })
            .style('top', function(d){
                return 100-yscale(d.size)+'%'
            })
            .style('background-color', function(d){
                return color(d.quality)
            })

        div.append('div')
            .attr('class','visit')
            .style('background-color', 'red')
    })
}

function visit(m){
    m.visit = true;
    $.get('#detail?mid='+ m.mid, function(html){
        m.html = html;
        $('#detail').html(m.html)
    })

    $.get('related_topics?mid='+ m.mid, function(topic) {
        for (t in topic) {
            // update topic visit state and update view
            d3.select('#topic-' + topic[t].tid).select('.visit').style('height', function (d) {
                d.visit += 1;
                return yscale(d.visit) + '%'
            })
        }
        m.topic = topic;
        load_detail(topic)
    },'json')
}

function load_detail(topic){
    var weight_color = d3.scale.linear()
        .range([0.5, 1])
        .domain([d3.min(topic, function(d){return d.w}),d3.max(topic, function(d){return d.w})])
    $('.topic').removeClass('selected');
    for (var t in topic) {
        d3.select('#topic-' + topic[t].tid)
            .style('opacity', weight_color(topic[t].w))
            .classed('selected', true)
    }
}

function change_focus(){
    // update neighbor
    $.get('set?mid='+mid, function(){
        load_neighbor
    });
}

function load_neighbor(){
    d3.json('get_neighbor', function(data){
        d3.selectAll('.node')
    })
}