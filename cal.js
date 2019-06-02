// javascript:((function(){let e=document.createElement('script');e.type='text/javascript',e.src='https://eun.github.io/bdslv1-cal/cal.js',document.getElementsByTagName('head')[0].appendChild(e)})())
(function() {

    const standZeiten = [
        // Sonntag
        {
            Start: 0,
            End: 0,
        },
        {
            Start: 10,
            End: 17,
        },
        {
            Start: 12,
            End: 19,
        },
        {
            Start: 12,
            End: 19,
        },
        {
            Start: 12,
            End: 18,
        },
        {
            Start: 12,
            End: 18,
        },
        {
            Start: 10,
            End: 18,
        },
    ];

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


    function getEventsPerDay(events, startEvent) {
        let e = [];
        for (var i = 0; i < events.length; i++) {
            if (events[i].start.year() === startEvent.start.year() && events[i].start.month() === startEvent.start.month() && events[i].start.date() === startEvent.start.date()) {
                e.push(events[i])
            }
        }
        return e;
    }

    function makeFreeEvents(startEvent) {
        let e = [];
        const t = standZeiten[startEvent.start.day()];
        for (let i = t.Start; i < t.End; i++) {
            const start = moment(`${startEvent.start.format('DD-MM-YYYY')} ${i}:00`, 'DD-MM-YYYY H:mm');
            const end = moment(`${startEvent.start.format('DD-MM-YYYY')} ${i+1}:00`, 'DD-MM-YYYY H:mm');
            e.push({
                title: "BDS Links",
                color: "#009688",
                start: start,
                end: end,
                stand: ["BDS links"],
            });
            e.push({
                title: "BDS Rechts",
                color: "#8BC34A",
                start: start,
                end: end,
                stand: ["BDS rechts"],
            });
        }
        return e;
    }

    function isSameStand(a,b) {
        for (var i = a.stand.length - 1; i >= 0; i--) {
            if (b.stand.indexOf(a.stand[i]) > -1) {
                return true
            }
        }
        return false
    }


    function isEventTaken(event, takenEvents) {
        for (var i = 0; i < takenEvents.length; i++) {
            if (!(event.start >= takenEvents[i].end || event.end <= takenEvents[i].start)) {
                // test if stand is in here
                if (isSameStand(takenEvents[i], event)) {
                    return true;
                }
            }
        }
        return false;
    }
    function removeTakenEvents(events, takenEvents) {
        let e = [];
        for (let i = 0; i < events.length; i++) {
            if (!isEventTaken(events[i], takenEvents)) {
                e.push(events[i]);
            }
        }
        return e;
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

                            if (children[4].innerText == "BDS links") {
                                stand = [children[4].innerText]
                            } else if (children[4].innerText == "BDS rechts") {
                                stand = [children[4].innerText]
                            } else  if (children[4].innerText == "BDS rechts und BDS links") {
                                stand = ["BDS rechts", "BDS links"]
                            } else {
                                alert(`unable to parse ${children[4].innerText}`)
                            }


                            events.push({
                                title: title,
                                start: start,
                                end: end,
                                stand: stand,
                            });
                        }
                    }


                    if (events.length <= 0) {
                        alert("NO EVENTS")
                        return
                    }

                    // create an event table that only shows the free events
                    events.sort((a,b) => {
                        return a.start > b.start
                    })

                    
                    let freeEvents = [];

                    for (let i = 0; i < events.length;) {
                        const e = getEventsPerDay(events, events[i]);

                        const f = makeFreeEvents(events[i]);
                        freeEvents = freeEvents.concat(removeTakenEvents(f, e));
                        i += e.length;
                    }
                    

                    events = freeEvents;


                    

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
                        eventClick: (info) => {
                            wrapper.remove();
                            document.querySelector("input[name=cdate]").value = info.start.format('DD-MM-YYYY');
                            document.querySelector("select[name=cbahn]").value = info.stand[0];
                            document.querySelector("select[name=uhrzeitv]").value = info.start.hour();
                            document.querySelector("select[name=uhrzeitb]").value = info.end.hour();
                        },
                    });

                });
            });
        });
    });
})()

