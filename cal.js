// javascript:(function(){let e=document.createElement("script");e.type="text/javascript",e.src="https://cd659b60.ngrok.io/cal.js",document.getElementsByTagName("head")[0].appendChild(e)}())

(function() {
    function addScript(url, done) {
        let script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.onload = function(){
            done();
        };
        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    function addStyle(url, done) {
        let link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = url
        link.async = true;
        link.onload = function(){
            done();
        };
        document.getElementsByTagName('head')[0].appendChild(link);
    }

    function hashCode(str) { // java String#hashCode
        var hash = 0;
        for (var i = 0; i < str.length; i++) {
           hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    } 

    function intToRGB(i){
        var c = (i & 0x00FFFFFF)
            .toString(16)
            .toUpperCase();

        return "00000".substring(0, 6 - c.length) + c;
    }

    addScript('https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js', () => {
        addScript('https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.24.0/moment.min.js', () => {
            addScript("https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.10.0/fullcalendar.min.js", () => {
                addStyle("https://cdnjs.cloudflare.com/ajax/libs/fullcalendar/3.10.0/fullcalendar.min.css", () => {
                    let events = [];
                    for (const tr of $('table.cal tr:not(.calRow)')) {
                        const row = $(tr);
                        const children = row.children();
                        if (children.length == 9) {
                            let t = children[5].innerText.split(' ');
                            let start = moment(`${children[2].innerText} ${t[0]}`, 'DD-MM-YYYY HH:mm');
                            let end = moment(`${children[2].innerText} ${t[1]}`, 'DD-MM-YYYY HH:mm');
                            let title = children[3].innerText;
                            if (title.length == 0) {
                                title = "unknown";
                            }



                            events.push({
                                title: title,
                                start: start,
                                end: end,
                                color: '#'+intToRGB(hashCode(children[4].innerText)),
                            });
                        }
                    }

                    console.log(events[0]);

                    if (events.length <= 0) {
                        alert("NO EVENTS")
                        return
                    }

                    let wrapper = jQuery('<div/>', {
                        css: {
                            'position': 'absolute',
                            'left': '0',
                            'top': '0',
                            'width': $(window).width(),
                            'height': $(window).height(),
                            'background': '#fff',
                            'z-index': '999999999',
                        },
                    })
                    wrapper.appendTo('body')


                    let closeButton = jQuery('<button>Close</button>')
                    closeButton.appendTo(wrapper)
                    closeButton.click(()=>{
                        wrapper.remove()
                    });


                    let calendar = jQuery('<div/>')
                    calendar.appendTo(wrapper)
                    calendar.fullCalendar({
                        header: {
                            left: 'prev,next today',
                            center: 'title',
                            right: 'month,agendaWeek,agendaDay,listWeek'
                        },
                        events: events,
                        views: {
                            month: {
                                displayEventEnd: true,
                            },
                        },
                        firstDay: 1,
                        timeFormat: 'HH:mm',
                        defaultDate: events[0].start,
                    });

                });
            });
        });
    });
})()

