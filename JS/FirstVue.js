new Vue({
    el:'#UIDiv',
    data:{
        message:'Hello,MyVue',
        a:false
    },
    methods:{},
    computed:{
        change:function(){
            return {
                changeColor:this.a,
                changeWidth:this.a
            }
        }
    }
});