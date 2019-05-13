/**
 * Created by Yueqi on 3/26/2016.
 */

function load_topic_profile(){
    //$('#summmary_link').attr('href', '#topic_snap?tid='+setting.tid)
    if ($( "#summmary_link" ).hasClass("ui-state-active")){
        load_topic_profile_page()
    }
    else{
        $('#summary-wrap').html('')
    }
}

function load_topic_profile_page(){
    $('#summary-wrap').load('topic_snap?tid='+setting.tid, function(){
        //start split
        Split(['#t_profile', '#t_item'], {
            sizes:[73,27],
            direction: 'vertical'
        });

        var bgscale = d3.scale.sqrt().range([d_color(setting.tid), 'white']).domain([1,0])
        $('.w_cell').each(function(){
            var data = $(this).attr('data')
            $(this).css({
                background: bgscale(data),
                color: data > 0.3? 'white':'black'
            }).text((data * 100).toFixed(1) + '%')
        })
        // legend profiles not in the detail profile
        $(this).find('.prolink').each(function(){
            var pid = $(this).attr('data-pid')
            if ($('#mdetail').find('.prolink[data-pid='+pid+']').length == 0){
                $(this).append('*')
            }
        })
        init_links('#t_profile')
    });
}
