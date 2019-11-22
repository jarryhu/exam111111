layui.use(['form','layer','layedit','laydate','upload','transfer','jquery'],function(){
    var form = layui.form
    layer = parent.layer === undefined ? layui.layer : top.layer,
        laypage = layui.laypage,
        upload = layui.upload,
        layedit = layui.layedit,
        laydate = layui.laydate,
        transfer = layui.transfer,
        $ = layui.jquery;

    //用于同步编辑器内容到textarea
    layedit.sync(editIndex);


    //模拟班级数据
    var data1 = [
        {"value": "1", "title": "软件1805"}
        ,{"value": "2", "title": "软件1804"}
        ,{"value": "3", "title": "动漫1804"}
        ,{"value": "4", "title": "新闻1801"}
    ]

    //加载穿梭框
    //基础效果
    transfer.render({
        elem: '#test1',
        title:["班级列表","选择考试班级"]
        ,data: data1
        ,id: 'classid' //定义索引
    })


    //拖拽上传
    upload.render({
        elem: '#test10'
        ,url: '/upload/'
        ,field:"url"
        ,exts: 'xls|xlsx' //只允许上传Excel文件
        ,done: function(res){
            console.log(res)
        }
    });


    //上传缩略图
    /*upload.render({
        elem: '.thumbBox',
        url: '../../json/userface.json',
        method : "get",  //此处是为了演示之用，实际使用中请将此删除，默认用post方式提交
        done: function(res, index, upload){
            var num = parseInt(4*Math.random());  //生成0-4的随机数，随机显示一个头像信息
            $('.thumbImg').attr('src',res.data[num].src);
            $('.thumbBox').css("background","#fff");
        }
    });*/

    //格式化时间
    function filterTime(val){
        if(val < 10){
            return "0" + val;
        }else{
            return val;
        }
    }
    //定时发布
    var time = new Date();
    var submitTime = time.getFullYear()+'-'+filterTime(time.getMonth()+1)+'-'+filterTime(time.getDate())+' '+filterTime(time.getHours())+':'+filterTime(time.getMinutes())+':'+filterTime(time.getSeconds());
    laydate.render({
        elem: '#release',
        type: 'datetime',
        trigger : "click",
        done : function(value, date, endDate){
            submitTime = value;
        }
    });
    form.on("radio(release)",function(data){
        if(data.elem.title == "定时发布"){
            $(".releaseDate").removeClass("layui-hide");
            $(".releaseDate #release").attr("lay-verify","required");
        }else{
            $(".releaseDate").addClass("layui-hide");
            $(".releaseDate #release").removeAttr("lay-verify");
            submitTime = time.getFullYear()+'-'+(time.getMonth()+1)+'-'+time.getDate()+' '+time.getHours()+':'+time.getMinutes()+':'+time.getSeconds();
        }
    });

    form.verify({
        newsName : function(val){
            if(val == ''){
                return "试题名称不能为空";
            }
        },
        content : function(val){
            if(val == ''){
                return "试题说明不能为空";
            }
        }
    })
    form.on("submit(addNews)",function(datalayui){
        //截取文章内容中的一部分文字放入文章摘要
        //var abstract = layedit.getText(editIndex).substring(0,50);
        //弹出loading
        var index = top.layer.msg('数据提交中，请稍候',{icon: 16,time:false,shade:0.8});


        //获得穿梭框右侧数据
        var classid = transfer.getData('classid');
        var ids=[];

        for(var i=0;i<classid.length;i++){
            ids.push({"id":classid[i].value});
        }



        //添加考试试题
        //JSON.stringify把json对象转换成字符串
        $.ajax({
            url:"/addMenu",
            type: 'post',//提交请求的类型
            data:JSON.stringify({"menu":datalayui.field,"classesList":ids}),//数据
            dataType: 'json',//提交后台参数的类型
            contentType:"application/json",//定义数据格式是json
            success:function (data){
                if(data=='ok'){
                    layer.msg('添加成功');
                }else if(data=='error'){
                    layer.msg('添加失败');
                }
            }
        })


        // 实际使用时的提交信息
        // $.post("上传路径",{
        //     newsName : $(".newsName").val(),  //文章标题
        //     abstract : $(".abstract").val(),  //文章摘要
        //     content : layedit.getContent(editIndex).split('<audio controls="controls" style="display: none;"></audio>')[0],  //文章内容
        //     newsImg : $(".thumbImg").attr("src"),  //缩略图
        //     classify : '1',    //文章分类
        //     newsStatus : $('.newsStatus select').val(),    //发布状态
        //     newsTime : submitTime,    //发布时间
        //     newsTop : data.filed.newsTop == "on" ? "checked" : "",    //是否置顶
        // },function(res){
        //
        // })
        setTimeout(function(){
            top.layer.close(index);
            top.layer.msg("试题添加成功！");
            layer.closeAll("iframe");
            //刷新父页面
            //parent.location.reload();
        },500);
        return false;
    })

    //预览
    form.on("submit(look)",function(){
        layer.alert("此功能需要前台展示，实际开发中传入对应的必要参数进行文章内容页面访问");
        return false;
    })

    //创建一个编辑器
    var editIndex = layedit.build('news_content',{
        height : 535,
        uploadImage : {
            url : "../../json/newsImg.json"
        }
    });

})