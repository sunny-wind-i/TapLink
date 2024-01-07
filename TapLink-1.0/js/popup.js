$(function () {

    function read_link(floor_num) {
        //输入：楼层数
        //输出：[链接,文本] 若没有数据，返回两个0
        //寻找对应楼层
        var find_flag = 1;
        var link_str = "";
        var text_str = "";

        //moment-post
        //-moment-post__body    其他
        //--js-moment-post__edit    类名          js-moment-post__edit-list-224093234 postid

        //---moment-post__user-info 名字

        //---moment-post__content   文本
        //----moment-post__rich-content tap-rich-content__wrapper black-60
        //-----若为图片：
        //-----content-image tap-rich-content__image tap-rich-content__row tap-rich-content__image--2 tap-rich-content__image--post
        //------tap-rich-content__tap-image tap-image-wrapper
        //-------tap-image lazy-image
        //-----若为文字：
        //-----tap-text tap-text__normal-line tap-rich-content__row tap-rich-content__row-paragraph tap-rich-content__body
        //------span

        //---moment-post__footer    底部
        //----第二个class
        //-----moment-post__floor caption-m12-w14 gray-04 楼层

        var floorWrap = document.querySelector(".moment-comment-list__wrap-www");
        var postItems = floorWrap.querySelectorAll(".moment-post-item");

        postItems.forEach(function (thisFloor, i) {
            var post_edit = thisFloor.querySelector(".moment-post .moment-post__body .js-moment-post__edit");
            var floor_text = post_edit.querySelector(".moment-post__footer div:nth-child(2) .moment-post__floor").innerHTML;
            //console.log(floor_text);
            //判断楼层是否相符
            if (floor_text.trim() == floor_num + "楼") {
                //1. 获取链接
                //读取第二个类名
                var post_id_str = post_edit.classList.item(1);
                //console.log(post_id_str);
                var regex = /\d+$/;   // 匹配末尾的数字
                var post_id = post_id_str.match(regex)
                link_str = "taptap.cn/post/" + post_id;
                //2. 获取文本
                content_room = post_edit.querySelector(".moment-post__content .moment-post__rich-content");
                textss = content_room.querySelector(".tap-text span");//取文字
                imagess = content_room.querySelector(".content-image")//取图片
                if (textss != null) {
                    // 如果含有文字，则所有的span文字合在一起
                    var str = "";
                    textsss = content_room.querySelectorAll(".tap-text span");
                    textsss.forEach(function (e, i) {
                        str = str + e.innerHTML;
                    });
                    text_str = str;
                }
                else if (imagess != null) {
                    // 如果不含文字，含有图片
                    text_str = "（图片）";
                }
                else {
                    // 其他情况，置为空
                    text_str = "";
                }
                //标志位置为0
                find_flag = 0;
                return;
            }
        });
        // 如果没找到，标志位还没改变，表示楼层不存在，则返回两个0
        if (find_flag == 1) { return [0, 0] }
        else { return [link_str, text_str] }
    }

    function timedAlert(message, duration) {
        //弹窗定时消失
        const alertBox = $('<div>').text(message)
            .css({
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'white',
                padding: '20px',
                border: '1px solid black',
                boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
                zIndex: '9999'
            })
            .appendTo('body')
            .fadeIn();

        setTimeout(function () {
            alertBox.fadeOut(function () {
                alertBox.remove();
            });
        }, duration);
    }

    $("#searches").click(function () {
        //先清空两个文本框
        $("#links").val("");
        $("#contents").val("");
        //读取文本框的楼层数
        //var floor_num = parseInt($("#floors_num").val(),10);
        var floor_num_input = $("#floors_num").val();
        var floor_num = parseInt(floor_num_input, 10);
        if (!isNaN(floor_num)) {
            //如果是个数字，就修改
            $("#floors_num").val(floor_num);
        }
        if (!isNaN(floor_num) && floor_num >= 2 && Number.isInteger(floor_num)) {
            // 使用chrome.tabs.executeScript方法在当前选项卡中执行JavaScript代码
            // 读取楼层数据
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: tabs[0].id },
                        function: read_link,
                        args: [floor_num],
                    },
                    (my_feedback) => {
                        //返回值为[链接,文本]    若没有数据，返回两个0
                        var results = JSON.stringify(my_feedback);
                        //$("#links").val(results);
                        //寻找result在字符串中的位置
                        var result_index = results.indexOf("result");
                        results = results.slice(result_index + 10, -4)
                        //寻找分隔符在字符串中的位置
                        var sep_index = results.indexOf('","');
                        var links = results.slice(0, sep_index)
                        var tests = results.slice(sep_index + 3, results.length)
                        if (links == "") {
                            $("#links").val('"' + floor_num + '"不是一个有效的楼层');
                            $("#contents").val('"' + floor_num + '"不是一个有效的楼层');
                        }
                        else {
                            $("#links").val(links);
                            $("#contents").val(tests);
                        }
                    }
                )
            });
        } else {
            //输入不为数字，为无效楼层
            $("#links").val('"' + floor_num_input + '"不是一个有效的楼层');
            $("#contents").val('"' + floor_num + '"不是一个有效的楼层');
        }
    });

    $("#copies").click(function () {
        var str = $("#links").val();
        const clipboard = navigator.clipboard;
        navigator.clipboard.writeText(str)
        //alert("已复制");
        timedAlert('已复制', 1000); // 1秒后自动关闭
    })
})