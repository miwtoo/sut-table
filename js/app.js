var app = new Vue({
    el: "#app",
    data: {
        coursecode: 213101,
        year : 2561,
        term : 2,
        group: [],
        info: {
            id: null,
            name: null ,
            credit: null,
        },
        btnClass : "",
        firstTime : 8,
        lastTime: 17,
        sumCredit:0,
        timetable : null,
        toastTime : 2000
    },
    created() {
        this.timetable = new Timetable()
        this.timetable.setScope(8, 17); // optional, only whole hours between 0 and 23
        this.timetable.addLocations(['Monday', 'Tuesday', 'Wednesday', 'Thurday', 'Friday']);
        //timetable.addLocations(['Mo', 'Tu', 'We', 'Th', 'Fr']);
        var renderer = new Timetable.Renderer(this.timetable);
        renderer.draw('.timetable');
        console.log(this.timetable);

        $(document).ready(function(){
            $('.modal').modal();
            $('.tap-target').tapTarget('open');
            $('select').material_select();
        });
        
    },
    methods: {
        addClass : function(n){
            
            var that = this
            var check = false
            n--
            var day = {
                "Mo":"Monday","Tu":"Tuesday","We":"Wednesday","Th":"Thurday","Fr":"Friday"
            }
            
            for (let i = 0; i < this.group[n].times.length; i++) {
                var setTime = this.group[n].times[i].time.split("-")
                var startTime = setTime[0].split(":")
                var endTime = setTime[1].split(":")
                
                if(startTime[0] < this.firstTime)
                    this.firstTime = parseInt(startTime[0])
                if(endTime[0] > this.lastTime)
                    this.lastTime = parseInt(endTime[0])

                //console.log(checkTime(startTime,endTime, day[this.group[n].times[i].day]));
                
                if(checkTime(startTime,endTime, day[this.group[n].times[i].day]) && checkEventNameDuplicate(this.group[n].id.split("-")[0] +'- '+ this.group[n].number)){
                    this.timetable.setScope(this.firstTime, this.lastTime);
                    this.timetable.addEvent(this.group[n].id.split("-")[0] +'- '+ this.group[n].number, day[this.group[n].times[i].day], new Date(2018, 1, 1, startTime[0], startTime[1]), new Date(2018, 1, 1, endTime[0], endTime[1]));    

                    check = true
                    //this.sumCredit += parseInt(this.info.credit.split(" ")[0])
                    console.log(this.timetable);
                }
                //else
                    //Materialize.toast('ไม่สามารถเพิ่มได้',this.toastTime)
                
            }
            if(check) {
                this.sumCredit += parseInt(this.info.credit.split(" ")[0])
                Materialize.toast('เพิ่มสำเร็จ',this.toastTime)
            }
            
            var renderer = new Timetable.Renderer(this.timetable);
            renderer.draw('.timetable');

            function checkTime(startTime, endTime,loca) { //เช็คว่าเวลาไม่ทับกันถึงจะผ่าน => ถ้าไม่ทับ true, ถ้าทับ false
                x = parseFloat(startTime[0]+'.'+startTime[1])
                y = parseFloat(endTime[0]+'.'+endTime[1])
                for (let i = 0; i < that.timetable.events.length; i++) {
                    a = parseFloat(that.timetable.events[i].startDate.getHours()+'.'+that.timetable.events[i].startDate.getMinutes())
                    b = parseFloat(that.timetable.events[i].endDate.getHours()+'.'+that.timetable.events[i].endDate.getMinutes())
                    if(that.timetable.events[i].location == loca){ //ถ้าเป็นวันเดียวกันค่อยเข้ามาเช็ค
                        if((x >= a && x <= b) || (y >= a && x <= y)){
                            Materialize.toast('ไม่สามารถเพิ่มได้ เนื่องจาก' + 'วันและเวลาซ้ำซ้อน',that.toastTime)
                            return false
                        }
                    }
                }
                return true
            }
            function checkEventNameDuplicate(name) {
                for (let i = 0; i < that.timetable.events.length; i++) {
                    if(name != that.timetable.events[i].name){
                        Materialize.toast('ไม่สามารถเพิ่มได้ เนื่องจาก'+ 'รหัสวิชาซ้ำ',that.toastTime)
                        return false
                    }
                }
                return true
            }
        },
        updateTerm: function(){
            this.term = $('#myselect').val()
        },
        getCourse: function(){
            this.updateTerm()
            this.btnClass = "progress"
            var url = 'https://allorigins.me/get?&url=' + encodeURIComponent('http://reg.sut.ac.th/registrar/class_info_1.asp?coursestatus=reg&facultyid=all&maxrow=1000&Acadyear='+this.year+'&Semester='+this.term+'&CAMPUSID=1&LEVELID=1&coursecode='+this.coursecode+'&coursename=&cmd=2') + '&callback=?'
            //var url = 'http://allorigins.me/get?url=' + encodeURIComponent('http://reg.sut.ac.th/registrar/class_info_2.asp?backto=home&option=0&courseid='+this.courseid+'&coursecode='+this.coursecode+'&acadyear='+this.year+'&semester='+this.term+'&avs250426955=5') + '&callback=?'
            //console.log(url);
            $.ajax({ 
                url: url, 
                dataType: 'json', 
                success: function(data){ 
                    this.group = []
                    var allgroup = data.contents.match(/(<TR VALIGN=TOP>)(.*?)(<.TR>)/gi)
                    //console.log(allgroup);
                    for (let i = 0; i < allgroup.length; i++) {
                        this.group.push({
                            id: allgroup[i].match(/[0-9][0-9][0-9][0-9][0-9][0-9] - [0-9]/gi)[0],
                            credit: allgroup[i].match(/[0-9] .[0-9]-[0-9].[0-9]./gi)[0],
                            name: allgroup[i].match(/(?<=<FONT SIZE=2>)[^&nbsp;](.*?)(?=<br>|<FONT SIZE=1)/g)[0],
                            number: allgroup[i].match(/(?<=<.u><.TD><TD ALIGN=RIGHT BGCOLOR=#......><FONT SIZE=1>)[0-9]{1,2}/g)[0],
                            times: []
                        })
                        var len = allgroup[i].match(/[0-9][0-9]:[0-9][0-9]-[0-9][0-9]:[0-9][0-9]/g).length

                        for (let j = 0; j < len; j++) {
                            this.group[i].times.push({
                                time: allgroup[i].match(/[0-9][0-9]:[0-9][0-9]-[0-9][0-9]:[0-9][0-9]/g)[j],
                                day: allgroup[i].match(/(?<=<font color=#5080E0>)[A-Z][a-z](?=<.font>)/g)[j],
                                room: allgroup[i].match(/(?<=[0-9][0-9]:[0-9][0-9]-[0-9][0-9]:[0-9][0-9] <U>)(.*?)(?=<.u>)/g)[j]
                            })
                            
                        }
                            
                        
                    }
                    
                    this.info.id = this.group[0].id
                    this.info.credit = this.group[0].credit
                    this.info.name = this.group[0].name
                    //console.log(' 2 => '+this.courseid);
                    this.btnClass = "button is-primary"
                }.bind(this)
            });
        },
        modalsBtn: function(){

        }
    },
    computed: {
        
    }
})