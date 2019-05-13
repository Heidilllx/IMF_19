/**
 * Created by Yueqi on 2/20/2016.
 */
//data already set,draw the initial view
// /*var scales = {'x': null, 'y': null};
// var width = 800;
// var height = 800;
// var items = null;
// function drawMat(){
//     var svg = d3.select('#canvas').append('svg')
//         .attr('width',800).attr('height',800)
//         .attr('viewBox','0 0 800 800');
//     reset_scale(function(){
//         //load data (weight and order)
//         d3.json('data', function(data){
//             //order by weight so the smallest on the top
//             data.sort(function(a,b){
//                 return b.weight - a.weight;
//             });
//             items = data;
//             var mid = svg.selectAll('mid').data(items).enter()
//                 .append('g')
//                 .attr('class','mid')
//                 .on('click', function(d){
//                     //change the focus item
//                 });
//             updateItemPos(function(){
//                 visit(33004);
//             });
//         });
//     });
// }
//
// function reset_scale(callback){
//     d3.json('scale', function(data){
//         for (var i in data){
//             var tmp = data[i];
//             var end = tmp.pos=='x'?width:height;
//             switch (tmp.type){
//                 case 0: //cate
//                     scales[tmp.pos] = {
//                         scale: d3.scale.ordinal().rangeRoundPoints([0,end])
//                     };
//                     break;
//                 case 1: // log
//                     scales[tmp.pos] = {
//                         scale: d3.scale.log().range([0,end])
//                     };
//                     break;
//                 case 2: //linear
//                     scales[tmp.pos] = {
//                         scale: d3.scale.linear().range([0,end])
//                     };
//                     break
//                 case 3: //time
//                     scales[tmp.pos] = {
//                         scale: d3.time.scale().range([0,end])
//                     };
//                     data[i].domain = [new Date(data[i].domain[0]), new Date(data[i].domain[1])]
//                     break
//             }
//             scales[tmp.pos].dim = tmp.dim;
//             scales[tmp.pos].scale.domain(data[i].domain)
//             callback()
//         }
//     })
// }
//
// // update binding data and redraw everything
// // remove everything and create new items
// //TODO: how to transition
// var r_scale = d3.scale.log().range([2, 10]).domain([10, 2000]);
// function updateItemPos(callback){
//     var cont = 0;
//     var target = $('.mid').length;
//     d3.json('pos', function(pos){
//         d3.selectAll('.mid')
//             .each(function(data){
//                 d3.select(this).html("");
//                 if ('x' in pos){
//                     //convert datetime date, only one value
//                     if (scales.x.dim == 'releasedate'){
//                         pos.x[data.mid][0] = new Date(pos.x[data.mid][0])
//                     }
//                     data.x = pos.x[data.mid];
//                 }
//
//                 if ('y' in pos){
//                     if (scales.y.dim == 'releasedate'){
//                         pos.y[data.mid][0] = new Date(pos.y[data.mid][0])
//                     }
//                     data.y = pos.y[data.mid];
//                 }
//
//                 //create new data
//                 var tmp = [];
//                 for (var i=0; i<data.x.length; i++){
//                     for (var j=0; j<data.y.length; j++){
//                         tmp.push({'x':data.x[i], 'y':data.y[j]})
//                     }
//                 }
//                 data.opacity = 1.0/(data.x.length*data.y.length);
//
//                 d3.select(this)
//                     .attr('opacity', data.opacity)
//                     .selectAll('tmp').data(tmp).enter()
//                     .append('circle')
//                     .attr('r', Math.max(0,r_scale(data.weight)))
//                     .attr('cx', function(d){
//                         return scales.x.scale(d.x)
//                     })
//                     .attr('cy', function(d){
//                         return scales.y.scale(d.y)
//                     })
//                     .attr('fill',function(){
//                         if (data.visited)
//                             return 'gray'
//                         else return 'pink'
//                     })
//                 cont += 1;
//                 if (cont == target){
//                     callback();
//                 }
//             })
//
//     });
// }